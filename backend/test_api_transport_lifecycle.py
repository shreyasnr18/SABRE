import pytest
from fastapi.testclient import TestClient
from api_server import app

client = TestClient(app)

def test_api_trips_list():
    response = client.get("/api/v1/transport-lifecycle/trips")
    assert response.status_code == 200
    trips = response.json()
    assert len(trips) >= 3

def test_api_trip_detail():
    response = client.get("/api/v1/transport-lifecycle/trips/TRIP-IN-2026-081")
    assert response.status_code == 200
    data = response.json()
    assert data["trip_id"] == "TRIP-IN-2026-081"
    assert "ulip_compliance" in data

def test_api_verify_ulip():
    payload = {
        "trip_id": "TRIP-IN-2026-081",
        "vehicle_no": "KA-01-AB-1234",
        "driver_dl": "KA0120150049210",
        "is_hazardous": False
    }
    response = client.post("/api/v1/transport-lifecycle/verify-ulip", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "SUCCESS"
    assert res["ulip_compliance"]["vahan_verified"] is True

def test_api_four_copy_bilty():
    response = client.get("/api/v1/transport-lifecycle/bilty/TRIP-IN-2026-081")
    assert response.status_code == 200
    bilty_bundle = response.json()
    assert len(bilty_bundle["four_copies"]) == 4

def test_api_trip_sheet_advances():
    payload = {
        "trip_id": "TRIP-IN-2026-081",
        "gross_freight": 845000.0,
        "cash_bata_inr": 45000.0,
        "fuel_card_inr": 485000.0,
        "fastag_inr": 61500.0,
        "fuel_card_provider": "IndianOil XTRAPOWER",
        "is_market_broker": False,
        "form_15g_collected": False
    }
    response = client.post("/api/v1/transport-lifecycle/trip-sheet", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "SUCCESS"

def test_api_employee_khata_and_pnl():
    res_khata = client.get("/api/v1/transport-lifecycle/employee-khata")
    assert res_khata.status_code == 200
    assert len(res_khata.json()) >= 5

    res_pnl = client.get("/api/v1/transport-lifecycle/truck-pnl")
    assert res_pnl.status_code == 200
    assert len(res_pnl.json()) >= 3
