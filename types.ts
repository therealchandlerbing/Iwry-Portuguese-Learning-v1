
export enum AppMode {
  CHAT = 'CHAT',
  TEXT_MODE = 'TEXT_MODE',
  LIVE_VOICE = 'LIVE_VOICE',
  LESSONS = 'LESSONS',
  DASHBOARD = 'DASHBOARD',
  QUICK_HELP = 'QUICK_HELP',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS'
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
}

export interface UserProgress {
  level: string; // A1, A2, etc.
  vocabulary: VocabItem[];
  lessonsCompleted: string[];
  grammarMastery: Record<string, number>;
  totalPracticeMinutes: number;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}
