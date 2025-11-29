import re
from jsonschema import validate, ValidationError

# JSON Schema for a single day entry
DAY_SCHEMA = {
    "type": "object",
    "properties": {
        "day": {"type": "string"},
        "date": {"type": "string", "pattern": r"^\d{2}/\d{2}/\d{2}$"},
        "liters": {"type": ["number", "integer", "string"], "minimum": 0},
        "optimal_time": {"type": "string"},
        "note": {"type": "string"},
        "explanation": {"type": "string"}
    },
    "required": ["day", "date", "liters"],
    "additionalProperties": True
}

# Schema for full schedule (array of 7 day objects)
SCHEDULE_SCHEMA = {
    "type": "array",
    "minItems": 7,
    "maxItems": 7,
    "items": DAY_SCHEMA
}


def is_valid_time_format(t: str) -> bool:
    # Accept formats like '05:00 AM' or '6:00 PM' or '06:00'
    if not t:
        return False
    t = t.strip()
    patterns = [r"^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$", r"^\d{1,2}:\d{2}$"]
    for p in patterns:
        if re.match(p, t):
            return True
    return False


def validate_schedule(schedule):
    """Validate and sanitize a schedule object.

    Returns: (valid: bool, errors: list, sanitized_schedule)
    """
    errors = []
    sanitized = []

    try:
        validate(instance=schedule, schema=SCHEDULE_SCHEMA)
    except ValidationError as e:
        errors.append(f"schema: {str(e.message)}")
        return False, errors, None

    for i, day in enumerate(schedule):
        entry = dict(day)
        # Ensure liters is numeric
        try:
            entry["liters"] = float(entry.get("liters", 0))
        except Exception:
            errors.append(f"day {i+1}: liters not numeric")
            continue

        # Validate time format if present
        if entry.get("optimal_time"):
            t = entry["optimal_time"].strip()
            # If time is in short HH:MM form, normalize to include AM/PM
            if re.match(r"^\d{1,2}:\d{2}$", t):
                hour = int(t.split(":")[0])
                suffix = "AM" if hour < 12 else "PM"
                entry["optimal_time"] = f"{t} {suffix}"
            elif not is_valid_time_format(entry["optimal_time"]):
                errors.append(f"day {i+1}: invalid optimal_time format")
                entry["optimal_time"] = ""

        sanitized.append(entry)

    if errors:
        return False, errors, sanitized

    return True, [], sanitized
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
