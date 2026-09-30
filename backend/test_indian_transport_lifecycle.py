import pytest
from indian_transport_lifecycle_engine import IndianTransportLifecycleEngine

@pytest.fixture
def engine():
    eng = IndianTransportLifecycleEngine()
    eng.reset_to_defaults()
    return eng

def test_initial_state(engine):
    trips = engine.get_all_trips()
    assert len(trips) >= 3
    assert trips[0]["trip_id"] == "TRIP-IN-2026-081"
    assert trips[0]["client_name"] == "Tata Steel Limited"

def test_stage_1_ulip_compliance(engine):
    res = engine.verify_ulip_compliance(
        trip_id="TRIP-IN-2026-081",
        vehicle_no="KA-01-AB-1234",
        driver_dl="KA0120150049210",
        is_hazardous=False
    )
    assert res["status"] == "SUCCESS"
    assert res["ulip_compliance"]["vahan_verified"] is True
    assert res["ulip_compliance"]["sarathi_verified"] is True
    assert res["ulip_compliance"]["overall_compliance_verdict"] == "CLEARED_FOR_DISPATCH"

def test_stage_2_four_copy_bilty(engine):
    bilty_bundle = engine.get_four_copy_bilty("TRIP-IN-2026-081")
    assert "metadata" in bilty_bundle
    assert "four_copies" in bilty_bundle
    assert len(bilty_bundle["four_copies"]) == 4
    
    titles = [c["title"] for c in bilty_bundle["four_copies"]]
    assert any("CONSIGNOR" in t for t in titles)
    assert any("CONSIGNEE" in t for t in titles)
    assert any("DRIVER" in t for t in titles)
    assert any("BILLING" in t for t in titles)

def test_stage_3_trip_sheet_advances(engine):
    res = engine.update_trip_sheet_advances(
        trip_id="TRIP-IN-2026-081",
        gross_freight=850000.0,
        cash_bata_inr=50000.0,
        fuel_card_inr=495000.0,
        fastag_inr=50000.0,
        fuel_card_provider="IndianOil XTRAPOWER",
        is_market_broker=True,
        broker_name="All India Freight Transporters",
        broker_pan="AACTA1234F",
        form_15g_collected=True
    )
    assert res["status"] == "SUCCESS"
    ts = res["trip_sheet"]
    assert ts["total_advance_payable_inr"] == 595000.0
    assert ts["advance_percentage"] == 70.0
    assert ts["market_broker_details"]["form_15g_15h_collected"] is True
    assert ts["market_broker_details"]["tds_exemption_applied"] is True

def test_stage_4_fastag_and_eway_extension(engine):
    res = engine.log_fastag_toll_deduction("TRIP-IN-2026-081", "Nelamangala Toll Plaza", 780.0)
    assert res["status"] == "SUCCESS"
    assert any(e["plaza_name"] == "Nelamangala Toll Plaza" for e in res["fastag_telemetry"]["fastag_toll_events"])

    ext_res = engine.extend_eway_bill_validity("TRIP-IN-2026-081", 24.0, "Heavy rain on Western Ghats")
    assert ext_res["status"] == "SUCCESS"
    assert "extended by 24" in ext_res["message"]

def test_stage_5_destination_unloading_pod(engine):
    # Test Shortage & Damage debit scenario
    res = engine.record_destination_pod(
        trip_id="TRIP-IN-2026-081",
        is_clean_pod=False,
        destination_weighbridge_slip_no="WB-TEST-9921",
        unloaded_gross_weight_mt=24.5,
        remarks="2 coils experienced surface abrasions during monsoon haul",
        receiver_name="Naveen Hegde, Plant Incharge",
        damage_debit_inr=12000.0
    )
    assert res["status"] == "SUCCESS"
    assert res["pod"]["pod_condition"] == "DAMAGE_REMARK_RECORDED"
    assert res["final_settlement"]["shortage_damage_debit_inr"] == 12000.0

def test_stage_6_paper_journey_acknowledgment(engine):
    res = engine.update_paper_journey_stage(
        trip_id="TRIP-IN-2026-081",
        paper_stage="PHYSICALLY_SUBMITTED_TO_CLIENT",
        courier_ref="BLR-INWARD-4410",
        acknowledgment_ref="TATA-ACK-2026-09",
        receiving_clerk="Smita Sen, Finance",
        credit_terms_days=30
    )
    assert res["status"] == "SUCCESS"
    sub = res["bill_submission"]
    assert sub["paper_stage"] == "PHYSICALLY_SUBMITTED_TO_CLIENT"
    assert sub["client_acknowledgment_ref"] == "TATA-ACK-2026-09"
    assert sub["credit_clock_days_remaining"] == 30

def test_stage_7_settlement_and_treds(engine):
    res = engine.reconcile_and_discount_treds(
        trip_id="TRIP-IN-2026-081",
        tds_rate_pct=2.0,
        late_penalty_inr=0.0,
        apply_treds=True,
        treds_platform="RXIL",
        treds_advance_pct=88.0,
        treds_bank="SBI MSME Factoring"
    )
    assert res["status"] == "SUCCESS"
    settle = res["final_settlement"]
    assert settle["treds_status"] == "DISBURSED_INTO_BANK_ACCOUNT"
    assert settle["treds_instant_cash_inr"] > 0

def test_stage_8_khata_and_truck_pnl(engine):
    khata = engine.get_employee_khata()
    assert len(khata) >= 5
    
    disburse_res = engine.disburse_employee_salary("EMP-203", "IMPS Immediate Bank Settlement")
    assert disburse_res["status"] == "SUCCESS"
    assert disburse_res["employee"]["khata_status"] == "SETTLED_DISBURSED"

    pnl = engine.get_truck_standalone_pnl()
    assert len(pnl) >= 3
    assert pnl[0]["monthly_bank_emi_inr"] > 0
    assert "Tata Motors Finance" in pnl[0]["financier"]
