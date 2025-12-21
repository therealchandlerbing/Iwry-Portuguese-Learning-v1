
import { GoogleGenAI, Modality, GenerateContentResponse, LiveServerMessage } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";

// @google/genai guidelines: Use process.env.API_KEY directly in initialization
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Text & Reasoning (Chat, Lessons)
export async function generateChatResponse(
  mode: string,
  history: { role: string; content: string }[],
  userInput: string,
  image?: string
): Promise<string> {
  const ai = getGeminiClient();
  const contents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));
  
  const parts: any[] = [{ text: userInput }];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: image.split(',')[1]
      }
    });
  }

  contents.push({ role: 'user', parts });

  // @google/genai guidelines: Use ai.models.generateContent directly
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS[mode] || SYSTEM_INSTRUCTIONS.CHAT,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  // @google/genai guidelines: Access .text property directly
  return response.text || "Desculpe, não consegui processar isso.";
}

// Speech Generation (TTS)
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
            // Warm, friendly voice
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

// Audio Transcription (STT)
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

// Live API Helpers - Implement as per guidelines
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
