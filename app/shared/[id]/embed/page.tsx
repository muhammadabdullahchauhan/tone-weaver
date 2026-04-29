"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AudioPlayer from "@/components/AudioPlayer";
import { useApp } from "@/contexts/AppContext";

export default function SharedAudioEmbedPage() {
  const params = useParams<{ id: string }>();
  const { audioHistory } = useApp();
  const id = params?.id;

  const selected = useMemo(
    () => audioHistory.find((record) => record.id === id && record.audioUrl),
    [audioHistory, id],
  );

  if (!selected?.audioUrl) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-slate-200 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-3">Shared audio is unavailable.</p>
          <Link href="/share" className="text-sm text-[#6366f1] hover:text-[#818cf8]">
            Open Tone Weaver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] p-4">
      <div className="max-w-2xl mx-auto">
        <AudioPlayer
          src={selected.audioUrl}
          label={selected.title}
          accent={selected.targetAccent}
          waveformData={selected.waveformData}
          accentColor="#6366f1"
          compact
        />
      </div>
    </div>
  );
}
