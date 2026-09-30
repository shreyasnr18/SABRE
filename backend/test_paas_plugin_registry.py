import pytest
from paas_plugin_registry import paas_plugin_registry

def test_list_all_plugins():
    plugins = paas_plugin_registry.list_all_plugins()
    assert len(plugins) == 17
    plugin_ids = [p["plugin_id"] for p in plugins]
    assert "brake_stress_indexer" in plugin_ids
    assert "cold_chain_monitor" in plugin_ids
    assert "fastag_optimizer" in plugin_ids
    assert "canopy_clearance" in plugin_ids
    assert "vam_allocator" in plugin_ids

def test_execute_plugin_success():
    res = paas_plugin_registry.execute_plugin(
        plugin_id="fastag_optimizer",
        payload={"vehicle_id": "KA-01-AB-1234"},
        token="SABRE-SEC-TENANT-001-ADMIN-SYS"
    )
    assert res["status"] == "SUCCESS"
    assert res["plugin_id"] == "fastag_optimizer"
    assert res["security_shield"]["verified_by"] == "Java 17 SabreSecurityShield"
    assert res["cpp_acceleration"] is not None
    assert "total_toll_amount_inr" in res["cpp_acceleration"]

def test_execute_brake_stress_plugin():
    res = paas_plugin_registry.execute_plugin(
        plugin_id="brake_stress_indexer",
        payload={"slope": -8.5, "speed_kmh": 60},
        token="SABRE-SEC-TENANT-001-ADMIN-SYS"
    )
    assert res["status"] == "SUCCESS"
    assert res["plugin_id"] == "brake_stress_indexer"
    assert res["cpp_acceleration"] is not None
    assert "estimated_brake_temp_rise_c" in res["cpp_acceleration"]

def test_execute_invalid_token_denied():
    res = paas_plugin_registry.execute_plugin(
        plugin_id="cold_chain_monitor",
        payload={"temp": 4.5},
        token=""
    )
    assert res["status"] == "SECURITY_DENIED"
