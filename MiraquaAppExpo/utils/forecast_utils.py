import requests
import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime, timedelta
import numpy as np
from utils.schedule_utils import cap_liters

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
    "grass": 1.1,
    "default": 0.95
}

def get_lat_lon(zip_code):
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={zip_code}&country=US&count=1"
    res = requests.get(geo_url).json()
    if res.get("results"):
        lat = res["results"][0]["latitude"]
        lon = res["results"][0]["longitude"]
        print(f"📍 ZIP {zip_code} → lat: {lat}, lon: {lon}")
        return lat, lon
    return None, None

def get_forecast(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "soil_moisture_0_to_1cm", "evapotranspiration"],
        "temperature_unit": "celsius",
        "timezone": "auto"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        print("✅ Forecast fetched successfully")
        return {
            "hourly": {
                "temperature_2m": data.get("hourly", {}).get("temperature_2m", []),
                "soil_moisture_0_to_1cm": data.get("hourly", {}).get("soil_moisture_0_to_1cm", []),
                "evapotranspiration": data.get("hourly", {}).get("evapotranspiration", [])
            }
        }
    except Exception as e:
        print("❌ Forecast fetch failed:", e)
        return {"hourly": {}}

def dynamic_kc(crop, age_months):
    crop = crop.lower()
    stages = {
        "tomato": [0.6, 0.95, 1.15, 0.8],
        "corn": [0.4, 0.9, 1.15, 0.75],
        "wheat": [0.3, 0.8, 1.0, 0.4],
        "alfalfa": [0.7, 1.0, 1.2, 0.9],
        "lettuce": [0.6, 0.85, 1.0, 0.8],
        "almond": [0.4, 0.85, 1.05, 0.85],
        "grass": [0.5, 0.95, 1.1, 0.8],
        "default": [0.5, 0.85, 1.05, 0.8]
    }
    kc_stages = stages.get(crop, stages["default"])
    if age_months <= 1:
        return kc_stages[0]
    elif age_months <= 3:
        return kc_stages[1]
    elif age_months <= 6:
        return kc_stages[2]
    else:
        return kc_stages[3]

def find_optimal_time(hourly_day):
    best_score = float("inf")
    best_hour = 6  # fallback

    for h in hourly_day:
        temp = h.get("main", {}).get("temp", 20)
        wind = h.get("wind", {}).get("speed", 1.5)
        clouds_raw = h.get("clouds", 50)
        clouds = clouds_raw.get("all", 50) if isinstance(clouds_raw, dict) else clouds_raw
        rain = h.get("pop", 0)
        dt = h.get("dt")
        hour = datetime.fromtimestamp(dt).hour if dt else 6

        if rain > 0.2 or temp < 2:
            continue

        sunlight = 100 - clouds
        score = temp * 0.4 + wind * 0.3 + sunlight * 0.2

        if 4 <= hour <= 8:
            score *= 0.8  # morning bonus

        if score < best_score:
            best_score = score
            best_hour = hour

    am_pm = "AM" if best_hour < 12 else "PM"
    hour_12 = best_hour % 12 or 12
    return f"{hour_12:02d}:00 {am_pm}"

def calculate_schedule(crop, area, age, lat, lon, flex_type="daily", hourly_blocks=None, soil_forecast=None):
    if not hourly_blocks:
        hourly_blocks = [[] for _ in range(7)]
    if not soil_forecast:
        print("no soil forecast provided, using default values")
        soil_forecast = [0.25] * 7

    kc = dynamic_kc(crop, age)
    today = datetime.utcnow()
    root_depth_mm = 300
    moisture_threshold = 0.28
    target_moisture = 0.42

    schedule = []

    for day_index in range(7):
        hourly_day = hourly_blocks[day_index] if day_index < len(hourly_blocks) else []
        avg_moisture = soil_forecast[day_index] if day_index < len(soil_forecast) else 0.25
        temps = [h.get("main", {}).get("temp", 20) for h in hourly_day]

        avg_temp_c = sum(temps) / len(temps) if temps else 20.0

        if len(temps) >= 12:
            et0 = 0.0023 * ((avg_temp_c + 17.8) * np.sqrt(avg_temp_c - 10)) * 0.408 if avg_temp_c > 10 else 0.15
            print(f"[DEBUG] Day {day_index + 1}: avg_temp_c={avg_temp_c:.2f} ET₀={et0:.3f}, Moisture={avg_moisture:.3f}")
        else:
            et0 = 0.15
            print(f"[DEBUG] Day {day_index + 1}: ET₀={et0:.3f}, Moisture={avg_moisture:.3f} (avg_temp_c not available)")

        if avg_moisture > moisture_threshold:
            liters = 0.0
            optimal_time = "Skipped"
        else:
            mm_needed = max(0, (target_moisture - avg_moisture) * root_depth_mm)
            base_liters = mm_needed * area * 0.1
            liters = round(base_liters * kc * et0 / 0.15, 2)
            print(f"[DEBUG] Day {day_index + 1}: mm_needed={mm_needed:.2f}, Kc={kc:.2f}, base_liters={base_liters:.2f}, FINAL={liters}L")
            optimal_time = find_optimal_time(hourly_day)

        date_obj = today + timedelta(days=day_index)
        schedule.append({
            "day": f"Day {day_index + 1}",
            "date": date_obj.strftime("%m/%d/%y"),
            "liters": liters,
            "optimal_time": optimal_time
        })
    return schedule, kc
