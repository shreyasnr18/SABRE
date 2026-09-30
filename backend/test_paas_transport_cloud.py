import pytest
from paas_transport_cloud import TransportCloudEngine

def test_default_inactive_catalog():
    cloud = TransportCloudEngine()
    catalog = cloud.get_catalog()
    
    assert catalog["total_services"] == 50
    # No service should be active by default!
    assert catalog["active_services"] == 0
    assert catalog["standby_services"] == 50
    assert len(catalog["categories"]) == 8
    
    # Check that all individual services are in INACTIVE state
    for cat_name, svcs in catalog["categories"].items():
        for s in svcs:
            assert s["status"] == "INACTIVE"
            assert s["operational_metric"] == "Standby / Not Initialized"
            assert s["provisioned_at"] is None

def test_service_configuration_and_provisioning():
    cloud = TransportCloudEngine()
    
    # Check detail for COMP-01
    detail = cloud.get_service_detail("COMP-01")
    assert detail is not None
    assert detail["status"] == "INACTIVE"
    assert "t4.heavy" in str(detail["config_schema"])
    
    # Configure COMP-01
    cfg_res = cloud.configure_service("COMP-01", {
        "instance_tier": "c6.articulated (55T / 16vCPU)",
        "edge_zone": "kar-sakleshpur-node-09"
    })
    assert cfg_res["status"] == "SUCCESS"
    assert cfg_res["service"]["current_config"]["instance_tier"] == "c6.articulated (55T / 16vCPU)"
    
    # Provision COMP-01
    prov_res = cloud.provision_service("COMP-01")
    assert prov_res["status"] == "SUCCESS"
    assert prov_res["service"]["status"] == "ACTIVE"
    assert prov_res["service"]["provisioned_at"] is not None
    assert "Provisioned" in prov_res["service"]["operational_metric"]
    
    # Check catalog reflects 1 active service
    cat = cloud.get_catalog()
    assert cat["active_services"] == 1
    assert cat["standby_services"] == 49
    
    # Check audit trail recorded the provisioning
    audit_logs = cloud.get_audit_trail_logs(5)
    assert any(log["event_name"] == "ProvisionInfrastructureService" and log["service"] == "COMP-01" for log in audit_logs)

def test_service_decommission():
    cloud = TransportCloudEngine()
    cloud.provision_service("DB-25")
    assert cloud.get_service_detail("DB-25")["status"] == "ACTIVE"
    
    decom_res = cloud.decommission_service("DB-25")
    assert decom_res["status"] == "SUCCESS"
    assert decom_res["service"]["status"] == "INACTIVE"
    assert decom_res["service"]["operational_metric"] == "Standby / Not Initialized"

def test_service_diagnostic_action():
    cloud = TransportCloudEngine()
    
    # Test DB-25 proximity radar action
    res_db = cloud.execute_service_action("DB-25", "ExecuteProximityRadarScan", {"lat": 12.8732, "lon": 75.6450})
    assert res_db["status"] == "SUCCESS"
    assert "nearest_ramp" in res_db["result"]["radar_result"]
    assert res_db["result"]["radar_result"]["lookup_latency_ms"] < 2.0
    
    # Test AI-49 predictive thermal model action
    res_ai = cloud.execute_service_action("AI-49", "RunPredictiveThermalModel", {
        "current_temp": 420.0,
        "speed": 52.0,
        "weight": 42.0,
        "gradient": -6.5,
        "retarder": True
    })
    assert res_ai["status"] == "SUCCESS"
    assert "trajectory_15min" in res_ai["result"]["simulation_output"]

def test_predictive_brake_overrun_model():
    cloud = TransportCloudEngine()
    prediction = cloud.predict_brake_thermal_runaway(
        current_temp_c=420.0,
        speed_kmh=55.0,
        gvw_tonnes=42.0,
        gradient_pct=-7.0,
        retarder_engaged=False
    )
    
    assert prediction["net_heating_rate_c_per_min"] > 0
    assert len(prediction["trajectory_15min"]) == 6
    assert prediction["trajectory_15min"][-1]["projected_temp_c"] > 450.0
    assert prediction["runaway_probability_pct"] > 50.0
    assert "ENGAGE STAGE 3 RETARDER" in prediction["recommendation"]

def test_predictive_brake_with_retarder_mitigation():
    cloud = TransportCloudEngine()
    prediction = cloud.predict_brake_thermal_runaway(
        current_temp_c=250.0,
        speed_kmh=40.0,
        gvw_tonnes=42.0,
        gradient_pct=-5.0,
        retarder_engaged=True
    )
    assert prediction["net_heating_rate_c_per_min"] < 10.0
    assert prediction["runaway_probability_pct"] < 30.0

def test_corridor_dynamic_failover():
    cloud = TransportCloudEngine()
    result = cloud.trigger_corridor_failover("corridor-bengaluru-mangalore", "MONSOON_LANDSLIDE")
    assert result["status"] == "SUCCESS"
    assert result["active_corridor"] == "NH-275 (Sampaje / Madikeri)"
