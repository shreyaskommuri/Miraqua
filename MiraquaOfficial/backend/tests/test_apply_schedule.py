import os
import sys
import json
from datetime import datetime, timedelta

# Add backend dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import app_backend
from app_backend import app


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeTable:
    def __init__(self, name, store):
        self.name = name
        self.store = store
        self._payload = None

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def maybe_single(self):
        return self

    def single(self):
        return self

    def execute(self):
        # Return stored data for plot_schedules
        if self.name == 'plot_schedules':
            # existing schedule
            existing = self.store.get('plot_schedules', {}).get('original')
            if existing is not None:
                return FakeResult([{'schedule': existing}])
            return FakeResult([])
        return FakeResult([])

    def upsert(self, payload, on_conflict=None):
        # persist schedule into store
        if self.name == 'plot_schedules':
            self.store.setdefault('plot_schedules', {})['original'] = payload.get('schedule')
        return self

    def insert(self, payload):
        # record schedule_changes insertion
        self.store.setdefault('schedule_changes', []).append(payload)
        return self


class FakeSupabase:
    def __init__(self, store):
        self.store = store

    def table(self, name):
        return FakeTable(name, self.store)


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


def test_apply_schedule_missing_fields():
    client = app.test_client()
    resp = client.post('/apply_schedule', json={})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['success'] is False


def test_apply_schedule_invalid_schedule():
    # mount fake supabase
    store = {}
    app_backend.supabase = FakeSupabase(store)

    client = app.test_client()
    # invalid schedule (bad date format)
    bad_sched = make_valid_schedule()
    bad_sched[0]['date'] = '2025-11-28'

    resp = client.post('/apply_schedule', json={'plot_id': 'plot-1', 'schedule': bad_sched})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['success'] is False
    assert 'details' in data


def test_apply_schedule_success():
    store = {'plot_schedules': {'original': make_valid_schedule()}}
    app_backend.supabase = FakeSupabase(store)

    client = app.test_client()
    new_sched = make_valid_schedule()
    # change a liters value
    new_sched[2]['liters'] = 5.5

    resp = client.post('/apply_schedule', json={'plot_id': 'plot-1', 'schedule': new_sched, 'reason': 'test'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True

    # Ensure store updated
    assert store['plot_schedules']['original'][2]['liters'] == 5.5
    # Ensure change logged
    assert len(store.get('schedule_changes', [])) == 1
