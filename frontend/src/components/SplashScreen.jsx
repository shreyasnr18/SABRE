import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake loading progress
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Wait a moment at 100% before closing
          return 100;
        }
        // Random increment to feel like real loading
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
    
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#020617', // Very dark slate
      display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center',
      color: 'white'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{
          width: '96px', height: '96px', 
          background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
          borderRadius: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '56px', fontWeight: 'bold', color: 'white',
          boxShadow: '0 0 50px rgba(14, 165, 233, 0.4)'
        }}>S</div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '56px', letterSpacing: '12px', fontWeight: '900', color: '#fff' }}>SABRE</h1>
          <p style={{ margin: 0, fontSize: '16px', letterSpacing: '6px', color: '#94a3b8', marginTop: '12px' }}>FLEET ORCHESTRATOR</p>
        </div>
      </div>

      {/* Loading Road */}
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#38bdf8', letterSpacing: '3px', fontWeight: 'bold' }}>
          <span>INITIALIZING SYSTEMS</span>
          <span>{Math.min(progress, 100)}%</span>
        </div>
        
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '56px', 
          background: '#0f172a', 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 0 30px rgba(56, 189, 248, 0.15)'
        }}>
          {/* Progress Fill (Night mode headlight glow effect) */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(56,189,248,0.05) 0%, rgba(56,189,248,0.2) 100%)',
            transition: 'width 0.2s ease-out'
          }} />
          
          {/* Road Lines */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, width: '200%',
            height: '2px',
            background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #fbbf24 20px, #fbbf24 40px)',
            transform: 'translateY(-50%)',
            animation: 'road-scroll 1s linear infinite'
          }} />
          
          {/* Truck Icon */}
          <div style={{
            position: 'absolute',
            left: `max(16px, calc(${progress}% - 32px))`, // clamp it so truck doesn't start outside
            top: '50%',
            transform: 'translateY(-50%)',
            transition: 'left 0.2s ease-out',
            color: '#38bdf8',
            filter: 'drop-shadow(6px 0px 10px rgba(56,189,248,0.8))',
            zIndex: 10
          }}>
            <Truck size={36} />
          </div>
        </div>
      </div>
      
      {/* Global Style for Keyframes */}
      <style>{`
        @keyframes road-scroll {
          0% { transform: translate(0, -50%); }
          100% { transform: translate(-40px, -50%); }
        }
      `}</style>
    </div>
  );
}
