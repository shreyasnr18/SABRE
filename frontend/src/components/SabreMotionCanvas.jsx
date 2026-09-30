import React, { useEffect, useRef } from 'react';

export default function SabreMotionCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for gravitational lens refraction
    const mouse = { x: width * 0.5, y: height * 0.35, targetX: width * 0.5, targetY: height * 0.35, active: false };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Chromatic Iridescent Particles (Apple Spatial Depth Nodes)
    const PARTICLE_COUNT = 65;
    const particles = [];
    const colors = [
      'rgba(56, 189, 248, ',  // Cyan
      'rgba(168, 85, 247, ',  // Purple
      'rgba(236, 72, 153, ',  // Pink/Magenta
      'rgba(34, 197, 94, ',   // Emerald
      'rgba(251, 191, 36, '   // Gold
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 0.8,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.45 + 0.25,
        pulseOffset: Math.random() * Math.PI * 2,
        z: Math.random() * 0.8 + 0.2 // Depth factor
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation (spring feel)
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Mouse Caustic Flare
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 450
        );
        mouseGlow.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
        mouseGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.04)');
        mouseGlow.addColorStop(0.7, 'rgba(236, 72, 153, 0.02)');
        mouseGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Update and Draw Particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        // Wrap around bounds softly
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Gravitational lens deflection when near mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 260) {
          const force = (1 - dist / 260) * 0.8;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        // Pulsing luminance
        const alpha = p.baseAlpha + Math.sin(time + p.pulseOffset) * 0.15;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
        ctx.fillStyle = p.colorBase + Math.max(0.1, alpha) + ')';
        ctx.shadowBlur = 12 * p.z;
        ctx.shadowColor = p.colorBase + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance

        // 3. Connect Laser Filaments
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distNodes < 140) {
            const lineAlpha = (1 - distNodes / 140) * 0.18 * p.z * p2.z;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
