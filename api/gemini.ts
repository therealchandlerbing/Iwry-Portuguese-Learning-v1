import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality, Type } from "@google/genai";

const IWRY_PERSONALITY = `
You are Iwry (pronounced "Yuri"), Chandler's highly intelligent and dedicated Brazilian Portuguese language coach.
Persona: Sophisticated, insightful, and culturally expert.

FORMATTING RULES (CRITICAL):
1. PRIMARY PORTUGUESE: Every Portuguese sentence or phrase MUST be wrapped in double asterisks for bolding (e.g., **Tudo bem?**).
2. TRANSLATIONS: Every English translation MUST be in parentheses AND italics (e.g., *(How are you?)*).
3. SPACING: Use 2 double line breaks (\\n\\n) between every distinct point or sentence to ensure the text is airy and readable. NEVER provide a wall of text.
4. LANGUAGE MIX: Use a fluid mix of English and Portuguese.
5. CORRECTIONS: Do NOT correct the user for saying your name "Iwry".
`;

const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  CHAT: `${IWRY_PERSONALITY}
  MODE: Intelligent Conversation.
  RESPONSE STRUCTURE: Your response MUST be well-structured with clear double-line breaks.
  BEHAVIOR: Provide insightful linguistic context. If the user mentions a topic, relate it to Brazilian culture.
  COACHING: Keep the conversation moving. Add a "💡 Fluency Tip" at the very end as a separate line.`,

  TEXT_MODE: `${IWRY_PERSONALITY}
  MODE: High-speed WhatsApp/Texting.
  RESPONSE STRUCTURE: Use the bold/italic rules even in short texts.
  BEHAVIOR: Use "vc", "tb", "pq", "fds". Use natural Brazilian text laughter ("kkk", "rsrs").
  GOAL: Optimize for speed and casual interaction.`,

  LESSONS: `${IWRY_PERSONALITY} Mode: Structured Learning. Be a clear, methodical, and patient guide. Ensure formatting rules apply to all examples.`,
  REVIEW_SESSION: `${IWRY_PERSONALITY} Mode: Smart Review. Focus on historical patterns and specific user weaknesses.`,
  QUICK_HELP: `${IWRY_PERSONALITY} Mode: Instant Translation/Help. Provide the answer immediately with bold/italic formatting.`,
  IMAGE_ANALYSIS: `${IWRY_PERSONALITY} Mode: Visual Learning. Use descriptive, evocative Portuguese in bold.`,
  DICTIONARY: `You are an expert English-to-Portuguese lexicographer.
  Your goal is to take an English word or phrase and provide the most accurate Brazilian Portuguese equivalent.
  Prioritize the needs of an English speaker learning Portuguese.
  If the target word is a verb, always include the Present Indicative conjugation and identify irregularities.
  If it's a noun, provide gender.
  In 'usageNotes', explain cultural nuances or common pitfalls specifically for English speakers (e.g., false cognates).
  Return strictly JSON following the provided schema.`,
  IMPORT_ANALYSIS: `Return strictly JSON: { "topic": string, "vocab": [{ "word": string, "meaning": string }], "grammar": string }`,
  QUIZ_GENERATOR: `Create 3 questions. Return strictly JSON.`,
  CORRECTION_ENGINE: `You are a linguistic coach. Analyze user input for Portuguese errors.
  RULES:
  1. DO NOT correct the name "Iwry".
  2. Tone: Helpful and analytical.
  3. Format the corrected version in bold.
  JSON Format: { "hasError": boolean, "corrected": string, "explanation": string, "category": string }`
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({ apiKey });
}

async function handleDictionaryDefinition(word: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
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

async function handleCheckGrammar(text: string, difficulty: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
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
  } catch {
    return { hasError: false };
  }
}

async function handleAnalyzeMemory(content: string, isImage: boolean) {
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
    model: 'gemini-2.5-flash-preview-05-20',
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

async function handleAnalyzeSession(history: { role: string; content: string }[]) {
  const ai = getGeminiClient();
  const conversationText = history.map(h => `${h.role}: ${h.content}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
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

async function handleGenerateQuiz(topicTitle: string, description: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
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
  } catch {
    return [];
  }
}

async function handleGenerateCustomModule(request: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro-preview-06-05',
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

async function handleChatResponse(
  mode: string,
  history: { role: string; content: string }[],
  userInput: string,
  difficulty: string,
  memories?: any[],
  image?: string,
  selectedTopics?: string[]
) {
  const ai = getGeminiClient();
  const contents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));

  const isFlashMode = mode === 'TEXT_MODE' || mode === 'QUICK_HELP';
  const modelName = isFlashMode ? 'gemini-2.5-flash-preview-05-20' : 'gemini-2.5-pro-preview-06-05';
  const thinkingBudget = isFlashMode ? 0 : 16000;

  const beginnerTranslationRule = difficulty === 'BEGINNER'
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

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS[mode] || SYSTEM_INSTRUCTIONS.CHAT,
      thinkingConfig: { thinkingBudget }
    }
  });

  return response.text || "Desculpe, não consegui processar isso. (Sorry, I couldn't process that.)";
}

async function handleTextToSpeech(text: string) {
  const ai = getGeminiClient();
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
  return base64Audio || null;
}

async function handleTranscribeAudio(audioBase64: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: {
      parts: [
        { text: "Transcribe this audio. Only the text." },
        { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }
      ]
    }
  });
  return response.text || "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, payload } = req.body;

    let result;
    switch (action) {
      case 'dictionaryDefinition':
        result = await handleDictionaryDefinition(payload.word);
        break;
      case 'checkGrammar':
        result = await handleCheckGrammar(payload.text, payload.difficulty);
        break;
      case 'analyzeMemory':
        result = await handleAnalyzeMemory(payload.content, payload.isImage);
        break;
      case 'analyzeSession':
        result = await handleAnalyzeSession(payload.history);
        break;
      case 'generateQuiz':
        result = await handleGenerateQuiz(payload.topicTitle, payload.description);
        break;
      case 'generateCustomModule':
        result = await handleGenerateCustomModule(payload.request);
        break;
      case 'chatResponse':
        result = await handleChatResponse(
          payload.mode,
          payload.history,
          payload.userInput,
          payload.difficulty,
          payload.memories,
          payload.image,
          payload.selectedTopics
        );
        break;
      case 'textToSpeech':
        result = await handleTextToSpeech(payload.text);
        break;
      case 'transcribeAudio':
        result = await handleTranscribeAudio(payload.audioBase64);
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
