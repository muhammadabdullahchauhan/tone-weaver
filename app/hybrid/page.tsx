"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Blend, Zap, RefreshCw, Info, Download, Share2 } from "lucide-react";
import AccentSelector from "@/components/AccentSelector";
import AudioPlayer from "@/components/AudioPlayer";
import LoadingIndicator from "@/components/LoadingIndicator";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import SharingButtons from "@/components/SharingButtons";
import { useApp } from "@/contexts/AppContext";
import { accents } from "@/mock-data/accents";
import { createHybridAccent, saveAudioRecord } from "@/lib/tone-weaver-api";
import { triggerDownload } from "@/lib/sharing";

export default function HybridPage() {
  const {
    selectedAccent, setSelectedAccent,
    secondaryAccent, setSecondaryAccent,
    hybridRatio, setHybridRatio,
    recordedAudioBlob,
    recordedAudioUrl,
    isProcessing, processingProgress,
    runAsyncProcessing,
    addToHistory,
    showNotification,
  } = useApp();

  const [hybridResult, setHybridResult] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [savedHybridId, setSavedHybridId] = useState<string | null>(null);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const accent1 = accents.find((a) => a.id === selectedAccent);
  const accent2 = accents.find((a) => a.id === secondaryAccent);

  useEffect(() => {
    return () => {
      if (hybridResult?.startsWith("blob:")) {
        URL.revokeObjectURL(hybridResult);
      }
    };
  }, [hybridResult]);

  const handleGenerate = async () => {
    if (!recordedAudioBlob || !recordedAudioUrl) {
      showNotification("Go to Record page and record audio first!", "error");
      return;
    }

    if (selectedAccent === secondaryAccent) {
      showNotification("Choose two different accents for a hybrid mix.", "error");
      return;
    }

    try {
      setSavedHybridId(null);
      const hybridBlob = await runAsyncProcessing(() =>
        createHybridAccent(recordedAudioBlob, selectedAccent, secondaryAccent, hybridRatio)
      );

      if (hybridResult?.startsWith("blob:")) {
        URL.revokeObjectURL(hybridResult);
      }

      const hybridUrl = URL.createObjectURL(hybridBlob);
      setHybridResult(hybridUrl);
      setShowShare(false);

      const record = await saveAudioRecord(hybridBlob, {
        accent: selectedAccent,
        title: `${accent1?.name ?? "Accent"} + ${accent2?.name ?? "Accent"} Hybrid`,
        originalAccent: "american",
        tags: ["hybrid", selectedAccent, secondaryAccent],
        mixPercentage: hybridRatio,
        originalAudioBlob: recordedAudioBlob,
      });
      addToHistory(record);
      setSavedHybridId(record.id);
      showNotification(
        `Hybrid created: ${accent1?.name} ${hybridRatio}% + ${accent2?.name} ${100 - hybridRatio}%`,
        "success"
      );
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Hybrid generation failed.", "error");
    }
  };

  const getBlendDescription = () => {
    if (hybridRatio > 70) return `Predominantly ${accent1?.name} with ${accent2?.name} undertones`;
    if (hybridRatio < 30) return `Predominantly ${accent2?.name} with ${accent1?.name} undertones`;
    if (hybridRatio === 50) return `Equal blend of ${accent1?.name} and ${accent2?.name}`;
    return `${accent1?.name}-dominant blend with ${accent2?.name} influence`;
  };

  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="glass-card p-6 text-slate-400">Loading hybrid tools...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
            <Blend className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Hybrid Accent Creator</h1>
        </div>
        <p className="text-slate-400">
          Blend two accents with a custom ratio to create a unique, personalized voice profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accent 1 */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
            <h2 className="text-slate-200 font-semibold">Primary Accent</h2>
            <span className="ml-auto text-sm font-bold text-[#6366f1]">{hybridRatio}%</span>
          </div>
          <AccentSelector
            value={selectedAccent}
            onChange={setSelectedAccent}
            exclude={secondaryAccent}
            label=""
          />
        </div>

        {/* Blend control */}
        <div className="glass-card p-5 flex flex-col items-center justify-center">
          <h2 className="text-slate-200 font-semibold mb-6 text-center">Blend Ratio</h2>

          {/* Visual blend indicator */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{accent1?.flag} {accent1?.name}</span>
              <span>{accent2?.flag} {accent2?.name}</span>
            </div>
            <div className="relative h-8 rounded-full overflow-hidden border border-white/10">
              <div
                className="absolute inset-y-0 left-0 transition-all duration-200"
                style={{
                  width: `${hybridRatio}%`,
                  background: `linear-gradient(to right, ${accent1?.color ?? "#6366f1"}, ${accent1?.color ?? "#6366f1"}88)`,
                }}
              />
              <div
                className="absolute inset-y-0 right-0 transition-all duration-200"
                style={{
                  width: `${100 - hybridRatio}%`,
                  background: `linear-gradient(to left, ${accent2?.color ?? "#ec4899"}, ${accent2?.color ?? "#ec4899"}88)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold z-10">
                  {hybridRatio}/{100 - hybridRatio}
                </span>
              </div>
            </div>
          </div>

          <input
            type="range"
            min={5}
            max={95}
            step={5}
            value={hybridRatio}
            onChange={(e) => setHybridRatio(parseInt(e.target.value))}
            className="w-full mb-4"
          />

          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Blend Description</div>
            <div className="text-xs text-slate-300 bg-white/3 px-3 py-2 rounded-xl border border-white/8 leading-relaxed">
              {getBlendDescription()}
            </div>
          </div>

          {/* Mock spectrogram */}
          <div className="w-full mt-5">
            <div className="text-xs text-slate-500 mb-2 text-center">Spectrogram Preview</div>
            <div className="h-16 rounded-xl overflow-hidden relative bg-[#0d0d1a] border border-white/8">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 transition-all"
                  style={{
                    left: `${(i / 30) * 100}%`,
                    width: `${100 / 30}%`,
                    height: `${20 + Math.abs(Math.sin(i * 0.5 + hybridRatio * 0.05)) * 70}%`,
                    background: `linear-gradient(to top, ${accent1?.color ?? "#6366f1"}${Math.round(hybridRatio * 2.5).toString(16).padStart(2,"0")}, ${accent2?.color ?? "#ec4899"}${Math.round((100-hybridRatio) * 2.5).toString(16).padStart(2,"0")})`,
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-40 glow-primary"
          >
            {isProcessing ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-4 h-4" /> Generate Hybrid</>
            )}
          </button>

          {isProcessing && (
            <div className="w-full mt-3">
              <LoadingIndicator progress={processingProgress} label="Blending accents..." variant="bar" />
            </div>
          )}
        </div>

        {/* Accent 2 */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
            <h2 className="text-slate-200 font-semibold">Secondary Accent</h2>
            <span className="ml-auto text-sm font-bold text-[#ec4899]">{100 - hybridRatio}%</span>
          </div>
          <AccentSelector
            value={secondaryAccent}
            onChange={setSecondaryAccent}
            exclude={selectedAccent}
            label=""
          />
        </div>
      </div>

      {/* Result */}
      {hybridResult && !isProcessing && (
        <div className="mt-8 fade-in">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-semibold text-slate-200">Hybrid Result</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25">
              {accent1?.flag} {hybridRatio}% + {accent2?.flag} {100 - hybridRatio}%
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <AudioPlayer
              src={recordedAudioUrl}
              label="Original Recording"
              accent="Original"
              accentColor="#64748b"
            />
            <AudioPlayer
              src={hybridResult}
              label="Hybrid Accent"
              accent={`${accent1?.name} + ${accent2?.name}`}
              accentColor="#8b5cf6"
            />
          </div>

          {/* Waveforms */}
          <div className="glass-card p-5 mb-5">
            <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#8b5cf6]" />
              Frequency Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <WaveformVisualizer label="Original" color="#64748b" height={60} type="bars" />
              <WaveformVisualizer
                label={accent1?.name}
                color={accent1?.color ?? "#6366f1"}
                height={60}
                type="bars"
              />
              <WaveformVisualizer
                label="Hybrid Output"
                color="#8b5cf6"
                secondaryColor="#ec4899"
                height={60}
                type="bars"
              />
            </div>
          </div>

          {/* Blend characteristics */}
          <div className="glass-card p-5 mb-5">
            <h3 className="text-slate-300 font-medium mb-4">Hybrid Characteristics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Rhoticity", v1: accent1?.id === "american" ? "Full" : "None", v2: accent2?.id === "american" ? "Full" : "Partial", result: hybridRatio > 50 ? "Partial" : "Minimal" },
                { label: "Vowel Quality", v1: accent1?.name ?? "—", v2: accent2?.name ?? "—", result: "Blended" },
                { label: "Intonation", v1: "Base", v2: "Overlay", result: `${hybridRatio}/${100-hybridRatio} mix` },
                { label: "Overall Score", v1: "—", v2: "—", result: `${75 + Math.floor(hybridRatio / 10)}%` },
              ].map(({ label, result }) => (
                <div key={label} className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-[#8b5cf6]">{result}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (!hybridResult) return;
                triggerDownload(hybridResult, "tone-weaver-hybrid.wav");
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-[#8b5cf6] font-medium hover:bg-[#8b5cf6]/25 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Hybrid
            </button>
            <button
              onClick={() => setShowShare((s) => !s)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899]/15 border border-[#ec4899]/30 text-[#ec4899] font-medium hover:bg-[#ec4899]/25 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share Hybrid
            </button>
          </div>

          {showShare && (
            <div className="mt-4 max-w-md fade-in">
              <SharingButtons
                audioId={savedHybridId}
                title={`My ${accent1?.name}/${accent2?.name} Hybrid`}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!recordedAudioUrl && (
        <div className="mt-8 glass-card p-10 text-center">
          <div className="text-5xl mb-4">🎙️</div>
          <h3 className="text-slate-300 font-semibold text-lg mb-2">No Audio Recorded Yet</h3>
          <p className="text-slate-500 text-sm mb-5">Record your voice first, then come back to create hybrid accents.</p>
          <a
            href="/record"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-all"
          >
            Go to Recorder
          </a>
        </div>
      )}
    </div>
  );
}
