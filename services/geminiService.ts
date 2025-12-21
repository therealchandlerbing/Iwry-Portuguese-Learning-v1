
import { GoogleGenAI, Modality, GenerateContentResponse, LiveServerMessage, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";
import { QuizQuestion, SessionAnalysis, DifficultyLevel, CorrectionObject } from "../types";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function checkGrammar(text: string, difficulty: DifficultyLevel): Promise<any> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `User input: "${text}"\nDifficulty: ${difficulty}` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS.CORRECTION_ENGINE,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hasError: { type: Type.BOOLEAN },
          corrected: { type: Type.STRING },
          explanation: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["hasError"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"hasError": false}');
  } catch (e) {
    return { hasError: false };
  }
}

export async function analyzeMemory(content: string, isImage: boolean = false): Promise<any> {
  const ai = getGeminiClient();
  const parts: any[] = [{ text: content }];
  
  if (isImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: content.split(',')[1]
      }
    });
    parts[0].text = "Analyze this homework/document image.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS.IMPORT_ANALYSIS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          vocab: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING }
              }
            }
          },
          grammar: { type: Type.STRING }
        },
        required: ["topic", "vocab", "grammar"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeSession(history: { role: string; content: string }[]): Promise<SessionAnalysis> {
  const ai = getGeminiClient();
  const conversationText = history.map(h => `${h.role}: ${h.content}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `Analyze this Portuguese practice session for Chandler:\n${conversationText}` }] }],
    config: {
      systemInstruction: `You are a language learning analyst for Chandler's assistant, Iwry. 
      Analyze the dialogue and extract progress data.
      The grammarPerformance map should use keys like "Present Tense", "Future Tense", "Subjunctive", "Prepositions", or "Pronouns".
      Scores should be small adjustments: e.g., 0.05 for good usage, -0.05 for struggle.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newVocab: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ["word", "meaning"]
            }
          },
          grammarPerformance: {
            type: Type.OBJECT,
            properties: {
              "Present Tense": { type: Type.NUMBER },
              "Future Tense": { type: Type.NUMBER },
              "Subjunctive": { type: Type.NUMBER },
              "Prepositions": { type: Type.NUMBER },
              "Pronouns": { type: Type.NUMBER }
            }
          },
          summaryText: { type: Type.STRING },
          nextStepRecommendation: { type: Type.STRING }
        },
        required: ["newVocab", "grammarPerformance", "summaryText", "nextStepRecommendation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateQuiz(topicTitle: string, description: string): Promise<QuizQuestion[]> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `Topic: ${topicTitle}. Description: ${description}` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS.QUIZ_GENERATOR,
      responseMimeType: "application/json",
    }
  });

  try {
    const parsed = JSON.parse(response.text || '{"questions": []}');
    return parsed.questions;
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
}

export async function generateChatResponse(
  mode: string,
  history: { role: string; content: string }[],
  userInput: string,
  difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE,
  memories?: any[],
  image?: string,
  selectedTopics?: string[]
): Promise<string> {
  const ai = getGeminiClient();
  const contents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));
  
  const difficultyContext = `\nUSER CURRENT DIFFICULTY LEVEL: ${difficulty}. Adjust your vocabulary, pacing, and grammatical complexity to match this level perfectly.`;
  
  const memoryContext = memories && memories.length > 0 
    ? `\nRECENT MEMORIES OF CHANDLER'S EXTERNAL STUDY: ${memories.slice(0,3).map(m => m.topic).join(', ')}`
    : "";

  const focusContext = selectedTopics && selectedTopics.length > 0
    ? `\nCURRENT TARGETED FOCUS AREAS: ${selectedTopics.join(', ')}. Try to incorporate vocabulary and scenarios related to these topics naturally.`
    : "";

  const parts: any[] = [{ text: userInput + difficultyContext + memoryContext + focusContext }];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: image.split(',')[1]
      }
    });
  }

  contents.push({ role: 'user', parts });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS[mode] || SYSTEM_INSTRUCTIONS.CHAT,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text || "Desculpe, não consegui processar isso.";
}

export async function textToSpeech(text: string): Promise<Uint8Array | null> {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return decode(base64Audio);
    }
  } catch (err) {
    console.error("TTS Error:", err);
  }
  return null;
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Transcreva este áudio em Português do Brasil. Apenas o texto." },
        { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }
      ]
    }
  });
  return response.text || "";
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
