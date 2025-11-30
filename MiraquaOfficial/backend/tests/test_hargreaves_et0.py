from scheduling.deterministic_scheduler import hargreaves_et0


def test_hargreaves_basic():
    # Example temps in °C
    et0 = hargreaves_et0(10.0, 25.0, 17.5)
    assert isinstance(et0, float)
    assert et0 > 0

def test_hargreaves_with_high_fahrenheit_values():
    # Provide Fahrenheit-like numbers and ensure function doesn't error
    # (we compute tmean in calling code; here we directly provide celsius values)
    et0 = hargreaves_et0(5.0, 30.0, 17.5)
    assert et0 > 0
