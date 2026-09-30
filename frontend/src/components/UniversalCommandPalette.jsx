import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Truck, ShieldAlert, Cpu, ArrowRight, Zap, 
  Layers, MapPin, Gauge, Activity, Compass, Settings, Command
} from 'lucide-react';

export default function UniversalCommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectTruck,
  fleet = []
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Static action commands
  const defaultActions = [
    {
      id: 'nav-map',
      title: 'Navigate to 3D Tactical Radar Map',
      category: 'Navigation',
      icon: Layers,
      action: () => { onNavigateTab('map'); onClose(); }
    },
    {
      id: 'nav-paas',
      title: 'Open Enterprise PaaS Infrastructure Cockpit',
      category: 'Infrastructure',
      icon: Cpu,
      action: () => { onNavigateTab('paas'); onClose(); }
    },
    {
      id: 'nav-ai',
      title: 'Launch Autonomous Operations Assistant',
      category: 'Assistant',
      icon: Zap,
      action: () => { onNavigateTab('ai'); onClose(); }
    },
    {
      id: 'nav-lifecycle',
      title: 'Open Indian Transport Operational & Financial Lifecycle (ULIP, 4-Copy Bilty, TReDS)',
      category: 'Operational Workflow',
      icon: Truck,
      action: () => { onNavigateTab('lifecycle'); onClose(); }
    },
    {
      id: 'action-shiradi',
      title: 'Monitor NH-75 Shiradi Ghat Thermal Corridor',
      category: 'Safety Corridor',
      icon: ShieldAlert,
      action: () => { onNavigateTab('map'); onClose(); }
    },
    {
      id: 'action-fastag',
      title: 'Inspect FASTag Axle Weight & Toll Optimization',
      category: 'Billing',
      icon: Gauge,
      action: () => { onNavigateTab('paas'); onClose(); }
    }
  ];

  // Dynamic truck commands
  const truckActions = fleet.map(t => ({
    id: `truck-${t.id || t.truck_id}`,
    title: `Track Vehicle: ${t.id || t.truck_id} (${t.label || 'Tractor-Trailer'}) - Speed ${t.speed || t.speed_kmh || 0} km/h`,
    category: 'Live Fleet',
    icon: Truck,
    action: () => {
      onSelectTruck?.(t);
      onNavigateTab('map');
      onClose();
    }
  }));

  const allActions = [...defaultActions, ...truckActions];

  const filtered = query.trim() === ''
    ? allActions.slice(0, 8)
    : allActions.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '92%',
          maxWidth: '620px',
          background: '#0d1829',
          border: '1.5px solid #1e3a5f',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid #1e2d42',
          background: '#111f33'
        }}>
          <Search size={20} color="#38bdf8" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, truck ID, or shortcut (e.g., 'KA-04', '3D Map', 'PaaS')..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: 500,
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <span style={{
            fontSize: '11px',
            color: '#64748b',
            background: '#0a1424',
            border: '1px solid #1e293b',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 700
          }}>
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div style={{
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No actions found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected ? '#1e3a5f' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: isSelected ? '#2563eb' : '#132338',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#ffffff' : '#38bdf8'
                    }}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: isSelected ? '#ffffff' : '#e2e8f0'
                      }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight size={16} color="#38bdf8" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
