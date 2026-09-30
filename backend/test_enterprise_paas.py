import pytest
import enterprise_paas

def test_oms_dashboard_summary():
    summary = enterprise_paas.get_oms_dashboard_summary()
    assert "kpi_metrics" in summary
    assert summary["kpi_metrics"]["total_orders"] >= 5
    assert len(summary["recent_orders"]) >= 5
    assert len(summary["upcoming_orders"]) >= 1

def test_order_lookup_and_invoice_generation():
    order = enterprise_paas.get_order_by_id("ORD-2026-0018")
    assert order is not None
    assert order["customer"] == "Larsen & Toubro"
    assert order["cargo_type"] == "Wind Turbine Blade"

    # Test generating tax invoice
    invoice_res = enterprise_paas.generate_invoice_for_order("ORD-2026-0018")
    assert invoice_res["status"] == "SUCCESS"
    assert "invoice_number" in invoice_res
    assert invoice_res["grand_total_inr"] > invoice_res["base_amount_inr"]

def test_workforce_directory_and_search():
    stats = enterprise_paas.WORKFORCE_STATS
    assert stats["total_employees"] == 1248
    assert stats["departments_count"] == 12

    # Search by department
    drivers = enterprise_paas.search_employees(department="Drivers")
    assert len(drivers) >= 3
    assert any("Ramesh Yadav" in d["name"] for d in drivers)

    # Search by text query
    res = enterprise_paas.search_employees(query="Anita")
    assert len(res) >= 1
    assert res[0]["designation"] == "Chief Operating Officer (COO)"

def test_specs_catalogs():
    trucks = enterprise_paas.TRUCK_TYPES_CATALOG
    assert len(trucks) == 8
    assert any(t["id"] == "tractor-trailer" for t in trucks)

    containers = enterprise_paas.CONTAINER_TYPES_CATALOG
    assert len(containers) == 7
    assert any(c["id"] == "high-cube-40ft" for c in containers)

    cargo = enterprise_paas.CARGO_INDUSTRIES_CATALOG
    assert len(cargo) == 11
    assert any(c["id"] == "steel" for c in cargo)

def test_upcoming_orders_workflow():
    # Test review upcoming order
    res = enterprise_paas.review_upcoming_order("UP-2026-0091")
    assert res["status"] == "SUCCESS"
    assert "approved" in res["message"].lower()

    # Test advance milestone
    step_res = enterprise_paas.advance_order_step("ORD-2026-0018")
    assert step_res["status"] in ["SUCCESS", "INFO"]

