import api from './api';
import { DailyCurriculum, Dream, Raaga, Mantra } from '../types';

export const generateDailyCurriculum = async (
  week: number,
  mood?: string
): Promise<DailyCurriculum | null> => {
  console.log(`[Gemini] Requesting curriculum for week ${week}, mood: ${mood}...`);
  try {
    const params = mood ? { mood } : {};
    const response = await api.get<DailyCurriculum>(`/curriculum/${week}`, { params });
    return response.data;
  } catch (error) {
    console.error("[Gemini] Error fetching curriculum:", error);
    return null;
  }
};

export const interpretDream = async (dreamText: string): Promise<Partial<Dream> | null> => {
  try {
    const response = await api.post('/dream/interpret', { dreamText });
    return response.data;
  } catch (error) {
    console.error("[Gemini] Error interpreting dream:", error);
    return null;
  }
}

export const generateAudio = async (text: string): Promise<AudioBuffer | null> => {
  console.log(`[Gemini] Requesting audio for text: "${text.substring(0, 50)}..."`);
  try {
    const response = await api.post('/generate/audio', { text }, {
      responseType: 'arraybuffer'
    });

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(response.data);

  } catch (error) {
    console.error("[Gemini] Error generating audio:", error);
    return null;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  console.log(`[Gemini] Requesting image for prompt: "${prompt}"`);
  try {
    const response = await api.post('/generate/image', { prompt });
    return response.data.url;
  } catch (e) {
    console.error("[Gemini] Image gen error", e);
    return null;
  }
}


export const generateRaagaRecommendations = async (): Promise<Raaga[] | null> => {
  console.log("[Gemini] Requesting raaga recommendations...");
  try {
    const response = await api.get<{ raagas: Raaga[] }>('/raaga-recommendations');
    return response.data.raagas;
  } catch (error) {
    console.error("[Gemini] Error generating raaga recommendations:", error);
    return null;
  }
};

export const getInitialRaagas = async (): Promise<Raaga[] | null> => {
  console.log("[Gemini] Requesting initial raagas...");
  try {
    const response = await api.get<{ raagas: Raaga[] }>('/raagas/defaults');
    return response.data.raagas;
  } catch (error) {
    console.error("[Gemini] Error fetching initial raagas:", error);
    return null;
  }
};

export const getInitialMantras = async (): Promise<Mantra[] | null> => {
  console.log("[Gemini] Requesting initial mantras...");
  try {
    const response = await api.get<{ mantras: Mantra[] }>('/mantras/defaults');
    return response.data.mantras;
  } catch (error) {
    console.error("[Gemini] Error fetching initial mantras:", error);
    return null;
  }
};