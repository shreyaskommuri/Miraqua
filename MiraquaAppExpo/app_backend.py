import os
import sys
import json
import requests
import openmeteo_requests
import requests_cache
from retry_requests import retry
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from dateutil.parser import parse

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Import Gemini logic
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "farmerAI")))
from farmer_ai import generate_summary, generate_gem_summary, process_chat_command

app = Flask(__name__)
CORS(app)

# Open-Meteo setup
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Crop coefficients
CROP_KC = {
    "corn": 1.15, "wheat": 1.0, "alfalfa": 1.2, "lettuce": 0.85,
    "tomato": 1.05, "almond": 1.05, "default": 0.95
}

def get_lat_lon(zip_code):
    try:
        url = f"http://api.zippopotam.us/us/{zip_code}"
        print("🌐 Requesting geocoding URL:", url)
        response = requests.get(url, timeout=5)
        data = response.json()
        lat = float(data['places'][0]['latitude'])
        lon = float(data['places'][0]['longitude'])
        print(f"📍 Resolved ZIP {zip_code} to lat/lon: ({lat}, {lon})")
        return lat, lon
    except Exception as e:
        print(f"❌ Failed to resolve ZIP {zip_code}: {str(e)}")
        raise ValueError(f"Could not resolve ZIP code: {zip_code}")

def get_forecast(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "soil_moisture_0_to_1cm", "evapotranspiration"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
        "timezone": "auto",
        "models": "best_match"
    }
    print("🌤️ Requesting weather forecast...")
    response = openmeteo.weather_api(url, params)
    return response

def to_array_safe(value):
    if isinstance(value, np.ndarray):
        return value
    elif isinstance(value, list):
        return np.array(value)
    elif isinstance(value, (int, float)):
        return np.array([value])  # wrap scalar in array
    elif hasattr(value, "__iter__"):
        return np.array(list(value))
    else:
        print("❌ Unexpected type in to_array_safe:", type(value))
        return np.array([])


def calculate_schedule(area, crop, weather_data):
    kc = CROP_KC.get(crop.lower(), CROP_KC["default"])
    schedule = []

    try:
        daily = weather_data.Daily()
        et0_values = to_array_safe(daily.Variables(2).ValuesAsNumpy())  # evapotranspiration
        precip_values = to_array_safe(daily.Variables(0).ValuesAsNumpy())  # precipitation
    except Exception as e:
        print("❌ Error parsing daily forecast:", e)
        return [{"day": f"Day {i+1}", "liters": 0} for i in range(7)]

    try:
        hourly = weather_data.Hourly()
        moisture_values = to_array_safe(hourly.Variables(1).ValuesAsNumpy())  # hourly soil moisture
    except Exception as e:
        print("❌ Error parsing hourly forecast:", e)
        moisture_values = [0.2] * 168  # fallback neutral moisture

    # Fallback if ET₀ is empty or missing
    if len(et0_values) < 7 or np.all(np.isnan(et0_values)) or np.all(et0_values == 0):
        print("⚠️ ET₀ missing or zero — using fallback ET₀ = 5.0")
        et0_values = np.array([5.0] * 7)

    # Average soil moisture per day (24 hours each)
    daily_moisture = []
    for day in range(7):
        start = day * 24
        end = start + 24
        if end <= len(moisture_values):
            day_moisture = np.mean(moisture_values[start:end])
        else:
            day_moisture = np.mean(moisture_values[-24:])
        daily_moisture.append(day_moisture)

    print("🌿 Final ET₀ per day:", et0_values[:7])
    print("🟫 Daily moisture averages:", daily_moisture)

    for i in range(7):
        et0 = et0_values[i]
        moisture = daily_moisture[i]
        moisture_factor = max(0.2, 1.0 - moisture)  # Cap reduction to avoid 0
        liters = round(et0 * kc * area * moisture_factor, 2)
        schedule.append({"day": f"Day {i+1}", "liters": max(0, liters)})

    print("📦 Final schedule:", schedule)
    return schedule


@app.route("/get_plan", methods=["POST"])
def get_plan():
    data = request.get_json()
    crop = data.get("crop")
    zip_code = data.get("zip_code")
    area = data.get("area")
    plot_id = data.get("plot_id")

    try:
        print("🔍 Checking for existing schedule...")
        existing = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).limit(1).execute()

        print("🌐 Getting coordinates...")
        lat, lon = get_lat_lon(zip_code)

        print("📡 Requesting weather forecast...")
        forecasts = get_forecast(lat, lon)
        forecast = forecasts[0]
        hourly = forecast.Hourly()

        # Safely parse forecast values
        temps_c = to_array_safe(hourly.Variables(0).ValuesAsNumpy())
        moistures = to_array_safe(hourly.Variables(1).ValuesAsNumpy())
        et0s = to_array_safe(hourly.Variables(2).ValuesAsNumpy())

        print("✅ Forecast arrays:", len(temps_c), len(moistures), len(et0s))

        # Check length of data
        if len(moistures) < 24 or len(et0s) < 24:
            raise ValueError("Insufficient forecast data (less than 24 hourly entries)")

        # Time logic
        hourly_time_raw = hourly.Time()
        hourly_time = [datetime.utcfromtimestamp(t) for t in to_array_safe(hourly_time_raw)]
        print("⏰ Converted hourly time sample:", hourly_time[:5])


        now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        
        print("⏰ now:", now)

        time_diffs = [abs((t - now).total_seconds()) for t in hourly_time]
        index_now = time_diffs.index(min(time_diffs))

        # Temperature
        current_temp_c = temps_c[index_now]
        current_temp_f = round((current_temp_c * 9 / 5) + 32, 1)

        # Moisture & Sunlight
        try:
            avg_moisture = round(np.mean(moistures[:24]) * 100, 2)
            print("🟦 Moisture data (first 24):", moistures[:24])

        except Exception as e:
            print("❌ Moisture error:", e)
            avg_moisture = None

        try:
            sunlight_ratio = sum(et0s[:24]) / 5.0  # assuming 5.0 = ideal ET₀ in 24h
            avg_sunlight = round(min(sunlight_ratio * 100, 100), 1)
        except Exception as e:
            print("❌ Sunlight error:", e)
            avg_sunlight = None


        if existing.data and len(existing.data) > 0:
            print("✅ Schedule found, returning it")
            existing_schedule = existing.data[0]
            return jsonify({
                "schedule": existing_schedule.get("schedule"),
                "summary": existing_schedule.get("summary"),
                "gem_summary": existing_schedule.get("gem_summary"),
                "current_temp_f": current_temp_f,
                "moisture": avg_moisture,
                "sunlight": avg_sunlight
            })
        


        # No existing schedule — generate new
        print("📅 Generating new schedule...")
        schedule = calculate_schedule(area, crop, forecast)
        print("✅ Schedule type:", type(schedule))
        print("✅ Schedule contents:", schedule)
        print("✅ First day:", schedule[0])
        readable_summary = generate_summary(crop, zip_code, schedule)
        gem_summary = generate_gem_summary(crop, zip_code, schedule, plot_id)

        supabase.table("plot_schedules").upsert({
    "plot_id": plot_id,
    "schedule": schedule,
    "summary": readable_summary,
    "gem_summary": gem_summary
}, on_conflict=["plot_id"]).execute()


        print("✅ New schedule created and saved")
        return jsonify({
            "schedule": schedule,
            "summary": readable_summary,
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
    name = data.get("name")
    crop = data.get("crop")
    zip_code = data.get("zip_code")
    area = data.get("area")
    user_id = data.get("user_id")

    try:
        response = supabase.table("plots").insert({
            "name": name,
            "crop": crop,
            "zip_code": zip_code,
            "area": area,
            "user_id": user_id
        }).execute()
        
        # ✅ Safe access to response.data
        if response.data and isinstance(response.data, list):
            return jsonify(response.data[0]), 200
        else:
            return jsonify({"message": "Plot added, but no data returned"}), 200

    except Exception as e:
        print("❌ Error in /add_plot:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/get_plots", methods=["GET"])
def get_plots():
    user_id = request.args.get("user_id")
    if not user_id or user_id == "None":
        return jsonify({"error": "Invalid user_id"}), 400

    try:
        response = supabase.table("plots").select("*").eq("user_id", user_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        print("❌ Error in /get_plots:", e)
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

        # Step 1: Fetch schedule from Supabase
        schedule_res = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).limit(1).execute()

        if not schedule_res.data:
            print("❌ Schedule not found for plot_id:", plot_id)
            return jsonify({"success": False, "error": "Schedule not found."}), 404

        schedule_row = schedule_res.data[0]
        schedule = schedule_row.get("schedule", [])

        # Step 2: Let AI process the command
        updated_schedule, reply = process_chat_command(prompt, schedule, crop, zip_code, plot_name)

        # Step 3: Check if modified using JSON-safe comparison
        if json.dumps(updated_schedule, sort_keys=True) != json.dumps(schedule, sort_keys=True):
            print("🛠️ Schedule was modified, saving to Supabase...")
            result = supabase.table("plot_schedules").update({
                "schedule": updated_schedule
            }).eq("plot_id", plot_id).execute()
            print("✅ Supabase update result:", result)
        else:
            print("📭 No change detected in schedule.")

        return jsonify({"success": True, "reply": reply})
    
    except Exception as e:
        print("❌ Error in /chat:", e)
        return jsonify({"success": False, "error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
