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
from uuid import uuid4
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from dateutil import tz
from timezonefinder import TimezoneFinder
import time

# Load env vars
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
WEATHERAPI_KEY = os.getenv("WEATHERAPI_KEY")
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

def get_et0_weatherapi(lat, lon):
    try:
        print("📡 Getting ET₀ from WeatherAPI...")
        url = "http://api.weatherapi.com/v1/forecast.json"
        params = {
            "key": WEATHERAPI_KEY,
            "q": f"{lat},{lon}",
            "days": 7,
            "aqi": "no",
            "alerts": "no"
        }
        response = requests.get(url, params=params)
        data = response.json()
        et0_list = [float(day["astro"].get("evapotranspiration_mm", 5.0)) for day in data["forecast"]["forecastday"]]
        print("✅ ET₀ values:", et0_list)
        return et0_list
    except Exception as e:
        print(f"❌ WeatherAPI ET₀ error: {e}")
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

    try:
        print("🔍 Checking for existing schedule...")
        existing = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).single().execute()

        print("📍 Getting coordinates...")
        lat, lon = get_lat_lon(zip_code)
        tf = TimezoneFinder()
        timezone_str = tf.timezone_at(lat=lat, lng=lon)
        local_zone = tz.gettz(timezone_str)
        now_local = datetime.now(local_zone).replace(minute=0, second=0, microsecond=0)
        print("🌍 Detected timezone:", timezone_str)

        print("📡 Getting ET₀...")
        et0_list = get_et0_weatherapi(lat, lon)

        print("📅 Generating new schedule...")
        schedule = calculate_schedule(area, crop, et0_list)
        print("✅ Schedule generated:", schedule)

        current_temp_f = None
        avg_moisture = None
        avg_sunlight = None

        if existing.data:
            print("♻️ Returning latest schedule from Supabase")
            row = existing.data
            return jsonify({
                "schedule": row["schedule"],
                "summary": row["summary"],
                "gem_summary": row["gem_summary"],
                "current_temp_f": current_temp_f,
                "moisture": avg_moisture,
                "sunlight": avg_sunlight
            })

        summary = generate_summary(crop, zip_code, schedule)
        gem_summary = generate_gem_summary(crop, zip_code, plot_name, plot_id)

        supabase.table("plot_schedules").upsert({
            "plot_id": plot_id,
            "schedule": schedule,
            "summary": summary,
            "gem_summary": gem_summary
        }, on_conflict=["plot_id"]).execute()

        print("✅ New schedule saved")
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
        # Get the most recent original schedule from chatlog
        logs = supabase.table("farmerAI_chatlog") \
            .select("original_schedule") \
            .eq("plot_id", plot_id) \
            .order("created_at", desc=True) \
            .limit(1).execute()

        if not logs.data or not logs.data[0].get("original_schedule"):
            return jsonify({"error": "No previous schedule found"}), 404

        original = logs.data[0]["original_schedule"]

        # Update plot_schedules
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

        # Always re-fetch latest schedule for logging
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





if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
