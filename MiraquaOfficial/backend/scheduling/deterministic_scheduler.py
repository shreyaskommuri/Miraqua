from datetime import date, timedelta
from typing import List, Dict, Optional

from utils.forecast_utils import calculate_schedule


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
