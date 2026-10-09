import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, ArrowDown, Mouse, Film } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 480;
const INITIAL_BATCH_SIZE = 24;
const KEYFRAME_STEP = 6;
const WINDOW_BEFORE = 12;
const WINDOW_AFTER = 18;

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const loadingQueueRef = useRef(new Set());
  const currentFrameRef = useRef(1);
  const isVisibleRef = useRef(true);
  const [firstBatchLoaded, setFirstBatchLoaded] = useState(false);

  const loadFrame = (index) => {
    if (index < 1 || index > TOTAL_FRAMES) return;
    if (imagesRef.current[index] || loadingQueueRef.current.has(index)) return;

    loadingQueueRef.current.add(index);
    const img = new Image();
    img.src = `/frames/frame_${String(index).padStart(4, '0')}.webp?v=3`;
    img.onload = () => {
      loadingQueueRef.current.delete(index);
      imagesRef.current[index] = img;
      if (index === currentFrameRef.current && isVisibleRef.current) {
        renderFrame(index);
      }
    };
    img.onerror = () => {
      loadingQueueRef.current.delete(index);
    };
  };

  // Cache eviction to prevent memory ballooning during fast scrubs
  const pruneDistantFrames = (centerIndex) => {
    const keys = Object.keys(imagesRef.current);
    if (keys.length < 100) return;

    for (const key of keys) {
      const idx = Number(key);
      const isKeyframe = (idx % KEYFRAME_STEP === 1) || idx === 1 || idx === TOTAL_FRAMES;
      if (!isKeyframe && Math.abs(idx - centerIndex) > 35) {
        const img = imagesRef.current[idx];
        if (img) {
          img.onload = null;
          img.onerror = null;
          img.src = '';
        }
        delete imagesRef.current[idx];
      }
    }
  };

  const ensureFrameWindow = (centerIndex) => {
    const start = Math.max(1, centerIndex - WINDOW_BEFORE);
    const end = Math.min(TOTAL_FRAMES, centerIndex + WINDOW_AFTER);
    for (let i = start; i <= end; i++) {
      if (!imagesRef.current[i]) {
        loadFrame(i);
      }
    }
    if (centerIndex % 8 === 0) {
      pruneDistantFrames(centerIndex);
    }
  };

  // Render a specific frame on canvas with aspect-ratio cover
  const renderFrame = (frameIndex) => {
    if (!isVisibleRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[frameIndex];

    // If target frame is not ready, find nearest loaded frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      let nearestDist = Infinity;
      let nearestImg = null;

      for (const key in imagesRef.current) {
        const candidate = imagesRef.current[key];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          const dist = Math.abs(Number(key) - frameIndex);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestImg = candidate;
          }
        }
      }
      img = nearestImg;
    }

    if (!img) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    // Object-fit: cover calculation
    const scale = Math.max(w / imgW, h / imgH);
    const x = (w - imgW * scale) / 2;
    const y = (h - imgH * scale) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, x, y, imgW * scale, imgH * scale);
  };

  const updateCanvasDimensions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
    }

    renderFrame(currentFrameRef.current);
  };

  useEffect(() => {
    let isCancelled = false;

    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        renderFrame(currentFrameRef.current);
      }
    }, { threshold: 0.02 });

    if (containerRef.current) {
      io.observe(containerRef.current);
    }

    const loadInitialBatch = async () => {
      updateCanvasDimensions();

      const initialPromises = [];
      for (let i = 1; i <= Math.min(INITIAL_BATCH_SIZE, TOTAL_FRAMES); i++) {
        initialPromises.push(
          new Promise((resolve) => {
            const img = new Image();
            img.src = `/frames/frame_${String(i).padStart(4, '0')}.webp?v=3`;
            img.onload = () => {
              if (!isCancelled) {
                imagesRef.current[i] = img;
                if (i === 1) renderFrame(1);
              }
              resolve(true);
            };
            img.onerror = () => resolve(false);
          })
        );
      }

      await Promise.all(initialPromises);

      if (isCancelled) return;
      setFirstBatchLoaded(true);
      renderFrame(1);

      // Preload sparse anchor keyframes in the background
      const keyframes = [];
      for (let i = INITIAL_BATCH_SIZE + 1; i <= TOTAL_FRAMES; i++) {
        if (i % KEYFRAME_STEP === 1 || i === TOTAL_FRAMES) {
          keyframes.push(i);
        }
      }

      let kIdx = 0;
      const loadNextKeyframeChunk = () => {
        if (isCancelled || kIdx >= keyframes.length) return;
        const chunk = keyframes.slice(kIdx, kIdx + 6);
        chunk.forEach(f => loadFrame(f));
        kIdx += 6;
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            if (!isCancelled) loadNextKeyframeChunk();
          }, { timeout: 200 });
        } else {
          setTimeout(loadNextKeyframeChunk, 80);
        }
      };

      setTimeout(loadNextKeyframeChunk, 100);
    };

    loadInitialBatch();

    // Mobile address bar height-only resize prevention
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      updateCanvasDimensions();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      io.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 2. GSAP ScrollTrigger Animation Effect
  useEffect(() => {
    if (!firstBatchLoaded || !containerRef.current) return;

    const frameObj = { frame: 1 };

    const ctx = gsap.context(() => {
      // Scrub frames 1 to 480 across the entire section
      gsap.to(frameObj, {
        frame: TOTAL_FRAMES,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
          onUpdate: (self) => {
            const frameIndex = Math.min(
              TOTAL_FRAMES,
              Math.max(1, Math.round(frameObj.frame))
            );
            if (frameIndex !== currentFrameRef.current) {
              currentFrameRef.current = frameIndex;
              ensureFrameWindow(frameIndex);
              renderFrame(frameIndex);
            }
          },
        },
      });

      // Dual-pill mission tracker activation (01 Executive & Creative VA -> 02 Operations & Systems)
      gsap.to('.hero-pill-tab-1', {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: 'transparent',
        color: 'rgba(163, 163, 163, 0.7)',
        boxShadow: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '40% top',
          end: '48% top',
          scrub: true,
        },
      });

      gsap.to('.hero-pill-tab-2', {
        backgroundColor: 'rgba(249, 115, 22, 0.22)',
        borderColor: 'rgba(251, 146, 60, 0.45)',
        color: 'rgba(254, 215, 170, 1)',
        boxShadow: '0 0 25px rgba(249, 115, 22, 0.3)',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '42% top',
          end: '50% top',
          scrub: true,
        },
      });

      // Phase 1 narrative fade out as camera focuses on the orange tie
      gsap.to('.hero-phase-1', {
        opacity: 0,
        y: -30,
        pointerEvents: 'none',
        ease: 'power1.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '36% top',
          end: '45% top',
          scrub: true,
        },
      });

      // Phase 2 narrative fade in as we dive inside the tie into the neural graph
      gsap.fromTo(
        '.hero-phase-2',
        { opacity: 0, y: 30, pointerEvents: 'none' },
        {
          opacity: 1,
          y: 0,
          pointerEvents: 'auto',
          ease: 'power1.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: '44% top',
            end: '52% top',
            scrub: true,
          },
        }
      );

      // Phase 2 fade out as neural network settles — leaving the canvas completely clean for the handoff to Bento
      gsap.to('.hero-phase-2', {
        opacity: 0,
        y: -30,
        pointerEvents: 'none',
        ease: 'power1.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '84% top',
          end: '94% top',
          scrub: true,
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [firstBatchLoaded]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ height: '1400vh' }}
    >
      {/* Sticky 100vh Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex flex-col justify-between">
        
        {/* Canvas Container (Zero CSS filter overhead for instant GPU blitting) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover block"
          />
        </div>

        {/* Poster Image: visible until first 30 frames load */}
        <div
          className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-1000 pointer-events-none ${
            firstBatchLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img
            src="/video-poster.webp?v=2"
            alt="Hero Video Poster"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Visual Overlay Layers */}
        {/* 1. Global Darken: bg-black/10 */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none z-20" />

        {/* 2. Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* 3. Bottom Gradient: blended with warm neural transition into Bento section */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FF6B00]/15 via-transparent to-transparent pointer-events-none z-20" />

        {/* UI Content Layer */}
        <div className="relative z-30 h-full w-full flex flex-col justify-between p-4 sm:p-8 md:p-14 pb-8 sm:pb-10 md:pb-14 pointer-events-none">
          
          {/* Top Bar: Brand Logo on Left, Center Segmented Tracker, Vertical Stack Links on Right */}
          <div className="w-full flex items-start justify-between">
            {/* Top Left: Personal Monogram / Logo */}
            <div className="pointer-events-auto flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/50 overflow-hidden">
                <img
                  src="/allen_logo.svg"
                  alt="Allen Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-syne font-bold text-lg tracking-wider text-white">
                ALLEN
              </span>
            </div>

            {/* Top Center: Segmented Phase Controller */}
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl text-[11px] font-mono tracking-wider">
              <div className="hero-pill-tab-1 flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 bg-white/15 text-white shadow-sm border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                <span className="font-medium whitespace-nowrap">01 Creative &amp; Executive VA</span>
              </div>
              <div className="hero-pill-tab-2 flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 text-neutral-400 border border-transparent">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                <span className="font-medium whitespace-nowrap">02 AI Agent &amp; System Design</span>
              </div>
            </div>

            {/* Top Right: Direct Hire & Email Action Stack */}
            <div className="pointer-events-auto flex flex-col items-end gap-2.5">
              <a
                href="#about"
                aria-label="Direct Hire Availability"
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#FF6B00]/15 backdrop-blur-md border border-white/15 hover:border-[#FF6B00]/40 text-white/90 hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(255,107,0,0.25)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium tracking-wide">Available for Hire</span>
              </a>

              <a
                href="mailto:allenolavidez@gmail.com"
                aria-label="Send Email"
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#FF6B00]/15 backdrop-blur-md border border-white/15 hover:border-[#FF6B00]/40 text-white/80 hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(255,107,0,0.25)]"
              >
                <span className="text-xs font-medium tracking-wide">allenolavidez@gmail.com</span>
                <Mail className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:text-[#FF6B00]" />
              </a>
            </div>
          </div>

          {/* Bottom Bar: Multi-Phase Storytelling (Phase 1 & Phase 2 absolute overlays) */}
          <div className="relative w-full min-h-[240px] sm:min-h-[220px] md:min-h-[240px]">
            
            {/* PHASE 1: Executive & Creative Operations Partner (Frames 1 - 240) */}
            <div className="hero-phase-1 absolute inset-x-0 bottom-0 w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 pointer-events-auto transition-transform duration-300">
              {/* Bottom-left: Refined title card */}
              <div className="w-fit max-w-full sm:max-w-xl lg:max-w-2xl text-center lg:text-left p-4 sm:p-5 lg:p-6 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 pointer-events-auto">
                <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF8C33] text-[10px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest mb-2.5 backdrop-blur-md shadow-sm max-w-full">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF6B00] animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Creative &amp; Executive VA • AI Agent Builder • System Design</span>
                  <span className="sm:hidden">Creative &amp; Executive VA • AI Agent Builder</span>
                </div>
                <h1 className="font-syne font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-[2.15rem] xl:text-[2.45rem] tracking-tight text-white leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                  <span className="whitespace-normal sm:whitespace-nowrap text-white">Executive VA &amp;</span>
                  <br />
                  <span className="whitespace-normal sm:whitespace-nowrap bg-gradient-to-r from-white via-neutral-100 to-orange-200 bg-clip-text text-transparent">
                    AI Systems Architect
                  </span>
                </h1>

                {/* 3 Core Engagement Tracks for Instant Client Clarity */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-[11px] font-mono text-orange-200">
                    01 Creative &amp; Executive VA
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-neutral-200">
                    02 AI Agent Builder &amp; System Design
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-[11px] font-mono text-orange-200">
                    03 Media Systems &amp; AI Cinema
                  </span>
                </div>
              </div>

              {/* Bottom-right: Description + Animated Scroll Indicator */}
              <div className="hidden sm:flex flex-col items-center lg:items-end text-center lg:text-right max-w-sm lg:max-w-xs xl:max-w-sm gap-3 p-4 sm:p-5 lg:p-6 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/80 pointer-events-auto self-center lg:self-auto">
                <p className="text-xs sm:text-sm text-neutral-100 font-normal leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  Architecting autonomous multi-agent systems, managing executive operations, producing high-retention video, and building rapid web apps with 4 years of enterprise reliability.
                </p>

                {/* Scroll Indicator: Mouse icon on mobile, Arrow on desktop */}
                <div className="flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/35 backdrop-blur-md text-orange-200 shadow-lg shadow-orange-500/15 max-w-full">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-mono truncate">
                    Scroll to explore
                  </span>
                  <span className="md:hidden animate-bounce text-orange-400 shrink-0">
                    <Mouse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <span className="hidden md:inline-flex animate-bounce text-orange-400 shrink-0">
                    <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* PHASE 2: Dive into the Orange Tie -> Neural Network (Frames 241 - 480) */}
            <div className="hero-phase-2 absolute inset-x-0 bottom-0 w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 pointer-events-none opacity-0 transition-transform duration-300">
              {/* Bottom-left: Refined glass plate */}
              <div className="w-fit max-w-full sm:max-w-xl lg:max-w-2xl text-center lg:text-left p-4 sm:p-5 lg:p-6 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-300 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-2.5 backdrop-blur-md max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="hidden sm:inline">AI Agent Systems &amp; Autonomous Operations</span>
                  <span className="sm:hidden">AI Systems &amp; Ops</span>
                </div>
                <h2 className="font-syne font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-[2.15rem] xl:text-[2.45rem] tracking-tight text-white leading-[1.1]">
                  <span className="whitespace-normal sm:whitespace-nowrap text-white">Full-Stack</span>
                  <br />
                  <span className="whitespace-normal sm:whitespace-nowrap bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-100 bg-clip-text text-transparent">
                    System Design.
                  </span>
                </h2>
                {/* Capability badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-3">
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/20 text-xs font-mono text-orange-200">
                    AI Agent Builder &amp; System Design
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-xs font-mono text-amber-200">
                    Creative &amp; Executive VA
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
                    Podcast &amp; Short-Form Editing
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
                    Programmatic Video Pipelines
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
                    Cinematic AI Directing
                  </span>
                </div>
              </div>

              {/* Bottom-right: Refined description & clean CTA */}
              <div className="hidden sm:flex flex-col items-center lg:items-end text-center lg:text-right max-w-sm lg:max-w-xs xl:max-w-sm gap-3.5 p-4 sm:p-5 lg:p-6 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto self-center lg:self-auto">
                <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
                  From designing custom AI agent swarms and automating operational pipelines to programmatic video rendering and web mockups, I engineer high-leverage business systems with zero micromanagement.
                </p>

                {/* Clean Scroll Indicators */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <a
                    href="#about"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all text-xs font-mono tracking-wider shadow-lg"
                  >
                    <span>Workflows &amp; Skills</span>
                    <ArrowDown className="w-3.5 h-3.5 text-orange-400" />
                  </a>
                  <a
                    href="#cinematics"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/30 text-orange-200 transition-all text-xs font-mono tracking-wider shadow-lg"
                  >
                    <span>Studio</span>
                    <Film className="w-3.5 h-3.5 text-orange-400" />
                  </a>
                </div>
              </div>
            </div>



          </div>

          {/* Seamless Volumetric Transition Veil into Bento Matrix (z-10 so text is never occluded) */}
          <div className="absolute -bottom-1 inset-x-0 h-44 bg-gradient-to-b from-transparent via-[#050507]/80 to-[#050507] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/15 blur-3xl pointer-events-none -z-10" />
        </div>

      </div>
    </section>
  );
}
