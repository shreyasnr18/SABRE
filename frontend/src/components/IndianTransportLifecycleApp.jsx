import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, FileText, Truck, Clock, CheckCircle2, AlertTriangle,
  CreditCard, DollarSign, Users, Award, Printer, ArrowRight, RefreshCw,
  Search, Check, AlertOctagon, HelpCircle, ChevronRight, Layers,
  ExternalLink, Sparkles, Building, Phone, Fuel, MapPin, Gauge, Download
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1/transport-lifecycle';

// Offline fallback dataset in case backend is loading or unreachable
const FALLBACK_TRIPS = [
  {
    trip_id: "TRIP-IN-2026-081",
    order_ref: "ORD-TAT-9941",
    client_name: "Tata Steel Limited",
    client_gstin: "20AAACT2727Q1ZW",
    origin_hub: "Jamshedpur Works, Jharkhand",
    destination_hub: "Peenya Industrial Area, Bengaluru, Karnataka",
    corridor: "Eastern-Southern Artery (NH-16 / NH-44)",
    distance_km: 1840,
    cargo_description: "Cold-Rolled Automotive High-Tensile Steel Coils",
    gross_weight_mt: 24.8,
    tare_weight_mt: 14.2,
    net_weight_mt: 24.8,
    vehicle_no: "KA-01-AB-1234",
    vehicle_type: "Tata Prima 5530.S (16-Wheeler Multi-Axle Trailer)",
    ownership_type: "Fleet Owned",
    driver_name: "Suresh Patil",
    driver_phone: "+91 98450 12891",
    driver_dl_no: "KA0120150049210",
    is_hazardous: false,
    gta_sac_code: "996511",
    current_stage: 6,
    ulip_compliance: {
      vahan_verified: true,
      vahan_check_timestamp: "2026-09-21 09:15:32",
      rc_status: "ACTIVE",
      fitness_valid_upto: "2027-08-14",
      national_permit_no: "NP/KA/2025/88192",
      national_permit_valid_upto: "2027-03-31",
      state_road_tax_status: "PAID_UP_TO_DATE",
      puc_certificate_valid_upto: "2026-12-15",
      sarathi_verified: true,
      sarathi_check_timestamp: "2026-09-21 09:16:04",
      dl_status: "VALID_COMMERCIAL",
      dl_class: "TRANS / HGMV",
      hazardous_endorsement: false,
      driver_badge_no: "BDG-KA-44109",
      overall_compliance_verdict: "CLEARED_FOR_DISPATCH"
    },
    bilty: {
      bilty_no: "LR-2026-9901",
      bilty_date: "2026-09-21",
      e_way_bill_no: "241892049182",
      e_way_bill_valid_upto: "2026-09-30 23:59:00",
      consignor_name: "Tata Steel Works (Flat Products Division)",
      consignor_address: "Gate 4, Bistupur Industrial Area, Jamshedpur - 831001",
      consignee_name: "Bharat Forge / BFW Precision Machining Hub",
      consignee_address: "Plot 18/B, 2nd Phase Peenya Industrial Area, Bengaluru - 560058",
      declared_cargo_value_inr: 4850000.0,
      packages_count: "6 Steel Coils (Sealed Straps)",
      loading_challan_no: "LC-JSR-4921",
      copies: {
        consignor_copy: { issued: true, issued_to: "Shipper Gate Security", badge_color: "#ec4899" },
        consignee_copy: { issued: true, issued_to: "Buyer Delivery Reception", badge_color: "#3b82f6" },
        driver_copy: { issued: true, issued_to: "In-Cabin Highway RTO Copy", badge_color: "#10b981" },
        billing_copy: { issued: true, issued_to: "Transporter Accounts Desk", badge_color: "#f59e0b" }
      }
    },
    trip_sheet: {
      trip_card_no: "TC-2026-081",
      issue_date: "2026-09-21",
      agreed_gross_freight_inr: 845000.0,
      advance_percentage: 70.0,
      total_advance_payable_inr: 591500.0,
      advance_split: {
        cash_daily_bata_inr: 45000.0,
        fuel_card_inr: 485000.0,
        fuel_card_provider: "IndianOil XTRAPOWER RFID Card #8841-209",
        fastag_wallet_recharge_inr: 61500.0,
        fastag_tag_id: "34161FA82032890"
      },
      balance_pending_30pct_inr: 253500.0,
      market_broker_details: null,
      form_15g_15h_applicable: false
    },
    in_transit_telemetry: {
      current_location: "Tumakuru Highway Toll Approach, Karnataka",
      fastag_deductions_total_inr: 18450.0,
      fastag_toll_events: [
        { plaza_name: "Kharagpur NH-16 Toll Plaza", amount_inr: 840.0, time: "2026-09-22 04:12:00" },
        { plaza_name: "Bhubaneswar South Tollway", amount_inr: 920.0, time: "2026-09-22 18:40:00" },
        { plaza_name: "Visakhapatnam Bypass Toll", amount_inr: 1150.0, time: "2026-09-23 11:22:00" },
        { plaza_name: "Vijayawada Outer Ring Expressway", amount_inr: 1420.0, time: "2026-09-24 02:15:00" },
        { plaza_name: "Tirupati-Chittoor Tollway", amount_inr: 1180.0, time: "2026-09-24 20:30:00" },
        { plaza_name: "Hosakote-Bengaluru Peripheral", amount_inr: 890.0, time: "2026-09-25 09:10:00" }
      ],
      e_way_bill_expiry_countdown_hours: 38.5,
      e_way_bill_status: "ACTIVE_WITHIN_DEADLINE",
      distance_remaining_km: 42,
      section_129_gst_penalty_risk: "ZERO_COMPLIANT"
    },
    unloading_pod: {
      unloaded_timestamp: "2026-09-25 14:30:00",
      destination_weighbridge_slip_no: "WB-BFW-8841",
      gross_weight_unloaded_mt: 24.8,
      shortage_weight_kg: 0.0,
      pod_condition: "CLEAN_SOUND",
      pod_stamp_remark: "Received in Sound Condition with all 6 security seals intact. Zero surface moisture.",
      receiver_supervisor_signature: "Venkatesh Rao, Store Incharge (BFW)",
      weighbridge_slip_verified: true,
      shortage_damage_debit_assessed_inr: 0.0
    },
    bill_submission: {
      paper_stage: "PHYSICALLY_SUBMITTED_TO_CLIENT",
      driver_handover_to_branch_date: "2026-09-25",
      branch_handover_courier_ref: "DTDC-BLR-99210",
      client_desk_submission_date: "2026-09-26",
      client_acknowledgment_ref: "BFW/WH/IN/4991",
      client_receiving_clerk: "Kavitha M., Accounts Dept",
      credit_terms_days: 30,
      credit_clock_days_elapsed: 4,
      credit_clock_days_remaining: 26,
      payment_due_date: "2026-10-26"
    },
    final_settlement: {
      gross_freight_inr: 845000.0,
      tds_rate_pct: 2.0,
      tds_deducted_inr: 16900.0,
      shortage_damage_debit_inr: 0.0,
      late_unloading_penalty_inr: 0.0,
      advance_already_paid_inr: 591500.0,
      net_balance_due_inr: 236600.0,
      treds_eligible: true,
      treds_platform: "RXIL (Receivables Exchange of India)",
      treds_status: "APPROVED_FOR_AUCTION",
      treds_advance_rate_pct: 88.0,
      treds_instant_cash_inr: 208208.0,
      treds_bank_bidder: "State Bank of India (MSME Corridor Discounting @ 7.8% p.a.)",
      settlement_verdict: "Awaiting Client RTGS Cycle or Instant TReDS 24hr Liquidity"
    }
  }
];

const STAGES = [
  { id: 1, name: "1. ULIP Compliance", short: "ULIP Check", desc: "VAHAN (RC/Fitness) & SARATHI (DL) Real-Time Verification" },
  { id: 2, name: "2. 4-Copy Bilty (LR)", short: "4-Copy Bilty", desc: "GTA Rules SAC 9965 (Consignor, Consignee, Driver, Transporter)" },
  { id: 3, name: "3. Trip Sheet & Advance", short: "Advance Hisaab", desc: "70% Advance Outflow (Cash/Bata + Fuel Card + FASTag) & 15G/H" },
  { id: 4, name: "4. FASTag & E-Way Clock", short: "FASTag & E-Way", desc: "Real-Time Toll Deduction Sync & Sec 129 GST Expiry Countdown" },
  { id: 5, name: "5. Destination POD", short: "Stamped POD", desc: "Clean Sound POD vs Shortage/Damage Remark & Debit Impact" },
  { id: 6, name: "6. Paper Submission Clock", short: "Paper Clock", desc: "Physical Bilty Transit & Stamped Acknowledgment Credit Start" },
  { id: 7, name: "7. Settlement & TReDS", short: "TReDS Settlement", desc: "Debit Reconciliation & 24hr MSME Bank Factoring Liquidity" },
  { id: 8, name: "8. Khata Ledger & Truck P&L", short: "Khata & Truck P&L", desc: "Workforce Khata Advances & Standalone Vehicle Margin vs Bank EMI" }
];

export default function IndianTransportLifecycleApp({ onBackToHub }) {
  const [trips, setTrips] = useState(FALLBACK_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState("TRIP-IN-2026-081");
  const [activeStage, setActiveStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeBiltyCopy, setActiveBiltyCopy] = useState("consignor_copy"); // 'consignor_copy' | 'consignee_copy' | 'driver_copy' | 'billing_copy'
  const [actionSuccessNotice, setActionSuccessNotice] = useState("");

  // Step 8 State
  const [workforceKhata, setWorkforceKhata] = useState([]);
  const [truckPnl, setTruckPnl] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchTripsAndMasterData();
  }, []);

  const fetchTripsAndMasterData = async () => {
    try {
      setLoading(true);
      const resTrips = await fetch(`${API_BASE}/trips`).then(r => r.json());
      if (Array.isArray(resTrips) && resTrips.length > 0) {
        setTrips(resTrips);
      }
      const [resKhata, resPnl] = await Promise.all([
        fetch(`${API_BASE}/employee-khata`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/truck-pnl`).then(r => r.json()).catch(() => [])
      ]);
      setWorkforceKhata(resKhata);
      setTruckPnl(resPnl);
    } catch (e) {
      console.warn("Backend not running or offline, using fallback state:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentTrip = useMemo(() => {
    return trips.find(t => t.trip_id === selectedTripId) || trips[0];
  }, [trips, selectedTripId]);

  const showToast = (msg) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(""), 3500);
  };

  // 1. Run live ULIP verification simulation
  const handleVerifyUlip = async () => {
    try {
      const res = await fetch(`${API_BASE}/verify-ulip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: currentTrip.trip_id,
          vehicle_no: currentTrip.vehicle_no,
          driver_dl: currentTrip.driver_dl_no,
          is_hazardous: currentTrip.is_hazardous
        })
      }).then(r => r.json());
      if (res.status === 'SUCCESS') {
        showToast("ULIP Integration Check Passed: VAHAN & SARATHI Cleared!");
        fetchTripsAndMasterData();
      }
    } catch {
      showToast("Simulated: VAHAN & SARATHI Verified with MoRTH Portal");
    }
  };

  // 4. Extend E-Way Bill Part-B
  const handleExtendEway = async () => {
    try {
      const res = await fetch(`${API_BASE}/extend-eway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: currentTrip.trip_id,
          extension_hours: 24.0,
          reason: "Highway corridor traffic congestion / monsoon speed restriction"
        })
      }).then(r => r.json());
      if (res.status === 'SUCCESS') {
        showToast("E-Way Bill extended by 24h on GST Portal (Sec 129 Penalty Protected)");
        fetchTripsAndMasterData();
      }
    } catch {
      showToast("Simulated: E-Way Bill Extended by 24 Hours");
    }
  };

  // 5. Toggle Clean POD vs Damage/Shortage Remark
  const handleUpdatePod = async (isClean) => {
    try {
      const damageAmt = isClean ? 0.0 : 4500.0;
      const res = await fetch(`${API_BASE}/unloading-pod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: currentTrip.trip_id,
          is_clean_pod: isClean,
          destination_weighbridge_slip_no: isClean ? "WB-CLEAN-8841" : "WB-DMG-4421",
          unloaded_gross_weight_mt: currentTrip.gross_weight_mt,
          remarks: isClean 
            ? "Received in Sound Condition with all seals intact" 
            : "Shortage / Surface abrasion remarked on physical Bilty. Client debit note generated.",
          receiver_name: "Venkatesh Rao, Store Incharge",
          damage_debit_inr: damageAmt
        })
      }).then(r => r.json());
      if (res.status === 'SUCCESS') {
        showToast(isClean ? "Clean POD Recorded: Zero Debit Remark" : "Damage Remark Recorded: ₹4,500 Debit Assessed");
        fetchTripsAndMasterData();
      }
    } catch {
      showToast("Simulated: POD status updated");
    }
  };

  // 6. Update Paper Journey stage
  const handlePaperStageUpdate = async (stageName) => {
    try {
      const res = await fetch(`${API_BASE}/paper-journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: currentTrip.trip_id,
          paper_stage: stageName,
          courier_ref: "DTDC-EXP-9921",
          acknowledgment_ref: "ACK-CLIENT-" + Math.floor(Math.random() * 9000 + 1000),
          receiving_clerk: "Accounts Reception Desk",
          credit_terms_days: currentTrip.bill_submission?.credit_terms_days || 30
        })
      }).then(r => r.json());
      if (res.status === 'SUCCESS') {
        showToast("Physical Bilty Stage Updated: " + stageName.replace(/_/g, ' '));
        fetchTripsAndMasterData();
      }
    } catch {
      showToast("Simulated: Paper stage updated");
    }
  };

  // 7. Execute TReDS 24hr MSME factoring
  const handleExecuteTreds = async () => {
    try {
      const res = await fetch(`${API_BASE}/reconcile-settlement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: currentTrip.trip_id,
          tds_rate_pct: 2.0,
          late_penalty_inr: 0.0,
          apply_treds: true,
          treds_platform: "RXIL (Receivables Exchange of India)",
          treds_advance_pct: 88.0,
          treds_bank: "State Bank of India MSME Corridor Factoring"
        })
      }).then(r => r.json());
      if (res.status === 'SUCCESS') {
        showToast("TReDS Disbursal Successful: 88% Instant Liquidity Credited to Bank Account!");
        fetchTripsAndMasterData();
      }
    } catch {
      showToast("Simulated: TReDS Bank Factoring Disbursed");
    }
  };

  // 8. Disburse Employee Salary in Khata
  const handleDisburseKhata = async (empId) => {
    try {
      const res = await fetch(`${API_BASE}/disburse-salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_id: empId, payment_mode: "IMPS Direct Bank Disbursed" })
      }).then(r => r.json());
      if (res.status === 'SUCCESS') {
        showToast(`Salary disbursed for ${empId} via IMPS`);
        fetchTripsAndMasterData();
      }
    } catch {
      showToast("Simulated: Salary Disbursed");
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#070f1e',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    }}>
      {/* 1. TOP HEADER & TRIP SELECTOR */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(11, 23, 44, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              &larr; Hub
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '13px',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em'
              }}>
                ULIP &bull; GTA 9965
              </div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Indian Transport Operational & Financial Lifecycle
              </h1>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
              National Logistics Policy &bull; VAHAN/SARATHI &bull; 4-Copy Bilty &bull; FASTag API &bull; Stamped POD &bull; TReDS MSME Factoring
            </p>
          </div>
        </div>

        {/* Trip Selector & Global Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Shipment
            </span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {trips.map(t => (
                <option key={t.trip_id} value={t.trip_id}>
                  {t.trip_id} &bull; {t.client_name} ({t.vehicle_no})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchTripsAndMasterData}
            title="Refresh All States"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* TOAST SUCCESS BANNER */}
      {actionSuccessNotice && (
        <div style={{
          background: '#065f46',
          color: '#ecfdf5',
          padding: '8px 24px',
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #10b981'
        }}>
          <CheckCircle2 size={16} color="#34d399" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* 2. STAGE PROGRESSION PIPELINE BAR (1 through 8) */}
      <div style={{
        background: '#091528',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        overflowX: 'auto',
        padding: '6px 16px',
        gap: '8px',
        flexShrink: 0
      }}>
        {STAGES.map((s) => {
          const isCurrent = activeStage === s.id;
          const isDone = currentTrip.current_stage >= s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: isCurrent 
                  ? '1px solid #10b981' 
                  : isDone 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.06)',
                background: isCurrent 
                  ? 'rgba(16, 185, 129, 0.16)' 
                  : isDone 
                    ? 'rgba(15, 23, 42, 0.6)' 
                    : 'rgba(10, 18, 30, 0.4)',
                color: isCurrent ? '#34d399' : isDone ? '#e2e8f0' : '#64748b',
                fontSize: '11px',
                fontWeight: isCurrent ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: isCurrent ? '#10b981' : isDone ? '#047857' : '#334155',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 900
              }}>
                {s.id}
              </div>
              <span>{s.short}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE / ACTIVE STAGE DISPLAY */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SHIPMENT SUMMARY HERO CARD */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Consignor & Client</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>{currentTrip.client_name}</div>
            <div style={{ fontSize: '11px', color: '#38bdf8' }}>{currentTrip.order_ref} &bull; GSTIN: {currentTrip.client_gstin}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Corridor & Distance</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{currentTrip.origin_hub.split(',')[0]} &rarr; {currentTrip.destination_hub.split(',')[0]}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{currentTrip.distance_km} KM &bull; {currentTrip.corridor.split('(')[0]}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Assigned Commercial Vehicle</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{currentTrip.vehicle_no}</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{currentTrip.vehicle_type} ({currentTrip.ownership_type})</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Gross Agreed Freight</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#f59e0b' }}>
              ₹ {currentTrip.trip_sheet?.agreed_gross_freight_inr?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#34d399' }}>
              70% Advance: ₹ {currentTrip.trip_sheet?.total_advance_payable_inr?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 1: INDENT & INSTANT ULIP COMPLIANCE (VAHAN & SARATHI) */}
        {/* ========================================================= */}
        {activeStage === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                    Stage 1: Indent Booking & Instant Vehicle/Driver Compliance
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Under the National Logistics Policy (NLP), instant verification via ULIP VAHAN & SARATHI APIs prevents roadside detentions and commercial blacklist fines.
                  </p>
                </div>
                <button
                  onClick={handleVerifyUlip}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Run Live ULIP Verification</span>
                </button>
              </div>

              {/* VAHAN & SARATHI Side-by-Side Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
                
                {/* VAHAN CARD */}
                <div style={{
                  background: '#081224',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={18} color="#38bdf8" />
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#38bdf8' }}>VAHAN API &bull; RC & Vehicle Fitness</span>
                    </div>
                    <span style={{
                      background: currentTrip.ulip_compliance?.vahan_verified ? '#065f46' : '#991b1b',
                      color: '#ecfdf5',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {currentTrip.ulip_compliance?.rc_status || "VERIFIED"}
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Registration No:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{currentTrip.vehicle_no}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Fitness Certificate:</span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>Valid Upto {currentTrip.ulip_compliance?.fitness_valid_upto}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>National Permit (NP):</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{currentTrip.ulip_compliance?.national_permit_no}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>State Road Taxes:</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>PAID & CURRENT</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>PUC Emission Certificate:</span>
                      <span style={{ color: '#cbd5e1' }}>Valid Upto {currentTrip.ulip_compliance?.puc_certificate_valid_upto}</span>
                    </div>
                  </div>
                </div>

                {/* SARATHI CARD */}
                <div style={{
                  background: '#081224',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color="#10b981" />
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#10b981' }}>SARATHI API &bull; Commercial Driving License</span>
                    </div>
                    <span style={{
                      background: currentTrip.ulip_compliance?.sarathi_verified ? '#065f46' : '#991b1b',
                      color: '#ecfdf5',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {currentTrip.ulip_compliance?.dl_status || "VALID"}
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Pilot Driver Name:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{currentTrip.driver_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Commercial DL No:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{currentTrip.driver_dl_no}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>License Authorization:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{currentTrip.ulip_compliance?.dl_class}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Hazardous Goods Endorsement:</span>
                      <span style={{
                        color: currentTrip.ulip_compliance?.hazardous_endorsement ? '#f59e0b' : '#94a3b8',
                        fontWeight: 700
                      }}>
                        {currentTrip.ulip_compliance?.hazardous_endorsement ? "CMVR 137 HAZMAT CERTIFIED" : "Standard Freight (Non-Hazmat)"}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Driver Commercial Badge:</span>
                      <span style={{ color: '#cbd5e1' }}>{currentTrip.ulip_compliance?.driver_badge_no}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: LOADING & THE 4-COPY BILTY (GTA SAC 9965) */}
        {/* ========================================================= */}
        {activeStage === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ec4899' }}>
                    Stage 2: Loading & The 4-Copy Bilty (Lorry Receipt / LR)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Under Indian Goods Transport Agency (GTA) rules (SAC 9965), every consignment note requires 4 physical copies serving distinct legal and operational functions.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: '#475569',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={15} />
                  <span>Print Selected Copy</span>
                </button>
              </div>

              {/* 4 COPY SELECTOR BUTTONS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px' }}>
                {[
                  { key: 'consignor_copy', title: '1. Consignor Copy', desc: 'Issued to Shipper (Gate Pass & Stock Reduction)', color: '#ec4899' },
                  { key: 'consignee_copy', title: '2. Consignee Copy', desc: 'Handed to Buyer upon Final Delivery & GRN', color: '#3b82f6' },
                  { key: 'driver_copy', title: '3. Driver Copy', desc: 'Carried in Cabin for Highway RTO & Police Checking', color: '#10b981' },
                  { key: 'billing_copy', title: '4. Transporter Copy', desc: 'Sent to Accounts to Raise Commercial Invoice', color: '#f59e0b' }
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setActiveBiltyCopy(c.key)}
                    style={{
                      background: activeBiltyCopy === c.key ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                      border: activeBiltyCopy === c.key ? `2px solid ${c.color}` : '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: c.color }}>{c.title}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>{c.desc}</div>
                  </button>
                ))}
              </div>

              {/* REALISTIC BILTY DOCUMENT PREVIEW */}
              <div style={{
                marginTop: '20px',
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '24px',
                border: '2px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Watermark */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '15%',
                  fontSize: '54px',
                  fontWeight: 900,
                  color: 'rgba(203, 213, 225, 0.28)',
                  transform: 'rotate(-25deg)',
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {activeBiltyCopy.replace('_', ' ')}
                </div>

                {/* Letterhead & Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
                      APEX HIGHWAY FREIGHT & LOGISTICS PVT LTD
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      Goods Transport Agency (GTA) &bull; SAC Code: 996511 &bull; GSTIN: 29AABCS9941E1ZX
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      Registered Office: Cyber Artery SEZ, Bellandur, Bengaluru - 560103 &bull; Phone: +91 80 4991 2026
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: activeBiltyCopy === 'consignor_copy' ? '#ec4899' : activeBiltyCopy === 'consignee_copy' ? '#3b82f6' : activeBiltyCopy === 'driver_copy' ? '#10b981' : '#f59e0b',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'inline-block',
                      textTransform: 'uppercase'
                    }}>
                      {activeBiltyCopy.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px' }}>
                      BILTY NO: {currentTrip.bilty?.bilty_no}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Date: {currentTrip.bilty?.bilty_date}
                    </div>
                  </div>
                </div>

                {/* Consignor & Consignee Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '14px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Consignor (Shipper)</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{currentTrip.bilty?.consignor_name}</div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>{currentTrip.bilty?.consignor_address}</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>GSTIN: {currentTrip.client_gstin}</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Consignee (Receiver)</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{currentTrip.bilty?.consignee_name}</div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>{currentTrip.bilty?.consignee_address}</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>GSTIN: 29AABCU9912E1ZZ</div>
                  </div>
                </div>

                {/* Cargo Details Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', margin: '10px 0' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>Packages</th>
                      <th style={{ padding: '6px 8px' }}>Description of Goods</th>
                      <th style={{ padding: '6px 8px' }}>Gross Wt (MT)</th>
                      <th style={{ padding: '6px 8px' }}>Net Wt (MT)</th>
                      <th style={{ padding: '6px 8px' }}>Declared Value (INR)</th>
                      <th style={{ padding: '6px 8px' }}>E-Way Bill No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px' }}>{currentTrip.bilty?.packages_count}</td>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{currentTrip.cargo_description}</td>
                      <td style={{ padding: '8px' }}>{currentTrip.gross_weight_mt}</td>
                      <td style={{ padding: '8px' }}>{currentTrip.net_weight_mt}</td>
                      <td style={{ padding: '8px' }}>₹ {currentTrip.bilty?.declared_cargo_value_inr?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#2563eb' }}>{currentTrip.bilty?.e_way_bill_no}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Freight Table & Statutory Notice */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>Statutory Conditions of Carriage:</span><br />
                    1. Consignment booked under Carriage by Road Act 2007. Consignor confirms goods are lawful and GST paid.<br />
                    2. Notice of loss/damage must be endorsed on this Bilty before vehicle gate clearance.<br />
                    3. Detention charges of ₹3,500/day apply if unloading exceeds 12 hours from gate reporting.
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span>Gross Freight:</span>
                      <span style={{ fontWeight: 700 }}>₹ {currentTrip.trip_sheet?.agreed_gross_freight_inr?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#059669' }}>
                      <span>70% Advance:</span>
                      <span style={{ fontWeight: 700 }}>₹ {currentTrip.trip_sheet?.total_advance_payable_inr?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: '1px solid #cbd5e1', fontWeight: 800 }}>
                      <span>30% Balance:</span>
                      <span>₹ {currentTrip.trip_sheet?.balance_pending_30pct_inr?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: TRIP SHEET & DRIVER ADVANCE (HISAAB / TRIP CARD) */}
        {/* ========================================================= */}
        {activeStage === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
                  Stage 3: The Trip Sheet & Driver Cash Advance (Trip Card Hisaab)
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Before turning a wheel, the 70% advance is disbursed across Cash Bata, Corporate Fuel Cards (IOCL/BPCL), and FASTag electronic recharges. For market trucks, Form 15G/15H logs Section 194C TDS exemptions.
                </p>
              </div>

              {/* 3-WAY ADVANCE SPLIT CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '16px' }}>
                
                {/* 1. CASH / BATA CARD */}
                <div style={{ background: '#0a1628', borderRadius: '8px', border: '1px solid #1e293b', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <DollarSign size={18} color="#10b981" />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>Physical Cash / Road Bata</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
                    ₹ {currentTrip.trip_sheet?.advance_split?.cash_daily_bata_inr?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Daily driver allowance, en-route food, RTO weighbridge slips, emergency tyre puncture cash.
                  </div>
                </div>

                {/* 2. FUEL CARD */}
                <div style={{ background: '#0a1628', borderRadius: '8px', border: '1px solid #1e293b', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Fuel size={18} color="#f59e0b" />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>Corporate Fleet Fuel Card</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
                    ₹ {currentTrip.trip_sheet?.advance_split?.fuel_card_inr?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    {currentTrip.trip_sheet?.advance_split?.fuel_card_provider} (Pump RFID authorization).
                  </div>
                </div>

                {/* 3. FASTAG RECHARGE */}
                <div style={{ background: '#0a1628', borderRadius: '8px', border: '1px solid #1e293b', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CreditCard size={18} color="#38bdf8" />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>FASTag Electronic Wallet</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
                    ₹ {currentTrip.trip_sheet?.advance_split?.fastag_wallet_recharge_inr?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Direct NHAI Tag Recharge ({currentTrip.trip_sheet?.advance_split?.fastag_tag_id}).
                  </div>
                </div>

              </div>

              {/* MARKET BROKER MEMO & FORM 15G/15H EXEMPTION */}
              <div style={{
                marginTop: '16px',
                background: '#091528',
                borderRadius: '8px',
                border: '1px solid #1e3a5f',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#a855f7" />
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#c084fc' }}>
                      Market / Broker Truck Memo &bull; Section 194C TDS Compliance
                    </span>
                  </div>
                  <span style={{
                    background: currentTrip.ownership_type.includes('Market') ? '#581c87' : '#1e293b',
                    color: '#f3e8ff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {currentTrip.ownership_type}
                  </span>
                </div>

                {currentTrip.ownership_type.includes('Market') ? (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>Hired Broker: <strong style={{ color: '#ffffff' }}>{currentTrip.trip_sheet?.market_broker_details?.broker_name}</strong></div>
                    <div>Broker PAN: <strong style={{ color: '#38bdf8' }}>{currentTrip.trip_sheet?.market_broker_details?.broker_pan}</strong></div>
                    <div style={{ color: '#34d399', fontWeight: 700 }}>
                      &check; {currentTrip.trip_sheet?.market_broker_details?.declaration_notes}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
                    Vehicle is company fleet-owned ({currentTrip.vehicle_no}). No broker commission or external Form 15G/H declaration required.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: IN-TRANSIT FASTag & E-WAY BILL CLOCK */}
        {/* ========================================================= */}
        {activeStage === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                  Stage 4: In-Transit FASTag Toll Deductions & E-Way Bill Clock
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  FASTag API reconciles toll expenses directly from the bank statement without driver paper slips. E-Way Bill countdown prevents Section 129 GST seizures (mandatory 200% tax penalty).
                </p>
              </div>

              {/* SECTION 129 GST SEIZURE CLOCK & WARNING */}
              <div style={{
                marginTop: '16px',
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderRadius: '8px',
                border: '1px solid #dc2626',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#ef4444" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#f87171' }}>
                      E-Way Bill Expiry Countdown (Section 129 Prevention)
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '6px 0 2px 0' }}>
                    {currentTrip.in_transit_telemetry?.e_way_bill_expiry_countdown_hours} Hours Remaining
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                    Distance to destination: <strong>{currentTrip.in_transit_telemetry?.distance_remaining_km} KM</strong> &bull; E-Way Bill: {currentTrip.bilty?.e_way_bill_no}
                  </div>
                </div>

                <button
                  onClick={handleExtendEway}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertOctagon size={16} />
                  <span>Extend E-Way Bill Part-B (+24h)</span>
                </button>
              </div>

              {/* FASTAG TOLL TIMELINE */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>
                    Live FASTag Toll Deductions (Reconciled Directly from Bank API)
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>
                    Total FASTag Burnt: ₹ {currentTrip.in_transit_telemetry?.fastag_deductions_total_inr?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentTrip.in_transit_telemetry?.fastag_toll_events?.map((ev, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#091528',
                        borderRadius: '6px',
                        border: '1px solid #1e293b',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={15} color="#38bdf8" />
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>{ev.plaza_name}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Deduction Time: {ev.time}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '13px' }}>
                        ₹ {ev.amount_inr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: DESTINATION UNLOADING & PHYSICAL STAMPED POD */}
        {/* ========================================================= */}
        {activeStage === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                  Stage 5: Destination Unloading & The Physical Stamped Proof of Delivery (POD)
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  The most critical gate in Indian logistics. Destination weighbridge slip is verified and the receiving supervisor stamps the physical Bilty.
                </p>
              </div>

              {/* CLEAN POD VS SHORTAGE / DAMAGE TOGGLE */}
              <div style={{
                marginTop: '16px',
                background: '#0a1628',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                padding: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0', marginBottom: '10px' }}>
                  Simulation: Receiving Supervisor Gate Physical Stamping
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleUpdatePod(true)}
                    style={{
                      flex: 1,
                      background: currentTrip.unloading_pod?.pod_condition === 'CLEAN_SOUND' ? 'rgba(16, 185, 129, 0.2)' : '#0f172a',
                      border: currentTrip.unloading_pod?.pod_condition === 'CLEAN_SOUND' ? '2px solid #10b981' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} />
                      <span>Mode A: Clean Sound POD</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                      Stamped: <em>"Received in Sound Condition"</em> with all security seals intact. Zero shortage/damage debits.
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdatePod(false)}
                    style={{
                      flex: 1,
                      background: currentTrip.unloading_pod?.pod_condition === 'DAMAGE_REMARK_RECORDED' ? 'rgba(239, 68, 68, 0.2)' : '#0f172a',
                      border: currentTrip.unloading_pod?.pod_condition === 'DAMAGE_REMARK_RECORDED' ? '2px solid #ef4444' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} />
                      <span>Mode B: Damage / Shortage Remark Stamped</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                      Stamped with damage/shortage remark. Triggers client debit note deduction and invoice dispute hold.
                    </div>
                  </button>
                </div>

                {/* CURRENT POD STATUS CARD */}
                <div style={{
                  marginTop: '16px',
                  background: '#070f1e',
                  borderRadius: '6px',
                  border: '1px solid #1e3a5f',
                  padding: '14px',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Weighbridge Slip Ref: <strong style={{ color: '#ffffff' }}>{currentTrip.unloading_pod?.destination_weighbridge_slip_no}</strong></div>
                    <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
                      Physical Stamp Remark: <strong style={{ color: currentTrip.unloading_pod?.pod_condition === 'CLEAN_SOUND' ? '#34d399' : '#f87171' }}>"{currentTrip.unloading_pod?.pod_stamp_remark}"</strong>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                      Supervised by: {currentTrip.unloading_pod?.receiver_supervisor_signature}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Debit Assessed</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: currentTrip.unloading_pod?.shortage_damage_debit_assessed_inr > 0 ? '#ef4444' : '#10b981' }}>
                      ₹ {currentTrip.unloading_pod?.shortage_damage_debit_assessed_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 6: BILL SUBMISSION & THE ACKNOWLEDGMENT CLOCK */}
        {/* ========================================================= */}
        {activeStage === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
                  Stage 6: Bill Submission & The Acknowledgment Clock
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  The Great Indian Transport Reality: Shippers do NOT pay from the invoice date. The 30/45-day credit period begins strictly on the date the Transporter physically submits the GST Invoice with the Original Stamped Bilty attached to the client accounts desk!
                </p>
              </div>

              {/* 3-LEG PHYSICAL PAPER JOURNEY TRACKER */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '16px' }}>
                
                {/* LEG 1 */}
                <div style={{
                  background: currentTrip.bill_submission?.paper_stage === 'IN_TRANSIT_FROM_DRIVER_CABIN' ? 'rgba(56, 189, 248, 0.15)' : '#091528',
                  borderRadius: '8px',
                  border: currentTrip.bill_submission?.paper_stage === 'IN_TRANSIT_FROM_DRIVER_CABIN' ? '2px solid #38bdf8' : '1px solid #1e293b',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>Leg 1: Driver Cabin Pocket</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                    Original stamped Bilty carried in truck cabin en-route from delivery gate to regional branch office.
                  </div>
                  <button
                    onClick={() => handlePaperStageUpdate('IN_TRANSIT_FROM_DRIVER_CABIN')}
                    style={{
                      marginTop: '10px',
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #38bdf8',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Set: In Driver Pocket
                  </button>
                </div>

                {/* LEG 2 */}
                <div style={{
                  background: currentTrip.bill_submission?.paper_stage === 'SUBMITTED_TO_BRANCH_OFFICE' ? 'rgba(168, 85, 247, 0.15)' : '#091528',
                  borderRadius: '8px',
                  border: currentTrip.bill_submission?.paper_stage === 'SUBMITTED_TO_BRANCH_OFFICE' ? '2px solid #a855f7' : '1px solid #1e293b',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc' }}>Leg 2: Branch Inward Audit</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                    Handed over to Transporter regional branch; courier dispatched to Client Corporate HQ.
                  </div>
                  <button
                    onClick={() => handlePaperStageUpdate('SUBMITTED_TO_BRANCH_OFFICE')}
                    style={{
                      marginTop: '10px',
                      background: '#1e293b',
                      color: '#c084fc',
                      border: '1px solid #a855f7',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Set: At Branch Office
                  </button>
                </div>

                {/* LEG 3 */}
                <div style={{
                  background: currentTrip.bill_submission?.paper_stage === 'PHYSICALLY_SUBMITTED_TO_CLIENT' ? 'rgba(16, 185, 129, 0.15)' : '#091528',
                  borderRadius: '8px',
                  border: currentTrip.bill_submission?.paper_stage === 'PHYSICALLY_SUBMITTED_TO_CLIENT' ? '2px solid #10b981' : '1px solid #1e293b',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#34d399' }}>Leg 3: Client Accounts Desk</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                    Original Bilty + Tax Invoice physically stamped with Acknowledgment Date. Credit clock ticking.
                  </div>
                  <button
                    onClick={() => handlePaperStageUpdate('PHYSICALLY_SUBMITTED_TO_CLIENT')}
                    style={{
                      marginTop: '10px',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Stamp: Client Acknowledged
                  </button>
                </div>

              </div>

              {/* CREDIT CLOCK BANNER */}
              <div style={{
                marginTop: '16px',
                background: '#070f1e',
                borderRadius: '8px',
                border: '1px solid #1e3a5f',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Physical Client Acknowledgment Seal</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    {currentTrip.bill_submission?.client_acknowledgment_ref || "Pending Submission"}
                  </div>
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                    Stamped Date: {currentTrip.bill_submission?.client_desk_submission_date || "Pending"} &bull; Received by: {currentTrip.bill_submission?.client_receiving_clerk || "Inward Clerk"}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Credit Terms Clock ({currentTrip.bill_submission?.credit_terms_days} Days)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>
                    {currentTrip.bill_submission?.credit_clock_days_remaining} Days to RTGS Payment
                  </div>
                  <div style={{ fontSize: '11px', color: '#34d399' }}>
                    Due Date: {currentTrip.bill_submission?.payment_due_date}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 7: FINAL SETTLEMENT & MSME TReDS FACTORING PORTAL */}
        {/* ========================================================= */}
        {activeStage === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#34d399' }}>
                  Stage 7: Final Settlement, Client Debits & MSME TReDS Factoring
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Under the MSME Framework, transporters can upload acknowledged freight invoices onto TReDS (RXIL / Invoicemart) to get 80–90% instant cash in bank within 24 hours from partner banks rather than waiting 60 days.
                </p>
              </div>

              {/* SETTLEMENT EQUATION CARD */}
              <div style={{
                marginTop: '16px',
                background: '#091528',
                borderRadius: '8px',
                border: '1px solid #1e3a5f',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                  The Final Settlement Reconciliation Formula
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', textAlign: 'center' }}>
                  <div style={{ background: '#070f1e', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Agreed Freight</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                      ₹ {currentTrip.final_settlement?.gross_freight_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#f87171' }}>Less: TDS 194C (2%)</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f87171' }}>
                      - ₹ {currentTrip.final_settlement?.tds_deducted_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#f87171' }}>Less: Damage Debit</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f87171' }}>
                      - ₹ {currentTrip.final_settlement?.shortage_damage_debit_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#38bdf8' }}>Less: Advance Paid</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>
                      - ₹ {currentTrip.final_settlement?.advance_already_paid_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 800 }}>Net Balance Due</div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#34d399' }}>
                      ₹ {currentTrip.final_settlement?.net_balance_due_inr?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* TReDS MSME DISCOUNTING BANNER */}
              <div style={{
                marginTop: '16px',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderRadius: '8px',
                border: '1px solid #10b981',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#34d399" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#34d399' }}>
                      TReDS Portal &bull; 24-Hour Instant MSME Liquidity Factoring
                    </span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: '6px 0 2px 0' }}>
                    Instant Cash Advance: ₹ {currentTrip.final_settlement?.treds_instant_cash_inr > 0 ? currentTrip.final_settlement?.treds_instant_cash_inr?.toLocaleString('en-IN') : (currentTrip.final_settlement?.net_balance_due_inr * 0.88).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                    Financing Partner: <strong>{currentTrip.final_settlement?.treds_bank_bidder}</strong>
                  </div>
                </div>

                <button
                  onClick={handleExecuteTreds}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 18px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <DollarSign size={16} />
                  <span>Execute 24hr TReDS Bank Disbursal</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 8: WORKFORCE KHATA & INDIVIDUAL TRUCK STANDALONE P&L */}
        {/* ========================================================= */}
        {activeStage === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SUB-SECTION A: WORKFORCE KHATA LEDGER */}
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                  Universal Workforce & Crew Khata Ledger
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Base Salary + Trip Bata earned - Trip advances taken - Personal advances = Net Salary Payable vs Delayed/Pending.
                </p>
              </div>

              <div style={{ marginTop: '14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#091528', color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                      <th style={{ padding: '8px 10px' }}>Employee</th>
                      <th style={{ padding: '8px 10px' }}>Designation / Truck</th>
                      <th style={{ padding: '8px 10px' }}>Base Salary</th>
                      <th style={{ padding: '8px 10px' }}>Trip Bata</th>
                      <th style={{ padding: '8px 10px' }}>Advances Deducted</th>
                      <th style={{ padding: '8px 10px' }}>Net Payable</th>
                      <th style={{ padding: '8px 10px' }}>Status & UTR</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(workforceKhata.length > 0 ? workforceKhata : [
                      {
                        emp_id: "EMP-201",
                        name: "Ramesh Yadav",
                        designation: "Heavy-Axle Pilot",
                        assigned_truck: "KA-01-AB-1234",
                        monthly_base_salary: 26000,
                        trip_bata_earned: 14500,
                        advances_taken_running_khata: 5000,
                        net_payable_salary: 32050,
                        khata_status: "SETTLED_DISBURSED",
                        utr_ref: "IMPS/6291048821"
                      },
                      {
                        emp_id: "EMP-203",
                        name: "Balwinder Singh",
                        designation: "ODC Hydraulics Driver",
                        assigned_truck: "MH-12-RN-9921",
                        monthly_base_salary: 28000,
                        trip_bata_earned: 16200,
                        advances_taken_running_khata: 8000,
                        net_payable_salary: 30400,
                        khata_status: "AUDIT_HOLD_PENDING",
                        utr_ref: "Pending Verification"
                      }
                    ]).map((emp) => (
                      <tr key={emp.emp_id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>
                          {emp.name} <span style={{ fontSize: '10px', color: '#94a3b8' }}>({emp.emp_id})</span>
                        </td>
                        <td style={{ padding: '10px', color: '#cbd5e1' }}>
                          {emp.designation} &bull; <span style={{ color: '#38bdf8' }}>{emp.assigned_truck}</span>
                        </td>
                        <td style={{ padding: '10px' }}>₹ {emp.monthly_base_salary?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px', color: '#34d399' }}>+ ₹ {emp.trip_bata_earned?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px', color: '#f87171' }}>- ₹ {emp.advances_taken_running_khata?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#ffffff' }}>₹ {emp.net_payable_salary?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            background: emp.khata_status === 'SETTLED_DISBURSED' ? '#065f46' : '#854d0e',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {emp.khata_status}
                          </span>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{emp.utr_ref}</div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {emp.khata_status !== 'SETTLED_DISBURSED' ? (
                            <button
                              onClick={() => handleDisburseKhata(emp.emp_id)}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Disburse IMPS
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>&check; Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SUB-SECTION B: INDIVIDUAL VEHICLE STANDALONE P&L */}
            <div style={{
              background: '#0d1b30',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                  Individual Commercial Vehicle Standalone P&L & Bank EMI Tracker
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Revenue earned this month - Diesel - Tolls - Driver salary - Tyres - Monthly Bank Loan EMI (Tata / HDFC / Sundaram) = Standalone Truck Profit.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {(truckPnl.length > 0 ? truckPnl : [
                  {
                    truck_id: "TRK-001",
                    vehicle_no: "KA-01-AB-1234",
                    model: "Tata Prima 5530.S (16-Wheeler)",
                    financier: "Tata Motors Finance Limited",
                    monthly_bank_emi_inr: 68500.0,
                    monthly_freight_revenue_inr: 285000.0,
                    diesel_fuel_spend_inr: 112000.0,
                    fastag_toll_spend_inr: 18400.0,
                    driver_wages_and_bata_inr: 42000.0,
                    tyre_wear_and_maintenance_inr: 14500.0,
                    gross_operating_surplus_inr: 98100.0,
                    net_standalone_profit_after_emi_inr: 29600.0,
                    emi_coverage_ratio: 1.43,
                    asset_health: "PROFITABLE_HEALTHY"
                  },
                  {
                    truck_id: "TRK-002",
                    vehicle_no: "MH-12-RN-9921",
                    model: "BharatBenz 4028T (14-Wheeler)",
                    financier: "HDFC Bank Commercial Vehicle Loan",
                    monthly_bank_emi_inr: 54200.0,
                    monthly_freight_revenue_inr: 240000.0,
                    diesel_fuel_spend_inr: 96500.0,
                    fastag_toll_spend_inr: 16200.0,
                    driver_wages_and_bata_inr: 38000.0,
                    tyre_wear_and_maintenance_inr: 12000.0,
                    gross_operating_surplus_inr: 77300.0,
                    net_standalone_profit_after_emi_inr: 23100.0,
                    emi_coverage_ratio: 1.42,
                    asset_health: "PROFITABLE_HEALTHY"
                  }
                ]).map((trk) => (
                  <div
                    key={trk.truck_id}
                    style={{
                      background: '#091528',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>{trk.vehicle_no}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{trk.model}</div>
                      </div>
                      <span style={{
                        background: trk.net_standalone_profit_after_emi_inr > 0 ? '#065f46' : '#991b1b',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {trk.asset_health}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Freight Revenue:</span>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>₹ {trk.monthly_freight_revenue_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Diesel Spend:</span>
                        <span style={{ color: '#f87171' }}>- ₹ {trk.diesel_fuel_spend_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>FASTag Tolls:</span>
                        <span style={{ color: '#f87171' }}>- ₹ {trk.fastag_toll_spend_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Driver Wages & Bata:</span>
                        <span style={{ color: '#f87171' }}>- ₹ {trk.driver_wages_and_bata_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Tyre & Maintenance:</span>
                        <span style={{ color: '#f87171' }}>- ₹ {trk.tyre_wear_and_maintenance_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '4px', fontWeight: 700 }}>
                        <span style={{ color: '#38bdf8' }}>Operating Surplus:</span>
                        <span style={{ color: '#38bdf8' }}>₹ {trk.gross_operating_surplus_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                        <span>Monthly Bank EMI ({trk.financier.split(' ')[0]}):</span>
                        <span>- ₹ {trk.monthly_bank_emi_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '6px', fontSize: '13px', fontWeight: 900 }}>
                        <span style={{ color: '#34d399' }}>Net Truck Profit:</span>
                        <span style={{ color: trk.net_standalone_profit_after_emi_inr > 0 ? '#34d399' : '#ef4444' }}>
                          ₹ {trk.net_standalone_profit_after_emi_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
