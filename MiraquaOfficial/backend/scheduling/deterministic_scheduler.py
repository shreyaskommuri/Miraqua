from datetime import date, timedelta
from typing import List, Dict, Optional

from utils.forecast_utils import calculate_schedule
import math


def penman_monteith_et0(daily: dict) -> float:
    """
    FAO-56 Penman-Monteith estimator for reference evapotranspiration (mm/day).

    Expects a `daily` dict with keys (ideally):
      - tmean (°C) or temp_avg
      - tmax (°C) or temp_max
      - tmin (°C) or temp_min
      - wind (m/s) or wind_speed
      - rh_mean (relative humidity as 0-100) or mean_humidity
      - rad (MJ/m2/day) or radiation

    If required inputs are missing, returns None.
    """
    try:
        # Temperatures
        tmean = daily.get("tmean") or daily.get("temp_avg") or daily.get("temp")
        tmax = daily.get("temp_max") or daily.get("tmax") or daily.get("temp_max")
        tmin = daily.get("temp_min") or daily.get("tmin") or daily.get("temp_min")

        if tmean is None and tmax is not None and tmin is not None:
            tmean = (float(tmax) + float(tmin)) / 2.0

        if tmean is None or tmax is None or tmin is None:
            return None

        # Wind speed at 2 m
        wind = daily.get("wind") or daily.get("wind_speed") or daily.get("wind_m_s")
        if isinstance(wind, dict):
            wind = wind.get("speed")

        # Relative humidity (mean)
        rh = daily.get("rh_mean") or daily.get("mean_humidity") or daily.get("humidity")

        # Radiation in MJ/m2/day
        rad = daily.get("rad") or daily.get("radiation") or daily.get("solar_radiation") or daily.get("radiation_mj")

        # All required
        if wind is None or rh is None or rad is None:
            return None

        # Convert to floats
        tmean = float(tmean)
        tmax = float(tmax)
        tmin = float(tmin)
        wind = float(wind)
        rh = float(rh)
        rad = float(rad)

        # Constants
        G = 0.0  # soil heat flux for daily timestep
        ea = (rh / 100.0) * (0.6108 * math.exp((17.27 * tmean) / (tmean + 237.3)))
        es_tmax = 0.6108 * math.exp((17.27 * tmax) / (tmax + 237.3))
        es_tmin = 0.6108 * math.exp((17.27 * tmin) / (tmin + 237.3))
        es = (es_tmax + es_tmin) / 2.0

        # slope of vapor pressure curve (kPa/°C)
        delta = (4098 * (0.6108 * math.exp((17.27 * tmean) / (tmean + 237.3)))) / ((tmean + 237.3) ** 2)

        # psychrometric constant gamma (kPa/°C)
        P = 101.3  # approximate atmospheric pressure (kPa)
        gamma = 0.000665 * P

        # Net radiation Rn already in MJ/m2/day
        Rn = rad

        # FAO-56 PM equation (mm/day)
        num = 0.408 * delta * (Rn - G) + gamma * (900.0 / (tmean + 273.0)) * wind * (es - ea)
        den = delta + gamma * (1 + 0.34 * wind)
        et0 = num / den
        return round(max(0.0, float(et0)), 3)
    except Exception:
        return None

def hargreaves_et0(tmin_c: float, tmax_c: float, tmean_c: float) -> float:
    """
    Simple Hargreaves ET0 estimator (mm/day).

    ET0 = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra
    We don't have Ra (extraterrestrial radiation) here; use simplified proportional estimate
    that scales with temperature range.
    This is intentionally simple — it's a heuristic fallback when full inputs are missing.
    """
    try:
        delta = max(0.0, tmax_c - tmin_c)
        et0 = 0.0023 * (tmean_c + 17.8) * (delta ** 0.5) * 20.0
        return round(max(0.05, et0), 3)
    except Exception:
        return 2.0


def generate_deterministic_schedule(
    plot: Dict,
    et0_forecast: Optional[List[float]] = None,
    crop_kc: float = None,
    days: int = 7,
    efficiency: float = 0.8,
    preferred_time: str = "06:00 AM",
    hourly_blocks: Optional[List[List[Dict]]] = None,
):
    """
    Generate a deterministic watering schedule.

    Behavior:
      - If `hourly_blocks` is provided, defer to `utils.forecast_utils.calculate_schedule` which
        contains more advanced logic (Kc, root depth, soil moisture, optimal time selection).
      - Otherwise, use a simple ET0 × Kc → liters conversion using `et0_forecast`.

    Args:
      plot: dict that must include `area_m2` (float) or `area`.
      et0_forecast: list of daily ET0 values in mm/day (optional if hourly_blocks provided).
      crop_kc: optional crop coefficient; falls back to `plot['crop_kc']` or 0.9.
      days: number of days to produce (default 7).
      efficiency: irrigation application efficiency fraction (0-1).
      preferred_time: default time string used when schedule generator doesn't pick a time.
      hourly_blocks: optional list of hourly blocks per day to enable advanced calculation.

    Returns:
      List[dict] with keys `day`, `date`, `liters`, `optimal_time`.
    """
    area = plot.get("area_m2") or plot.get("area")
    if area is None:
        raise ValueError("plot must include 'area_m2' or 'area'")

    kc = crop_kc if crop_kc is not None else plot.get("crop_kc", 0.9)

    # If hourly blocks are available, prefer the richer calculation
    if hourly_blocks:
        try:
            sched, used_kc = calculate_schedule(
                crop=plot.get("crop", "unknown"),
                area=area,
                age=plot.get("age_at_entry", 0.0),
                lat=plot.get("lat", None),
                lon=plot.get("lon", None),
                flex_type=plot.get("flex_type", "daily"),
                hourly_blocks=hourly_blocks,
                soil_forecast=plot.get("soil_forecast", None),
            )
            # `calculate_schedule` returns a list of dicts (day/date/liters/optimal_time)
            return sched
        except Exception:
            # Fall back to the simpler estimator below
            pass

    # Simple ET0-based estimator
    schedule = []
    start = date.today()
    if not et0_forecast:
        et0_forecast = [2.0] * days

    # If daily dicts were passed in et0_forecast (e.g., from forecast_utils.daily), try to compute ET0
    normalized_et0 = []
    for i in range(days):
        if i < len(et0_forecast):
            val = et0_forecast[i]
            if isinstance(val, dict):
                # try to compute from temp_min/temp_max/temp_avg
                tmin = val.get("temp_min")
                tmax = val.get("temp_max")
                tavg = val.get("temp_avg") or ((tmin + tmax) / 2 if tmin is not None and tmax is not None else None)
                if tmin is not None and tmax is not None and tavg is not None:
                    # convert °F to °C if numbers look like Fahrenheit (>= 40)
                    try:
                        if tavg > 45:
                            tmin_c = (float(tmin) - 32.0) * 5.0 / 9.0
                            tmax_c = (float(tmax) - 32.0) * 5.0 / 9.0
                            tavg_c = (float(tavg) - 32.0) * 5.0 / 9.0
                        else:
                            tmin_c = float(tmin)
                            tmax_c = float(tmax)
                            tavg_c = float(tavg)
                        eto = hargreaves_et0(tmin_c, tmax_c, tavg_c)
                        normalized_et0.append(eto)
                        continue
                    except Exception:
                        pass
                # If dict includes explicit et0/eto
                eto_val = val.get("et0") or val.get("eto")
                if eto_val is not None:
                    try:
                        normalized_et0.append(float(eto_val))
                        continue
                    except:
                        pass
            try:
                normalized_et0.append(float(val))
            except Exception:
                normalized_et0.append(2.0)
        else:
            normalized_et0.append(normalized_et0[-1] if normalized_et0 else 2.0)

    et0_forecast = normalized_et0

    for i in range(days):
        et0 = float(et0_forecast[i]) if i < len(et0_forecast) else float(et0_forecast[-1])
        daily_mm = et0 * kc
        # 1 mm over 1 m^2 = 1 liter
        liters = daily_mm * area * efficiency

        schedule.append(
            {
                "day": f"Day {i+1}",
                "date": (start + timedelta(days=i)).strftime("%m/%d/%y"),
                "liters": round(liters, 2),
                "optimal_time": preferred_time,
            }
        )

    return schedule
