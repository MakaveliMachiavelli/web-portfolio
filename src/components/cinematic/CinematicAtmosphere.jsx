import React, { useEffect, useRef } from 'react';

// Real-time volumetric light beam and particle atmospheric layer
export default function CinematicAtmosphere({ activeGenre = 'action' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.3, targetX: 0.5, targetY: 0.3 });
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Track intersection to halt loop when offscreen
    let cachedRect = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !wasVisible) {
          if (containerRef.current) cachedRect = containerRef.current.getBoundingClientRect();
          render();
        } else if (!entry.isIntersecting && wasVisible) {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.02 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      if (containerRef.current) cachedRect = containerRef.current.getBoundingClientRect();
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Mouse tracking for projector angle and ember breeze with throttled cached rect
    let mouseRaf = null;
    const handleMouseMove = (e) => {
      if (!isVisibleRef.current) return;
      if (mouseRaf) return;
      mouseRaf = requestAnimationFrame(() => {
        mouseRaf = null;
        if (!cachedRect && containerRef.current) {
          cachedRect = containerRef.current.getBoundingClientRect();
        }
        if (!cachedRect) return;
        const x = (e.clientX - cachedRect.left) / cachedRect.width;
        const y = (e.clientY - cachedRect.top) / cachedRect.height;
        mouseRef.current.targetX = Math.max(0, Math.min(1, x));
        mouseRef.current.targetY = Math.max(0, Math.min(1, y));
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Generate 32 cinematic dust/ember particles (tuned for 120 FPS performance)
    const PARTICLE_COUNT = 32;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.15,
        alpha: 0.2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.35 + 0.12),
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        color:
          activeGenre === 'action'
            ? Math.random() > 0.4
              ? '255, 120, 30'
              : '255, 190, 80'
            : Math.random() > 0.3
            ? '245, 180, 70'
            : '220, 150, 110',
      });
    }

    let time = 0;
    const render = () => {
      if (!isVisibleRef.current) return;

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Draw volumetric projector light beam originating from top center
      const projOriginX = width * 0.5 + (mouseRef.current.x - 0.5) * 120;
      const projOriginY = -40;
      const projTargetX = width * mouseRef.current.x;
      const projTargetY = height * 0.55;

      const beamGrad = ctx.createRadialGradient(
        projOriginX,
        projOriginY,
        20,
        projTargetX,
        projTargetY,
        width * 0.75
      );

      const isAction = activeGenre === 'action';
      if (isAction) {
        beamGrad.addColorStop(0, 'rgba(255, 120, 20, 0.1)');
        beamGrad.addColorStop(0.35, 'rgba(255, 160, 40, 0.035)');
        beamGrad.addColorStop(0.7, 'rgba(0, 180, 255, 0.012)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        beamGrad.addColorStop(0, 'rgba(245, 180, 60, 0.11)');
        beamGrad.addColorStop(0.4, 'rgba(230, 140, 30, 0.04)');
        beamGrad.addColorStop(0.75, 'rgba(180, 100, 220, 0.015)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, width, height);

      // Render drifting dust & embers
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.x += p.vx + (mouseRef.current.x - 0.5) * 0.25;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(time * 3 + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeGenre]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* 1. HTML5 Canvas for real-time projector beam & embers */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* 2. Anamorphic Horizon Flare Beam at top junction */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-orange-500/70 via-amber-300/80 to-transparent shadow-[0_0_20px_rgba(255,107,0,0.6)]" />
        <div className="absolute -top-4 w-96 h-8 bg-gradient-to-r from-orange-500/30 via-amber-400/40 to-orange-500/30 blur-xl" />
      </div>

      {/* 3. Deep Cinematic Ambient Backlights tuned to active genre */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 ${
          activeGenre === 'action'
            ? 'bg-gradient-to-b from-orange-500/15 via-amber-500/8 to-cyan-500/5'
            : 'bg-gradient-to-b from-amber-500/18 via-yellow-600/8 to-purple-600/5'
        }`}
      />

      {/* 4. Film grain tactile texture simulation */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #fff 10%, transparent 11%)`,
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 2px 2px',
        }}
      />
    </div>
  );
}
