import pytest
from paas_storage import TimeSeriesLake, BlackboxArchiveStore
from paas_developer import ApiKeyManager, WebhookBus

def test_time_series_lake():
    lake = TimeSeriesLake(max_points_per_series=20)
    frame = {
        "vehicle_id": "TRK-001",
        "speed_kmh": 55.0,
        "brake_rotor_temp_c": 310.0,
        "brake_pressure_bar": 7.4
    }
    lake.record_frame(frame)
    
    speed_points = lake.query("TRK-001", "speed_kmh")
    assert len(speed_points) == 1
    assert speed_points[0]["value"] == 55.0

def test_blackbox_archive_creation():
    store = BlackboxArchiveStore()
    frames = [{"sec": 0, "speed": 40}]
    archive = store.create_snapshot(
        vehicle_id="TRK-999",
        incident_type="TEST_INCIDENT",
        location="NH-75 Km 120",
        frames=frames
    )
    assert archive["archive_id"].startswith("BB-INC-")
    assert len(archive["sha256_checksum"]) == 64  # SHA-256 hex length
    assert archive["storage_tier"] == "S3_STANDARD_IMMUTABLE"
    
    retrieved = store.get_archive(archive["archive_id"])
    assert retrieved is not None
    assert retrieved["vehicle_id"] == "TRK-999"

def test_api_key_management():
    key_mgr = ApiKeyManager()
    key = key_mgr.generate_key("TENANT-TEST", "Test Key", ["ingest:telemetry"])
    token = key["token"]
    
    validated = key_mgr.validate_key(token, "ingest:telemetry")
    assert validated is not None
    assert validated["tenant_id"] == "TENANT-TEST"
    
    # Should reject unauthorized scope
    invalid_scope = key_mgr.validate_key(token, "admin:delete")
    assert invalid_scope is None

def test_webhook_event_dispatch():
    bus = WebhookBus()
    bus.register_subscription(
        tenant_id="TENANT-ACME",
        url="https://acme.org/webhook",
        topics=["incident.thermal_runaway"],
        secret="test_secret_123"
    )
    
    deliveries = bus.dispatch_event("incident.thermal_runaway", {"temp": 500})
    assert len(deliveries) >= 1
    acme_delivery = next(d for d in deliveries if d["tenant_id"] == "TENANT-ACME")
    assert acme_delivery["status"] == "DELIVERED"
    assert acme_delivery["signature_header"].startswith("sha256=")
