import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Sparkles, Send, Play, Pause, ChevronRight } from 'lucide-react';
import { audioBridge } from '../utils/audioBridge';
import { soundEngine } from '../utils/soundEngine';

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSoundFxEnabled, setIsSoundFxEnabled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Scroll progress and section observer with RAF throttling
  useEffect(() => {
    let rafId = null;
    let aboutOffset = 0;
    let webAppsOffset = 0;
    let cinematicsOffset = 0;
    let docHeight = 1;

    const getAbsTop = (el) => (el ? el.getBoundingClientRect().top + window.scrollY : 0);

    const measureOffsets = () => {
      const aboutEl = document.getElementById('about');
      const webAppsEl = document.getElementById('web-apps');
      const cinematicsEl = document.getElementById('cinematics');
      if (aboutEl) aboutOffset = getAbsTop(aboutEl);
      if (webAppsEl) webAppsOffset = getAbsTop(webAppsEl);
      if (cinematicsEl) cinematicsOffset = getAbsTop(cinematicsEl);
      docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    measureOffsets();
    window.addEventListener('resize', measureOffsets, { passive: true });

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollY = window.scrollY || window.pageYOffset;
        const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
        setScrollProgress(progress);

        setIsVisible(aboutOffset ? scrollY >= aboutOffset - 250 : scrollY > window.innerHeight * 4);

        if (cinematicsOffset && scrollY >= cinematicsOffset - 300) {
          setActiveSection('cinematics');
        } else if (webAppsOffset && scrollY >= webAppsOffset - 300) {
          setActiveSection('web-apps');
        } else if (aboutOffset && scrollY >= aboutOffset - 300) {
          setActiveSection('about');
        } else {
          setActiveSection('hero');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measureOffsets);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    return audioBridge.subscribe((playing) => {
      setIsMusicPlaying(playing);
    });
  }, []);

  const toggleFocusMusic = () => {
    soundEngine.playClick();
    audioBridge.toggle();
  };

  const toggleSoundFx = () => {
    const newState = soundEngine.toggleSound();
    setIsSoundFxEnabled(newState);
  };

  const scrollToSection = (id) => {
    soundEngine.playClick();
    if (id === 'hero') {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById(id);
      if (el) {
        if (typeof window !== 'undefined' && window.lenis) {
          window.lenis.scrollTo(el, { offset: -20, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 inset-x-0 h-[2.5px] z-[150] bg-white/[0.05] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-all duration-75 origin-left shadow-[0_0_12px_rgba(255,107,0,0.8)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Floating Navigation Bar */}
      <AnimatePresence>
        {isVisible && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-3 sm:top-5 inset-x-0 z-[140] flex justify-center pointer-events-none px-3 sm:px-4"
          >
            <nav className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/75 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5 max-w-4xl w-full">
              
              {/* Brand Logo & Live Availability Tag */}
              <div
                onClick={() => scrollToSection('hero')}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-orange-400/50 transition-colors">
                  <img
                    src="/allen_logo.svg"
                    alt="Allen Logo"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-syne font-bold text-xs sm:text-sm tracking-wider text-white group-hover:text-orange-300 transition-colors">
                    ALLEN
                  </span>
                  <span className="hidden sm:flex items-center gap-1 text-[9px] font-mono text-emerald-400 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </span>
                </div>
              </div>

              {/* Navigation Jump Pills */}
              <div className="hidden md:flex items-center gap-1 p-0.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => scrollToSection('hero')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeSection === 'hero'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeSection === 'about'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Services &amp; Ops
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('web-apps')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeSection === 'web-apps'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Artisan Beadfit
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('cinematics')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeSection === 'cinematics'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Cinema Studio
                </button>
              </div>

              {/* Focus Audio Mini Pill & Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Focus Audio Mini Controller */}
                <button
                  type="button"
                  onClick={toggleFocusMusic}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[11px] font-mono transition-all cursor-pointer shadow-sm ${
                    isMusicPlaying
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title={isMusicPlaying ? 'Pause Focus Track' : 'Play Focus Track (Larry June - Organic Work)'}
                >
                  <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden lg:inline text-[10px] truncate max-w-[90px]">
                    Focus Track
                  </span>
                  {/* Visualizer Bars */}
                  <div className="flex items-end gap-0.5 h-3 px-1 py-0.5">
                    {[1, 2, 3, 2].map((bar, idx) => (
                      <span
                        key={idx}
                        className={`w-0.5 rounded-full bg-amber-400 transition-all ${
                          isMusicPlaying ? `animate-music-bar-${bar}` : 'h-1 opacity-40'
                        }`}
                      />
                    ))}
                  </div>
                  {isMusicPlaying ? (
                    <Pause className="w-3 h-3 text-amber-300 shrink-0" />
                  ) : (
                    <Play className="w-3 h-3 shrink-0" />
                  )}
                </button>

                {/* Tactile UI Synth Sound Toggle */}
                <button
                  type="button"
                  onClick={toggleSoundFx}
                  className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer hidden xs:flex items-center justify-center ${
                    isSoundFxEnabled
                      ? 'bg-orange-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-white/[0.04] border-white/10 text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={isSoundFxEnabled ? 'Tactile Sound FX Enabled' : 'Enable Tactile Sound FX'}
                >
                  {isSoundFxEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Quick Hire / Inquire CTA */}
                <a
                  href="mailto:allenolavidez@gmail.com?subject=Project%20Inquiry%20-%20Allen"
                  onClick={() => soundEngine.playClick()}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black font-syne font-bold text-xs shadow-[0_0_20px_rgba(255,107,0,0.35)] hover:shadow-[0_0_30px_rgba(255,107,0,0.55)] hover:scale-102 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <span>Hire Allen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </nav>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}
