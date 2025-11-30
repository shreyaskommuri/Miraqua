import sys, os
from datetime import datetime, timedelta

# Ensure backend package root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import app_backend
from app_backend import app

import types


def make_schedule(base=2.5):
    today = datetime.utcnow().date()
    schedule = []
    for i in range(7):
        date = (today + timedelta(days=i)).strftime("%m/%d/%y")
        schedule.append({
            "day": f"Day {i+1}",
            "date": date,
            "liters": round(base + i * 0.1, 2),
            "optimal_time": "06:00 AM",
        })
    return schedule


class FakeTable:
    def __init__(self, name, store):
        self.name = name
        self.store = store
        self._mode = None

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        # record last filter for convenience
        self._last_eq = (args, kwargs)
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        # Indicate that the caller used .limit() so execute() can return a list
        self._mode = 'limit'
        return self

    def single(self):
        # Indicate that the caller used .single() so execute() can return a dict
        self._mode = 'single'
        return self

    def maybe_single(self):
        # maybe_single acts like single for our fake
        self._mode = 'single'
        return self

    def execute(self):
        # Return appropriate stored data depending on table
        if self.name == 'plots':
            # return single plot inserted earlier
            p = self.store.get('plots', {}).get('plot-1')
            return types.SimpleNamespace(data=p)
        if self.name == 'plot_schedules':
            ps = self.store.get('plot_schedules', {}).get('original')
            if ps is None:
                # Simulate no rows returned
                return types.SimpleNamespace(data=None)

            # Return shape based on whether caller used .single() or .limit()
            if self._mode == 'single':
                return types.SimpleNamespace(data={'schedule': ps, 'og_schedule': ps})
            else:
                # Default to list form for .limit() callers
                return types.SimpleNamespace(data=[{'schedule': ps, 'og_schedule': ps}])
        if self.name == 'watering_log':
            return types.SimpleNamespace(data=self.store.get('watering_log', []))
        if self.name == 'farmerAI_chatlog':
            return types.SimpleNamespace(data=self.store.get('farmerAI_chatlog', []))
        return types.SimpleNamespace(data=[])

    def upsert(self, payload, on_conflict=None):
        if self.name == 'plot_schedules':
            self.store.setdefault('plot_schedules', {})['original'] = payload.get('schedule')
        return self

    def insert(self, payload):
        if self.name == 'farmerAI_chatlog':
            self.store.setdefault('farmerAI_chatlog', []).append(payload)
        if self.name == 'schedule_changes':
            self.store.setdefault('schedule_changes', []).append(payload)
        if self.name == 'watering_log':
            self.store.setdefault('watering_log', []).append(payload)
        return self


class FakeSupabase:
    def __init__(self, store):
        self.store = store

    def table(self, name):
        return FakeTable(name, self.store)


def test_chat_update_and_apply(monkeypatch):
    # Prepare fake store with a plot and an existing schedule
    store = {
        'plots': {'plot-1': {'id': 'plot-1', 'crop': 'tomato', 'area': 50, 'lat': 35.0, 'lon': -120.0}},
        'plot_schedules': {'original': make_schedule(base=2.0)}
    }

    fake_sb = FakeSupabase(store)
    app_backend.supabase = fake_sb

    # Monkeypatch get_forecast to return minimal daily/hourly
    def fake_get_forecast(lat, lon):
        daily = []
        hourly = []
        return {"daily": daily, "hourly": hourly, "current": {}}

    monkeypatch.setattr(app_backend, 'get_forecast', fake_get_forecast)

    # Force LLM adapter to fail so deterministic fallback is produced
    # Force LLM adapter to fail so deterministic fallback is produced by replacing the global adapter factory
    class FakeAdapter:
        def generate(self, *args, **kwargs):
            return {"success": False, "error": "simulated"}

    import utils.llm_adapter as llm_adapter
    # Patch the shared adapter factory in utils and also in the imported farmer_ai module
    monkeypatch.setattr(llm_adapter, 'get_adapter', lambda: FakeAdapter())
    import farmer_ai as farmer_ai_mod
    monkeypatch.setattr(farmer_ai_mod, 'get_adapter', lambda: FakeAdapter())
    # Ensure farmer_ai uses the same fake supabase instance
    farmer_ai_mod.supabase = fake_sb

    client = app.test_client()

    # Send a chat command that modifies a schedule (e.g., set Day 3 to 5 liters)
    resp = client.post('/chat', json={
        'prompt': 'Set Day 3 to 5 liters',
        'plotId': 'plot-1',
        'chat_session_id': '00000000-0000-0000-0000-000000000000'
    })

    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data.get('schedule_updated') is True
    modified = data.get('modified_schedule')
    assert isinstance(modified, list)

    # Check deterministic alternative provided
    det = data.get('deterministic_alternative')
    assert isinstance(det, list)

    # Now apply the modified schedule via /apply_schedule
    resp2 = client.post('/apply_schedule', json={'plot_id': 'plot-1', 'schedule': modified, 'reason': 'test apply'})
    assert resp2.status_code == 200
    assert resp2.get_json().get('success') is True

    # Verify store updated and change logged
    assert store['plot_schedules']['original'][2]['liters'] == modified[2]['liters']
    assert len(store.get('schedule_changes', [])) == 1
