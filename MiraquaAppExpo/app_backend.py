import os
import sys
import json
import requests
import openmeteo_requests
import requests_cache
from retry_requests import retry
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Import AI summary logic
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "farmerAI")))
from farmer_ai import generate_summary, generate_gem_summary

app = Flask(__name__)
CORS(app)

# Weather setup
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Crop coefficients
CROP_KC = {
    "corn": 1.15, "wheat": 1.0, "alfalfa": 1.2, "lettuce": 0.85,
    "tomato": 1.05, "almond": 1.05, "default": 0.95
}

def get_lat_lon(zip_code):
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={zip_code}&count=1&language=en&format=json"
    response = requests.get(geo_url)
    data = response.json()
    if "results" in data and len(data["results"]) > 0:
        return data["results"][0]["latitude"], data["results"][0]["longitude"]
    else:
        raise ValueError("Invalid zip code")

def get_forecast(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "soil_moisture_0_to_1cm", "evapotranspiration"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
        "timezone": "auto",
    }
    response = openmeteo.weather_api(url, params)
    return response

def calculate_schedule(area, crop, weather_data):
    kc = CROP_KC.get(crop.lower(), CROP_KC["default"])
    schedule = []
    for i in range(7):
        et0 = 5.0
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

    try:
        lat, lon = get_lat_lon(zip_code)
        forecasts = get_forecast(lat, lon)
        forecast = forecasts[0]  # ✅ single forecast object
        hourly = forecast.Hourly()

        temps_c = hourly.Variables(0).ValuesAsNumpy()
        moistures = hourly.Variables(1).ValuesAsNumpy()
        et0s = hourly.Variables(2).ValuesAsNumpy()

        avg_temp_c = sum(temps_c[:24]) / 24
        current_temp_f = round((avg_temp_c * 9 / 5) + 32, 1)
        avg_moisture = round(sum(moistures[:24]) / 24 * 100, 2)
        avg_sunlight = round(min((sum(et0s[:24]) / 5.0) * 100, 100), 1)

        schedule = calculate_schedule(area, crop, forecast)
        readable_summary = generate_summary(crop, zip_code, schedule)
        gem_summary = generate_gem_summary(crop, zip_code, schedule, plot_id)

        # Save in Supabase
        supabase.table("plot_schedules").insert({
            "plot_id": plot_id,
            "schedule": schedule,
            "summary": readable_summary,
            "gem_summary": gem_summary
        }).execute()

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
    name = data.get("name")  # ✅ Handle plot name
    crop = data.get("crop")
    zip_code = data.get("zip_code")
    area = data.get("area")
    user_id = data.get("user_id")

    try:
        response = supabase.table("plots").insert({
            "name": name,  # ✅ Save name
            "crop": crop,
            "zip_code": zip_code,
            "area": area,
            "user_id": user_id
        }).execute()
        return jsonify(response.data[0]), 200
    except Exception as e:
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

        # Step 1: Fetch schedule
        schedule_res = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).execute()
        if not schedule_res.data:
            return jsonify({"success": False, "error": "Schedule not found."})

        schedule_data = schedule_res.data[0]
        schedule = schedule_data.get("schedule", [])

        # Step 2: Ask Gemini to interpret the prompt and potentially modify the schedule
        from farmer_ai import process_chat_command
        updated_schedule, reply = process_chat_command(prompt, schedule, crop, zip_code, plot_name)

        # Step 3: If updated, save back to Supabase
        if updated_schedule != schedule:
            supabase.table("plot_schedules").update({"schedule": updated_schedule}).eq("plot_id", plot_id).execute()

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        print("❌ Error in /chat:", e)
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)


