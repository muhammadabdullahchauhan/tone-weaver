export interface AudioRecord {
  id: string;
  title: string;
  originalAccent: string;
  targetAccent: string;
  duration: number; // seconds
  createdAt: string;
  isFavorite: boolean;
  waveformData: number[];
  stats: AudioStats;
  tags: string[];
  audioUrl?: string | null;
  originalAudioUrl?: string | null;
}

export interface AudioStats {
  latency: number; // ms
  similarity: number; // 0-100
  quality: number; // 0-100
  accentScore: number; // 0-100
}

function generateWaveform(length: number = 60): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    data.push(Math.random() * 0.8 + 0.1);
  }
  return data;
}

export const mockAudioHistory: AudioRecord[] = [
  {
    id: "audio-001",
    title: "Meeting Introduction",
    originalAccent: "American",
    targetAccent: "British (RP)",
    duration: 12,
    createdAt: "2026-02-25T09:15:00Z",
    isFavorite: true,
    waveformData: generateWaveform(),
    stats: { latency: 68, similarity: 87, quality: 92, accentScore: 84 },
    tags: ["professional", "meeting"],
  },
  {
    id: "audio-002",
    title: "Podcast Intro Draft",
    originalAccent: "American",
    targetAccent: "Australian",
    duration: 24,
    createdAt: "2026-02-24T14:30:00Z",
    isFavorite: false,
    waveformData: generateWaveform(),
    stats: { latency: 72, similarity: 81, quality: 88, accentScore: 79 },
    tags: ["podcast", "casual"],
  },
  {
    id: "audio-003",
    title: "Customer Service Script",
    originalAccent: "Indian",
    targetAccent: "American (General)",
    duration: 35,
    createdAt: "2026-02-24T10:00:00Z",
    isFavorite: true,
    waveformData: generateWaveform(),
    stats: { latency: 55, similarity: 91, quality: 95, accentScore: 89 },
    tags: ["customer-service", "professional"],
  },
  {
    id: "audio-004",
    title: "Storytelling Practice",
    originalAccent: "British (RP)",
    targetAccent: "Irish",
    duration: 18,
    createdAt: "2026-02-23T16:45:00Z",
    isFavorite: false,
    waveformData: generateWaveform(),
    stats: { latency: 84, similarity: 76, quality: 85, accentScore: 73 },
    tags: ["storytelling", "creative"],
  },
  {
    id: "audio-005",
    title: "Hybrid Test: British-American",
    originalAccent: "American",
    targetAccent: "British-American Hybrid (60/40)",
    duration: 8,
    createdAt: "2026-02-23T11:20:00Z",
    isFavorite: true,
    waveformData: generateWaveform(),
    stats: { latency: 91, similarity: 83, quality: 90, accentScore: 81 },
    tags: ["hybrid", "experimental"],
  },
  {
    id: "audio-006",
    title: "News Anchor Style",
    originalAccent: "Australian",
    targetAccent: "American (General)",
    duration: 29,
    createdAt: "2026-02-22T08:10:00Z",
    isFavorite: false,
    waveformData: generateWaveform(),
    stats: { latency: 61, similarity: 88, quality: 93, accentScore: 86 },
    tags: ["news", "formal"],
  },
];

export const mockComparisonStats = {
  originalAccent: "American (General)",
  targetAccent: "British (RP)",
  similarity: 87,
  keyDifferences: [
    { feature: "Rhoticity", original: "Rhotic /r/", converted: "Non-rhotic" },
    { feature: "TRAP-BATH Split", original: "/æ/ in bath", converted: "/ɑː/ in bath" },
    { feature: "Intonation", original: "Falling tone", converted: "Level with rise" },
    { feature: "T-flapping", original: "Flap /ɾ/", converted: "Aspirated /t/" },
    { feature: "Vowel Length", original: "Shorter vowels", converted: "Elongated vowels" },
  ],
  processingTime: 73,
  qualityScore: 92,
};
