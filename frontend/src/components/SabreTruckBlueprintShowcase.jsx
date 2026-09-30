import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Gauge, ShieldCheck, Zap, Activity, Eye, Play, Pause, 
  RotateCw, Compass, CheckCircle2, ChevronRight, Sliders, Flame
} from 'lucide-react';

export default function SabreTruckBlueprintShowcase() {
  // Modes: 'blueprint' (CAD Wireframe) | 'corridor' (Autonomous Night Highway)
  const [activeMode, setActiveMode] = useState('blueprint');
  const [activeHotspot, setActiveHotspot] = useState(0);
  const [isPlayingLoop, setIsPlayingLoop] = useState(true);
  const [timecode, setTimecode] = useState('00:04:18:22');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Timecode simulation loop
  useEffect(() => {
    if (!isPlayingLoop) return;
    const interval = setInterval(() => {
      const now = new Date();
      const frames = Math.floor((now.getMilliseconds() / 1000) * 60).toString().padStart(2, '0');
      const secs = now.getSeconds().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimecode(`00:${mins}:${secs}:${frames}`);
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, [isPlayingLoop]);

  // 3D Parallax Tilt on Blueprint
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 14 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const HOTSPOTS = [
    {
      id: 0,
      title: "Active Thermal Brake Rotor Matrix",
      tag: "Physics Safety Core",
      desc: "Calculates kinetic thermal buildup on steep Ghat descents. Couples with automated hydraulic retarders before rotor degradation exceeds 420°C.",
      coords: { x: '35%', y: '75%' },
      metric: "480°C Max Dissipation",
      icon: Flame,
      color: "#ef4444"
    },
    {
      id: 1,
      title: "Swept Path Multi-Axle Steering",
      tag: "Spatial Geometry",
      desc: "Simulates tractor-to-kingpin swept path envelopes on tight hairpin turns, ensuring zero trailer rollover on treacherous NH-75 switchbacks.",
      coords: { x: '58%', y: '58%' },
      metric: "15.8m Hairpin Envelope",
      icon: Gauge,
      color: "#38bdf8"
    },
    {
      id: 2,
      title: "Spatial Lidar & Radar Array",
      tag: "Autonomous Sensing",
      desc: "Projects 250m point cloud ahead of the hauler. Automatically measures monsoon road water wading depth up to 350mm to prevent hydroplaning.",
      coords: { x: '24%', y: '68%' },
      metric: "250m Point Cloud",
      icon: Zap,
      color: "#10b981"
    },
    {
      id: 3,
      title: "High-Capacity Aerodynamic Fairings",
      tag: "Fuel Efficiency",
      desc: "Dynamic air deflectors integrated with telematics to optimize aerodynamic resistance, saving up to 14% diesel on long-haul multi-state transit.",
      coords: { x: '68%', y: '22%' },
      metric: "0.31 Cd Aero Factor",
      icon: Activity,
      color: "#a855f7"
    }
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: '#38bdf8',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          CINEMATIC PLATFORM SHOWCASE · PHYSICAL FREIGHT
        </span>
        <h2 style={{
          fontSize: '44px',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          margin: '12px 0 16px 0',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          Engineered for Heavy Commercial Haulers.
        </h2>
        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '16px', color: '#94a3b8', lineHeight: 1.6 }}>
          Explore the 14 spatial physics subsystems governing every truck asset on the SABRE platform. Toggle between CAD technical blueprints and real-time autonomous highway spatial corridor loops.
        </p>

        {/* MODE SWITCHER BUTTONS */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '9999px',
          padding: '4px',
          marginTop: '24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <button
            onClick={() => setActiveMode('blueprint')}
            style={{
              background: activeMode === 'blueprint' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              padding: '10px 28px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: activeMode === 'blueprint' ? '0 4px 18px rgba(2, 132, 199, 0.5)' : 'none'
            }}
          >
            <Layers size={15} />
            <span>3D CAD Wireframe Blueprint</span>
          </button>

          <button
            onClick={() => setActiveMode('corridor')}
            style={{
              background: activeMode === 'corridor' ? 'linear-gradient(135deg, #15803d, #166534)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              padding: '10px 28px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: activeMode === 'corridor' ? '0 4px 18px rgba(22, 101, 52, 0.5)' : 'none'
            }}
          >
            <Zap size={15} />
            <span>Autonomous Night Highway Loop</span>
          </button>
        </div>
      </div>

      {/* MAIN CINEMATIC THEATER FRAME */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background: 'rgba(8, 14, 28, 0.85)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.1) inset',
          perspective: '1200px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* HUD TOP TELEMETRY BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'ping 1.5s infinite' }} />
              LIVE TELEMETRY STREAM
            </span>
            <span style={{ color: '#64748b' }}>|</span>
            <span>TIMECODE: <strong style={{ color: '#ffffff' }}>{timecode}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>MODEL: <strong style={{ color: '#38bdf8' }}>MULTI-AXLE 40T FREIGHT</strong></span>
            <span>CHASSIS: <strong style={{ color: '#86efac' }}>ACTIVE SENSORS</strong></span>
            <button
              onClick={() => setIsPlayingLoop(!isPlayingLoop)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isPlayingLoop ? <Pause size={11} /> : <Play size={11} />}
              <span>{isPlayingLoop ? 'Pause Loop' : 'Play Loop'}</span>
            </button>
          </div>
        </div>

        {/* 3D VISUAL VIEWPORT */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '560px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#020408',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: 'transform 0.12s ease-out'
        }}>
          {/* THE GENERATED 3D BLUEPRINT OR AUTONOMOUS CORRIDOR IMAGE */}
          <img 
            src={activeMode === 'blueprint' ? '/assets/truck_blueprint_3d.jpg' : '/assets/truck_autonomous_corridor.jpg'} 
            alt="SABRE Commercial Truck 3D Blueprint"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: activeMode === 'blueprint' ? 'brightness(1.05) contrast(1.08)' : 'brightness(1.1) contrast(1.15)',
              transition: 'opacity 0.35s ease'
            }}
          />

          {/* SCANLINE LASER SWEEP (ANIMATED VIDEO-LOOP FEEL) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: activeMode === 'blueprint' 
              ? 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), #ffffff, rgba(56, 189, 248, 0.8), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.8), #ffffff, rgba(34, 197, 94, 0.8), transparent)',
            boxShadow: activeMode === 'blueprint' ? '0 0 20px #38bdf8' : '0 0 20px #22c55e',
            animation: 'laserScanSweep 4.5s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* HOLOGRAPHIC GRID OVERLAY */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none'
          }} />

          {/* CORNER BRACKET HUD ACCENTS */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', width: '20px', height: '20px', borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '16px', right: '16px', width: '20px', height: '20px', borderTop: '2px solid #38bdf8', borderRight: '2px solid #38bdf8', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '20px', height: '20px', borderBottom: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '20px', height: '20px', borderBottom: '2px solid #38bdf8', borderRight: '2px solid #38bdf8', pointerEvents: 'none' }} />

          {/* INTERACTIVE HOTSPOTS (FOR CAD BLUEPRINT MODE) */}
          {activeMode === 'blueprint' && HOTSPOTS.map((spot, idx) => (
            <div 
              key={spot.id}
              onClick={() => setActiveHotspot(idx)}
              style={{
                position: 'absolute',
                top: spot.coords.y,
                left: spot.coords.x,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              {/* Outer pulsing ring */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: spot.color + '25',
                border: `1.5px solid ${spot.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 16px ${spot.color}`,
                animation: 'pingSlow 2.5s infinite',
                transform: activeHotspot === idx ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }} />
              </div>

              {/* Pin Callout Badge */}
              <div style={{
                position: 'absolute',
                top: '-36px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(2, 6, 23, 0.92)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${spot.color}70`,
                padding: '3px 10px',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                fontSize: '10.5px',
                color: '#ffffff',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                pointerEvents: 'none'
              }}>
                {spot.title.split(' ')[0]} {spot.title.split(' ')[1]}
              </div>
            </div>
          ))}

          {/* ACTIVE HOTSPOT DETAIL FLOATING GLASS BLADE */}
          {activeMode === 'blueprint' && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              maxWidth: '420px',
              background: 'rgba(2, 6, 23, 0.88)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${HOTSPOTS[activeHotspot].color}60`,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
              zIndex: 30
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: HOTSPOTS[activeHotspot].color,
                  letterSpacing: '0.08em'
                }}>
                  {HOTSPOTS[activeHotspot].tag}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {HOTSPOTS[activeHotspot].metric}
                </span>
              </div>

              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                {HOTSPOTS[activeHotspot].title}
              </h4>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                {HOTSPOTS[activeHotspot].desc}
              </p>
            </div>
          )}

          {/* AUTONOMOUS CORRIDOR RADAR TELEMETRY HUD (MODE 2) */}
          {activeMode === 'corridor' && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              maxWidth: '380px',
              background: 'rgba(2, 6, 23, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '16px',
              padding: '18px',
              zIndex: 30
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                <Activity size={14} />
                <span>Autonomous Flight Guidance Active</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                NH-48 Golden Quadrilateral
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 12px 0' }}>
                Forward lidar tracking 18 vehicles in adjacent lanes. Dynamic rain wading sensors calibrated at 140mm depth.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b' }}>Velocity:</span> <strong style={{ color: '#ffffff' }}>72 km/h Locked</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ color: '#64748b' }}>Lidar Sweep:</span> <strong style={{ color: '#86efac' }}>100% Nominal</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM QUICK INTERACTION TILES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '20px'
        }}>
          {HOTSPOTS.map((spot, idx) => {
            const Icon = spot.icon;
            const isSelected = activeHotspot === idx && activeMode === 'blueprint';
            return (
              <div
                key={spot.id}
                onClick={() => {
                  setActiveMode('blueprint');
                  setActiveHotspot(idx);
                }}
                style={{
                  background: isSelected ? 'rgba(2, 132, 199, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? `1px solid ${spot.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? `0 4px 16px ${spot.color}30` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Icon size={15} color={spot.color} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: spot.color, textTransform: 'uppercase' }}>
                    Subsystem 0{idx + 1}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {spot.title}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  {spot.metric}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EMBEDDED KEYFRAMES */}
      <style>{`
        @keyframes laserScanSweep {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pingSlow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
