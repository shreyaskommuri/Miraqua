import os
import sys
from datetime import datetime, timedelta

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.schedule_utils import validate_schedule


def make_valid_schedule():
    today = datetime.utcnow().date()
    schedule = []
    for i in range(7):
        date = (today + timedelta(days=i)).strftime("%m/%d/%y")
        schedule.append({
            "day": f"Day {i+1}",
            "date": date,
            "liters": 2.5 + i * 0.5,
            "optimal_time": "06:00 AM",
        })
    return schedule


def test_validate_schedule_valid():
    sched = make_valid_schedule()
    valid, errors, sanitized = validate_schedule(sched)
    assert valid is True
    assert errors == []
    assert isinstance(sanitized, list) and len(sanitized) == 7
    for entry in sanitized:
        assert isinstance(entry["liters"], float)
        assert entry["date"].count('/') == 2


def test_validate_schedule_invalid_date_format():
    sched = make_valid_schedule()
    # Break date format
    sched[0]["date"] = "2025-11-28"
    valid, errors, sanitized = validate_schedule(sched)
    assert valid is False
    assert any('schema' in e or 'date' in e for e in errors) or errors != []


def test_validate_schedule_non_numeric_liters():
    sched = make_valid_schedule()
    sched[1]["liters"] = "abc"
    valid, errors, sanitized = validate_schedule(sched)
    assert valid is False
    assert any('liters' in e for e in errors)


def test_validate_time_normalization():
    sched = make_valid_schedule()
    sched[2]["optimal_time"] = "06:00"  # 24h/short format
    valid, errors, sanitized = validate_schedule(sched)
    assert valid is True
    # Should normalize to include AM/PM
    assert sanitized[2]["optimal_time"].endswith("AM") or sanitized[2]["optimal_time"].endswith("PM")
