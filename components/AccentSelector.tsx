"use client";

import { accents } from "@/mock-data/accents";
import { Check } from "lucide-react";

interface AccentSelectorProps {
  value: string;
  onChange: (accentId: string) => void;
  label?: string;
  exclude?: string;
  compact?: boolean;
}

export default function AccentSelector({
  value,
  onChange,
  label = "Select Accent",
  exclude,
  compact = false,
}: AccentSelectorProps) {
  const filtered = exclude ? accents.filter((a) => a.id !== exclude) : accents;
  const selected = accents.find((a) => a.id === value);

  if (compact) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a35] border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-[#6366f1] transition-colors appearance-none cursor-pointer"
        >
          {filtered.map((a) => (
            <option key={a.id} value={a.id}>
              {a.flag} {a.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          {selected && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: selected.color + "22", color: selected.color }}
            >
              {selected.difficulty}
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((accent) => {
          const active = value === accent.id;
          return (
            <button
              key={accent.id}
              onClick={() => onChange(accent.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl border transition-all duration-200 text-left ${
                active
                  ? "border-[#6366f1] bg-[#6366f1]/10"
                  : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
              }`}
            >
              {active && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6366f1] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <span className="text-xl mb-1">{accent.flag}</span>
              <span className={`text-sm font-semibold ${active ? "text-[#6366f1]" : "text-slate-200"}`}>
                {accent.name}
              </span>
              <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{accent.region}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 p-3 rounded-xl bg-white/3 border border-white/8">
          <p className="text-xs text-slate-400 leading-relaxed">{selected.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selected.features.slice(0, 2).map((f) => (
              <span
                key={f}
                className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
