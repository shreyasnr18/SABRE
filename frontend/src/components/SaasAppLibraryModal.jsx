import React, { useState } from 'react';
import { 
  Search, X, Check, Plus, ExternalLink, ShieldCheck, 
  DollarSign, Truck, Radio, Layers, Terminal, Sparkles, Key, Zap
} from 'lucide-react';

export const SAAS_CATALOG = [
  {
    id: 'transport-lifecycle',
    name: 'Indian Transport Operational & Financial Suite',
    category: 'Finance & Billing',
    developer: 'National Logistics Policy & ULIP Labs',
    description: 'Documented 8-stage operational paper chain: ULIP VAHAN/SARATHI compliance, 4-copy Bilty (SAC 9965), FASTag toll sync, stamped POD gate, and 24hr MSME TReDS discounting.',
    iconBg: '#059669',
    iconLetter: 'L',
    installed: true,
    features: ['ULIP VAHAN & SARATHI Check', '4-Copy Bilty (GTA SAC 9965)', '70% Advance Outflow Hisaab', 'E-Way Countdown & FASTag API', 'Physical Stamped POD Gate', 'TReDS 24hr MSME Factoring', 'Workforce Khata & Vehicle Standalone P&L'],
    permissions: ['Verify ULIP Database', 'Issue 4-Copy Consignment Notes', 'Track FASTag Bank Statement', 'Execute TReDS Factoring Bids']
  },
  {
    id: 'tallybooks',
    name: 'TallyBooks Enterprise',
    category: 'Finance & Billing',
    developer: 'SABRE Financial Labs',
    description: 'Autonomous freight billing, legal tax invoicing, double-entry general ledger, and driver CTC payroll.',
    iconBg: '#059669',
    iconLetter: 'T',
    installed: true,
    features: ['Double-Entry Tally Ledger', 'Automated GST 18% Invoicing', 'Driver Bata & CTC Payroll', 'Printable Bank Statements'],
    permissions: ['Read & Write Invoices', 'Post Journal Vouchers', 'Export Tax Compliance Reports']
  },
  {
    id: 'nexus-dispatch',
    name: 'NexusDispatch AI',
    category: 'Operations & Fleet',
    developer: 'SABRE Autonomous Core',
    description: 'Algorithmic multi-fleet dispatch optimizer balancing driver HOS, backhaul matching, and zero deadheads.',
    iconBg: '#2563eb',
    iconLetter: 'N',
    installed: true,
    features: ['Dynamic Backhaul Matching', 'Driver Hours of Service (HOS)', 'Automated E-Way Generation'],
    permissions: ['Dispatch Vehicle Orders', 'Modify Driver Route Schedules']
  },
  {
    id: 'robodock',
    name: 'RoboDock 4.0',
    category: 'Industrial Robotics',
    developer: 'RoboLogistics Inc',
    description: 'Computer vision and autonomous AGV cross-dock crane scheduling with zero-touch driver check-in.',
    iconBg: '#d97706',
    iconLetter: 'R',
    installed: false,
    features: ['OCR Container Recognition', 'Automated Bay Levelers', 'RFID Boom Barrier Gate Passes'],
    permissions: ['Reserve Warehouse Docks', 'Issue Gate Passes']
  },
  {
    id: 'freight-ex',
    name: 'Freight-Ex Spot Market',
    category: 'Finance & Billing',
    developer: 'FreightFintech Global',
    description: 'High-frequency spot freight exchange with reverse bidding auctions and milestone-based instant escrow.',
    iconBg: '#7c3aed',
    iconLetter: 'F',
    installed: false,
    features: ['Reverse Bidding Auctions', 'Instant Escrow Payouts', 'Digital Proof of Delivery (e-POD)'],
    permissions: ['Place Spot Bids', 'Execute Escrow Transfers']
  },
  {
    id: 'shield-waf',
    name: 'Shield-WAF Telematics',
    category: 'Security & Defense',
    developer: 'Aegis Cyber Defense',
    description: 'Connected vehicle cyber defense detecting GPS spoofing, CAN-Bus injection attacks, and anti-theft fuel cutoffs.',
    iconBg: '#dc2626',
    iconLetter: 'S',
    installed: true,
    features: ['Anti-GPS Spoofing Filter', 'ECU Packet Inspection', 'Remote Engine Immobilizer'],
    permissions: ['Audit CAN-Bus Telemetry', 'Trigger Safety Immobilization']
  },
  {
    id: 'carbon-ledger',
    name: 'CarbonLedger ESG',
    category: 'ESG Compliance',
    developer: 'GreenFreight Global',
    description: 'Regulatory Scope 1, 2, 3 carbon emission accounting (ISO 14064) with automated green freight certifications.',
    iconBg: '#16a34a',
    iconLetter: 'C',
    installed: false,
    features: ['Grams CO2 per Tonne-KM', 'EU CBAM Export Certificates', 'Carbon Offset Ledger'],
    permissions: ['Read Fuel Consumption', 'Generate ESG Certificates']
  }
];

export default function SaasAppLibraryModal({ isOpen, onClose, onLaunchAppInNewTab, installedApps = ['tallybooks', 'shield-waf', 'nexus-dispatch'], onTogglePlugin }) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localInstalled, setLocalInstalled] = useState(installedApps);

  const categories = ['All', 'Finance & Billing', 'Operations & Fleet', 'Industrial Robotics', 'Security & Defense', 'ESG Compliance'];

  const filteredApps = SAAS_CATALOG.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAppClick = (app) => {
    if (onLaunchAppInNewTab) {
      onLaunchAppInNewTab(app.id);
    } else {
      window.open(`/?app=${app.id}`, '_blank');
    }
  };

  const handlePluginToggle = (e, appId) => {
    e.stopPropagation();
    let updated;
    if (localInstalled.includes(appId)) {
      updated = localInstalled.filter(id => id !== appId);
    } else {
      updated = [...localInstalled, appId];
    }
    setLocalInstalled(updated);
    if (onTogglePlugin) {
      onTogglePlugin(updated);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      {/* MODAL DIALOG (DARK PAAS AESTHETIC) */}
      <div style={{
        background: '#070f1e',
        border: '1.5px solid #1e3a5f',
        borderRadius: '12px',
        width: '880px',
        maxWidth: '100%',
        height: '640px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7)',
        color: '#ffffff',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif'
      }}>
        
        {/* HEADER */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1e3450',
          background: '#0a1628',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#1e3a5f',
              border: '1px solid #2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={17} color="#4ade80" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.02em', color: '#ffffff' }}>
                SAAS APPLICATION &amp; PLUGIN STORE
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                Independent cloud applications. Click any app to launch in a new tab window.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #1e3450',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          background: '#081220'
        }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            width: '280px'
          }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input 
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0d1d33',
                border: '1px solid #1e3a5f',
                borderRadius: '6px',
                padding: '7px 10px 7px 32px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? '#2e7d32' : '#0d1d33',
                  color: selectedCategory === cat ? '#ffffff' : '#cbd5e1',
                  border: '1px solid ' + (selectedCategory === cat ? '#4ade80' : '#1e3450'),
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* APP GRID (PURE APPS - CLICKING CARD LAUNCHES STANDALONE APP IN NEW TAB) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          alignContent: 'start',
          background: '#060d19'
        }}>
          {filteredApps.map(app => {
            const isInstalled = localInstalled.includes(app.id);
            return (
              <div 
                key={app.id}
                onClick={() => handleAppClick(app)}
                style={{
                  background: '#0c182b',
                  border: '1px solid #1e3450',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(56, 189, 248, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e3450';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.35)';
                }}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '9px',
                        background: app.iconBg,
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                        flexShrink: 0
                      }}>
                        {app.iconLetter}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{app.name}</span>
                          <ExternalLink size={13} color="#94a3b8" />
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                          {app.developer} &bull; <span style={{ color: '#38bdf8' }}>{app.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Plugin Link Toggle Badge */}
                    <button
                      onClick={(e) => handlePluginToggle(e, app.id)}
                      title={isInstalled ? "Active as SABRE AI plugin" : "Enable as SABRE AI plugin"}
                      style={{
                        background: isInstalled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid ' + (isInstalled ? '#22c55e' : '#334155'),
                        color: isInstalled ? '#4ade80' : '#94a3b8',
                        borderRadius: '16px',
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isInstalled ? <Check size={11} color="#4ade80" /> : <Plus size={11} />}
                      <span>{isInstalled ? 'AI Linked' : 'Link AI'}</span>
                    </button>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.45, margin: '0 0 12px 0' }}>
                    {app.description}
                  </p>
                </div>

                {/* Footer Features tag list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', paddingTop: '10px', borderTop: '1px solid #14253d' }}>
                  {app.features.slice(0, 3).map((feat, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '10px',
                        background: '#102138',
                        color: '#94a3b8',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid #1e3450'
                      }}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM STATUS BAR */}
        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid #1e3450',
          background: '#0a1628',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#94a3b8'
        }}>
          <div>
            Showing <strong>{filteredApps.length}</strong> enterprise applications &bull; <strong>{localInstalled.length}</strong> linked to SABRE AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span>Click any app to launch in independent tab</span>
          </div>
        </div>

      </div>

    </div>
  );
}
