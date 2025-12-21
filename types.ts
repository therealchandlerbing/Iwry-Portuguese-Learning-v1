
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
  QUIZ = 'QUIZ'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  imageUrl?: string;
  isCorrection?: boolean;
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

export interface UserProgress {
  level: string;
  vocabulary: VocabItem[];
  lessonsCompleted: string[];
  grammarMastery: Record<string, number>;
  totalPracticeMinutes: number;
  memories: MemoryEntry[];
  streak: number;
  selectedTopics: string[]; 
  lastSessionDate: Date;
  sessionCount: number;
}

export interface SessionAnalysis {
  newVocab: VocabItem[];
  grammarPerformance: Record<string, number>; // -0.1 to +0.1 adjustment
  summaryText: string;
  nextStepRecommendation: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface LessonSubModule {
  id: string;
  title: string;
  description: string;
  prompt: string;
  grammarExplanation?: string;
}

export interface LessonModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  submodules: LessonSubModule[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; 
  explanation: string;
}
