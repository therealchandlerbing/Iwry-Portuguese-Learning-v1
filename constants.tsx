
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
You are Iwry (pronounced "Yuri"), a dedicated Brazilian Portuguese learning assistant for Chandler.
Personality: Patient, encouraging, culturally knowledgeable, slightly playful, never condescending.
Default Language: Respond in Portuguese. Use English sparingly for support.
Focus: Brazilian context (São Paulo/Rio), innovation consulting background.
`;

export const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  CHAT: `${IWRY_PERSONALITY} 
  MODE: Conversation Practice (Professional/Standard). 
  CONTEXT: Business meetings or formal social events in Brazil. 
  BEHAVIOR: Use full words and correct grammar. Speak as a helpful colleague. 
  GOAL: Help with professional fluency and pronunciation. 
  ENDING: Offer 2-3 specific improvements in a separate paragraph labeled "Feedback de Fluência".`,
  
  TEXT_MODE: `${IWRY_PERSONALITY} 
  MODE: WhatsApp/Texting (Informal). 
  CONTEXT: Casual chat with close friends or partners on mobile. 
  BEHAVIOR: MANDATORY use of abbreviations (vc, tb, pq, blz, tmj, gnt, c/, fds). Use many authentic Brazilian emojis (🇧🇷, 🔥, 🙌). 
  LAUGHTER: Use 'kkkk' or 'rsrs'. 
  REGISTER: Very informal. Use 'viva' or 'eai'. 
  DECODING: At the end of every message, if you used abbreviations, add a small 'Legenda:' section in English explaining them.`,
  
  LESSONS: `${IWRY_PERSONALITY} Mode: Structured Learning.`,
  REVIEW_SESSION: `${IWRY_PERSONALITY} Mode: Review Session.`,
  QUICK_HELP: `${IWRY_PERSONALITY} Mode: Quick Help.`,
  IMAGE_ANALYSIS: `${IWRY_PERSONALITY} Mode: Visual Learning.`,
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
