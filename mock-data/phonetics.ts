export interface PhoneticLesson {
  id: string;
  sentence: string;
  accent: string;
  difficulty: "Easy" | "Medium" | "Hard";
  phonetic: string;
  breakdown: PhoneticWord[];
  tips: string[];
  category: string;
}

export interface PhoneticWord {
  word: string;
  ipa: string;
  stressed: boolean;
  notes?: string;
}

export interface LearningExercise {
  id: string;
  title: string;
  accent: string;
  description: string;
  sentences: string[];
  targetScore: number;
  icon: string;
}

export const phoneticLessons: PhoneticLesson[] = [
  {
    id: "brit-1",
    sentence: "The rain in Spain stays mainly in the plain.",
    accent: "british",
    difficulty: "Easy",
    phonetic: "ðə reɪn ɪn speɪn steɪz meɪnli ɪn ðə pleɪn",
    breakdown: [
      { word: "The", ipa: "ðə", stressed: false },
      { word: "rain", ipa: "reɪn", stressed: true, notes: "Notice the long diphthong /eɪ/." },
      { word: "in", ipa: "ɪn", stressed: false },
      { word: "Spain", ipa: "speɪn", stressed: true, notes: "Keep the same /eɪ/ vowel quality." },
      { word: "stays", ipa: "steɪz", stressed: true, notes: "The final /z/ should stay voiced." },
      { word: "mainly", ipa: "meɪnli", stressed: true, notes: "Stress the first syllable." },
      { word: "in", ipa: "ɪn", stressed: false },
      { word: "the", ipa: "ðə", stressed: false },
      { word: "plain", ipa: "pleɪn", stressed: true, notes: "Match the vowel to rain and Spain." },
    ],
    tips: [
      "Focus on the /eɪ/ diphthong - start with /e/ and glide toward /ɪ/.",
      "RP keeps a steady stress-timed rhythm.",
      "Keep the unstressed function words short and light.",
    ],
    category: "Vowel Sounds",
  },
  {
    id: "brit-2",
    sentence: "How terribly ghastly! Shall we have a bath?",
    accent: "british",
    difficulty: "Medium",
    phonetic: "haʊ terəbli ɡɑːstli ʃal wiː hav ə bɑːθ",
    breakdown: [
      { word: "How", ipa: "haʊ", stressed: true, notes: "Open with a clear /aʊ/ glide." },
      { word: "terribly", ipa: "terəbli", stressed: true, notes: "Stress the first syllable." },
      { word: "ghastly", ipa: "ɡɑːstli", stressed: true, notes: "Use the long /ɑː/ sound." },
      { word: "Shall", ipa: "ʃal", stressed: true },
      { word: "we", ipa: "wiː", stressed: false },
      { word: "have", ipa: "hav", stressed: true },
      { word: "a", ipa: "ə", stressed: false },
      { word: "bath", ipa: "bɑːθ", stressed: true, notes: "Classic TRAP-BATH split in RP." },
    ],
    tips: [
      "The TRAP-BATH split matters here: bath uses /ɑː/, not /æ/.",
      "Lengthen the vowel in ghastly and bath without slowing the whole sentence.",
      "Keep the question ending light rather than heavily stressed.",
    ],
    category: "TRAP-BATH Split",
  },
  {
    id: "amer-1",
    sentence: "I caught a bottle of water at the market.",
    accent: "american",
    difficulty: "Easy",
    phonetic: "aɪ kɔt ə bɑɾəl əv wɑɾər æt ðə mɑrkɪt",
    breakdown: [
      { word: "I", ipa: "aɪ", stressed: true },
      { word: "caught", ipa: "kɔt", stressed: true, notes: "Keep the vowel rounded and open." },
      { word: "a", ipa: "ə", stressed: false },
      { word: "bottle", ipa: "bɑɾəl", stressed: true, notes: "Use the American flap /ɾ/." },
      { word: "of", ipa: "əv", stressed: false },
      { word: "water", ipa: "wɑɾər", stressed: true, notes: "Flap the t and pronounce the final r." },
      { word: "at", ipa: "æt", stressed: true },
      { word: "the", ipa: "ðə", stressed: false },
      { word: "market", ipa: "mɑrkɪt", stressed: true, notes: "Keep the r fully rhotic." },
    ],
    tips: [
      "Flap t sounds appear between vowels in bottle and water.",
      "General American keeps the r sound strong throughout the word.",
      "Aim for a smooth, connected rhythm instead of clipped syllables.",
    ],
    category: "Rhotic and Flap T",
  },
  {
    id: "aus-1",
    sentence: "G'day mate, let's have a barbie this arvo!",
    accent: "australian",
    difficulty: "Medium",
    phonetic: "ɡdeɪ meɪt lets hav ə bɑːbi ðɪs ɑːvəʊ",
    breakdown: [
      { word: "G'day", ipa: "ɡdeɪ", stressed: true, notes: "Start the diphthong slightly lower." },
      { word: "mate", ipa: "meɪt", stressed: true, notes: "Let the vowel move forward." },
      { word: "let's", ipa: "lets", stressed: true },
      { word: "have", ipa: "hav", stressed: true },
      { word: "a", ipa: "ə", stressed: false },
      { word: "barbie", ipa: "bɑːbi", stressed: true, notes: "A clipped informal form of barbecue." },
      { word: "this", ipa: "ðɪs", stressed: false },
      { word: "arvo", ipa: "ɑːvəʊ", stressed: true, notes: "Australian shortening of afternoon." },
    ],
    tips: [
      "Australian English often raises the starting point of diphthongs.",
      "Let the sentence rise slightly at the end to sound more natural.",
      "Keep the tone relaxed and conversational.",
    ],
    category: "Vowel Raising",
  },
  {
    id: "indian-1",
    sentence: "Please revert to me at the earliest convenience.",
    accent: "indian",
    difficulty: "Medium",
    phonetic: "pliːz rɪvɜːt tuː miː æt ði ɜːliəst kənviːniəns",
    breakdown: [
      { word: "Please", ipa: "pliːz", stressed: true },
      { word: "revert", ipa: "rɪvɜːt", stressed: true, notes: "Use a clear final t." },
      { word: "to", ipa: "tuː", stressed: false, notes: "Keep a full vowel instead of reducing it." },
      { word: "me", ipa: "miː", stressed: true },
      { word: "at", ipa: "æt", stressed: false },
      { word: "the", ipa: "ði", stressed: false, notes: "A brighter vowel often appears here." },
      { word: "earliest", ipa: "ɜːliəst", stressed: true },
      { word: "convenience", ipa: "kənviːniəns", stressed: true },
    ],
    tips: [
      "Indian English often keeps vowels fuller in unstressed words.",
      "Aim for even syllable timing rather than heavy English stress contrast.",
      "Keep consonants crisp, especially t and d sounds.",
    ],
    category: "Syllable Timing",
  },
];

export const learningExercises: LearningExercise[] = [
  {
    id: "ex-vowels-brit",
    title: "British Vowel Sounds",
    accent: "british",
    description: "Master the distinctive vowel sounds of Received Pronunciation.",
    sentences: [
      "The bath and the path are past the grass.",
      "Father's car is rather large.",
      "Aunt Martha dances after dark.",
    ],
    targetScore: 85,
    icon: "UK",
  },
  {
    id: "ex-rhotic-amer",
    title: "American Rhotic R",
    accent: "american",
    description: "Practice the American rhotic r sound in different positions.",
    sentences: [
      "Her purple bird perched near the church.",
      "The farmer's barn is far from the park.",
      "Better water for her first course.",
    ],
    targetScore: 80,
    icon: "US",
  },
  {
    id: "ex-intonation-aus",
    title: "Australian Rising Intonation",
    accent: "australian",
    description: "Practice the characteristic Australian upward intonation.",
    sentences: [
      "We're having a barbie Sunday?",
      "You'll be right, no worries?",
      "She went to the shops today?",
    ],
    targetScore: 75,
    icon: "AU",
  },
  {
    id: "ex-rhythm-indian",
    title: "Indian Syllable Timing",
    accent: "indian",
    description: "Practice the even, syllable-timed rhythm of Indian English.",
    sentences: [
      "We are having a very good time here.",
      "Please do the needful at your earliest convenience.",
      "What is your good name, please?",
    ],
    targetScore: 80,
    icon: "IN",
  },
];

export const mockScores = {
  overall: 78,
  pronunciation: 82,
  rhythm: 74,
  intonation: 79,
  vowelAccuracy: 76,
};
