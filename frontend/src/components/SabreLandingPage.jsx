import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, Zap, Layers, Cpu, Globe2, Compass, 
  ChevronRight, Lock, CheckCircle2, Bot, Gauge, Server, Users, 
  HelpCircle, ChevronDown, MessageSquare, Terminal, ExternalLink, 
  Play, Sparkles, Sliders, Activity, AlertTriangle, KeyRound, Shield, Check, Flame, Film
} from 'lucide-react';
import SabreAuthModal from './SabreAuthModal';
import SabreChromaticAperture from './SabreChromaticAperture';
import SabreMotionCanvas from './SabreMotionCanvas';
import SabreTruckBlueprintShowcase from './SabreTruckBlueprintShowcase';
import SabreVideoStage from './SabreVideoStage';
import SabreDocumentedCrisisShowcase from './SabreDocumentedCrisisShowcase';

export default function SabreLandingPage({ onLaunchConsole }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState('aperture');
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // FAQ open item
  const [openFaq, setOpenFaq] = useState(0);

  // Live 20,000 Writes/Sec Counter Simulation
  const [liveWritesCount, setLiveWritesCount] = useState(2841920);

  // Ultra-Smooth Virtual Mouse-Wheel Inertia Scroll (No physical scrollbar needed!)
  useEffect(() => {
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isTicking = false;

    const onWheel = (e) => {
      // Natural, fluid gliding with zero physical scrollbar friction
      targetY += e.deltaY * 1.1;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(targetY, maxScroll));

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      currentY += (targetY - currentY) * 0.12;
      window.scrollTo(0, currentY);
      if (Math.abs(targetY - currentY) > 0.5) {
        requestAnimationFrame(updateScroll);
      } else {
        isTicking = false;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  // Live Scroll Progress Tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }

      // Track active section for floating waypoint
      const sections = ['aperture', 'physics', 'ghost-pilot', 'throughput', 'faqs', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveChapter(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ticking 20k writes counter
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveWritesCount(prev => prev + Math.floor(Math.random() * 280) + 120);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Smooth scroll helper
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const FAQS = [
    {
      q: "What makes SABRE fundamentally different from generic fleet trackers or SAP TM?",
      a: "SABRE is a sovereign spatial physics and logistics operating system built completely in-house. While generic software treats commercial tractor-trailers like passenger cars, SABRE runs 14 continuous physical cost equations—including swept path turning clearance, dynamic brake thermal accumulation on Ghat descents, road roughness (IRI), and monsoon wading levels—combined with a zero-trust cryptographic ledger that prevents corporate supply-chain leakage."
    },
    {
      q: "Can human operators operate the entire platform manually without using AI?",
      a: "Yes, 100%. Every single capability—from docket booking, multi-axle vehicle profiling, dock bay snapping, and legal GST double-entry Tally bookkeeping—is fully functional by hand with single-click manual actions and seamless interactive controls."
    },
    {
      q: "How does the autonomous AI agent work on screen?",
      a: "SABRE AI operates as an in-app 'Ghost Pilot' with transparent on-screen execution. Rather than running opaque background scripts, it physically glides across the interface, opens the exact menus, configures parameters, and stages services in standby—leaving the final activation in the human operator's hands under our Zero-Trust policy."
    },
    {
      q: "How does SABRE handle extreme highway corridors like Shiradi Ghat?",
      a: "SABRE calculates real-time rotor thermal accumulation on steep gradients (e.g. -6.5% incline over 38km) and pairs vehicles with emergency escape ramps and automated engine retarder governors before dangerous brake fade can occur."
    },
    {
      q: "What authentication credentials are supported?",
      a: "SABRE supports multi-tenant enterprise access via Google Workspace/Gmail with one-time passcode (OTP), Corporate Company ID Enterprise SSO, and SMS Mobile OTP verification."
    }
  ];

  return (
    <div 
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#02040a',
        color: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* 60 FPS INTERACTIVE MOTION CANVAS (GRAVITATIONAL NODES & LASER FILAMENTS) */}
      <SabreMotionCanvas />

      {/* AMBIENT MOUSE TORCH GLOW (APPLE VISION SPECULAR TRACKER) */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.06) 0%, rgba(168, 85, 247, 0.03) 40%, transparent 80%)`,
          transition: 'background 0.05s linear'
        }}
      />

      {/* ========================================================================= */}
      {/* 1. APPLE-STYLE CHROMATIC SCROLL PROGRESS LINE (TOP EDGE)                  */}
      {/* ========================================================================= */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2.5px',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #ff007f 0%, #9900ff 25%, #00d2ff 50%, #00ff88 75%, #ffea00 100%)',
          zIndex: 9999,
          boxShadow: '0 0 12px rgba(0, 210, 255, 0.8)',
          transition: 'width 0.1s linear'
        }}
      />

      {/* ========================================================================= */}
      {/* 2. FLOATING AMBIENT CAUSTIC ORBS (DEEP OBSIDIAN SPATIAL DEPTH)           */}
      {/* ========================================================================= */}
      <div 
        style={{
          position: 'fixed',
          top: '15%',
          left: '5%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'causticFloat1 18s ease-in-out infinite alternate'
        }}
      />
      <div 
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '5%',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.09) 0%, rgba(16, 185, 129, 0.06) 50%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'causticFloat2 22s ease-in-out infinite alternate'
        }}
      />

      {/* ========================================================================= */}
      {/* 2. TOP ULTRA-LUXURY GLASS NAVIGATION BAR                                 */}
      {/* ========================================================================= */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          padding: '0 36px',
          background: 'rgba(2, 6, 18, 0.82)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2000,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Brand: Strictly SABRE */}
        <div 
          onClick={() => scrollTo('aperture')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div style={{
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '0.12em',
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff',
            lineHeight: 1
          }}>
            SABRE
          </div>
          <span style={{
            background: 'rgba(46, 125, 50, 0.25)',
            border: '1px solid rgba(74, 222, 128, 0.35)',
            color: '#86efac',
            fontSize: '9.5px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '9999px',
            letterSpacing: '0.06em'
          }}>
            SOVEREIGN OS
          </span>
        </div>

        {/* Center Nav Anchors */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '13px', fontWeight: 600 }}>
          <span onClick={() => scrollTo('aperture')} style={{ color: '#ffffff', cursor: 'pointer', transition: 'color 0.15s' }}>Aperture</span>
          <span onClick={() => scrollTo('why-sabre')} style={{ color: '#ef4444', cursor: 'pointer', transition: 'color 0.15s' }}>Why SABRE?</span>
          <span onClick={() => scrollTo('solution')} style={{ color: '#22c55e', cursor: 'pointer', transition: 'color 0.15s' }}>Solution</span>
          <span onClick={() => scrollTo('documented-crisis-matrix')} style={{ color: '#f59e0b', cursor: 'pointer', transition: 'color 0.15s' }}>Real Crises (20)</span>
          <span onClick={() => scrollTo('truck-blueprint')} style={{ color: '#38bdf8', cursor: 'pointer', transition: 'color 0.15s' }}>Truck Blueprint</span>
          <span onClick={() => scrollTo('faqs')} style={{ color: '#94a3b8', cursor: 'pointer', transition: 'color 0.15s' }}>FAQs</span>
          <span onClick={() => scrollTo('contact')} style={{ color: '#94a3b8', cursor: 'pointer', transition: 'color 0.15s' }}>Connect</span>
        </nav>

        {/* Right Action Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(46, 125, 50, 0.25)',
              border: '1px solid rgba(74, 222, 128, 0.35)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#86efac',
              fontWeight: 700
            }}>
              <CheckCircle2 size={14} />
              <span>{currentUser.user}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
          )}

          {/* THE NEW TAB LAUNCH BUTTON */}
          <button
            onClick={() => onLaunchConsole ? onLaunchConsole() : window.open('/?app=console', '_blank')}
            title="Launch Full SABRE Console in New Window"
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              color: '#ffffff',
              border: '1px solid rgba(134, 239, 172, 0.4)',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(22, 101, 52, 0.4), 0 1px 0 0 rgba(255,255,255,0.2) inset',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>Launch Platform</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 5. HERO STAGE: THE CHROMATIC IRIS APERTURE (WWDC23 INSPIRATION)          */}
      {/* ========================================================================= */}
      <section 
        id="aperture"
        style={{
          minHeight: '100vh',
          paddingTop: '96px',
          paddingBottom: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* THE BREATHING CHROMATIC IRIS APERTURE LOGO COMPONENT */}
        <SabreChromaticAperture onLaunchConsole={onLaunchConsole} />

        {/* High-Impact Typography Hook */}
        <div style={{ maxWidth: '840px', textAlign: 'center', padding: '0 24px', marginTop: '-20px' }}>
          <p style={{
            fontSize: '22px',
            lineHeight: 1.45,
            color: 'rgba(255, 255, 255, 0.88)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            margin: '0 0 32px 0'
          }}>
            The sovereign operating system for commercial freight. Built with <strong style={{ color: '#ffffff', fontWeight: 700 }}>14 continuous spatial physics engines</strong>, a <strong style={{ color: '#38bdf8', fontWeight: 700 }}>Zero-Trust cryptographic ledger</strong>, and real-time processing of <strong style={{ color: '#86efac', fontWeight: 700 }}>20,000 writes/second</strong> on physical disk.
          </p>

          {/* Interactive Trigger Blades */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onLaunchConsole ? onLaunchConsole() : window.open('/?app=console', '_blank')}
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: '#ffffff',
                border: '1px solid rgba(134, 239, 172, 0.45)',
                padding: '14px 34px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 30px rgba(22, 101, 52, 0.5), 0 1px 0 0 rgba(255,255,255,0.3) inset',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span>Launch Live Console</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => scrollTo('why-sabre')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(16px)',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Play size={16} color="#38bdf8" />
              <span>Why SABRE?</span>
            </button>
          </div>

          {/* Live Telemetry Pill Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span>Capacity: <strong style={{ color: '#ffffff' }}>20,000 Writes/Sec</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <Gauge size={13} color="#38bdf8" />
              <span>Physics: <strong style={{ color: '#ffffff' }}>14 Active Equations</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <ShieldCheck size={13} color="#a855f7" />
              <span>Security: <strong style={{ color: '#ffffff' }}>Java Air-Gapped Shield</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <Terminal size={13} color="#f59e0b" />
              <span>AI Control: <strong style={{ color: '#ffffff' }}>Human-in-the-Loop Gate</strong></span>
            </div>
          </div>

          {/* TACTICAL SPATIAL RADAR HUD MINIATURE */}
          <div 
            onClick={() => onLaunchConsole ? onLaunchConsole() : window.open('/?app=console', '_blank')}
            title="Click to Open Full Interactive Radar Console"
            style={{
              maxWidth: '520px',
              width: '100%',
              margin: '44px auto 0',
              background: 'rgba(5, 12, 28, 0.75)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '20px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.15)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* The Radar Disc with Rotating Sweep */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(2, 6, 23, 0.95) 70%)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {/* Concentric rings */}
              <div style={{ position: 'absolute', inset: '10px', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: '22px', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '50%' }} />
              {/* Crosshairs */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(34, 197, 94, 0.25)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(34, 197, 94, 0.25)' }} />
              {/* Rotating Sweep Beam */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'conic-gradient(from 0deg, rgba(34, 197, 94, 0.45) 0deg, transparent 65deg, transparent 360deg)',
                borderRadius: '50%',
                animation: 'radarSweep 3s linear infinite'
              }} />
              {/* Animated Pings */}
              <div style={{ position: 'absolute', top: '35%', left: '60%', width: '5px', height: '5px', borderRadius: '50%', background: '#86efac', boxShadow: '0 0 6px #86efac' }} />
              <div style={{ position: 'absolute', top: '65%', left: '30%', width: '4px', height: '4px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
            </div>

            {/* Radar Telemetry Readout */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#86efac', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ● LIVE SPATIAL RADAR
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>20,000 ACTIVE</span>
              </div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 800, marginTop: '2px' }}>
                All-India Heavy Freight Grid
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>NH-48 · NH-75 Shiradi · NH-44 Corridor</span>
                <ExternalLink size={11} color="#38bdf8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 1: WHY SABRE? (VIDEO LOOP SHOWCASING THE PROBLEMS)             */}
      {/* ========================================================================= */}
      <section 
        id="why-sabre"
        style={{
          padding: '80px 36px 50px',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center'
        }}
      >
        {/* Strictly "WHY SABRE?" with NO description below it */}
        <h2 style={{
          fontSize: '56px',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          margin: '0 0 36px 0',
          fontFamily: "'Space Grotesk', sans-serif",
          textTransform: 'uppercase'
        }}>
          WHY SABRE?
        </h2>

        {/* Official Motion Graphics Ad: Meet SABRE Core */}
        <SabreVideoStage 
          src="/sabre_motion_ad.mp4"
          badge="Official Motion Graphics Commercial (70s)"
          badgeColor="#06b6d4"
          title="Meet SABRE Core • Autonomous Indian Transport AI Agent"
          fallbackPlaceholder="SABRE Motion Graphics Commercial (sabre_motion_ad.mp4) with dynamic sound effects."
        />
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 2: THIS IS WHY SABRE... (HOW SABRE SOLVES THOSE PROBLEMS)      */}
      {/* ========================================================================= */}
      <section 
        id="solution"
        style={{
          padding: '50px 36px 90px',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center'
        }}
      >
        {/* Subtitle: This is why SABRE... */}
        <h3 style={{
          fontSize: '44px',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          margin: '0 0 36px 0',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          This is why SABRE...
        </h3>

        {/* Video Loop 2: Showcasing the Solution via Platform Recording */}
        <SabreVideoStage 
          src="/sabre_motion_ad.mp4"
          badge="Autonomous Financial & Paperwork Engine"
          badgeColor="#22c55e"
          title="ULIP VAHAN/SARATHI • 4-Copy Bilty • FASTag • 24hr MSME TReDS Factoring"
          fallbackPlaceholder="SABRE Autonomous Paperwork Engine (sabre_motion_ad.mp4)"
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. REAL-WORLD DOCUMENTED CRISES & ANIMATED RESOLUTIONS (20 ARTICLES)      */}
      {/* ========================================================================= */}
      <SabreDocumentedCrisisShowcase onLaunchConsole={onLaunchConsole} />

      {/* ========================================================================= */}
      {/* 6. 3D TRUCK CAD BLUEPRINT & AUTONOMOUS CORRIDOR CINEMATIC SHOWCASE        */}
      {/* ========================================================================= */}
      <section 
        id="truck-blueprint"
        style={{
          padding: '80px 36px',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        <SabreTruckBlueprintShowcase />
      </section>

      {/* ========================================================================= */}
      {/* 10. ACCORDION FAQS (DARK MINIMALIST APPLE STYLE)                          */}
      {/* ========================================================================= */}
      <section 
        id="faqs"
        style={{
          padding: '80px 36px',
          maxWidth: '920px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}>
            QUESTIONS &amp; ANSWERS
          </span>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#ffffff', margin: '12px 0 0 0', fontFamily: "'Space Grotesk', sans-serif" }}>
            Everything You Need to Know.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map((faq, idx) => (
            <div 
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              style={{
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(16px)',
                border: openFaq === idx ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px 28px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {faq.q}
                </span>
                <ChevronDown 
                  size={18} 
                  color={openFaq === idx ? '#38bdf8' : '#94a3b8'} 
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </div>
              {openFaq === idx && (
                <p style={{ marginTop: '14px', fontSize: '14.5px', color: '#94a3b8', lineHeight: 1.65, margin: '14px 0 0 0' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. ENTERPRISE CONTACT & ACCESS REQUEST                                  */}
      {/* ========================================================================= */}
      <section 
        id="contact"
        style={{
          padding: '80px 36px 120px',
          maxWidth: '780px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '44px',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 1px 0 0 rgba(255, 255, 255, 0.2) inset',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff', margin: '0 0 12px 0', fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Deploy SABRE?
          </h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '32px' }}>
            Request sovereign enterprise provisioning or connect with our physical transport engineering team.
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert("Enterprise provisioning inquiry dispatched. A SABRE solutions engineer will reach out within 2 hours.");
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Anand Mahindra" 
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    marginTop: '6px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Corporate Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@enterprise.com" 
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    marginTop: '6px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Fleet Size &amp; Logistics Corridors</label>
              <textarea 
                rows="3"
                placeholder="Describe your commercial vehicle count, key routes (e.g. NH-48, NH-75), and integration requirements..."
                style={{
                  width: '100%',
                  background: 'rgba(2, 6, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  marginTop: '6px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '12px',
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: '#ffffff',
                border: '1px solid rgba(134, 239, 172, 0.45)',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(22, 101, 52, 0.4)'
              }}
            >
              <MessageSquare size={16} />
              <span>Submit Enterprise Request</span>
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. CORPORATE FOOTER (STRICTLY SABRE)                                     */}
      {/* ========================================================================= */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '40px 36px',
        background: '#010206',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 900, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', letterSpacing: '0.08em' }}>SABRE</span>
          <span>© 2026. All sovereign spatial rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Zero-Trust Cryptography</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 13. MULTI-AUTH MODAL (GMAIL + OTP, COMPANY ID, PHONE + OTP)              */}
      {/* ========================================================================= */}
      <SabreAuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* EMBEDDED GLOBAL MOTION GRAPHICS KEYFRAMES */}
      <style>{`
        @keyframes causticFloat1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.15); }
          100% { transform: translate(-30px, -20px) scale(0.95); }
        }
        @keyframes causticFloat2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, -50px) scale(1.1); }
          100% { transform: translate(40px, 30px) scale(0.92); }
        }
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes heatWiggle {
          0% { transform: translateY(0px) skewX(-2deg); opacity: 0.6; }
          100% { transform: translateY(-8px) skewX(2deg); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

    </div>
  );
}
