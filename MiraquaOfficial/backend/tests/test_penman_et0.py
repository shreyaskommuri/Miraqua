from scheduling.deterministic_scheduler import penman_monteith_et0


def test_penman_with_complete_daily():
    daily = {
        "temp_min": 12.0,
        "temp_max": 25.0,
        "temp_avg": 18.5,
        "wind": 2.0,
        "rh_mean": 60.0,
        "rad": 15.0
    }
    et0 = penman_monteith_et0(daily)
    assert et0 is not None
    assert et0 >= 0


def test_penman_missing_fields():
    daily = {"temp_min": 12.0, "temp_max": 25.0}
    et0 = penman_monteith_et0(daily)
    assert et0 is None
