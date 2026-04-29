export interface Celebrity {
  id: string;
  name: string;
  accent: string;
  description: string;
  icon: string;
  traits: string[];
  category: "Actor" | "Musician" | "Politician" | "Broadcaster";
  country: string;
}

export const celebrities: Celebrity[] = [
  {
    id: "david-attenborough",
    name: "David Attenborough",
    accent: "British (RP)",
    description: "The iconic naturalist's calming, authoritative British narration style.",
    icon: "🎙️",
    traits: ["Calm authority", "Clear enunciation", "Long vowels", "Measured pace"],
    category: "Broadcaster",
    country: "🇬🇧",
  },
  {
    id: "morgan-freeman",
    name: "Morgan Freeman",
    accent: "American (Southern)",
    description: "Deep, resonant voice with Southern American warmth and gravitas.",
    icon: "🎬",
    traits: ["Deep resonance", "Southern warmth", "Smooth delivery", "Authoritative tone"],
    category: "Actor",
    country: "🇺🇸",
  },
  {
    id: "judi-dench",
    name: "Judi Dench",
    accent: "British (RP)",
    description: "Crisp, refined British accent with theatrical precision.",
    icon: "🎭",
    traits: ["Crisp consonants", "Theatrical flair", "Refined vowels", "Expressive range"],
    category: "Actor",
    country: "🇬🇧",
  },
  {
    id: "chris-hemsworth",
    name: "Chris Hemsworth",
    accent: "Australian",
    description: "Natural Australian accent with characteristic vowel raising.",
    icon: "⚡",
    traits: ["Australian drawl", "Raised vowels", "Casual tone", "Strong presence"],
    category: "Actor",
    country: "🇦🇺",
  },
  {
    id: "cate-blanchett",
    name: "Cate Blanchett",
    accent: "Australian Refined",
    description: "Polished Australian accent with theatrical versatility.",
    icon: "✨",
    traits: ["Polished delivery", "Versatile range", "Clear diction", "Natural warmth"],
    category: "Actor",
    country: "🇦🇺",
  },
  {
    id: "benedict-cumberbatch",
    name: "Benedict Cumberbatch",
    accent: "British (RP)",
    description: "Sharp, precise Received Pronunciation with intellectual edge.",
    icon: "🔍",
    traits: ["Precise consonants", "Intellectual tone", "Rapid delivery", "Sharp articulation"],
    category: "Actor",
    country: "🇬🇧",
  },
  {
    id: "priyanka-chopra",
    name: "Priyanka Chopra",
    accent: "Indian-American",
    description: "Blend of Indian English warmth with American fluency.",
    icon: "🌟",
    traits: ["Warm tone", "Clear diction", "Cultural blend", "Confident delivery"],
    category: "Actor",
    country: "🇮🇳",
  },
  {
    id: "idris-elba",
    name: "Idris Elba",
    accent: "British (London)",
    description: "London-born British accent with urban edge and deep resonance.",
    icon: "🦁",
    traits: ["London inflections", "Deep resonance", "Urban edge", "Versatile range"],
    category: "Actor",
    country: "🇬🇧",
  },
];
