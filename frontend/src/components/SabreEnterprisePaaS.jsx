import React, { useState, useEffect, useMemo } from 'react';
import EnterpriseSetupModal from './EnterpriseSetupModal';
import { 
  Package, Truck, Box, Users, Layers, Search, 
  CheckCircle, Clock, AlertTriangle, FileText, Download,
  ExternalLink, ChevronRight, Check, ArrowRight, ShieldCheck,
  Building, Phone, Mail, Award, Compass, RefreshCw, Bell,
  Calendar, ChevronDown, Filter, Zap, Activity, Info, BarChart2,
  CheckSquare, Eye, Sliders, TrendingUp, AlertCircle, Warehouse,
  Maximize2, ArrowUpRight, Gauge, Anchor, Navigation, Plus, Trash2, RotateCcw, Database,
  ShieldAlert, DollarSign, Lock, Leaf, CheckCircle2, AlertOctagon, TrendingDown, Percent, Scale
} from 'lucide-react';

export default function SabreEnterprisePaaS({ onNavigateHome }) {
  // Navigation Module Tabs:
  // 'oms' | 'trucks' | 'containers' | 'cargo' | 'workforce' | 'plantguard' | 'capitallock' | 'shieldgate' | 'ecoyield'
  const [activeModule, setActiveModule] = useState('trucks');

  // ==========================================
  // 1. OMS STATE
  // ==========================================
  const [omsSummary, setOmsSummary] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [omsSearchQuery, setOmsSearchQuery] = useState('');
  const [omsStatusFilter, setOmsStatusFilter] = useState('All');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [setupModalType, setSetupModalType] = useState(null);

  // ==========================================
  // 2. TRUCKS STATE
  // ==========================================
  const [trucksCatalog, setTrucksCatalog] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('tractor-trailer');
  const [trucksFilterClass, setTrucksFilterClass] = useState('All');
  const [trucksSearchQuery, setTrucksSearchQuery] = useState('');

  // ==========================================
  // 3. CONTAINERS STATE
  // ==========================================
  const [containersCatalog, setContainersCatalog] = useState([]);
  const [selectedContainerId, setSelectedContainerId] = useState('high-cube-40ft');
  const [containerSearchQuery, setContainerSearchQuery] = useState('');
  const [cargoCalcWeight, setCargoCalcWeight] = useState(24500);

  // ==========================================
  // 4. CARGO STATE
  // ==========================================
  const [cargoCatalog, setCargoCatalog] = useState([]);
  const [selectedCargoId, setSelectedCargoId] = useState('project-cargo');
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState('All');
  const [cargoSearchQuery, setCargoSearchQuery] = useState('');

  // ==========================================
  // 5. WORKFORCE STATE
  // ==========================================
  const [workforceStats, setWorkforceStats] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [workforceSearch, setWorkforceSearch] = useState('');
  const [selectedEmployeeModal, setSelectedEmployeeModal] = useState(null);

  // ==========================================
  // 6. SOVEREIGN ENTERPRISE SERVICES
  // ==========================================
  const [plantguardSummary, setPlantguardSummary] = useState(null);
  const [capitallockSummary, setCapitallockSummary] = useState(null);
  const [shieldgateSummary, setShieldgateSummary] = useState(null);
  const [ecoyieldSummary, setEcoyieldSummary] = useState(null);

  const [consoleSearch, setConsoleSearch] = useState('');

  // Fetch all live backend data
  const fetchAllData = async () => {
    try {
      // 1. OMS Dashboard
      const omsRes = await fetch('/api/v1/oms/dashboard');
      if (omsRes.ok) {
        const omsData = await omsRes.json();
        setOmsSummary(omsData);
        if (!selectedOrder && omsData.featured_order) {
          setSelectedOrder(omsData.featured_order);
        } else if (selectedOrder) {
          const updated = omsData.recent_orders?.find(o => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }

      // 2. Trucks
      const trucksRes = await fetch('/api/v1/specs/trucks');
      if (trucksRes.ok) {
        const trkData = await trucksRes.json();
        setTrucksCatalog(trkData);
        if (trkData.length > 0 && (!selectedTruckId || !trkData.find(t => t.id === selectedTruckId))) {
          setSelectedTruckId(trkData[0].id);
        }
      }

      // 3. Containers
      const cntRes = await fetch('/api/v1/specs/containers');
      if (cntRes.ok) {
        const cntData = await cntRes.json();
        setContainersCatalog(cntData);
        if (cntData.length > 0 && (!selectedContainerId || !cntData.find(c => c.id === selectedContainerId))) {
          setSelectedContainerId(cntData[0].id);
        }
      }

      // 4. Cargo
      const cargoRes = await fetch('/api/v1/specs/cargo');
      if (cargoRes.ok) {
        const crgData = await cargoRes.json();
        setCargoCatalog(crgData);
        if (crgData.length > 0 && (!selectedCargoId || !crgData.find(c => c.id === selectedCargoId))) {
          setSelectedCargoId(crgData[0].id);
        }
      }

      // 5. Workforce
      const wfStatsRes = await fetch('/api/v1/workforce/stats');
      if (wfStatsRes.ok) {
        setWorkforceStats(await wfStatsRes.json());
      }
      const wfEmpRes = await fetch('/api/v1/workforce/employees');
      if (wfEmpRes.ok) {
        setEmployeesList(await wfEmpRes.json());
      }

      // 6. Sovereign Services
      const pgRes = await fetch('/api/v1/services/plantguard');
      if (pgRes.ok) setPlantguardSummary(await pgRes.json());

      const clRes = await fetch('/api/v1/services/capitallock');
      if (clRes.ok) setCapitallockSummary(await clRes.json());

      const sgRes = await fetch('/api/v1/services/shieldgate');
      if (sgRes.ok) setShieldgateSummary(await sgRes.json());

      const eyRes = await fetch('/api/v1/services/ecoyield');
      if (eyRes.ok) setEcoyieldSummary(await eyRes.json());
    } catch (err) {
      console.error('Failed to load Enterprise PaaS backend data', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4500);
  };

  // Generate Real Invoice Action
  const handleGenerateInvoice = async (orderId) => {
    try {
      setIsGeneratingInvoice(true);
      const res = await fetch(`/api/v1/oms/orders/${orderId}/generate-invoice`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Commercial Invoice ${data.invoice_number} cleared. Grand Total: ₹ ${data.grand_total_inr.toLocaleString()}`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Invoice generation failed.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Advance Order Milestone
  const handleAdvanceStep = async (orderId) => {
    try {
      const res = await fetch(`/api/v1/oms/orders/${orderId}/advance-step`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(data.message);
        await fetchAllData();
      } else {
        triggerNotification(data.message || 'Milestone already reached.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Review MOU
  const handleReviewMOU = async (upcomingId) => {
    try {
      const res = await fetch(`/api/v1/oms/upcoming/${upcomingId}/review`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(data.message);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Process Upcoming Order
  const handleProcessUpcomingOrder = async (upcomingId) => {
    try {
      const res = await fetch(`/api/v1/oms/upcoming/${upcomingId}/process`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(data.message);
        await fetchAllData();
        if (data.created_order) {
          setSelectedOrder(data.created_order);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Universal CRUD Handlers
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    try {
      const res = await fetch(`/api/v1/oms/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Order ${orderId} removed from cluster.`);
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to delete order.');
    }
  };

  const handleDeleteTruck = async (truckId) => {
    if (!window.confirm(`Delete vehicle specification ${truckId}?`)) return;
    try {
      const res = await fetch(`/api/v1/specs/trucks/${truckId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Truck spec ${truckId} removed.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to delete truck.');
    }
  };

  const handleDeleteContainer = async (containerId) => {
    if (!window.confirm(`Delete container specification ${containerId}?`)) return;
    try {
      const res = await fetch(`/api/v1/specs/containers/${containerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Container ${containerId} removed.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to delete container.');
    }
  };

  const handleDeleteCargo = async (cargoId) => {
    if (!window.confirm(`Delete cargo/material profile ${cargoId}?`)) return;
    try {
      const res = await fetch(`/api/v1/specs/cargo/${cargoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Cargo profile ${cargoId} removed.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to delete cargo profile.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm(`Remove personnel ${employeeId} from roster?`)) return;
    try {
      const res = await fetch(`/api/v1/workforce/employees/${employeeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Personnel ${employeeId} removed.`);
        if (selectedEmployeeModal?.id === employeeId) setSelectedEmployeeModal(null);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to delete employee.');
    }
  };

  const handleDeletePlantguard = async (ruleId) => {
    if (!window.confirm(`Deactivate and remove Cadence rule ${ruleId}?`)) return;
    try {
      const res = await fetch(`/api/v1/services/plantguard/rules/${ruleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Cadence rule ${ruleId} deactivated.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to delete Cadence rule.');
    }
  };

  const handleDeleteCapitallock = async (escrowId) => {
    if (!window.confirm(`Release and archive Parity record ${escrowId}?`)) return;
    try {
      const res = await fetch(`/api/v1/services/capitallock/escrows/${escrowId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Parity record ${escrowId} released.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to release Parity record.');
    }
  };

  const handleDeleteShieldgate = async (policyId) => {
    if (!window.confirm(`Revoke and purge Sentry policy ${policyId}?`)) return;
    try {
      const res = await fetch(`/api/v1/services/shieldgate/policies/${policyId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Sentry policy ${policyId} revoked.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to revoke policy.');
    }
  };

  const handleDeleteEcoyield = async (benchmarkId) => {
    if (!window.confirm(`Remove Flux benchmark ${benchmarkId}?`)) return;
    try {
      const res = await fetch(`/api/v1/services/ecoyield/benchmarks/${benchmarkId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification(`Flux benchmark ${benchmarkId} removed.`);
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to remove benchmark.');
    }
  };

  const handleResetToBlank = async () => {
    if (!window.confirm('Wipe to blank instance? All orders, fleet specs, containers, materials, crew, and sovereign policies will be cleared to 0 records.')) return;
    try {
      const res = await fetch('/api/v1/enterprise/reset-to-blank', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification('Instance reset to clean blank state.');
        setSelectedOrder(null);
        setSelectedTruckId('');
        setSelectedContainerId('');
        setSelectedCargoId('');
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to reset instance.');
    }
  };

  const handleLoadBaselinePresets = async () => {
    try {
      const res = await fetch('/api/v1/enterprise/load-starter-presets', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        triggerNotification('Standard baseline fleet & logistics specs loaded.');
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Failed to load presets.');
    }
  };

  // Filtered Lists
  const filteredOrders = useMemo(() => {
    return (omsSummary?.recent_orders || []).filter(ord => {
      const matchesStatus = omsStatusFilter === 'All' || ord.status.toLowerCase() === omsStatusFilter.toLowerCase();
      if (!omsSearchQuery) return matchesStatus;
      const q = omsSearchQuery.toLowerCase();
      const matchesQ = ord.id.toLowerCase().includes(q) || 
                       ord.customer.toLowerCase().includes(q) || 
                       ord.cargo_type.toLowerCase().includes(q) ||
                       ord.destination.toLowerCase().includes(q);
      return matchesStatus && matchesQ;
    });
  }, [omsSummary, omsSearchQuery, omsStatusFilter]);

  const filteredTrucks = useMemo(() => {
    return trucksCatalog.filter(trk => {
      const matchesClass = trucksFilterClass === 'All' || 
        (trk.gvw_category || '').toLowerCase().includes(trucksFilterClass.toLowerCase());
      if (!trucksSearchQuery) return matchesClass;
      const q = trucksSearchQuery.toLowerCase();
      return matchesClass && (
        trk.name.toLowerCase().includes(q) ||
        (trk.common_use || '').toLowerCase().includes(q) ||
        (trk.popular_brands || []).some(b => b.toLowerCase().includes(q))
      );
    });
  }, [trucksCatalog, trucksFilterClass, trucksSearchQuery]);

  const filteredContainers = useMemo(() => {
    return containersCatalog.filter(cnt => {
      if (!containerSearchQuery) return true;
      const q = containerSearchQuery.toLowerCase();
      return cnt.name.toLowerCase().includes(q) || 
             cnt.iso_standard.toLowerCase().includes(q) ||
             (cnt.best_for || '').toLowerCase().includes(q);
    });
  }, [containersCatalog, containerSearchQuery]);

  const filteredCargo = useMemo(() => {
    return cargoCatalog.filter(crg => {
      const matchesInd = selectedIndustryFilter === 'All' || 
        crg.title.toLowerCase().includes(selectedIndustryFilter.toLowerCase()) ||
        crg.items.some(it => it.toLowerCase().includes(selectedIndustryFilter.toLowerCase()));
      if (!cargoSearchQuery) return matchesInd;
      const q = cargoSearchQuery.toLowerCase();
      return matchesInd && (
        crg.title.toLowerCase().includes(q) ||
        crg.category_code.toLowerCase().includes(q) ||
        crg.items.some(it => it.toLowerCase().includes(q))
      );
    });
  }, [cargoCatalog, selectedIndustryFilter, cargoSearchQuery]);

  const dynamicDepartments = useMemo(() => {
    const counts = { All: employeesList.length };
    employeesList.forEach(emp => {
      const d = emp.department || 'Operations';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [employeesList]);

  const filteredEmployees = useMemo(() => {
    return employeesList.filter(emp => {
      const matchesDept = selectedDeptFilter === 'All' || (emp.department || '').toLowerCase() === selectedDeptFilter.toLowerCase();
      const matchesQ = !workforceSearch || 
        emp.name.toLowerCase().includes(workforceSearch.toLowerCase()) ||
        emp.id.toLowerCase().includes(workforceSearch.toLowerCase()) ||
        (emp.designation || '').toLowerCase().includes(workforceSearch.toLowerCase()) ||
        (emp.branch || '').toLowerCase().includes(workforceSearch.toLowerCase());
      return matchesDept && matchesQ;
    });
  }, [employeesList, selectedDeptFilter, workforceSearch]);

  const selectedTruck = trucksCatalog.find(t => t.id === selectedTruckId) || trucksCatalog[0];
  const selectedContainer = containersCatalog.find(c => c.id === selectedContainerId) || containersCatalog[0];
  const selectedCargo = cargoCatalog.find(c => c.id === selectedCargoId) || cargoCatalog[0];

  const getAvatarBg = (dept) => {
    switch (dept) {
      case 'Management': return '#1e3a5f';
      case 'Operations': return '#0284c7';
      case 'Drivers': return '#2e7d32';
      case 'Warehouse & Yard': return '#b45309';
      case 'Maintenance & Fleet': return '#475569';
      default: return '#1e293b';
    }
  };

  const MODULE_METADATA = {
    oms: { title: 'Order Management System (OMS)', category: 'Core Logistics', icon: Package, count: omsSummary?.kpi_metrics?.total_orders ?? 0, setupType: 'order', setupLabel: 'Order' },
    trucks: { title: 'Commercial Trucks Matrix', category: 'Engineering & Fleet', icon: Truck, count: trucksCatalog.length, setupType: 'truck', setupLabel: 'Truck Spec' },
    containers: { title: 'Shipping Containers & Yard', category: 'Engineering & Fleet', icon: Box, count: containersCatalog.length, setupType: 'container', setupLabel: 'Container Spec' },
    cargo: { title: 'Goods & Cargo Blueprints', category: 'Engineering & Fleet', icon: Layers, count: cargoCatalog.length, setupType: 'cargo', setupLabel: 'Material Spec' },
    workforce: { title: 'Workforce & Crew Directory', category: 'Enterprise Governance', icon: Users, count: employeesList.length, setupType: 'employee', setupLabel: 'Personnel' },
    plantguard: { title: 'Cadence Buffer Pacing & Line Risk', category: 'Executive Services', icon: ShieldAlert, count: plantguardSummary?.rules?.length ?? 0, setupType: 'plantguard', setupLabel: 'Cadence Policy' },
    capitallock: { title: 'Parity Capital Float & Settlement Ledger', category: 'Executive Services', icon: DollarSign, count: capitallockSummary?.escrows?.length ?? 0, setupType: 'capitallock', setupLabel: 'Parity Record' },
    shieldgate: { title: 'Sentry Custody & Transit Governance', category: 'Executive Services', icon: Lock, count: shieldgateSummary?.policies?.length ?? 0, setupType: 'shieldgate', setupLabel: 'Sentry Policy' },
    ecoyield: { title: 'Flux Yield & Emissions Index', category: 'Executive Services', icon: Leaf, count: ecoyieldSummary?.benchmarks?.length ?? 0, setupType: 'ecoyield', setupLabel: 'Flux Benchmark' }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      background: '#f8fafc',
      color: '#0f172a',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      
      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL ENTERPRISE SIDEBAR (AWS / GOOGLE CLOUD STYLE)             */}
      {/* ========================================================================= */}
      <aside style={{
        width: '260px',
        minWidth: '260px',
        maxWidth: '260px',
        height: '100%',
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* Header Brand */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(30, 58, 95, 0.2)'
              }}>
                <Gauge size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Operations Console
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Management Plane
                </div>
              </div>
            </div>

            {/* Service Search */}
            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 8px'
            }}>
              <Search size={13} color="#64748b" />
              <input 
                type="text"
                placeholder="Find services..."
                value={consoleSearch}
                onChange={(e) => setConsoleSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '11.5px',
                  color: '#0f172a'
                }}
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* GROUP 1: CORE FREIGHT */}
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
                Core Operations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { id: 'oms', label: 'Order Management (OMS)', icon: Package, count: omsSummary?.kpi_metrics?.total_orders ?? 0 }
                ].filter(s => s.label.toLowerCase().includes(consoleSearch.toLowerCase())).map(item => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      style={{
                        width: '100%',
                        background: isActive ? '#1e3a5f' : 'transparent',
                        color: isActive ? '#ffffff' : '#334155',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={15} color={isActive ? '#ffffff' : '#64748b'} />
                        <span>{item.label}</span>
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#475569',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 2: ENGINEERING & FLEET */}
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
                Engineering &amp; Fleet
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { id: 'trucks', label: 'Commercial Trucks Matrix', icon: Truck, count: trucksCatalog.length },
                  { id: 'containers', label: 'Shipping Containers & Yard', icon: Box, count: containersCatalog.length },
                  { id: 'cargo', label: 'Goods & Cargo Blueprints', icon: Layers, count: cargoCatalog.length }
                ].filter(s => s.label.toLowerCase().includes(consoleSearch.toLowerCase())).map(item => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      style={{
                        width: '100%',
                        background: isActive ? '#1e3a5f' : 'transparent',
                        color: isActive ? '#ffffff' : '#334155',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={15} color={isActive ? '#ffffff' : '#64748b'} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#475569',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 3: GOVERNANCE */}
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
                Governance &amp; Crew
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { id: 'workforce', label: 'Workforce & Crew Directory', icon: Users, count: employeesList.length }
                ].filter(s => s.label.toLowerCase().includes(consoleSearch.toLowerCase())).map(item => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      style={{
                        width: '100%',
                        background: isActive ? '#1e3a5f' : 'transparent',
                        color: isActive ? '#ffffff' : '#334155',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={15} color={isActive ? '#ffffff' : '#64748b'} />
                        <span>{item.label}</span>
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#475569',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 4: SOVEREIGN CLOUD SERVICES (EXECUTIVE BLADES) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 6px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Executive Operations
                </span>
                <span style={{ fontSize: '9px', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px' }}>
                  SOVEREIGN
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { id: 'plantguard', label: 'Cadence', role: 'VP Ops', icon: ShieldAlert, count: plantguardSummary?.rules?.length ?? 0 },
                  { id: 'capitallock', label: 'Parity', role: 'CFO', icon: DollarSign, count: capitallockSummary?.escrows?.length ?? 0 },
                  { id: 'shieldgate', label: 'Sentry', role: 'CRO', icon: Lock, count: shieldgateSummary?.policies?.length ?? 0 },
                  { id: 'ecoyield', label: 'Flux', role: 'ESG', icon: Leaf, count: ecoyieldSummary?.benchmarks?.length ?? 0 }
                ].filter(s => s.label.toLowerCase().includes(consoleSearch.toLowerCase()) || s.role.toLowerCase().includes(consoleSearch.toLowerCase())).map(item => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      style={{
                        width: '100%',
                        background: isActive ? '#1e3a5f' : 'transparent',
                        color: isActive ? '#ffffff' : '#334155',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Icon size={15} color={isActive ? '#38bdf8' : '#64748b'} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                          color: isActive ? '#e0f2fe' : '#64748b',
                          padding: '1px 4px',
                          borderRadius: '4px'
                        }}>
                          {item.role}
                        </span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                          color: isActive ? '#ffffff' : '#475569',
                          padding: '1px 5px',
                          borderRadius: '10px'
                        }}>
                          {item.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 5: PROVISIONING */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
                Provisioning
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={handleLoadBaselinePresets}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e3a5f',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <Database size={13} color="#1e3a5f" />
                  <span>Load Baseline Presets</span>
                </button>

                <button
                  onClick={handleResetToBlank}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <RotateCcw size={13} color="#dc2626" />
                  <span>Reset to Blank (0)</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Region / Status Node */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>Cluster Fabric</span>
            <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
              ONLINE
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span>IN-CENTRAL-1</span>
            <span>C++ Engine Active</span>
          </div>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (GOOGLE CLOUD CONSOLE / AWS STYLE)                       */}
      {/* ========================================================================= */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: '#f8fafc'
      }}>
        
        {/* Unified Top Command & Action Bar */}
        <div style={{
          height: '52px',
          padding: '0 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30
        }}>
          {/* Breadcrumbs - Fully Clickable Backward Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span 
              onClick={() => onNavigateHome ? onNavigateHome() : setActiveModule('trucks')}
              title="Return to Platform Overview"
              style={{ 
                color: '#2563eb', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Console
            </span>
            <ChevronRight size={14} color="#94a3b8" />
            <span 
              onClick={() => {
                // Navigate to the primary module for this category
                const cat = MODULE_METADATA[activeModule]?.category;
                if (cat === 'Core Logistics') setActiveModule('oms');
                else if (cat === 'Engineering & Fleet') setActiveModule('trucks');
                else if (cat === 'Enterprise Governance') setActiveModule('workforce');
                else if (cat === 'Sovereign Cloud Services') setActiveModule('plantguard');
                else setActiveModule('trucks');
              }}
              title={`Switch to default ${MODULE_METADATA[activeModule]?.category} view`}
              style={{ 
                color: '#0284c7', 
                fontWeight: 600, 
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f9ff';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {MODULE_METADATA[activeModule]?.category}
            </span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ color: '#0f172a', fontWeight: 700, padding: '2px 4px' }}>
              {MODULE_METADATA[activeModule]?.title}
            </span>
            <span style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              marginLeft: '4px',
              border: '1px solid #e2e8f0'
            }}>
              {MODULE_METADATA[activeModule]?.count} records
            </span>
          </div>

          {/* Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {actionNotice && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle size={14} color="#15803d" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Single Primary Action Button */}
            <button
              onClick={() => setSetupModalType(MODULE_METADATA[activeModule]?.setupType)}
              style={{
                background: '#1e3a5f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#152942'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1e3a5f'}
            >
              <Plus size={14} />
              <span>Register {MODULE_METADATA[activeModule]?.setupLabel}</span>
            </button>

            {/* Refresh / Sync Button */}
            <button
              onClick={fetchAllData}
              title="Refresh Data"
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <RefreshCw size={13} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Scrollable Workspace Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>

          {/* ======================================================================= */}
          {/* MODULE 1: ORDER MANAGEMENT SYSTEM (OMS)                                 */}
          {/* ======================================================================= */}
          {activeModule === 'oms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 4 Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { title: 'Total Consignments', val: omsSummary?.kpi_metrics?.total_orders ?? 0, sub: 'Active in freight database', color: '#1e3a5f', icon: Box },
                  { title: 'In-Transit Dispatches', val: omsSummary?.kpi_metrics?.in_transit ?? 0, sub: 'Live telematics tracking', color: '#0284c7', icon: Truck },
                  { title: 'Completed Deliveries', val: omsSummary?.kpi_metrics?.delivered ?? 0, sub: 'POD signed & cleared', color: '#16a34a', icon: CheckSquare },
                  { title: 'Pending MOUs / Action', val: omsSummary?.kpi_metrics?.upcoming_orders ?? 0, sub: 'Awaiting contract review', color: '#b45309', icon: Calendar }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{card.title}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, margin: '4px 0 2px' }}>{card.val}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{card.sub}</div>
                      </div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} color={card.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter & Search Toolbar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {['All', 'In Transit', 'Delivered', 'Processing'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOmsStatusFilter(st)}
                      style={{
                        background: omsStatusFilter === st ? '#1e3a5f' : '#f8fafc',
                        color: omsStatusFilter === st ? '#ffffff' : '#475569',
                        border: '1px solid ' + (omsStatusFilter === st ? '#1e3a5f' : '#e2e8f0'),
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  width: '240px'
                }}>
                  <Search size={13} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Filter by ID, client, cargo..."
                    value={omsSearchQuery}
                    onChange={(e) => setOmsSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Split Workstation View: Orders Grid (Left) + Selected Consignment Inspector (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1.3fr 1fr' : '1fr', gap: '16px' }}>
                
                {/* Left Table / List */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Freight Orders Directory ({filteredOrders.length})
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Select row to inspect manifest & billing
                    </span>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                      <Package size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>No Orders Found</div>
                      <div style={{ fontSize: '12px', marginBottom: '16px' }}>Your freight ledger has no consignments matching current filters.</div>
                      <button
                        onClick={() => setSetupModalType('order')}
                        style={{
                          background: '#1e3a5f',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Create Freight Order
                      </button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Order ID</th>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Client / Consignee</th>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Cargo Manifest</th>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Destination</th>
                            <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(ord => {
                            const isSelected = selectedOrder?.id === ord.id;
                            return (
                              <tr
                                key={ord.id}
                                onClick={() => setSelectedOrder(ord)}
                                style={{
                                  background: isSelected ? '#f0fdf4' : 'transparent',
                                  borderBottom: '1px solid #f1f5f9',
                                  cursor: 'pointer',
                                  transition: 'background 0.1s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a5f' }}>
                                  {ord.id}
                                </td>
                                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{ord.customer}</td>
                                <td style={{ padding: '10px 12px', color: '#475569' }}>
                                  {ord.cargo_type} <span style={{ color: '#94a3b8', fontSize: '11px' }}>({ord.quantity})</span>
                                </td>
                                <td style={{ padding: '10px 12px', color: '#334155' }}>{ord.destination?.split(',')[0]}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: ord.status === 'Delivered' ? '#dcfce7' : ord.status === 'Delayed' ? '#fee2e2' : '#e0f2fe',
                                    color: ord.status === 'Delivered' ? '#15803d' : ord.status === 'Delayed' ? '#b91c1c' : '#0369a1'
                                  }}>
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Inspection Panel */}
                {selectedOrder && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Consignment Inspector</span>
                        <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: '#1e3a5f' }}>
                          {selectedOrder.id} • {selectedOrder.customer}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleAdvanceStep(selectedOrder.id)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ChevronRight size={13} />
                          <span>Advance Step</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(selectedOrder.id)}
                          title="Delete Order"
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Route & Driver Telemetry */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '11.5px'
                    }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '10.5px' }}>Assigned Rig:</span>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedOrder.vehicle_no || 'KA-01-AB-1234'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '10.5px' }}>Driver Crew:</span>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedOrder.driver || 'Suresh Patil'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '10.5px' }}>Origin Hub:</span>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{selectedOrder.origin}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '10.5px' }}>Destination:</span>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{selectedOrder.destination}</div>
                      </div>
                    </div>

                    {/* Milestone Progress Stepper */}
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        Milestone Progress ({selectedOrder.tracking_steps?.filter(s => s.completed).length || 0} / {selectedOrder.tracking_steps?.length || 7})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(selectedOrder.tracking_steps || []).map((st, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: st.completed ? '#16a34a' : '#e2e8f0',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700
                            }}>
                              {st.completed ? '✓' : i + 1}
                            </div>
                            <span style={{ color: st.completed ? '#0f172a' : '#94a3b8', fontWeight: st.completed ? 600 : 400, flex: 1 }}>
                              {st.step}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              {st.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Commercial Billing & Invoicing */}
                    <div style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>Tariff / Contract Value</span>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a5f' }}>
                          ₹ {(selectedOrder.total_amount_inr || 0).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerateInvoice(selectedOrder.id)}
                        disabled={isGeneratingInvoice}
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FileText size={13} />
                        <span>{isGeneratingInvoice ? 'Clearing...' : 'Clear Invoice'}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 2: COMMERCIAL TRUCKS MATRIX (FLEET & ENGINEERING)                 */}
          {/* ======================================================================= */}
          {activeModule === 'trucks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 4 Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { title: 'Total Vehicle Models', val: trucksCatalog.length, sub: 'Approved engineering matrix', color: '#1e3a5f', icon: Truck },
                  { title: 'Heavy Haulage (HCV)', val: trucksCatalog.filter(t => (t.gvw_category || '').includes('Heavy') || (t.gvw_category || '').includes('Tractor')).length, sub: 'Multi-axle & articulated rigs', color: '#2e7d32', icon: ShieldCheck },
                  { title: 'Multi-Axle Chasses', val: trucksCatalog.filter(t => (t.axles || 2) >= 3).length, sub: '3 to 6 axle configurations', color: '#0284c7', icon: Layers },
                  { title: 'AIS-140 Telematics', val: '100% Certified', sub: 'MORTH / ARAI compliant', color: '#16a34a', icon: Zap }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{card.title}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, margin: '4px 0 2px' }}>{card.val}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{card.sub}</div>
                      </div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} color={card.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Toolbar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {['All', 'Light', 'Medium', 'Heavy', 'Tractor'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setTrucksFilterClass(cls)}
                      style={{
                        background: trucksFilterClass === cls ? '#1e3a5f' : '#f8fafc',
                        color: trucksFilterClass === cls ? '#ffffff' : '#475569',
                        border: '1px solid ' + (trucksFilterClass === cls ? '#1e3a5f' : '#e2e8f0'),
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cls === 'All' ? 'All Classes' : `${cls} Commercial`}
                    </button>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  width: '240px'
                }}>
                  <Search size={13} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search model, OEM, application..."
                    value={trucksSearchQuery}
                    onChange={(e) => setTrucksSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Clean Empty State (When 0 items) */}
              {trucksCatalog.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <Truck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    No Vehicle Specifications Configured
                  </h3>
                  <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '12.5px', maxWidth: '480px', marginInline: 'auto' }}>
                    Your fleet specification matrix is currently unpopulated. You can register custom truck models (GVW, Axles, Payload) or load the standard baseline catalog.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setSetupModalType('truck')}
                      style={{
                        background: '#1e3a5f',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      + Create Custom Truck Spec
                    </button>
                    <button
                      onClick={handleLoadBaselinePresets}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Load Baseline Fleet (8 Presets)
                    </button>
                  </div>
                </div>
              ) : (
                /* Split View: Spec Cards Grid (Left) + Detail Inspector (Right) */
                <div style={{ display: 'grid', gridTemplateColumns: selectedTruck ? '1.4fr 1fr' : '1fr', gap: '16px' }}>
                  
                  {/* Left: Spec Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {filteredTrucks.map(trk => {
                      const isSelected = selectedTruckId === trk.id;
                      return (
                        <div
                          key={trk.id}
                          onClick={() => setSelectedTruckId(trk.id)}
                          style={{
                            background: '#ffffff',
                            border: isSelected ? '1.5px solid #1e3a5f' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '14px',
                            boxShadow: isSelected ? '0 2px 8px rgba(30, 58, 95, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.12s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: '#1e3a5f',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {trk.gvw_category || 'Commercial'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              {trk.axles} Axles
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                              {trk.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                              {trk.common_use}
                            </div>
                          </div>

                          <div style={{
                            marginTop: '4px',
                            paddingTop: '8px',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '11.5px'
                          }}>
                            <div>
                              <span style={{ color: '#94a3b8', fontSize: '10px' }}>Payload: </span>
                              <strong style={{ color: '#16a34a' }}>{trk.payload_range}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#94a3b8', fontSize: '10px' }}>Mileage: </span>
                              <strong style={{ color: '#0284c7' }}>{trk.mileage_kmpl}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Technical Specification Inspector */}
                  {selectedTruck && (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                            Technical Spec Sheet
                          </span>
                          <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 800, color: '#1e3a5f' }}>
                            {selectedTruck.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDeleteTruck(selectedTruck.id)}
                          title="Delete Spec"
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Technical Specs Table */}
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        fontSize: '11.5px'
                      }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '10.5px' }}>Payload Capacity:</span>
                          <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '13px' }}>{selectedTruck.payload_range}</div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '10.5px' }}>Fuel Economy:</span>
                          <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '13px' }}>{selectedTruck.mileage_kmpl}</div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '10.5px' }}>Max Speed:</span>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedTruck.max_speed_kmh}</div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '10.5px' }}>Chassis Dimensions:</span>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedTruck.length_m} x {selectedTruck.height_m}</div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '10.5px' }}>Axle Setup:</span>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedTruck.axles} Axles</div>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '10.5px' }}>Bulk Density Rating:</span>
                          <div style={{ fontWeight: 600, color: '#b45309' }}>{selectedTruck.bulkiness}</div>
                        </div>
                      </div>

                      {/* Approved OEMs */}
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                          Certified OEM Manufacturers
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(selectedTruck.popular_brands || ['Commercial OEM']).map((brand, bIdx) => (
                            <span key={bIdx} style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#334155'
                            }}>
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Licensing & Compliance Note */}
                      <div style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '10px',
                        fontSize: '11px',
                        color: '#64748b'
                      }}>
                        <strong style={{ color: '#0f172a' }}>Licensing Class: </strong>
                        Heavy Commercial Vehicle (HCV) endorsement with AIS-140 GPS telematics and brake dissipation certification.
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 3: SHIPPING CONTAINERS & YARD LOGISTICS                           */}
          {/* ======================================================================= */}
          {activeModule === 'containers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 4 Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { title: 'Standard ISO Specs', val: containersCatalog.length, sub: 'ISO 668 & 1496 verified', color: '#1e3a5f', icon: Box },
                  { title: 'Dry Freight TEUs', val: containersCatalog.filter(c => (c.name || '').includes('20ft') || (c.name || '').includes('40ft')).length, sub: 'Standard multimodal box', color: '#0284c7', icon: Warehouse },
                  { title: 'High Cube & Reefer', val: containersCatalog.filter(c => (c.name || '').includes('High Cube') || (c.name || '').includes('Reefer')).length, sub: 'Temperature & volumetric units', color: '#16a34a', icon: Zap },
                  { title: 'Depot Stacking Bays', val: '4-Tier Rated', sub: 'Reach stacker cleared', color: '#b45309', icon: Anchor }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{card.title}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, margin: '4px 0 2px' }}>{card.val}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{card.sub}</div>
                      </div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} color={card.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Toolbar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  ISO Intermodal Container Specs ({filteredContainers.length})
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  width: '240px'
                }}>
                  <Search size={13} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search ISO code, type..."
                    value={containerSearchQuery}
                    onChange={(e) => setContainerSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Split View: Container Catalog (Left) + Payload Feasibility Calculator (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedContainer ? '1.4fr 1fr' : '1fr', gap: '16px' }}>
                
                {/* Left Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {filteredContainers.map(cnt => {
                    const isSelected = selectedContainerId === cnt.id;
                    return (
                      <div
                        key={cnt.id}
                        onClick={() => setSelectedContainerId(cnt.id)}
                        style={{
                          background: '#ffffff',
                          border: isSelected ? '1.5px solid #1e3a5f' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px',
                          boxShadow: isSelected ? '0 2px 8px rgba(30, 58, 95, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1e3a5f', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {cnt.iso_standard}
                          </span>
                          <Box size={14} color={isSelected ? '#1e3a5f' : '#64748b'} />
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{cnt.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>
                          Max Payload: {cnt.payload_kg?.toLocaleString()} kg
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Tare: {cnt.tare_weight_kg} kg • Vol: {cnt.volume_cbm || 'ISO'} m³
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Container Details & Interactive Payload Feasibility */}
                {selectedContainer && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          ISO Container Specs
                        </span>
                        <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 800, color: '#1e3a5f' }}>
                          {selectedContainer.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteContainer(selectedContainer.id)}
                        title="Delete Spec"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '11.5px'
                    }}>
                      <div><span style={{ color: '#64748b', fontSize: '10.5px' }}>External:</span><div style={{ fontWeight: 600 }}>{selectedContainer.external_dim}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '10.5px' }}>Internal:</span><div style={{ fontWeight: 600 }}>{selectedContainer.internal_dim}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '10.5px' }}>Max Payload:</span><div style={{ fontWeight: 700, color: '#16a34a' }}>{selectedContainer.payload_kg?.toLocaleString()} kg</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '10.5px' }}>Tare Weight:</span><div style={{ fontWeight: 600 }}>{selectedContainer.tare_weight_kg?.toLocaleString()} kg</div></div>
                    </div>

                    {/* Interactive Axle Load Calculator */}
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a5f' }}>
                        Live Payload & Axle Feasibility Check
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#475569' }}>Simulated Cargo Weight (kg):</span>
                        <input
                          type="number"
                          value={cargoCalcWeight}
                          onChange={(e) => setCargoCalcWeight(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 700,
                            marginTop: '3px'
                          }}
                        />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11.5px',
                        paddingTop: '6px',
                        borderTop: '1px solid #bbf7d0'
                      }}>
                        <span>Compliance Status:</span>
                        <strong style={{ color: cargoCalcWeight <= (selectedContainer.payload_kg || 28000) ? '#16a34a' : '#dc2626' }}>
                          {cargoCalcWeight <= (selectedContainer.payload_kg || 28000) ? 'SAFE / COMPLIANT' : 'OVERLOAD ALERT!'}
                        </strong>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 4: GOODS & CARGO BLUEPRINTS                                      */}
          {/* ======================================================================= */}
          {activeModule === 'cargo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 4 Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { title: 'Commodity Sectors', val: cargoCatalog.length, sub: 'Standard stowage blueprints', color: '#1e3a5f', icon: Layers },
                  { title: 'Heavy Industrial', val: cargoCatalog.filter(c => c.category_code?.startsWith('MAT') || c.category_code?.startsWith('ENG')).length, sub: 'Steel, metals & machinery', color: '#2e7d32', icon: ShieldCheck },
                  { title: 'Hazmat & Regulated', val: cargoCatalog.filter(c => c.title?.includes('Chemical') || c.title?.includes('Hazardous')).length, sub: 'ADR / PESO certified stowage', color: '#b45309', icon: AlertTriangle },
                  { title: 'Cold Chain / Perishables', val: cargoCatalog.filter(c => c.title?.includes('Cold') || c.title?.includes('Food')).length, sub: 'Thermal integrity monitored', color: '#0284c7', icon: Zap }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{card.title}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, margin: '4px 0 2px' }}>{card.val}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{card.sub}</div>
                      </div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} color={card.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Toolbar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['All', 'Steel', 'Timber', 'Construction', 'Machinery', 'Chemicals'].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustryFilter(ind)}
                      style={{
                        background: selectedIndustryFilter === ind ? '#1e3a5f' : '#f8fafc',
                        color: selectedIndustryFilter === ind ? '#ffffff' : '#475569',
                        border: '1px solid ' + (selectedIndustryFilter === ind ? '#1e3a5f' : '#e2e8f0'),
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {ind}
                    </button>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  width: '240px'
                }}>
                  <Search size={13} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search material blueprint..."
                    value={cargoSearchQuery}
                    onChange={(e) => setCargoSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Split View: Cargo Cards (Left) + Stowage Blueprint Inspector (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedCargo ? '1.4fr 1fr' : '1fr', gap: '16px' }}>
                
                {/* Left Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {filteredCargo.map(crg => {
                    const isSelected = selectedCargoId === crg.id;
                    return (
                      <div
                        key={crg.id}
                        onClick={() => setSelectedCargoId(crg.id)}
                        style={{
                          background: '#ffffff',
                          border: isSelected ? '1.5px solid #1e3a5f' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px',
                          boxShadow: isSelected ? '0 2px 8px rgba(30, 58, 95, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff', background: '#1e3a5f', padding: '2px 6px', borderRadius: '4px' }}>
                            {crg.category_code}
                          </span>
                          <Layers size={14} color={isSelected ? '#1e3a5f' : '#64748b'} />
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{crg.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {crg.items.slice(0, 3).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Stowage Blueprint Inspector */}
                {selectedCargo && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          Stowage &amp; Lashing Blueprint
                        </span>
                        <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 800, color: '#1e3a5f' }}>
                          {selectedCargo.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteCargo(selectedCargo.id)}
                        title="Delete Spec"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '11.5px'
                    }}>
                      <div><strong style={{ color: '#1e3a5f' }}>Ideal Haulage Chassis: </strong> {selectedCargo.ideal_truck}</div>
                      <div><strong style={{ color: '#16a34a' }}>Recommended Container: </strong> {selectedCargo.ideal_container}</div>
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', color: '#475569' }}>
                        <strong>Handling &amp; Stowage: </strong> {selectedCargo.handling_notes}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                        Manifest Item Types
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedCargo.items.map((it, i) => (
                          <span key={i} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', color: '#334155' }}>
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 5: WORKFORCE & CREW DIRECTORY                                    */}
          {/* ======================================================================= */}
          {activeModule === 'workforce' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 4 Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { title: 'Total Roster', val: employeesList.length, sub: 'Certified personnel records', color: '#1e3a5f', icon: Users },
                  { title: 'Commercial Drivers', val: employeesList.filter(e => (e.department || '') === 'Drivers').length, sub: 'HCV / Articulated licensed', color: '#16a34a', icon: Truck },
                  { title: 'Ground & Yard Crew', val: employeesList.filter(e => (e.department || '').includes('Warehouse') || (e.department || '').includes('Operations')).length, sub: 'Yard & terminal operators', color: '#0284c7', icon: Warehouse },
                  { title: 'Branch Hubs', val: new Set(employeesList.map(e => e.branch)).size, sub: 'Active logistics stations', color: '#b45309', icon: Building }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{card.title}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, margin: '4px 0 2px' }}>{card.val}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{card.sub}</div>
                      </div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} color={card.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Split Layout: Department Sidebar + Personnel Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px' }}>
                
                {/* Left Department Filter Bar */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  height: 'fit-content'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Departments ({dynamicDepartments.filter(d => d.name !== 'All').length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {dynamicDepartments.map((dept, idx) => {
                      const isSelected = selectedDeptFilter.toLowerCase() === dept.name.toLowerCase();
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedDeptFilter(dept.name)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            background: isSelected ? '#1e3a5f' : 'transparent',
                            color: isSelected ? '#ffffff' : '#334155',
                            fontWeight: isSelected ? 700 : 500
                          }}
                        >
                          <span>{dept.name}</span>
                          <span style={{
                            background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontSize: '10px'
                          }}>
                            {dept.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '5px 8px'
                    }}>
                      <Search size={12} color="#64748b" />
                      <input
                        type="text"
                        placeholder="Search name, ID..."
                        value={workforceSearch}
                        onChange={(e) => setWorkforceSearch(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontSize: '11.5px',
                          color: '#0f172a'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Personnel Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {filteredEmployees.map((emp) => {
                    const avatarBg = getAvatarBg(emp.department);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployeeModal(emp)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.12s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: avatarBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#ffffff',
                            flexShrink: 0
                          }}>
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, fontFamily: 'monospace' }}>
                              {emp.id}
                            </div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {emp.designation}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          marginTop: '2px',
                          paddingTop: '6px',
                          borderTop: '1px solid #f1f5f9',
                          fontSize: '11px',
                          color: '#64748b',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{emp.branch}</span>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 6: SOVEREIGN OPERATION 1 — CADENCE (VP SUPPLY CHAIN & OPS)       */}
          {/* ======================================================================= */}
          {activeModule === 'plantguard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Executive Service Header Banner */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1d4ed8'
                  }}>
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                        Cadence
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Executive Operation: VP Supply Chain &amp; Plant Operations
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Inbound buffer pacing and line-stoppage risk telemetry. Autonomous corridor escalation ensuring component arrival continuity.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSetupModalType('plantguard')}
                    style={{
                      background: '#1e3a5f',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Provision Cadence Rule</span>
                  </button>
                </div>
              </div>

              {/* 4 Executive KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { 
                    title: 'Monitored Assembly Plants', 
                    val: plantguardSummary?.kpi_metrics?.monitored_plants ?? 0, 
                    sub: 'Active manufacturing facilities', 
                    color: '#1e3a5f', 
                    icon: Building 
                  },
                  { 
                    title: 'Line Stoppage Risk Exposure', 
                    val: `₹ ${(plantguardSummary?.kpi_metrics?.aggregate_line_stoppage_risk_exposure_inr_per_hour ?? 0).toLocaleString()}/hr`, 
                    sub: 'Aggregate hourly downtime rate', 
                    color: '#dc2626', 
                    icon: AlertOctagon 
                  },
                  { 
                    title: 'Active Component Rules', 
                    val: plantguardSummary?.rules?.length ?? 0, 
                    sub: 'JIT buffer countdown policies', 
                    color: '#0284c7', 
                    icon: Layers 
                  },
                  { 
                    title: 'Green Corridors Active', 
                    val: plantguardSummary?.kpi_metrics?.green_corridors_active ?? 0, 
                    sub: 'FASTag priority toll escalations', 
                    color: '#16a34a', 
                    icon: Zap 
                  }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{card.title}</span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: card.color
                        }}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: card.color, letterSpacing: '-0.02em' }}>
                        {card.val}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                        {card.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Grid / Empty State */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e3a5f' }}>
                    Cadence Buffer Pacing Policies ({plantguardSummary?.rules?.length ?? 0})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Real-time assembly buffer telemetry and corridor arrival status
                  </span>
                </div>

                {(!plantguardSummary?.rules || plantguardSummary.rules.length === 0) ? (
                  <div style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                        0 Active Cadence Policies
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '440px', marginTop: '4px', lineHeight: '1.4' }}>
                        No assembly line buffer pacing policies are currently registered. Provision an operational policy or load baseline presets.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        onClick={() => setSetupModalType('plantguard')}
                        style={{
                          background: '#1e3a5f',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={13} />
                        <span>Provision Cadence Rule</span>
                      </button>
                      <button
                        onClick={handleLoadBaselinePresets}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Database size={13} />
                        <span>Load Baseline Presets</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 16px' }}>Rule ID &amp; Plant</th>
                          <th style={{ padding: '10px 16px' }}>Critical Component</th>
                          <th style={{ padding: '10px 16px' }}>Line Stoppage Loss Rate</th>
                          <th style={{ padding: '10px 16px' }}>Min Buffer Stock</th>
                          <th style={{ padding: '10px 16px' }}>Receiving Dock Window</th>
                          <th style={{ padding: '10px 16px' }}>FASTag Priority</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plantguardSummary.rules.map((rule) => (
                          <tr key={rule.rule_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{rule.plant_name}</div>
                              <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#64748b' }}>{rule.rule_id}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{rule.critical_component}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontWeight: 800,
                                color: '#dc2626',
                                background: '#fee2e2',
                                padding: '2px 7px',
                                borderRadius: '4px'
                              }}>
                                ₹ {(rule.line_stoppage_loss_inr_per_hour || 0).toLocaleString()} / hr
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{rule.minimum_buffer_stock_hours} Hours</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ color: '#475569', fontSize: '11.5px' }}>{rule.receiving_dock_window}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {rule.express_corridor_toll_escalation ? (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Zap size={11} /> Auto Green Channel
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Standard FastTag</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeletePlantguard(rule.rule_id)}
                                title="Deactivate Rule"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 7: SOVEREIGN OPERATION 2 — PARITY (CFO & COMMERCIAL FINANCE)     */}
          {/* ======================================================================= */}
          {activeModule === 'capitallock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Executive Service Header Banner */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}>
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                        Parity
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#d1fae5',
                        color: '#065f46',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Executive Operation: CFO &amp; Commercial Finance
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      In-transit capital float indexing, dynamic fuel variance adjustment, and automated verified ePOD settlement ledger.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSetupModalType('capitallock')}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Provision Parity Record</span>
                  </button>
                </div>
              </div>

              {/* 4 Executive KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { 
                    title: 'Active Escrows In Force', 
                    val: capitallockSummary?.kpi_metrics?.active_escrows ?? 0, 
                    sub: 'Under active commercial contract', 
                    color: '#1e3a5f', 
                    icon: FileText 
                  },
                  { 
                    title: 'Trapped Working Capital', 
                    val: `₹ ${(capitallockSummary?.kpi_metrics?.total_in_transit_trapped_capital_inr ?? 0).toLocaleString()}`, 
                    sub: 'Total freight valuation in-transit', 
                    color: '#059669', 
                    icon: DollarSign 
                  },
                  { 
                    title: 'Daily Interest Drag', 
                    val: `₹ ${(capitallockSummary?.kpi_metrics?.aggregate_daily_interest_drag_inr ?? 0).toLocaleString()}/day`, 
                    sub: 'Liquidity cost @ 9.0% benchmark', 
                    color: '#b45309', 
                    icon: TrendingDown 
                  },
                  { 
                    title: 'Pending Escrow Releases', 
                    val: capitallockSummary?.kpi_metrics?.pending_clean_epod_releases ?? 0, 
                    sub: 'Awaiting dual clean-ePOD signature', 
                    color: '#0284c7', 
                    icon: Scale 
                  }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{card.title}</span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: card.color
                        }}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: card.color, letterSpacing: '-0.02em' }}>
                        {card.val}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                        {card.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Grid / Empty State */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e3a5f' }}>
                    Parity Float &amp; Settlement Ledger ({capitallockSummary?.escrows?.length ?? 0})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Real-time diesel variance indexing &amp; detention reconciliation
                  </span>
                </div>

                {(!capitallockSummary?.escrows || capitallockSummary.escrows.length === 0) ? (
                  <div style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                        0 Active Parity Records
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '440px', marginTop: '4px', lineHeight: '1.4' }}>
                        No in-transit capital float records are currently active. Register a settlement record with fuel variance indexing or load baseline presets.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        onClick={() => setSetupModalType('capitallock')}
                        style={{
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={13} />
                        <span>Provision Parity Record</span>
                      </button>
                      <button
                        onClick={handleLoadBaselinePresets}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Database size={13} />
                        <span>Load Baseline Presets</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 16px' }}>Escrow ID</th>
                          <th style={{ padding: '10px 16px' }}>Consignor &amp; Consignee</th>
                          <th style={{ padding: '10px 16px' }}>Trapped Capital</th>
                          <th style={{ padding: '10px 16px' }}>Daily Interest Drag</th>
                          <th style={{ padding: '10px 16px' }}>Fuel Indexation Clause</th>
                          <th style={{ padding: '10px 16px' }}>Demurrage Allocation</th>
                          <th style={{ padding: '10px 16px' }}>Release Condition</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {capitallockSummary.escrows.map((esc) => (
                          <tr key={esc.escrow_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#1e3a5f' }}>
                                {esc.escrow_id}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{esc.consignor}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>➔ {esc.consignee}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 800, color: '#059669' }}>
                                ₹ {(esc.in_transit_capital_inr || 0).toLocaleString()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontWeight: 700,
                                color: '#b45309',
                                background: '#fef3c7',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                ₹ {(esc.daily_working_capital_interest_drag_inr || 0).toLocaleString()} / day
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ color: '#475569', fontSize: '11px' }}>{esc.fuel_price_escalation_clause}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ color: '#334155', fontSize: '11.5px', fontWeight: 500 }}>{esc.demurrage_allocation_hours}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: 600,
                                color: '#0369a1',
                                background: '#e0f2fe',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                {esc.escrow_release_condition}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteCapitallock(esc.escrow_id)}
                                title="Release / Delete Escrow"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 8: SOVEREIGN OPERATION 3 — SENTRY (CHIEF RISK OFFICER & LEGAL)    */}
          {/* ======================================================================= */}
          {activeModule === 'shieldgate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Executive Service Header Banner */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c'
                  }}>
                    <Lock size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                        Sentry
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#ffedd5',
                        color: '#9a3412',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Executive Operation: Chief Risk Officer &amp; Legal Counsel
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Carrier custody validation, anti-delegation enforcement, cryptographic route seals, and transit governance ledger.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSetupModalType('shieldgate')}
                    style={{
                      background: '#c2410c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Provision Sentry Policy</span>
                  </button>
                </div>
              </div>

              {/* 4 Executive KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { 
                    title: 'Active Security Policies', 
                    val: shieldgateSummary?.kpi_metrics?.active_policies ?? 0, 
                    sub: 'Monitored freight corridors', 
                    color: '#1e3a5f', 
                    icon: ShieldCheck 
                  },
                  { 
                    title: 'Anti-Subcontracting Strictness', 
                    val: shieldgateSummary?.kpi_metrics?.anti_subcontracting_enforcement_strictness ?? '100% Strict', 
                    sub: 'Zero broker re-delegation', 
                    color: '#ea580c', 
                    icon: Lock 
                  },
                  { 
                    title: 'Geofence Deviation Ceiling', 
                    val: `${shieldgateSummary?.kpi_metrics?.geofence_deviation_threshold_meters ?? 500}m`, 
                    sub: 'Corridor breach alarm trigger', 
                    color: '#dc2626', 
                    icon: Compass 
                  },
                  { 
                    title: 'High-Risk Corridors', 
                    val: shieldgateSummary?.kpi_metrics?.high_risk_corridors ?? 0, 
                    sub: 'Active E-Seal OTP locks', 
                    color: '#0284c7', 
                    icon: AlertTriangle 
                  }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{card.title}</span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: card.color
                        }}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: card.color, letterSpacing: '-0.02em' }}>
                        {card.val}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                        {card.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Grid / Empty State */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e3a5f' }}>
                    Sentry Custody &amp; Transit Governance Ledger ({shieldgateSummary?.policies?.length ?? 0})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Carrier custody validation &amp; statutory transit governance
                  </span>
                </div>

                {(!shieldgateSummary?.policies || shieldgateSummary.policies.length === 0) ? (
                  <div style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <Lock size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                        0 Active Sentry Policies
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '440px', marginTop: '4px', lineHeight: '1.4' }}>
                        No transit governance policies currently active. Deploy an anti-delegation carrier policy with cryptographic seal validation or load baseline presets.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        onClick={() => setSetupModalType('shieldgate')}
                        style={{
                          background: '#c2410c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={13} />
                        <span>Provision Sentry Policy</span>
                      </button>
                      <button
                        onClick={handleLoadBaselinePresets}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Database size={13} />
                        <span>Load Baseline Presets</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 16px' }}>Policy ID &amp; Corridor</th>
                          <th style={{ padding: '10px 16px' }}>Contracted Carrier</th>
                          <th style={{ padding: '10px 16px' }}>Subcontracting Rule</th>
                          <th style={{ padding: '10px 16px' }}>Telematics E-Seal</th>
                          <th style={{ padding: '10px 16px' }}>Geofence Breach Limit</th>
                          <th style={{ padding: '10px 16px' }}>GST Section 129 Indemnity</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shieldgateSummary.policies.map((pol) => (
                          <tr key={pol.policy_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{pol.corridor}</div>
                              <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#64748b' }}>{pol.policy_id}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{pol.carrier_name}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {pol.zero_subcontracting_enforcement ? (
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  padding: '2px 7px',
                                  borderRadius: '4px'
                                }}>
                                  Strict Zero-Tolerance
                                </span>
                              ) : (
                                <span style={{ color: '#64748b' }}>Standard Audited</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ color: '#334155', fontSize: '11px', fontWeight: 600 }}>{pol.telematics_seal_type}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 700, color: '#dc2626' }}>{pol.max_geofence_deviation_meters}m</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontSize: '11px',
                                color: '#15803d',
                                background: '#f0fdf4',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600
                              }}>
                                {pol.gst_section_129_indemnity_clause}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteShieldgate(pol.policy_id)}
                                title="Revoke Policy"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* MODULE 9: SOVEREIGN OPERATION 4 — FLUX (HEAD OF PROCUREMENT & ESG)      */}
          {/* ======================================================================= */}
          {activeModule === 'ecoyield' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Executive Service Header Banner */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a'
                  }}>
                    <Leaf size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                        Flux
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Executive Operation: Head of Procurement &amp; ESG Logistics
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Backhaul allocation, deadhead lane elimination, and fleet emissions intensity telemetry.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSetupModalType('ecoyield')}
                    style={{
                      background: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Provision Flux Benchmark</span>
                  </button>
                </div>
              </div>

              {/* 4 Executive KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { 
                    title: 'Active ESG Benchmarks', 
                    val: ecoyieldSummary?.kpi_metrics?.active_benchmarks ?? 0, 
                    sub: 'Monitored industry supply chains', 
                    color: '#1e3a5f', 
                    icon: Award 
                  },
                  { 
                    title: 'Target Scope 3 Ceiling', 
                    val: `${ecoyieldSummary?.kpi_metrics?.average_scope3_cap_g_per_tkm ?? 0} gCO₂/t-km`, 
                    sub: 'Mandatory carbon intensity cap', 
                    color: '#15803d', 
                    icon: Leaf 
                  },
                  { 
                    title: 'Deadhead Reduction Commitment', 
                    val: `${ecoyieldSummary?.kpi_metrics?.target_deadhead_reduction_pct ?? 0}%`, 
                    sub: 'Contracted reverse haul volume', 
                    color: '#0284c7', 
                    icon: RotateCcw 
                  },
                  { 
                    title: 'Unlocked Freight Tariff Rebate', 
                    val: `${ecoyieldSummary?.kpi_metrics?.average_tariff_rebate_pct ?? 0}%`, 
                    sub: 'Procurement cost reduction rebate', 
                    color: '#b45309', 
                    icon: Percent 
                  }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{card.title}</span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: card.color
                        }}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: card.color, letterSpacing: '-0.02em' }}>
                        {card.val}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                        {card.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Grid / Empty State */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e3a5f' }}>
                    Flux Yield &amp; Emission Benchmark Registry ({ecoyieldSummary?.benchmarks?.length ?? 0})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Scope 3 emission intensity &amp; deadhead route optimization
                  </span>
                </div>

                {(!ecoyieldSummary?.benchmarks || ecoyieldSummary.benchmarks.length === 0) ? (
                  <div style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <Leaf size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                        0 Active Flux Benchmarks
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '440px', marginTop: '4px', lineHeight: '1.4' }}>
                        No backhaul allocation or emissions benchmarks configured. Register a benchmark for your corridor or load baseline presets.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        onClick={() => setSetupModalType('ecoyield')}
                        style={{
                          background: '#15803d',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={13} />
                        <span>Provision Flux Benchmark</span>
                      </button>
                      <button
                        onClick={handleLoadBaselinePresets}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Database size={13} />
                        <span>Load Baseline Presets</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 16px' }}>Benchmark ID &amp; Sector</th>
                          <th style={{ padding: '10px 16px' }}>Scope 3 Carbon Cap</th>
                          <th style={{ padding: '10px 16px' }}>Deadhead Reduction %</th>
                          <th style={{ padding: '10px 16px' }}>Tariff Discount Rebate</th>
                          <th style={{ padding: '10px 16px' }}>Carrier ESG Trust Tier</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ecoyieldSummary.benchmarks.map((bm) => (
                          <tr key={bm.benchmark_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{bm.industry_sector}</div>
                              <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#64748b' }}>{bm.benchmark_id}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 800, color: '#15803d' }}>
                                {bm.max_scope3_emission_g_per_tkm} gCO₂/t-km
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 700, color: '#0284c7' }}>
                                {bm.deadhead_reduction_commitment_pct}% Contracted
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontWeight: 800,
                                color: '#b45309',
                                background: '#fef3c7',
                                padding: '2px 7px',
                                borderRadius: '4px'
                              }}>
                                {bm.tariff_discount_rebate_pct}% Tariff Rebate
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#16a34a',
                                background: '#f0fdf4',
                                padding: '2px 7px',
                                borderRadius: '4px'
                              }}>
                                {bm.carrier_esg_trust_tier}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteEcoyield(bm.benchmark_id)}
                                title="Remove Benchmark"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Personnel Profile Modal */}
      {selectedEmployeeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            width: '420px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '16px' }}>Personnel: {selectedEmployeeModal.id}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleDeleteEmployee(selectedEmployeeModal.id)}
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
                <button
                  onClick={() => setSelectedEmployeeModal(null)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Name:</strong> {selectedEmployeeModal.name}</div>
              <div><strong>Designation:</strong> {selectedEmployeeModal.designation}</div>
              <div><strong>Department:</strong> {selectedEmployeeModal.department}</div>
              <div><strong>Assigned Branch:</strong> {selectedEmployeeModal.branch}</div>
              <div><strong>Contact:</strong> {selectedEmployeeModal.phone} • {selectedEmployeeModal.email}</div>
              {selectedEmployeeModal.license_grade && <div><strong>License Grade:</strong> {selectedEmployeeModal.license_grade}</div>}
              {selectedEmployeeModal.safety_rating && <div><strong>Safety Record:</strong> <span style={{ color: '#16a34a', fontWeight: 600 }}>{selectedEmployeeModal.safety_rating}</span></div>}
            </div>
          </div>
        </div>
      )}

      {/* Universal Enterprise Entity Setup Modal */}
      <EnterpriseSetupModal
        isOpen={Boolean(setupModalType)}
        initialTab={setupModalType || 'order'}
        onClose={() => setSetupModalType(null)}
        onCreated={() => {
          fetchAllData();
          triggerNotification('Entity successfully registered in live cluster.');
        }}
      />

    </div>
  );
}
