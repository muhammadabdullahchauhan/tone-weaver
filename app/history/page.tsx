"use client";

import { useState } from "react";
import {
  Clock,
  Heart,
  Download,
  Trash2,
  Share2,
  Search,
  Filter,
  Play,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import AudioPlayer from "@/components/AudioPlayer";
import SharingButtons from "@/components/SharingButtons";
import { triggerDownload } from "@/lib/sharing";

export default function HistoryPage() {
  const { audioHistory, favoriteIds, toggleFavorite, deleteFromHistory, showNotification } = useApp();
  const [search, setSearch] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showShareFor, setShowShareFor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "duration" | "score">("date");

  const filtered = audioHistory
    .filter((a) => {
      const matchSearch =
        search === "" ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.targetAccent.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchFav = !filterFavorites || favoriteIds.includes(a.id);
      return matchSearch && matchFav;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "duration") return b.duration - a.duration;
      return b.stats.accentScore - a.stats.accentScore;
    });

  const activeSelectedId =
    selectedId && filtered.some((audio) => audio.id === selectedId) ? selectedId : filtered[0]?.id ?? null;
  const selected = filtered.find((a) => a.id === activeSelectedId) ?? null;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    if (selectedId === id) setSelectedId(null);
    showNotification("Recording deleted", "info");
  };

  const handleDownload = (audioUrl: string | null | undefined, title: string) => {
    if (!audioUrl) {
      showNotification("This recording does not have a downloadable file yet.", "error");
      return;
    }

    triggerDownload(audioUrl, `${title.replace(/\s+/g, "-").toLowerCase()}-tone-weaver.wav`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#6366f1]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Recording History</h1>
              <p className="text-slate-400 text-sm mt-0.5">{audioHistory.length} recordings saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{favoriteIds.length} favorites</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, accent, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1a1a35] border border-white/10 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
          />
        </div>
        <button
          onClick={() => setFilterFavorites((f) => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            filterFavorites
              ? "bg-red-500/15 border-red-500/30 text-red-400"
              : "bg-white/3 border-white/8 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Heart className={`w-4 h-4 ${filterFavorites ? "fill-current" : ""}`} />
          Favorites
        </button>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2.5 rounded-xl bg-[#1a1a35] border border-white/10 text-slate-300 text-sm focus:outline-none appearance-none"
          >
            <option value="date">Newest First</option>
            <option value="duration">Longest First</option>
            <option value="score">Best Score</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <div className="text-5xl mb-4">🔇</div>
          <h3 className="text-slate-300 font-semibold text-lg mb-2">No Recordings Found</h3>
          <p className="text-slate-500 text-sm mb-5">
            {search ? `No results for "${search}"` : "Your recording history is empty."}
          </p>
          <Link href="/record" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90">
            Start Recording
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((audio) => {
              const isFav = favoriteIds.includes(audio.id);
              const isSelected = activeSelectedId === audio.id;
              return (
                <div
                  key={audio.id}
                  className={`glass-card p-4 cursor-pointer transition-all hover:border-white/15 ${
                    isSelected ? "border-[#6366f1]/40 bg-[#6366f1]/5" : ""
                  }`}
                  onClick={() => setSelectedId(isSelected ? null : audio.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Play button */}
                    <div className="w-10 h-10 rounded-xl bg-[#6366f1]/15 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-[#6366f1] fill-current" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-slate-200 font-semibold">{audio.title}</h3>
                        {isFav && <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">{audio.originalAccent}</span>
                        <span className="text-xs text-slate-600">→</span>
                        <span className="text-xs text-[#6366f1]">{audio.targetAccent}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-slate-600">{fmtDate(audio.createdAt)}</span>
                        <span className="text-xs text-slate-600">{fmtDuration(audio.duration)}</span>
                        <span className="text-xs text-[#10b981]">Score: {audio.stats.accentScore}%</span>
                        <div className="flex gap-1">
                          {audio.tags.map((tag, tagIndex) => (
                            <span key={`${audio.id}-${tag}-${tagIndex}`} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(audio.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          isFav ? "text-red-400 bg-red-500/10" : "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => setShowShareFor(showShareFor === audio.id ? null : audio.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#ec4899] hover:bg-[#ec4899]/10 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(audio.audioUrl, audio.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#6366f1] hover:bg-[#6366f1]/10 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(audio.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {showShareFor === audio.id && (
                    <div className="mt-3 fade-in" onClick={(e) => e.stopPropagation()}>
                      <SharingButtons audioId={audio.id} title={audio.title} compact />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="space-y-4">
            {selected ? (
              <div className="space-y-4 fade-in">
                <AudioPlayer
                  src={selected.audioUrl}
                  label={selected.title}
                  accent={selected.targetAccent}
                  waveformData={selected.waveformData}
                  accentColor="#6366f1"
                  showDownload
                />
                <div className="glass-card p-4">
                  <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#10b981]" />
                    Performance Stats
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Accent Score", value: selected.stats.accentScore, color: "#10b981" },
                      { label: "Similarity", value: selected.stats.similarity, color: "#6366f1" },
                      { label: "Quality", value: selected.stats.quality, color: "#f59e0b" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-slate-400">{label}</span>
                          <span className="text-xs font-bold" style={{ color }}>{value}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/8">
                          <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-t border-white/8">
                      <span className="text-xs text-slate-400">Latency</span>
                      <span className="text-xs font-mono text-[#6366f1]">{selected.stats.latency}ms</span>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <h3 className="text-slate-300 font-medium mb-2">Details</h3>
                  <dl className="space-y-2 text-sm">
                    {[
                      { label: "Created", value: fmtDate(selected.createdAt) },
                      { label: "Duration", value: fmtDuration(selected.duration) },
                      { label: "Source Accent", value: selected.originalAccent },
                      { label: "Target Accent", value: selected.targetAccent },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="text-slate-300">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a recording to view details and play.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
