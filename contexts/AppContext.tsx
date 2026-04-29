"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { AudioRecord } from "@/mock-data/audios";
import { deleteHistoryRecord, fetchHistory, toggleHistoryFavorite } from "@/lib/tone-weaver-api";

export type ProcessingStatus = "idle" | "recording" | "processing" | "done" | "error";

export interface ComparisonResult {
  accent: string;
  originalUrl: string;
  convertedUrl: string;
  stats: {
    latency: number;
    similarity: number;
    quality: number;
    accentScore: number;
  };
  keyDifferences: Array<{
    feature: string;
    original: string;
    converted: string;
  }>;
  originalWaveform: number[];
  convertedWaveform: number[];
}

export interface AppState {
  // Recording
  isRecording: boolean;
  recordedAudioUrl: string | null;
  recordedAudioBlob: Blob | null;
  processedAudioUrl: string | null;
  processingStatus: ProcessingStatus;
  processingProgress: number;

  // Accent settings
  selectedAccent: string;
  secondaryAccent: string;
  hybridRatio: number;

  // Voice selection
  selectedVoiceType: "male" | "female" | null;

  // Modulation settings
  speed: number;
  pitch: number;
  echoAmount: number;
  reverbAmount: number;
  ageModulation: number;
  genderModulation: number;
  emotionPreset: string;

  // History & Favorites
  audioHistory: AudioRecord[];
  favoriteIds: string[];

  // UI
  isProcessing: boolean;
  errorMessage: string | null;
  latencyMs: number;
  notification: { message: string; type: "success" | "error" | "info" } | null;
  latestComparison: ComparisonResult | null;
}

interface AppContextType extends AppState {
  setIsRecording: (v: boolean) => void;
  setRecordedAudioUrl: (url: string | null) => void;
  setRecordedAudioBlob: (blob: Blob | null) => void;
  setProcessedAudioUrl: (url: string | null) => void;
  setProcessingStatus: (s: ProcessingStatus) => void;
  setProcessingProgress: (p: number) => void;
  setSelectedAccent: (a: string) => void;
  setSecondaryAccent: (a: string) => void;
  setHybridRatio: (r: number) => void;
  setSelectedVoiceType: (voiceType: "male" | "female" | null) => void;
  setSpeed: (s: number) => void;
  setPitch: (p: number) => void;
  setEchoAmount: (e: number) => void;
  setReverbAmount: (r: number) => void;
  setAgeModulation: (a: number) => void;
  setGenderModulation: (g: number) => void;
  setEmotionPreset: (e: string) => void;
  toggleFavorite: (id: string) => void;
  addToHistory: (record: AudioRecord) => void;
  deleteFromHistory: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  clearError: () => void;
  showNotification: (message: string, type?: "success" | "error" | "info") => void;
  simulateProcessing: (onComplete?: () => void) => void;
  runAsyncProcessing: <T>(job: () => Promise<T>) => Promise<T>;
  setLatestComparison: (comparison: ComparisonResult | null) => void;
}

const defaultState: AppState = {
  isRecording: false,
  recordedAudioUrl: null,
  recordedAudioBlob: null,
  processedAudioUrl: null,
  processingStatus: "idle",
  processingProgress: 0,
  selectedAccent: "british",
  secondaryAccent: "american",
  hybridRatio: 50,
  selectedVoiceType: null,
  speed: 1.0,
  pitch: 0,
  echoAmount: 0,
  reverbAmount: 0,
  ageModulation: 0,
  genderModulation: 0,
  emotionPreset: "neutral",
  audioHistory: [],
  favoriteIds: [],
  isProcessing: false,
  errorMessage: null,
  latencyMs: 0,
  notification: null,
  latestComparison: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const update = (partial: Partial<AppState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const simulateProcessing = useCallback((onComplete?: () => void) => {
    update({ isProcessing: true, processingStatus: "processing", processingProgress: 0 });
    const start = Date.now();
    const interval = setInterval(() => {
      setState((prev) => {
        const next = prev.processingProgress + Math.random() * 18 + 8;
        if (next >= 100) {
          clearInterval(interval);
          const latency = Date.now() - start;
          setTimeout(() => {
            update({
              processingProgress: 100,
              isProcessing: false,
              processingStatus: "done",
              latencyMs: latency,
            });
            onComplete?.();
          }, 150);
          return { ...prev, processingProgress: 95 };
        }
        return { ...prev, processingProgress: Math.min(next, 95) };
      });
    }, 80);
  }, []);

  const runAsyncProcessing = useCallback(async function runAsyncProcessing<T>(job: () => Promise<T>): Promise<T> {
    update({ isProcessing: true, processingStatus: "processing", processingProgress: 8, errorMessage: null });
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        processingProgress: Math.min(prev.processingProgress + Math.random() * 12 + 3, 94),
      }));
    }, 140);

    try {
      const result = await job();
      clearInterval(interval);
      update({
        processingProgress: 100,
        isProcessing: false,
        processingStatus: "done",
        latencyMs: Date.now() - startedAt,
      });
      return result;
    } catch (error) {
      clearInterval(interval);
      update({
        processingProgress: 0,
        isProcessing: false,
        processingStatus: "error",
        errorMessage: error instanceof Error ? error.message : "Processing failed.",
      });
      throw error;
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => {
      const existing = prev.audioHistory.find((item) => item.id === id);
      const willFavorite = !existing?.isFavorite;
      const favoriteIds = willFavorite
        ? [...prev.favoriteIds.filter((fav) => fav !== id), id]
        : prev.favoriteIds.filter((fav) => fav !== id);
      return {
        ...prev,
        favoriteIds,
        audioHistory: prev.audioHistory.map((audio) =>
          audio.id === id ? { ...audio, isFavorite: willFavorite } : audio
        ),
      };
    });

    toggleHistoryFavorite(id)
      .then((record) => {
        setState((prev) => ({
          ...prev,
          favoriteIds: record.isFavorite
            ? [...prev.favoriteIds.filter((fav) => fav !== id), id]
            : prev.favoriteIds.filter((fav) => fav !== id),
          audioHistory: prev.audioHistory.map((audio) => (audio.id === id ? record : audio)),
        }));
      })
      .catch(() => {
        setState((prev) => {
          const existing = prev.audioHistory.find((item) => item.id === id);
          const willFavorite = !existing?.isFavorite;
          return {
            ...prev,
            favoriteIds: willFavorite
              ? [...prev.favoriteIds.filter((fav) => fav !== id), id]
              : prev.favoriteIds.filter((fav) => fav !== id),
            audioHistory: prev.audioHistory.map((audio) =>
              audio.id === id ? { ...audio, isFavorite: willFavorite } : audio
            ),
          };
        });
      });
  }, []);

  const addToHistory = useCallback((record: AudioRecord) => {
    setState((prev) => ({ ...prev, audioHistory: [record, ...prev.audioHistory] }));
  }, []);

  const refreshHistoryInternal = useCallback(async () => {
    try {
      const records = await fetchHistory();
      setState((prev) => ({
        ...prev,
        audioHistory: records,
        favoriteIds: records.filter((record) => record.isFavorite).map((record) => record.id),
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        audioHistory: prev.audioHistory,
        favoriteIds: prev.audioHistory.filter((record) => record.isFavorite).map((record) => record.id),
      }));
    }
  }, []);

  const deleteFromHistory = useCallback(async (id: string) => {
    setState((prev) => ({
      ...prev,
      favoriteIds: prev.favoriteIds.filter((fav) => fav !== id),
      audioHistory: prev.audioHistory.filter((a) => a.id !== id),
    }));

    try {
      await deleteHistoryRecord(id);
    } catch {
      await refreshHistoryInternal();
    }
  }, [refreshHistoryInternal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshHistoryInternal();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshHistoryInternal]);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      update({ notification: { message, type } });
      setTimeout(() => update({ notification: null }), 3500);
    },
    []
  );

  const ctx: AppContextType = {
    ...state,
    setIsRecording: (v) => update({ isRecording: v }),
    setRecordedAudioUrl: (url) => update({ recordedAudioUrl: url }),
    setRecordedAudioBlob: (blob) => update({ recordedAudioBlob: blob }),
    setProcessedAudioUrl: (url) => update({ processedAudioUrl: url }),
    setProcessingStatus: (s) => update({ processingStatus: s }),
    setProcessingProgress: (p) => update({ processingProgress: p }),
    setSelectedAccent: (a) => update({ selectedAccent: a }),
    setSecondaryAccent: (a) => update({ secondaryAccent: a }),
    setHybridRatio: (r) => update({ hybridRatio: r }),
    setSelectedVoiceType: (voiceType) => update({ selectedVoiceType: voiceType }),
    setSpeed: (s) => update({ speed: s }),
    setPitch: (p) => update({ pitch: p }),
    setEchoAmount: (e) => update({ echoAmount: e }),
    setReverbAmount: (r) => update({ reverbAmount: r }),
    setAgeModulation: (a) => update({ ageModulation: a }),
    setGenderModulation: (g) => update({ genderModulation: g }),
    setEmotionPreset: (e) => update({ emotionPreset: e }),
    toggleFavorite,
    addToHistory,
    deleteFromHistory,
    refreshHistory: refreshHistoryInternal,
    clearError: () => update({ errorMessage: null }),
    showNotification,
    simulateProcessing,
    runAsyncProcessing,
    setLatestComparison: (comparison) => update({ latestComparison: comparison }),
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
