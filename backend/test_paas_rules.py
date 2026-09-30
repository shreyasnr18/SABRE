import pytest
from paas_rules_engine import StreamComputeEngine, ServerlessRule

def test_rule_evaluation_critical_thermal():
    engine = StreamComputeEngine()
    
    # Frame with extreme thermal rotor stress
    critical_frame = {
        "tenant_id": "TENANT-VRL",
        "vehicle_id": "KA-04-AB-9921",
        "brake_rotor_temp_c": 520.0,
        "speed_kmh": 45.0,
        "gvw_tonnes": 38.0,
        "gradient_pct": -6.5,
        "latitude": 12.8732,
        "longitude": 75.6450
    }
    
    events = engine.process_frame(critical_frame)
    assert len(events) >= 1
    
    thermal_event = next(e for e in events if e["rule_id"] == "RULE-THERMAL-01")
    assert thermal_event["severity"] == "CRITICAL"
    assert thermal_event["vehicle_id"] == "KA-04-AB-9921"
    assert thermal_event["telemetry_snapshot"]["brake_rotor_temp_c"] == 520.0
    assert len(thermal_event["executed_actions"]) > 0

def test_rule_cooldown():
    engine = StreamComputeEngine()
    frame = {
        "tenant_id": "TENANT-VRL",
        "vehicle_id": "KA-04-AB-9921",
        "brake_rotor_temp_c": 490.0
    }
    
    # First trigger should fire
    events_1 = engine.process_frame(frame)
    assert len(events_1) == 1
    
    # Immediate second frame should be suppressed by cooldown
    events_2 = engine.process_frame(frame)
    assert len(events_2) == 0

def test_dynamic_custom_rule():
    engine = StreamComputeEngine()
    custom_rule = ServerlessRule(
        rule_id="CUSTOM-COLD-CHAIN-01",
        name="Pharma Cold Chain Cargo Alert",
        conditions=[{"metric": "cargo_temp_c", "operator": ">", "value": 8.0}],
        actions=[{"type": "ALERT_DISPATCH"}],
        severity="MEDIUM"
    )
    engine.register_rule(custom_rule)
    
    frame = {
        "tenant_id": "TENANT-PHARMA",
        "vehicle_id": "KA-19-P-1122",
        "cargo_temp_c": 11.5,
        "brake_rotor_temp_c": 110.0
    }
    
    events = engine.process_frame(frame)
    pharma_event = next((e for e in events if e["rule_id"] == "CUSTOM-COLD-CHAIN-01"), None)
    assert pharma_event is not None
    assert pharma_event["rule_name"] == "Pharma Cold Chain Cargo Alert"
