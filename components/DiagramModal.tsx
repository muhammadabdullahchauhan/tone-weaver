"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Diagram {
  id: string;
  title: string;
  type: string;
  description: string;
  content: string;
}

const diagrams: Diagram[] = [
  {
    id: "architecture",
    title: "System Architecture Diagram",
    type: "Architecture",
    description: "High-level system architecture showing frontend, backend, and ML components.",
    content: `
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  React/Next  │  │  Web Audio   │  │  MediaRecorder│ │
│  │  Frontend    │  │     API      │  │      API      │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         └─────────────────┴──────────────────┘         │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS/WebSocket
┌─────────────────────────┼───────────────────────────────┐
│              NEXT.JS SERVER (Node.js)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  API Routes                        │  │
│  │  /api/convert  /api/hybrid  /api/learn  /api/share │  │
│  └──────┬────────────────────────────────────────────┘  │
│         │                                               │
│  ┌──────┴────────────────────────────────────────────┐  │
│  │               ML Model Service                     │  │
│  │   Accent Classifier  |  Voice Transformer          │  │
│  │   Phonetic Analyzer  |  Quality Scorer             │  │
│  └──────┬────────────────────────────────────────────┘  │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────┐
│         │        STORAGE LAYER                          │
│  ┌──────┴──────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL │  │   Redis    │  │  AWS S3 / Blob   │  │
│  │  (Users/DB) │  │  (Cache)   │  │  (Audio Files)   │  │
│  └─────────────┘  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘`,
  },
  {
    id: "erd",
    title: "Entity Relationship Diagram (ERD)",
    type: "ERD",
    description: "Database schema showing entities and their relationships.",
    content: `
USER ──────────────────────────────────────────────────────
│ PK  user_id        UUID
│     email          VARCHAR(255) UNIQUE
│     password_hash  TEXT
│     created_at     TIMESTAMP
│     role           ENUM(user, admin)
└─────────────────────────────────────────────────────────

AUDIO_RECORDING ──────────────────────────────────────────
│ PK  recording_id   UUID
│ FK  user_id        → USER.user_id
│     original_url   TEXT
│     processed_url  TEXT
│     accent_id      VARCHAR(50)
│     duration       FLOAT
│     created_at     TIMESTAMP
│     is_favorite    BOOLEAN
│     tags           TEXT[]
└─────────────────────────────────────────────────────────

ACCENT ────────────────────────────────────────────────────
│ PK  accent_id      VARCHAR(50)
│     name           VARCHAR(100)
│     region         VARCHAR(100)
│     difficulty     ENUM(Easy, Med, Hard)
│     features       JSONB
└─────────────────────────────────────────────────────────

ML_MODEL ──────────────────────────────────────────────────
│ PK  model_id       UUID
│     name           VARCHAR(100)
│     accent_id      VARCHAR(50)
│     version        VARCHAR(20)
│     accuracy       FLOAT
│     file_path      TEXT
│     uploaded_at    TIMESTAMP
└─────────────────────────────────────────────────────────

RELATIONSHIPS:
USER (1) ──── (N) AUDIO_RECORDING
ACCENT (1) ── (N) AUDIO_RECORDING
ACCENT (1) ── (1) ML_MODEL`,
  },
  {
    id: "dfd-0",
    title: "Data Flow Diagram – Level 0 (Context)",
    type: "DFD Level 0",
    description: "Context-level DFD showing the system as a single process with external entities.",
    content: `
                    ┌────────────────┐
                    │   TONE WEAVER  │
     ┌──────────┐   │     SYSTEM     │   ┌──────────────┐
     │          │──▶│                │──▶│   ML Model   │
     │   USER   │   │  ┌──────────┐  │   │   Service    │
     │          │◀──│  │ Process  │  │◀──│              │
     └──────────┘   │  │  Voice   │  │   └──────────────┘
                    │  └──────────┘  │
                    │                │   ┌──────────────┐
     ┌──────────┐   │                │──▶│   Storage    │
     │  ADMIN   │──▶│                │   │   Service    │
     │          │◀──│                │◀──│   (S3/DB)    │
     └──────────┘   └────────────────┘   └──────────────┘

External Entities:
  • USER        — Records voice, selects accents, downloads results
  • ADMIN       — Manages models, users, system configuration
  • ML Service  — Processes audio transformations
  • Storage     — Persists audio files and user data`,
  },
  {
    id: "dfd-1",
    title: "Data Flow Diagram – Level 1",
    type: "DFD Level 1",
    description: "Expanded DFD showing main processes within the system.",
    content: `
USER
 │
 ├──[Audio Stream]──▶  1.0 RECORD VOICE  ──[Raw Audio]──▶  D1: Audio Store
 │                          │
 │                    [Raw Audio + Accent]
 │                          │
 ├──[Accent Select]──▶  2.0 CONVERT ACCENT ──[Processed]──▶  D2: Results
 │                          │                     │
 │                    [Hybrid Params]        [Converted Audio]
 │                          │                     │
 ├──[Ratio Slider]──▶  3.0 HYBRID BLEND  ◀────────┘
 │                          │
 │                    [Phonetic Data]
 │                          │
 ├──[Practice Input]──▶ 4.0 LEARN MODE   ──[Score]──▶  D3: Progress
 │                          │
 │                    [Comparison Data]
 │                          │
 └──[Select Audios]──▶ 5.0 COMPARE       ──[Stats]──▶  USER

Data Stores:
  D1: Audio Files (S3)
  D2: Processed Results (S3 + Cache)
  D3: User Progress (PostgreSQL)`,
  },
  {
    id: "class",
    title: "Class Diagram",
    type: "Class Diagram",
    description: "Object-oriented class structure for the Tone Weaver system.",
    content: `
┌──────────────────────┐     ┌──────────────────────┐
│       User           │     │    AudioRecording     │
├──────────────────────┤     ├──────────────────────┤
│ -id: string          │     │ -id: string           │
│ -email: string       │     │ -userId: string       │
│ -role: UserRole      │1   N│ -originalUrl: string  │
│ -createdAt: Date     │─────│ -processedUrl: string │
├──────────────────────┤     │ -accentId: string     │
│ +record(): void      │     │ -duration: number     │
│ +login(): AuthToken  │     │ -isFavorite: boolean  │
│ +getHistory(): []    │     ├──────────────────────┤
└──────────────────────┘     │ +play(): void        │
                             │ +download(): Blob    │
                             │ +share(): string     │
                             └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│    AccentConverter   │     │      MLModel          │
├──────────────────────┤     ├──────────────────────┤
│ -selectedAccent:str  │     │ -id: string           │
│ -targetAccent: str   │     │ -name: string         │
│ -hybridRatio: number │     │ -accentId: string     │
├──────────────────────┤     │ -accuracy: number     │
│ +convert(): Promise  │1   1│ -version: string      │
│ +createHybrid(): P   │─────├──────────────────────┤
│ +getLatency(): ms    │     │ +process(): Promise  │
└──────────────────────┘     │ +predict(): float    │
                             └──────────────────────┘

┌──────────────────────┐
│   LearningSession    │
├──────────────────────┤
│ -userId: string      │
│ -lessonId: string    │
│ -score: number       │
│ -attempts: number    │
├──────────────────────┤
│ +analyze(): Score    │
│ +getBreakdown(): []  │
└──────────────────────┘`,
  },
  {
    id: "sequence",
    title: "Sequence Diagram – Voice Conversion",
    type: "Sequence Diagram",
    description: "Sequence of interactions for the voice recording and conversion flow.",
    content: `
User    Browser    Next.js API    ML Service    Storage
 │          │            │              │           │
 │─Record──▶│            │              │           │
 │          │─MediaRec.  │              │           │
 │          │──startRec()│              │           │
 │          │            │              │           │
 │─StopRec─▶│            │              │           │
 │          │─stop()─────│              │           │
 │          │            │──POST /conv─▶│           │
 │          │            │              │──process()│
 │          │            │              │           │
 │          │            │◀─audioBlob───│           │
 │          │            │──────────────────PUT────▶│
 │          │            │◀─────────────────URL─────│
 │          │◀─result────│              │           │
 │◀─display─│            │              │           │
 │          │            │              │           │
 │─Download▶│            │              │           │
 │          │─createURL()│              │           │
 │◀─file────│            │              │           │

Latency Budget:
  • UI feedback:    < 50ms
  • API call:       < 200ms
  • ML processing:  < 500ms
  • Storage upload: < 300ms
  • Total:          < 1050ms (simulated: 50-100ms)`,
  },
  {
    id: "state",
    title: "State Transition Diagram",
    type: "State Diagram",
    description: "State transitions for the voice recording and processing lifecycle.",
    content: `
                    ┌─────────┐
                    │  IDLE   │◀───────────────────────┐
                    └────┬────┘                        │
                         │ startRecording()            │
                         ▼                             │
                    ┌─────────┐                        │
                    │RECORDING│                        │
                    └────┬────┘                        │
                         │ stopRecording()             │
                         ▼                             │
                    ┌─────────────┐   error            │
                    │  PROCESSING │──────────────────▶ │
                    └──────┬──────┘                    │
                           │ onComplete()              │
                           ▼                           │
                    ┌─────────────┐                    │
                    │    DONE     │                    │
                    └──────┬──────┘                    │
                           │                           │
            ┌──────────────┼──────────────┐           │
            ▼              ▼              ▼           │
       ┌─────────┐   ┌──────────┐  ┌──────────┐      │
       │  PLAY   │   │DOWNLOAD  │  │  SHARE   │      │
       └────┬────┘   └──────────┘  └──────────┘      │
            │                                         │
            └─────────────────────────────────────────┘
                      reset() / clearRecording()

State Properties:
  IDLE:        No audio, controls enabled
  RECORDING:   Timer active, waveform live, mic streaming
  PROCESSING:  Progress bar, spinner, disabled controls
  DONE:        Audio ready, all controls enabled`,
  },
];

interface DiagramModalProps {
  trigger?: React.ReactNode;
}

export default function DiagramModal({ trigger }: DiagramModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const current = diagrams[selectedIndex];

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger ?? (
          <button className="px-4 py-2 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] text-sm font-medium hover:bg-[#6366f1]/25 transition-all">
            View System Diagrams
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col glass-card overflow-hidden slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{current.title}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/15 text-[#6366f1] mt-1 inline-block">
                  {current.type}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex overflow-x-auto gap-1 px-5 py-3 border-b border-white/8">
              {diagrams.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    i === selectedIndex
                      ? "bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {d.type}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-slate-400 text-sm mb-4">{current.description}</p>
              <pre className="bg-[#0d0d1a] border border-white/8 rounded-xl p-4 text-[#a5b4fc] text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">
                {current.content}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/8">
              <button
                onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
                disabled={selectedIndex === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-xs text-slate-500">
                {selectedIndex + 1} / {diagrams.length}
              </span>
              <button
                onClick={() => setSelectedIndex((i) => Math.min(diagrams.length - 1, i + 1))}
                disabled={selectedIndex === diagrams.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
