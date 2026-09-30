import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function MapOfIndia3D({ fleet = [], activeTruckId, onSelectTruck }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'topo' | 'dark'
  const [selectedTruck, setSelectedTruck] = useState(null);

  // Basemap style definitions
  const getMaplibreStyle = (styleType) => {
    if (styleType === 'topo') {
      return {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 19 }]
      };
    }
    if (styleType === 'dark') {
      return {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution: '© CARTO'
          }
        },
        layers: [{ id: 'dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 19 }]
      };
    }
    // High-resolution Satellite Imagery
    return {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Esri Satellite'
        }
      },
      layers: [{ id: 'satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 19 }]
    };
  };

  // Initialize completely unrestricted, pan-India / global 3D Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMaplibreStyle('satellite'),
      center: [78.9629, 21.5937], // Centered across the entire Indian subcontinent
      zoom: 4.8,
      pitch: 35,
      bearing: 0,
      maxPitch: 85,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }), 'bottom-right');
    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Sync selected truck when activeTruckId changes from outside
  useEffect(() => {
    if (activeTruckId && fleet) {
      const match = fleet.find(t => (t.id === activeTruckId || t.truck_id === activeTruckId));
      if (match) setSelectedTruck(match);
    }
  }, [activeTruckId, fleet]);

  // Render minimal, clean interactive vehicle markers with zero clutter
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (fleet && fleet.length > 0) {
      fleet.forEach(trk => {
        const isSelected = (trk.id === activeTruckId || trk.truck_id === activeTruckId);
        const coords = trk.coords || (trk.lon && trk.lat ? [trk.lon, trk.lat] : [77.5946, 12.9716]);

        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.style.userSelect = 'none';
        el.innerHTML = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '28px' : '22px'};
            height: ${isSelected ? '28px' : '22px'};
            border-radius: 50%;
            background: ${isSelected ? '#2e7d32' : '#1e3a5f'};
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.45);
            transition: transform 0.2s ease;
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #ffffff;
            "></div>
          </div>
        `;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.25)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        el.addEventListener('click', () => {
          setSelectedTruck(trk);
          onSelectTruck?.(trk);
          map.flyTo({ center: coords, zoom: 12, pitch: 50, speed: 1.2 });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [fleet, activeTruckId]);

  const handleSwitchStyle = (styleKey) => {
    setMapStyle(styleKey);
    if (mapRef.current) {
      mapRef.current.setStyle(getMaplibreStyle(styleKey));
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [78.9629, 21.5937],
        zoom: 4.8,
        pitch: 35,
        bearing: 0,
        speed: 1.2
      });
      setSelectedTruck(null);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#090d16', userSelect: 'none' }}>
      
      {/* Spacious, Elegant Control Dock (Top Right) */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 18,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Style Selector */}
        <div style={{
          display: 'flex',
          background: '#ffffff',
          border: '1.5px solid #000000',
          borderRadius: '8px',
          padding: '3px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
        }}>
          {[
            { id: 'satellite', label: 'Satellite' },
            { id: 'topo', label: 'Vector Topo' },
            { id: 'dark', label: 'Dark Canvas' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSwitchStyle(opt.id)}
              style={{
                padding: '6px 14px',
                background: mapStyle === opt.id ? '#1e3a5f' : 'transparent',
                color: mapStyle === opt.id ? '#ffffff' : '#1e3a5f',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Pan-India Full Extent Reset */}
        <button
          onClick={handleResetView}
          title="Reset to Pan-India Overview"
          style={{
            background: '#ffffff',
            border: '1.5px solid #000000',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#1e3a5f',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
          }}
        >
          <Compass size={14} color="#2e7d32" />
          <span>India Overview</span>
        </button>
      </div>

      {/* Selected Vehicle Info Card (Minimalist, Non-Intrusive, Bottom-Left) */}
      {selectedTruck && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 20,
          background: '#ffffff',
          border: '1.5px solid #000000',
          borderRadius: '10px',
          padding: '14px 18px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
          minWidth: '260px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a5f' }}>
              {selectedTruck.id || selectedTruck.truck_id}
            </span>
            <button
              onClick={() => setSelectedTruck(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: '#475569' }}>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 700 }}>Speed</span>
              <strong style={{ color: '#0f172a' }}>{selectedTruck.speed_kmh || selectedTruck.speed || 0} km/h</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
              <strong style={{ color: '#2e7d32' }}>{selectedTruck.status || 'Active Transit'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Unrestricted, High-Performance 3D Map Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

    </div>
  );
}
