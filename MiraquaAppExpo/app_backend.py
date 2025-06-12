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
from utils.forecast_utils import get_forecast, calculate_schedule, find_optimal_time

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

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "farmerAI")))
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
    plot_id = data.get("plot_id")

    if not plot_id:
        return jsonify({"error": "Missing plot_id"}), 400

    result = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
    plot = result.data
    if not plot:
        return jsonify({"error": "Plot not found"}), 404

    crop = plot["crop"]
    area = plot["area"]
    zip_code = plot["zip_code"]
    flex_type = plot.get("flex_type", "daily")
    planting_date = plot.get("planting_date")
    age_at_entry = plot.get("age_at_entry", 0.0)
    lat, lon = plot["lat"], plot["lon"]

    age = get_total_crop_age(planting_date, age_at_entry)

    forecast = get_forecast(lat, lon)
    hourly_forecast = forecast.get("hourly", {})

    temp = hourly_forecast.get("temperature_2m", [])
    soil = hourly_forecast.get("soil_moisture_0_to_1cm", [])

    hourly_blocks = [[] for _ in range(7)]
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    for i in range(len(temp)):
        dt = now + timedelta(hours=i)
        day_idx = (dt.date() - now.date()).days
        if 0 <= day_idx < 7:
            entry = {
                "dt": int(dt.timestamp()),
                "main": {"temp": temp[i] if i < len(temp) else 20},
                "pop": 0.0,
                "wind": {"speed": 1.5},
                "clouds": 50
            }
            hourly_blocks[day_idx].append(entry)

    soil_forecast = []
    for i in range(7):
        chunk = soil[i * 24:(i + 1) * 24]
        avg = sum(chunk) / len(chunk) if chunk else 0.25
        soil_forecast.append(round(avg, 3))

    schedule = calculate_schedule(
        crop=crop,
        area=area,
        age=age,
        lat=lat,
        lon=lon,
        flex_type=flex_type,
        hourly_blocks=hourly_blocks,
        soil_forecast=soil_forecast
    )

    first_24_temps = temp[:24]
    current_temp_f = round(np.mean(first_24_temps) * 9 / 5 + 32, 1) if first_24_temps else 72.0
    avg_moisture = round(np.mean(soil_forecast) * 100, 2) if soil_forecast else 28.0
    avg_sunlight = 70.0  # static fallback

    plot_name = plot.get("name", f"Plot {plot_id[:5]}")
    summary = generate_summary(crop, lat, lon, schedule)
    gem_summary = generate_gem_summary(crop, lat, lon, plot_name, plot_id)

    supabase.table("plot_schedules").upsert({
        "plot_id": plot_id,
        "schedule": schedule,
        "summary": summary,
        "gem_summary": gem_summary
    }, on_conflict=["plot_id"]).execute()

    print("📤 Saved to Supabase:", schedule)

    return jsonify({
        "plot_name": plot_name,
        "schedule": schedule,
        "summary": summary,
        "gem_summary": gem_summary,
        "current_temp_f": current_temp_f,
        "moisture": avg_moisture,
        "sunlight": avg_sunlight,
        "total_crop_age": age
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
        # Step 1: Update the plot
        supabase.table("plots").update(updates).eq("id", plot_id).execute()

        # Step 2: Re-fetch updated plot
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

        # 🧠 Use same weather logic as /get_plan
        soil_forecast = []
        hourly_blocks = [[] for _ in range(7)]

        if RENDER:
            res = requests.get("https://api.openweathermap.org/data/2.5/forecast", params={
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_API_KEY,
                "units": "imperial"
            })
            forecast_data = res.json()

            for entry in forecast_data["list"]:
                dt = datetime.utcfromtimestamp(entry["dt"])
                i = (dt.date() - datetime.utcnow().date()).days
                if 0 <= i < 7:
                    hourly_blocks[i].append(entry)

            for i in range(7):
                rain_probs = [e.get("pop", 0) for e in hourly_blocks[i]]
                rain_factor = sum(rain_probs) / len(rain_probs) if rain_probs else 0
                soil_estimate = max(0.15, min(0.45, 0.35 - (i * 0.03) + rain_factor * 0.2))
                soil_forecast.append(round(soil_estimate, 3))
        else:
            return jsonify({"success": False, "error": "Weather fetch not supported outside Render"}), 500

        # ✅ Call calculate_schedule with real data
        schedule = calculate_schedule(
            crop=crop,
            area=area,
            age=age,
            lat=lat,
            lon=lon,
            flex_type=flex_type,
            hourly_blocks=hourly_blocks,
            soil_forecast=soil_forecast
        )

        # Step 4: Upsert into plot_schedules
        existing = supabase.table("plot_schedules").select("id").eq("plot_id", plot_id).limit(1).execute()
        row_id = existing.data[0]["id"] if existing.data else str(uuid4())

        supabase.table("plot_schedules").upsert({
            "id": row_id,
            "plot_id": plot_id,
            "schedule": schedule
        }, on_conflict=["plot_id"]).execute()

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
    prompt, crop, zip_code = data.get("prompt"), data.get("crop"), data.get("zip_code")
    plot_name, plot_id, weather = data.get("plotName"), data.get("plotId"), data.get("weather", {})
    chat_session_id = data.get("chat_session_id")

    schedule_res = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).limit(1).execute()
    if not schedule_res.data:
        return jsonify({"success": False, "error": "No schedule to modify."}), 404

    schedule_row = schedule_res.data[0]
    original_schedule = schedule_row.get("schedule", [])
    plot_data = supabase.table("plots").select("user_id").eq("id", plot_id).single().execute()
    user_id = plot_data.data.get("user_id")
    lat, lon = data.get("lat"), data.get("lon")

    result = process_chat_command(prompt, crop, lat, lon, plot_name, plot_id, weather)
    reply = result["reply"]

    refreshed = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute()
    updated_schedule = refreshed.data[0]["schedule"] if refreshed.data else original_schedule

    supabase.table("farmerAI_chatlog").insert({
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
        "chat_session_id": chat_session_id,
        "edited": False
    }).execute()

    return jsonify({"success": True, "reply": reply})

@app.route("/get_chat_log", methods=["POST"])
def get_chat_log():
    data = request.get_json()
    user_id = data.get("user_id")
    plot_id = data.get("plot_id")
    chat_session_id = data.get("chat_session_id")

    if not user_id or not plot_id or not chat_session_id:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        res = supabase.table("farmerAI_chatlog") \
            .select("prompt, reply, created_at, is_user_message") \
            .eq("user_id", user_id) \
            .eq("plot_id", plot_id) \
            .eq("chat_session_id", chat_session_id) \
            .order("created_at", desc=True) \
            .limit(5) \
            .execute()

        print(f"🔍 Retrieved {len(res.data)} chat rows for user={user_id}, plot={plot_id}, session={chat_session_id}")

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
