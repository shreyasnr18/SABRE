import React, { useState } from 'react';
import { X, Lock, Plane as PlaneIcon, Map, Navigation, Share2, MoreHorizontal, Activity, ArrowRight, Star, RefreshCw, Crosshair, ShieldCheck, PowerOff, Cpu, Zap, Cloud, Database, Wifi } from 'lucide-react';

export default function TruckRadarPanel({ activeTruck: propActiveTruck, fleet, activeTruckId, onClose, onLockOn, onReroute, onHalt, onSelectTruck, onSimulateIncident, onManualReroute, onResetFleet, onEngageSwarm }) {
  const [expandedSection, setExpandedSection] = useState('info'); // 'info' or 'graph' or 'diagnostics'
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  // Resolve active truck from either prop or fleet telemetry
  const activeTruck = propActiveTruck || (fleet && activeTruckId ? fleet.find(t => t.id === activeTruckId) : null) || (fleet && fleet.length > 0 ? fleet[0] : null);

  if (!activeTruck) {
    return null;
  }

  const metadata = activeTruck.metadata || { type: 'Heavy Commercial Vehicle' };
  const routing = activeTruck.routing || { scheduled_dep: '06:00', actual_dep: '06:15' };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="flightradar-sidebar">
      {/* Header */}
      <div className="fr-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="fr-truck-id">{activeTruck.id}</h2>
              <span className="fr-badge">{metadata.type.split(' ')[0]}</span>
              <span className="fr-badge blue">{metadata.type.split(' ').slice(1).join(' ')}</span>
            </div>
            <div className="fr-airline">SABRE Logistics</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star size={20} color="var(--neon-cyan)" />
            <X size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={onClose} />
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="fr-image-container">
        <img src="/truck.jpg" alt="Logistics Truck" className="fr-hero-image" />
        <div className="fr-image-copyright">© SABRE AI Generator</div>
      </div>

      {/* Route & Progress Section */}
      <div className="fr-route-section">
        <div className="fr-route-header">
          <div className="fr-city-block">
            <h1 className="fr-city-code">ORG</h1>
            <div className="fr-city-name">ORIGIN</div>
            <div className="fr-timezone">+05 (UTC +05:00)</div>
          </div>
          <div className="fr-plane-icon">
            <ArrowRight size={24} color="var(--neon-cyan)" />
          </div>
          <div className="fr-city-block right">
            <h1 className="fr-city-code">DST</h1>
            <div className="fr-city-name">DESTINATION</div>
            <div className="fr-timezone">+05 (UTC +05:00)</div>
          </div>
        </div>

        <div className="fr-schedule-grid">
          <div className="fr-schedule-col">
            <div className="fr-schedule-row">
              <span className="label">SCHEDULED</span>
              <span className="value">{routing.scheduled_dep}</span>
            </div>
            <div className="fr-schedule-row">
              <span className="label">ACTUAL</span>
              <span className="value">{routing.actual_dep}</span>
            </div>
          </div>
          <div className="fr-schedule-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="fr-schedule-row">
              <span className="label">SCHEDULED</span>
              <span className="value">{routing.eta}</span>
            </div>
            <div className="fr-schedule-row">
              <span className="label">ESTIMATED</span>
              <span className="value" style={{ color: 'var(--neon-green)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block', marginRight: 4 }}></div>
                {routing.eta}
              </span>
            </div>
          </div>
        </div>

        <div className="fr-progress-container">
          <div className="fr-progress-bar">
            <div className="fr-progress-fill" style={{ width: `${Math.max(2, Math.min(100, (routing.covered_km / Math.max(routing.total_dist_km, 1)) * 100))}%` }}></div>
            <div className="fr-progress-icon" style={{ left: `${Math.max(2, Math.min(100, (routing.covered_km / Math.max(routing.total_dist_km, 1)) * 100))}%` }}>
              <Navigation size={14} fill="var(--neon-cyan)" stroke="var(--neon-cyan)" style={{ transform: 'rotate(90deg)' }} />
            </div>
          </div>
          <div className="fr-progress-stats">
            <span>{routing.covered_km} km, {formatTime(routing.elapsed_sec)} ago</span>
            <span>{routing.remaining_km} km, in {formatTime(routing.total_est_sec - routing.elapsed_sec)}</span>
          </div>
        </div>
      </div>

      <div className="fr-scroll-area">
        {/* Accordion: More Information */}
        <div className="fr-accordion">
          <div 
            className="fr-accordion-header" 
            onClick={() => setExpandedSection(expandedSection === 'info' ? null : 'info')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} />
              <span>More {metadata.reg} information</span>
            </div>
            <span>{expandedSection === 'info' ? 'ᐱ' : 'ᐯ'}</span>
          </div>
          
          {expandedSection === 'info' && (
            <div className="fr-accordion-content">
              <div className="fr-info-block">
                <span className="label">TRUCK TYPE ({metadata.serial})</span>
                <span className="value large">{metadata.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <div className="fr-info-block">
                  <span className="label">REGISTRATION</span>
                  <span className="value">{metadata.reg}</span>
                </div>
                <div className="fr-info-block">
                  <span className="label">COUNTRY OF REG.</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} color="var(--neon-cyan)" /> {metadata.country}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <div className="fr-info-block">
                  <span className="label">SERIAL NUMBER (VIN)</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} color="var(--neon-cyan)" /> {metadata.serial}
                  </span>
                </div>
                <div className="fr-info-block">
                  <span className="label">AGE</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} color="var(--neon-cyan)" /> {metadata.age}
                  </span>
                </div>
              </div>
              <div className="fr-info-block" style={{ marginTop: '16px' }}>
                <span className="label">VEHICLE CATEGORY</span>
                <span className="value">Commercial Heavy Freight</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordion: Speed & Altitude Graph (adapted for topography) */}
        <div className="fr-accordion">
          <div 
            className="fr-accordion-header" 
            onClick={() => setExpandedSection(expandedSection === 'graph' ? null : 'graph')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} />
              <span>Speed & Topography graph</span>
            </div>
            <span>{expandedSection === 'graph' ? 'ᐱ' : 'ᐯ'}</span>
          </div>
          
          {expandedSection === 'graph' && (
            <div className="fr-accordion-content">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="fr-info-block">
                  <span className="label">GROUND SPEED</span>
                  <span className="value large">{activeTruck.speed_kmh} km/h</span>
                </div>
                <div className="fr-info-block">
                  <span className="label">ELEVATION</span>
                  <span className="value large">{metadata.altitude} m</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <div className="fr-info-block">
                  <span className="label">WIND</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} color="var(--neon-cyan)" /> {metadata.wind_speed} kts
                  </span>
                </div>
                <div className="fr-info-block">
                  <span className="label">TEMPERATURE</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} color="var(--neon-cyan)" /> {metadata.ambient_temp}°C
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                 <div className="fr-info-block">
                  <span className="label">GPS LATITUDE</span>
                  <span className="value large">{activeTruck.lat.toFixed(4)}</span>
                </div>
                <div className="fr-info-block">
                  <span className="label">GPS LONGITUDE</span>
                  <span className="value large">{activeTruck.lon.toFixed(4)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '4px', border: '1px solid var(--neon-cyan)' }}>
                 <div className="fr-info-block">
                  <span className="label">ENGINE STATE (EDGE)</span>
                  <span className="value" style={{ color: 'var(--neon-cyan)' }}>{activeTruck.edge_computing?.engine_state || 'CRUISING'}</span>
                </div>
                <div className="fr-info-block">
                  <span className="label">TOPOGRAPHY</span>
                  <span className="value" style={{ color: 'var(--neon-cyan)' }}>{activeTruck.edge_computing?.topography || 'FLAT'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion: AI Vision */}
        <div className="fr-accordion">
          <div 
            className="fr-accordion-header" 
            onClick={() => setExpandedSection(expandedSection === 'ai' ? null : 'ai')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} />
              <span>AI Vision & Intents</span>
            </div>
            <span>{expandedSection === 'ai' ? 'ᐱ' : 'ᐯ'}</span>
          </div>
          {expandedSection === 'ai' && (
            <div className="fr-accordion-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {activeTruck.ai_vision?.length > 0 ? (
                activeTruck.ai_vision.map((log, idx) => (
                  <div key={idx} style={{ fontFamily: 'monospace', fontSize: '11px', color: idx === 0 ? 'var(--neon-green)' : 'var(--text-muted)', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {'>'} {log}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace' }}>No AI events logged.</div>
              )}
            </div>
          )}
        </div>

        {/* Accordion: Digital Twin */}
        <div className="fr-accordion">
          <div 
            className="fr-accordion-header" 
            onClick={() => setExpandedSection(expandedSection === 'twin' ? null : 'twin')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} />
              <span>Digital Twin Simulation</span>
            </div>
            <span>{expandedSection === 'twin' ? 'ᐱ' : 'ᐯ'}</span>
          </div>
          {expandedSection === 'twin' && activeTruck.digital_twin && (
            <div className="fr-accordion-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="fr-info-block">
                  <span className="label">BRAKE PAD WEAR</span>
                  <span className="value large" style={{ color: activeTruck.digital_twin.brake_pad_wear_mm > 0.1 ? 'var(--neon-amber)' : 'white' }}>
                    {activeTruck.digital_twin.brake_pad_wear_mm} mm
                  </span>
                </div>
                <div className="fr-info-block">
                  <span className="label">SUSPENSION STRESS</span>
                  <span className="value large">{activeTruck.digital_twin.suspension_stress_mpa} MPa</span>
                </div>
                <div className="fr-info-block">
                  <span className="label">BATTERY HEALTH</span>
                  <span className="value large">{activeTruck.digital_twin.battery_health}%</span>
                </div>
                <div className="fr-info-block">
                  <span className="label">PRED. FAILURE</span>
                  <span className="value large" style={{ color: 'var(--neon-red)' }}>{activeTruck.digital_twin.pred_failure_days} Days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion: OTA Flash */}
        <div className="fr-accordion">
          <div 
            className="fr-accordion-header" 
            onClick={() => setExpandedSection(expandedSection === 'ota' ? null : 'ota')}
            style={{ background: expandedSection === 'ota' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', borderLeft: '3px solid #a855f7' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7' }}>
              <Wifi size={18} />
              <span>OTA Performance Tuning</span>
            </div>
            <span>{expandedSection === 'ota' ? 'ᐱ' : 'ᐯ'}</span>
          </div>
          {expandedSection === 'ota' && (
            <div className="fr-accordion-content">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                CURRENT PROFILE: <strong style={{ color: 'white' }}>{activeTruck.edge_computing?.ota_profile || 'STANDARD'}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="nav-item" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }} onClick={() => fetch(`http://localhost:8000/api/v1/fleet/${activeTruck.id}/ota-flash`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({profile: 'ECO_CITY_GLIDE'}) })}>
                  <Zap size={14} color="var(--neon-green)" /> Flash ECO CITY GLIDE
                </button>
                <button className="nav-item" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }} onClick={() => fetch(`http://localhost:8000/api/v1/fleet/${activeTruck.id}/ota-flash`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({profile: 'GHAT_POWER_CLIMB'}) })}>
                  <Zap size={14} color="var(--neon-amber)" /> Flash GHAT POWER CLIMB
                </button>
                <button className="nav-item" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }} onClick={() => fetch(`http://localhost:8000/api/v1/fleet/${activeTruck.id}/ota-flash`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({profile: 'STANDARD'}) })}>
                  <Zap size={14} color="var(--text-muted)" /> Revert to STANDARD
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fr-action-bar">
        <button className="fr-action-btn" onClick={async () => {
            if (expandedSection === 'diagnostics') {
                setExpandedSection(null);
            } else {
                setExpandedSection('diagnostics');
                try {
                    const res = await fetch(`http://localhost:8000/api/v1/fleet/${activeTruck.id}/diagnostics`);
                    const data = await res.json();
                    setDiagnosticsData(data);
                } catch(e) {}
            }
        }}>
          <Activity size={20} color={expandedSection === 'diagnostics' ? 'var(--neon-cyan)' : 'white'} />
          <span>DIAGNOSTICS</span>
        </button>
        <button className="fr-action-btn" onClick={() => {
            fetch('http://localhost:8000/api/v1/fleet/inject-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event_type: 'MANUAL_REROUTE', target_location: '13.10,80.21', affected_segment_id: 'SEG-404' })
            });
            if (onReroute) onReroute();
        }}>
          <RefreshCw size={20} />
          <span>RE-ROUTE</span>
        </button>
        <button className="fr-action-btn" onClick={() => {
            if (onLockOn) onLockOn();
        }}>
          <Crosshair size={20} />
          <span>LOCK ON</span>
        </button>
        <button className="fr-action-btn" onClick={() => {
            navigator.clipboard.writeText(`SABRE-SECURE-LNK-${activeTruck.id}-${Date.now()}`);
            setCopyStatus('COPIED!');
            setTimeout(() => setCopyStatus(''), 2000);
        }}>
          <ShieldCheck size={20} />
          <span>{copyStatus || 'SECURE LINK'}</span>
        </button>
        <button className="fr-action-btn" onClick={() => {
            fetch(`http://localhost:8000/api/v1/fleet/${activeTruck.id}/${activeTruck.state === 'halted' ? 'resume' : 'halt'}`, { method: 'POST' });
            if (onHalt) onHalt();
        }}>
          <PowerOff size={20} color={activeTruck.state === 'halted' ? 'var(--neon-red)' : 'white'} />
          <span>{activeTruck.state === 'halted' ? 'RESUME' : 'HALT'}</span>
        </button>
      </div>

      {expandedSection === 'diagnostics' && diagnosticsData && (
        <div style={{ position: 'absolute', bottom: '80px', left: '16px', right: '16px', background: 'rgba(0,0,0,0.8)', padding: '16px', borderRadius: '8px', border: '1px solid var(--neon-cyan)', zIndex: 10, backdropFilter: 'blur(16px)' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--neon-cyan)', fontSize: '14px', letterSpacing: '1px' }}>LIVE DIAGNOSTICS</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Engine Load:</span> {diagnosticsData.engine_load}%</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Oil Life:</span> {diagnosticsData.oil_life_percent}%</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Cargo Hum:</span> {diagnosticsData.cargo_humidity_percent}%</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Batt Voltage:</span> {diagnosticsData.battery_voltage}V</div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px' }}><span style={{ color: 'var(--text-muted)' }}>Tire Pressures:</span> {diagnosticsData.tire_pressure_psi.join(', ')} PSI</div>
        </div>
      )}
    </aside>
  );
}
