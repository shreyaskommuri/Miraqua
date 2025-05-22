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