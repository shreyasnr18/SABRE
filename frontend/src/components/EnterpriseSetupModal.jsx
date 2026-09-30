import React, { useState } from 'react';
import { 
  X, Package, Truck, Box, Layers, Users, CheckCircle, Plus, 
  ShieldAlert, DollarSign, Lock, Leaf, Scale, Activity, AlertTriangle 
} from 'lucide-react';

export default function EnterpriseSetupModal({ isOpen, initialTab = 'order', initialType, onClose, onCreated }) {
  if (isOpen === false) return null;

  const resolvedInitial = initialTab || initialType || 'order';
  const [activeType, setActiveType] = useState(resolvedInitial);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Order Form State
  const [orderForm, setOrderForm] = useState({
    customer: '',
    cargo_type: '',
    quantity: '10 Tons',
    origin: '',
    destination: '',
    vehicle_no: '',
    driver: '',
    driver_phone: '+91 ',
    total_amount_inr: 350000,
    status: 'In Transit'
  });

  // 2. Truck Form State
  const [truckForm, setTruckForm] = useState({
    name: '',
    payload_range: '5 - 15 tons',
    mileage_kmpl: '6 - 9 km/l',
    max_speed_kmh: '80 km/h',
    height_m: '3.0 m',
    width_m: '2.4 m',
    length_m: '8.5 m',
    bulkiness: 'Medium',
    common_use: 'General Freight Distribution',
    popular_brands: 'Tata, Ashok Leyland, Eicher',
    axles: 2
  });

  // 3. Container Form State
  const [containerForm, setContainerForm] = useState({
    name: '',
    iso_code: '45G1',
    tare_weight_kg: 3800,
    max_payload_kg: 28500,
    internal_volume_cbm: 76.2,
    length_ft: '40 ft',
    primary_cargo: 'General Merchandise'
  });

  // 4. Cargo / Material Form State
  const [cargoForm, setCargoForm] = useState({
    title: '',
    sector: 'Manufacturing',
    category_code: 'MAT-01',
    density_class: 'Medium Density',
    handling_equipment: 'Forklift 3-Ton',
    ideal_truck_type: 'Enclosed Container Truck',
    items: 'Finished Goods, Raw Materials'
  });

  // 5. Employee Form State
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    designation: '',
    department: 'Operations',
    branch: '',
    phone: '+91 ',
    email: '',
    license_grade: 'Commercial Heavy'
  });

  // 6. Sovereign Service 1: PlantGuard Form State (VP Operations)
  const [plantguardForm, setPlantguardForm] = useState({
    plant_name: '',
    line_stoppage_loss_inr_per_hour: 4500000,
    critical_component: '',
    minimum_buffer_stock_hours: 4.0,
    express_corridor_toll_escalation: true,
    receiving_dock_window: '18:30 - 20:00 IST'
  });

  // 7. Sovereign Service 2: CapitalLock Form State (CFO / Finance)
  const [capitallockForm, setCapitallockForm] = useState({
    consignor: '',
    consignee: '',
    in_transit_capital_inr: 18500000,
    interest_rate_pct: 9.0,
    fuel_price_escalation_clause: '±2.0% Diesel Indexation peg to IOCL Mumbai',
    free_demurrage_hours: 3.0,
    demurrage_hourly_rate_inr: 1200,
    escrow_release_condition: 'Dual-Signed Clean Cryptographic ePOD with Zero Weighbridge Variance'
  });

  // 8. Sovereign Service 3: ShieldGate Form State (Chief Risk Officer)
  const [shieldgateForm, setShieldgateForm] = useState({
    corridor: '',
    carrier_name: '',
    zero_subcontracting_enforcement: true,
    telematics_seal_type: 'Cryptographic GPS E-Seal with OTP Decryption',
    max_geofence_deviation_meters: 500,
    gst_section_129_indemnity_inr: 5000000
  });

  // 9. Sovereign Service 4: EcoYield Form State (Head of Procurement & ESG)
  const [ecoyieldForm, setEcoyieldForm] = useState({
    industry_sector: '',
    max_scope3_emission_g_per_tkm: 62.5,
    deadhead_reduction_commitment_pct: 75,
    tariff_discount_rebate_pct: 24.5,
    carrier_esg_trust_tier: 'Tier-1 Sovereign Clean Fleet'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let endpoint = '';
      let bodyData = {};

      if (activeType === 'order') {
        if (!orderForm.customer.trim() || !orderForm.origin.trim() || !orderForm.destination.trim()) {
          setErrorMsg('Customer, Origin and Destination are required.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/oms/orders';
        bodyData = {
          ...orderForm,
          total_amount_inr: parseFloat(orderForm.total_amount_inr) || 0
        };
      } else if (activeType === 'truck') {
        if (!truckForm.name.trim()) {
          setErrorMsg('Truck model/name is required.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/specs/trucks';
        bodyData = {
          ...truckForm,
          popular_brands: truckForm.popular_brands.split(',').map(s => s.trim()).filter(Boolean),
          axles: parseInt(truckForm.axles) || 2
        };
      } else if (activeType === 'container') {
        if (!containerForm.name.trim()) {
          setErrorMsg('Container name is required.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/specs/containers';
        bodyData = {
          ...containerForm,
          tare_weight_kg: parseInt(containerForm.tare_weight_kg) || 0,
          max_payload_kg: parseInt(containerForm.max_payload_kg) || 0,
          internal_volume_cbm: parseFloat(containerForm.internal_volume_cbm) || 0
        };
      } else if (activeType === 'cargo') {
        if (!cargoForm.title.trim()) {
          setErrorMsg('Material / Cargo title is required.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/specs/cargo';
        bodyData = {
          ...cargoForm,
          items: cargoForm.items.split(',').map(s => s.trim()).filter(Boolean)
        };
      } else if (activeType === 'employee') {
        if (!employeeForm.name.trim() || !employeeForm.designation.trim()) {
          setErrorMsg('Name and Designation are required.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/workforce/employees';
        bodyData = { ...employeeForm };
      } else if (activeType === 'plantguard') {
        if (!plantguardForm.plant_name.trim() || !plantguardForm.critical_component.trim()) {
          setErrorMsg('Plant Name and Critical Component are required for PlantGuard rule.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/services/plantguard/rules';
        bodyData = {
          plant_name: plantguardForm.plant_name.trim(),
          line_stoppage_loss_inr_per_hour: parseFloat(plantguardForm.line_stoppage_loss_inr_per_hour) || 0,
          critical_component: plantguardForm.critical_component.trim(),
          minimum_buffer_stock_hours: parseFloat(plantguardForm.minimum_buffer_stock_hours) || 4.0,
          express_corridor_toll_escalation: Boolean(plantguardForm.express_corridor_toll_escalation),
          receiving_dock_window: plantguardForm.receiving_dock_window
        };
      } else if (activeType === 'capitallock') {
        if (!capitallockForm.consignor.trim() || !capitallockForm.consignee.trim()) {
          setErrorMsg('Consignor and Consignee are required for CapitalLock escrow.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/services/capitallock/escrows';
        const inTransitCap = parseFloat(capitallockForm.in_transit_capital_inr) || 0;
        const interestRate = parseFloat(capitallockForm.interest_rate_pct) || 9.0;
        const dailyDrag = Math.round((inTransitCap * (interestRate / 100)) / 365);
        bodyData = {
          consignor: capitallockForm.consignor.trim(),
          consignee: capitallockForm.consignee.trim(),
          in_transit_capital_inr: inTransitCap,
          daily_working_capital_interest_drag_inr: dailyDrag,
          fuel_price_escalation_clause: capitallockForm.fuel_price_escalation_clause,
          demurrage_allocation_hours: `Free ${capitallockForm.free_demurrage_hours} hrs, ₹ ${capitallockForm.demurrage_hourly_rate_inr}/hr Carrier Split thereafter`,
          escrow_release_condition: capitallockForm.escrow_release_condition
        };
      } else if (activeType === 'shieldgate') {
        if (!shieldgateForm.corridor.trim() || !shieldgateForm.carrier_name.trim()) {
          setErrorMsg('Corridor and Primary Carrier are required for ShieldGate policy.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/services/shieldgate/policies';
        bodyData = {
          corridor: shieldgateForm.corridor.trim(),
          carrier_name: shieldgateForm.carrier_name.trim(),
          zero_subcontracting_enforcement: Boolean(shieldgateForm.zero_subcontracting_enforcement),
          telematics_seal_type: shieldgateForm.telematics_seal_type,
          max_geofence_deviation_meters: parseInt(shieldgateForm.max_geofence_deviation_meters) || 500,
          gst_section_129_indemnity_clause: `₹ ${(parseFloat(shieldgateForm.gst_section_129_indemnity_inr) || 0).toLocaleString()} Carrier Indemnity Bond for E-Way Bill transit seizures`
        };
      } else if (activeType === 'ecoyield') {
        if (!ecoyieldForm.industry_sector.trim()) {
          setErrorMsg('Industry Sector is required for EcoYield benchmark.');
          setSubmitting(false);
          return;
        }
        endpoint = '/api/v1/services/ecoyield/benchmarks';
        bodyData = {
          industry_sector: ecoyieldForm.industry_sector.trim(),
          max_scope3_emission_g_per_tkm: parseFloat(ecoyieldForm.max_scope3_emission_g_per_tkm) || 60.0,
          deadhead_reduction_commitment_pct: parseFloat(ecoyieldForm.deadhead_reduction_commitment_pct) || 70,
          tariff_discount_rebate_pct: parseFloat(ecoyieldForm.tariff_discount_rebate_pct) || 20,
          carrier_esg_trust_tier: ecoyieldForm.carrier_esg_trust_tier
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        throw new Error(`Server returned error ${res.status}`);
      }

      const result = await res.json();
      if (onCreated) onCreated(result.message || 'Entity configured successfully.');
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save entity to backend. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const ENTITY_TABS = [
    { id: 'order', label: 'Freight Order', icon: Package, badge: 'Logistics' },
    { id: 'truck', label: 'Truck Spec', icon: Truck, badge: 'Fleet' },
    { id: 'container', label: 'Container', icon: Box, badge: 'Fleet' },
    { id: 'cargo', label: 'Material Profile', icon: Layers, badge: 'Catalog' },
    { id: 'employee', label: 'Personnel', icon: Users, badge: 'Crew' },
    { id: 'plantguard', label: 'Cadence', icon: ShieldAlert, badge: 'VP Ops' },
    { id: 'capitallock', label: 'Parity', icon: DollarSign, badge: 'CFO' },
    { id: 'shieldgate', label: 'Sentry', icon: Lock, badge: 'CRO' },
    { id: 'ecoyield', label: 'Flux', icon: Leaf, badge: 'ESG' }
  ];

  // Allow pressing ESC to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
        background: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '12px',
        width: '680px',
        maxWidth: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          background: '#1e3a5f',
          color: '#ffffff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid #000000'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ENTERPRISE SERVICE PROVISIONING</span>
            </div>
            <div style={{ fontSize: '11px', color: '#a5d6a7', marginTop: '2px' }}>
              Provision fleet specifications, material profiles, and executive operational policies (VP Ops / CFO / CRO / ESG)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Entity Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: '#f8fafc',
          borderBottom: '1px solid #000000',
          padding: '8px 14px',
          gap: '5px',
          overflowX: 'auto'
        }}>
          {ENTITY_TABS.map(tab => {
            const isActive = activeType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveType(tab.id);
                  setErrorMsg(null);
                }}
                style={{
                  background: isActive ? '#1e3a5f' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: '1px solid #000000',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? 'inset 0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.1s ease'
                }}
              >
                <Icon size={12} color={isActive ? '#ffffff' : '#1e3a5f'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 4px',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#475569'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{
          padding: '18px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1
        }}>

          {errorMsg && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #f87171',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          {/* 1. FREIGHT ORDER FORM */}
          {activeType === 'order' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Customer / Enterprise Account *</label>
                  <input
                    required
                    placeholder="e.g. Maruti Suzuki India Ltd"
                    value={orderForm.customer}
                    onChange={e => setOrderForm({ ...orderForm, customer: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Cargo Description *</label>
                  <input
                    required
                    placeholder="e.g. Automotive Powertrain Subassemblies"
                    value={orderForm.cargo_type}
                    onChange={e => setOrderForm({ ...orderForm, cargo_type: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Origin Hub / Port *</label>
                  <input
                    required
                    placeholder="e.g. JNPT Nhava Sheva Port, MH"
                    value={orderForm.origin}
                    onChange={e => setOrderForm({ ...orderForm, origin: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Destination Hub / Plant *</label>
                  <input
                    required
                    placeholder="e.g. Manesar Powertrain Complex, HR"
                    value={orderForm.destination}
                    onChange={e => setOrderForm({ ...orderForm, destination: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Assigned Vehicle No</label>
                  <input
                    placeholder="e.g. MH-12-RN-8821"
                    value={orderForm.vehicle_no}
                    onChange={e => setOrderForm({ ...orderForm, vehicle_no: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Designated Driver</label>
                  <input
                    placeholder="e.g. Rajeshwar Singh"
                    value={orderForm.driver}
                    onChange={e => setOrderForm({ ...orderForm, driver: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Consignment Value (₹)</label>
                  <input
                    type="number"
                    value={orderForm.total_amount_inr}
                    onChange={e => setOrderForm({ ...orderForm, total_amount_inr: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* 2. TRUCK FORM */}
          {activeType === 'truck' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Truck Model &amp; Body Type *</label>
                  <input
                    required
                    placeholder="e.g. Tata Prima 5530.S Multi-Axle Tractor"
                    value={truckForm.name}
                    onChange={e => setTruckForm({ ...truckForm, name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Payload Rating</label>
                  <input
                    placeholder="e.g. 28 - 35 tons"
                    value={truckForm.payload_range}
                    onChange={e => setTruckForm({ ...truckForm, payload_range: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Length (m)</label>
                  <input
                    placeholder="e.g. 14.5 m"
                    value={truckForm.length_m}
                    onChange={e => setTruckForm({ ...truckForm, length_m: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Axles</label>
                  <input
                    type="number"
                    value={truckForm.axles}
                    onChange={e => setTruckForm({ ...truckForm, axles: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Mileage (km/l)</label>
                  <input
                    placeholder="e.g. 3.8 - 4.5 km/l"
                    value={truckForm.mileage_kmpl}
                    onChange={e => setTruckForm({ ...truckForm, mileage_kmpl: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Primary Operational Duty</label>
                <input
                  placeholder="e.g. Long-haul interstate intermodal container delivery"
                  value={truckForm.common_use}
                  onChange={e => setTruckForm({ ...truckForm, common_use: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                />
              </div>
            </>
          )}

          {/* 3. CONTAINER FORM */}
          {activeType === 'container' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Container Standard Name *</label>
                  <input
                    required
                    placeholder="e.g. 40ft High Cube ISO Dry Freight Box"
                    value={containerForm.name}
                    onChange={e => setContainerForm({ ...containerForm, name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>ISO Standard Code</label>
                  <input
                    placeholder="e.g. 45G1 / 22G1"
                    value={containerForm.iso_code}
                    onChange={e => setContainerForm({ ...containerForm, iso_code: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Tare Weight (kg)</label>
                  <input
                    type="number"
                    value={containerForm.tare_weight_kg}
                    onChange={e => setContainerForm({ ...containerForm, tare_weight_kg: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Max Payload (kg)</label>
                  <input
                    type="number"
                    value={containerForm.max_payload_kg}
                    onChange={e => setContainerForm({ ...containerForm, max_payload_kg: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Volume (CBM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={containerForm.internal_volume_cbm}
                    onChange={e => setContainerForm({ ...containerForm, internal_volume_cbm: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* 4. CARGO / MATERIAL FORM */}
          {activeType === 'cargo' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Material / Commodity Profile *</label>
                  <input
                    required
                    placeholder="e.g. High-Grade Industrial Steel Coils (CRCA)"
                    value={cargoForm.title}
                    onChange={e => setCargoForm({ ...cargoForm, title: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Category Code</label>
                  <input
                    placeholder="e.g. STL-CR-09"
                    value={cargoForm.category_code}
                    onChange={e => setCargoForm({ ...cargoForm, category_code: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Material SKU List (comma separated)</label>
                <input
                  placeholder="Cold Rolled Sheet, Galvanized Strip, Coil Cores"
                  value={cargoForm.items}
                  onChange={e => setCargoForm({ ...cargoForm, items: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                />
              </div>
            </>
          )}

          {/* 5. WORKFORCE FORM */}
          {activeType === 'employee' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Ramesh K. Verma"
                    value={employeeForm.name}
                    onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Designation *</label>
                  <input
                    required
                    placeholder="e.g. Lead Intermodal Dispatch Controller"
                    value={employeeForm.designation}
                    onChange={e => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Department</label>
                  <select
                    value={employeeForm.department}
                    onChange={e => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  >
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                    <option value="Drivers">Drivers</option>
                    <option value="Warehouse & Yard">Warehouse &amp; Yard</option>
                    <option value="Maintenance & Fleet">Maintenance &amp; Fleet</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Branch Hub</label>
                  <input
                    placeholder="e.g. Pune Chakan Logistics Terminal"
                    value={employeeForm.branch}
                    onChange={e => setEmployeeForm({ ...employeeForm, branch: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* 6. SOVEREIGN SERVICE 1: PLANTGUARD (VP Operations) */}
          {activeType === 'plantguard' && (
            <>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#1e3a5f',
                lineHeight: '1.4'
              }}>
                <strong>Cadence Operational Pacing Policy</strong><br />
                Monitors manufacturing assembly plants against inbound component stockouts. If in-transit buffer stock drops below threshold, automatically triggers express toll escalation and priority green corridor clearance.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Plant / Gigafactory Name *</label>
                  <input
                    required
                    placeholder="e.g. Pune EV Powertrain Gigafactory"
                    value={plantguardForm.plant_name}
                    onChange={e => setPlantguardForm({ ...plantguardForm, plant_name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>Line Stoppage Loss (₹/hr) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4500000"
                    value={plantguardForm.line_stoppage_loss_inr_per_hour}
                    onChange={e => setPlantguardForm({ ...plantguardForm, line_stoppage_loss_inr_per_hour: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Critical Inbound Component *</label>
                  <input
                    required
                    placeholder="e.g. Lithium-Ion Battery BMS Modules"
                    value={plantguardForm.critical_component}
                    onChange={e => setPlantguardForm({ ...plantguardForm, critical_component: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Min Buffer Stock (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={plantguardForm.minimum_buffer_stock_hours}
                    onChange={e => setPlantguardForm({ ...plantguardForm, minimum_buffer_stock_hours: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Receiving Dock Window</label>
                  <input
                    placeholder="e.g. 18:30 - 20:00 IST"
                    value={plantguardForm.receiving_dock_window}
                    onChange={e => setPlantguardForm({ ...plantguardForm, receiving_dock_window: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
                  <input
                    type="checkbox"
                    id="express_escalation"
                    checked={plantguardForm.express_corridor_toll_escalation}
                    onChange={e => setPlantguardForm({ ...plantguardForm, express_corridor_toll_escalation: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="express_escalation" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                    Auto-Escalate Express Toll FASTag Priority
                  </label>
                </div>
              </div>
            </>
          )}

          {/* 7. SOVEREIGN SERVICE 2: CAPITALLOCK (CFO / Finance) */}
          {activeType === 'capitallock' && (
            <>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#14532d',
                lineHeight: '1.4'
              }}>
                <strong>Parity Settlement &amp; Float Policy</strong><br />
                Protects from in-transit working capital drag. Automatically indexes diesel price shifts and releases settlement upon dual-signed cryptographic ePOD and verified weighbridge tare.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Consignor (Shipper) *</label>
                  <input
                    required
                    placeholder="e.g. Tata Steel Kalinganagar"
                    value={capitallockForm.consignor}
                    onChange={e => setCapitallockForm({ ...capitallockForm, consignor: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Consignee (Buyer Plant) *</label>
                  <input
                    required
                    placeholder="e.g. Maruti Suzuki Manesar Plant"
                    value={capitallockForm.consignee}
                    onChange={e => setCapitallockForm({ ...capitallockForm, consignee: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>In-Transit Trapped Capital (₹) *</label>
                  <input
                    type="number"
                    required
                    value={capitallockForm.in_transit_capital_inr}
                    onChange={e => setCapitallockForm({ ...capitallockForm, in_transit_capital_inr: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Cost of Capital (% p.a.)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={capitallockForm.interest_rate_pct}
                    onChange={e => setCapitallockForm({ ...capitallockForm, interest_rate_pct: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Free Demurrage Window (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={capitallockForm.free_demurrage_hours}
                    onChange={e => setCapitallockForm({ ...capitallockForm, free_demurrage_hours: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Demurrage Penalty (₹/hour)</label>
                  <input
                    type="number"
                    value={capitallockForm.demurrage_hourly_rate_inr}
                    onChange={e => setCapitallockForm({ ...capitallockForm, demurrage_hourly_rate_inr: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Escrow Release Cryptographic Requirement</label>
                <input
                  value={capitallockForm.escrow_release_condition}
                  onChange={e => setCapitallockForm({ ...capitallockForm, escrow_release_condition: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                />
              </div>
            </>
          )}

          {/* 8. SOVEREIGN SERVICE 3: SHIELDGATE (Chief Risk Officer) */}
          {activeType === 'shieldgate' && (
            <>
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fdba74',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#9a3412',
                lineHeight: '1.4'
              }}>
                <strong>Sentry Custody &amp; Transit Governance Policy</strong><br />
                Enforces carrier custody provenance and anti-delegation validation. Mandates GPS cryptographic e-seals and statutory transit indemnity coverage.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Corridor Route *</label>
                  <input
                    required
                    placeholder="e.g. Mumbai JNPT Port to Delhi NCR Industrial Belt"
                    value={shieldgateForm.corridor}
                    onChange={e => setShieldgateForm({ ...shieldgateForm, corridor: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Contracted Carrier *</label>
                  <input
                    required
                    placeholder="e.g. BlueDart Sovereign Freight Division"
                    value={shieldgateForm.carrier_name}
                    onChange={e => setShieldgateForm({ ...shieldgateForm, carrier_name: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Telematics E-Seal Protocol</label>
                  <input
                    value={shieldgateForm.telematics_seal_type}
                    onChange={e => setShieldgateForm({ ...shieldgateForm, telematics_seal_type: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>Max Geofence Deviation (m)</label>
                  <input
                    type="number"
                    value={shieldgateForm.max_geofence_deviation_meters}
                    onChange={e => setShieldgateForm({ ...shieldgateForm, max_geofence_deviation_meters: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>GST Section 129 Seizure Indemnity Bond (₹)</label>
                  <input
                    type="number"
                    value={shieldgateForm.gst_section_129_indemnity_inr}
                    onChange={e => setShieldgateForm({ ...shieldgateForm, gst_section_129_indemnity_inr: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
                  <input
                    type="checkbox"
                    id="anti_subcontracting"
                    checked={shieldgateForm.zero_subcontracting_enforcement}
                    onChange={e => setShieldgateForm({ ...shieldgateForm, zero_subcontracting_enforcement: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="anti_subcontracting" style={{ fontSize: '11.5px', fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>
                    Zero-Tolerance Anti-Subcontracting Enforcement
                  </label>
                </div>
              </div>
            </>
          )}

          {/* 9. SOVEREIGN SERVICE 4: ECOYIELD (Head of Procurement & ESG) */}
          {activeType === 'ecoyield' && (
            <>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#065f46',
                lineHeight: '1.4'
              }}>
                <strong>Flux Yield &amp; Backhaul Optimization Policy</strong><br />
                Enforces Scope 3 carbon intensity thresholds (gCO₂/ton-km) coupled with contractual reverse haul commitments to eliminate empty deadhead miles.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Industry Sector *</label>
                  <input
                    required
                    placeholder="e.g. Automotive & Heavy Machinery"
                    value={ecoyieldForm.industry_sector}
                    onChange={e => setEcoyieldForm({ ...ecoyieldForm, industry_sector: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Carrier ESG Trust Tier</label>
                  <select
                    value={ecoyieldForm.carrier_esg_trust_tier}
                    onChange={e => setEcoyieldForm({ ...ecoyieldForm, carrier_esg_trust_tier: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  >
                    <option value="Tier-1 Sovereign Clean Fleet">Tier-1 Sovereign Clean Fleet</option>
                    <option value="Tier-2 Certified LNG/EV Fleet">Tier-2 Certified LNG/EV Fleet</option>
                    <option value="Tier-3 Verified Low-Emission Fleet">Tier-3 Verified Low-Emission Fleet</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Scope 3 Cap (gCO₂/t-km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ecoyieldForm.max_scope3_emission_g_per_tkm}
                    onChange={e => setEcoyieldForm({ ...ecoyieldForm, max_scope3_emission_g_per_tkm: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Deadhead Reduction (%)</label>
                  <input
                    type="number"
                    value={ecoyieldForm.deadhead_reduction_commitment_pct}
                    onChange={e => setEcoyieldForm({ ...ecoyieldForm, deadhead_reduction_commitment_pct: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>Tariff Discount Rebate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ecoyieldForm.tariff_discount_rebate_pct}
                    onChange={e => setEcoyieldForm({ ...ecoyieldForm, tariff_discount_rebate_pct: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '5px', border: '1px solid #000000', fontSize: '12px' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#2e7d32',
                color: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '6px',
                padding: '7px 18px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(46, 125, 50, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>{submitting ? 'Registering with Cloud Cluster...' : 'Save & Deploy Policy'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
