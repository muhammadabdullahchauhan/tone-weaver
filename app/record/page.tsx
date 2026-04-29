"use client";

import { useState } from "react";
import { Sliders, Zap, Download, Share2, RefreshCw, Info } from "lucide-react";
import AudioRecorder from "@/components/AudioRecorder";
import AccentSelector from "@/components/AccentSelector";
import VoiceTypeSelector from "@/components/VoiceTypeSelector";
import AudioPlayer from "@/components/AudioPlayer";
import LoadingIndicator from "@/components/LoadingIndicator";
import SharingButtons from "@/components/SharingButtons";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { useApp } from "@/contexts/AppContext";
import { accents } from "@/mock-data/accents";
import { compareAccent, convertAccent, saveAudioRecord } from "@/lib/tone-weaver-api";

const emotionPresets = ["neutral", "happy", "calm", "confident", "serious", "warm"];

export default function RecordPage() {
  const {
    selectedAccent,
    setSelectedAccent,
    selectedVoiceType,
    setSelectedVoiceType,
    speed,
    setSpeed,
    pitch,
    setPitch,
    echoAmount,
    setEchoAmount,
    reverbAmount,
    setReverbAmount,
    ageModulation,
    setAgeModulation,
    genderModulation,
    setGenderModulation,
    emotionPreset,
    setEmotionPreset,
    recordedAudioBlob,
    recordedAudioUrl,
    processedAudioUrl,
    setProcessedAudioUrl,
    isProcessing,
    processingProgress,
    latencyMs,
    runAsyncProcessing,
    setLatestComparison,
    addToHistory,
    showNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"accent" | "voiceType" | "modulation">("accent");
  const [showShare, setShowShare] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [voiceTypeError, setVoiceTypeError] = useState<string | null>(null);

  const selectedAccentObj = accents.find((accent) => accent.id === selectedAccent);

  const handleConvert = async () => {
    if (!recordedAudioBlob || !recordedAudioUrl) {
      showNotification("Please record audio first!", "error");
      return;
    }

    if (!selectedVoiceType) {
      const message = "Please select a voice type (Male or Female) before converting.";
      setVoiceTypeError(message);
      showNotification(message, "error");
      setActiveTab("voiceType");
      return;
    }

    try {
      setSavedRecordId(null);
      const convertedBlob = await runAsyncProcessing(() =>
        convertAccent(recordedAudioBlob, selectedAccent, selectedVoiceType)
      );
      const processedUrl = URL.createObjectURL(convertedBlob);
      setProcessedAudioUrl(processedUrl);

      const comparison = await compareAccent(recordedAudioBlob, selectedAccent, selectedVoiceType);
      setLatestComparison(comparison);

      const savedRecord = await saveAudioRecord(convertedBlob, {
        accent: selectedAccent,
        title: `${selectedAccentObj?.name ?? "Accent"} ${selectedVoiceType} Voice Conversion`,
        originalAccent: "american",
        tags: ["converted", selectedAccent, selectedVoiceType],
        originalAudioBlob: recordedAudioBlob,
      });
      addToHistory(savedRecord);
      setSavedRecordId(savedRecord.id);

      showNotification("Conversion complete!", "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Conversion failed.", "error");
    }
  };

  const handleVoiceTypeChange = (voiceType: "male" | "female") => {
    setSelectedVoiceType(voiceType);
    setVoiceTypeError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Voice Recorder</h1>
        <p className="text-slate-400 mt-1">
          Record your voice and convert it to any accent in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <AudioRecorder
            onRecordingComplete={() => {
              showNotification("Recording ready. Select an accent and convert.", "info");
            }}
          />

          {recordedAudioUrl && (
            <div className="glass-card p-4 grid grid-cols-3 gap-3 text-center fade-in">
              <div>
                <div className="text-lg font-bold text-[#6366f1]">22.05</div>
                <div className="text-xs text-slate-500">kHz Sample Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#ec4899]">16-bit</div>
                <div className="text-xs text-slate-500">Bit Depth</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#8b5cf6]">WAV</div>
                <div className="text-xs text-slate-500">Backend Output</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8">
            {[
              { id: "accent", label: "Accent", icon: "Accent" },
              { id: "voiceType", label: "Voice Type", icon: "Voice" },
              { id: "modulation", label: "Modulation", icon: "Voice" },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id ? "bg-[#6366f1] text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="glass-card p-5">
            {activeTab === "accent" && (
              <AccentSelector
                value={selectedAccent}
                onChange={setSelectedAccent}
                label="Target Accent"
              />
            )}

            {activeTab === "voiceType" && (
              <VoiceTypeSelector
                value={selectedVoiceType}
                onChange={handleVoiceTypeChange}
                error={voiceTypeError}
              />
            )}

            {activeTab === "modulation" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="w-4 h-4 text-[#8b5cf6]" />
                  <h3 className="text-slate-200 font-semibold">Voice Modulation Preview</h3>
                </div>
                <div className="space-y-5">
                  {[
                    {
                      label: "Speed",
                      value: speed,
                      min: 0.5,
                      max: 2,
                      step: 0.05,
                      setter: setSpeed,
                      fmt: (value: number) => `${value.toFixed(2)}x`,
                    },
                    {
                      label: "Pitch",
                      value: pitch,
                      min: -12,
                      max: 12,
                      step: 1,
                      setter: setPitch,
                      fmt: (value: number) => `${value > 0 ? "+" : ""}${value} st`,
                    },
                    {
                      label: "Age Modulation",
                      value: ageModulation,
                      min: -10,
                      max: 10,
                      step: 1,
                      setter: setAgeModulation,
                      fmt: (value: number) => `${value > 0 ? "+" : ""}${value}`,
                    },
                    {
                      label: "Gender Modulation",
                      value: genderModulation,
                      min: -5,
                      max: 5,
                      step: 1,
                      setter: setGenderModulation,
                      fmt: (value: number) =>
                        value < 0 ? `Fem ${Math.abs(value)}` : value > 0 ? `Masc ${value}` : "Neutral",
                    },
                    {
                      label: "Echo",
                      value: echoAmount,
                      min: 0,
                      max: 100,
                      step: 5,
                      setter: setEchoAmount,
                      fmt: (value: number) => `${value}%`,
                    },
                    {
                      label: "Reverb",
                      value: reverbAmount,
                      min: 0,
                      max: 100,
                      step: 5,
                      setter: setReverbAmount,
                      fmt: (value: number) => `${value}%`,
                    },
                  ].map(({ label, value, min, max, step, setter, fmt }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-slate-300">{label}</span>
                        <span className="text-sm font-mono text-[#6366f1]">{fmt(value)}</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(event) => setter(parseFloat(event.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Emotion Preset</label>
                    <div className="flex flex-wrap gap-2">
                      {emotionPresets.map((emotion) => (
                        <button
                          key={emotion}
                          onClick={() => setEmotionPreset(emotion)}
                          className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all ${
                            emotionPreset === emotion
                              ? "bg-[#6366f1] text-white"
                              : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8"
                          }`}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      These controls stay on the current frontend for preview and future backend expansion.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={isProcessing || !recordedAudioUrl}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl gradient-bg text-white text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Convert Accent
                {selectedAccentObj && ` -> ${selectedAccentObj.flag} ${selectedAccentObj.name}`}
              </>
            )}
          </button>

          {isProcessing && (
            <LoadingIndicator
              progress={processingProgress}
              label="Processing voice transformation..."
              variant="bar"
            />
          )}

          {!isProcessing && processedAudioUrl && (
            <div className="text-center text-sm text-slate-500">
              Latest backend processing time: {latencyMs}ms
            </div>
          )}
        </div>
      </div>

      {processedAudioUrl && !isProcessing && (
        <div className="mt-8 fade-in">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Results</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <AudioPlayer
              src={recordedAudioUrl}
              label="Original Recording"
              accent="Your Voice"
              accentColor="#64748b"
              showDownload
            />
            <AudioPlayer
              src={processedAudioUrl}
              label="Converted Audio"
              accent={selectedAccentObj?.name ?? "Converted"}
              accentColor={selectedAccentObj?.color ?? "#6366f1"}
              showDownload
            />
          </div>

          <div className="glass-card p-5 mb-5">
            <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#6366f1]" />
              Waveform Comparison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WaveformVisualizer label="Original" color="#64748b" secondaryColor="#94a3b8" height={70} />
              <WaveformVisualizer
                label="Converted"
                color={selectedAccentObj?.color ?? "#6366f1"}
                secondaryColor="#8b5cf6"
                height={70}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = processedAudioUrl;
                link.download = "tone-weaver-converted.wav";
                link.click();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] font-medium hover:bg-[#6366f1]/25 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Converted
            </button>
            <button
              onClick={() => setShowShare((show) => !show)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899]/15 border border-[#ec4899]/30 text-[#ec4899] font-medium hover:bg-[#ec4899]/25 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {showShare && (
            <div className="mt-4 max-w-md fade-in">
              <SharingButtons audioId={savedRecordId} title="My Tone Weaver Conversion" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
