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

from datetime import datetime, timedelta, timezone


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
from farmer_ai import generate_summary, generate_gem_summary, process_chat_command, generate_ai_schedule

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

def roll_schedule_forward(saved_schedule, plot, daily, hourly, logs):
    """
    Take a saved 7-day schedule list of dicts (with "date" in "%m/%d/%y"),
    keep only entries from today onward, and fill up to 7 days by
    pulling new entries from generate_ai_schedule.
    """
    today = datetime.now(timezone.utc).date()
    rolled = []

    # 1) keep all future or today’s entries
    for entry in saved_schedule:
        try:
            dt = datetime.strptime(entry["date"], "%m/%d/%y").date()
            if dt >= today:
                rolled.append(entry)
        except Exception:
            continue

    # 2) if we lost days (e.g. old plan), fetch fresh and append missing
    if len(rolled) < 7:
        try:
            new_sched = generate_ai_schedule(plot, daily, hourly, logs)
            existing = { datetime.strptime(e["date"], "%m/%d/%y").date() for e in rolled }
            for day in new_sched:
                dt = datetime.strptime(day["date"], "%m/%d/%y").date()
                if dt >= today and dt not in existing:
                    rolled.append(day)
                    existing.add(dt)
                    if len(rolled) == 7:
                        break
        except Exception:
            pass

    # 3) sort by date and return
    rolled.sort(key=lambda x: datetime.strptime(x["date"], "%m/%d/%y"))
    return rolled

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

def roll_schedule_forward(saved_schedule, plot, daily, hourly, logs):
    """
    Keep entries from today onward and fill up to 7 days
    by fetching new entries as needed.
    """
    today = datetime.now(timezone.utc).date()
    rolled = []
    # 1) keep future entries
    for entry in saved_schedule:
        try:
            dt = datetime.strptime(entry["date"], "%m/%d/%y").date()
            if dt >= today:
                rolled.append(entry)
        except Exception:
            continue
    # 2) append missing days
    if len(rolled) < 7:
        try:
            new_sched = generate_ai_schedule(plot, daily, hourly, logs)
            existing = { datetime.strptime(e["date"], "%m/%d/%y").date() for e in rolled }
            for day in new_sched:
                dt = datetime.strptime(day["date"], "%m/%d/%y").date()
                if dt >= today and dt not in existing:
                    rolled.append(day)
                    existing.add(dt)
                    if len(rolled) == 7:
                        break
        except Exception:
            pass
    # 3) sort and return
    rolled.sort(key=lambda x: datetime.strptime(x["date"], "%m/%d/%y"))
    return rolled

@app.route('/get_plan', methods=['GET', 'POST'])
def get_plan():
    # — pull params from GET or POST —
    if request.method == 'POST':
        body          = request.get_json() or {}
        plot_id       = body.get("plot_id")
        force_refresh = body.get("force_refresh", False)
        use_original  = body.get("use_original",  False)
    else:
        plot_id       = request.args.get("plot_id")
        force_refresh = request.args.get("force_refresh", "false").lower() == "true"
        use_original  = request.args.get("use_original",  "false").lower() == "true"

    if not plot_id:
        return jsonify({"error": "Missing plot_id"}), 400

    # 1️⃣ Load plot metadata
    plot_res = supabase.table("plots")\
        .select("*")\
        .eq("id", plot_id)\
        .single()\
        .execute()
    plot = plot_res.data
    if not plot:
        return jsonify({"error": "Plot not found"}), 404

    # 2️⃣ Fetch weather & logs
    weather = get_forecast(plot["lat"], plot["lon"])
    daily   = weather.get("daily", [])
    hourly  = weather.get("hourly", [])
    logs_res = supabase.table("watering_log")\
        .select("*")\
        .eq("plot_id", plot_id)\
        .order("watered_at", desc=True)\
        .limit(7)\
        .execute()
    logs = logs_res.data or []

    # 3️⃣ Retrieve saved schedule
    sched_res = supabase.table("plot_schedules")\
        .select("*")\
        .eq("plot_id", plot_id)\
        .order("updated_at", desc=True)\
        .limit(1)\
        .execute()
    sched_list    = sched_res.data or []
    schedule_data = sched_list[0] if sched_list else {}

    # 4️⃣ Decide regen vs. reuse
    should_regen = bool(force_refresh)
    if schedule_data:
        ts = schedule_data.get("updated_at")
        if ts:
            try:
                last = datetime.fromisoformat(ts)
                now  = datetime.now(timezone.utc)
                should_regen = (now - last) > timedelta(hours=24)
            except ValueError:
                should_regen = True
        else:
            should_regen = True
    else:
        should_regen = True

    # 5️⃣ Early exit with rolled saved schedule
    if schedule_data and not should_regen:
        base   = schedule_data.get("og_schedule") if use_original else schedule_data.get("schedule")
        rolled = roll_schedule_forward(base or [], plot, daily, hourly, logs)
        return jsonify({
            "plot_name":   plot.get("name", f"Plot {plot_id[:5]}"),
            "schedule":    rolled,
            "summary":     schedule_data.get("summary", ""),
            "gem_summary": schedule_data.get("gem_summary", ""),
        })

    # 6️⃣ Otherwise generate fresh
    schedule    = generate_ai_schedule(plot, daily, hourly, logs)
    summary     = generate_summary(plot["crop"], plot["lat"], plot["lon"], schedule)
    gem_summary = generate_gem_summary(plot["crop"], plot["lat"], plot["lon"],
                                       plot.get("name",""), plot_id)

    # 7️⃣ Upsert new schedule
    payload = {
        "plot_id":     plot_id,
        "schedule":    schedule,
        "summary":     summary,
        "gem_summary": gem_summary,
        "og_schedule": schedule_data.get("og_schedule") or schedule,
        "updated_at":  datetime.now(timezone.utc).isoformat(),
    }
    supabase.table("plot_schedules")\
        .upsert(payload, on_conflict=["plot_id"])\
        .execute()

    # 8️⃣ Return it
    return jsonify({
        "plot_name":   plot.get("name", f"Plot {plot_id[:5]}"),
        "schedule":    schedule,
        "summary":     summary,
        "gem_summary": gem_summary,
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
    data    = request.get_json() or {}
    plot_id = data.get("plot_id")
    updates = data.get("updates", {})

    if not plot_id:
        return jsonify({"success": False, "error": "Missing plot_id"}), 400

    # 1) Apply the settings update to the plots table
    supabase.table("plots") \
        .update(updates) \
        .eq("id", plot_id) \
        .execute()

    # 2) Fetch and return the newly updated plot record
    new_res = (
        supabase
        .table("plots")
        .select("id, user_id, crop, area, zip_code, name, ph_level, lat, lon, flex_type, planting_date, age_at_entry, custom_constraints, created_at")
        .eq("id", plot_id)
        .single()
        .execute()
    )
    updated_plot = new_res.data or {}

    # 3) Invalidate/delete any existing schedule so next get_plan regenerates
    supabase.table("plot_schedules") \
        .delete() \
        .eq("plot_id", plot_id) \
        .execute()

    # 4) Return success and the updated plot back to the client
    return jsonify({
        "success": True,
        "plot":    updated_plot
    })


    
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
    prompt = data.get("prompt")
    plot_id = data.get("plotId")
    chat_session_id = data.get("chat_session_id")

    if not prompt or not plot_id:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    # 🔍 Fetch plot
    plot_res = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
    plot = plot_res.data
    if not plot:
        return jsonify({"success": False, "error": "Plot not found"}), 404

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
    original_schedule = schedule_res.data[0]["schedule"] if schedule_res.data else []

    # 📝 Save chat history
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
