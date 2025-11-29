from datetime import datetime, timedelta
import pytest

from scheduling.deterministic_scheduler import generate_deterministic_schedule


def make_hourly_block_for_day(day_index):
    base = int((datetime.utcnow() + timedelta(days=day_index)).timestamp())
    # Create 24 hourly mock entries with mild temps and low rain
    blocks = []
    for h in range(24):
        blocks.append({
            "dt": base + h * 3600,
            "main": {"temp": 68.0},
            "wind": {"speed": 1.0},
            "clouds": {"all": 20},
            "pop": 0.0
        })
    return blocks


def test_deterministic_with_hourly_blocks():
    plot = {"area_m2": 50, "crop": "tomato", "age_at_entry": 2}
    hourly_blocks = [make_hourly_block_for_day(i) for i in range(7)]

    sched = generate_deterministic_schedule(plot, hourly_blocks=hourly_blocks, days=7)

    assert isinstance(sched, list)
    assert len(sched) == 7
    for day in sched:
        assert "liters" in day
        assert day["liters"] >= 0
