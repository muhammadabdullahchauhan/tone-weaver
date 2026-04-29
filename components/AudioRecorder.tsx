"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, AlertCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import WaveformVisualizer from "./WaveformVisualizer";

interface AudioRecorderProps {
  onRecordingComplete?: (audioUrl: string, blob: Blob) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { isRecording, setIsRecording, setRecordedAudioBlob, setRecordedAudioUrl, showNotification } = useApp();
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [analyserData, setAnalyserData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const closeAudioContextSafely = useCallback(async () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === "closed") {
      audioContextRef.current = null;
      return;
    }
    try {
      await ctx.close();
    } catch {
      // No-op: closing can race with other lifecycle paths.
    } finally {
      audioContextRef.current = null;
    }
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const stopAnalyser = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const startRecording = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        const msg = "Your browser does not support microphone recording.";
        setMicError(msg);
        showNotification(msg, "error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 44100, channelCount: 1, echoCancellation: true },
      });

      // Set up Web Audio API analyser
      const AudioContextCtor =
        window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        stream.getTracks().forEach((t) => t.stop());
        const msg = "Web Audio is not supported in this browser.";
        setMicError(msg);
        showNotification(msg, "error");
        return;
      }

      await closeAudioContextSafely();

      audioContextRef.current = new AudioContextCtor();
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      source.connect(analyserRef.current);

      const updateAnalyser = () => {
        if (!analyserRef.current) return;
        const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(buf);
        const norm = Array.from(buf).map((v) => v / 255);
        setAnalyserData(norm);
        animFrameRef.current = requestAnimationFrame(updateAnalyser);
      };
      updateAnalyser();

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordedAudioUrl(url);
        setRecordedAudioBlob(blob);
        setHasRecording(true);
        onRecordingComplete?.(url, blob);
        stream.getTracks().forEach((t) => t.stop());
        stopAnalyser();
        setAnalyserData([]);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic permissions in your browser."
          : "Could not access microphone. Check your device settings.";
      setMicError(msg);
      showNotification(msg, "error");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    void closeAudioContextSafely();
    showNotification("Recording saved!", "success");
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setHasRecording(false);
    setRecordingTime(0);
    setIsPlaying(false);
    audioChunksRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAnalyser();
      void closeAudioContextSafely();
    };
  }, [closeAudioContextSafely, stopAnalyser]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-[#6366f1]" />
        Voice Recorder
      </h3>

      {micError && (
        <div className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {micError}
        </div>
      )}

      {/* Waveform */}
      <div className="mb-6">
        <WaveformVisualizer
          data={analyserData.length > 0 ? analyserData : undefined}
          isAnimating={isRecording}
          type="mirror"
          height={90}
          color={isRecording ? "#ec4899" : "#6366f1"}
          secondaryColor={isRecording ? "#6366f1" : "#8b5cf6"}
          label={isRecording ? "Recording..." : hasRecording ? "Recorded Audio" : "Idle"}
        />
      </div>

      {/* Timer */}
      {(isRecording || hasRecording) && (
        <div className="flex items-center justify-center mb-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isRecording
                ? "bg-red-500/10 border border-red-500/20"
                : "bg-[#6366f1]/10 border border-[#6366f1]/20"
            }`}
          >
            {isRecording && (
              <span className="recording-dot w-2 h-2 rounded-full bg-red-500" />
            )}
            <span className={`font-mono font-bold text-lg ${isRecording ? "text-red-400" : "text-[#6366f1]"}`}>
              {formatTime(recordingTime)}
            </span>
            <span className="text-slate-500 text-sm">
              {isRecording ? "Recording" : "Duration"}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording && !hasRecording && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-white font-semibold hover:opacity-90 transition-all glow-primary"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/25 transition-all"
          >
            <Square className="w-5 h-5 fill-current" />
            Stop Recording
          </button>
        )}

        {!isRecording && hasRecording && (
          <>
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] font-medium hover:bg-[#6366f1]/25 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] font-medium hover:bg-[#6366f1]/25 transition-all"
            >
              <Mic className="w-4 h-4" />
              Re-record
            </button>
            <button
              onClick={clearRecording}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
              title="Clear recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Recording tips */}
      {!isRecording && !hasRecording && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            "Speak clearly at normal pace",
            "Minimize background noise",
            "44.1 kHz, 16-bit quality",
          ].map((tip) => (
            <div key={tip} className="text-center px-3 py-2 rounded-lg bg-white/3 text-slate-500 text-xs">
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
