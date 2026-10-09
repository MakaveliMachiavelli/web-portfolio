import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Volume2, VolumeX, Maximize2, Zap, Film, X, Code, Copy, Check, Clock, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoManager } from '../../utils/videoManager';

const REMOTION_CODE_SNIPPET = `import { Composition } from 'remotion';
import { AutoflowVideo } from './AutoflowVideo';
import { Cover916 } from './Cover916';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="autoflow"
        component={AutoflowVideo}
        durationInFrames={1602}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="cover"
        component={Cover916}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};`;

export default function AiVideoCinemaCard({ clips }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);

  const [selectedClip, setSelectedClip] = useState(clips[0]);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Paused by default to prevent page lag
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [theaterClip, setTheaterClip] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Register with global video manager so only 1 video plays across the website
  useEffect(() => {
    const unregister = videoManager.register('agentlab-cinema-card', {
      play: () => {
        if (videoRef.current) {
          videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        }
      },
    });

    return () => unregister();
  }, []);

  // Pause video decoding when card is off-screen
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isVideoPlaying) {
          videoManager.requestPause('agentlab-cinema-card');
        }
      },
      { threshold: 0.1 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [isVideoPlaying]);

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    setVideoCurrentTime(videoRef.current.currentTime);
    if (!videoDuration && videoRef.current.duration) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setVideoCurrentTime(seekTime);
  };

  const switchVideoClip = (clip) => {
    if (clip.isPlaceholder) return;
    setSelectedClip(clip);
    if (videoRef.current) {
      if (clip.poster) {
        videoRef.current.poster = clip.poster;
      }
      videoRef.current.src = clip.src;
      videoRef.current.load();
      if (isVideoPlaying) {
        videoManager.requestPlay('agentlab-cinema-card');
      }
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsVideoMuted(nextMuted);
  };

  const toggleVideoPlay = () => {
    if (isVideoPlaying) {
      videoManager.requestPause('agentlab-cinema-card');
    } else {
      videoManager.requestPlay('agentlab-cinema-card');
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={cardRef}
      className="bento-card glass-card relative lg:col-span-5 min-h-[560px] p-5 sm:p-6 rounded-[28px] overflow-hidden group border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between bg-black/50 backdrop-blur-xl"
    >
      {/* Ambient Backlight Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {selectedClip.poster && (
          <img
            src={selectedClip.poster}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-20 blur-3xl scale-125 transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header & Controls */}
      <div className="relative z-20 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-md text-[10px] font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 shadow-sm truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${isVideoPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} shrink-0`} />
              <span className="truncate">AgentLab PH • 9:16 Portrait • {selectedClip.fps}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSourceModal(true)}
              className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 hover:border-orange-400/40 backdrop-blur-md text-[10px] font-mono text-orange-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
              title="Inspect Remotion Source Code"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TSX</span>
            </button>

            <button
              type="button"
              onClick={() => setTheaterClip(selectedClip)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 hover:border-white/20 backdrop-blur-md text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm"
              title="Expand Fullscreen Theater View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clip Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md max-w-full overflow-x-auto scrollbar-none shadow-inner">
          {clips.map((clip) => {
            const isActive = selectedClip.id === clip.id;
            return (
              <button
                key={clip.id}
                type="button"
                onClick={() => switchVideoClip(clip)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md'
                    : clip.isPlaceholder
                    ? 'text-neutral-500 hover:text-neutral-400 border border-dashed border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {clip.id === 'ab-comparison' ? (
                  <Zap className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-emerald-400'}`} />
                ) : (
                  <Film className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-orange-400'}`} />
                )}
                <span>{clip.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 9:16 Vertical Phone Chassis */}
      <div className="relative z-20 py-4 flex items-center justify-center">
        <div className="relative w-[210px] sm:w-[230px] md:w-[245px] aspect-[9/16] rounded-[32px] overflow-hidden border-[3px] border-neutral-700/80 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(255,107,0,0.18)] bg-black group/phone transition-transform duration-500 hover:scale-[1.02]">
          
          {/* Phone Top Dynamic Island & Camera Bezel */}
          <div className="absolute top-2 inset-x-0 mx-auto w-18 h-3.5 bg-black/95 rounded-full border border-white/15 z-30 pointer-events-none flex items-center justify-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 border border-neutral-700" />
            <span className="w-1 h-1 rounded-full bg-emerald-500/80" />
          </div>

          {/* 9:16 Video Player Container (100% Uncropped Full Height) */}
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              src={selectedClip.src}
              poster={selectedClip.poster}
              preload="none"
              loop
              muted={isVideoMuted}
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
              onError={(e) => {
                if (selectedClip.fallbackSrc && e.target.src !== selectedClip.fallbackSrc) {
                  e.target.src = selectedClip.fallbackSrc;
                  e.target.load();
                }
              }}
              className={`w-full h-full ${
                selectedClip.id === 'ab-comparison' || selectedClip.fit === 'contain'
                  ? 'object-contain'
                  : 'object-cover'
              } transition-opacity duration-500`}
            />

            {/* Click to Play Overlay (when paused) */}
            {!isVideoPlaying && (
              <div
                onClick={toggleVideoPlay}
                className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35 z-20 p-3 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-white/10 border border-white/25 backdrop-blur-xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,107,0,0.5)] hover:border-orange-400 hover:bg-orange-500/20 transition-all mb-2"
                >
                  <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
                </motion.div>
                <p className="text-white font-syne font-semibold text-[11px] leading-tight drop-shadow-md">
                  Click to Play Reel
                </p>
                <span className="text-[9px] font-mono text-orange-300/90 mt-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10">
                  1080×1920 9:16
                </span>
              </div>
            )}

            {/* Subtle Phone Glass Reflection Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />

            {/* Active Playing Floating Audio Badge */}
            {isVideoPlaying && (
              <button
                type="button"
                onClick={toggleVideoMute}
                className="absolute top-8 right-2.5 z-20 p-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-white hover:text-orange-400 transition-colors shadow-md cursor-pointer"
                title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
              </button>
            )}
          </div>

          {/* Phone Bottom Home Bar Indicator */}
          <div className="absolute bottom-1.5 inset-x-0 mx-auto w-20 h-1 bg-white/40 rounded-full z-30 pointer-events-none" />
        </div>
      </div>

      {/* 4. BOTTOM SECTION: Timeline Scrubber & Detailed Track Meta */}
      <div className="relative z-20 space-y-2.5 pt-1">
        {/* Live Video Timeline Scrubber */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span className="text-white font-medium">{formatTime(videoCurrentTime)}</span>
            <span className="text-orange-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Smartphone className="w-3 h-3 inline" />
              <span>{selectedClip.ratio}</span>
            </span>
            <span>{formatTime(videoDuration || 15)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={videoDuration || 100}
            step="0.1"
            value={videoCurrentTime}
            onChange={handleVideoSeek}
            aria-label="Video seek bar"
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
          />
        </div>

        {/* Title & Interactive Play / Mute Buttons */}
        <div className="flex items-end justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold block truncate">
              {selectedClip.genre}
            </span>
            <p className="font-syne font-bold text-sm sm:text-base text-white truncate">
              {selectedClip.title}
            </p>
            <p className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
              {selectedClip.tools}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleVideoMute}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isVideoMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4 text-orange-400" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleVideoPlay}
              className="p-2 rounded-xl bg-white hover:bg-neutral-200 text-black transition-all cursor-pointer shadow-md active:scale-95"
              title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isVideoPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Fullscreen Theater Modal */}
      {theaterClip &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setTheaterClip(null)}
          >
            <div
              className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <p className="font-syne font-bold text-xs sm:text-sm text-white truncate">
                    {theaterClip.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTheaterClip(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Theater Video Player (9:16 Portrait) */}
              <div className="relative aspect-[9/16] w-full bg-black">
                <video
                  src={theaterClip.src}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 6. Remotion TypeScript Source Code Modal */}
      {showSourceModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowSourceModal(false)}
          >
            <div
              className="relative w-full max-w-2xl bg-[#0a0a0f] rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col max-h-[85vh]"
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
                      RemotionRoot.tsx
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400">
                      AgentLab PH • Code-Rendered Kinetic Video Engine
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(REMOTION_CODE_SNIPPET);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
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

              {/* Code Content */}
              <div className="p-4 sm:p-6 overflow-y-auto font-mono text-xs text-neutral-300 leading-relaxed bg-black/60">
                <pre className="text-emerald-400/90 whitespace-pre-wrap selection:bg-orange-500/30">
                  {REMOTION_CODE_SNIPPET}
                </pre>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Stack: Remotion 4.0 • React • TypeScript • Kokoro TTS</span>
                <span className="text-emerald-400 font-semibold">100% Code-Rendered</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
