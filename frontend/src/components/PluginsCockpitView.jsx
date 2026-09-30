import React, { useState, useEffect } from 'react';
import { 
  Cpu, ShieldCheck, Play, CheckCircle, AlertTriangle, 
  Terminal, RefreshCw, Layers, Zap, Clock, ChevronRight
} from 'lucide-react';

export default function PluginsCockpitView() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [cppBenchmark, setCppBenchmark] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPlugins();
    fetchBenchmark();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/plugins');
      const data = await res.json();
      setPlugins(data.plugins || []);
      if (data.plugins && data.plugins.length > 0) {
        setSelectedPlugin(data.plugins[0]);
      }
    } catch (err) {
      console.error('Error fetching plugins:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBenchmark = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/cpp/benchmark');
      const data = await res.json();
      setCppBenchmark(data);
    } catch (err) {
      console.error('Error fetching benchmark:', err);
    }
  };

  const runPlugin = async (pluginId) => {
    try {
      setExecuting(true);
      setExecutionResult(null);
      const res = await fetch('http://localhost:8000/api/v1/plugins/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plugin_id: pluginId,
          payload: { trigger: 'MANUAL_TEST_CONSOLE', timestamp: new Date().toISOString() },
          token: 'SABRE-SEC-TENANT-001-ADMIN-SYS'
        })
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({ status: 'ERROR', message: String(err) });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      background: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR: List of all 17 Plugins */}
      <div style={{
        width: '380px',
        borderRight: '1.5px solid #000000',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#1e3a5f',
          color: '#ffffff',
          borderBottom: '1.5px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.04em' }}>
              17 FREIGHT PLUGINS
            </div>
            <div style={{ fontSize: '11px', color: '#86efac', marginTop: '2px' }}>
              C++ Native Engines &bull; Java 17 Shield Guarded
            </div>
          </div>
          <button 
            onClick={() => { fetchPlugins(); fetchBenchmark(); }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer'
            }}
            title="Refresh plugins"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* C++ Benchmark Banner */}
        {cppBenchmark && (
          <div style={{
            background: '#edf7ee',
            borderBottom: '1px solid #000000',
            padding: '10px 16px',
            fontSize: '11.5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontWeight: 800, color: '#166534' }}>C++ CORE: </span>
              <span style={{ color: '#15803d' }}>{cppBenchmark.speedup_vs_python}</span>
            </div>
            <div style={{
              background: '#2e7d32',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 800
            }}>
              {cppBenchmark.average_latency_microseconds} &mu;s latency
            </div>
          </div>
        )}

        {/* Plugin List Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {plugins.map((p, idx) => {
            const isSelected = selectedPlugin?.plugin_id === p.plugin_id;
            return (
              <div
                key={p.plugin_id}
                onClick={() => {
                  setSelectedPlugin(p);
                  setExecutionResult(null);
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  background: isSelected ? '#edf7ee' : '#ffffff',
                  cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid #2e7d32' : '4px solid transparent',
                  transition: 'all 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                    {idx + 1}. {p.name}
                  </div>
                  <ChevronRight size={14} color={isSelected ? '#2e7d32' : '#94a3b8'} />
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: 1.3 }}>
                  {p.description}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '0.5px solid #bae6fd'
                  }}>
                    C++ Native
                  </span>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '0.5px solid #fde68a'
                  }}>
                    Java RBAC: {p.required_scope}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN VIEW: Interactive Test Bench for Selected Plugin */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {selectedPlugin ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '28px' }}>
            
            {/* Header info */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '20px 24px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    STANDALONE ENGINE &bull; {selectedPlugin.plugin_id}
                  </div>
                  <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px 0' }}>
                    {selectedPlugin.name}
                  </h1>
                  <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, maxWidth: '750px' }}>
                    {selectedPlugin.description}
                  </p>
                </div>

                <button
                  onClick={() => runPlugin(selectedPlugin.plugin_id)}
                  disabled={executing}
                  style={{
                    background: executing ? '#94a3b8' : '#2e7d32',
                    color: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: executing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 3px 8px rgba(46, 125, 50, 0.3)'
                  }}
                >
                  <Play size={16} />
                  <span>{executing ? 'Executing C++ Engine...' : 'Run Single Plugin'}</span>
                </button>
              </div>

              {/* Status Chips */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>
                  <Cpu size={15} color="#2563eb" />
                  <span>Core: C++17 MinGW-W64 GCC -O3 Native Binary</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>
                  <ShieldCheck size={15} color="#16a34a" />
                  <span>Protection: Java 17 Zero-Trust Shield (HMAC-SHA256)</span>
                </div>
              </div>
            </div>

            {/* Execution Result Terminal */}
            <div style={{
              flex: 1,
              background: '#0f172a',
              color: '#f8fafc',
              border: '2px solid #000000',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: '320px'
            }}>
              <div style={{
                background: '#1e293b',
                padding: '10px 16px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                <Terminal size={14} color="#38bdf8" />
                <span>NATIVE EXECUTION TELEMETRY &amp; AUDIT LEDGER</span>
              </div>

              <div style={{ padding: '20px', flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 }}>
                {executionResult ? (
                  <div>
                    <div style={{ color: '#4ade80', fontWeight: 800, marginBottom: '12px' }}>
                      [SUCCESS] Execution completed in {executionResult.execution_time_ms} ms
                    </div>
                    <pre style={{ margin: 0, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                ) : executing ? (
                  <div style={{ color: '#38bdf8' }}>
                    &gt; Executing compiled C++17 binary &amp; verifying HMAC with Java Security Shield...
                  </div>
                ) : (
                  <div style={{ color: '#64748b' }}>
                    Click <strong>"Run Single Plugin"</strong> to execute this module individually through the C++ core and inspect its cryptographic Java security audit log in real time.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ padding: '40px', color: '#64748b' }}>Select a plugin from the sidebar to inspect and test.</div>
        )}
      </div>
    </div>
  );
}
