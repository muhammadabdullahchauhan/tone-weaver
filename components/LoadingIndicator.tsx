"use client";

interface LoadingIndicatorProps {
  progress?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "bar" | "spinner" | "dots" | "wave";
}

export default function LoadingIndicator({
  progress,
  label = "Processing...",
  size = "md",
  variant = "bar",
}: LoadingIndicatorProps) {
  if (variant === "spinner") {
    const sz = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7";
    return (
      <div className="flex items-center gap-3">
        <div
          className={`${sz} border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full animate-spin`}
        />
        {label && <span className="text-slate-400 text-sm">{label}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#6366f1]"
              style={{ animation: `recordingPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        {label && <span className="text-slate-400 text-sm">{label}</span>}
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-end gap-0.5 h-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#6366f1] to-[#ec4899]"
              style={{
                height: "100%",
                animation: `waveBar 1s ease-in-out ${i * 0.12}s infinite`,
              }}
            />
          ))}
        </div>
        {label && <span className="text-slate-400 text-sm">{label}</span>}
      </div>
    );
  }

  // Bar variant (default)
  return (
    <div className="w-full">
      {(label || progress !== undefined) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{label}</span>
          {progress !== undefined && (
            <span className="text-sm font-mono text-[#6366f1]">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full gradient-bg transition-all duration-150 ease-out"
          style={{ width: `${progress ?? 0}%` }}
        />
      </div>
    </div>
  );
}
