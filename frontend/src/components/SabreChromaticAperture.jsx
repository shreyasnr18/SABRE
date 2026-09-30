import React, { useState, useEffect, useRef } from 'react';

export default function SabreChromaticAperture({ onLaunchConsole }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth 3D parallax tilt with spring physics
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 22, y: -y * 22 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '860px',
        margin: '0 auto',
        height: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1400px',
        userSelect: 'none'
      }}
    >
      {/* 1. DYNAMIC CHROMATIC HALO REFRACTIONS (BREATHING & ROTATING) */}
      <div 
        style={{
          position: 'absolute',
          width: '620px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.28) 0%, rgba(56, 189, 248, 0.2) 35%, rgba(236, 72, 153, 0.14) 65%, transparent 85%)',
          filter: 'blur(75px)',
          transform: `translate(${tilt.x * 2}px, ${-tilt.y * 2}px) scale(${isHovered ? 1.08 : 1})`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'haloBreathe 7s ease-in-out infinite alternate'
        }}
      />

      {/* 2. THE CHROMATIC OPTIC APERTURE (WWDC23 IRIDESCENT CONCENTRIC ARCS) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${isHovered ? 1.035 : 1})`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 2
        }}
      >
        <svg 
          viewBox="0 0 940 540" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            filter: 'drop-shadow(0 0 32px rgba(0, 220, 255, 0.35))'
          }}
        >
          <defs>
            {/* CHROMATIC MULTI-STOP GRADIENTS (EXACT VIBRANT WWDC PALETTE) */}
            <linearGradient id="wwdcPinkViolet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff007f" />
              <stop offset="35%" stopColor="#9900ff" />
              <stop offset="70%" stopColor="#00d2ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>

            <linearGradient id="wwdcCyanGold" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="30%" stopColor="#00ff66" />
              <stop offset="65%" stopColor="#ffea00" />
              <stop offset="100%" stopColor="#ff1100" />
            </linearGradient>

            <linearGradient id="wwdcSpectrumTop" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="18%" stopColor="#0066ff" />
              <stop offset="38%" stopColor="#cc00ff" />
              <stop offset="58%" stopColor="#ff0055" />
              <stop offset="78%" stopColor="#ff9900" />
              <stop offset="100%" stopColor="#00ffaa" />
            </linearGradient>

            <linearGradient id="wwdcSpectrumBottom" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="18%" stopColor="#00ff88" />
              <stop offset="38%" stopColor="#ffcc00" />
              <stop offset="58%" stopColor="#ff2200" />
              <stop offset="78%" stopColor="#ff0099" />
              <stop offset="100%" stopColor="#6600ff" />
            </linearGradient>

            {/* Sweep Laser Gradient */}
            <linearGradient id="laserSweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Specular Radial Refraction */}
            <radialGradient id="centerCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
              <stop offset="35%" stopColor="rgba(56,189,248,0.18)" />
              <stop offset="70%" stopColor="rgba(168,85,247,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Chromatic Blur Filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND SPECULAR CORE */}
          <ellipse cx="470" cy="270" rx="310" ry="175" fill="url(#centerCoreGlow)" />

          {/* ========================================================= */}
          {/* UPPER IRIDESCENT CRESCENT APERTURE ARCS                   */}
          {/* ========================================================= */}
          
          {/* Outer Layer 1 (Upper) */}
          <path
            d="M 120,270 C 165,100 775,100 820,270 C 755,130 185,130 120,270 Z"
            fill="url(#wwdcSpectrumTop)"
            opacity="0.95"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseSlow 6.5s ease-in-out infinite alternate',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 2 (Upper) */}
          <path
            d="M 175,270 C 215,135 725,135 765,270 C 705,158 235,158 175,270 Z"
            fill="url(#wwdcPinkViolet)"
            opacity="0.92"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseMed 5.2s ease-in-out infinite alternate 0.5s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 3 (Upper) */}
          <path
            d="M 230,270 C 265,165 675,165 710,270 C 660,184 280,184 230,270 Z"
            fill="url(#wwdcCyanGold)"
            opacity="0.94"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseFast 4.4s ease-in-out infinite alternate 1s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 4 (Upper Deep Accent) */}
          <path
            d="M 285,270 C 315,190 625,190 655,270 C 615,206 325,206 285,270 Z"
            fill="url(#wwdcSpectrumTop)"
            opacity="0.9"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseSlow 7.2s ease-in-out infinite alternate 1.5s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 5 (Upper Inner Core) */}
          <path
            d="M 340,270 C 365,215 575,215 600,270 C 570,226 370,226 340,270 Z"
            fill="url(#wwdcPinkViolet)"
            opacity="0.96"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseMed 4.8s ease-in-out infinite alternate 0.8s',
              mixBlendMode: 'screen'
            }}
          />

          {/* ========================================================= */}
          {/* LOWER IRIDESCENT CRESCENT APERTURE ARCS (SYMMETRICAL)    */}
          {/* ========================================================= */}

          {/* Outer Layer 1 (Lower) */}
          <path
            d="M 120,270 C 165,440 775,440 820,270 C 755,410 185,410 120,270 Z"
            fill="url(#wwdcSpectrumBottom)"
            opacity="0.95"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseSlow 6.5s ease-in-out infinite alternate 0.4s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 2 (Lower) */}
          <path
            d="M 175,270 C 215,405 725,405 765,270 C 705,382 235,382 175,270 Z"
            fill="url(#wwdcCyanGold)"
            opacity="0.92"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseMed 5.2s ease-in-out infinite alternate 1.2s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 3 (Lower) */}
          <path
            d="M 230,270 C 265,375 675,375 710,270 C 660,356 280,356 230,270 Z"
            fill="url(#wwdcPinkViolet)"
            opacity="0.94"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseFast 4.4s ease-in-out infinite alternate 0.2s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 4 (Lower Deep Accent) */}
          <path
            d="M 285,270 C 315,350 625,350 655,270 C 615,334 325,334 285,270 Z"
            fill="url(#wwdcSpectrumBottom)"
            opacity="0.9"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseSlow 7.2s ease-in-out infinite alternate 0.9s',
              mixBlendMode: 'screen'
            }}
          />

          {/* Concentric Layer 5 (Lower Inner Core) */}
          <path
            d="M 340,270 C 365,325 575,325 600,270 C 570,314 370,314 340,270 Z"
            fill="url(#wwdcCyanGold)"
            opacity="0.96"
            style={{
              transformOrigin: '470px 270px',
              animation: 'wwdcPulseMed 4.8s ease-in-out infinite alternate 1.4s',
              mixBlendMode: 'screen'
            }}
          />

          {/* LASER FILAMENT SWEEPS (KINETIC GLOWING EDGES) */}
          <ellipse 
            cx="470" cy="270" rx="350" ry="170" 
            fill="none" 
            stroke="url(#laserSweep)" 
            strokeWidth="1.8"
            strokeDasharray="180 800"
            style={{
              transformOrigin: '470px 270px',
              animation: 'laserRotate 8s linear infinite'
            }}
          />
          <ellipse 
            cx="470" cy="270" rx="270" ry="120" 
            fill="none" 
            stroke="url(#laserSweep)" 
            strokeWidth="1.5"
            strokeDasharray="140 600"
            style={{
              transformOrigin: '470px 270px',
              animation: 'laserRotateRev 6s linear infinite'
            }}
          />

          {/* OPTICAL PINCH NODES AT THE HORIZONTAL AXIS (STARBURST GLARES) */}
          <g transform="translate(120, 270)">
            <circle cx="0" cy="0" r="5" fill="#ffffff" filter="url(#softGlow)" />
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
          </g>
          <g transform="translate(820, 270)">
            <circle cx="0" cy="0" r="5" fill="#ffffff" filter="url(#softGlow)" />
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
          </g>
        </svg>

        {/* 3. CENTRAL HERO TYPOGRAPHY: STRICTLY "SABRE" WITH IRIDESCENT SHIMMER */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        >
          {/* Subtle Ambient Halo Behind Text */}
          <div 
            style={{
              position: 'absolute',
              width: '290px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(2,4,10,0.92) 0%, rgba(2,4,10,0.5) 65%, transparent 100%)',
              zIndex: -1
            }}
          />

          {/* THE BRAND NAME: STRICTLY "SABRE" */}
          <h1 
            style={{
              margin: 0,
              fontSize: '84px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
              lineHeight: 1,
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #ffffff 0%, #ffffff 35%, #7dd3fc 50%, #f472b6 65%, #ffffff 80%, #ffffff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textShimmer 6s linear infinite',
              filter: 'drop-shadow(0 0 24px rgba(56, 189, 248, 0.45))'
            }}
          >
            SABRE
          </h1>

          {/* Sleek Subtitle Tag */}
          <div 
            style={{
              marginTop: '14px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)',
              fontFamily: "'Space Grotesk', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <span style={{ height: '1px', width: '28px', background: 'linear-gradient(90deg, transparent, #38bdf8)' }} />
            <span>Sovereign Spatial Logistics OS</span>
            <span style={{ height: '1px', width: '28px', background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
          </div>
        </div>
      </div>

      {/* EMBEDDED MOTION KEYFRAMES */}
      <style>{`
        @keyframes wwdcPulseSlow {
          0% { transform: scale(0.975) rotate(0deg); opacity: 0.88; }
          100% { transform: scale(1.028) rotate(1.4deg); opacity: 1; }
        }
        @keyframes wwdcPulseMed {
          0% { transform: scale(1.025) rotate(0deg); opacity: 0.85; }
          100% { transform: scale(0.97) rotate(-1.8deg); opacity: 0.98; }
        }
        @keyframes wwdcPulseFast {
          0% { transform: scale(0.98) rotate(0.9deg); opacity: 0.88; }
          100% { transform: scale(1.025) rotate(-0.9deg); opacity: 1; }
        }
        @keyframes laserRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes laserRotateRev {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes textShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes haloBreathe {
          0% { opacity: 0.65; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
