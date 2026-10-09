import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Zap,
  Film,
  Sparkles,
  Clapperboard,
  Sliders,
  X,
  Camera,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CinematicAtmosphere from './cinematic/CinematicAtmosphere';
import { soundEngine } from '../utils/soundEngine';
import { videoManager } from '../utils/videoManager';

gsap.registerPlugin(ScrollTrigger);

// 1440p Cinematic Clips directed by Allen
const CINEMATIC_CLIPS = [
  {
    id: 'action',
    title: 'High-Velocity Action & VFX Sequence',
    badge: 'Action Reel',
    genre: 'AI Action Choreography',
    ratio: '16:9 Cinema Widescreen',
    res: '1440p QHD',
    fps: '30 FPS',
    bitrate: '38 Mbps',
    colorSpace: 'Rec.709 Cinematic LUT',
    src: '/action_clip_web.mp4',
    poster: '/action_poster.webp',
    fallbackSrc: '/action_clip_web.mp4',
    synopsis:
      'High-speed camera movement, explosive visuals, dynamic speed ramping, and custom multi-layer sound design.',
    directingNotes: [
      {
        phase: '01. Motion & Camera Work',
        tool: 'Google Flow • Google Veo',
        desc: 'Directing fast camera tracking, smooth motion, and realistic physics across action scenes.',
      },
      {
        phase: '02. Pacing & Dynamic Cuts',
        tool: 'CapCut Desktop • Premiere Pro',
        desc: 'Speed ramping, seamless beat-matched cuts, and rhythm that builds cinematic excitement.',
      },
      {
        phase: '03. Sound Design & Color Grading',
        tool: 'After Effects • Custom Sound FX',
        desc: 'Deep impact risers, punchy sound effects, spatial audio, and cinematic color grading.',
      },
    ],
    toolsList: ['Google Flow', 'Google Veo', 'Adobe Premiere Pro', 'CapCut Desktop', 'After Effects', 'Custom Sound FX'],
  },
  {
    id: 'drama',
    title: 'Cinematic Narrative & Atmospheric Drama',
    badge: 'Dramatic Film',
    genre: 'AI Narrative & Visual Storytelling',
    ratio: '16:9 Cinema Widescreen',
    res: '1440p QHD',
    fps: '60 FPS',
    bitrate: '45 Mbps',
    colorSpace: 'Film Stock Emulation 35mm',
    src: '/drama_clip_web.mp4',
    poster: '/drama_poster.webp',
    fallbackSrc: '/drama_clip_web.mp4',
    synopsis:
      'Atmospheric lighting, expressive character emotion, subtle facial details, and cinematic audio.',
    directingNotes: [
      {
        phase: '01. Cinematic Lighting & Mood',
        tool: 'Google Flow • Google Veo',
        desc: 'Sculpting soft rim lighting, atmospheric haze, deep contrast, and natural skin tones.',
      },
      {
        phase: '02. Character Expression & Emotion',
        tool: 'Generative Motion Prompting',
        desc: 'Guiding slow-burn narrative pacing, intimate close-ups, and natural facial expressions.',
      },
      {
        phase: '03. Film Texture & Master Audio',
        tool: 'Premiere Pro • After Effects • CapCut',
        desc: '35mm film grain, widescreen letterboxing, ambient soundtrack, and balanced audio mix.',
      },
    ],
    toolsList: ['Google Flow', 'Google Veo', 'CapCut Desktop', 'Adobe Premiere Pro', 'After Effects', 'Color Grading'],
  },
];

export default function CinematicShowcase() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [activeClip, setActiveClip] = useState(CINEMATIC_CLIPS[0]);
  const [isPlaying, setIsPlaying] = useState(false); // Paused by default to prevent page lag
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Register with global video coordinator
  useEffect(() => {
    const unregister = videoManager.register('cinematic-studio', {
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

  // Auto-hide HUD on idle during playback
  useEffect(() => {
    let timeoutId;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      if (isPlaying) {
        timeoutId = setTimeout(() => setShowControls(false), 3500);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
    };
  }, [isPlaying]);

  // Pause video decoding when section is scrolled out of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isPlaying) {
          videoManager.requestPause('cinematic-studio');
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isPlaying]);

  // GSAP 3D Entrance for Cinematic Showcase (matching portfolio physics)
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header reveal with kinetic de-blur
      gsap.fromTo(
        '.cinematic-header',
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

      // 2. Main video monitor hardware reveal
      gsap.fromTo(
        '.cinematic-monitor-container',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cinematic-monitor-container',
            start: 'top 85%',
            once: true,
          },
          onComplete: () => {
            const el = document.querySelector('.cinematic-monitor-container');
            if (el) gsap.set(el, { clearProps: 'transform' });
          },
        }
      );

      // 3. Directing notes cards batch reveal with neon activation
      ScrollTrigger.batch('.cinematic-stage-card', {
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

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (!duration && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  // Video scrub slider handler
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekVal = parseFloat(e.target.value);
    videoRef.current.currentTime = seekVal;
    setCurrentTime(seekVal);
  };

  // Switch between Action and Drama with zero visual glitch
  const switchClip = (clip) => {
    if (activeClip.id === clip.id) return;
    setActiveClip(clip);
    if (videoRef.current) {
      if (clip.poster) {
        videoRef.current.poster = clip.poster;
      }
      videoRef.current.src = clip.src;
      videoRef.current.load();
      if (isPlaying) {
        videoManager.requestPlay('cinematic-studio');
      }
    }
  };

  // Play/Pause toggle with centralized video coordinator
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoManager.requestPause('cinematic-studio');
    } else {
      videoManager.requestPlay('cinematic-studio');
    }
  };

  // Mute/Unmute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Speed cycle: 0.5x -> 1x -> 1.5x -> 2x
  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  // Format seconds to SMPTE style MM:SS:FF
  const formatSMPTE = (seconds) => {
    if (isNaN(seconds)) return '00:00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 30);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}:${f < 10 ? '0' : ''}${f}`;
  };

  // Keyboard Shortcuts for Director's Deck
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const rect = containerRef.current?.getBoundingClientRect();
      const isNearSection = rect && rect.top < window.innerHeight && rect.bottom > 0;
      if (!isNearSection && !isTheaterOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        soundEngine.playClick();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        soundEngine.playClick();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        soundEngine.playClick();
        setIsTheaterOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isTheaterOpen]);

  return (
    <section
      id="cinematics"
      ref={containerRef}
      className="relative w-full bg-transparent pt-20 pb-28 sm:pb-36 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden transition-colors duration-700 z-10"
    >
      {/* 0. Continuous Ingress Conduit from Artisan Beadfit */}
      <div className="absolute top-0 inset-x-0 h-24 pointer-events-none z-10 flex flex-col items-center">
        <div className="w-[1px] h-14 bg-gradient-to-b from-orange-500/50 via-red-500/30 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse -mt-1" />
      </div>

      {/* 1. Continuous Cybernetic Blueprint Dot Grid & Ambient Atmosphere */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_50%,transparent_96%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_50%,transparent_96%)]" />

      {/* Live Interactive Cinema Atmosphere (Canvas embers, volumetric projector beam & responsive ambilight) */}
      <CinematicAtmosphere activeGenre={activeClip.id} />

      <div className="max-w-7xl mx-auto relative z-40 space-y-10 sm:space-y-12">
        {/* Cybernetic HUD Telemetry */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pb-2 select-none border-b border-white/[0.05]">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
            <span>SEC: 03_CINEMATIC_STUDIO</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">1440P QHD MASTER • GOOGLE FLOW &amp; VEO • PREMIERE PRO</span>
          <span className="text-red-400/90 font-medium">REC: MASTER_GRADE</span>
        </div>

        {/* SECTION HEADER */}
        <div className="cinematic-header flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.07] relative z-10">
          <div className="space-y-4 max-w-3xl">
            {/* The Badge: Elevated with Red Studio Tally Lamp, Waveform & Holographic Border */}
            <div className="group relative inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full bg-black/60 border border-orange-400/35 backdrop-blur-xl shadow-[0_0_25px_rgba(255,107,0,0.2)] hover:border-orange-400/70 hover:shadow-[0_0_35px_rgba(255,107,0,0.4)] transition-all duration-300 overflow-hidden">
              {/* Shimmer light sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              {/* Pulsing Studio Tally Lamp (RED Camera style) */}
              <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </span>

              <Clapperboard className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
              <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-white whitespace-nowrap">
                Cinematic AI &amp; Directing Studio
              </span>
              <span className="text-orange-500/50">•</span>

              {/* Live Playback Waveform Activity Bars */}
              <div className="hidden xs:flex items-center gap-0.5 h-3 px-1.5 py-0.5 rounded bg-black/50 border border-white/10 shrink-0">
                <span className={`w-0.5 rounded-full bg-orange-400 transition-all ${isPlaying ? 'animate-music-bar-1' : 'h-1 opacity-40'}`} />
                <span className={`w-0.5 rounded-full bg-amber-300 transition-all ${isPlaying ? 'animate-music-bar-2' : 'h-2 opacity-40'}`} />
                <span className={`w-0.5 rounded-full bg-orange-400 transition-all ${isPlaying ? 'animate-music-bar-3' : 'h-1.5 opacity-40'}`} />
              </div>

              <span className="text-[11px] sm:text-xs font-mono text-orange-300 tracking-wider font-semibold whitespace-nowrap">
                1440p QHD Master
              </span>
            </div>

            <h2 className="font-syne font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
              Dynamic Action. <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent">
                Atmospheric Storytelling.
              </span>
            </h2>

            <p className="text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed font-sans max-w-2xl">
              Creating high-definition AI cinematic videos with dynamic camera motion, custom visual effects, clean pacing, and professional sound design.
            </p>
          </div>

          {/* Interactive Controls Bar: Aspect Scope + Theater Dimmer + Mode Switcher */}
          {/* Segmented Mode Switcher (Action vs Drama) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shrink-0 self-start md:self-end">
            {CINEMATIC_CLIPS.map((clip) => {
              const isSelected = activeClip.id === clip.id;
              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => switchClip(clip)}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-xl shadow-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {clip.id === 'action' ? (
                    <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-orange-400'}`} />
                  ) : (
                    <Film className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-300'}`} />
                  )}
                  <span>{clip.badge}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/10 text-neutral-800'
                        : 'bg-white/5 text-neutral-500'
                    }`}
                  >
                    {clip.res}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 16:9 Widescreen Cinema Monitor */}
        <div className="cinematic-monitor-container bento-card neon-active glass-card relative rounded-[32px] p-2 sm:p-3 bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.85)] transition-all duration-700 group">
          {/* Outer Ambient Back-glow tuned to video and active genre */}
          <div
            className={`absolute -inset-2 rounded-[36px] blur-3xl opacity-60 group-hover:opacity-85 transition-all duration-700 pointer-events-none -z-10 ${
              activeClip.id === 'action'
                ? 'bg-gradient-to-r from-orange-500/35 via-amber-500/25 to-cyan-500/20'
                : 'bg-gradient-to-r from-amber-500/35 via-yellow-500/20 to-purple-500/25'
            }`}
          />

          {/* Screen Container */}
          <div className="relative aspect-video w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-black flex flex-col justify-between">
            {/* Native Video Player */}
            <video
              ref={videoRef}
              src={activeClip.src}
              poster={activeClip.poster}
              preload="none"
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
              onError={(e) => {
                if (activeClip.fallbackSrc && e.target.src !== activeClip.fallbackSrc) {
                  e.target.src = activeClip.fallbackSrc;
                  e.target.load();
                }
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Cinematic Lens Flare & Soft Vignette Layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

            {/* Click-to-Play/Pause overlay hitbox */}
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 w-full h-full cursor-pointer z-10 flex items-center justify-center focus:outline-none"
              aria-label={isPlaying ? 'Pause film' : 'Play film'}
            >
              {/* Centered Large Play Button (Shown when paused) */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/75 border border-white/25 backdrop-blur-xl flex items-center justify-center shadow-2xl text-white hover:scale-110 transition-transform"
                  >
                    <Play className="w-9 h-9 sm:w-11 sm:h-11 translate-x-1 text-white fill-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* =====================================================================
                TOP DIRECTOR HUD OVERLAY
            ===================================================================== */}
            <div
              className={`relative z-20 p-4 sm:p-6 flex items-start justify-between gap-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Left Telemetry: REC state, Resolution, Bitrate */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-semibold tracking-wider">DIRECTOR'S CUT</span>
                </div>

                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-neutral-300">
                  <span>{activeClip.res}</span>
                  <span className="text-neutral-500">•</span>
                  <span>{activeClip.fps}</span>
                  <span className="text-neutral-500">•</span>
                  <span>{activeClip.bitrate}</span>
                </div>

                <div className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-orange-400">
                  {activeClip.colorSpace}
                </div>
              </div>

              {/* Right Telemetry: SMPTE Timecode & Theater Expand */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-xs font-mono text-emerald-400 tracking-widest hidden xs:inline-block">
                  {formatSMPTE(currentTime)}
                </div>

                <button
                  type="button"
                  onClick={() => setIsTheaterOpen(true)}
                  className="p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-white text-neutral-300 hover:text-black border border-white/15 backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
                  title="Expand Full Theater"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =====================================================================
                BOTTOM FLOATING CONTROL DOCK & SCRUBBER
            ===================================================================== */}
            <div
              className={`relative z-20 p-4 sm:p-6 pt-0 space-y-3 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Timeline Scrubber */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-white font-medium">{formatSMPTE(currentTime)}</span>
                  <span className="text-orange-400 uppercase tracking-widest text-[10px] hidden sm:inline">
                    {activeClip.ratio}
                  </span>
                  <span>{formatSMPTE(duration || 15)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek timeline"
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF6B00] hover:h-2 transition-all"
                />
              </div>

              {/* Dock Elements */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/70 border border-white/10 backdrop-blur-xl rounded-2xl p-3 sm:px-5">
                {/* Film title & sub-genre */}
                <div className="min-w-0">
                  <p className="font-syne font-bold text-sm sm:text-base text-white truncate">
                    {activeClip.title}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                    {activeClip.genre} • Directed by Allen
                  </p>
                </div>

                {/* Tactile Control Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Play/Pause */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause film' : 'Play film'}
                    className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  {/* Audio Mute / Unmute */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute film' : 'Mute film'}
                    className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-mono hidden md:inline">AUDIO ON</span>
                      </>
                    )}
                  </button>

                  {/* Playback Rate / Speed */}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      cycleSpeed();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono text-neutral-200 transition-colors cursor-pointer"
                    title="Toggle Speed (0.5x, 1x, 1.5x, 2x)"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
              </div>

              {/* Hotkey Pro Helper Strip */}
              <div className="hidden sm:flex items-center justify-between text-[10px] font-mono text-neutral-500 px-2 pt-1">
                <span className="flex items-center gap-2">
                  <span>Hotkeys:</span>
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-neutral-300">Space</span> Play
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-neutral-300">M</span> Mute
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-neutral-300">F</span> Theater
                </span>
                <span className="text-orange-400/80">Pro Studio Deck</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DIRECTOR'S PRODUCTION DOSSIER & THREE-STAGE PIPELINE MATRIX
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {activeClip.directingNotes.map((note, index) => (
            <div
              key={index}
              className="cinematic-stage-card bento-card glass-card rounded-2xl p-6 border border-white/10 hover:border-orange-500/35 transition-all duration-300 flex flex-col justify-between gap-4 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-orange-400 uppercase tracking-wider font-semibold">
                    {note.phase}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-400">
                    Stage {index + 1}
                  </span>
                </div>
                <h4 className="font-syne font-bold text-base text-white">
                  {note.tool}
                </h4>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  {note.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Production Verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specification Strip */}
        <div className="bento-card glass-card p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center shrink-0 text-orange-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-syne font-bold text-white text-sm sm:text-base">
                Creative &amp; Editing Tools
              </h4>
              <p className="text-xs text-neutral-400 font-mono">
                AI video generation, professional video editing software, and sound design
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeClip.toolsList.map((tool, tIdx) => (
              <span
                key={tIdx}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-neutral-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Seamless Bottom Gradient Dissolve into Footer */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-b from-transparent via-[#050508]/60 to-[#050508] pointer-events-none z-10" />

      {/* FULLSCREEN THEATER MODAL */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isTheaterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTheaterOpen(false)}
                className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[120] flex flex-col items-center justify-center p-4 sm:p-8"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-6xl w-full bg-[#0d0e12] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                >
                  <div className="p-4 sm:p-5 bg-black/80 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Film className="w-5 h-5 text-orange-400" />
                      <div>
                        <h3 className="font-syne font-bold text-white text-base sm:text-lg">
                          {activeClip.title}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400">
                          {activeClip.res} • {activeClip.fps} • {activeClip.ratio}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTheaterOpen(false)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Close Theater"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative aspect-video w-full bg-black">
                    <video
                      src={activeClip.src}
                      poster={activeClip.poster}
                      preload="metadata"
                      autoPlay
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        if (activeClip.fallbackSrc && e.target.src !== activeClip.fallbackSrc) {
                          e.target.src = activeClip.fallbackSrc;
                          e.target.load();
                          e.target.play().catch(() => {});
                        }
                      }}
                    />
                  </div>

                  <div className="p-4 sm:p-5 bg-black/80 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-neutral-400">
                    <span className="text-white">{activeClip.synopsis}</span>
                    <span className="text-orange-400 shrink-0 font-medium">{activeClip.toolsList.join(' • ')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Soft Bottom Transition landing into Footer */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-[#050508]/75 to-[#050508] pointer-events-none z-10" />
    </section>
  );
}
