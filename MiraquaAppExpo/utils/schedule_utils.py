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
