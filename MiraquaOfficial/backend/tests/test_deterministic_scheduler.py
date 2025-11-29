from datetime import date, timedelta

import pytest

from scheduling.deterministic_scheduler import generate_deterministic_schedule


def test_generate_basic_schedule():
    plot = {"area_m2": 100}
    et0 = [5] * 7
    sched = generate_deterministic_schedule(
        plot, et0, crop_kc=0.9, days=7, efficiency=0.8, preferred_time="06:00 AM"
    )

    assert len(sched) == 7
    expected = 5 * 0.9 * 100 * 0.8
    for i, entry in enumerate(sched):
        assert entry["date"] == (date.today() + timedelta(days=i)).strftime("%m/%d/%y")
        assert abs(entry["liters"] - expected) < 0.01
        assert entry["optimal_time"] == "06:00 AM"


def test_missing_area_raises():
    with pytest.raises(ValueError):
        generate_deterministic_schedule({}, [5] * 7)
