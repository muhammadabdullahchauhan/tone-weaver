"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart2, TrendingUp, Info, ArrowLeftRight } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import SharingButtons from "@/components/SharingButtons";
import { useApp } from "@/contexts/AppContext";
import { mockComparisonStats } from "@/mock-data/audios";
import { accents } from "@/mock-data/accents";

export default function ComparisonPage() {
  const { recordedAudioUrl, processedAudioUrl, selectedAccent, latestComparison, audioHistory } = useApp();
  const [showShare, setShowShare] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const selectedAccentObj = accents.find((a) => a.id === selectedAccent);
  const historyRecords = useMemo(
    () => audioHistory.filter((record) => Boolean(record.audioUrl)),
    [audioHistory],
  );
  const hasCurrentComparison = Boolean(
    (latestComparison?.originalUrl ?? recordedAudioUrl) &&
      (latestComparison?.convertedUrl ?? processedAudioUrl),
  );
  const activeHistoryId = selectedHistoryId ?? (!hasCurrentComparison ? historyRecords[0]?.id ?? null : null);
  const historyAudio = historyRecords.find((record) => record.id === activeHistoryId) ?? null;
  const originalSrc = historyAudio?.originalAudioUrl ?? latestComparison?.originalUrl ?? recordedAudioUrl;
  const convertedSrc = historyAudio?.audioUrl ?? latestComparison?.convertedUrl ?? processedAudioUrl;
  const stats = historyAudio?.stats ?? latestComparison?.stats ?? {
    similarity: mockComparisonStats.similarity,
    quality: mockComparisonStats.qualityScore,
    accentScore: 84,
    latency: mockComparisonStats.processingTime,
  };
  const keyDifferences = latestComparison?.keyDifferences ?? mockComparisonStats.keyDifferences;
  const originalWaveform = historyAudio?.waveformData ?? latestComparison?.originalWaveform;
  const convertedWaveform = historyAudio?.waveformData ?? latestComparison?.convertedWaveform;
  const shareRecord = historyAudio ?? historyRecords[0] ?? null;
  const activeTitle = historyAudio?.title ?? "Current Comparison";
  const activeOriginalAccent = historyAudio?.originalAccent ?? "Your Voice";
  const activeTargetAccent = historyAudio?.targetAccent ?? selectedAccentObj?.name ?? "Converted";

  if (!hasCurrentComparison && historyRecords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="glass-card p-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">No comparison ready yet</h1>
          <p className="text-slate-400 mb-6">
            Record audio and run a conversion first, or open one of your saved recordings from history.
          </p>
          <Link
            href="/record"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90"
          >
            Go to Recorder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-[#10b981]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Audio Comparison</h1>
        </div>
        <p className="text-slate-400">
          Side-by-side analysis of original and converted audio with waveforms and statistics.
        </p>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">Compare the current session or switch to a saved recording.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedHistoryId(null)}
            disabled={!hasCurrentComparison}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !activeHistoryId
                ? "bg-[#10b981] text-white"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/8"
            } disabled:opacity-40`}
          >
            Current Session
          </button>
          {historyRecords.slice(0, 4).map((audio) => (
            <button
              key={audio.id}
              onClick={() => setSelectedHistoryId(audio.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeHistoryId === audio.id
                  ? "bg-[#10b981] text-white"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/8"
              }`}
            >
              {audio.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-slate-300 font-medium">Original Audio</span>
          </div>
          <AudioPlayer
            src={originalSrc}
            label={historyAudio?.title ?? "Original Recording"}
            accent={activeOriginalAccent}
            accentColor="#64748b"
            showDownload
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
            <span className="text-slate-300 font-medium">Converted Audio</span>
          </div>
          <AudioPlayer
            src={convertedSrc}
            label={historyAudio ? `${historyAudio.targetAccent} Version` : "Converted Audio"}
            accent={activeTargetAccent}
            accentColor={selectedAccentObj?.color ?? "#6366f1"}
            showDownload
          />
        </div>
      </div>

      <div className="glass-card p-5 mb-6">
        <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-[#10b981]" />
          Waveform Analysis
        </h2>
        <div className="space-y-4">
          <WaveformVisualizer
            data={originalWaveform}
            label="Original Waveform"
            color="#64748b"
            secondaryColor="#94a3b8"
            height={80}
            type="mirror"
          />
          <WaveformVisualizer
            data={convertedWaveform}
            label="Converted Waveform"
            color={selectedAccentObj?.color ?? "#6366f1"}
            secondaryColor="#8b5cf6"
            height={80}
            type="mirror"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="glass-card p-5">
          <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
            Quality Metrics
          </h2>
          <div className="space-y-4">
            {[
              { label: "Accent Similarity", value: stats.similarity, color: "#10b981" },
              { label: "Audio Quality", value: stats.quality, color: "#6366f1" },
              { label: "Accent Score", value: stats.accentScore, color: "#ec4899" },
              { label: "Naturalness", value: Math.max(60, Math.round((stats.similarity + stats.quality) / 2)), color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-slate-200 font-semibold mb-4">Phonetic Differences</h2>
          <div className="space-y-2">
            {keyDifferences.map(({ feature, original, converted }) => (
              <div key={feature} className="p-3 rounded-xl bg-white/3 border border-white/8">
                <div className="text-xs font-semibold text-slate-300 mb-2">{feature}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 flex-1 text-center">
                    {original}
                  </span>
                  <ArrowLeftRight className="w-3 h-3 text-slate-500 shrink-0" />
                  <span
                    className="px-2 py-1 rounded flex-1 text-center"
                    style={{
                      background: (selectedAccentObj?.color ?? "#6366f1") + "22",
                      color: selectedAccentObj?.color ?? "#6366f1",
                    }}
                  >
                    {converted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Processing Time", value: `${stats.latency}ms` },
            { label: "Recording", value: activeTitle },
            { label: "Conversion", value: `${activeOriginalAccent} -> ${activeTargetAccent}` },
            { label: "Sample Rate", value: "44.1 kHz" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-lg font-bold gradient-text">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowShare((value) => !value)}
          disabled={!shareRecord}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] font-medium hover:bg-[#10b981]/25 transition-all disabled:opacity-40"
        >
          Share Comparison
        </button>
      </div>

      {showShare && (
        <div className="mt-4 max-w-md fade-in">
          <SharingButtons
            audioId={shareRecord?.id ?? null}
            title={shareRecord ? `${shareRecord.title} Comparison` : "Tone Weaver Audio Comparison"}
          />
        </div>
      )}
    </div>
  );
}
