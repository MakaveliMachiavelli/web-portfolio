import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import BentoGrid from './components/BentoGrid';
import ArtisanBeadfitShowcase from './components/ArtisanBeadfitShowcase';
import CinematicShowcase from './components/CinematicShowcase';
import NeuralSynapseBackground from './components/bento/NeuralSynapseBackground';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;
    window.lenis = lenis;

    lenis.scrollTo(0, { immediate: true });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(500, 33);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    return () => {
      clearTimeout(refreshTimer);
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050508] text-white selection:bg-[#FF6B00]/35 selection:text-white">
      {/* Floating Navigation & Scroll Progress */}
      <Navbar />

      {/* Hero: Neural Deep-Dive Journey (Frames 1 -> 480) */}
      <Hero />

      {/* Continuous Cybernetic World: Bento Grid, Artisan Beadfit & Cinematic Studio */}
      <div id="continuation-world" className="relative w-full">
        {/* Continuous Sticky Neural & Cybernetic Floor Background */}
        <NeuralSynapseBackground />

        {/* Section 1: Bento Matrix (Scrubs Continuation Video Frames 480 -> 720) */}
        <BentoGrid />

        {/* Section 2: Artisan Beadfit Customizer (Floats seamlessly over crystallized cybernetic floor) */}
        <ArtisanBeadfitShowcase />

        {/* Section 3: Cinematic Directing Studio (Floats seamlessly over crystallized cybernetic floor) */}
        <CinematicShowcase />
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#050508] py-12 px-6 sm:px-10 md:px-14 text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-neutral-500">
            © {new Date().getFullYear()} Allen. Executive VA, creative operations &amp; multi-skilled execution.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-neutral-400">
            <a
              href="mailto:allenolavidez@gmail.com?subject=Project%20Inquiry%20-%20Allen"
              className="hover:text-orange-400 transition-colors text-xs flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Hire / Inquiries
            </a>
            <a
              href="mailto:allenolavidez@gmail.com"
              className="hover:text-white transition-colors text-xs"
            >
              allenolavidez@gmail.com
            </a>
            <a
              href="#about"
              className="hover:text-white transition-colors text-xs"
            >
              Specialties &amp; Experience
            </a>
            <a
              href="#web-apps"
              className="hover:text-orange-400 text-neutral-300 transition-colors text-xs"
            >
              Artisan Beadfit (Web App)
            </a>
            <a
              href="#cinematics"
              className="hover:text-orange-400 text-neutral-300 transition-colors text-xs"
            >
              Cinematic Studio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
