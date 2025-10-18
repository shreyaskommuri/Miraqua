import requests
import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime, timedelta
import numpy as np
from utils.schedule_utils import cap_liters
from utils.advanced_irrigation_utils import AdvancedIrrigationCalculator, convert_weather_data, create_soil_data_from_plot

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

import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_forecast(lat, lon):
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "units": "imperial",  # °F and mph
            "appid": OPENWEATHER_API_KEY
        }

        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
        print("✅ OpenWeather forecast fetched successfully")

        # Extract next 24 hours
        hourly = data.get("list", [])[:24]

        return {
            "hourly": hourly
        }

    except Exception as e:
        print(f"❌ Failed to fetch OpenWeather forecast: {e}")
        return {"hourly": []}



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
    """
    Calculate irrigation schedule using advanced scientific methods
    """
    try:
        # Initialize advanced calculator
        advanced_calculator = AdvancedIrrigationCalculator()
        
        # Convert age from months to days
        age_days = age * 30.44
        
        # Create plot data
        plot_data = {
            'crop': crop,
            'area': area,
            'age_days': age_days,
            'lat': lat,
            'lon': lon,
            'soil_type': 'loam',  # Default, should be provided by farmer
            'drainage': 'moderate',  # Default, should be provided by farmer
            'current_moisture': 0.3  # Default, should be measured
        }
        
        # Create soil data
        soil_data = create_soil_data_from_plot(plot_data)
        
        # Convert weather data format
        weather_forecast = []
        if hourly_blocks:
            for day_blocks in hourly_blocks:
                if day_blocks:
                    # Convert hourly data to daily weather
                    temps = [h.get("main", {}).get("temp", 20) for h in day_blocks]
                    humidities = [h.get("main", {}).get("humidity", 50) for h in day_blocks]
                    winds = [h.get("wind", {}).get("speed", 2) for h in day_blocks]
                    pressures = [h.get("main", {}).get("pressure", 1013) for h in day_blocks]
                    clouds = [h.get("clouds", {}).get("all", 50) for h in day_blocks]
                    rains = [h.get("rain", {}).get("1h", 0) for h in day_blocks]
                    
                    daily_weather = {
                        'temp_c': np.mean(temps) - 273.15,  # Convert Kelvin to Celsius
                        'humidity': np.mean(humidities),
                        'wind_speed': np.mean(winds),
                        'pressure': np.mean(pressures) / 10.0,  # Convert hPa to kPa
                        'solar_radiation': max(5, 20 - np.mean(clouds) * 0.2),  # Estimate from cloud cover
                        'rainfall': np.sum(rains) / 10.0  # Convert mm/h to mm
                    }
                else:
                    # Default weather if no data
                    daily_weather = {
                        'temp_c': 20.0,
                        'humidity': 50.0,
                        'wind_speed': 2.0,
                        'pressure': 101.3,
                        'solar_radiation': 15.0,
                        'rainfall': 0.0
                    }
                weather_forecast.append(daily_weather)
        else:
            # Create default weather forecast
            weather_forecast = [{
                'temp_c': 20.0,
                'humidity': 50.0,
                'wind_speed': 2.0,
                'pressure': 101.3,
                'solar_radiation': 15.0,
                'rainfall': 0.0
            } for _ in range(7)]
        
        # Generate advanced schedule
        schedule = advanced_calculator.generate_advanced_schedule(
            plot_data, weather_forecast, soil_data, []
        )
        
        # Calculate average Kc for reporting
        kc = advanced_calculator.calculate_dynamic_kc(crop, age_days, weather_forecast[0], soil_data)
        
        print(f"[ADVANCED DEBUG] crop={crop}, age={age:.1f} months → kc={kc}")
        print(f"[ADVANCED DEBUG] Generated {len(schedule)} days of advanced schedule")
        
        return schedule, kc
        
    except Exception as e:
        print(f"Error in advanced schedule calculation: {e}")
        # Fallback to original method
        return calculate_schedule_fallback(crop, area, age, lat, lon, flex_type, hourly_blocks, soil_forecast)


def calculate_schedule_fallback(crop, area, age, lat, lon, flex_type="daily", hourly_blocks=None, soil_forecast=None):
    """
    Fallback to original hardcoded method if advanced calculation fails
    """
    if not hourly_blocks:
        hourly_blocks = [[] for _ in range(7)]
    if not soil_forecast:
        print("no soil forecast provided, using default values")
        soil_forecast = [0.25] * 7

    kc = dynamic_kc(crop, age)
    print(f"[FALLBACK DEBUG] crop={crop}, age={age:.1f} months → kc={kc}")

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
            print(f"[FALLBACK DEBUG] Day {day_index + 1}: avg_temp_c={avg_temp_c:.2f} ET₀={et0:.3f}, Moisture={avg_moisture:.3f}")
        else:
            et0 = 0.15
            print(f"[FALLBACK DEBUG] Day {day_index + 1}: ET₀={et0:.3f}, Moisture={avg_moisture:.3f} (avg_temp_c not available)")

        if avg_moisture > moisture_threshold:
            liters = 0.0
            optimal_time = "Skipped"
        else:
            mm_needed = max(0, (target_moisture - avg_moisture) * root_depth_mm)
            base_liters = mm_needed * area * 0.1
            liters = round(base_liters * kc * et0 / 0.15, 2)
            print(f"[FALLBACK DEBUG] Day {day_index + 1}: mm_needed={mm_needed:.2f}, Kc={kc:.2f}, base_liters={base_liters:.2f}, FINAL={liters}L")
            optimal_time = find_optimal_time(hourly_day)

        date_obj = today + timedelta(days=day_index)
        schedule.append({
            "day": f"Day {day_index + 1}",
            "date": date_obj.strftime("%m/%d/%y"),
            "liters": liters,
            "optimal_time": optimal_time
        })
    return schedule, kc
