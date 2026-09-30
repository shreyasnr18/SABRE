import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, Globe, HardDrive, Database, Activity, Shield, 
  Cpu, RefreshCw, ArrowRight, Zap, Play, Power, Layers,
  ChevronRight, Folder, ExternalLink, Check, CheckCircle
} from 'lucide-react';
import ServiceConsoleModal from './ServiceConsoleModal';

export default function PaasCloudCockpit() {
  // Navigation View: 'home' | 'corridors' | 'inventory' | 'workbenches' | 'routing' | 'audit'
  const [consoleView, setConsoleView] = useState('home');

  // Resource Filter for Table: 'ALL' | 'CORRIDOR' | 'COMPUTE' | 'AI' | 'DATABASE'
  const [resourceFilter, setResourceFilter] = useState('ALL');

  // Toast Notification state
  const [toastMsg, setToastMsg] = useState(null);

  // Navigation State for Inventory View
  const [selectedNav, setSelectedNav] = useState('ALL'); 

  const [catalog, setCatalog] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Split-Pane Inspector State
  const [selectedServiceId, setSelectedServiceId] = useState('COMP-01');
  const [serviceDetail, setServiceDetail] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('description'); // 'description' | 'config' | 'operations' | 'logs'
  const [configFormData, setConfigFormData] = useState({});
  const [configMsg, setConfigMsg] = useState(null);
  const [diagnosticOutput, setDiagnosticOutput] = useState(null);
  const [probing, setProbing] = useState(false);
  const [provisioning, setProvisioning] = useState(false);

  // Modal / Blade Console Window state
  const [modalServiceId, setModalServiceId] = useState(null);

  // Interactive Corridor State
  const [shiradiTemp, setShiradiTemp] = useState(420);
  const [shiradiRetarder, setShiradiRetarder] = useState(false);
  const [shiradiStatusText, setShiradiStatusText] = useState('Descent Incline Monitoring');
  const [sampajeFriction, setSampajeFriction] = useState(0.74);
  const [sampajePingStatus, setSampajePingStatus] = useState(null);
  const [charmadiAuditMsg, setCharmadiAuditMsg] = useState(null);

  // Interactive Predictor State (Service AI-49)
  const [truckId, setTruckId] = useState('KA-04-AB-9921');
  const [currentTemp, setCurrentTemp] = useState(420);
  const [speedKmh, setSpeedKmh] = useState(52);
  const [gvwTonnes, setGvwTonnes] = useState(42);
  const [slopePct, setSlopePct] = useState(-6.5);
  const [retarderOn, setRetarderOn] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [forecasting, setForecasting] = useState(false);

  // Interactive Proximity State (Service DB-25)
  const [latInput, setLatInput] = useState(12.8732);
  const [lonInput, setLonInput] = useState(75.6450);
  const [proximityResult, setProximityResult] = useState(null);
  const [scanningProximity, setScanningProximity] = useState(false);

  // Interactive Failover State (Service NET-09)
  const [failoverMsg, setFailoverMsg] = useState('');
  const [activeCorridorDisplay, setActiveCorridorDisplay] = useState('NH-75 (Shiradi Ghat)');
  const [failingOver, setFailingOver] = useState(false);

  // Regulatory Audit Logs (Service SEC-45)
  const [auditLogs, setAuditLogs] = useState([]);
  const [verifyingAudit, setVerifyingAudit] = useState(false);
  const [auditVerificationMsg, setAuditVerificationMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Fetch catalog & audit trail
  const fetchCloudData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/paas/cloud/catalog').then(r => r.json()).catch(() => null),
      fetch('/api/v1/paas/cloud/security/audit-trail').then(r => r.json()).catch(() => [])
    ]).then(([catData, trailData]) => {
      setCatalog(catData);
      setAuditLogs(trailData || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  // Fetch detailed spec for selected service
  const fetchServiceDetail = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/paas/cloud/services/${id}`);
      if (res.ok) {
        const data = await res.json();
        setServiceDetail(data);
        setConfigFormData(data.current_config || {});
        setConfigMsg(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Workbench Actions (Declared before useEffect to avoid hoisting/initialization warnings)
  const runThermodynamicPrediction = async () => {
    try {
      setForecasting(true);
      const url = `/api/v1/paas/cloud/ai/predictive-brake/${truckId}?current_temp=${currentTemp}&speed=${speedKmh}&weight=${gvwTonnes}&gradient=${slopePct}&retarder=${retarderOn}`;
      const res = await fetch(url);
      const data = await res.json();
      setPredictionResult(data);
      setForecasting(false);
      showToast('15-Minute Thermodynamic Horizon Forecast calculated');
    } catch (err) {
      console.error(err);
      setForecasting(false);
    }
  };

  const runEscapeRampProximity = async () => {
    try {
      setScanningProximity(true);
      const res = await fetch(`/api/v1/paas/cloud/database/proximity?lat=${latInput}&lon=${lonInput}`);
      const data = await res.json();
      setProximityResult(data);
      setScanningProximity(false);
      showToast('Sub-2ms Spatial Radar scan completed');
    } catch (err) {
      console.error(err);
      setScanningProximity(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
    runThermodynamicPrediction();
    runEscapeRampProximity();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchServiceDetail(selectedServiceId);
    }
  }, [selectedServiceId]);

  // Corridor 1 Actions
  const handleSimulateThermalSpike = async () => {
    try {
      await fetch('/api/v1/paas/cloud/ai/predictive-brake/KA-04-AB-9921?current_temp=510&speed=64&weight=48&gradient=-7.5&retarder=false');
      setShiradiTemp(510);
      setShiradiRetarder(false);
      setShiradiStatusText('THERMAL OVERRUN WARNING (> 500°C)');
      showToast('CRITICAL: Brake thermal spike injected (510°C) on KA-04-AB-9921');
    } catch (e) {
      console.error(e);
    }
  };

  const handleEngageRetarder = async () => {
    try {
      await fetch('/api/v1/paas/cloud/ai/predictive-brake/KA-04-AB-9921?current_temp=380&speed=40&weight=48&gradient=-7.5&retarder=true');
      setShiradiTemp(380);
      setShiradiRetarder(true);
      setShiradiStatusText('Hydraulic Retarder Active (Dissipating)');
      showToast('Retarder Stage 2 Engaged: Thermal drop to 380°C');
    } catch (e) {
      console.error(e);
    }
  };

  // Corridor 2 Actions
  const handlePingSurfaceSensors = async () => {
    try {
      setSampajePingStatus('Scanning optical roadway friction nodes...');
      await fetch('/api/v1/paas/cloud/services/NET-09/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SurfaceFrictionTelemetryScan', payload: { corridor: 'NH-275' } })
      });
      setSampajeFriction(0.76);
      setSampajePingStatus('Friction Verified: 0.76 mu (Dry Dense Tarmac)');
      showToast('NH-275 Surface Sensor Array: 0.76 mu Nominal Friction');
      setTimeout(() => setSampajePingStatus(null), 4000);
    } catch {
      setSampajePingStatus('Scan completed.');
    }
  };

  // Corridor 3 Actions
  const handleWeighInMotionAudit = () => {
    setCharmadiAuditMsg('Dynamic WIM Audit: 18.4T Multi-Axle Intercepted & Diverted to NH-75');
    showToast('NH-48 Gate: Overweight vehicle diverted via automated policy');
    setTimeout(() => setCharmadiAuditMsg(null), 4000);
  };

  // Service Configuration Save
  const handleSaveConfig = async () => {
    try {
      setConfigMsg(null);
      const res = await fetch(`/api/v1/paas/cloud/services/${selectedServiceId}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configFormData })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setConfigMsg({ type: 'success', text: 'Parameters saved and synced with cluster.' });
        fetchServiceDetail(selectedServiceId);
        fetchCloudData();
        showToast('Resource configuration updated successfully.');
      } else {
        setConfigMsg({ type: 'error', text: data.message || 'Save failed.' });
      }
    } catch (e) {
      setConfigMsg({ type: 'error', text: e.message });
    }
  };

  // Service Provisioning Toggle
  const handleToggleProvision = async (action, targetId = null) => {
    const sId = targetId || selectedServiceId;
    try {
      setProvisioning(true);
      setConfigMsg(null);
      const endpoint = action === 'provision' 
        ? `/api/v1/paas/cloud/services/${sId}/provision`
        : `/api/v1/paas/cloud/services/${sId}/decommission`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        fetchServiceDetail(sId);
        fetchCloudData();
        showToast(`Resource ${sId} ${action === 'provision' ? 'Provisioned (ACTIVE)' : 'Decommissioned (STANDBY)'}`);
      }
      setProvisioning(false);
    } catch (e) {
      console.error(e);
      setProvisioning(false);
    }
  };

  // Diagnostic Probe Execution
  const handleExecuteProbe = async (targetId = null) => {
    const sId = targetId || selectedServiceId;
    try {
      setProbing(true);
      setDiagnosticOutput(null);
      const res = await fetch(`/api/v1/paas/cloud/services/${sId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LiveOperationalProbe', payload: { triggered_by: 'console_user' } })
      });
      const data = await res.json();
      setDiagnosticOutput(data);
      setProbing(false);
      fetchServiceDetail(sId);
      showToast(`Diagnostic probe succeeded for ${sId}`);
    } catch (e) {
      setDiagnosticOutput({ error: e.message });
      setProbing(false);
    }
  };

  // (Workbench actions runThermodynamicPrediction and runEscapeRampProximity hoisted above)

  const handleTriggerFailover = async () => {
    setFailingOver(true);
    setFailoverMsg('Automated routing evaluating health checks & diverting traffic...');
    try {
      const res = await fetch('/api/v1/paas/cloud/networking/failover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: 'corridor-bengaluru-mangalore',
          reason: 'LANDSLIDE_DISRUPTION_SHIRADI_KM_124'
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setActiveCorridorDisplay(data.active_corridor);
        setFailoverMsg(`FAILOVER ENGAGED: Traffic diverted to ${data.active_corridor} via automated corridor policy.`);
        fetchCloudData();
        showToast('Corridor Failover Active: Traffic diverted to NH-275');
      }
      setFailingOver(false);
    } catch {
      setFailoverMsg('Failover trigger failed.');
      setFailingOver(false);
    }
  };

  const handleVerifyAuditTrail = async () => {
    try {
      setVerifyingAudit(true);
      setAuditVerificationMsg('');
      const res = await fetch('/api/v1/paas/cloud/services/SEC-45/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'AuditTrailIntegrityCheck' })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setAuditVerificationMsg(`VERIFIED: HMAC Chain Valid across ${data.result?.total_entries || 0} audit log blocks.`);
        fetchCloudData();
        showToast('HMAC SHA-256 cryptographic chain integrity verified!');
      }
      setVerifyingAudit(false);
    } catch {
      setAuditVerificationMsg('Verification check failed.');
      setVerifyingAudit(false);
    }
  };

  // Helper to find service status by ID from catalog
  const getServiceStatus = (id) => {
    if (!catalog || !catalog.categories) return 'INACTIVE';
    for (const catName in catalog.categories) {
      const match = catalog.categories[catName].find(s => s.id === id);
      if (match) return match.status;
    }
    return 'INACTIVE';
  };

  // Flattened and filtered list of services for the master table
  const filteredServices = useMemo(() => {
    if (!catalog || !catalog.categories) return [];
    let list = [];
    Object.keys(catalog.categories).forEach(catName => {
      catalog.categories[catName].forEach(s => {
        list.push({ ...s, categoryGroup: catName });
      });
    });

    return list.filter(s => {
      const matchesNav = selectedNav === 'ALL' || s.categoryGroup.toLowerCase().includes(selectedNav.toLowerCase());
      const matchesStatus = selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;
      const matchesSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryGroup.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNav && matchesStatus && matchesSearch;
    });
  }, [catalog, selectedNav, selectedStatusFilter, searchQuery]);

  const categoriesList = [
    { key: 'COMP', name: '1. Compute & Workload', code: 'Compute' },
    { key: 'NET', name: '2. Networking & Corridors', code: 'Networking' },
    { key: 'STOR', name: '3. Storage & Black-Box', code: 'Storage' },
    { key: 'DB', name: '4. Databases & Caching', code: 'Databases' },
    { key: 'STREAM', name: '5. Streaming & Analytics', code: 'Streaming' },
    { key: 'IOT', name: '6. IoT & Connected Edge', code: 'IoT' },
    { key: 'SEC', name: '7. Security & IAM', code: 'Security' },
    { key: 'AI', name: '8. AI & Predictive Safety', code: 'AI' }
  ];

  // Primary Azure-style Services Hub Icons
  const primaryCloudServices = [
    { id: 'COMP-01', name: 'Virtual Compute Nodes', category: 'Compute', icon: Server, color: '#0078d4', bg: '#eff6fc' },
    { id: 'NET-09', name: 'Corridor Traffic DNS', category: 'Networking', icon: Globe, color: '#008272', bg: '#e6f7f5' },
    { id: 'STOR-17', name: 'Black-Box Incident Lake', category: 'Storage', icon: HardDrive, color: '#107c41', bg: '#edf7ed' },
    { id: 'DB-24', name: 'CAN-Bus Time-Series', category: 'Databases', icon: Database, color: '#5c2d91', bg: '#f4effa' },
    { id: 'DB-25', name: 'Escape Ramp Radar', category: 'Databases', icon: Zap, color: '#d83b01', bg: '#fdf3f0' },
    { id: 'STREAM-29', name: 'Telemetry Stream Engine', category: 'Streaming', icon: Activity, color: '#004e8c', bg: '#e8f2fa' },
    { id: 'SEC-45', name: 'Compliance Audit Trail', category: 'Security', icon: Shield, color: '#b4009e', bg: '#faeef9' },
    { id: 'AI-49', name: 'Predictive Brake AI', category: 'AI & Safety', icon: Cpu, color: '#4f6bed', bg: '#eff2fe' }
  ];

  // Recent Enterprise Cloud Resources Table
  const recentResources = [
    { name: 'corridor-ka-01-shiradi', type: 'Highway Freight Corridor', location: 'ap-south-kar-shiradi', status: 'Running', metric: '420°C / -6.5% Slope', targetId: 'AI-49' },
    { name: 'corridor-ka-02-sampaje', type: 'Highway Standby Corridor', location: 'ap-south-kar-sampaje', status: 'Standby', metric: '0.74 mu Friction', targetId: 'NET-09' },
    { name: 'corridor-ka-03-charmadi', type: 'Restricted Hairpin Pass', location: 'ap-south-kar-charmadi', status: 'Monitored', metric: '16T Gate Active', targetId: 'SEC-45' },
    { name: 'comp-01-elastic-node-pool', type: 'Virtual Edge Compute Node', location: 'ap-south-kar', status: getServiceStatus('COMP-01') === 'ACTIVE' ? 'Running' : 'Standby', metric: '1,240 nodes', targetId: 'COMP-01' },
    { name: 'db-25-escape-ramp-radar', type: 'In-Memory Spatial Index', location: 'ap-south-kar', status: getServiceStatus('DB-25') === 'ACTIVE' ? 'Running' : 'Standby', metric: '1.8ms scan', targetId: 'DB-25' },
    { name: 'stor-17-blackbox-lake', type: 'Immutable WORM Object Lake', location: 'ap-south-kar', status: getServiceStatus('STOR-17') === 'ACTIVE' ? 'Running' : 'Standby', metric: 'HMAC Chained', targetId: 'STOR-17' }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f7ede2', overflow: 'hidden' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="sabre-toast" style={{ background: '#091a36', color: '#ffffff', border: '1px solid #000000' }}>
          <CheckCircle size={16} color="#38bdf8" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-Header Breadcrumbs & Navigation Ribbon */}
      <div style={{
        background: '#faf3eb',
        borderBottom: '1px solid #000000',
        padding: '0 24px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {/* Azure Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span 
            onClick={() => setConsoleView('home')} 
            style={{ color: '#0078d4', cursor: 'pointer', fontWeight: consoleView === 'home' ? 600 : 400 }}
          >
            Home
          </span>
          <ChevronRight size={12} color="#8a8886" />
          <span style={{ color: '#201f1e', fontWeight: 600 }}>
            {consoleView === 'home' && 'Transport Infrastructure Hub'}
            {consoleView === 'corridors' && 'Corridor Routes & Monitoring'}
            {consoleView === 'inventory' && 'All Services Directory (50)'}
            {consoleView === 'workbenches' && 'Safety & AI Workbenches'}
            {consoleView === 'routing' && 'Traffic Route Failover'}
            {consoleView === 'audit' && 'Governance & Compliance Audit'}
          </span>
        </div>

        {/* Console View Tabs (Azure Portal Resource Views) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { key: 'home', label: 'Overview Hub' },
            { key: 'corridors', label: 'Corridors' },
            { key: 'inventory', label: 'All Services (50)' },
            { key: 'workbenches', label: 'Safety Workbenches' },
            { key: 'routing', label: 'Route Failover' },
            { key: 'audit', label: 'Audit Trail' }
          ].map(t => {
            const isSelected = consoleView === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setConsoleView(t.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '3px',
                  border: 'none',
                  background: isSelected ? '#eff6fc' : 'transparent',
                  color: isSelected ? '#0078d4' : '#605e5c',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            );
          })}

          <button 
            onClick={fetchCloudData}
            title="Refresh Resources"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              border: '1px solid #8a8886',
              background: '#ffffff',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Body Canvas */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ========================================================================= */}
        {/* VIEW 1: CLOUD PORTAL HOME HUB (AZURE / AWS SERVICES & RESOURCES DASHBOARD)  */}
        {/* ========================================================================= */}
        {consoleView === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '18px 24px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Azure Portal Services Hub (Horizontal Service Icon Tiles) */}
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#201f1e' }}>
                  Infrastructure Cloud Services
                </span>
                <button
                  onClick={() => setConsoleView('inventory')}
                  style={{ background: 'transparent', border: 'none', color: '#0078d4', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>View all 50 services</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="portal-services-grid">
                {primaryCloudServices.map(svc => {
                  const Icon = svc.icon;
                  return (
                    <div 
                      key={svc.id}
                      className="portal-service-tile"
                      onClick={() => setModalServiceId(svc.id)}
                    >
                      <div className="portal-service-icon-box" style={{ background: svc.bg, color: svc.color }}>
                        <Icon size={20} />
                      </div>
                      <span className="portal-service-name">{svc.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Summary KPI Tiles (AWS CloudWatch / Azure Monitor Style) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '14px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', textTransform: 'uppercase' }}>
                  Services Provisioned
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#201f1e', margin: '4px 0' }}>
                  {catalog ? catalog.active_services : 0} <span style={{ fontSize: '13px', fontWeight: 500, color: '#107c41' }}>Active</span>
                </div>
                <div style={{ fontSize: '11px', color: '#605e5c' }}>
                  {catalog ? catalog.standby_services : 0} Standby Microservices
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '14px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', textTransform: 'uppercase' }}>
                  High Availability SLA
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#107c41', margin: '4px 0' }}>
                  99.98%
                </div>
                <div style={{ fontSize: '11px', color: '#605e5c' }}>
                  Multi-AZ High Availability Active
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '14px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', textTransform: 'uppercase' }}>
                  Edge Node Fleet
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#201f1e', margin: '4px 0' }}>
                  1,240 <span style={{ fontSize: '13px', fontWeight: 400, color: '#605e5c' }}>Nodes</span>
                </div>
                <div style={{ fontSize: '11px', color: '#0078d4', fontFamily: 'monospace' }}>
                  4,962 CAN msgs/sec Ingress
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '14px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', textTransform: 'uppercase' }}>
                  Audit &amp; Governance
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#107c41', margin: '4px 0' }}>
                  NHAI / IRDAI
                </div>
                <div style={{ fontSize: '11px', color: '#605e5c' }}>
                  HMAC SHA-256 Ledger Sealed
                </div>
              </div>

            </div>

            {/* Recent Resources & Freight Corridors Table (Azure Portal Signature) */}
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#201f1e' }}>
                    Recent Cloud Resources &amp; Corridor Routes
                  </h3>
                  <div style={{ fontSize: '11px', color: '#605e5c' }}>
                    Active highway telemetry pipelines, predictive models, and failover endpoints
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#605e5c' }}>Filter by:</span>
                  <select 
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                    style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '3px', border: '1px solid #8a8886', background: '#fff' }}
                  >
                    <option value="ALL">All Resource Types</option>
                    <option value="CORRIDOR">Highway Corridors</option>
                    <option value="COMPUTE">Compute Nodes</option>
                    <option value="AI">Predictive Models</option>
                  </select>
                </div>
              </div>

              <table className="portal-resource-table">
                <thead>
                  <tr>
                    <th>Resource Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Location / Region</th>
                    <th>Operational Metric</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResources.map(res => (
                    <tr key={res.name}>
                      <td style={{ fontWeight: 600, color: '#0078d4', cursor: 'pointer' }} onClick={() => setModalServiceId(res.targetId)}>
                        {res.name}
                      </td>
                      <td style={{ color: '#605e5c' }}>{res.type}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: res.status === 'Running' ? '#edf7ed' : (res.status === 'Monitored' ? '#eff6fc' : '#f3f2f1'),
                          color: res.status === 'Running' ? '#107c41' : (res.status === 'Monitored' ? '#0078d4' : '#605e5c')
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: res.status === 'Running' ? '#107c41' : (res.status === 'Monitored' ? '#0078d4' : '#8a8886') }} />
                          {res.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#605e5c', fontSize: '11px' }}>{res.location}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{res.metric}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setModalServiceId(res.targetId)}
                          style={{
                            padding: '3px 10px',
                            borderRadius: '2px',
                            border: '1px solid #8a8886',
                            background: '#ffffff',
                            color: '#0078d4',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Manage Blade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Actions Bar for Corridors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              
              {/* NH-75 Card */}
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', borderLeft: '4px solid #f97316', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#f97316', textTransform: 'uppercase' }}>PRIMARY INCLINE</span>
                  <span style={{ fontSize: '11px', color: '#107c41', fontWeight: 600 }}>Active</span>
                </div>
                <h4 style={{ margin: '6px 0', fontSize: '14px', fontWeight: 700, color: '#201f1e' }}>NH-75 Shiradi Ghat</h4>
                <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: '4px' }}>
                  880m &rarr; 240m (640m drop over 26km) | -6.5% Slope
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: shiradiTemp > 480 ? '#dc2626' : (shiradiRetarder ? '#047857' : '#d97706'), marginBottom: '10px' }}>
                  {shiradiTemp}°C &bull; {shiradiStatusText} {shiradiRetarder ? '(Retarder Active)' : '(Free Rolling)'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleSimulateThermalSpike}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Thermal Spike
                  </button>
                  <button
                    onClick={handleEngageRetarder}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#047857', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Retarder Assist
                  </button>
                  <button
                    onClick={() => setModalServiceId('AI-49')}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #8a8886', background: '#ffffff', color: '#201f1e', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Blade
                  </button>
                </div>
              </div>

              {/* NH-275 Card */}
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', borderLeft: '4px solid #10b981', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>STANDBY BYPASS</span>
                  <span style={{ fontSize: '11px', color: '#605e5c', fontWeight: 600 }}>Standby Ready</span>
                </div>
                <h4 style={{ margin: '6px 0', fontSize: '14px', fontWeight: 700, color: '#201f1e' }}>NH-275 Sampaje Pass</h4>
                <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: sampajePingStatus ? '4px' : '10px' }}>
                  680m &rarr; 260m (420m drop over 32km) | {sampajeFriction} mu Friction
                </div>
                {sampajePingStatus && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#047857', marginBottom: '10px' }}>
                    {sampajePingStatus}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handlePingSurfaceSensors}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#047857', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Ping Friction Sensors
                  </button>
                  <button
                    onClick={() => setModalServiceId('NET-09')}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #8a8886', background: '#ffffff', color: '#201f1e', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Failover DNS
                  </button>
                </div>
              </div>

              {/* NH-48 Card */}
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', borderLeft: '4px solid #8b5cf6', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>RESTRICTED PASS</span>
                  <span style={{ fontSize: '11px', color: '#605e5c', fontWeight: 600 }}>16T Limit</span>
                </div>
                <h4 style={{ margin: '6px 0', fontSize: '14px', fontWeight: 700, color: '#201f1e' }}>NH-48 Charmadi Pass</h4>
                <div style={{ fontSize: '11px', color: '#605e5c', marginBottom: charmadiAuditMsg ? '4px' : '10px' }}>
                  960m &rarr; 180m (780m drop over 22km) | 12 Hairpins
                </div>
                {charmadiAuditMsg && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#7c3aed', marginBottom: '10px' }}>
                    {charmadiAuditMsg}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleWeighInMotionAudit}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #c4b5fd', background: '#f5f3ff', color: '#7c3aed', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Audit WIM Gate
                  </button>
                  <button
                    onClick={() => setModalServiceId('SEC-45')}
                    style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #8a8886', background: '#ffffff', color: '#201f1e', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Audit Trail
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CORRIDORS VIEW (GANTT & ELEVATION TIMELINE)                        */}
        {/* ========================================================================= */}
        {consoleView === 'corridors' && (
          <div style={{ padding: '20px 24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#201f1e' }}>
                    Highway Corridors &amp; Freight Schedule Timeline
                  </h3>
                  <div style={{ fontSize: '12px', color: '#605e5c' }}>
                    Descent incline monitoring, surface sensor telemetry, and dynamic DNS failover
                  </div>
                </div>
                <button
                  onClick={() => setConsoleView('workbenches')}
                  className="portal-blade-btn portal-blade-btn-primary"
                >
                  Open Safety Workbenches
                </button>
              </div>

              {/* Corridor Gantt Visualizer */}
              <div style={{ border: '1px solid #e1dfdd', borderRadius: '4px', padding: '16px', background: '#faf9f8' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', borderBottom: '1px solid #e1dfdd', paddingBottom: '6px', fontSize: '11px', color: '#605e5c', fontWeight: 600, textAlign: 'center' }}>
                  <span>06:00</span>
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                  <span>20:00</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                  <div style={{ height: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '0%', width: '55%', height: '30px', background: '#bfdbfe', border: '1px solid #93c5fd', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '11px', fontWeight: 600, color: '#1e3a8a' }}>
                      <Activity size={13} style={{ marginRight: '6px' }} />
                      <span>NH-75: CAN-Bus 50Hz Ingest (KA-04-AB-9921)</span>
                    </div>
                  </div>
                  <div style={{ height: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '42%', width: '45%', height: '30px', background: '#a7f3d0', border: '1px solid #6ee7b7', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '11px', fontWeight: 600, color: '#064e3b' }}>
                      <Cpu size={13} style={{ marginRight: '6px' }} />
                      <span>NH-75: Thermodynamic Model ({shiradiTemp}°C &rarr; Retarder Assist)</span>
                    </div>
                  </div>
                  <div style={{ height: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '20%', width: '60%', height: '30px', background: '#ddd6fe', border: '1px solid #c4b5fd', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '11px', fontWeight: 600, color: '#4c1d95' }}>
                      <Globe size={13} style={{ marginRight: '6px' }} />
                      <span>NH-275: Standby Route Health Checks (0.74 mu Friction Ping)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ALL SERVICES DIRECTORY (50 ENTERPRISE MICROSERVICES)               */}
        {/* ========================================================================= */}
        {consoleView === 'inventory' && (
          <div style={{ flex: 1, display: 'flex', gap: '14px', padding: '16px 24px', overflow: 'hidden', height: 'calc(100vh - 110px)' }}>
            
            {/* Left Category Filter Tree */}
            <div style={{
              width: '230px',
              minWidth: '230px',
              background: '#ffffff',
              borderRadius: '4px',
              border: '1px solid #e1dfdd',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              overflowY: 'auto'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#605e5c', textTransform: 'uppercase', marginBottom: '6px' }}>
                Service Categories
              </div>

              <div
                onClick={() => setSelectedNav('ALL')}
                style={{
                  padding: '7px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  background: selectedNav === 'ALL' ? '#eff6fc' : 'transparent',
                  color: selectedNav === 'ALL' ? '#0078d4' : '#323130',
                  fontWeight: selectedNav === 'ALL' ? 600 : 400,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Layers size={14} />
                <span>All 50 Services</span>
              </div>

              <div style={{ width: '100%', height: '1px', background: '#edebe9', margin: '4px 0' }} />

              {categoriesList.map(cat => {
                const isSelected = selectedNav === cat.code;
                return (
                  <div
                    key={cat.key}
                    onClick={() => setSelectedNav(cat.code)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6fc' : 'transparent',
                      color: isSelected ? '#0078d4' : '#323130',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Folder size={13} color={isSelected ? '#0078d4' : '#8a8886'} />
                    <span>{cat.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Right Master Table & Split Inspector */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
              
              {/* Filter Toolbar */}
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {serviceDetail && serviceDetail.status !== 'ACTIVE' ? (
                    <button 
                      onClick={() => handleToggleProvision('provision')}
                      disabled={provisioning}
                      className="portal-blade-btn portal-blade-btn-primary"
                    >
                      <Play size={12} /> {provisioning ? 'Provisioning...' : `Provision (${selectedServiceId})`}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggleProvision('decommission')}
                      disabled={provisioning}
                      className="portal-blade-btn"
                      style={{ color: '#a80000', borderColor: '#fca5a5' }}
                    >
                      <Power size={12} /> {provisioning ? 'Processing...' : `Decommission (${selectedServiceId})`}
                    </button>
                  )}

                  <button onClick={() => handleExecuteProbe()} disabled={probing} className="portal-blade-btn">
                    <Activity size={12} /> {probing ? 'Probing...' : 'Run Diagnostics'}
                  </button>

                  <button onClick={() => setModalServiceId(selectedServiceId)} className="portal-blade-btn">
                    <ExternalLink size={12} /> Open in Blade...
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '3px', border: '1px solid #8a8886' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Standby Only</option>
                  </select>

                  <input 
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '3px', border: '1px solid #8a8886', width: '160px' }}
                  />
                </div>
              </div>

              {/* Master Table */}
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', overflowY: 'auto', flex: '1 1 240px', minHeight: '180px', maxHeight: '42%' }}>
                <table className="portal-resource-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28px' }}></th>
                      <th style={{ width: '90px' }}>Service ID</th>
                      <th>Service Name</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th>Operational Metric</th>
                      <th style={{ textAlign: 'right' }}>Blade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map(s => {
                      const isSelected = s.id === selectedServiceId;
                      const isActive = s.status === 'ACTIVE';
                      return (
                        <tr 
                          key={s.id}
                          onClick={() => setSelectedServiceId(s.id)}
                          style={{ background: isSelected ? '#eff6fc' : 'transparent', cursor: 'pointer' }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            {isSelected && <Check size={13} color="#0078d4" />}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0078d4' }}>{s.id}</td>
                          <td style={{ fontWeight: isSelected ? 600 : 400 }}>{s.name}</td>
                          <td style={{ color: '#605e5c' }}>{s.categoryGroup.split('(')[0]}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: isActive ? '#edf7ed' : '#f3f2f1',
                              color: isActive ? '#107c41' : '#605e5c'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isActive ? '#107c41' : '#8a8886' }} />
                              {s.status}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{s.operational_metric}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalServiceId(s.id);
                              }}
                              className="portal-blade-btn"
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                            >
                              Open Blade
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Split Inspector */}
              <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', display: 'flex', flexDirection: 'column', flex: '1 1 280px', overflow: 'hidden' }}>
                <div style={{ background: '#faf9f8', borderBottom: '1px solid #edebe9', display: 'flex', padding: '0 16px' }}>
                  {[
                    { key: 'description', label: 'Overview & Architecture' },
                    { key: 'config', label: 'Configuration Parameters' },
                    { key: 'operations', label: 'Diagnostics & Probes' },
                    { key: 'logs', label: 'Execution Logs' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setInspectorTab(tab.key)}
                      style={{
                        padding: '10px 14px',
                        fontSize: '12px',
                        fontWeight: inspectorTab === tab.key ? 600 : 500,
                        color: inspectorTab === tab.key ? '#0078d4' : '#605e5c',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: inspectorTab === tab.key ? '2px solid #0078d4' : '2px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                  {!serviceDetail ? (
                    <div style={{ color: '#8a8886', fontSize: '12px' }}>Loading service specifications...</div>
                  ) : (
                    <>
                      {inspectorTab === 'description' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: '#201f1e' }}>
                              {serviceDetail.id}: {serviceDetail.name}
                            </h4>
                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#605e5c', lineHeight: '1.5' }}>
                              {serviceDetail.description}
                            </p>
                            <div style={{ background: '#faf9f8', borderRadius: '4px', padding: '10px 14px', border: '1px solid #edebe9', fontSize: '11px', color: '#605e5c' }}>
                              <strong>Purpose:</strong> {serviceDetail.purpose || 'Transport Cloud Platform Component'}
                            </div>
                          </div>
                          <div style={{ background: '#faf9f8', borderRadius: '4px', padding: '12px', border: '1px solid #edebe9', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#605e5c' }}>Region:</span>
                              <strong style={{ color: '#201f1e' }}>ap-south-kar</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#605e5c' }}>High Availability:</span>
                              <strong style={{ color: '#107c41' }}>Multi-AZ Active</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#605e5c' }}>Statutory SLA:</span>
                              <strong style={{ color: '#201f1e' }}>99.98%</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {inspectorTab === 'config' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {serviceDetail.config_schema && Object.keys(serviceDetail.config_schema).map(key => {
                              const spec = serviceDetail.config_schema[key];
                              const val = configFormData[key] !== undefined ? configFormData[key] : (spec.default !== undefined ? spec.default : '');
                              return (
                                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#323130' }}>
                                    {spec.label || key}:
                                  </label>
                                  {spec.type === 'select' ? (
                                    <select
                                      value={val}
                                      onChange={(e) => setConfigFormData({ ...configFormData, [key]: e.target.value })}
                                      style={{ padding: '6px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px' }}
                                    >
                                      {spec.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                  ) : (
                                    <input 
                                      type={spec.type === 'number' ? 'number' : 'text'}
                                      value={val}
                                      onChange={(e) => setConfigFormData({ ...configFormData, [key]: spec.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                                      style={{ padding: '6px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px' }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                            <button onClick={handleSaveConfig} className="portal-blade-btn portal-blade-btn-primary">
                              Save Configuration
                            </button>
                            {configMsg && (
                              <span style={{ fontSize: '12px', color: configMsg.type === 'success' ? '#107c41' : '#a80000', fontWeight: 600 }}>
                                {configMsg.text}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {inspectorTab === 'operations' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#605e5c' }}>Execute live diagnostic probe against container.</span>
                            <button onClick={() => handleExecuteProbe()} disabled={probing} className="portal-blade-btn">
                              {probing ? 'Probing...' : 'Run Diagnostics'}
                            </button>
                          </div>
                          {diagnosticOutput && (
                            <pre style={{ background: '#0c1017', color: '#38bdf8', borderRadius: '4px', padding: '12px', fontFamily: 'monospace', fontSize: '11px', margin: 0 }}>
                              {JSON.stringify(diagnosticOutput, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}

                      {inspectorTab === 'logs' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '11px', color: '#605e5c' }}>Recent operational ledger events for {serviceDetail.id}:</div>
                          <div style={{ background: '#faf9f8', borderRadius: '4px', border: '1px solid #edebe9', padding: '10px', maxHeight: '180px', overflowY: 'auto', fontSize: '11px', fontFamily: 'monospace' }}>
                            {serviceDetail.action_logs && serviceDetail.action_logs.length > 0 ? (
                              serviceDetail.action_logs.map((log, i) => (
                                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #edebe9' }}>
                                  <strong style={{ color: '#0078d4' }}>[{log.action || log.event_name}]</strong> - {log.status || 'OK'} - {log.timestamp || new Date().toLocaleTimeString()}
                                </div>
                              ))
                            ) : (
                              <div style={{ color: '#8a8886' }}>No recent events recorded.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: SAFETY & AI WORKBENCHES                                           */}
        {/* ========================================================================= */}
        {consoleView === 'workbenches' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px', padding: '20px 24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            
            {/* WORKBENCH 1: 15-MINUTE PREDICTIVE BRAKE OVERRUN */}
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edebe9', paddingBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#201f1e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={18} color="#0078d4" /> AI-49: 15-Minute Predictive Brake Overrun Model
                  </h3>
                  <div style={{ fontSize: '11px', color: '#605e5c', marginTop: '2px' }}>
                    Multi-variate thermodynamic dissipation modeling across heavy freight descent corridors.
                  </div>
                </div>
                <button onClick={() => setModalServiceId('AI-49')} className="portal-blade-btn">
                  Configure
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>
                    Vehicle Node ID:
                  </label>
                  <input 
                    type="text" 
                    value={truckId} 
                    onChange={(e) => setTruckId(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>
                    Current Brake Disc Temp: <strong style={{ color: currentTemp > 450 ? '#a80000' : '#201f1e' }}>{currentTemp}°C</strong>
                  </label>
                  <input type="range" min="150" max="650" value={currentTemp} onChange={(e) => setCurrentTemp(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>
                    Descent Speed: <strong>{speedKmh} km/h</strong>
                  </label>
                  <input type="range" min="20" max="90" value={speedKmh} onChange={(e) => setSpeedKmh(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>
                    Gross Vehicle Weight: <strong>{gvwTonnes} Tonnes</strong>
                  </label>
                  <input type="range" min="12" max="55" value={gvwTonnes} onChange={(e) => setGvwTonnes(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>
                    Incline Gradient: <strong style={{ color: '#a80000' }}>{slopePct}%</strong>
                  </label>
                  <input type="range" min="-12" max="-1" step="0.5" value={slopePct} onChange={(e) => setSlopePct(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
                  <input type="checkbox" id="retarderToggle" checked={retarderOn} onChange={(e) => setRetarderOn(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="retarderToggle" style={{ fontSize: '12px', fontWeight: 600, color: '#201f1e', cursor: 'pointer' }}>
                    Engine Retarder Engaged
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={runThermodynamicPrediction} disabled={forecasting} className="portal-blade-btn portal-blade-btn-primary">
                  {forecasting ? 'Computing Model...' : 'Execute Forecast'}
                </button>
              </div>

              {predictionResult && (
                <div style={{ background: '#faf9f8', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '3px', border: '1px solid #edebe9' }}>
                      <span style={{ fontSize: '10px', color: '#605e5c' }}>RISK STATUS</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: predictionResult.risk_level === 'CRITICAL' ? '#a80000' : '#107c41' }}>
                        {predictionResult.risk_level}
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '3px', border: '1px solid #edebe9' }}>
                      <span style={{ fontSize: '10px', color: '#605e5c' }}>FADE PROBABILITY</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#201f1e' }}>
                        {predictionResult.fade_probability_pct}%
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '3px', border: '1px solid #edebe9' }}>
                      <span style={{ fontSize: '10px', color: '#605e5c' }}>TIME TO FADE</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#a80000' }}>
                        {predictionResult.time_to_failure_min ? `${predictionResult.time_to_failure_min} min` : 'Stable'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', marginBottom: '6px' }}>
                    15-Minute Temperature Horizon:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                    {predictionResult.trajectory_15min.map(step => (
                      <div key={step.minute} style={{ background: step.projected_temp_c > 450 ? '#fee2e2' : '#ffffff', border: '1px solid #e1dfdd', borderRadius: '3px', padding: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#605e5c' }}>+{step.minute}m</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: step.projected_temp_c > 450 ? '#a80000' : '#201f1e' }}>
                          {step.projected_temp_c}°C
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 600, color: predictionResult.recommendation.includes('IMMEDIATELY') ? '#a80000' : '#107c41' }}>
                    Recommendation: {predictionResult.recommendation}
                  </div>
                </div>
              )}
            </div>

            {/* WORKBENCH 2: RUNAWAY RAMP SPATIAL RADAR */}
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edebe9', paddingBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#201f1e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="#0078d4" /> DB-25: Runaway Ramp In-Memory Proximity Radar
                  </h3>
                  <div style={{ fontSize: '11px', color: '#605e5c', marginTop: '2px' }}>
                    Sub-2ms in-memory geospatial index scanning for emergency arrestor beds.
                  </div>
                </div>
                <button onClick={() => setModalServiceId('DB-25')} className="portal-blade-btn">
                  Configure
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>Latitude (N):</label>
                  <input type="number" value={latInput} onChange={(e) => setLatInput(parseFloat(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c', display: 'block', marginBottom: '4px' }}>Longitude (E):</label>
                  <input type="number" value={lonInput} onChange={(e) => setLonInput(parseFloat(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={runEscapeRampProximity} disabled={scanningProximity} className="portal-blade-btn portal-blade-btn-primary">
                  {scanningProximity ? 'Scanning Radar...' : 'Scan Proximity'}
                </button>
              </div>

              {proximityResult && proximityResult.nearest_ramp && (
                <div style={{ background: '#faf9f8', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '13px', color: '#201f1e' }}>{proximityResult.nearest_ramp.name}</strong>
                    <span style={{ fontSize: '11px', color: '#107c41', fontFamily: 'monospace', fontWeight: 600 }}>
                      Latency: {proximityResult.lookup_latency_ms} ms
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '3px', border: '1px solid #edebe9' }}>
                      <span style={{ fontSize: '10px', color: '#605e5c' }}>DISTANCE TO BED</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#a80000' }}>{proximityResult.distance_meters} m</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '3px', border: '1px solid #edebe9' }}>
                      <span style={{ fontSize: '10px', color: '#605e5c' }}>TIME TO IMPACT</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0078d4' }}>{proximityResult.eta_seconds} sec</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: ROUTE FAILOVER                                                    */}
        {/* ========================================================================= */}
        {consoleView === 'routing' && (
          <div style={{ maxWidth: '960px', margin: '20px auto', width: '100%' }}>
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#201f1e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} color="#0078d4" /> Service NET-09: Dynamic Corridor Traffic &amp; Route Failover
                </h3>
                <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px' }}>
                  Real-time landslide and hazard detection with automated traffic routing policy.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#faf9f8', padding: '14px', borderRadius: '4px', border: '1px solid #edebe9' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c' }}>PRIMARY ROUTE</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#201f1e', marginTop: '2px' }}>
                    {activeCorridorDisplay}
                  </div>
                </div>
                <div style={{ background: '#faf9f8', padding: '14px', borderRadius: '4px', border: '1px solid #edebe9' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#605e5c' }}>STANDBY ROUTE</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#d83b01', marginTop: '2px' }}>
                    NH-275 (Sampaje Pass)
                  </div>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '14px', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>
                  Incident Simulation &amp; Failover Trigger:
                </div>
                <button
                  onClick={handleTriggerFailover}
                  disabled={failingOver}
                  className="portal-blade-btn"
                  style={{ background: '#f59e0b', color: '#ffffff', border: 'none', fontWeight: 600 }}
                >
                  {failingOver ? 'Evaluating Route Sensors...' : 'Simulate Monsoon Landslide - Trigger Corridor Failover'}
                </button>
                {failoverMsg && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#107c41', fontWeight: 600 }}>
                    {failoverMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: GOVERNANCE & AUDIT                                                */}
        {/* ========================================================================= */}
        {consoleView === 'audit' && (
          <div style={{ maxWidth: '1100px', margin: '20px auto', width: '100%' }}>
            <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e1dfdd', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#201f1e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} color="#0078d4" /> Service SEC-45: Regulatory Dispatch Audit Trail
                  </h3>
                  <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '2px' }}>
                    Immutable append-only audit trail chained with cryptographic HMAC SHA-256 signatures.
                  </div>
                </div>

                <button 
                  onClick={handleVerifyAuditTrail}
                  disabled={verifyingAudit}
                  className="portal-blade-btn portal-blade-btn-primary"
                >
                  {verifyingAudit ? 'Verifying...' : 'Verify Cryptographic Chain'}
                </button>
              </div>

              {auditVerificationMsg && (
                <div style={{ padding: '8px 12px', background: '#edf7ed', border: '1px solid #c8e6c9', color: '#107c41', borderRadius: '3px', fontSize: '12px', fontWeight: 600 }}>
                  {auditVerificationMsg}
                </div>
              )}

              <div style={{ background: '#faf9f8', borderRadius: '4px', border: '1px solid #edebe9', padding: '12px', maxHeight: '380px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {auditLogs.map((log, idx) => (
                  <div key={idx} style={{ padding: '5px 0', borderBottom: '1px solid #edebe9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <strong style={{ color: '#0078d4' }}>[{log.event_name}]</strong> by <em>{log.user_identity}</em> ({log.service}): {log.details}
                    </span>
                    <span style={{ color: '#8a8886' }}>
                      {new Date(log.event_time).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Signature Azure/AWS Cloud Resource Blade Modal */}
      {modalServiceId && (
        <ServiceConsoleModal 
          serviceId={modalServiceId}
          onClose={() => setModalServiceId(null)}
          onServiceStatusChanged={fetchCloudData}
        />
      )}
    </div>
  );
}
