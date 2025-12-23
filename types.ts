
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  TEXT_MODE = 'TEXT_MODE',
  LIVE_VOICE = 'LIVE_VOICE',
  LESSONS = 'LESSONS',
  REVIEW_SESSION = 'REVIEW_SESSION',
  QUICK_HELP = 'QUICK_HELP',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  IMPORT_MEMORY = 'IMPORT_MEMORY',
  QUIZ = 'QUIZ',
  CORRECTION_LIBRARY = 'CORRECTION_LIBRARY',
  LEARNING_LOG = 'LEARNING_LOG',
  DICTIONARY = 'DICTIONARY',
  FLASHCARDS = 'FLASHCARDS'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface DictionaryEntry {
  word: string;
  category: string; // Noun, Verb, Adjective, etc.
  meaning: string;
  translation: string;
  tenseInfo?: string; // e.g. "Presente do Indicativo"
  conjugation?: {
    eu: string;
    tu_voce: string;
    ele_ela: string;
    nos: string;
    vcs_eles: string;
  };
  irregularities: string | null;
  examples: string[];
  usageNotes: string;
  gender?: 'Masculine' | 'Feminine' | 'Neutral';
}

export interface CorrectionObject {
  id: string;
  incorrect: string;
  corrected: string;
  explanation: string;
  category: string;
  difficulty: DifficultyLevel;
  timestamp: Date;
}

export interface ChatSessionLog {
  id: string;
  timestamp: Date;
  mode: AppMode;
  summary: string;
  messages: Message[];
  newVocabCount: number;
  difficulty: DifficultyLevel;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  imageUrl?: string;
  isCorrection?: boolean;
  correctionData?: CorrectionObject;
}

export interface VocabItem {
  word: string;
  meaning: string;
  confidence: number; // 0 to 100
  lastPracticed: Date;
  source?: string; 
}

export interface MemoryEntry {
  id: string;
  date: Date;
  topic: string;
  content: string;
  extractedVocab: string[];
  type: 'homework' | 'reading' | 'meeting' | 'social';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'STREAK' | 'VOCAB' | 'LESSON' | 'MASTERY';
  threshold: number;
  earnedDate?: Date;
  isUnlocked: boolean;
}

export interface UserProgress {
  level: string; // Proficiency (e.g., A2)
  difficulty: DifficultyLevel;
  vocabulary: VocabItem[];
  lessonsCompleted: string[];
  grammarMastery: Record<string, number>;
  totalPracticeMinutes: number;
  memories: MemoryEntry[];
  correctionHistory: CorrectionObject[];
  sessionLogs: ChatSessionLog[];
  streak: number;
  selectedTopics: string[];
  lastSessionDate: Date;
  sessionCount: number;
  generatedModules: LessonModule[];
  badges: Badge[];
  flashcards: Flashcard[];
}

export interface SessionAnalysis {
  newVocab: VocabItem[];
  grammarPerformance: Record<string, number>; // -0.1 to +0.1 adjustment
  summaryText: string;
  nextStepRecommendation: string;
}

export interface LessonSubModule {
  id: string;
  title: string;
  description: string;
  prompt: string;
  grammarExplanation?: string;
  milestones?: string[]; 
  unitTest?: QuizQuestion[]; 
}

export interface LessonModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  submodules: LessonSubModule[];
  isCustom?: boolean; 
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string; // Question (e.g., "Como se diz 'meeting'?" or "Conjugate 'falar' in present tense (eu)")
  back: string; // Answer (e.g., "reunião" or "falo")
  type: 'translation' | 'conjugation' | 'grammar' | 'fill-blank';
  category: string; // e.g., "Verb Conjugation", "Vocabulary", "Prepositions"
  difficulty: DifficultyLevel;

  // Spaced repetition fields (SM-2 algorithm)
  nextReviewDate: Date;
  interval: number; // Days until next review
  easeFactor: number; // 1.3 to 2.5, default 2.5
  reviewCount: number;
  lastReviewed: Date | null;

  // Source tracking
  sourceType: 'correction' | 'vocabulary' | 'lesson' | 'custom';
  sourceId?: string; // Reference to original correction/vocab item

  // Additional metadata
  createdDate: Date;
  isArchived: boolean;

  // Optional context
  hint?: string;
  exampleSentence?: string;
}
