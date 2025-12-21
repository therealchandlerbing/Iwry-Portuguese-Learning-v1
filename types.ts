
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
  CORRECTION_LIBRARY = 'CORRECTION_LIBRARY'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
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
  streak: number;
  selectedTopics: string[]; 
  lastSessionDate: Date;
  sessionCount: number;
  generatedModules: LessonModule[];
  badges: Badge[];
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
  milestones?: string[]; // New: Specific learning goals
  unitTest?: QuizQuestion[]; // New: Embedded test for this specific submodule
}

export interface LessonModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  submodules: LessonSubModule[];
  isCustom?: boolean; // Flag for user-generated content
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; 
  explanation: string;
}
