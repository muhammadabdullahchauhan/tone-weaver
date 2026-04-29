export interface Accent {
  id: string;
  name: string;
  flag: string;
  description: string;
  region: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  features: string[];
  samplePhrases: string[];
  color: string;
}

export const accents: Accent[] = [
  {
    id: "british",
    name: "British (RP)",
    flag: "UK",
    description:
      "Received Pronunciation - the prestige accent of England, associated with BBC broadcasts and classic literature.",
    region: "Southern England",
    difficulty: "Intermediate",
    features: [
      "Non-rhotic (drops the final r sound)",
      "Long vowels in words like bath and path",
      "Glottal stops in casual speech",
      "Clear distinction between caught and cot",
    ],
    samplePhrases: [
      "The rain in Spain stays mainly in the plain.",
      "How now, brown cow?",
      "Rather splendid, isn't it?",
    ],
    color: "#6366f1",
  },
  {
    id: "american",
    name: "American (General)",
    flag: "US",
    description:
      "General American accent, widely understood and used in US media, news broadcasting, and film.",
    region: "Midwest / West USA",
    difficulty: "Beginner",
    features: [
      "Rhotic (clear r sounds everywhere)",
      "Flap T in words like butter",
      "Low back merger in many regions",
      "Nasal vowels in some regions",
    ],
    samplePhrases: [
      "I caught the ball in the park.",
      "Would you like a bottle of water?",
      "She sells sea shells by the seashore.",
    ],
    color: "#ec4899",
  },
  {
    id: "australian",
    name: "Australian",
    flag: "AU",
    description:
      "A distinctive Southern Hemisphere accent with unique vowel shifts and casual intonation patterns.",
    region: "Australia",
    difficulty: "Advanced",
    features: [
      "Raised vowels",
      "Non-rhotic like British English",
      "Strong rising intonation",
      "Unique vocabulary such as arvo and brekkie",
    ],
    samplePhrases: [
      "G'day, how ya going?",
      "No worries, mate!",
      "Let's have a barbie this arvo.",
    ],
    color: "#f59e0b",
  },
  {
    id: "indian",
    name: "Indian (Standard)",
    flag: "IN",
    description:
      "Standard Indian English with characteristic retroflex consonants and syllable-timed rhythm.",
    region: "India",
    difficulty: "Intermediate",
    features: [
      "Retroflex consonants (t, d, n)",
      "Syllable-timed rhythm",
      "Distinct v and w sounds",
      "Less vowel reduction in unstressed syllables",
    ],
    samplePhrases: [
      "Please revert to me at the earliest.",
      "I am coming from Mumbai only.",
      "What is your good name?",
    ],
    color: "#10b981",
  },
  {
    id: "scottish",
    name: "Scottish",
    flag: "SC",
    description:
      "The distinctive accent of Scotland with rolling r sounds and a unique vowel system.",
    region: "Scotland, UK",
    difficulty: "Advanced",
    features: [
      "Strong rhotic r",
      "Scottish Vowel Length Rule",
      "Clear wh distinction",
      "Unique intonation patterns",
    ],
    samplePhrases: [
      "It's a braw, bricht, moonlicht nicht.",
      "Och aye, the noo!",
      "Dinnae fash yerself.",
    ],
    color: "#3b82f6",
  },
  {
    id: "irish",
    name: "Irish",
    flag: "IE",
    description:
      "The melodic accent of Ireland with distinctive musical intonation and bright vowel shapes.",
    region: "Ireland",
    difficulty: "Intermediate",
    features: [
      "Musical rising intonation",
      "Dental stops (t, d)",
      "Clear l sounds",
      "Distinct vowel qualities",
    ],
    samplePhrases: [
      "It's grand altogether.",
      "Sure, it'll be grand.",
      "I will, yeah.",
    ],
    color: "#22c55e",
  },
];

export type HybridAccentRatio = {
  accent1: string;
  accent2: string;
  ratio: number;
};
