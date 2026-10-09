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

    pCanvas.width = w * dpr;
    pCanvas.height = h * dpr;
    pCanvas.style.width = `${w}px`;
    pCanvas.style.height = `${h}px`;

    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      pCtx.scale(dpr, dpr);
    }

    renderVideoFrame(currentFrameRef.current);
  };

  useEffect(() => {
    let isCancelled = false;

    // 1. Intersection Observer to enable/disable rendering when #about is in view
    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        renderVideoFrame(currentFrameRef.current);
      }
    }, { threshold: 0.01 });

    if (containerRef.current) {
      io.observe(containerRef.current);
    }

    // 2. Preload first frame (Frame 480), final frame (Frame 720), and initial batch immediately
    updateCanvasDimensions();

    const firstImg = new Image();
    firstImg.src = `/frames/frame_${String(START_FRAME).padStart(4, '0')}.webp?v=3`;
    firstImg.onload = () => {
      if (!isCancelled) {
        imagesRef.current[START_FRAME] = firstImg;
        renderVideoFrame(START_FRAME);
      }
    };

    // Preload frame 720 immediately so the crystallized floor is always ready for Beadfit & Cinematics
    loadFrame(END_FRAME);

    // Preload next immediate frames (481 to 495)
    for (let i = START_FRAME + 1; i <= Math.min(START_FRAME + INITIAL_PRELOAD_COUNT, END_FRAME); i++) {
      loadFrame(i);
    }

    // Preload keyframe anchors in background
    const keyframes = [];
    for (let i = START_FRAME + INITIAL_PRELOAD_COUNT + 1; i <= END_FRAME; i++) {
      if (i % KEYFRAME_STEP === 0 || i === END_FRAME) {
        keyframes.push(i);
      }
    }

    let kIdx = 0;
    const loadNextKeyframeChunk = () => {
      if (isCancelled || kIdx >= keyframes.length) return;
      const chunk = keyframes.slice(kIdx, kIdx + 5);
      chunk.forEach(f => loadFrame(f));
      kIdx += 5;
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          if (!isCancelled) loadNextKeyframeChunk();
        }, { timeout: 250 });
      } else {
        setTimeout(loadNextKeyframeChunk, 90);
      }
    };

    setTimeout(loadNextKeyframeChunk, 150);

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

    // 5. Interactive Particle Constellation on particleCanvasRef
    const pCanvas = particleCanvasRef.current;
    const pCtx = pCanvas ? pCanvas.getContext('2d') : null;
    let particleRafId = null;

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

    // Initialize particle nodes
    const w = window.innerWidth;
    const h = window.innerHeight;
    const NODE_COUNT = Math.min(Math.floor(w / 45), 32);
    const nodes = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseRadius: 1.4 + Math.random() * 1.8,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '255, 140, 50' : '255, 210, 150',
      });
    }

    // 16 3D Floating Cybernetic Embers drifting upward with subtle amber glow
    const embers = [];
    for (let i = 0; i < 16; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.6 + 0.7,
        vy: -(Math.random() * 0.35 + 0.12),
        vx: (Math.random() - 0.5) * 0.2,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.45 + 0.25,
        color: Math.random() > 0.4 ? '255, 140, 40' : '255, 200, 100',
      });
    }

    let pTime = 0;
    const renderParticles = () => {
      if (!isVisibleRef.current) {
        particleRafId = requestAnimationFrame(renderParticles);
        return;
      }

      if (pCtx) {
        pTime += 1;
        const curW = window.innerWidth;
        const curH = window.innerHeight;
        pCtx.clearRect(0, 0, curW, curH);

        // 1. Ambient Holographic Floor Surge (gentle living sweep along the cybernetic grid floor)
        const floorBaseY = curH * 0.72;
        const surgeCycle = (pTime * 0.003) % 1;
        const currentSurgeY = floorBaseY + Math.sin(surgeCycle * Math.PI) * (curH * 0.22);
        const surgeGrad = pCtx.createLinearGradient(0, currentSurgeY - 20, 0, currentSurgeY + 20);
        surgeGrad.addColorStop(0, 'rgba(255, 107, 0, 0)');
        surgeGrad.addColorStop(0.5, 'rgba(255, 140, 50, 0.045)');
        surgeGrad.addColorStop(1, 'rgba(255, 107, 0, 0)');
        pCtx.fillStyle = surgeGrad;
        pCtx.fillRect(0, currentSurgeY - 20, curW, 40);

        // 2. Render 3D Floating Embers
        for (let i = 0; i < embers.length; i++) {
          const emb = embers[i];
          emb.y += emb.vy;
          emb.x += emb.vx + Math.sin(pTime * emb.swaySpeed + emb.swayOffset) * 0.25;

          if (emb.y < -10) {
            emb.y = curH + 10;
            emb.x = Math.random() * curW;
          }
          if (emb.x < -10) emb.x = curW + 10;
          if (emb.x > curW + 10) emb.x = -10;

          if (mouse.active) {
            const edx = emb.x - mouse.x;
            const edy = emb.y - mouse.y;
            const edist = Math.sqrt(edx * edx + edy * edy);
            if (edist < 130) {
              const repel = (1 - edist / 130) * 0.6;
              emb.x += (edx / (edist || 1)) * repel;
              emb.y += (edy / (edist || 1)) * repel;
            }
          }

          const emberPulse = Math.sin(pTime * 0.03 + emb.swayOffset) * 0.2;
          const eAlpha = Math.max(0, Math.min(1, emb.baseAlpha + emberPulse));

          pCtx.beginPath();
          pCtx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(${emb.color}, ${eAlpha})`;
          pCtx.fill();
        }

        const maxDistance = 110;
        const mouseMaxDistance = 140;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = curW;
          if (n.x > curW) n.x = 0;
          if (n.y < 0) n.y = curH;
          if (n.y > curH) n.y = 0;

          const pulse = Math.sin(pTime * n.pulseSpeed + n.pulseOffset);
          const radius = n.baseRadius + pulse * 0.5;
          const alpha = 0.35 + pulse * 0.2;

          pCtx.beginPath();
          pCtx.arc(n.x, n.y, radius, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(${n.color}, ${alpha})`;
          pCtx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n.x - n2.x;
            const dy = n.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const lineAlpha = (1 - dist / maxDistance) * 0.18;
              pCtx.beginPath();
              pCtx.moveTo(n.x, n.y);
              pCtx.lineTo(n2.x, n2.y);
              pCtx.strokeStyle = `rgba(255, 140, 50, ${lineAlpha})`;
              pCtx.lineWidth = 0.75;
              pCtx.stroke();
            }
          }

          if (mouse.active) {
            const mdx = n.x - mouse.x;
            const mdy = n.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < mouseMaxDistance) {
              const mAlpha = (1 - mdist / mouseMaxDistance) * 0.45;
              pCtx.beginPath();
              pCtx.moveTo(n.x, n.y);
              pCtx.lineTo(mouse.x, mouse.y);
              pCtx.strokeStyle = `rgba(255, 170, 70, ${mAlpha})`;
              pCtx.lineWidth = 1;
              pCtx.stroke();
            }
          }
        }
      }

      particleRafId = requestAnimationFrame(renderParticles);
    };

    particleRafId = requestAnimationFrame(renderParticles);

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
      if (particleRafId) cancelAnimationFrame(particleRafId);
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
