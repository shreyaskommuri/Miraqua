import os, sys, json, requests, requests_cache
from retry_requests import retry
import pandas as pd, numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from uuid import uuid4
from dotenv import load_dotenv
from supabase import create_client, Client
from dateutil import tz
from timezonefinder import TimezoneFinder
import resource
from utils.forecast_utils import get_forecast, calculate_schedule, find_optimal_time, dynamic_kc

# Raise file/socket limits for Render
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
resource.setrlimit(resource.RLIMIT_NOFILE, (hard, hard))

# Env vars
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
RENDER = os.getenv("RENDER", "false").lower() == "true"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "farmerAI")))
from farmer_ai import generate_summary, generate_gem_summary, process_chat_command

app = Flask(__name__)
CORS(app)

CROP_KC = {
    "corn": 1.15, "wheat": 1.0, "alfalfa": 1.2, "lettuce": 0.85,
    "tomato": 1.05, "almond": 1.05, "default": 0.95
}

def get_total_crop_age(planting_date: str, age_at_entry: float) -> float:
    try:
        planted = datetime.fromisoformat(planting_date)
        months_since = (datetime.utcnow() - planted).days / 30.44
        return round(age_at_entry + months_since, 1)
    except Exception as e:
        print(f"⚠️ Error calculating total crop age: {e}")
        return age_at_entry or 0.0

def get_crop_stage(crop, age_months):
    if age_months <= 1:
        return "Initial Stage"
    elif age_months <= 3:
        return "Development Stage"
    elif age_months <= 6:
        return "Mid-season Stage"
    else:
        return "Late-season Stage"


def get_lat_lon(zip_code):
    url = f"http://api.zippopotam.us/us/{zip_code}"
    res = requests.get(url)
    data = res.json()
    return float(data['places'][0]['latitude']), float(data['places'][0]['longitude'])

@app.route("/get_plot_by_id", methods=["GET"])
def get_plot_by_id():
    plot_id = request.args.get("plot_id")
    res = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
    return jsonify(res.data), 200

@app.route("/get_plan", methods=["POST"])
def get_plan():
    data = request.get_json()
    plot_id      = data.get("plot_id")
    use_original = data.get("use_original", False)
    force_refresh= data.get("force_refresh", False)

    if not plot_id:
        return jsonify({"error": "Missing plot_id"}), 400

    # 🌱 Fetch plot
    plot_res = supabase.table("plots").select("*") \
                        .eq("id", plot_id) \
                        .maybe_single().execute()
    plot = plot_res.data
    if not plot:
        return jsonify({"error": "Plot not found"}), 404

    lat = plot.get("lat"); lon = plot.get("lon")
    age = get_total_crop_age(plot.get("planting_date"), plot.get("age_at_entry", 0.0))

    # 🌦️ Get forecast & logs
    forecast = get_forecast(lat, lon)
    daily    = forecast.get("daily", [])
    hourly   = forecast.get("hourly", [])
    current  = forecast.get("current", {})

    logs = (supabase.table("watering_log")
            .select("*")
            .eq("plot_id", plot_id)
            .order("watered_at", desc=True)
            .limit(7)
            .execute().data) or []

    # 📦 Try loading existing schedule
    try:
        sched_res = (supabase.table("plot_schedules")
                     .select("*")
                     .eq("plot_id", plot_id)
                     .single()
                     .execute())
        schedule_data = sched_res.data
    except Exception:
        schedule_data = None

    # 🌡️ Compute display metrics
    temp_vals = [h.get("main",{}).get("temp") for h in hourly[:24] if h.get("main",{}).get("temp") is not None]
    current_temp_f = round(np.mean(temp_vals),1) if temp_vals else 72.0

    moist_vals = [d.get("soil_moisture") for d in daily[:1] if d.get("soil_moisture") is not None]
    moisture = round(np.mean(moist_vals),2) if moist_vals else 28.0

    cloud_vals = [h.get("clouds",{}).get("all") for h in hourly[:24] if "clouds" in h]
    sunlight = round(100 - np.mean(cloud_vals),0) if cloud_vals else 70.0

    # ✅ Cached schedule path
    if schedule_data and not force_refresh:
        base = schedule_data.get("og_schedule") if use_original else schedule_data.get("schedule")
        return jsonify({
            "plot_name":   plot.get("name", f"Plot {plot_id[:5]}"),
            "schedule":    base or [],
            "summary":     schedule_data.get("summary",""),
            "gem_summary": schedule_data.get("gem_summary",""),
            "current_temp_f": current_temp_f,
            "moisture":       moisture,
            "sunlight":       sunlight,
            "total_crop_age": age,
            "kc_used":        "AI-optimized",
            "crop_stage":     get_crop_stage(plot["crop"], age)
        })

    # 🚀 Generate & save new schedule
    from farmer_ai import generate_ai_schedule, generate_summary, generate_gem_summary

    schedule    = generate_ai_schedule(plot, daily, hourly, logs)
    summary     = generate_summary(plot["crop"], lat, lon, schedule)
    gem_summary = generate_gem_summary(plot["crop"], lat, lon,schedule, plot.get("name",""), plot_id)

    payload = {
        "plot_id":    plot_id,
        "schedule":   schedule,
        "summary":    summary,
        "gem_summary":gem_summary
    }
    # only set og_schedule once
    if not schedule_data or not schedule_data.get("og_schedule"):
        payload["og_schedule"] = schedule

    supabase.table("plot_schedules") \
            .upsert(payload, on_conflict=["plot_id"]) \
            .execute()

    return jsonify({
        "plot_name":   plot.get("name", f"Plot {plot_id[:5]}"),
        "schedule":    schedule,
        "summary":     summary,
        "gem_summary": gem_summary,
        "current_temp_f": current_temp_f,
        "moisture":       moisture,
        "sunlight":       sunlight,
        "total_crop_age": age,
        "kc_used":        "AI-optimized",
        "crop_stage":     get_crop_stage(plot["crop"], age)
    })



@app.route("/add_plot", methods=["POST"])
def add_plot():
    data = request.get_json()

    # ✅ Validation: planting_date
    if "planting_date" in data:
        try:
            plant_date = datetime.strptime(data["planting_date"], "%Y-%m-%d")
            if plant_date > datetime.utcnow():
                return jsonify({"success": False, "error": "Planting date cannot be in the future"}), 400
        except ValueError:
            return jsonify({"success": False, "error": "Invalid planting_date format. Use YYYY-MM-DD."}), 400

    # ✅ Validation: age_at_entry
    if "age_at_entry" in data:
        try:
            float(data["age_at_entry"])
        except:
            return jsonify({"success": False, "error": "Age at entry must be a number"}), 400

    res = supabase.table("plots").insert(data).execute()
    return jsonify(res.data[0] if res.data else {"message": "Added"}), 200


@app.route("/get_plots", methods=["GET"])
def get_plots():
    user_id = request.args.get("user_id")
    res = supabase.table("plots").select("*").eq("user_id", user_id).execute()
    return jsonify(res.data), 200

@app.route("/revert_schedule", methods=["POST"])
def revert_schedule():
    data = request.get_json()
    plot_id = data.get("plot_id")
    logs = supabase.table("farmerAI_chatlog").select("original_schedule") \
        .eq("plot_id", plot_id).order("created_at", desc=True).limit(1).execute()
    if not logs.data or not logs.data[0].get("original_schedule"):
        return jsonify({"error": "No previous schedule found"}), 404
    supabase.table("plot_schedules").update({
        "schedule": logs.data[0]["original_schedule"]
    }).eq("plot_id", plot_id).execute()
    return jsonify({"success": True})

@app.route('/update_plot_settings', methods=['POST'])
def update_plot_settings():
    data = request.get_json()
    plot_id = data.get("plot_id")
    updates = data.get("updates", {})

    if not plot_id:
        return jsonify({"success": False, "error": "Missing plot_id"}), 400

    try:
        # Step 1: Update plot fields
        supabase.table("plots").update(updates).eq("id", plot_id).execute()

        # Step 2: Fetch updated plot
        result = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
        plot = result.data
        if not plot:
            return jsonify({"success": False, "error": "Plot not found"}), 404

        crop = plot["crop"]
        area = plot["area"]
        planting_date = plot.get("planting_date")
        age_at_entry = plot.get("age_at_entry", 0.0)
        age = get_total_crop_age(planting_date, age_at_entry)
        lat = plot["lat"]
        lon = plot["lon"]
        flex_type = plot.get("flex_type", "daily")
        plot_name = plot.get("name", f"Plot {plot_id[:5]}")

        # 📦 Get forecast and logs
        forecast = get_forecast(lat, lon)
        daily = forecast.get("daily", [])
        hourly = forecast.get("hourly", [])
        logs_res = supabase.table("watering_log").select("*").eq("plot_id", plot_id).order("watered_at", desc=True).limit(7).execute()
        logs = logs_res.data or []

        # 🤖 AI Schedule
        from farmer_ai import generate_ai_schedule
        schedule = generate_ai_schedule(plot, daily, hourly, logs)
        summary = generate_summary(crop, lat, lon, schedule)

        # 💾 Save schedule to plot_schedules
        existing = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).maybe_single().execute()
        existing_data = existing.data or {}

        payload = {
            "plot_id": plot_id,
            "schedule": schedule,
            "summary": summary
        }

        if not existing_data.get("og_schedule"):
            payload["og_schedule"] = schedule

        supabase.table("plot_schedules").upsert(payload, on_conflict=["plot_id"]).execute()

        return jsonify({ "success": True })

    except Exception as e:
        print(f"❌ Error in /update_plot_settings: {e}")
        return jsonify({ "success": False, "error": str(e) }), 500

    
@app.route("/generate_ai_schedule", methods=["POST"])
def generate_ai_schedule_route():
    data = request.get_json()
    plot_id = data.get("plot_id")
    if not plot_id:
        return jsonify({"error": "Missing plot_id"}), 400

    # 🧠 Get plot
    plot_res = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
    plot = plot_res.data
    if not plot:
        return jsonify({"error": "Plot not found"}), 404

    # 📦 Weather
    lat, lon = plot["lat"], plot["lon"]
    forecast = get_forecast(lat, lon)
    daily = forecast.get("daily", [])
    hourly = forecast.get("hourly", [])

    # 💧 Logs
    logs_res = supabase.table("watering_log").select("*").eq("plot_id", plot_id).order("watered_at", desc=True).limit(7).execute()
    logs = logs_res.data or []

    # 🤖 AI schedule
    from farmer_ai import generate_ai_schedule, generate_summary
    schedule = generate_ai_schedule(plot, daily, hourly, logs)

    if "error" in schedule:
        return jsonify(schedule), 500

    # 📄 Save to Supabase
    summary = generate_summary(plot["crop"], lat, lon, schedule)

    supabase.table("plot_schedules").upsert({
        "plot_id": plot_id,
        "schedule": schedule,
        
        "summary": summary
    }, on_conflict=["plot_id"]).execute()

    return jsonify({ "success": True, "schedule": schedule, "summary": summary })




@app.route("/water_now", methods=["POST"])
def water_now():
    data = request.get_json()
    plot_id = data.get("plot_id")
    duration_minutes = data.get("duration_minutes")

    if not plot_id or not duration_minutes:
        return jsonify({"success": False, "error": "Missing data"}), 400

    try:
        supabase.table("watering_log").insert({
            "id": str(uuid4()),
            "plot_id": plot_id,
            "duration_minutes": duration_minutes,
            "watered_at": datetime.utcnow().isoformat()
        }).execute()

        print(f"✅ Simulated watering plot {plot_id} for {duration_minutes} minutes.")
        return jsonify({"success": True})

    except Exception as e:
        print(f"❌ Failed to log watering: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print(f"📥 Chat request received from plot: {data.get('plotId')}")

    prompt = data.get("prompt")
    plot_id = data.get("plotId")
    chat_session_id = data.get("chat_session_id")
    user_id = data.get("userId")  # Get user_id from frontend

    # Ensure chat_session_id is a valid UUID
    if not chat_session_id:
        chat_session_id = str(uuid4())
    else:
        # Try to validate/convert to UUID
        try:
            from uuid import UUID
            # This will raise ValueError if not a valid UUID
            UUID(chat_session_id)
        except (ValueError, AttributeError):
            # If invalid, generate a new one
            print(f"⚠️ Invalid chat_session_id format, generating new UUID")
            chat_session_id = str(uuid4())

    if not prompt:
        return jsonify({"success": False, "error": "Missing prompt"}), 400

    # Handle general queries (no specific plot)
    if not plot_id or plot_id == "default" or plot_id == "general":
        try:
            # Fetch user's plots for context
            user_plots = []
            user_location = None
            if user_id:
                try:
                    plots_res = supabase.table("plots").select("*").eq("user_id", user_id).execute()
                    user_plots = plots_res.data or []
                    print(f"📊 Found {len(user_plots)} plots for user {user_id}")

                    # Get location from first plot that has coordinates
                    for p in user_plots:
                        if p.get('lat') and p.get('lon'):
                            user_location = (p['lat'], p['lon'])
                            break
                except Exception as e:
                    print(f"⚠️ Could not fetch user plots: {e}")

            # Get weather for user's location
            forecast = {}
            hourly_data = []
            if user_location:
                try:
                    forecast = get_forecast(user_location[0], user_location[1])
                    hourly_data = forecast.get("hourly", [])
                    print(f"🌦️ Fetched weather for location: {user_location}")
                except Exception as e:
                    print(f"⚠️ Could not fetch weather: {e}")

            # Get recent chat history for context
            recent_chats = []
            try:
                chats_res = supabase.table("farmerAI_chatlog") \
                    .select("prompt, reply, created_at") \
                    .eq("chat_session_id", chat_session_id) \
                    .order("created_at", desc=True) \
                    .limit(5) \
                    .execute()
                recent_chats = list(reversed(chats_res.data or []))  # Oldest first
            except Exception as e:
                print(f"⚠️ Could not fetch chat history: {e}")

            result = process_chat_command(
                prompt=prompt,
                crop="general",
                lat=user_location[0] if user_location else 37.7749,
                lon=user_location[1] if user_location else -122.4194,
                plot_name="General Garden",
                plot_id="general",
                weather={},
                plot={"user_plots": user_plots, "recent_chats": recent_chats, "user_location": user_location},
                daily=[],
                hourly=hourly_data,  # Pass weather data
                logs=[],
                age=0
            )
            reply = result["reply"]

            # 📝 Save general chat history
            try:
                supabase.table("farmerAI_chatlog").insert({
                    "id": str(uuid4()),
                    "plot_id": "general",
                    "user_id": user_id,  # Save user_id if available
                    "prompt": prompt,
                    "reply": reply,
                    "created_at": datetime.utcnow().isoformat(),
                    "original_schedule": [],
                    "modified_schedule": [],
                    "reverted": False,
                    "is_user_message": True,
                    "role": "user",
                    "message_index": 0,
                    "context_summary": "",
                    "chat_session_id": chat_session_id,
                    "edited": False
                }).execute()
                print("✅ General chat history saved successfully")
            except Exception as save_error:
                print(f"⚠️ Failed to save general chat history: {save_error}")
                import traceback
                traceback.print_exc()
                # Continue without saving - don't crash the chat

            return jsonify({"success": True, "reply": reply})
        except Exception as e:
            print(f"❌ Error in general chat: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

    # 🔍 Fetch plot for specific plot queries
    plot = None
    print(f"🔍 Fetching plot data for plot_id: {plot_id}")
    try:
        plot_res = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
        plot = plot_res.data
        print(f"✅ Plot data fetched: {plot}")
        if not plot:
            # Plot not found, but still provide helpful advice
            print(f"⚠️ Plot {plot_id} not found, providing general advice")
            result = process_chat_command(
                prompt=prompt,
                crop="general",
                lat=37.7749,
                lon=-122.4194,
                plot_name="General Garden",
                plot_id="general",
                weather={},
                plot={},
                daily=[],
                hourly=[],
                logs=[],
                age=0
            )
            reply = result["reply"]

            # 📝 Save chat history even when plot not found
            try:
                supabase.table("farmerAI_chatlog").insert({
                    "id": str(uuid4()),
                    "plot_id": plot_id,
                    "user_id": None,
                    "prompt": prompt,
                    "reply": reply,
                    "created_at": datetime.utcnow().isoformat(),
                    "original_schedule": [],
                    "modified_schedule": [],
                    "reverted": False,
                    "is_user_message": True,
                    "role": "user",
                    "message_index": 0,
                    "context_summary": "",
                    "chat_session_id": chat_session_id,
                    "edited": False
                }).execute()
                print("✅ Chat history saved (plot not found case)")
            except Exception as save_error:
                print(f"⚠️ Failed to save chat history: {save_error}")

            return jsonify({"success": True, "reply": reply})
    except Exception as e:
        print(f"❌ Error fetching plot: {e}")
        # Plot fetch failed, but still provide helpful advice
        print(f"⚠️ Plot fetch failed, providing general advice")
        result = process_chat_command(
            prompt=prompt,
            crop="general",
            lat=37.7749,
            lon=-122.4194,
            plot_name="General Garden",
            plot_id="general",
            weather={},
            plot={},
            daily=[],
            hourly=[],
            logs=[],
            age=0
        )
        reply = result["reply"]

        # 📝 Save chat history even when plot fetch fails
        try:
            supabase.table("farmerAI_chatlog").insert({
                "id": str(uuid4()),
                "plot_id": plot_id if plot_id else "general",
                "user_id": None,
                "prompt": prompt,
                "reply": reply,
                "created_at": datetime.utcnow().isoformat(),
                "original_schedule": [],
                "modified_schedule": [],
                "reverted": False,
                "is_user_message": True,
                "role": "user",
                "message_index": 0,
                "context_summary": "",
                "chat_session_id": chat_session_id,
                "edited": False
            }).execute()
            print("✅ Chat history saved (plot fetch failed case)")
        except Exception as save_error:
            print(f"⚠️ Failed to save chat history: {save_error}")

        return jsonify({"success": True, "reply": reply})

    # If we get here, we have a valid plot
    if not plot:
        print(f"❌ No plot data available for {plot_id}")
        return jsonify({"success": False, "error": "Plot data not available"}), 500

    # 📌 Extract plot details
    user_id = plot.get("user_id")
    crop = plot.get("crop")
    area = plot.get("area", 1.0)
    flex_type = plot.get("flex_type", "daily")
    zip_code = plot.get("zip_code", "00000")
    planting_date = plot.get("planting_date")
    age_at_entry = plot.get("age_at_entry", 0.0)
    lat, lon = plot.get("lat"), plot.get("lon")
    plot_name = plot.get("name", f"Plot {plot_id[:5]}")
    age = get_total_crop_age(planting_date, age_at_entry)
    
    # Handle missing coordinates by using zip code fallback
    if lat is None or lon is None:
        print(f"⚠️ Plot {plot_name} has no coordinates, using zip code fallback")
        try:
            lat, lon = get_lat_lon(zip_code)
            print(f"📍 Generated coordinates from ZIP {zip_code}: lat={lat}, lon={lon}")
        except Exception as e:
            print(f"❌ Failed to get coordinates from ZIP {zip_code}: {e}")
            # Use default coordinates as fallback
            lat, lon = 37.7749, -122.4194
            print(f"📍 Using default coordinates: lat={lat}, lon={lon}")
    
    print(f"🌱 Plot context: crop={crop}, lat={lat}, lon={lon}, plot_name={plot_name}, age={age}")

    # 📦 Weather forecast (Open-Meteo)
    forecast = get_forecast(lat, lon)
    daily = forecast.get("daily", [])
    hourly = forecast.get("hourly", [])
    current_weather = forecast.get("current", {})

    # 💧 Watering logs
    logs_res = supabase.table("watering_log") \
        .select("*").eq("plot_id", plot_id) \
        .order("watered_at", desc=True).limit(7).execute()
    logs = logs_res.data or []

    # 📥 Call AI chat processor
    result = process_chat_command(
        prompt=prompt,
        crop=crop,
        lat=lat,
        lon=lon,
        plot_name=plot_name,
        plot_id=plot_id,
        weather=current_weather,
        plot=plot,
        daily=daily,
        hourly=hourly,
        logs=logs,
        age=age  # ✅ passed in
    )
    reply = result["reply"]

    # 🔁 Get updated schedule (if changed)
    refreshed = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute()
    updated_schedule = refreshed.data[0]["schedule"] if refreshed.data else []

    # 🗓️ Get original schedule for log
    schedule_res = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).limit(1).execute()
    original_schedule = schedule_res.data[0]["schedule"] if refreshed.data else []

    # 📝 Save chat history
    try:
        chat_log_data = {
            "id": str(uuid4()),
            "plot_id": plot_id,
            "user_id": user_id,
            "prompt": prompt,
            "reply": reply,
            "created_at": datetime.utcnow().isoformat(),
            "original_schedule": original_schedule,
            "modified_schedule": updated_schedule,
            "reverted": False,
            "is_user_message": True,
            "role": "user",
            "message_index": 0,
            "context_summary": "",
            "chat_session_id": str(uuid4()) if not chat_session_id else chat_session_id,
            "edited": False
        }
        print(f"📝 Attempting to save chat log: plot_id={plot_id}, user_id={user_id}, session={chat_session_id}")
        result = supabase.table("farmerAI_chatlog").insert(chat_log_data).execute()
        print(f"✅ Chat history saved successfully: {result.data}")
    except Exception as e:
        print(f"⚠️ Failed to save chat history: {e}")
        print(f"   Data attempted: {chat_log_data}")
        import traceback
        print(f"   Full traceback: {traceback.format_exc()}")
        # Continue without saving chat history - don't crash the chat

    return jsonify({"success": True, "reply": reply})



@app.route("/get_chat_log", methods=["POST"])
def get_chat_log():
    data = request.get_json()
    user_id = data.get("user_id")
    plot_id = data.get("plot_id")

    if not user_id or not plot_id:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        res = supabase.table("farmerAI_chatlog") \
            .select("prompt, reply, created_at, is_user_message") \
            .eq("user_id", user_id) \
            .eq("plot_id", plot_id) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()

        print(f"🔍 Retrieved {len(res.data)} chat rows for user={user_id}, plot={plot_id}")

        chat_history = []
        for row in reversed(res.data):  # oldest first
            prompt_ts = datetime.fromisoformat(row["created_at"])
            reply_ts = prompt_ts + timedelta(seconds=1)  # offset reply to avoid duplication

            if row["prompt"]:
                chat_history.append({
                    "sender": "user",
                    "text": row["prompt"],
                    "timestamp": prompt_ts.isoformat()
                })

            if row["reply"]:
                chat_history.append({
                    "sender": "bot",
                    "text": row["reply"],
                    "timestamp": reply_ts.isoformat()
                })

        return jsonify(chat_history), 200

    except Exception as e:
        print("❌ Error in /get_chat_log:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
