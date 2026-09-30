import pytest
from paas_ingest import (
    UniversalTelematicsNormalizer, 
    TelematicsFormat, 
    IngestionMetricsTracker, 
    EdgeOTAManager
)

def test_j1939_can_bus_normalization():
    payload = {
        "sae_src_addr": "TRK-CAN-01",
        "spn_584_lat": 12.8732,
        "spn_585_lon": 75.6451,
        "spn_84_wheel_speed": 42.5,
        "spn_583_heading": 185.0,
        "spn_580_axle_load": 44.2,
        "spn_3350_brake_temp": 465.0,  # Critical thermal condition
        "spn_1087_pneu_press": 7.4,
        "spn_522_retarder_pct": 75.0,
        "spn_190_engine_rpm": 1820
    }
    normalized = UniversalTelematicsNormalizer.normalize(payload, "TENANT-VRL")
    
    assert normalized["format_detected"] == TelematicsFormat.J1939
    assert normalized["vehicle_id"] == "TRK-CAN-01"
    assert normalized["tenant_id"] == "TENANT-VRL"
    assert normalized["speed_kmh"] == 42.5
    assert normalized["gvw_tonnes"] == 44.2
    assert normalized["brake_rotor_temp_c"] == 465.0
    assert normalized["status"] == "CRITICAL_THERMAL_ALERT"
    assert normalized["retarder_active"] is True

def test_tata_fleetman_normalization():
    payload = {
        "vehicle_reg": "KA-19-D-7788",
        "loc_lat": 13.0011,
        "loc_lng": 76.0123,
        "spd": 65.0,
        "axle_weight_t": 32.0,
        "temp_brake": 280.0,
        "retarder_level": 50.0
    }
    normalized = UniversalTelematicsNormalizer.normalize(payload)
    
    assert normalized["format_detected"] == TelematicsFormat.TATA_FLEETMAN
    assert normalized["vehicle_id"] == "KA-19-D-7788"
    assert normalized["speed_kmh"] == 65.0
    assert normalized["brake_rotor_temp_c"] == 280.0
    assert normalized["status"] == "NORMAL"

def test_ashok_leyland_ialert_normalization():
    payload = {
        "vehId": "AL-TITAN-40",
        "telemetry": {
            "gps": {"lat": 12.92, "lon": 75.85, "course": 90.0},
            "kph": 38.0,
            "gvw": 40.0,
            "brakeRotorTemp": 340.0,
            "engineBrakeEngaged": True
        }
    }
    normalized = UniversalTelematicsNormalizer.normalize(payload)
    assert normalized["format_detected"] == TelematicsFormat.AL_IALERT
    assert normalized["vehicle_id"] == "AL-TITAN-40"
    assert normalized["status"] == "WARNING_BRAKE_HEAT"
    assert normalized["retarder_active"] is True

def test_metrics_tracker():
    tracker = IngestionMetricsTracker(max_buffer_size=10)
    frame = {
        "tenant_id": "TENANT-TEST",
        "vehicle_id": "V-01",
        "speed_kmh": 50.0
    }
    tracker.record_frame(frame)
    metrics = tracker.get_metrics()
    
    assert metrics["total_frames_ingested"] == 1
    assert metrics["active_tenants_count"] == 1
    assert "TENANT-TEST" in metrics["active_tenants"]
    assert len(tracker.get_recent_frames()) == 1

def test_edge_ota_deployment():
    ota = EdgeOTAManager()
    catalog = ota.get_catalog()
    assert "GHAT_DESCENT_RETARDER_AGGRESSIVE" in catalog
    
    result = ota.deploy_profile("KA-04-AB-9921", "GHAT_DESCENT_RETARDER_AGGRESSIVE", "TENANT-VRL")
    assert result["status"] == "SUCCESS"
    assert result["deployment"]["status"] == "ACKNOWLEDGED_BY_TCU"
    
    history = ota.get_history("KA-04-AB-9921")
    assert len(history) == 1
    assert history[0]["profile_key"] == "GHAT_DESCENT_RETARDER_AGGRESSIVE"
