import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Code,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Layers,
  Sparkles,
  Cpu,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  X,
  Sliders,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { videoManager } from '../utils/videoManager';

gsap.registerPlugin(ScrollTrigger);

const ARTISAN_BEADFIT_SNIPPET = `import React, { useState, useMemo } from 'react';
import { BeadSlot, CanvasPreview, PricingEngine } from './components';
import type { BeadConfig, BraceletState } from './types';

export const ArtisanBeadfitCustomizer: React.FC = () => {
  const [wristSizeCm, setWristSizeCm] = useState<number>(18.5);
  const [selectedPattern, setSelectedPattern] = useState<BeadConfig[]>([]);

  // Compute maximum bead capacity from wrist circumference
  const maxCapacity = useMemo(() => {
    return Math.floor((wristSizeCm * 10) / 8.5);
  }, [wristSizeCm]);

  const subtotal = useMemo(() => {
    const baseCraftsmanship = 45.00;
    return selectedPattern.reduce((sum, bead) => sum + bead.unitPrice, baseCraftsmanship);
  }, [selectedPattern]);

  const handleAddBead = (bead: BeadConfig) => {
    if (selectedPattern.length >= maxCapacity) return;
    setSelectedPattern((prev) => [...prev, bead]);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
      <CanvasPreview
        pattern={selectedPattern}
        wristSize={wristSizeCm}
        maxSlots={maxCapacity}
      />
      <PricingEngine
        wristSize={wristSizeCm}
        onWristChange={setWristSizeCm}
        onAddBead={handleAddBead}
        totalPrice={subtotal}
      />
    </div>
  );
};`;

const FEATURES = [
  {
    icon: Sliders,
    title: 'Real-Time Geometric Canvas',
    desc: 'Dynamic loop calculation rendering beads in a precise geometric circle based on exact wrist measurements (15cm – 22cm).',
    metric: '60 FPS 2D Math',
  },
  {
    icon: ShoppingBag,
    title: 'Live Capacity & Pricing Engine',
    desc: 'Automatic constraint validator preventing bead overflow while instantly computing subtotal, spacer discounts, and taxes.',
    metric: 'Instant Subtotal Sync',
  },
  {
    icon: Smartphone,
    title: 'Mobile-Optimized Touch UX',
    desc: 'Designed with a luxury dark theme, fluid drag-and-drop slots, and haptic-feeling feedback for mobile buyers.',
    metric: '100% Touch Responsive',
  },
  {
    icon: Cpu,
    title: 'Rapid Client Mockup Turnaround',
    desc: 'Demonstrating how I transform rough client wireframes and product concepts into fully functioning web prototypes in 1–5 days depending on the complexity.',
    metric: '1–5 Day Delivery',
  },
];

export default function ArtisanBeadfitShowcase() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const unregister = videoManager.register('artisan-beadfit-showcase', {
      play: () => {
        if (videoRef.current) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
    });

    return () => unregister();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isPlaying) {
          videoManager.requestPause('artisan-beadfit-showcase');
        }
      },
      { threshold: 0.1 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [isPlaying]);

  // GSAP 3D Entrance for Artisan Beadfit Showcase (matching Bento physics)
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header reveal with kinetic de-blur
      gsap.fromTo(
        '.beadfit-header',
        { opacity: 0, y: 35, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            once: true,
          },
        }
      );

      // 2. Main video showcase container hardware reveal
      gsap.fromTo(
        '.beadfit-showcase-container',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.beadfit-showcase-container',
            start: 'top 85%',
            once: true,
          },
          onComplete: () => {
            const showcaseEl = document.querySelector('.beadfit-showcase-container');
            if (showcaseEl) gsap.set(showcaseEl, { clearProps: 'transform' });
          },
        }
      );

      // 3. Feature cards batch reveal with neon activation
      ScrollTrigger.batch('.beadfit-feature-card', {
        start: 'top 88%',
        once: true,
        onEnter: (batchElements) => {
          gsap.fromTo(
            batchElements,
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.06,
              ease: 'power3.out',
              overwrite: true,
              onComplete: () => {
                batchElements.forEach((cEl) => {
                  cEl.classList.add('neon-active');
                  gsap.set(cEl, { clearProps: 'transform' });
                });
              },
            }
          );
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (!duration && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const togglePlay = () => {
    if (isPlaying) {
      videoManager.requestPause('artisan-beadfit-showcase');
    } else {
      videoManager.requestPlay('artisan-beadfit-showcase');
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(ARTISAN_BEADFIT_SNIPPET);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      // fallback
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section
      id="web-apps"
      ref={containerRef}
      className="relative w-full bg-transparent pt-20 pb-28 sm:pb-36 px-4 sm:px-6 md:px-10 lg:px-14 overflow-hidden z-10"
    >
      {/* 0. Continuous Architectural Transition Conduit from Bento */}
      <div className="absolute top-0 inset-x-0 h-24 pointer-events-none z-10 flex flex-col items-center">
        <div className="w-[1px] h-16 bg-gradient-to-b from-orange-500/70 via-amber-400/30 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_#ff6b00] animate-pulse -mt-1" />
      </div>

      {/* 1. Continuous Cybernetic Blueprint Dot Grid & Line Overlay */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_96%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_96%)]" />

      {/* 2. Ambient Warm Light Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12 sm:space-y-14">
        {/* Cybernetic HUD Telemetry */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pb-2 select-none border-b border-white/[0.05]">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
            <span>SEC: 02_WEB_ENGINEERING_DECK</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">CANVAS_2D • REAL-TIME GEOMETRY • REACT 18</span>
          <span className="text-orange-400/90 font-medium">LIVE DEMO // 1080P</span>
        </div>
        
        {/* Section Header */}
        <div className="beadfit-header flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.07] pb-8 relative">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/25 text-orange-400 text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span>Phase 02 • Production Web Engineering &amp; Client Mockup</span>
            </div>
            <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Artisan Beadfit: Custom Bracelet Builder &amp; Store
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-sans">
              A full-featured web application and interactive client prototype engineered by Allen. Demonstrating dynamic trigonometric canvas layouts, real-time constraint solvers, and high-converting e-commerce experiences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowSourceModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-400/40 text-neutral-200 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Code className="w-4 h-4 text-orange-400" />
              <span>Inspect TSX Code</span>
            </button>

            <a
              href="mailto:allenolavidez@gmail.com?subject=Web%20App%20Development%20Inquiry%20-%20Allen"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold font-sans transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span>Request Web Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Hero Video Player Showcase */}
        <div className="beadfit-showcase-container bento-card neon-active glass-card relative rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_80px_rgba(0,0,0,0.85)] group">
          {/* 16:9 Aspect Ratio Container */}
          <div className="relative aspect-video w-full max-h-[680px] bg-black">
            <video
              ref={videoRef}
              src="/artisan_beadfit_web.mp4"
              poster="/artisan_beadfit_poster.webp"
              preload="none"
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
              onError={(e) => {
                if (e.target.src !== window.location.origin + '/artisan_beadfit_demo.mp4') {
                  e.target.src = '/artisan_beadfit_demo.mp4';
                  e.target.load();
                }
              }}
              className="w-full h-full object-cover"
            />

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35 group/overlay"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,107,0,0.4)] group-hover/overlay:border-orange-400 group-hover/overlay:bg-orange-500/20 transition-all"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white translate-x-1" />
                </motion.div>
                <div className="mt-4 text-center">
                  <p className="text-white font-syne font-bold text-base sm:text-lg">Click to Play Interactive Walkthrough</p>
                  <p className="text-neutral-400 text-xs font-mono mt-1">Desktop 1080p • 60 FPS Video Demo</p>
                </div>
              </div>
            )}

            {/* Top HUD Telemetry */}
            <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between gap-3 pointer-events-none z-20">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-[11px] font-mono text-neutral-200 flex items-center gap-1.5 shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>Artisan Beadfit Demo • 1920×1080 Full HD</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 border border-white/15 text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Cycle Playback Speed"
                >
                  {playbackSpeed}x
                </button>
                <button
                  type="button"
                  onClick={() => setIsTheaterOpen(true)}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Expand Fullscreen Theater View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom HUD Controls */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 pt-12 space-y-3 z-20">
              {/* Timeline Scrubber */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="text-white font-medium">{formatTime(currentTime)}</span>
                  <span className="text-orange-400 uppercase tracking-wider font-semibold">Live Prototype Demo</span>
                  <span>{formatTime(duration || 60)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek time"
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                />
              </div>

              {/* Play / Mute / Details Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black transition-all cursor-pointer shadow-lg active:scale-95"
                    title={isPlaying ? 'Pause Demo' : 'Play Demo'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
                  </button>

                  <div className="hidden sm:block">
                    <p className="text-xs font-mono text-neutral-300">
                      React 18 • TypeScript • Tailwind CSS • Canvas 2D
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                    Client Mockup Architecture
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="beadfit-feature-card bento-card glass-card p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-orange-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center text-orange-400 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-syne font-bold text-base text-white tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-orange-400 font-semibold">
                    {feat.metric}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow Banner: How I Turn Client Ideas into Working Prototypes */}
        <div className="bento-card glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span>Client Prototyping Process</span>
            </span>
            <h3 className="font-syne font-bold text-xl sm:text-2xl text-white">
              Need an interactive web mockup or MVP built for your business?
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed font-sans">
              I take your raw concept, sketch, or Figma file and deliver an interactive, responsive web prototype ready for user testing, client presentations, or full deployment.
            </p>
          </div>

          <a
            href="mailto:allenolavidez@gmail.com?subject=Custom%20Web%20App%20/%20Mockup%20Inquiry%20for%20Allen&body=Hi%20Allen,%0A%0AI%20saw%20your%20Artisan%20Beadfit%20web%20app%20showcase%20and%20would%20like%20to%20discuss%20a%20project:%0A%0A-%20Project%20Concept:%0A-%20Timeline:%0A-%20Budget:"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-95 shrink-0"
          >
            <span>Inquire About Web Development</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Continuous Pipeline Connector flowing into Phase 03 Cinematic Studio */}
        <div className="pt-6 flex flex-col items-center justify-center pointer-events-none relative z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono text-neutral-400 backdrop-blur-md shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Advancing to Phase 03</span>
            <span className="text-orange-400 font-bold">▶</span>
            <span className="text-white font-medium">1440p Cinematic Directing &amp; AI Studio</span>
          </div>
          <div className="w-[1px] h-14 bg-gradient-to-b from-orange-500/70 via-red-500/30 to-transparent mt-2.5" />
        </div>

      </div>

      {/* Seamless Bottom Gradient Dissolve into Cinematic Studio */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#050508]/50 to-[#050508] pointer-events-none z-10" />

      {/* Fullscreen Theater Modal */}
      {isTheaterOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6"
            onClick={() => setIsTheaterOpen(false)}
          >
            <div
              className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="font-syne font-bold text-sm sm:text-base text-white">
                    Artisan Beadfit — Fullscreen Theater Preview
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTheaterOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black">
                <video
                  src="/artisan_beadfit_demo.mp4"
                  poster="/artisan_beadfit_poster.webp"
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* TypeScript Source Code Modal */}
      {showSourceModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
            onClick={() => setShowSourceModal(false)}
          >
            <div
              className="relative w-full max-w-3xl bg-[#0a0a0f] rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-400/20">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono text-xs sm:text-sm font-bold text-white">
                      ArtisanBeadfitCustomizer.tsx
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400">
                      Interactive Bracelet Customizer &amp; E-Commerce Web App
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs font-mono transition-colors cursor-pointer border border-white/10"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSourceModal(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Close Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 sm:p-6 overflow-y-auto font-mono text-xs text-neutral-300 leading-relaxed bg-black/60 scrollbar-thin">
                <pre className="text-emerald-400/90 whitespace-pre-wrap selection:bg-orange-500/30">
                  {ARTISAN_BEADFIT_SNIPPET}
                </pre>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-neutral-400">
                <div>
                  <span className="text-neutral-300 font-semibold">Architecture / Stack:</span>{' '}
                  <span className="text-orange-400">React 18 • TypeScript • Tailwind CSS • Canvas 2D</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                    Interactive 2D Canvas
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                    Dynamic Sizing Math
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                    Live Pricing
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Seamless Luminous Energy Conduit Flowing into Cinematic Studio */}
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none z-10 flex flex-col items-center justify-end">
        <div className="w-[1px] h-16 bg-gradient-to-b from-orange-500/50 via-red-500/40 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
      </div>
    </section>
  );
}
