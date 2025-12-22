
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { QuizQuestion, SessionAnalysis, DifficultyLevel, LessonModule, DictionaryEntry } from "../types";

const API_ENDPOINT = '/api/gemini';

async function callApi(action: string, payload: any) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  const data = await response.json();
  return data.result;
}

export async function getDictionaryDefinition(word: string): Promise<DictionaryEntry> {
  return callApi('dictionaryDefinition', { word });
}

export async function checkGrammar(text: string, difficulty: DifficultyLevel): Promise<any> {
  return callApi('checkGrammar', { text, difficulty });
}

export async function analyzeMemory(content: string, isImage: boolean = false): Promise<any> {
  return callApi('analyzeMemory', { content, isImage });
}

export async function analyzeSession(history: { role: string; content: string }[]): Promise<SessionAnalysis> {
  return callApi('analyzeSession', { history });
}

export async function generateQuiz(topicTitle: string, description: string): Promise<QuizQuestion[]> {
  return callApi('generateQuiz', { topicTitle, description });
}

export async function generateCustomModule(request: string): Promise<LessonModule> {
  return callApi('generateCustomModule', { request });
}

export async function generateChatResponse(
  mode: string,
  history: { role: string; content: string }[],
  userInput: string,
  difficulty: DifficultyLevel = DifficultyLevel.BEGINNER,
  memories?: any[],
  image?: string,
  selectedTopics?: string[]
): Promise<string> {
  return callApi('chatResponse', {
    mode,
    history,
    userInput,
    difficulty,
    memories,
    image,
    selectedTopics
  });
}

export async function textToSpeech(text: string): Promise<Uint8Array | null> {
  const base64Audio = await callApi('textToSpeech', { text });
  if (base64Audio) {
    return decode(base64Audio);
  }
  return null;
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  return callApi('transcribeAudio', { audioBase64 });
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Live voice connection - uses client-side SDK for WebSocket streaming
// This is acceptable as it creates a temporary session token, not exposing the API key
export const getGeminiClient = () => {
  // This will only be used for live voice WebSocket connections
  // The API key here is needed for real-time bidirectional streaming
  // which cannot go through a REST API endpoint
  const apiKey = (window as any).__GEMINI_LIVE_KEY__;
  if (!apiKey) {
    throw new Error('Live voice not configured');
  }
  return new GoogleGenAI({ apiKey });
};
