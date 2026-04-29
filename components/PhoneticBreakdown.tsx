"use client";

import { useState } from "react";
import { phoneticLessons, PhoneticLesson } from "@/mock-data/phonetics";
import { ChevronDown, Info } from "lucide-react";

interface PhoneticBreakdownProps {
  lessonId?: string;
  lesson?: PhoneticLesson;
  score?: number;
}

export default function PhoneticBreakdown({ lessonId, lesson: propLesson, score }: PhoneticBreakdownProps) {
  const [showTips, setShowTips] = useState(false);
  const [hoveredItemKey, setHoveredItemKey] = useState<string | null>(null);

  const lesson = propLesson ?? phoneticLessons.find((l) => l.id === lessonId) ?? phoneticLessons[0];

  if (!lesson) return null;

  const difficultyColor = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  }[lesson.difficulty];

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: difficultyColor + "22", color: difficultyColor }}
          >
            {lesson.difficulty}
          </span>
          <p className="mt-2 text-slate-300 font-medium">{lesson.sentence}</p>
          <p className="text-sm text-slate-500 font-mono mt-1">/{lesson.phonetic}/</p>
        </div>
        {score !== undefined && (
          <div className="text-right ml-4 shrink-0">
            <div
              className="text-3xl font-bold"
              style={{ color: score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444" }}
            >
              {score}
            </div>
            <div className="text-xs text-slate-500">Score</div>
          </div>
        )}
      </div>

      {/* Word-by-word breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Word-by-Word Breakdown
        </h4>
        <div className="flex flex-wrap gap-2">
          {lesson.breakdown.map((item, index) => {
            const itemKey = `${lesson.id}-${item.word}-${item.ipa}-${index}`;
            const isHovered = hoveredItemKey === itemKey;
            return (
              <div
                key={itemKey}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredItemKey(itemKey)}
                onMouseLeave={() => setHoveredItemKey(null)}
              >
                <div
                  className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${
                    item.stressed
                      ? "border-[#6366f1]/50 bg-[#6366f1]/10"
                      : "border-white/8 bg-white/3"
                  } ${isHovered ? "scale-105" : ""}`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      item.stressed ? "text-slate-100" : "text-slate-400"
                    }`}
                  >
                    {item.word}
                  </span>
                  <span className="text-xs font-mono text-[#6366f1] mt-0.5">/{item.ipa}/</span>
                  {item.stressed && (
                    <span className="text-[10px] text-[#ec4899] mt-0.5">stressed</span>
                  )}
                </div>
                {isHovered && item.notes && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-48 p-2.5 rounded-xl bg-[#1a1a35] border border-white/10 text-xs text-slate-300 text-center shadow-xl">
                    {item.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips toggle */}
      <div>
        <button
          onClick={() => setShowTips((p) => !p)}
          className="flex items-center gap-2 text-sm text-[#6366f1] hover:text-[#8b5cf6] transition-colors"
        >
          <Info className="w-4 h-4" />
          Pronunciation Tips
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTips ? "rotate-180" : ""}`} />
        </button>
        {showTips && (
          <ul className="mt-3 space-y-2 fade-in">
            {lesson.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-[#6366f1]/15 text-[#6366f1] text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
