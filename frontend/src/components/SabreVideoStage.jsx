import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle, Film, Sparkles, Activity } from 'lucide-react';

export default function SabreVideoStage({ 
  src, 
  title, 
  badge,
  badgeColor = '#ef4444',
  fallbackPlaceholder,
  aspectRatio = '16/9'
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);
  const [triedAltSrc, setTriedAltSrc] = useState(false);

  const handleVideoError = () => {
    const filename = src.split('/').pop();
    if (!triedAltSrc) {
      setTriedAltSrc(true);
      // Alternate between /assets/ and /api/videos/ (which serves directly from root directory)
      if (activeSrc.includes('/assets/')) {
        setActiveSrc(`/api/videos/${filename}`);
        return;
      }
    }
    setHasError(true);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* OUTER CINEMATIC CHASSIS (FROSTED OBSIDIAN GLASS) */}
      <div style={{
        background: 'rgba(6, 12, 24, 0.85)',
        backdropFilter: 'blur(30px) saturate(180%)',
        border: `1px solid ${badgeColor}35`,
        borderRadius: '24px',
        padding: '20px',
        boxShadow: `0 24px 80px rgba(0, 0, 0, 0.8), 0 0 35px ${badgeColor}15`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* HEADER CONTROL BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          marginBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: badgeColor + '20',
              border: `1px solid ${badgeColor}50`,
              color: badgeColor,
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              {badge}
            </span>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}>
              {title}
            </span>
          </div>

          {/* PLAYBACK CONTROLS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? 'Pause Loop' : 'Play Loop'}</span>
            </button>

            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            <button
              onClick={handleFullScreen}
              title="Fullscreen"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* VIDEO DISPLAY CONTAINER */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#010206',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {/* THE REAL VIDEO ELEMENT */}
          <video
            ref={videoRef}
            src={activeSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={handleVideoError}
            onLoadedData={() => setHasError(false)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: hasError ? 'none' : 'block'
            }}
          />

          {/* FALLBACK HIGH-TECH STAGE (WHEN VIDEO FILE IS AWAITING DROP) */}
          {hasError && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.95) 0%, #02040a 100%)',
              padding: '32px',
              textAlign: 'center'
            }}>
              {/* Laser scan line sweep */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, transparent, ${badgeColor}, #ffffff, ${badgeColor}, transparent)`,
                animation: 'videoLaserScan 3.5s linear infinite',
                pointerEvents: 'none'
              }} />

              {/* Decorative Holographic Radar Ring */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: badgeColor + '15',
                border: `1.5px solid ${badgeColor}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: `0 0 30px ${badgeColor}30`,
                animation: 'pulseGlow 2.5s infinite'
              }}>
                <Film size={34} color={badgeColor} />
              </div>

              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                {title}
              </div>

              <div style={{
                fontSize: '13px',
                color: '#94a3b8',
                maxWidth: '560px',
                lineHeight: 1.55,
                marginTop: '8px'
              }}>
                {fallbackPlaceholder}
              </div>

              {/* File Attachment Pill */}
              <div style={{
                marginTop: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: '#cbd5e1',
                fontFamily: 'monospace'
              }}>
                <span style={{ color: badgeColor, fontWeight: 800 }}>ATTACHMENT:</span>
                <span>{src}</span>
              </div>
            </div>
          )}

          {/* SCANLINE OVERLAY */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.12) 3px, rgba(0, 0, 0, 0.12) 4px)',
            pointerEvents: 'none',
            opacity: 0.6
          }} />
        </div>
      </div>

      <style>{`
        @keyframes videoLaserScan {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
