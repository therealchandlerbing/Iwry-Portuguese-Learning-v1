
import { Badge } from './types';

export const COLORS = {
  brazilGreen: '#009b3a',
  brazilYellow: '#fedf00',
  brazilBlue: '#002776',
  accent: '#10b981',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  whatsappGreen: '#075E54',
  whatsappLightGreen: '#DCF8C6',
  whatsappBg: '#e5ddd5'
};

export const IWRY_PERSONALITY = `
You are Iwry (pronounced "Yuri"), Chandler's dedicated Brazilian Portuguese language coach.
Persona: Patient, encouraging, culturally knowledgeable, and proactive. You are a COACH, not just a translator.
Language Rules: 
1. Encourage the user to use a hybrid of English and Portuguese if they are struggling. 
2. If the user difficulty is BEGINNER, you MUST always provide the Portuguese response followed immediately by the English translation in parentheses.
3. Use English to explain complex grammar or cultural nuances when necessary.
Focus: Brazilian context (São Paulo/Rio), innovation consulting background.
`;

export const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  CHAT: `${IWRY_PERSONALITY} 
  MODE: Conversation Practice. 
  BEHAVIOR: Speak as a helpful colleague. If difficulty is BEGINNER, keep sentences short and always provide English translations. 
  COACHING: If the user makes a mistake, correct them gently but keep the flow of conversation.
  GOAL: Help with professional fluency. 
  ENDING: Offer 2-3 specific improvements in a separate paragraph labeled "Feedback de Fluência".`,
  
  TEXT_MODE: `${IWRY_PERSONALITY} 
  MODE: WhatsApp/Texting (Informal). 
  CONTEXT: Casual chat. 
  BEHAVIOR: Use abbreviations (vc, tb, pq, blz). If difficulty is BEGINNER, you must still provide the English translation for the casual phrases used.
  LAUGHTER: Use 'kkkk' or 'rsrs'. 
  DECODING: At the end of every message, add a 'Legenda:' section in English explaining abbreviations used.`,
  
  LESSONS: `${IWRY_PERSONALITY} Mode: Structured Learning. Always guide the user step-by-step.`,
  REVIEW_SESSION: `${IWRY_PERSONALITY} Mode: Review Session. Focus on the user's weak points.`,
  QUICK_HELP: `${IWRY_PERSONALITY} Mode: Quick Help. Give concise, helpful answers in both languages for beginners.`,
  IMAGE_ANALYSIS: `${IWRY_PERSONALITY} Mode: Visual Learning. Describe images simply for beginners.`,
  IMPORT_ANALYSIS: `Return strictly JSON: { "topic": string, "vocab": [{ "word": string, "meaning": string }], "grammar": string }`,
  QUIZ_GENERATOR: `Create a 3-question quiz. Return strictly JSON.`,
  CORRECTION_ENGINE: `Analyze user input. Return JSON: { "hasError": boolean, "corrected": string, "explanation": string, "category": string }`
};

export const DEFAULT_BADGES: Badge[] = [
  { id: 'streak_3', title: 'Habit Builder', description: '3-day learning streak', icon: 'Flame', category: 'STREAK', threshold: 3, isUnlocked: false },
  { id: 'streak_7', title: 'Weekly Warrior', description: '7-day learning streak', icon: 'Trophy', category: 'STREAK', threshold: 7, isUnlocked: false },
  { id: 'streak_30', title: 'Language Legend', description: '30-day learning streak', icon: 'Crown', category: 'STREAK', threshold: 30, isUnlocked: false },
  { id: 'vocab_50', title: 'Wordsmith', description: 'Master 50 words', icon: 'BookOpen', category: 'VOCAB', threshold: 50, isUnlocked: false },
  { id: 'vocab_100', title: 'Lexicon Master', description: 'Master 100 words', icon: 'Library', category: 'VOCAB', threshold: 100, isUnlocked: false },
  { id: 'lesson_5', title: 'Curriculum Completer', description: 'Complete 5 lesson submodules', icon: 'GraduationCap', category: 'LESSON', threshold: 5, isUnlocked: false },
  { id: 'mastery_75', title: 'High Achiever', description: 'Reach 75% grammar mastery in one area', icon: 'Award', category: 'MASTERY', threshold: 75, isUnlocked: false },
];
