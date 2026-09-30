import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownUp, Crosshair, Map as MapIcon, Layers, Navigation, Coffee, Fuel, BedDouble } from 'lucide-react';

function AutocompleteInput({ placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimeout = useRef(null);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        style={{ 
          width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', 
          fontSize: '14px', outline: 'none' 
        }}
      />
      {showDropdown && suggestions.length > 0 && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          background: 'var(--bg-surface-solid)', border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px', marginTop: '4px', zIndex: 1000, overflow: 'hidden', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.8)' 
        }}>
          {suggestions.map((s, i) => (
            <div 
              key={i} 
              onClick={() => {
                onSelect({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), name: s.display_name });
                setShowDropdown(false);
              }}
              style={{ 
                padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                color: '#fff', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapControls({ 
  activeLayer, 
  onSetLayer, 
  activePois, 
  onTogglePoi, 
  onAutoLocate,
  routingState,
  onClearRoute,
  onSearchOrigin,
  onSearchDestination,
  onOriginSelected,
  onDestinationSelected,
  onSwapRoute,
  onDispatchRoute
}) {
  
  const controls = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
      
      {/* Top Left Search/Routing Panel (Google Maps Clone UI) */}
      <div className="glass-card" style={{ 
        position: 'absolute', top: '16px', left: '60%', transform: 'translateX(-50%)', width: '480px', 
        background: 'var(--bg-surface-solid)', padding: '0', 
        pointerEvents: 'auto', overflow: 'visible', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ padding: '16px 16px 8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', marginRight: '8px' }}>
              <div style={{ width: '12px', height: '12px', border: '2px solid #a1a1aa', borderRadius: '50%', marginBottom: '4px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', margin: '2px 0 6px 0' }}>
                <div style={{ width: '2px', height: '2px', background: '#a1a1aa', borderRadius: '50%' }}></div>
                <div style={{ width: '2px', height: '2px', background: '#a1a1aa', borderRadius: '50%' }}></div>
                <div style={{ width: '2px', height: '2px', background: '#a1a1aa', borderRadius: '50%' }}></div>
              </div>
              <div style={{ width: '14px', height: '14px', background: 'var(--neon-red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></div>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AutocompleteInput 
                placeholder="Choose starting point..."
                value={routingState.startName || ''}
                onChange={onSearchOrigin}
                onSelect={onOriginSelected}
              />
              <AutocompleteInput 
                placeholder="Choose destination..."
                value={routingState.endName || ''}
                onChange={onSearchDestination}
                onSelect={onDestinationSelected}
              />
            </div>

            <button 
              onClick={onSwapRoute}
              style={{ width: '40px', height: '40px', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownUp size={18} />
            </button>
          </div>
        </div>

        {routingState.routeCoords ? (
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#fff' }}>Route Options</h3>
            <div style={{ color: 'var(--neon-amber)', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
              Moderate traffic in this area
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Commercial Heavy-Vehicle corridor selected. No known road disruptions. Traffic incidents will show up here.
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                onClick={onClearRoute}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' }}>
                Clear Route
              </button>
              <button 
                onClick={onDispatchRoute}
                style={{ flex: 2, padding: '10px', background: 'var(--neon-cyan)', border: 'none', color: '#000', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 10px var(--neon-cyan)' }}>
                DISPATCH FLEET
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'var(--text-muted)' }}>
            Search for locations or click directly on the map to set waypoints.
          </div>
        )}
      </div>

      {/* Top Right POI Toggles */}
      <div style={{ position: 'absolute', top: '80px', right: '24px', display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
        <button 
          onClick={() => onTogglePoi('fuel')}
          className={`btn-icon ${activePois.includes('fuel') ? 'active' : ''}`}
          style={{ padding: '8px 16px', borderRadius: '24px', background: 'var(--bg-surface-solid)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <Fuel size={16} /> Petrol Pumps
        </button>
        <button 
          onClick={() => onTogglePoi('food')}
          className={`btn-icon ${activePois.includes('food') ? 'active' : ''}`}
          style={{ padding: '8px 16px', borderRadius: '24px', background: 'var(--bg-surface-solid)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <Coffee size={16} /> Restaurants
        </button>
        <button 
          onClick={() => onTogglePoi('hotel')}
          className={`btn-icon ${activePois.includes('hotel') ? 'active' : ''}`}
          style={{ padding: '8px 16px', borderRadius: '24px', background: 'var(--bg-surface-solid)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <BedDouble size={16} /> Hotels
        </button>
      </div>

      {/* Bottom Right Map Layers & Geolocation */}
      <div style={{ position: 'absolute', bottom: '80px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'auto' }}>
        <button 
          onClick={onAutoLocate}
          style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-surface-solid)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          title="Show Your Location">
          <Crosshair size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-surface-solid)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => onSetLayer('standard')}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: activeLayer === 'standard' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', border: 'none', color: activeLayer === 'standard' ? 'var(--neon-cyan)' : '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            title="Standard Map">
            <MapIcon size={18} />
          </button>
          <button 
            onClick={() => onSetLayer('satellite')}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: activeLayer === 'satellite' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', border: 'none', color: activeLayer === 'satellite' ? 'var(--neon-cyan)' : '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            title="Satellite Map">
            <Layers size={18} />
          </button>
          <button 
            onClick={() => onSetLayer('traffic')}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: activeLayer === 'traffic' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', border: 'none', color: activeLayer === 'traffic' ? 'var(--neon-cyan)' : '#fff' }}
            title="Traffic Density">
            <Navigation size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(controls, document.body);
}
