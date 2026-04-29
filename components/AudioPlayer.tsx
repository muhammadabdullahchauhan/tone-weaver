"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, SkipBack, SkipForward } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

interface AudioPlayerProps {
  src?: string | null;
  label?: string;
  accent?: string;
  waveformData?: number[];
  accentColor?: string;
  showDownload?: boolean;
  showSpeed?: boolean;
  speed?: number;
  onSpeedChange?: (s: number) => void;
  compact?: boolean;
}

export default function AudioPlayer({
  src,
  label = "Audio",
  accent,
  waveformData,
  accentColor = "#6366f1",
  showDownload = true,
  showSpeed = true,
  speed = 1.0,
  onSpeedChange,
  compact = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [localSpeed, setLocalSpeed] = useState(speed);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const effectiveSpeed = onSpeedChange ? speed : localSpeed;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = effectiveSpeed;
    }
  }, [effectiveSpeed]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const skip = (delta: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const muted = !isMuted;
    audioRef.current.muted = muted;
    setIsMuted(muted);
  };

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `${label.replace(/\s+/g, "-").toLowerCase()}-tone-weaver.wav`;
    a.click();
  };

  const changeSpeed = (s: number) => {
    if (onSpeedChange) onSpeedChange(s);
    else setLocalSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const isEmpty = !src;

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl border"
        style={{ borderColor: accentColor + "33", background: accentColor + "0a" }}
      >
        <button
          onClick={toggle}
          disabled={isEmpty}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40"
          style={{ background: isEmpty ? "#334155" : accentColor }}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{label}</p>
          <p className="text-xs text-slate-500">{fmt(currentTime)} / {fmt(duration || 0)}</p>
        </div>
        {accent && <span className="text-xs text-slate-400 shrink-0">{accent}</span>}
        {src && (
          <audio
            ref={audioRef}
            src={src}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-slate-200 font-semibold">{label}</h4>
          {accent && (
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: accentColor + "22", color: accentColor }}
            >
              {accent}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSpeed && (
            <div className="flex items-center gap-1">
              {[0.5, 0.75, 1, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                    effectiveSpeed === s
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  style={effectiveSpeed === s ? { background: accentColor } : {}}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
          {showDownload && src && (
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-4">
        <WaveformVisualizer
          data={waveformData}
          isAnimating={isPlaying && !isEmpty}
          color={accentColor}
          secondaryColor="#8b5cf6"
          height={64}
          type="bars"
        />
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full bg-white/8 cursor-pointer mb-3 overflow-hidden"
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: duration ? `${(currentTime / duration) * 100}%` : "0%",
            background: accentColor,
          }}
        />
      </div>

      {/* Time */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span>{fmt(currentTime)}</span>
        <span>{fmt(duration || 0)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => skip(-10)}
          disabled={isEmpty}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-30"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={toggle}
          disabled={isEmpty}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-30 glow-primary"
          style={{ background: isEmpty ? "#334155" : `linear-gradient(135deg, ${accentColor}, #8b5cf6)` }}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={() => skip(10)}
          disabled={isEmpty}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-30"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-200 transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="w-20"
          />
        </div>
      </div>

      {isEmpty && (
        <div className="mt-3 text-center py-2 text-slate-600 text-xs">
          No audio loaded — record or select a file
        </div>
      )}

      {src && (
        <audio
          ref={audioRef}
          src={src}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        />
      )}
    </div>
  );
}
