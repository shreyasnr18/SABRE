import React, { useState } from 'react';
import {
  Layers, Copy, Check, Compass, Globe, Box, Database, Cpu,
  Activity, ShieldCheck, MapPin, Truck, Calendar, Radio,
  Server, ShoppingCart, CreditCard, HeartPulse, RefreshCw
} from 'lucide-react';

/**
 * Universal architecture context parser that dynamically adapts to ANY prompt:
 * - Logistics / Freight (with or without specific routes, cargo weights, SLAs)
 * - E-Commerce & Retail (orders, catalog, checkout, payments)
 * - Fintech & Banking (ledger, transactions, fraud detection)
 * - IoT & Sensor Streaming (telematics, edge nodes, time-series)
 * - Healthcare & Patient Monitoring
 * - Cloud Infrastructure / PaaS / Microservices
 */
function parseArchitectureContext(text = '') {
  const t = (text || '').toLowerCase();

  // 1. Detect Domain
  let domain = 'Cloud PaaS Platform';
  let isLogistics = false;
  let isEcommerce = false;
  let isFintech = false;
  let isIoT = false;
  let isHealthcare = false;

  if (
    t.includes('logistics') || t.includes('freight') || t.includes('shipment') ||
    t.includes('transit') || t.includes('ghat') || t.includes('truck') ||
    t.includes('corridor') || t.includes('pune') || t.includes('bangalore') ||
    t.includes('bijapur') || t.includes('agra') || t.includes('hassan') || t.includes('mangaluru')
  ) {
    domain = 'Logistics & Autonomous Freight';
    isLogistics = true;
  } else if (
    t.includes('e-commerce') || t.includes('ecommerce') || t.includes('checkout') ||
    t.includes('cart') || t.includes('shopping') || t.includes('retail') || t.includes('order fulfillment')
  ) {
    domain = 'E-Commerce & Digital Commerce';
    isEcommerce = true;
  } else if (
    t.includes('fintech') || t.includes('bank') || t.includes('payment') ||
    t.includes('ledger') || t.includes('settlement') || t.includes('fraud') || t.includes('wallet')
  ) {
    domain = 'Fintech & Payment Settlement';
    isFintech = true;
  } else if (
    t.includes('iot') || t.includes('sensor') || t.includes('telematics') ||
    t.includes('mqtt') || t.includes('weather') || t.includes('edge device')
  ) {
    domain = 'IoT & Edge Sensor Streaming';
    isIoT = true;
  } else if (
    t.includes('health') || t.includes('hospital') || t.includes('patient') ||
    t.includes('medical') || t.includes('vitals')
  ) {
    domain = 'Healthcare & Patient Monitoring';
    isHealthcare = true;
  }

  // 2. Extract Route & Cities (if user provided any)
  let routeStr = '';
  const fromToMatch = t.match(/from\s+([a-z]+(?:\s+[a-z]+)?)\s+to\s+([a-z]+(?:\s+[a-z]+)?)/i);
  const toFromMatch = t.match(/to\s+([a-z]+(?:\s+[a-z]+)?).*?from\s+([a-z]+(?:\s+[a-z]+)?)/i);

  const cleanCity = (c) => {
    if (!c) return '';
    return c.replace(/\b(in|to|from|for|with|within|the|time|days?)\b/gi, '').trim();
  };

  if (fromToMatch) {
    const rawO = cleanCity(fromToMatch[1]);
    const rawD = cleanCity(fromToMatch[2]);
    if (rawO && rawD) {
      const o = rawO.charAt(0).toUpperCase() + rawO.slice(1);
      const d = rawD.charAt(0).toUpperCase() + rawD.slice(1);
      routeStr = `${o} → ${d}`;
    }
  } else if (toFromMatch) {
    const rawD = cleanCity(toFromMatch[1]);
    const rawO = cleanCity(toFromMatch[2]);
    if (rawO && rawD) {
      const o = rawO.charAt(0).toUpperCase() + rawO.slice(1);
      const d = rawD.charAt(0).toUpperCase() + rawD.slice(1);
      routeStr = `${o} → ${d}`;
    }
  } else if (t.includes('pune') && t.includes('bangalore')) {
    routeStr = 'Pune → Bangalore';
  } else if (t.includes('bijapur') && t.includes('agra')) {
    routeStr = 'Bijapur → Agra';
  } else if (t.includes('hassan') && t.includes('mangaluru')) {
    routeStr = 'Hassan → Mangaluru (NH-75)';
  }

  // 3. Extract Weight / Cargo (ONLY if mentioned by user, NO hardcoded fake 6 tonnes)
  let cargoStr = '';
  const weightMatch = t.match(/(\d+(?:\.\d+)?\s*(?:tonnes?|tons?|t|kg|kgs?)(?:\s+(?:of\s+)?[a-z]+(?:\s+[a-z]+){0,2})?)/i);
  if (weightMatch) {
    cargoStr = weightMatch[1].replace(/\b(from|to|in|for|time)\b.*$/i, '').trim();
  }

  // 4. Extract SLA (ONLY if mentioned by user)
  let slaStr = '';
  const slaMatch = t.match(/(\d+\s*(?:days?|hours?|hrs?|weeks?)(?:\s*time)?)/i);
  if (slaMatch) {
    slaStr = slaMatch[1].trim();
  }

  // 5. Build Blueprint Title
  let blueprintTitle = `${domain} Architecture Blueprint`;
  if (routeStr) {
    blueprintTitle += ` (${routeStr})`;
  }

  // 6. Build Tiers based on domain or custom services
  let tier1 = {
    title: 'Client & Ingress Layer',
    subtitle: 'Cross-platform dispatcher web app, driver mobile console, and field telematics SDK',
    badge: 'CLIENT TIER'
  };

  let tier2 = {
    title: 'API Gateway & Routing Controller',
    subtitle: 'L7 reverse proxy, TLS 1.3 termination, rate limiting, and dynamic service router',
    badge: 'GATEWAY TIER'
  };

  let tier3Services = [];

  let tier4 = {
    title: 'Data & Persistence Layer',
    subtitle: 'Distributed database cluster, real-time cache, and tamper-evident event log lake',
    badge: 'PERSISTENCE TIER'
  };

  // Domain-specific configuration
  if (isLogistics) {
    tier1 = {
      title: routeStr ? `${routeStr} Dispatch & Ingress Portals` : 'Fleet Dispatch Portals & Driver Terminals',
      subtitle: cargoStr 
        ? `Driver in-cab app (${cargoStr} manifest), dispatcher web dashboard, weighbridge sensors`
        : 'Driver in-cab app, dispatcher web dashboard, GPS tracking client',
      badge: 'CLIENT TIER'
    };

    tier2 = {
      title: 'Logistics API Gateway & Corridor Router',
      subtitle: 'Corridor waypoint ingress, secure driver authentication, and telematics load balancing',
      badge: 'GATEWAY TIER'
    };

    tier3Services = [
      {
        code: 'COMP-01',
        name: 'Consignment Allocation',
        desc: cargoStr ? `Allocates vehicle capacity for ${cargoStr}` : 'Dynamic cargo batching & vehicle capacity sizing',
        status: 'Active'
      },
      {
        code: 'NET-09',
        name: 'Route Optimization Engine',
        desc: routeStr ? `Corridor waypoint planning (${routeStr})` : 'Dynamic transit pathing with automatic traffic failover',
        status: 'Active'
      },
      {
        code: 'COMP-03',
        name: 'Fleet Capacity & Dispatch',
        desc: slaStr ? `Monitors arrival SLA window (${slaStr})` : 'Dispatches active vehicles and tracks transit deadlines',
        status: 'Active'
      },
      {
        code: 'IOT-35',
        name: 'Live Telematics & Radar',
        desc: '50Hz GPS location, speed radar, and highway compliance checks',
        status: 'Active'
      }
    ];

    tier4 = {
      title: 'Shared Logistics Data Lake & Trip Vault',
      subtitle: 'PostgreSQL trip ledger, Redis geolocation cache, and immutable black-box crash logs (STOR-17)',
      badge: 'PERSISTENCE TIER'
    };

  } else if (isEcommerce) {
    tier1 = {
      title: 'Customer Storefront & Merchant Portals',
      subtitle: 'Responsive Web Storefront, iOS/Android Shopping Apps, and Merchant Management Console',
      badge: 'CLIENT TIER'
    };

    tier2 = {
      title: 'Cloud Edge Gateway & Traffic Controller',
      subtitle: 'Global CDN edge caching, JWT auth verification, and WAF security filtering',
      badge: 'GATEWAY TIER'
    };

    tier3Services = [
      {
        code: 'CAT-01',
        name: 'Product Catalog Service',
        desc: 'Manages searchable inventory, pricing tables, and category hierarchies',
        status: 'Active'
      },
      {
        code: 'ORD-02',
        name: 'Cart & Order Orchestrator',
        desc: 'Handles shopping carts, checkout state transitions, and order commits',
        status: 'Active'
      },
      {
        code: 'PAY-03',
        name: 'Payment Processing Gateway',
        desc: 'Secure tokenized credit card, UPI, and netbanking transaction gateway',
        status: 'Active'
      },
      {
        code: 'NOTIF-04',
        name: 'Fulfillment & Alerts',
        desc: 'Dispatches warehouse packaging tickets, SMS alerts, and delivery tracking',
        status: 'Active'
      }
    ];

    tier4 = {
      title: 'E-Commerce Data & Event Fabric',
      subtitle: 'PostgreSQL order database, Redis session cache, and Apache Kafka checkout event bus',
      badge: 'PERSISTENCE TIER'
    };

  } else if (isFintech) {
    tier1 = {
      title: 'Digital Banking Apps & Merchant POS Terminals',
      subtitle: 'End-user mobile banking app, merchant checkout SDK, and compliance dashboard',
      badge: 'CLIENT TIER'
    };

    tier2 = {
      title: 'Zero-Trust Security API Gateway',
      subtitle: 'Mutual TLS (mTLS) termination, hardware token validation, and anti-DDoS scrubbing',
      badge: 'GATEWAY TIER'
    };

    tier3Services = [
      {
        code: 'AUTH-01',
        name: 'Identity & Access Manager',
        desc: 'Multi-factor authentication, biometric verification, and session grants',
        status: 'Active'
      },
      {
        code: 'LEDGER-02',
        name: 'Double-Entry Core Ledger',
        desc: 'Immutable ACID journal entries for debits, credits, and account balances',
        status: 'Active'
      },
      {
        code: 'FRAUD-03',
        name: 'Real-Time Fraud Detection',
        desc: 'Machine-learning transaction scoring and anomalous velocity alerts',
        status: 'Active'
      },
      {
        code: 'SETTLE-04',
        name: 'Interbank Settlement Engine',
        desc: 'Clearinghouse reconciliation, automated ACH/wire dispatch, and receipt gen',
        status: 'Active'
      }
    ];

    tier4 = {
      title: 'Cryptographic Banking Vault & Audit Lake',
      subtitle: 'Partitioned CockroachDB ledger, Redis rate cache, and tamper-evident WORM audit vault',
      badge: 'PERSISTENCE TIER'
    };

  } else if (isIoT) {
    tier1 = {
      title: 'Field Sensor Grid & Edge Telemetry Nodes',
      subtitle: 'IoT microcontroller clusters, CAN-bus vehicle sensors, and industrial telemetry beacons',
      badge: 'CLIENT TIER'
    };

    tier2 = {
      title: 'High-Throughput MQTT / WebSocket Ingress Gateway',
      subtitle: 'Handles 100k+ concurrent telemetry streams with payload decryption and protocol parsing',
      badge: 'GATEWAY TIER'
    };

    tier3Services = [
      {
        code: 'INGEST-01',
        name: 'Telemetry Stream Ingestion',
        desc: 'Buffers 50Hz raw sensor signals with timestamp normalization',
        status: 'Active'
      },
      {
        code: 'ANOMALY-02',
        name: 'Threshold & Overrun Monitor',
        desc: 'Real-time alert evaluation for temperature, pressure, vibration, and battery',
        status: 'Active'
      },
      {
        code: 'DISPATCH-03',
        name: 'Edge Command Dispatcher',
        desc: 'Pushes OTA firmware configurations and emergency actuation signals to devices',
        status: 'Active'
      },
      {
        code: 'GEO-04',
        name: 'Spatial Geofence Engine',
        desc: 'Calculates perimeter entries, dwell time, and speed corridor violations',
        status: 'Active'
      }
    ];

    tier4 = {
      title: 'Time-Series Sensor Lake & Analytics Store',
      subtitle: 'TimescaleDB / InfluxDB for time-series metrics, Redis for hot cache, Parquet cold archive',
      badge: 'PERSISTENCE TIER'
    };

  } else if (isHealthcare) {
    tier1 = {
      title: 'Clinician Dashboard & Wearable Patient Monitors',
      subtitle: 'Bedside vital signs monitors, patient mobile health app, and doctor EHR portal',
      badge: 'CLIENT TIER'
    };

    tier2 = {
      title: 'HIPAA-Compliant Encrypted Medical Gateway',
      subtitle: 'Role-based clinician access control, audit logging, and HL7/FHIR payload validation',
      badge: 'GATEWAY TIER'
    };

    tier3Services = [
      {
        code: 'VITALS-01',
        name: 'Vital Signs Processing',
        desc: 'Continuous real-time stream ingestion of heart rate, SpO2, and ECG feeds',
        status: 'Active'
      },
      {
        code: 'TRIAGE-02',
        name: 'Early Warning Triage AI',
        desc: 'Automated predictive score calculation for patient deterioration alerts',
        status: 'Active'
      },
      {
        code: 'EHR-03',
        name: 'Electronic Health Records Sync',
        desc: 'FHIR API adapter mapping patient vitals to hospital database records',
        status: 'Active'
      },
      {
        code: 'ALERT-04',
        name: 'Emergency Pager Dispatch',
        desc: 'Immediate code-blue audio alerts and on-duty doctor mobile push notifications',
        status: 'Active'
      }
    ];

    tier4 = {
      title: 'Encrypted Medical Data Lake & Audit Vault',
      subtitle: 'HIPAA-compliant encrypted PostgreSQL DB, encrypted audit log, and imaging PACS archive',
      badge: 'PERSISTENCE TIER'
    };

  } else {
    // General PaaS / Microservices Platform
    tier3Services = [
      {
        code: 'COMP-01',
        name: 'Compute Node Provisioner',
        desc: 'Elastic vehicle node runtime management with cgroups v2 resource isolation',
        status: 'Active'
      },
      {
        code: 'NET-09',
        name: 'Dynamic Traffic Router',
        desc: 'Corridor routing, intelligent failover logic, and automated load rebalancing',
        status: 'Active'
      },
      {
        code: 'STREAM-29',
        name: 'Real-Time Telemetry Pipeline',
        desc: 'High-throughput event streaming and live cluster health metric collection',
        status: 'Active'
      },
      {
        code: 'SEC-45',
        name: 'Governance & Audit Logger',
        desc: 'Cryptographic SHA-256 dispatch signing and regulatory compliance reporting',
        status: 'Active'
      }
    ];
  }

  // 7. Check if LLM explicitly enumerated custom services in text (e.g. COMP-01, NET-09, or numbered items)
  // and dynamically update tier3Services if found
  const customServiceMatches = text.match(/([A-Z]+-\d{2}):?\s+([A-Za-z\s&]+?)(?:[-–—:]\s*([^\n\r.]+))?/g);
  if (customServiceMatches && customServiceMatches.length >= 2) {
    const parsedCustom = [];
    for (const match of customServiceMatches.slice(0, 4)) {
      const parts = match.match(/([A-Z]+-\d{2}):?\s+([A-Za-z\s&]+?)(?:[-–—:]\s*([^\n\r.]+))?$/);
      if (parts) {
        parsedCustom.push({
          code: parts[1].trim(),
          name: parts[2].trim(),
          desc: parts[3] ? parts[3].trim() : 'Active orchestration microservice',
          status: 'Active'
        });
      }
    }
    if (parsedCustom.length >= 2) {
      tier3Services = parsedCustom;
    }
  }

  return {
    domain,
    blueprintTitle,
    routeStr,
    cargoStr,
    slaStr,
    tier1,
    tier2,
    tier3Services,
    tier4
  };
}

export default function SabreVisualArchitectureDiagram({ rawCode = '' }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'spec'

  const arch = parseArchitectureContext(rawCode);

  const handleCopy = () => {
    const spec = `SABRE ARCHITECTURE BLUEPRINT: ${arch.blueprintTitle}
Domain: ${arch.domain}
${arch.routeStr ? `Route: ${arch.routeStr}\n` : ''}${arch.cargoStr ? `Cargo: ${arch.cargoStr}\n` : ''}${arch.slaStr ? `SLA: ${arch.slaStr}\n` : ''}
TIER 1 (Client & Access Layer):
  - ${arch.tier1.title}: ${arch.tier1.subtitle}

TIER 2 (API Gateway & Ingress Layer):
  - ${arch.tier2.title}: ${arch.tier2.subtitle}

TIER 3 (Core Application Microservices):
${arch.tier3Services.map(s => `  - [${s.code}] ${s.name}: ${s.desc}`).join('\n')}

TIER 4 (Data & Persistence Layer):
  - ${arch.tier4.title}: ${arch.tier4.subtitle}
`;

    navigator.clipboard.writeText(spec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: '20px 0',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1.5px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 1. BLUEPRINT HEADER BAR (Clean, Professional, Homegrown) */}
      <div style={{
        padding: '12px 18px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                {arch.blueprintTitle}
              </span>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              }}>
                {arch.domain}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'visual' ? 'spec' : 'visual')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155',
              padding: '5px 11px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {viewMode === 'visual' ? 'View Text Spec' : 'View Blueprint'}
          </button>

          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#059669' : '#0284c7',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* 2. DIAGRAM CANVAS */}
      {viewMode === 'spec' ? (
        <pre style={{
          margin: 0,
          padding: '20px',
          background: '#0f172a',
          color: '#f8fafc',
          fontSize: '12px',
          lineHeight: '1.65',
          overflowX: 'auto',
          fontFamily: 'Consolas, monospace'
        }}>
          <code>{rawCode || 'Dynamic architecture specification generated.'}</code>
        </pre>
      ) : (
        <div style={{
          padding: '28px 20px',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px'
        }}>

          {/* ========================================================================= */}
          {/* TIER 1: CLIENT & INGRESS LAYER                                            */}
          {/* ========================================================================= */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: '10px',
            padding: '14px 24px',
            width: '100%',
            maxWidth: '680px',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              {arch.tier1.badge}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {arch.tier1.title}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              {arch.tier1.subtitle}
            </div>
          </div>

          {/* Clean Downward Arrow 1 */}
          <div style={{ height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="26" viewBox="0 0 20 26">
              <line x1="10" y1="0" x2="10" y2="18" stroke="#0284c7" strokeWidth="2" />
              <polygon points="6,16 10,24 14,16" fill="#0284c7" />
            </svg>
          </div>

          {/* ========================================================================= */}
          {/* TIER 2: API GATEWAY & ROUTE CONTROLLER                                    */}
          {/* ========================================================================= */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #0369a1',
            borderRadius: '10px',
            padding: '14px 24px',
            width: '100%',
            maxWidth: '680px',
            boxShadow: '0 2px 10px rgba(3, 105, 161, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#0369a1',
              background: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              {arch.tier2.badge}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {arch.tier2.title}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              {arch.tier2.subtitle}
            </div>
          </div>

          {/* Clean Downward Arrow 2 */}
          <div style={{ height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="26" viewBox="0 0 20 26">
              <line x1="10" y1="0" x2="10" y2="18" stroke="#0369a1" strokeWidth="2" />
              <polygon points="6,16 10,24 14,16" fill="#0369a1" />
            </svg>
          </div>

          {/* ========================================================================= */}
          {/* TIER 3: CORE APPLICATION MICROSERVICES MATRIX                             */}
          {/* ========================================================================= */}
          <div style={{
            width: '100%',
            maxWidth: '880px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#065f46', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  TIER 3 • CORE APPLICATION MICROSERVICES
                </span>
              </div>
              <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {arch.tier3Services.length} Microservices Active
              </span>
            </div>

            {/* Microservice Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
              gap: '12px'
            }}>
              {arch.tier3Services.map((svc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: '#0284c7',
                        background: '#e0f2fe',
                        padding: '1px 6px',
                        borderRadius: '3px'
                      }}>
                        {svc.code}
                      </span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#16a34a'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }} />
                        {svc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {svc.name}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                      {svc.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Downward Arrow 3 */}
          <div style={{ height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="26" viewBox="0 0 20 26">
              <line x1="10" y1="0" x2="10" y2="18" stroke="#059669" strokeWidth="2" />
              <polygon points="6,16 10,24 14,16" fill="#059669" />
            </svg>
          </div>

          {/* ========================================================================= */}
          {/* TIER 4: DATA & PERSISTENCE LAYER                                          */}
          {/* ========================================================================= */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #059669',
            borderRadius: '10px',
            padding: '14px 24px',
            width: '100%',
            maxWidth: '680px',
            boxShadow: '0 2px 10px rgba(5, 150, 105, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#059669',
              background: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              {arch.tier4.badge}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {arch.tier4.title}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              {arch.tier4.subtitle}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
