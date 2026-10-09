import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const START_FRAME = 480;
const END_FRAME = 720;
const INITIAL_PRELOAD_COUNT = 16;
const KEYFRAME_STEP = 6;
const WINDOW_BEFORE = 10;
const WINDOW_AFTER = 16;

/**
 * NeuralSynapseBackground:
 * 1. Scrubs Google Flow continuation video (Frames 480 -> 720) in a sticky canvas behind Bento cards.
 * 2. Overlays interactive synaptic constellation responding to mouse & pulse.
 */
export default function NeuralSynapseBackground() {
  const containerRef = useRef(null);
  const frameCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);

  const imagesRef = useRef({});
  const loadingQueueRef = useRef(new Set());
  const currentFrameRef = useRef(START_FRAME);
  const isVisibleRef = useRef(false);

  // Load a single frame from public/frames
  const loadFrame = (index) => {
    if (index < START_FRAME || index > END_FRAME) return;
    if (imagesRef.current[index] || loadingQueueRef.current.has(index)) return;

    loadingQueueRef.current.add(index);
    const img = new Image();
    img.src = `/frames/frame_${String(index).padStart(4, '0')}.webp?v=3`;
    img.onload = () => {
      loadingQueueRef.current.delete(index);
      imagesRef.current[index] = img;
      if (index === currentFrameRef.current && isVisibleRef.current) {
        renderVideoFrame(index);
      }
    };
    img.onerror = () => {
      loadingQueueRef.current.delete(index);
    };
  };

  // Cache eviction to keep memory optimal
  const pruneDistantFrames = (centerIndex) => {
    const keys = Object.keys(imagesRef.current);
    if (keys.length < 90) return;

    for (const key of keys) {
      const idx = Number(key);
      const isKeyframe = (idx % KEYFRAME_STEP === 0) || idx === START_FRAME || idx === END_FRAME;
      if (!isKeyframe && Math.abs(idx - centerIndex) > 30) {
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
    const start = Math.max(START_FRAME, centerIndex - WINDOW_BEFORE);
    const end = Math.min(END_FRAME, centerIndex + WINDOW_AFTER);
    for (let i = start; i <= end; i++) {
      if (!imagesRef.current[i]) {
        loadFrame(i);
      }
    }
    if (centerIndex % 6 === 0) {
      pruneDistantFrames(centerIndex);
    }
  };

  // Render video frame on canvas with object-fit cover
  const renderVideoFrame = (frameIndex) => {
    const canvas = frameCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[frameIndex];

    // Fallback to nearest loaded frame if current frame is buffering
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

    const scale = Math.max(w / imgW, h / imgH);
    const x = (w - imgW * scale) / 2;
    // On portrait mobile screens, anchor y slightly higher so the perspective floor circuits are clearly framed
    const isPortrait = w < h;
    const y = isPortrait ? (h - imgH * scale) * 0.38 : (h - imgH * scale) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, x, y, imgW * scale, imgH * scale);
  };

  const updateCanvasDimensions = () => {
    const canvas = frameCanvasRef.current;
    const pCanvas = particleCanvasRef.current;
    if (!canvas || !pCanvas) return;

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
    }

    // Particle overlay runs at 1x DPR to eliminate GPU fill-rate overhead
    pCanvas.width = w;
    pCanvas.height = h;
    pCanvas.style.width = `${w}px`;
    pCanvas.style.height = `${h}px`;

    renderVideoFrame(currentFrameRef.current);
  };

  useEffect(() => {
    let isCancelled = false;
    let particleRafId = null;
    let isParticleRunning = false;

    // 1. Intersection Observer to enable/disable rendering when #about is in view
    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = isVisibleRef.current;
      isVisibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        renderVideoFrame(currentFrameRef.current);
        if (!wasVisible && !isParticleRunning) {
          startParticleLoop();
        }
      } else {
        stopParticleLoop();
      }
    }, { threshold: 0.01 });

    if (containerRef.current) {
      io.observe(containerRef.current);
    }

    // 2. Defer continuation frame loading until user actually scrolls towards the section
    let hasLoadedBatch = false;
    const triggerBatchLoading = () => {
      if (hasLoadedBatch || isCancelled) return;
      hasLoadedBatch = true;
      updateCanvasDimensions();

      const firstImg = new Image();
      firstImg.src = `/frames/frame_${String(START_FRAME).padStart(4, '0')}.webp?v=3`;
      firstImg.onload = () => {
        if (!isCancelled) {
          imagesRef.current[START_FRAME] = firstImg;
          renderVideoFrame(START_FRAME);
        }
      };

      // Preload frame 720 (crystallized floor end state)
      loadFrame(END_FRAME);

      // Preload next immediate frames gently (481 to 486)
      for (let i = START_FRAME + 1; i <= Math.min(START_FRAME + 6, END_FRAME); i++) {
        loadFrame(i);
      }

      // Preload keyframe anchors sparsely
      const keyframes = [];
      for (let i = START_FRAME + 7; i <= END_FRAME; i++) {
        if (i % KEYFRAME_STEP === 0 || i === END_FRAME) {
          keyframes.push(i);
        }
      }

      let kIdx = 0;
      const loadNextKeyframeChunk = () => {
        if (isCancelled || kIdx >= keyframes.length) return;
        const chunk = keyframes.slice(kIdx, kIdx + 2);
        chunk.forEach(f => loadFrame(f));
        kIdx += 2;
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            if (!isCancelled) loadNextKeyframeChunk();
          }, { timeout: 350 });
        } else {
          setTimeout(loadNextKeyframeChunk, 150);
        }
      };

      setTimeout(loadNextKeyframeChunk, 300);
    };

    // Trigger frame loading when user scrolls within 600px of this section
    const approachIo = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        triggerBatchLoading();
        approachIo.disconnect();
      }
    }, { rootMargin: '600px' });

    if (containerRef.current) {
      approachIo.observe(containerRef.current);
    }

    // 3. GSAP ScrollTrigger to scrub Frames 480 -> 720 as user scrolls through Bento (#about)
    const frameObj = { frame: START_FRAME };
    const aboutSection = document.getElementById('about');

    let scrollTriggerInstance = null;

    if (aboutSection) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: aboutSection,
        start: 'top bottom', // starts right as Bento enters viewport from bottom
        end: 'bottom bottom', // finishes as user scrolls to bottom of Bento
        scrub: 0.25,
        onUpdate: (self) => {
          const targetFrame = Math.round(
            START_FRAME + self.progress * (END_FRAME - START_FRAME)
          );
          const clamped = Math.min(END_FRAME, Math.max(START_FRAME, targetFrame));
          if (clamped !== currentFrameRef.current) {
            currentFrameRef.current = clamped;
            ensureFrameWindow(clamped);
            renderVideoFrame(clamped);
          }
        },
      });
    }

    // 4. Subtle continuous 3D camera drift over crystallized floor for Beadfit and Cinematic Showcase
    const webAppsSection = document.getElementById('web-apps');
    let driftTween = null;
    if (webAppsSection && frameCanvasRef.current) {
      driftTween = gsap.to(frameCanvasRef.current, {
        yPercent: 3.5,
        scale: 1.025,
        ease: 'none',
        scrollTrigger: {
          trigger: webAppsSection,
          endTrigger: '#cinematics',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0.4,
        },
      });
    }

    // 5. Interactive Particle Constellation on particleCanvasRef (Hardware Optimized)
    const pCanvas = particleCanvasRef.current;
    const pCtx = pCanvas ? pCanvas.getContext('2d') : null;

    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Initialize particle nodes tuned for 60/120 FPS device performance
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;
    const NODE_COUNT = isMobile ? 10 : Math.min(Math.floor(w / 75), 18);
    const nodes = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        baseRadius: 1.2 + Math.random() * 1.5,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '255, 140, 50' : '255, 210, 150',
      });
    }

    // Floating Cybernetic Embers (10 on mobile, 14 on desktop)
    const EMBER_COUNT = isMobile ? 8 : 14;
    const embers = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.4 + 0.6,
        vy: -(Math.random() * 0.3 + 0.1),
        vx: (Math.random() - 0.5) * 0.15,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.4 + 0.2,
        color: Math.random() > 0.4 ? '255, 140, 40' : '255, 200, 100',
      });
    }

    let pTime = 0;
    const maxDistance = isMobile ? 80 : 105;
    const maxDistanceSq = maxDistance * maxDistance;
    const mouseMaxDistance = 120;
    const mouseMaxDistanceSq = mouseMaxDistance * mouseMaxDistance;

    const renderParticles = () => {
      if (!isVisibleRef.current || isCancelled) {
        isParticleRunning = false;
        return;
      }

      if (pCtx) {
        pTime += 1;
        const curW = window.innerWidth;
        const curH = window.innerHeight;
        pCtx.clearRect(0, 0, curW, curH);

        // 1. Ambient Holographic Floor Surge (gentle sweep along cybernetic grid floor)
        const floorBaseY = curH * 0.72;
        const currentSurgeY = floorBaseY + Math.sin(pTime * 0.01) * (curH * 0.14);
        const surgeGrad = pCtx.createLinearGradient(0, currentSurgeY - 16, 0, currentSurgeY + 16);
        surgeGrad.addColorStop(0, 'rgba(255, 107, 0, 0)');
        surgeGrad.addColorStop(0.5, 'rgba(255, 140, 50, 0.035)');
        surgeGrad.addColorStop(1, 'rgba(255, 107, 0, 0)');
        pCtx.fillStyle = surgeGrad;
        pCtx.fillRect(0, currentSurgeY - 16, curW, 32);

        // 2. Render Floating Embers
        for (let i = 0; i < embers.length; i++) {
          const emb = embers[i];
          emb.y += emb.vy;
          emb.x += emb.vx + Math.sin(pTime * emb.swaySpeed + emb.swayOffset) * 0.2;

          if (emb.y < -10) {
            emb.y = curH + 10;
            emb.x = Math.random() * curW;
          }
          if (emb.x < -10) emb.x = curW + 10;
          if (emb.x > curW + 10) emb.x = -10;

          if (mouse.active) {
            const edx = emb.x - mouse.x;
            const edy = emb.y - mouse.y;
            const edistSq = edx * edx + edy * edy;
            if (edistSq < mouseMaxDistanceSq) {
              const edist = Math.sqrt(edistSq);
              const repel = (1 - edist / mouseMaxDistance) * 0.5;
              emb.x += (edx / (edist || 1)) * repel;
              emb.y += (edy / (edist || 1)) * repel;
            }
          }

          const emberPulse = Math.sin(pTime * 0.03 + emb.swayOffset) * 0.15;
          const eAlpha = Math.max(0, Math.min(1, emb.baseAlpha + emberPulse));

          pCtx.beginPath();
          pCtx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(${emb.color}, ${eAlpha})`;
          pCtx.fill();
        }

        // 3. Render Synaptic Constellation Nodes with Squared-Distance Culling
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = curW;
          if (n.x > curW) n.x = 0;
          if (n.y < 0) n.y = curH;
          if (n.y > curH) n.y = 0;

          const pulse = Math.sin(pTime * n.pulseSpeed + n.pulseOffset);
          const radius = n.baseRadius + pulse * 0.4;
          const alpha = 0.32 + pulse * 0.18;

          pCtx.beginPath();
          pCtx.arc(n.x, n.y, radius, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(${n.color}, ${alpha})`;
          pCtx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n.x - n2.x;
            const dy = n.y - n2.y;
            const distSq = dx * dx + dy * dy;

            // Squared distance check avoids expensive Math.sqrt calls
            if (distSq < maxDistanceSq) {
              const dist = Math.sqrt(distSq);
              const lineAlpha = (1 - dist / maxDistance) * 0.15;
              pCtx.beginPath();
              pCtx.moveTo(n.x, n.y);
              pCtx.lineTo(n2.x, n2.y);
              pCtx.strokeStyle = `rgba(255, 140, 50, ${lineAlpha})`;
              pCtx.lineWidth = 0.65;
              pCtx.stroke();
            }
          }

          if (mouse.active) {
            const mdx = n.x - mouse.x;
            const mdy = n.y - mouse.y;
            const mdistSq = mdx * mdx + mdy * mdy;

            if (mdistSq < mouseMaxDistanceSq) {
              const mdist = Math.sqrt(mdistSq);
              const mAlpha = (1 - mdist / mouseMaxDistance) * 0.4;
              pCtx.beginPath();
              pCtx.moveTo(n.x, n.y);
              pCtx.lineTo(mouse.x, mouse.y);
              pCtx.strokeStyle = `rgba(255, 170, 70, ${mAlpha})`;
              pCtx.lineWidth = 0.85;
              pCtx.stroke();
            }
          }
        }
      }

      particleRafId = requestAnimationFrame(renderParticles);
    };

    const startParticleLoop = () => {
      if (isParticleRunning || isCancelled) return;
      isParticleRunning = true;
      particleRafId = requestAnimationFrame(renderParticles);
    };

    const stopParticleLoop = () => {
      isParticleRunning = false;
      if (particleRafId) {
        cancelAnimationFrame(particleRafId);
        particleRafId = null;
      }
    };

    // Start particle loop only if section is visible on load
    if (isVisibleRef.current) {
      startParticleLoop();
    }

    // Resize Handler
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
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
      if (driftTween) {
        driftTween.scrollTrigger?.kill();
        driftTween.kill();
      }
      stopParticleLoop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0"
    >
      {/* 1. Sticky 100vh Viewport Container (stays in view while scrolling through Bento #about) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none">
        
        {/* Continuation Video Canvas (Scrubbing Frames 480 -> 720) */}
        <canvas
          ref={frameCanvasRef}
          className="w-full h-full block object-cover"
        />

        {/* Ambient Darkening & Contrast Shield to keep Bento cards and text ultra-crisp */}
        <div className="absolute inset-0 bg-[#050508]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/25 via-transparent to-[#050508]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-60" />

        {/* Interactive Neural Synapse Canvas Overlay */}
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />
      </div>

      {/* 2. Cybernetic Laser Horizon Line at Top Boundary */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6B00]/60 to-transparent" />
      <div className="absolute -top-6 inset-x-0 h-16 bg-gradient-to-b from-[#FF6B00]/20 via-transparent to-transparent blur-md pointer-events-none" />
    </div>
  );
}
