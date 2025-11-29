import types
import sys, os

# Ensure backend package root is on sys.path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from farmerAI import farmer_ai


def test_generate_ai_schedule_falls_back_to_deterministic(monkeypatch):
    # Monkeypatch the LLM adapter to simulate failure
    fake_adapter = types.SimpleNamespace()

    def fake_generate(prompt, model_names=None, max_tokens=None, temperature=None, timeout=None):
        return {"success": False, "error": "simulated failure"}

    fake_adapter.generate = fake_generate

    monkeypatch.setattr(farmer_ai, 'get_adapter', lambda: fake_adapter)

    # Create a minimal plot and empty forecasts to force fallback
    plot = {"crop": "tomato", "area": 50, "area_m2": 50}
    daily = []
    hourly = []
    logs = []

    sched = farmer_ai.generate_ai_schedule(plot, daily, hourly, logs)

    assert isinstance(sched, list), "Expected a list schedule"
    assert len(sched) == 7, "Fallback deterministic schedule should have 7 days"
    for day in sched:
        assert "liters" in day, "Each schedule entry must include liters"
        assert isinstance(day["liters"], (int, float)), "Liters should be numeric"
