import requests
import openmeteo_requests
import requests_cache
from retry_requests import retry
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from uuid import uuid4
import json
import os

app = Flask(__name__)
CORS(app)

# ------------------------ Weather Setup ------------------------
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

CROP_KC = {
    "corn": 1.15,
    "wheat": 1.0,
    "alfalfa": 1.2,
    "lettuce": 0.85,
    "tomato": 1.05,
    "almond": 1.05,
    "default": 0.95
}

PLOTS_FILE = "plots.json"
USERS_FILE = "users.json"

# ------------------------ Utility Functions ------------------------
def save_to_file(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

def load_from_file(filename):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            return json.load(f)
    return []

PLOTS = load_from_file(PLOTS_FILE)

# ------------------------ Routes ------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    users = load_from_file(USERS_FILE)
    if any(user["email"] == email for user in users):
        return jsonify({"success": False, "error": "Email already exists"}), 400

    hashed = generate_password_hash(password)
    users.append({"email": email, "password": hashed})
    save_to_file(users, USERS_FILE)
    return jsonify({"success": True})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    users = load_from_file(USERS_FILE)
    user = next((u for u in users if u["email"] == email), None)

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "error": "Invalid credentials"}), 401

    return jsonify({"success": True})

@app.route("/add_plot", methods=["POST"])
def add_plot():
    plot = request.get_json()
    plot["name"] = plot.get("name", "").strip()
    plot["crop"] = plot.get("crop", "").strip().capitalize()
    plot["zip_code"] = str(plot.get("zip_code", "")).strip()
    plot["id"] = str(uuid4())

    if not plot["name"] or not plot["crop"] or not plot["zip_code"]:
        return jsonify({"success": False, "error": "Invalid plot data"}), 400

    PLOTS.append(plot)
    save_to_file(PLOTS, PLOTS_FILE)
    print("Plot added:", plot)
    return jsonify({"success": True})

@app.route("/get_plots", methods=["GET"])
def get_plots():
    return jsonify({"success": True, "plots": PLOTS})

@app.route("/get_plan", methods=["POST"])
def get_plan():
    data = request.get_json()
    zip_code = data.get("zip")
    crop = data.get("crop", "default").lower()
    area = float(data.get("area", 1))

    lat, lon = get_lat_lon(zip_code)
    if not lat:
        return jsonify({"error": "Invalid ZIP code or location"}), 400

    forecast = get_forecast(lat, lon)
    if not forecast:
        return jsonify({"error": "Could not fetch forecast"}), 500

    result = []
    total_liters_used = 0
    kc = CROP_KC.get(crop, CROP_KC["default"])

    for i in range(5):
        tmax = float(forecast["tmax"][i])
        tmin = float(forecast["tmin"][i])
        tmean = float(forecast["tmean"][i])
        rain = float(forecast["rain"][i])
        soil = float(forecast["soils"][i])

        temp_diff = max(5, tmax - tmin)
        et0 = 0.0023 * (tmean + 17.8) * (temp_diff ** 0.5) * 0.408
        et0 = max(et0, 0.5)
        etc = round(et0 * kc, 2)
        net_et = max(0, (etc - rain - (soil * 2)))
        liters = round(max(0, net_et * area), 2)
        total_liters_used += liters

        result.append({
            "day": forecast["dates"][i].strftime("%A (%b %d)"),
            "date": forecast["dates"][i].strftime("%-m/%-d/%Y"),
            "temp": round(tmean * 9/5 + 32, 1),
            "rain": round(rain, 2),
            "soil_moisture": round(soil, 3),
            "et0": round(et0, 2),
            "etc": round(etc, 2),
            "liters": int(liters)
        })

    predicted_aw = round(total_liters_used / 1233480, 2)
    avg_liters = round(total_liters_used / 5, 2)

    summary = (
        f"\U0001F33E Based on your crop ({crop}) and ZIP code ({zip_code}), your estimated 5-day water need is "
        f"{int(total_liters_used)} liters.\n"
        f"\U0001F4A7 Apply about {int(avg_liters)} liters per day.\n"
        f"\U0001F9E0 Optimized using crop type, soil moisture, and forecasted rainfall for precision irrigation."
    )

    return jsonify({
        "predicted_aw": predicted_aw,
        "schedule": result,
        "summary": summary
    })

# ------------------------ Forecast Helpers ------------------------
def get_lat_lon(zip_code):
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={zip_code}&country=US&count=1"
    res = requests.get(geo_url).json()
    if res.get("results"):
        lat = res["results"][0]["latitude"]
        lon = res["results"][0]["longitude"]
        return lat, lon
    return None, None

def get_forecast(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
        "hourly": ["soil_moisture_0_to_1cm"],
        "temperature_unit": "celsius",
        "timezone": "auto"
    }
    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    daily = response.Daily()
    dates = pd.date_range(
        start=pd.to_datetime(daily.Time(), unit="s", utc=True),
        end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=daily.Interval()), inclusive="left"
    ).date
    tmax = daily.Variables(0).ValuesAsNumpy()
    tmin = daily.Variables(1).ValuesAsNumpy()
    rain = daily.Variables(2).ValuesAsNumpy()
    tmean = [(tmax[i] + tmin[i]) / 2 for i in range(len(tmax))]

    hourly = response.Hourly()
    soil = hourly.Variables(0).ValuesAsNumpy()
    soil_avg_per_day = [round(float(soil[i*24:(i+1)*24].mean()), 3) for i in range(min(7, len(dates)))]

    return {
        "dates": dates,
        "tmax": tmax,
        "tmin": tmin,
        "tmean": tmean,
        "rain": rain,
        "soils": soil_avg_per_day
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
