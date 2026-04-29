"use client";

import type { AudioRecord } from "@/mock-data/audios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TONE_WEAVER_API_URL ?? "http://127.0.0.1:8000";

export interface ComparisonResponse {
  original: string;
  converted: string;
  accent: string;
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

function buildAudioDataUrl(base64: string) {
  return `data:audio/wav;base64,${base64}`;
}

function createAudioFile(blob: Blob, filename: string) {
  return new File([blob], filename, { type: blob.type || "audio/webm" });
}

function resolveAudioUrl(url?: string | null) {
  if (!url) return null;
  if (/^(blob:|data:|https?:\/\/)/.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

function hydrateRecord(record: AudioRecord): AudioRecord {
  return {
    ...record,
    audioUrl: resolveAudioUrl(record.audioUrl),
    originalAudioUrl: resolveAudioUrl(record.originalAudioUrl),
  };
}

function appendAudioBlob(formData: FormData, fieldName: string, audioBlob: Blob, filename: string) {
  formData.append(fieldName, createAudioFile(audioBlob, filename));
}

async function parseError(response: Response) {
  try {
    const data = await response.json();
    return data.detail || data.error || "Request failed.";
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

async function postAudioForBlob(
  endpoint: string,
  audioBlob: Blob,
  fields: Record<string, string | number | undefined>,
  extraFiles?: Record<string, Blob | null | undefined>,
) {
  const formData = new FormData();
  appendAudioBlob(formData, "audio", audioBlob, "tone-weaver-recording.webm");

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  Object.entries(extraFiles ?? {}).forEach(([key, value]) => {
    if (value) {
      appendAudioBlob(formData, key, value, `tone-weaver-${key}.webm`);
    }
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.blob();
}

async function postAudioForJson<T>(
  endpoint: string,
  audioBlob: Blob,
  fields: Record<string, string | number | undefined>,
  extraFiles?: Record<string, Blob | null | undefined>,
) {
  const formData = new FormData();
  appendAudioBlob(formData, "audio", audioBlob, "tone-weaver-recording.webm");

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  Object.entries(extraFiles ?? {}).forEach(([key, value]) => {
    if (value) {
      appendAudioBlob(formData, key, value, `tone-weaver-${key}.webm`);
    }
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function convertAccent(
  audioBlob: Blob,
  accent: string,
  voiceType?: "male" | "female" | null,
) {
  return postAudioForBlob("/api/convert-accent", audioBlob, {
    accent,
    voice_type: voiceType ?? undefined,
  });
}

export async function createHybridAccent(
  audioBlob: Blob,
  accent1: string,
  accent2: string,
  mixPercentage: number,
) {
  return postAudioForBlob("/api/hybrid-accent", audioBlob, {
    accent1,
    accent2,
    mix_percentage: mixPercentage,
  });
}

export async function compareAccent(
  audioBlob: Blob,
  accent: string,
  voiceType?: "male" | "female" | null,
) {
  const response = await postAudioForJson<ComparisonResponse>("/api/compare", audioBlob, {
    accent,
    voice_type: voiceType ?? undefined,
  });

  return {
    ...response,
    originalUrl: buildAudioDataUrl(response.original),
    convertedUrl: buildAudioDataUrl(response.converted),
  };
}

export async function saveAudioRecord(
  audioBlob: Blob,
  payload: {
    accent: string;
    userId?: string;
    title: string;
    originalAccent?: string;
    tags?: string[];
    mixPercentage?: number;
    originalAudioBlob?: Blob;
  },
) {
  const response = await postAudioForJson<{ saved: boolean; record: AudioRecord }>(
    "/api/save-audio",
    audioBlob,
    {
      accent: payload.accent,
      user_id: payload.userId ?? "guest",
      title: payload.title,
      original_accent: payload.originalAccent ?? "american",
      tags: payload.tags?.join(",") ?? "",
      mix_percentage: payload.mixPercentage,
    },
    {
      original_audio: payload.originalAudioBlob,
    },
  );

  return hydrateRecord(response.record);
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return ((await response.json()) as AudioRecord[]).map(hydrateRecord);
}

export async function toggleHistoryFavorite(recordId: string) {
  const response = await fetch(`${API_BASE_URL}/api/history/${recordId}/favorite`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return hydrateRecord((await response.json()) as AudioRecord);
}

export async function deleteHistoryRecord(recordId: string) {
  const response = await fetch(`${API_BASE_URL}/api/history/${recordId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as { deleted: boolean };
}
