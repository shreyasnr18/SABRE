import React, { useState, useEffect } from 'react';
import { Server, Settings, Activity, FileText, Play, Power, RefreshCw, X, Save, RotateCcw, ChevronRight, Globe } from 'lucide-react';

export default function ServiceConsoleModal({ serviceId, onClose, onServiceStatusChanged }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | config | networking | diagnostics | logs
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [decommissioning, setDecommissioning] = useState(false);
  const [probing, setProbing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [diagnosticOutput, setDiagnosticOutput] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/paas/cloud/services/${serviceId}`);
      if (!res.ok) throw new Error('Failed to load service detail');
      const data = await res.json();
      setService(data);
      setFormData(data.current_config || {});
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchDetail();
    }
  }, [serviceId]);

  const handleInputChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`/api/v1/paas/cloud/services/${serviceId}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: formData })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setMessage({ type: 'success', text: 'Resource configuration successfully updated and synced with cluster.' });
        setService(data.service);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save configuration.' });
      }
      setSaving(false);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
      setSaving(false);
    }
  };

  const provisionService = async () => {
    try {
      setProvisioning(true);
      setMessage(null);
      const res = await fetch(`/api/v1/paas/cloud/services/${serviceId}/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setMessage({ type: 'success', text: `Resource ${serviceId} successfully provisioned (ACTIVE state).` });
        setService(data.service);
        if (onServiceStatusChanged) onServiceStatusChanged();
      } else {
        setMessage({ type: 'error', text: data.message || 'Provisioning failed.' });
      }
      setProvisioning(false);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
      setProvisioning(false);
    }
  };

  const decommissionService = async () => {
    try {
      setDecommissioning(true);
      setMessage(null);
      const res = await fetch(`/api/v1/paas/cloud/services/${serviceId}/decommission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setMessage({ type: 'info', text: `Resource ${serviceId} decommissioned. State returned to STANDBY.` });
        setService(data.service);
        if (onServiceStatusChanged) onServiceStatusChanged();
      } else {
        setMessage({ type: 'error', text: data.message || 'Decommissioning failed.' });
      }
      setDecommissioning(false);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
      setDecommissioning(false);
    }
  };

  const executeDiagnosticProbe = async () => {
    try {
      setProbing(true);
      setDiagnosticOutput(null);
      const res = await fetch(`/api/v1/paas/cloud/services/${serviceId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LiveOperationalProbe', payload: { triggered_by: 'portal_blade_user' } })
      });
      const data = await res.json();
      setDiagnosticOutput(data);
      setProbing(false);
      fetchDetail();
    } catch (e) {
      setDiagnosticOutput({ error: e.message });
      setProbing(false);
    }
  };

  if (!serviceId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'flex-end',
      zIndex: 99999
    }}>
      {/* Sliding Azure Cloud Resource Blade */}
      <div className="portal-blade" style={{ width: '920px', maxWidth: '94vw' }}>
        
        {/* Blade Top Header with Breadcrumbs & Close */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #edebe9',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#605e5c', marginBottom: '4px' }}>
              <span>SABRE Cloud</span>
              <ChevronRight size={11} />
              <span>Microservices</span>
              <ChevronRight size={11} />
              <strong style={{ color: '#0078d4' }}>{service ? service.id : serviceId}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: '#eff6fc',
                color: '#0078d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Server size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#201f1e' }}>
                  {service ? service.name : 'Loading Service Details...'}
                </h3>
                <div style={{ fontSize: '11px', color: '#605e5c' }}>
                  {service ? service.category : 'Infrastructure Microservice'} | Subscription: <strong>National Highway Telematics</strong>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '3px',
              border: '1px solid #8a8886',
              background: '#ffffff',
              color: '#605e5c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Blade Action Toolbar (Azure Signature Toolbar: Save, Discard, Provision, Decommission, Probe) */}
        <div className="portal-blade-toolbar">
          <button 
            onClick={saveConfiguration} 
            disabled={saving}
            className="portal-blade-btn portal-blade-btn-primary"
          >
            <Save size={12} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button 
            onClick={() => { if (service) setFormData(service.current_config || {}); }}
            className="portal-blade-btn"
          >
            <RotateCcw size={12} />
            <span>Discard</span>
          </button>

          <div style={{ width: '1px', height: '16px', background: '#edebe9', margin: '0 4px' }} />

          {service && service.status !== 'ACTIVE' ? (
            <button 
              onClick={provisionService} 
              disabled={provisioning}
              className="portal-blade-btn"
              style={{ color: '#107c41', borderColor: '#a7f3d0' }}
            >
              <Play size={12} />
              <span>{provisioning ? 'Provisioning...' : 'Provision'}</span>
            </button>
          ) : (
            <button 
              onClick={decommissionService} 
              disabled={decommissioning}
              className="portal-blade-btn"
              style={{ color: '#a80000', borderColor: '#fca5a5' }}
            >
              <Power size={12} />
              <span>{decommissioning ? 'Processing...' : 'Decommission'}</span>
            </button>
          )}

          <button 
            onClick={executeDiagnosticProbe} 
            disabled={probing}
            className="portal-blade-btn"
          >
            <Activity size={12} />
            <span>{probing ? 'Probing...' : 'Diagnose Probe'}</span>
          </button>

          <button 
            onClick={fetchDetail}
            className="portal-blade-btn"
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Notification Alert Strip */}
        {message && (
          <div style={{
            padding: '8px 20px',
            fontSize: '12px',
            fontWeight: 600,
            background: message.type === 'success' ? '#edf7ed' : (message.type === 'error' ? '#fdf3f2' : '#eff6fc'),
            color: message.type === 'success' ? '#107c41' : (message.type === 'error' ? '#a80000' : '#0078d4'),
            borderBottom: '1px solid #edebe9'
          }}>
            {message.text}
          </div>
        )}

        {/* Blade Content Body: Left Tab Menu + Right Form Workspace */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left Blade Menu */}
          <div style={{
            width: '190px',
            minWidth: '190px',
            background: '#faf9f8',
            borderRight: '1px solid #edebe9',
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            {[
              { key: 'overview', label: 'Overview', icon: Server },
              { key: 'config', label: 'Configuration', icon: Settings },
              { key: 'networking', label: 'Networking & Routing', icon: Globe },
              { key: 'diagnostics', label: 'Diagnostic Probes', icon: Activity },
              { key: 'logs', label: 'Activity Log', icon: FileText }
            ].map(tab => {
              const isTabActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: isTabActive ? 600 : 400,
                    color: isTabActive ? '#0078d4' : '#323130',
                    background: isTabActive ? '#eff6fc' : 'transparent',
                    border: 'none',
                    borderLeft: isTabActive ? '3px solid #0078d4' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={14} color={isTabActive ? '#0078d4' : '#605e5c'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Blade Content Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#ffffff' }}>
            {loading || !service ? (
              <div style={{ color: '#605e5c', fontSize: '13px' }}>Loading resource metadata...</div>
            ) : (
              <>
                {/* 1. OVERVIEW */}
                {activeTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#faf9f8', borderRadius: '4px', border: '1px solid #edebe9', padding: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#605e5c', textTransform: 'uppercase' }}>
                        Resource Essentials
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '10px', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: '#605e5c' }}>Status</div>
                          <strong style={{ color: service.status === 'ACTIVE' ? '#107c41' : '#605e5c' }}>{service.status}</strong>
                        </div>
                        <div>
                          <div style={{ color: '#605e5c' }}>Location</div>
                          <strong style={{ color: '#201f1e' }}>ap-south-kar</strong>
                        </div>
                        <div>
                          <div style={{ color: '#605e5c' }}>Statutory SLA</div>
                          <strong style={{ color: '#107c41' }}>99.98% HA</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#201f1e' }}>
                        Operational Description
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#605e5c', lineHeight: '1.6' }}>
                        {service.description}
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #edebe9', padding: '12px', fontSize: '12px' }}>
                      <div style={{ color: '#605e5c', fontSize: '11px', fontWeight: 600 }}>Operational Metric</div>
                      <div style={{ fontFamily: 'monospace', color: '#0078d4', fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                        {service.operational_metric}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONFIGURATION */}
                {activeTab === 'config' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#605e5c' }}>
                      Configure dynamic parameters and thresholds for this cloud resource. Click "Save" in the top blade toolbar to apply changes.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {service.config_schema && Object.keys(service.config_schema).map(key => {
                        const schema = service.config_schema[key];
                        const val = formData[key] !== undefined ? formData[key] : (schema.default !== undefined ? schema.default : '');
                        return (
                          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#323130' }}>
                              {schema.label || key}:
                            </label>
                            {schema.type === 'select' ? (
                              <select
                                value={val}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                style={{ padding: '6px 10px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px', background: '#fff' }}
                              >
                                {schema.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input
                                type={schema.type === 'number' ? 'number' : 'text'}
                                value={val}
                                onChange={(e) => handleInputChange(key, schema.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                style={{ padding: '6px 10px', borderRadius: '3px', border: '1px solid #8a8886', fontSize: '12px' }}
                              />
                            )}
                            {schema.description && (
                              <span style={{ fontSize: '11px', color: '#8a8886' }}>{schema.description}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. NETWORKING */}
                {activeTab === 'networking' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                    <div style={{ background: '#faf9f8', padding: '14px', borderRadius: '4px', border: '1px solid #edebe9' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#605e5c', textTransform: 'uppercase' }}>Routing &amp; Ingress</span>
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>Virtual Corridor Network: <strong>vnet-western-ghats-corridor</strong></div>
                        <div>Assigned Subnet: <strong>snet-telematics-ingress (10.140.0.0/20)</strong></div>
                        <div>Ingress Gate: <strong>mTLS Strict Port 8000 / 443</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DIAGNOSTICS */}
                {activeTab === 'diagnostics' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#605e5c' }}>Execute live diagnostic probe against active microservice container.</span>
                      <button onClick={executeDiagnosticProbe} disabled={probing} className="portal-blade-btn portal-blade-btn-primary">
                        {probing ? 'Probing...' : 'Run Diagnostics'}
                      </button>
                    </div>

                    {diagnosticOutput && (
                      <pre style={{ background: '#0c1017', color: '#38bdf8', borderRadius: '4px', padding: '14px', fontFamily: 'monospace', fontSize: '11px', margin: 0, overflowX: 'auto' }}>
                        {JSON.stringify(diagnosticOutput, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {/* 5. LOGS */}
                {activeTab === 'logs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#605e5c' }}>Immutable append-only activity log for {service.id}:</div>
                    <div style={{ background: '#faf9f8', borderRadius: '4px', border: '1px solid #edebe9', padding: '10px', maxHeight: '340px', overflowY: 'auto', fontSize: '11px', fontFamily: 'monospace' }}>
                      {service.action_logs && service.action_logs.length > 0 ? (
                        service.action_logs.map((log, i) => (
                          <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #edebe9', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <strong style={{ color: '#0078d4' }}>[{log.action || log.event_name}]</strong> - {log.status || 'OK'}
                            </div>
                            <span style={{ color: '#8a8886' }}>{log.timestamp || new Date().toLocaleTimeString()}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#8a8886', padding: '20px 0', textAlign: 'center' }}>No execution events recorded.</div>
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
  );
}
