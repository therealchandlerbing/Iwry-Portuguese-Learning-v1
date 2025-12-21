
import { GoogleGenAI, Modality, GenerateContentResponse, LiveServerMessage, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";
import { QuizQuestion, SessionAnalysis, DifficultyLevel, CorrectionObject, LessonModule, DictionaryEntry } from "../types";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getDictionaryDefinition(word: string): Promise<DictionaryEntry> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `Translate and define the following English word into Brazilian Portuguese: "${word}"` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS.DICTIONARY,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The Portuguese translation of the English word." },
          category: { type: Type.STRING },
          meaning: { type: Type.STRING, description: "Detailed definition in Portuguese." },
          translation: { type: Type.STRING, description: "Original English word for context." },
          tenseInfo: { type: Type.STRING },
          conjugation: {
            type: Type.OBJECT,
            properties: {
              eu: { type: Type.STRING },
              tu_voce: { type: Type.STRING },
              ele_ela: { type: Type.STRING },
              nos: { type: Type.STRING },
              vcs_eles: { type: Type.STRING }
            }
          },
          irregularities: { type: Type.STRING },
          examples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Usage examples in Portuguese with English translations in parentheses." },
          usageNotes: { type: Type.STRING },
          gender: { type: Type.STRING, enum: ['Masculine', 'Feminine', 'Neutral'] }
        },
        required: ["word", "category", "meaning", "translation", "examples", "usageNotes"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function checkGrammar(text: string, difficulty: DifficultyLevel): Promise<any> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `User input: "${text}"\nDifficulty: ${difficulty}` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS.CORRECTION_ENGINE,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hasError: { type: Type.BOOLEAN },
          corrected: { type: Type.STRING },
          explanation: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["hasError", "corrected", "explanation", "category"]
      }
    }
  });

  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(jsonStr || '{"hasError": false}');
  } catch (e) {
    console.warn("Grammar check failed to parse JSON:", response.text);
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
      thinkingConfig: { thinkingBudget: 0 },
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
      Scores should be small adjustments: e.g., 0.05 for good usage, -0.05 for struggle.`,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  try {
    const text = response.text || '{"questions": []}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return parsed.questions || [];
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
}

export async function generateCustomModule(request: string): Promise<LessonModule> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: `Create a custom Portuguese learning module for: "${request}". 
    It must include 2 submodules. Each submodule needs learning milestones and a 3-question unit test.` }] }],
    config: {
      systemInstruction: `You are a curriculum designer for Iwry, a Brazilian Portuguese tutor. 
      Generate a LessonModule object in JSON. 
      Include 'title', 'icon', 'description', and 'submodules'.`,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 16000 }
    }
  });

  const parsed = JSON.parse(response.text || "{}");
  return {
    ...parsed,
    id: `custom_${Date.now()}`,
    isCustom: true
  };
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
  const ai = getGeminiClient();
  const contents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));
  
  const isFlashMode = mode === 'TEXT_MODE' || mode === 'QUICK_HELP';
  const modelName = isFlashMode ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  const thinkingBudget = isFlashMode ? 0 : 16000;

  const beginnerTranslationRule = difficulty === DifficultyLevel.BEGINNER 
    ? "\nCRITICAL: Always translate Portuguese to English in parentheses. Example: 'Tudo bem? (How are you?)'."
    : "";

  const difficultyContext = `\n[Level: ${difficulty}${beginnerTranslationRule}]`;
  
  const memoryContext = memories && memories.length > 0 
    ? `\n[Recent context: ${memories.slice(0,3).map(m => m.topic).join(', ')}]`
    : "";

  const focusContext = selectedTopics && selectedTopics.length > 0
    ? `\n[Focus topics: ${selectedTopics.join(', ')}]`
    : "";

  const coachingContext = "\n[Role: Act as a sophisticated AI mentor. Be insightful, concise, and structured. Avoid yapping.]";

  const parts: any[] = [{ text: userInput + difficultyContext + memoryContext + focusContext + coachingContext }];
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
    model: modelName,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS[mode] || SYSTEM_INSTRUCTIONS.CHAT,
      thinkingConfig: { thinkingBudget }
    }
  });

  return response.text || "Desculpe, não consegui processar isso. (Sorry, I couldn't process that.)";
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
        { text: "Transcribe this audio. Only the text." },
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
