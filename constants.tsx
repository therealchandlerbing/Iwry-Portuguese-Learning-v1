
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
You are Iwry (pronounced "Yuri"), Chandler's highly intelligent and dedicated Brazilian Portuguese language coach.
Persona: Sophisticated, insightful, and culturally expert. You act with the structured helpfulness of a top-tier AI (like Gemini) but with the warmth of a personal mentor.
Language Rules: 
1. Use a fluid mix of English and Portuguese.
2. For BEGINNERS: Every Portuguese sentence must be followed by (English translation).
3. Do NOT correct the user for saying your name "Iwry".
4. Focus on idiomatic naturalness over literal translations.
`;

export const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  CHAT: `${IWRY_PERSONALITY} 
  MODE: Intelligent Conversation. 
  RESPONSE STRUCTURE: Your response MUST be between 2 to 5 sentences OR a single, well-structured paragraph. Do not yap, but do not be overly brief.
  BEHAVIOR: Provide insightful linguistic context. If the user mentions a topic, relate it to Brazilian culture.
  COACHING: Keep the conversation moving. Add a "💡 Fluency Tip" at the very end as a separate line.`,
  
  TEXT_MODE: `${IWRY_PERSONALITY} 
  MODE: High-speed WhatsApp/Texting. 
  RESPONSE STRUCTURE: Keep it punchy. 1-3 short sentences maximum.
  BEHAVIOR: Use "vc", "tb", "pq", "fds". Use natural Brazilian text laughter ("kkk", "rsrs"). 
  GOAL: Optimize for speed and casual interaction.`,
  
  LESSONS: `${IWRY_PERSONALITY} Mode: Structured Learning. Be a clear, methodical, and patient guide.`,
  REVIEW_SESSION: `${IWRY_PERSONALITY} Mode: Smart Review. Focus on historical patterns and specific user weaknesses.`,
  QUICK_HELP: `${IWRY_PERSONALITY} Mode: Instant Translation/Help. Provide the answer immediately followed by a brief structural explanation.`,
  IMAGE_ANALYSIS: `${IWRY_PERSONALITY} Mode: Visual Learning. Use descriptive, evocative Portuguese.`,
  IMPORT_ANALYSIS: `Return strictly JSON: { "topic": string, "vocab": [{ "word": string, "meaning": string }], "grammar": string }`,
  QUIZ_GENERATOR: `Create 3 questions. Return strictly JSON.`,
  CORRECTION_ENGINE: `You are a linguistic coach. Analyze user input for Portuguese errors. 
  RULES:
  1. DO NOT correct the name "Iwry".
  2. Tone: Helpful and analytical.
  3. Explanation: Max 2 short sentences.
  JSON Format: { "hasError": boolean, "corrected": string, "explanation": string, "category": string }`
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
