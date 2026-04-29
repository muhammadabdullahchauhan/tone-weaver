"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronRight, Volume2 } from "lucide-react";
import LearningExercise from "@/components/LearningExercise";
import PhoneticBreakdown from "@/components/PhoneticBreakdown";
import DiagramModal from "@/components/DiagramModal";
import { phoneticLessons } from "@/mock-data/phonetics";
import { accents } from "@/mock-data/accents";

const accentVoices: Record<string, string> = {
  american: "en-US",
  british: "en-GB",
  australian: "en-AU",
  indian: "en-IN",
};

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<"practice" | "phonetics" | "lessons">("practice");
  const [filterAccent, setFilterAccent] = useState("all");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [lessonScores] = useState<Record<string, number>>(
    Object.fromEntries(phoneticLessons.map((lesson, index) => [lesson.id, 72 + ((index * 7) % 23)])),
  );

  const filteredLessons = useMemo(
    () =>
      filterAccent === "all"
        ? phoneticLessons
        : phoneticLessons.filter((lesson) => lesson.accent === filterAccent),
    [filterAccent],
  );
  const [selectedLessonId, setSelectedLessonId] = useState(phoneticLessons[0]?.id ?? "");
  const selectedLesson = filteredLessons.find((lesson) => lesson.id === selectedLessonId) ?? filteredLessons[0] ?? null;
  const currentLessonScore = selectedLesson ? lessonScores[selectedLesson.id] ?? 75 : null;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakLessonSentence = (rate: number) => {
    if (!selectedLesson || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedLesson.sentence);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.lang = accentVoices[selectedLesson.accent] ?? "en-GB";
    window.speechSynthesis.speak(utterance);
    setPlaybackSpeed(rate);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Learning Mode</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Phonetic breakdowns, pronunciation exercises, and guided practice.
              </p>
            </div>
          </div>
          <DiagramModal />
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8 mb-6 max-w-md">
        {[
          { id: "practice", label: "Practice" },
          { id: "phonetics", label: "Phonetics" },
          { id: "lessons", label: "Lessons" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? "bg-[#f59e0b] text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "practice" && (
        <div className="fade-in">
          <LearningExercise />
        </div>
      )}

      {activeTab === "phonetics" && (
        <div className="fade-in space-y-5">
          <div className="glass-card p-5">
            <h2 className="text-slate-200 font-semibold mb-4">IPA Phonetics Guide</h2>

            <div className="mb-6">
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">
                Vowel Sounds
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { ipa: "/iː/", example: "f**ee**t", accent: "All" },
                  { ipa: "/ɪ/", example: "k**i**t", accent: "All" },
                  { ipa: "/e/", example: "dr**e**ss", accent: "All" },
                  { ipa: "/æ/", example: "tr**a**p", accent: "American" },
                  { ipa: "/ɑː/", example: "b**a**th", accent: "British" },
                  { ipa: "/ɒ/", example: "l**o**t", accent: "British" },
                  { ipa: "/ɔː/", example: "th**ou**ght", accent: "British" },
                  { ipa: "/ʊ/", example: "f**oo**t", accent: "All" },
                  { ipa: "/uː/", example: "g**oo**se", accent: "All" },
                  { ipa: "/ʌ/", example: "str**u**t", accent: "All" },
                  { ipa: "/ɜː/", example: "n**ur**se", accent: "British" },
                  { ipa: "/ə/", example: "**a**bout", accent: "All" },
                ].map(({ ipa, example, accent: accentLabel }) => (
                  <div
                    key={ipa}
                    className="flex flex-col items-center p-3 rounded-xl bg-white/3 border border-white/8 hover:border-[#6366f1]/30 transition-all cursor-default"
                  >
                    <span className="text-lg font-mono font-bold text-[#6366f1]">{ipa}</span>
                    <span
                      className="text-xs text-slate-400 mt-1 text-center"
                      dangerouslySetInnerHTML={{ __html: example.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>') }}
                    />
                    <span className="text-[10px] text-slate-600 mt-1">{accentLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">
                Key Consonant Differences
              </h3>
              <div className="space-y-3">
                {[
                  {
                    feature: "Rhotic /r/",
                    british: "Silent at word or syllable end (car -> cɑː)",
                    american: "Pronounced everywhere (car -> kɑːr)",
                    australian: "Like British, mostly non-rhotic",
                  },
                  {
                    feature: "T-Flapping",
                    british: "Clear /t/ in words like butter",
                    american: "Often flapped between vowels (butter -> bʌɾər)",
                    australian: "Flaps show up in casual speech too",
                  },
                  {
                    feature: "Glottal Stop",
                    british: "Common in casual speech (bottle -> bo'l)",
                    american: "Less common",
                    australian: "Appears in relaxed conversation",
                  },
                ].map(({ feature, british, american, australian }) => (
                  <div key={feature} className="p-4 rounded-xl bg-white/3 border border-white/8">
                    <div className="font-semibold text-slate-200 mb-2">{feature}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#6366f1]/20 text-[#6366f1] font-medium">British</span>
                        <span className="text-slate-400">{british}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#ec4899]/20 text-[#ec4899] font-medium">American</span>
                        <span className="text-slate-400">{american}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] font-medium">Australian</span>
                        <span className="text-slate-400">{australian}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "lessons" && (
        <div className="fade-in">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 shrink-0 space-y-3">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
                  Filter by Accent
                </label>
                <select
                  value={filterAccent}
                  onChange={(event) => setFilterAccent(event.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a1a35] border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-[#6366f1] appearance-none"
                >
                  <option value="all">All Accents</option>
                  {accents.map((accent) => (
                    <option key={accent.id} value={accent.id}>
                      {accent.name}
                    </option>
                  ))}
                </select>
              </div>

              {filteredLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedLesson?.id === lesson.id
                      ? "border-[#f59e0b] bg-[#f59e0b]/8"
                      : "border-white/8 bg-white/3 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${selectedLesson?.id === lesson.id ? "text-[#f59e0b]" : "text-slate-300"}`}>
                      {lesson.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{lesson.sentence}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: lesson.difficulty === "Easy" ? "#10b98122" : lesson.difficulty === "Medium" ? "#f59e0b22" : "#ef444422",
                        color: lesson.difficulty === "Easy" ? "#10b981" : lesson.difficulty === "Medium" ? "#f59e0b" : "#ef4444",
                      }}
                    >
                      {lesson.difficulty}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600 ml-auto" />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-4">
              {selectedLesson ? (
                <>
                  <PhoneticBreakdown lesson={selectedLesson} score={currentLessonScore ?? undefined} />

                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-slate-200 font-medium flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-[#6366f1]" />
                        Slow Playback Practice
                      </h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      Listen to the sentence at reduced speed to catch pronunciation details.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {[0.5, 0.75, 1.0].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => speakLessonSentence(speed)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1] text-sm hover:bg-[#6366f1]/20 transition-all"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          {speed}x Speed {playbackSpeed === speed ? "(Playing)" : ""}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Browser speech synthesis is used here, so voice quality depends on the device.
                    </p>
                  </div>

                  <div className="glass-card p-4">
                    <h3 className="text-slate-200 font-medium mb-4">Learning Progress</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Lessons Available", value: filteredLessons.length, total: phoneticLessons.length, color: "#10b981" },
                        { label: "Avg Score", value: `${currentLessonScore ?? 0}%`, total: null, color: "#f59e0b" },
                        { label: "Playback Speed", value: `${playbackSpeed}x`, total: null, color: "#6366f1" },
                        { label: "Accents Studied", value: new Set(phoneticLessons.map((lesson) => lesson.accent)).size, total: accents.length, color: "#ec4899" },
                      ].map(({ label, value, total, color }) => (
                        <div
                          key={label}
                          className="p-3 rounded-xl border text-center"
                          style={{ borderColor: color + "30", background: color + "0a" }}
                        >
                          <div className="text-xl font-bold" style={{ color }}>{value}</div>
                          {total && <div className="text-xs text-slate-500">/ {total}</div>}
                          <div className="text-xs text-slate-500 mt-1">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-card p-10 text-center">
                  <h3 className="text-slate-200 font-semibold text-lg mb-2">No lessons for this accent yet</h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Switch the filter back to another accent to continue practicing.
                  </p>
                  <button
                    onClick={() => setFilterAccent("all")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90"
                  >
                    Show all lessons
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
