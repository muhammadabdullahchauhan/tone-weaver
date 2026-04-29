"use client";

type VoiceType = "male" | "female";

interface VoiceTypeSelectorProps {
  value: VoiceType | null;
  onChange: (voiceType: VoiceType) => void;
  error?: string | null;
}

const voiceTypeOptions: Array<{ id: VoiceType; label: string; description: string; icon: string }> = [
  { id: "male", label: "Male", description: "Convert output to a male voice profile", icon: "M" },
  { id: "female", label: "Female", description: "Convert output to a female voice profile", icon: "F" },
];

export default function VoiceTypeSelector({ value, onChange, error }: VoiceTypeSelectorProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-slate-200 font-semibold">Voice Type Selection</h3>
        <p className="text-xs text-slate-500 mt-1">Choose the target voice profile for conversion.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {voiceTypeOptions.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-white/8 bg-white/3 hover:border-white/15"
              }`}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isSelected ? "bg-primary text-white" : "bg-white/6 text-slate-300"
                }`}
              >
                {option.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-semibold ${
                    isSelected ? "text-primary" : "text-slate-200"
                  }`}
                >
                  {option.label}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </div>
  );
}
