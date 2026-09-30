import React, { useState, useEffect, useRef } from 'react';
import MapOfIndia3D from './components/MapOfIndia3D';
import SabreEnterprisePaaS from './components/SabreEnterprisePaaS';
import AiAgentNetworkChatbot from './components/AiAgentNetworkChatbot';
import PluginsCockpitView from './components/PluginsCockpitView';
import SabreTallyAccountingApp from './components/SabreTallyAccountingApp';
import TallyBooksStandaloneApp from './components/TallyBooksStandaloneApp';
import SaasAppLibraryModal from './components/SaasAppLibraryModal';
import UniversalCommandPalette from './components/UniversalCommandPalette';
import SabreLandingPage from './components/SabreLandingPage';
import IndianTransportLifecycleApp from './components/IndianTransportLifecycleApp';
import { Layers, Command, Search, Home, ExternalLink } from 'lucide-react';
import './index.css';

export default function App() {
  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const standaloneAppParam = urlParams.get('app');
  const initialViewParam = urlParams.get('view');

  // Main Views: 'home' (Landing Page) | 'map' | 'paas' | 'ai'
  // Defaults to 'home' when visited normally, or 'paas' if opened as console
  const [viewMode, setViewMode] = useState(
    initialViewParam || (standaloneAppParam === 'console' ? 'paas' : 'home')
  );
  const [fleetTelemetry, setFleetTelemetry] = useState([]);
  const [activeTruckId, setActiveTruckId] = useState(null);
  const [isAppLibraryOpen, setIsAppLibraryOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Clean, Non-Overlapping Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Must be combined with Ctrl (Windows/Linux) or Cmd (Mac)
      const modifier = e.ctrlKey || e.metaKey;
      
      // Ctrl+K: Universal Command Palette
      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // Ctrl+1: 3D Tactical Radar Map (Instant Viewport)
      if (modifier && e.key === '1') {
        e.preventDefault();
        setViewMode('map');
        return;
      }

      // Ctrl+2: Enterprise PaaS Cockpit (OMS, Fleet, Warehousing)
      if (modifier && e.key === '2') {
        e.preventDefault();
        setViewMode('paas');
        return;
      }

      // Ctrl+3: SABRE AI Multi-Agent Console
      if (modifier && e.key === '3') {
        e.preventDefault();
        setViewMode('ai');
        return;
      }

      // Ctrl+4: Indian Transport Lifecycle & Bilty Suite
      if (modifier && e.key === '4') {
        e.preventDefault();
        setViewMode('lifecycle');
        return;
      }

      // Escape: Close all active floating modals/palettes
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsAppLibraryOpen(false);
        setActiveTruckId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const wsRef = useRef(null);

  // Live WebSocket Fleet Stream (Production domain / SSL dynamic)
  useEffect(() => {
    if (wsRef.current) wsRef.current.close();
    const isHttps = window.location.protocol === 'https:';
    const wsProto = isHttps ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'localhost:8000' 
      : window.location.host;
    
    const wsUrl = `${wsProto}//${wsHost}/ws/v1/fleet-stream`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.fleet) {
          setFleetTelemetry(data.fleet);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // If this browser tab is running as a Standalone SaaS Application
  if (standaloneAppParam === 'tallybooks' || standaloneAppParam === 'tally') {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#042f1a', overflow: 'hidden' }}>
        <TallyBooksStandaloneApp onBackToHub={() => { window.location.href = '/'; }} />
      </div>
    );
  }

  // Standalone Indian Transport Lifecycle Suite
  if (standaloneAppParam === 'lifecycle' || standaloneAppParam === 'transport-lifecycle' || standaloneAppParam === 'bilty') {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#070f1e', overflow: 'hidden' }}>
        <IndianTransportLifecycleApp onBackToHub={() => { window.location.href = '/'; }} />
      </div>
    );
  }

  // Generic Standalone SaaS App handler for other ecosystem apps (excluding console)
  if (standaloneAppParam && standaloneAppParam !== 'console') {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        background: '#070e18',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          padding: '16px 24px',
          background: '#0c192c',
          borderBottom: '1px solid #1e3450',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {standaloneAppParam.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 900, textTransform: 'capitalize' }}>
                {standaloneAppParam.replace(/-/g, ' ')} SaaS App
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Standalone Enterprise Cloud Application &bull; Connected to Core Engine
              </div>
            </div>
          </div>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Back to Console
          </button>
        </div>
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            maxWidth: '650px',
            background: '#0d1b2e',
            border: '1px solid #1e3450',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px', textTransform: 'capitalize' }}>
              {standaloneAppParam.replace(/-/g, ' ')} Active Workspace
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
              This standalone SaaS tool runs independently with its own frontend, backend endpoints, and API tokens. It connects to the operations core via autonomous webhooks.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => alert(`API token for ${standaloneAppParam} is active and listening.`)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Inspect App State &amp; Webhooks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FIRST-LOAD DEFAULT VIEW: ULTRA-LUXURIOUS SABRE LANDING PAGE (APPLE/SAMSUNG AESTHETIC)
  if (viewMode === 'home') {
    return (
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#02040a',
        overflowX: 'hidden'
      }}>
        <SabreLandingPage 
          onLaunchConsole={() => window.open('/?app=console', '_blank')} 
        />
        
        {/* Universal Command Palette accessible globally via Ctrl+K */}
        <UniversalCommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigateTab={(tab) => {
            if (tab === 'home') {
              setViewMode('home');
            } else {
              window.open(`/?app=console&view=${tab}`, '_blank');
            }
          }}
          onSelectTruck={(trk) => setActiveTruckId(trk.id || trk.truck_id)}
          fleet={fleetTelemetry}
        />
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: '#fbf7f2',
      overflow: 'hidden',
      userSelect: 'none',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      
      {/* GLOBAL PROFESSIONAL HEADER - FROSTED MATTE SAPPHIRE GLASS */}
      <header style={{
        height: '52px',
        padding: '0 24px',
        background: 'rgba(30, 58, 95, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        boxShadow: '0 4px 24px -2px rgba(15, 23, 42, 0.28), 0 1px 0 0 rgba(255, 255, 255, 0.25) inset'
      }}>
        
        {/* Left: Brand Identity (Click to return to Home) */}
        <div 
          onClick={() => setViewMode('home')}
          title="Return to Home"
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: '20px',
              color: '#ffffff',
              letterSpacing: '0.06em',
              fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
              lineHeight: 1
            }}>
              SABRE
            </div>
          </div>
        </div>

        {/* Center: Frosted Matte Nav Dock */}
        <nav style={{
          display: 'flex',
          background: 'rgba(10, 25, 47, 0.45)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '3px',
          gap: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2) inset'
        }}>
          {/* 0. HOME */}
          <button
            onClick={() => setViewMode('home')}
            style={{
              background: 'transparent',
              color: '#cbd5e1',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Home size={13} color="#94a3b8" />
            <span>Home</span>
          </button>

          {/* 1. 3D MAP */}
          <button
            onClick={() => setViewMode('map')}
            style={{
              background: viewMode === 'map' ? '#2e7d32' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.15s ease'
            }}
          >
            <span>3D Map</span>
          </button>

          {/* 2. CONSOLE */}
          <button
            onClick={() => setViewMode('paas')}
            style={{
              background: viewMode === 'paas' ? '#2e7d32' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Console</span>
          </button>

          {/* 3. INTELLIGENCE */}
          <button
            onClick={() => setViewMode('ai')}
            style={{
              background: viewMode === 'ai' ? '#2e7d32' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Intelligence</span>
          </button>

          {/* 4. TRANSPORT LIFECYCLE */}
          <button
            onClick={() => setViewMode('lifecycle')}
            style={{
              background: viewMode === 'lifecycle' ? '#2e7d32' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Lifecycle Hub</span>
          </button>
        </nav>

        {/* Right side: Search Launcher without literal shortcut labels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 36, 61, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '7px',
              padding: '6px 14px',
              color: '#93c5fd',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.18), 0 1px 0 0 rgba(255,255,255,0.15) inset',
              transition: 'all 0.15s ease'
            }}
          >
            <Search size={13} color="#38bdf8" />
            <span>Search or command</span>
          </button>
        </div>

      </header>

      {/* MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* VIEW CONTAINER */}
        <main style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* PILLAR 1: 3D MAP */}
          {viewMode === 'map' && (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              <MapOfIndia3D 
                fleet={fleetTelemetry}
                activeTruckId={activeTruckId}
                onSelectTruck={(t) => setActiveTruckId(t.truck_id || t.id)}
              />
            </div>
          )}

          {/* PILLAR 2: ENTERPRISE PAAS */}
          {viewMode === 'paas' && (
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <SabreEnterprisePaaS onNavigateHome={() => setViewMode('map')} />
            </div>
          )}

          {/* PILLAR 3: SABRE AI */}
          {viewMode === 'ai' && (
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <AiAgentNetworkChatbot 
                isSidecar={false} 
                onOpenAppLibrary={() => setIsAppLibraryOpen(true)}
              />
            </div>
          )}

          {/* PILLAR 4: TRANSPORT LIFECYCLE HUB */}
          {viewMode === 'lifecycle' && (
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <IndianTransportLifecycleApp onBackToHub={() => setViewMode('home')} />
            </div>
          )}

        </main>

      </div>

      {/* CHATGPT-STYLE SAAS APPLICATION & PLUGIN LIBRARY MODAL */}
      <SaasAppLibraryModal
        isOpen={isAppLibraryOpen}
        onClose={() => setIsAppLibraryOpen(false)}
        onLaunchAppInNewTab={(appId) => {
          window.open(`/?app=${appId}`, '_blank');
        }}
      />

      {/* UNIVERSAL COMMAND PALETTE (CTRL+K) */}
      <UniversalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => setViewMode(tab)}
        onSelectTruck={(trk) => setActiveTruckId(trk.id || trk.truck_id)}
        fleet={fleetTelemetry}
      />

    </div>
  );
}
