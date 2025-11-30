import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Activity, ActivityCategory, DailyCurriculum, Dream } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("[Gemini] API Key loaded:", apiKey ? `Yes (Length: ${apiKey.length})` : "No");
const ai = new GoogleGenAI({ apiKey });

// Comprehensive System Instruction for GarbhVeda
const SYSTEM_INSTRUCTION = `
You are a holistic Garbh Sanskar guide named "GarbhVeda".
Your mission is to provide a daily routine for a pregnant mother that balances:
1. Left Brain (Logic, Math, Planning)
2. Right Brain (Art, Visualization, Music)
3. Soul (Spirituality, Values, Ancient Wisdom)
4. Connection (Bonding with baby)

Use a soothing, respectful, and culturally rich tone (Indian Vedic influence but universally applicable).
Always strictly follow the JSON schema.
`;

export const generateDailyCurriculum = async (
  week: number
): Promise<DailyCurriculum | null> => {
  console.log(`[Gemini] Generating curriculum content for week ${week}...`);
  const model = "models/gemini-2.5-flash";

  // STEP 1: Generate Content Only (No Resources)
  const contentPrompt = `
    Generate a daily Garbh Sanskar curriculum for Pregnancy Week ${week}.

    1. **Sankalpa (Intention)**: A virtue for the day (e.g., Compassion, Courage) with a short mantra.
    2. **Activities**: Provide exactly 4 distinct activities:
       - One MATH/LOGIC activity (Einstein Hour). MUST include a puzzle and its solution.
       - One ART/CREATIVITY activity (Visualization or Art idea).
       - One SPIRITUALITY activity (Sloka or Moral Story).
       - One BONDING activity (Garbh Samvad - talk to baby prompt).

    Return ONLY the JSON object with this exact structure:
    {
      "sankalpa": { "virtue": "...", "description": "...", "mantra": "..." },
      "activities": [
        {
          "id": "unique_id",
          "category": "MATH" | "ART" | "SPIRITUALITY" | "BONDING",
          "title": "...",
          "description": "...",
          "durationMinutes": 15,
          "content": "...",
          "solution": "...",
          "resources": [] 
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: contentPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    let text = response.text;
    if (!text) return null;

    const curriculum = JSON.parse(text) as DailyCurriculum;

    if (!curriculum || !Array.isArray(curriculum.activities)) {
      console.error("[Gemini] Invalid curriculum format received:", curriculum);
      return null;
    }

    // STEP 2: Find Resources for each activity in parallel
    console.log(`[Gemini] Finding resources for ${curriculum.activities.length} activities...`);

    const activitiesWithResources = await Promise.all(
      curriculum.activities.map(async (activity) => {
        const resources = await findResourcesForActivity(activity.title, activity.description, activity.category);
        return { ...activity, resources, isCompleted: false };
      })
    );

    curriculum.activities = activitiesWithResources;
    console.log("[Gemini] Curriculum generated successfully with verified resources");
    return curriculum;

  } catch (error) {
    console.error("[Gemini] Error generating curriculum:", error);
    return null;
  }
};

// Helper to find resources using Google Search Tool
const findResourcesForActivity = async (title: string, description: string, category: string) => {
  console.log(`[Gemini] Searching resources for: ${title}`);
  const model = "models/gemini-2.5-flash";

  const prompt = `
    Find 3-5 high-quality, ACTIVE, and WORKING external resources (YouTube videos, articles, blogs) for this pregnancy activity:
    
    Activity: ${title}
    Category: ${category}
    Description: ${description}

    CRITICAL INSTRUCTIONS:
    1. Use the Google Search tool to find REAL content.
    2. Return ONLY valid URLs found in the search.
    3. If you can't find good links, return an empty list.
    
    Return ONLY a raw JSON object (no markdown formatting if possible) with this structure:
    {
      "resources": [
        { "title": "...", "url": "...", "description": "..." }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" // Removed because it conflicts with tools
      }
    });

    let text = response.text;
    if (!text) return [];

    // Cleanup markdown if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json\n?|\n?```/g, "").trim();
    }

    const data = JSON.parse(text);
    return data.resources || [];
  } catch (e) {
    console.error(`[Gemini] Failed to find resources for ${title}`, e);
    return [];
  }
};

export const interpretDream = async (dreamText: string): Promise<Partial<Dream> | null> => {
  const model = "models/gemini-2.5-flash";
  const prompt = `
      A pregnant woman has recorded this dream: "${dreamText}".
      
      Please provide:
      1. A gentle, positive interpretation. Frame even weird or anxious dreams as the subconscious processing changes or releasing fears. Focus on growth, protection, and love.
      2. A short, calming positive affirmation related to the dream.
      
      Keep the tone soothing, maternal, and wise.
    `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: { type: Type.STRING },
            affirmation: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    console.log("[Gemini] Dream interpreted successfully");
    return JSON.parse(text);
  } catch (error) {
    console.error("[Gemini] Error interpreting dream", error);
    return null;
  }
}

export const generateAudio = async (text: string): Promise<AudioBuffer | null> => {
  console.log(`[Gemini] Generating audio for text: "${text.substring(0, 50)}..."`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    console.log(`[Gemini] Audio generated successfully (${audioBuffer.duration}s)`);
    return audioBuffer;

  } catch (error) {
    console.error("[Gemini] Error generating audio:", error);
    return null;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  console.log(`[Gemini] Generating image for prompt: "${prompt}"`);
  try {
    // Re-instantiate client to ensure key is present
    const localApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!localApiKey) {
      console.error("[Gemini] API Key is missing in generateImage");
      return null;
    }
    const localAi = new GoogleGenAI({ apiKey: localApiKey });

    const response = await localAi.models.generateContent({
      model: 'models/gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt + " style: soft watercolor, spiritual, dreamy, pastel colors, high quality." }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("[Gemini] Image generated successfully");
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("[Gemini] Image gen error", e);
    return null;
  }
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
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