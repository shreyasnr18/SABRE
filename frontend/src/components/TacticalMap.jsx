import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import MapControls from './MapControls';

const DEFAULT_CENTER = [20.5937, 78.9629]; // India Center



const createHubIcon = () => {
  return L.divIcon({
    html: `<div style="background:#0f172a; border:2px solid #3b82f6; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>
           </div>`,
    className: 'hub-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createCompanyHubIcon = (color) => {
  return L.divIcon({
    html: `<div style="background:#0f172a; border:2px solid ${color}; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 10px ${color}80;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>
           </div>`,
    className: 'hub-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const startIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="width: 16px; height: 16px; background: #fff; border: 4px solid var(--neon-cyan); border-radius: 50%; box-shadow: 0 0 10px var(--neon-cyan);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const endIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="width: 16px; height: 16px; background: #fff; border: 4px solid var(--neon-red); border-radius: 50%; box-shadow: 0 0 10px var(--neon-red);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const poiIcon = (type) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background: rgba(0,0,0,0.8); border: 1px solid var(--neon-amber); color: var(--neon-amber); padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap;">${type}</div>`,
  iconAnchor: [15, 10]
});

// Helper component to bind events and auto-locate
function MapOrchestrator({ setRoutingState, routingState, doLocate, setDoLocate, fetchReverseGeocode }) {
  const map = useMap();
  
  useEffect(() => {
    if (doLocate) {
      map.locate().on("locationfound", function (e) {
        map.flyTo(e.latlng, 15);
        setDoLocate(false);
      }).on("locationerror", function (e) {
        console.error("Location error:", e);
        setDoLocate(false);
      });
    }
  }, [doLocate, map]);

  useMapEvents({
    click(e) {
      if (!routingState.start) {
        setRoutingState(prev => ({ ...prev, start: e.latlng }));
        fetchReverseGeocode(e.latlng.lat, e.latlng.lng, 'start');
      } else if (!routingState.end) {
        setRoutingState(prev => ({ ...prev, end: e.latlng }));
        fetchReverseGeocode(e.latlng.lat, e.latlng.lng, 'end');
      }
    }
  });

  // Pan to route when it changes
  useEffect(() => {
    if (routingState.routeCoords && routingState.routeCoords.length > 0) {
      const bounds = L.latLngBounds(routingState.routeCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routingState.routeCoords, map]);

  return null;
}

export default function TacticalMap({ fleetTelemetry, activeTruckId, envData, agenticRoute, onDispatchRoute }) {
  const [activeLayer, setActiveLayer] = useState('standard');
  const [activePois, setActivePois] = useState([]);
  const [poiData, setPoiData] = useState([]);
  const [doLocate, setDoLocate] = useState(false);
  
  const [routingState, setRoutingState] = useState({
    start: null,
    end: null,
    startName: '',
    endName: '',
    routeCoords: null
  });

  const activeTruck = fleetTelemetry?.find(t => t.id === activeTruckId);
  const activePos = activeTruck ? [activeTruck.lat, activeTruck.lon] : null;

  let layerUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  let isDark = true;
  if (activeLayer === 'satellite') {
    layerUrl = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
    isDark = false;
  } else if (activeLayer === 'traffic') {
    layerUrl = "https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}";
  }

  // Routing Engine (C++ for Hubs, OSRM for arbitrary points)
  useEffect(() => {
    if (routingState.start && routingState.end) {
      const fetchRoute = async () => {
        try {
          if (routingState.start.id && routingState.end.id) {
            // C++ Routing Engine
            const res = await fetch(`/api/v1/routing/calculate?start_id=${routingState.start.id}&end_id=${routingState.end.id}`);
            const data = await res.json();
            if (data.status === 'SUCCESS' && data.path) {
              const coords = data.path.map(p => [p.lat, p.lon]);
              setRoutingState(prev => ({ ...prev, routeCoords: coords }));
            } else {
              console.error("Routing error from C++ engine:", data);
            }
          } else {
            // OSRM Routing Fallback
            const startLng = routingState.start.lng ?? routingState.start.lon;
            const startLat = routingState.start.lat;
            const endLng = routingState.end.lng ?? routingState.end.lon;
            const endLat = routingState.end.lat;
            
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full`);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
              const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
              setRoutingState(prev => ({ ...prev, routeCoords: coords }));
            }
          }
        } catch (err) {
          console.error("Routing request failed:", err);
        }
      };
      fetchRoute();
    }
  }, [routingState.start, routingState.end]);

  const fetchReverseGeocode = async (lat, lon, target) => {
    try {
      setRoutingState(prev => ({ ...prev, [target === 'start' ? 'startName' : 'endName']: 'Locating...' }));
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const name = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setRoutingState(prev => ({ ...prev, [target === 'start' ? 'startName' : 'endName']: name }));
    } catch (err) {
      setRoutingState(prev => ({ ...prev, [target === 'start' ? 'startName' : 'endName']: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
    }
  };

  const fetchGeocode = async (query, target) => {
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setRoutingState(prev => ({ 
          ...prev, 
          [target === 'start' ? 'start' : 'end']: coords,
          [target === 'start' ? 'startName' : 'endName']: data[0].display_name.split(',').slice(0, 3).join(',')
        }));
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleSearchOrigin = (val, execute = false) => {
    setRoutingState(prev => ({ ...prev, startName: val }));
    if (execute) fetchGeocode(val, 'start');
  };

  const handleSearchDestination = (val, execute = false) => {
    setRoutingState(prev => ({ ...prev, endName: val }));
    if (execute) fetchGeocode(val, 'end');
  };

  const swapRoute = () => {
    setRoutingState(prev => ({
      ...prev,
      start: prev.end,
      end: prev.start,
      startName: prev.endName,
      endName: prev.startName
    }));
  };

  const clearRoute = () => {
    setRoutingState({ start: null, end: null, startName: '', endName: '', routeCoords: null });
  };

  const togglePoi = async (poi) => {
    const isAdding = !activePois.includes(poi);
    
    if (isAdding) {
      setActivePois(prev => [...prev, poi]);
      
      const lat = routingState.start?.lat || 13.08;
      const lon = routingState.start?.lng || 80.27;
      
      try {
        const res = await fetch(`/api/v1/map/pois?lat=${lat}&lon=${lon}&type=${poi}`);
        const data = await res.json();
        setPoiData(prev => [...prev, ...data]);
      } catch (err) {
        console.error("Failed to fetch POIs:", err);
      }
    } else {
      setActivePois(prev => prev.filter(p => p !== poi));
      
      const categoryMap = { 'fuel': 'GAS STATION', 'food': 'RESTAURANT', 'hotel': 'HOTEL' };
      const cat = categoryMap[poi] || poi.toUpperCase();
      
      setPoiData(prev => prev.filter(p => p.type !== cat));
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className={isDark ? 'dark-map-theme' : ''} style={{ width: '100%', height: '100%' }}>
        <MapContainer center={DEFAULT_CENTER} zoom={5} className="map-container" zoomControl={false}>
          
          <TileLayer 
            url={layerUrl} 
            attribution='&copy; Google Maps' 
            keepBuffer={8} 
            updateWhenZooming={false} 
            updateInterval={150} 
          />
          
          <MapOrchestrator 
            routingState={routingState} 
            setRoutingState={setRoutingState}
            doLocate={doLocate}
            setDoLocate={setDoLocate}
            fetchReverseGeocode={fetchReverseGeocode}
          />

          {routingState.start && <Marker position={routingState.start} icon={startIcon} />}
          {routingState.end && <Marker position={routingState.end} icon={endIcon} />}
          


          {/* C++ Route Rendering */}
          {routingState.routeCoords && (
            <React.Fragment>
              <Polyline positions={routingState.routeCoords} color="#10b981" weight={6} opacity={0.8} dashArray="10, 10" />
            </React.Fragment>
          )}

          {/* Agentic Neural Dispatch DSA Route Rendering */}
          {agenticRoute && (
            <React.Fragment>
              <Polyline positions={agenticRoute} color="#f43f5e" weight={8} opacity={0.9} dashArray="15, 10" />
            </React.Fragment>
          )}

          {poiData.map((poi, idx) => (
          <Marker 
            key={`poi-${idx}`}
            position={[poi.lat, poi.lon]}
            icon={poiIcon(poi.type)}
          >
            <Popup className="sabre-popup">
              <div>
                <strong>{poi.name}</strong><br/>
                {poi.type.toUpperCase()}
              </div>
            </Popup>
          </Marker>
        ))}


          {Object.entries(
             (fleetTelemetry || []).reduce((acc, truck) => {
               if (truck.platoon_id) {
                 if (!acc[truck.platoon_id]) acc[truck.platoon_id] = [];
                 acc[truck.platoon_id].push([truck.lat, truck.lon]);
               }
               return acc;
             }, {})
          ).map(([platoonId, coords]) => (
            <Polyline key={`swarm-${platoonId}`} positions={coords} color="var(--neon-cyan)" weight={4} dashArray="10, 10" className="swarm-line" opacity={0.8} />
          ))}
          
          {fleetTelemetry?.map(truck => (
            <Marker 
              key={truck.id} 
              position={[truck.lat, truck.lon]} 
              icon={L.divIcon({
                className: `custom-div-icon fleet-tracker-icon ${truck.platoon_id ? 'swarm-aura' : ''}`,
                html: `
                  <div style="
                    width: 32px; height: 32px; 
                    transform: rotate(${truck.heading}deg);
                    transition: transform 0.5s linear;
                    display: flex; align-items: center; justify-content: center;
                  ">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${truck.platoon_id ? '#a855f7' : (truck.id === activeTruckId ? '#06b6d4' : '#10b981')}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px ${truck.platoon_id ? '#a855f7' : (truck.id === activeTruckId ? '#06b6d4' : '#10b981')}); fill: ${truck.platoon_id ? 'rgba(168,85,247,0.3)' : (truck.id === activeTruckId ? 'rgba(6,182,212,0.3)' : 'rgba(16,185,129,0.3)')}">
                      <polygon points="12 2 2 22 12 17 22 22 12 2" />
                    </svg>
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })} 
              zIndexOffset={truck.id === activeTruckId ? 1000 : 500}
            >
              <Popup>
                <div style={{fontFamily: 'Orbitron, sans-serif', color: 'var(--neon-cyan)', background: 'transparent', padding: '4px'}}>
                  <div style={{fontSize: '14px', fontWeight: '900', letterSpacing: '1px'}}>{truck.id}</div>
                  <div style={{fontSize: '10px', color: '#94a3b8', marginBottom: '8px'}}>{truck.label}</div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px'}}>
                    <div>SPD: <span style={{color: '#fff'}}>{truck.speed_kmh}</span></div>
                    <div>TMP: <span style={{color: '#fff'}}>{truck.cargo_temp}°</span></div>
                    <div>FUL: <span style={{color: '#fff'}}>{truck.fuel_level}%</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
        </MapContainer>
      </div>

      <MapControls 
        activeLayer={activeLayer}
        onSetLayer={setActiveLayer}
        activePois={activePois}
        onTogglePoi={togglePoi}
        onAutoLocate={() => setDoLocate(true)}
        routingState={routingState}
        onClearRoute={clearRoute}
        onSearchOrigin={handleSearchOrigin}
        onSearchDestination={handleSearchDestination}
        onSwapRoute={swapRoute}
        onOriginSelected={(result) => {
          setRoutingState(prev => ({ ...prev, startName: result.name, start: result }));
        }}
        onDestinationSelected={(result) => {
          setRoutingState(prev => ({ ...prev, endName: result.name, end: result }));
        }}
        onDispatchRoute={() => {
          console.log("DISPATCH BUTTON CLICKED!", routingState.routeCoords);
          if (routingState.routeCoords && onDispatchRoute) {
            console.log("Calling parent onDispatchRoute");
            onDispatchRoute(routingState.routeCoords);
          }
        }}
      />
    </div>
  );
}
