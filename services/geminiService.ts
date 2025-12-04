import api from './api';
import { DailyCurriculum, Dream } from '../types';

export const generateDailyCurriculum = async (
  week: number
): Promise<DailyCurriculum | null> => {
  console.log(`[Gemini] Requesting curriculum for week ${week}...`);
  try {
    const response = await api.get<DailyCurriculum>(`/curriculum/${week}`);
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