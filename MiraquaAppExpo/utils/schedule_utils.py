import os
import json

SCHEDULES_FILE = "plot_schedules.json"

def save_schedule(plot_id, schedule):
    try:
        if os.path.exists(SCHEDULES_FILE):
            with open(SCHEDULES_FILE, "r") as f:
                all_schedules = json.load(f)
        else:
            all_schedules = {}

        all_schedules[plot_id] = schedule

        with open(SCHEDULES_FILE, "w") as f:
            json.dump(all_schedules, f, indent=2)
    except Exception as e:
        print("Failed to save schedule:", e)

def load_schedule(plot_id):
    if os.path.exists(SCHEDULES_FILE):
        with open(SCHEDULES_FILE, "r") as f:
            all_schedules = json.load(f)
        return all_schedules.get(plot_id, [])
    return []

CROP_MAX_LPD = {
    "tomato": 1.5,   # liters per m² per day
    "lettuce": 1.2,
    "wheat": 1.0,
    "corn": 2.0,
    "almond": 3.0,
    "alfalfa": 2.5,
    "default": 1.5
}

def cap_liters(crop, liters, area):
    """Limit liters to a realistic maximum based on crop and area."""
    max_lpd = CROP_MAX_LPD.get(crop.lower(), CROP_MAX_LPD["default"])
    max_liters = round(max_lpd * area, 2)
    return min(liters, max_liters)
