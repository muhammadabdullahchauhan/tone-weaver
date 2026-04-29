"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Waves } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import { useApp } from "@/contexts/AppContext";

export default function SharedAudioPage() {
  const params = useParams<{ id: string }>();
  const { audioHistory } = useApp();
  const id = params?.id;

  const selected = useMemo(
    () => audioHistory.find((record) => record.id === id && record.audioUrl),
    [audioHistory, id],
  );

  if (!selected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/15 text-[#6366f1] flex items-center justify-center mx-auto mb-4">
          <Waves className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Shared audio not found</h1>
        <p className="text-slate-400 mb-6">This shared link may be invalid, expired, or not loaded yet.</p>
        <Link
          href="/share"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90"
        >
          Back to Share
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{selected.title}</h1>
            <p className="text-slate-400">
              {selected.originalAccent}
              {" -> "}
              {selected.targetAccent}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div className="flex items-center justify-end gap-1 mb-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(selected.createdAt).toLocaleDateString()}
            </div>
            <div>{selected.duration}s clip</div>
          </div>
        </div>

        <AudioPlayer
          src={selected.audioUrl}
          label={selected.title}
          accent={selected.targetAccent}
          waveformData={selected.waveformData}
          accentColor="#6366f1"
          showDownload
        />

        {selected.originalAudioUrl && (
          <div className="mt-4">
            <AudioPlayer
              src={selected.originalAudioUrl}
              label="Original Recording"
              accent={selected.originalAccent}
              waveformData={selected.waveformData}
              accentColor="#64748b"
              showDownload
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}
