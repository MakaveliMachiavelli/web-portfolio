import React, { useRef, useState, useEffect } from 'react';
import { Music, Volume2, Play, Pause } from 'lucide-react';
import { audioBridge } from '../../utils/audioBridge';
import { soundEngine } from '../../utils/soundEngine';

export default function FocusMusicPlayerCard() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    audioBridge.setPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const handleToggle = () => {
      if (!audioRef.current) return;
      if (audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener('focus-audio-toggle', handleToggle);
    return () => window.removeEventListener('focus-audio-toggle', handleToggle);
  }, []);

  const togglePlayMusic = () => {
    soundEngine.playClick();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {});
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioCurrentTime(audioRef.current.currentTime);
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (!audioRef.current) return;
    audioRef.current.currentTime = seekTime;
    setAudioCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bento-card glass-card relative lg:col-span-4 min-h-[250px] p-6 flex flex-col justify-between overflow-hidden border border-white/10 hover:border-amber-500/25 transition-all duration-300">
      {/* Blurred Background Album Art */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 pointer-events-none scale-125"
        style={{ backgroundImage: `url('/songpic.webp')` }}
      />

      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src="/organic_work.mp3"
        preload="none"
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Card Header & Live Audio Visualizer */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono tracking-wider text-neutral-300 font-medium">
            Focus Audio
          </span>
        </div>

        {/* Dancing Equalizer Bars */}
        <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
          {[1, 2, 3, 1, 2, 3, 1, 2].map((bar, bIdx) => (
            <span
              key={bIdx}
              className={`w-1 rounded-full bg-amber-400 transition-all ${
                isPlaying ? `animate-music-bar-${bar}` : 'h-1 opacity-40'
              }`}
              style={{ animationDelay: `${bIdx * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Track Info & Main Play Button */}
      <div className="relative z-10 flex items-center justify-between gap-4 my-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md">
            <img
              src="/songpic.webp"
              alt="Larry June - Organic Work Album Art"
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`}
            />
          </div>

          <div className="min-w-0">
            <p className="font-syne font-bold text-sm text-white truncate">Organic Work</p>
            <p className="text-xs text-neutral-400 truncate font-mono">Larry June • Focus &amp; Flow</p>
          </div>
        </div>

        {/* Apple Music Style Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayMusic}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          className="w-10 h-10 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      {/* Interactive Seek Bar & Volume */}
      <div className="relative z-10 flex flex-col gap-1.5 border-t border-white/10 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-neutral-400 w-8">
            {formatTime(audioCurrentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={audioDuration || 100}
            value={audioCurrentTime}
            onChange={handleSeek}
            aria-label="Track progress"
            className="flex-1 custom-slider"
          />

          <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
            {formatTime(audioDuration)}
          </span>
        </div>

        {/* Volume Sub-Control */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>Volume: {Math.round(volume * 100)}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume level"
            className="w-20 custom-slider"
          />
        </div>
      </div>
    </div>
  );
}
