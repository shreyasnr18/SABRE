import pytest
from paas_foundations import (
    PaasFoundationsEngine,
    paas_foundations_engine,
    PaasCoreComponentsCatalog,
    ResponsibilityMatrix
)

def test_paas_6_core_components_catalog():
    components = PaasCoreComponentsCatalog.get_components()
    assert len(components) == 6
    
    comp_names = [c["name"] for c in components]
    assert "Runtime Environments and Execution Engines" in comp_names
    assert "Fully Managed Middleware" in comp_names
    assert "Database and Storage Management" in comp_names
    assert "Abstracted Operating System and Virtualization" in comp_names
    assert "Networking, Routing, and Load Balancing" in comp_names
    assert "Development Tools and Deployment Automation" in comp_names

    # Ensure all components are marked as managed by PAAS_PROVIDER
    for c in components:
        assert c["managed_by"] == "PAAS_PROVIDER"
        assert c["status"] == "HEALTHY"

def test_shared_responsibility_matrix():
    matrix = ResponsibilityMatrix.get_matrix()
    
    # Customer Responsibilities check
    cust_domains = [item["domain"] for item in matrix["customer_responsibilities"]]
    assert "Custom Application Code" in cust_domains
    assert "Application Data Models" in cust_domains
    assert "Secrets and Access Controls" in cust_domains
    assert "Application-level Configurations" in cust_domains
    
    # Provider Responsibilities check
    prov_domains = [item["domain"] for item in matrix["provider_responsibilities"]]
    assert "Physical Hardware and Data Centers" in prov_domains
    assert "Network Infrastructure and Firewalls" in prov_domains
    assert "Operating System and Virtualization Layers" in prov_domains
    assert "Runtimes, Middleware, and Auto-Scaling" in prov_domains

    assert matrix["governance_audit"]["compliance_score"] == "100%"

def test_subsystem_1_multi_tenant_orchestration():
    engine = PaasFoundationsEngine()
    sandboxes = engine.orchestrator.list_sandboxes()
    assert len(sandboxes) >= 3
    
    # Verify sandbox cgroup isolation and security profile
    for sb in sandboxes:
        assert "cgroup_path" in sb
        assert "pid" in sb["namespaces"]
        assert "net" in sb["namespaces"]
        assert sb["security_profile"] == "AppArmor / Seccomp Enforced"

    # Allocate new tenant sandbox
    new_sb = engine.orchestrator.allocate_sandbox("TENANT-DELHIVERY", "delhivery-express", "Python 3.12", "web.2")
    assert new_sb["status"] == "RUNNING"
    assert new_sb["tenant_id"] == "TENANT-DELHIVERY"
    assert new_sb["cpu_quota_cores"] == 2.0
    assert len(engine.orchestrator.list_sandboxes()) == len(sandboxes) + 1

def test_subsystem_2_automated_buildpack_pipeline():
    engine = PaasFoundationsEngine()
    
    # Node.js detection
    node_build = engine.buildpacks.detect_and_compile(["package.json", "src/index.js"], "my-node-app")
    assert node_build["status"] == "SUCCESS"
    assert node_build["detected_language"] == "Node.js"
    assert "npm" in str(node_build["phases"])
    assert node_build["image_digest"].startswith("sha256:")

    # Python detection
    py_build = engine.buildpacks.detect_and_compile(["requirements.txt", "main.py"], "my-py-app")
    assert py_build["status"] == "SUCCESS"
    assert py_build["detected_language"] == "Python"
    assert "pip" in str(py_build["phases"])

    # Java detection
    java_build = engine.buildpacks.detect_and_compile(["pom.xml", "src/Main.java"], "my-java-app")
    assert java_build["status"] == "SUCCESS"
    assert java_build["detected_language"] == "Java"
    assert "mvn" in str(java_build["phases"])

def test_subsystem_3_smart_l7_routing_and_proxy():
    engine = PaasFoundationsEngine()
    routes = engine.ingress.list_routes()
    assert len(routes) >= 2
    
    # Simulate public HTTPS request with Let's Encrypt TLS termination
    res = engine.ingress.simulate_ingress_request("api.sabre-paas.cloud")
    assert res["status"] == "200_OK"
    assert "TLSv1.3" in res["tls_handshake"]
    assert "routed_to_container_ip" in res
    assert res["upstream_service"] == "sabre-fleet-api"

def test_subsystem_4_dynamic_autoscaler_and_load_balancer():
    engine = PaasFoundationsEngine()
    app_status = engine.autoscaler.get_status("sabre-fleet-api")
    assert app_status["current_replicas"] == 2
    
    # Simulate heavy traffic spike
    spike_res = engine.autoscaler.simulate_traffic_spike("sabre-fleet-api", additional_rps=2800)
    assert spike_res["status"] == "SUCCESS"
    assert spike_res["new_replicas"] > 2
    assert len(spike_res["active_ips"]) == spike_res["new_replicas"]
    
    # Reset traffic back to normal
    reset_res = engine.autoscaler.reset_traffic("sabre-fleet-api")
    assert reset_res["status"] == "SUCCESS"
    assert reset_res["current_replicas"] == 2

def test_subsystem_5_standardized_persistence_gateway():
    engine = PaasFoundationsEngine()
    dbs = engine.persistence.list_databases()
    assert len(dbs) >= 2
    
    # Provision new managed PostgreSQL database
    new_pg = engine.persistence.provision_database("TENANT-VRL", "vrl-orders-db", "PostgreSQL 16")
    assert new_pg["status"] == "AVAILABLE"
    assert "DATABASE_URL" in new_pg["injected_env_vars"]
    assert "postgres://" in new_pg["injected_env_vars"]["DATABASE_URL"]
    assert new_pg["injected_env_vars"]["DATABASE_POOL_SIZE"] == "30"

    # Provision Redis
    new_redis = engine.persistence.provision_database("TENANT-VRL", "vrl-cache", "Redis 7.2 Sentinel")
    assert "REDIS_URL" in new_redis["injected_env_vars"]
    assert "rediss://" in new_redis["injected_env_vars"]["REDIS_URL"]

def test_subsystem_6_centralized_telemetry_aggregator():
    engine = PaasFoundationsEngine()
    logs = engine.telemetry.tail_logs(20)
    assert len(logs) > 0
    
    # Emit log to stdout stream
    engine.telemetry.emit_log("stdout", "INFO", "sabre-test-runner", "Unit test stream emission verified")
    updated_logs = engine.telemetry.tail_logs(20)
    assert any("Unit test stream emission verified" in l["message"] for l in updated_logs)

def test_master_paas_foundations_overview():
    overview = paas_foundations_engine.get_full_overview()
    assert len(overview["core_components"]) == 6
    assert "customer_responsibilities" in overview["responsibility_matrix"]
    assert "subsystems_summary" in overview
    assert overview["subsystems_summary"]["orchestration"]["active_sandboxes"] >= 3
