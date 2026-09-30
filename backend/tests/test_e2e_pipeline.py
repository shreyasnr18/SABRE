import pytest
from fastapi.testclient import TestClient
import asyncio
import sys
import os

# Append backend directory to path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api_server import app
from environment_connector import EnvironmentConnector
from sabre_orchestrator import SabreOrchestrator
from telemetry_streamer import fleet_manager
import database

client = TestClient(app)

def test_environment_connector():
    env_data = EnvironmentConnector.get_live_weather(12.97, 77.59)
    assert "temperature_c" in env_data
    assert "precipitation_mmh" in env_data
    assert isinstance(env_data["temperature_c"], float)

def test_sabre_orchestrator_pipeline():
    orchestrator = SabreOrchestrator()
    dispatch_order = {
        "scenario_preset": "pharma",
        "vehicle_id": "TEST-TRUCK-2",
        "height_meters": 3.0,
        "departure_hour": 14.0
    }
    result = orchestrator.run_pipeline(dispatch_order, use_live_environment=True)
    assert "execution_phases" in result
    assert "financial_savings_inr" in result
    assert "fines_inr" in result["financial_savings_inr"]

def test_osm_and_dispatch_api():
    response = client.post("/api/v1/simulate-dispatch", json={
        "scenario_preset": "standard",
        "vehicle_id": "TEST-TRUCK",
        "weight_tons": 25,
        "height_meters": 3.0,
        "departure_hour": 14.0
    })
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "CLEARED_FOR_DEPARTURE"
    assert "execution_phases" in data

def test_fleet_manager_reroute():
    # Setup a vehicle
    fleet_manager.reroute_vehicle_in_transit("MONSOON_FLOOD_SURGE", "13.10,80.21")
    # As long as it didn't throw an exception, basic integration passes
    assert True

def test_database_persistence():
    summary = database.get_summary()
    assert "total_dispatches" in summary
    history = database.get_history()
    assert isinstance(history, list)

def test_websocket_telemetry():
    with client.websocket_connect("/ws/v1/fleet-stream") as websocket:
        data = websocket.receive_json()
        assert "fleet" in data
        assert isinstance(data["fleet"], list)
