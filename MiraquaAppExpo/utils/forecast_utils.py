import requests
import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry

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
