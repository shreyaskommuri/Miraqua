import os
import sys
import json
import requests
import requests_cache
from retry_requests import retry
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from uuid import uuid4
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from dateutil import tz
from timezonefinder import TimezoneFinder
import time
import resource

# Set higher file/socket limit
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
resource.setrlimit(resource.RLIMIT_NOFILE, (hard, hard))

# Load env vars
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
RENDER = os.getenv("RENDER", "false").lower() == "true"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gemini logic
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "farmerAI")))
from farmer_ai import generate_summary, generate_gem_summary, process_chat_command

app = Flask(__name__)
CORS(app)

# Crop coefficients
CROP_KC = {
    "corn": 1.15, "wheat": 1.0, "alfalfa": 1.2, "lettuce": 0.85,
    "tomato": 1.05, "almond": 1.05, "default": 0.95
}

def get_lat_lon(zip_code):
    try:
        url = f"http://api.zippopotam.us/us/{zip_code}"
        response = requests.get(url, timeout=5)
        data = response.json()
        lat = float(data['places'][0]['latitude'])
        lon = float(data['places'][0]['longitude'])
        print(f"📍 ZIP {zip_code} resolved to ({lat}, {lon})")
        return lat, lon
    except Exception as e:
        print(f"❌ ZIP resolution failed: {e}")
        raise

def get_et0_openweather(lat, lon):
    try:
        print("🌤️ Getting ET₀ from OpenWeather...")
        url = "https://api.openweathermap.org/data/2.5/onecall"
        params = {
            "lat": lat,
            "lon": lon,
            "exclude": "minutely,hourly,alerts",
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        et0_list = []
        for day in data["daily"][:7]:
            temp = day["temp"]["day"]
            wind = day["wind_speed"]
            humidity = day["humidity"]
            et0 = 0.0023 * (temp + 17.8) * wind * (1 - humidity / 100)
            et0_list.append(round(et0, 2))
        print("✅ OpenWeather ET₀ values:", et0_list)
        return et0_list
    except Exception as e:
        print(f"❌ OpenWeather ET₀ error: {e}")
        return [5.0] * 7

def get_et0(lat, lon):
    if RENDER:
        return get_et0_openweather(lat, lon)
    else:
        print("⚠️ Local fallback ET₀ used")
        return [5.0] * 7

def calculate_schedule(area, crop, et0_list):
    kc = CROP_KC.get(crop.lower(), CROP_KC["default"])
    schedule = []
    for i in range(7):
        et0 = et0_list[i]
        liters = round(et0 * kc * area, 2)
        schedule.append({"day": f"Day {i+1}", "liters": liters})
    return schedule

@app.route("/get_plan", methods=["POST"])
def get_plan():
    data = request.get_json()
    crop = data.get("crop")
    zip_code = data.get("zip_code")
    area = data.get("area")
    plot_id = data.get("plot_id")

    if not crop or not zip_code or not area or not plot_id:
        print("❌ Missing required input in /get_plan:", data)
        return jsonify({"error": "Missing required data"}), 400

    try:
        print("🔍 Checking for existing schedule...")
        existing = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).limit(1).execute()

        print("📍 Getting coordinates...")
        lat, lon = get_lat_lon(zip_code)

        tf = TimezoneFinder()
        timezone_str = tf.timezone_at(lat=lat, lng=lon)
        local_zone = tz.gettz(timezone_str)
        now_local = datetime.now(local_zone).replace(minute=0, second=0, microsecond=0)
        print("🌍 Detected timezone:", timezone_str)

        print("📡 Getting ET₀ and weather...")
        et0_list = get_et0(lat, lon)

        if RENDER:
            print("🌦️ Fetching weather data from OpenWeather...")
            url = "https://api.openweathermap.org/data/2.5/forecast"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_API_KEY,
                "units": "imperial"
            }
            res = requests.get(url, params=params)
            forecast_data = res.json()

            temps = []
            moistures = []
            sunlights = []

            for entry in forecast_data["list"][:8]:  # First 24h = 8 x 3hr blocks
                if "main" in entry:
                    temps.append(entry["main"]["temp"])
                if "pop" in entry:
                    moistures.append(entry["pop"] * 100)
                if "clouds" in entry:
                    sunlights.append(100 - entry["clouds"]["all"])

            current_temp_f = round(np.mean(temps), 1) if temps else 72.5
            avg_moisture = round(np.mean(moistures), 2) if moistures else 0.24
            avg_sunlight = round(np.mean(sunlights), 1) if sunlights else 6.0
        else:
            print("📡 Fetching weather from Open-Meteo...")
            from utils.forecast_utils import get_forecast
            forecast = get_forecast(lat, lon)
            hourly = forecast.get("hourly", {})

            temps = hourly.get("temperature_2m", [])[12:18]  # approx. 12 PM to 6 PM

            moistures = hourly.get("soil_moisture_0_to_1cm", [])[:3]
            et0s = hourly.get("evapotranspiration", [])[:3]

            print(f"🌡️ Raw temps (C): {temps}")
            print(f"🌱 Raw moistures: {moistures}")
            print(f"☀️ Raw ET₀s: {et0s}")

            current_temp_f = round(np.mean(temps) * 9/5 + 32, 1) if temps else 72.5
            avg_moisture = round(np.mean(moistures) * 100, 2) if moistures else 0.24
            avg_sunlight = round(np.mean(et0s) * 4, 1) if et0s else 6.0  # approximate sunlight hours

            print(f"🌡️ Temp (F): {current_temp_f}, 🌱 Moisture: {avg_moisture}, ☀️ Sunlight: {avg_sunlight}")





        print("📅 Generating new schedule...")
        schedule = calculate_schedule(area, crop, et0_list)

        if existing.data:
            print("♻️ Returning latest schedule from Supabase")
            row = existing.data[0]
            return jsonify({
                "schedule": row["schedule"],
                "summary": row["summary"],
                "gem_summary": row["gem_summary"],
                "current_temp_f": current_temp_f,
                "moisture": avg_moisture,
                "sunlight": avg_sunlight
            })

        print("🧠 Generating AI summaries...")
        summary = generate_summary(crop, zip_code, schedule)
        gem_summary = generate_gem_summary(crop, zip_code, f"Plot {plot_id[:5]}", plot_id)

        supabase.table("plot_schedules").upsert({
            "plot_id": plot_id,
            "schedule": schedule,
            "summary": summary,
            "gem_summary": gem_summary
        }, on_conflict=["plot_id"]).execute()

        return jsonify({
            "schedule": schedule,
            "summary": summary,
            "gem_summary": gem_summary,
            "current_temp_f": current_temp_f,
            "moisture": avg_moisture,
            "sunlight": avg_sunlight
        })

    except Exception as e:
        print("❌ Error in /get_plan:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/add_plot", methods=["POST"])
def add_plot():
    data = request.get_json()
    try:
        response = supabase.table("plots").insert(data).execute()
        return jsonify(response.data[0] if response.data else {"message": "Added"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_plots", methods=["GET"])
def get_plots():
    user_id = request.args.get("user_id")
    try:
        res = supabase.table("plots").select("*").eq("user_id", user_id).execute()
        return jsonify(res.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/revert_schedule", methods=["POST"])
def revert_schedule():
    data = request.get_json()
    plot_id = data.get("plot_id")
    try:
        logs = supabase.table("farmerAI_chatlog") \
            .select("original_schedule") \
            .eq("plot_id", plot_id) \
            .order("created_at", desc=True) \
            .limit(1).execute()

        if not logs.data or not logs.data[0].get("original_schedule"):
            return jsonify({"error": "No previous schedule found"}), 404

        original = logs.data[0]["original_schedule"]

        supabase.table("plot_schedules").update({
            "schedule": original
        }).eq("plot_id", plot_id).execute()

        return jsonify({"success": True})
    except Exception as e:
        print("❌ Error reverting:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        crop = data.get("crop")
        zip_code = data.get("zip_code")
        plot_name = data.get("plotName")
        plot_id = data.get("plotId")
        weather = data.get("weather", {})

        schedule_res = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).limit(1).execute()
        if not schedule_res.data:
            print("❌ No schedule found for plot_id:", plot_id)
            return jsonify({"success": False, "error": "No schedule to modify."}), 404

        schedule_row = schedule_res.data[0]
        original_schedule = schedule_row.get("schedule", [])
        user_id = schedule_row.get("user_id")

        result = process_chat_command(
            prompt, crop, zip_code, plot_name, plot_id, weather
        )
        reply = result["reply"]

        refreshed = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute()
        updated_schedule = refreshed.data[0]["schedule"] if refreshed.data else original_schedule

        if json.dumps(updated_schedule, sort_keys=True) != json.dumps(original_schedule, sort_keys=True):
            print("🛠️ Updated schedule stored and detected")

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
            "chat_session_id": str(uuid4()),
            "edited": False
        }).execute()

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        print("❌ Error in /chat:", e)
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/get_chat_log", methods=["POST"])
def get_chat_log():
    data = request.get_json()
    user_id = data.get("user_id")
    plot_id = data.get("plot_id")

    if not user_id or not plot_id:
        return jsonify({"error": "Missing user_id or plot_id"}), 400

    try:
        res = supabase.table("farmerAI_chatlog") \
            .select("prompt, reply, created_at, is_user_message") \
            .eq("user_id", user_id) \
            .eq("plot_id", plot_id) \
            .order("created_at", desc=False) \
            .execute()

        chat_history = []
        for row in res.data:
            if row["is_user_message"]:
                chat_history.append({"sender": "user", "text": row["prompt"]})
                chat_history.append({"sender": "bot", "text": row["reply"]})

        return jsonify(chat_history), 200

    except Exception as e:
        print("❌ Error in /get_chat_log:", e)
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
