import api from './api';
import { AppConfig, ModelProvider } from '../types';

/**
 * Get current configuration from backend
 */
/**
 * Get current configuration from backend
 */
export const getConfig = async (): Promise<AppConfig> => {
    try {
        // Backend returns snake_case (model_provider, etc.)
        const response = await api.get<any>('/config');
        const data = response.data;

        // Map to frontend CamelCase
        return {
            modelProvider: data.model_provider as ModelProvider,
            modelName: data.model_name,
            groqApiKey: data.groq_api_key || undefined
        };
    } catch (error) {
        console.error('[Config] Error fetching config:', error);
        // Return default config on error
        return {
            modelProvider: ModelProvider.GEMINI,
            modelName: 'gemini-2.0-flash'
        };
    }
};

// Request type for backend config update (uses string literals to match Python backend)
interface BackendConfigUpdate {
    modelProvider?: 'gemini' | 'groq';
    modelName?: string;
    groqApiKey?: string;
}

/**
 * Update configuration on backend
 */
export const updateConfig = async (config: BackendConfigUpdate): Promise<AppConfig> => {
    try {
        // Map to backend snake_case
        const payload = {
            model_provider: config.modelProvider,
            model_name: config.modelName,
            groq_api_key: config.groqApiKey
        };

        const response = await api.post<any>('/config', payload);
        const data = response.data;

        // Map response back to frontend (though usually we trust the input or just simple ack)
        return {
            modelProvider: data.model_provider as ModelProvider,
            modelName: data.model_name,
            groqApiKey: data.groq_api_key
        };
    } catch (error) {
        console.error('[Config] Error updating config:', error);
        throw error;
    }
};

// Default models for each provider
export const DEFAULT_MODELS: Record<ModelProvider, string> = {
    [ModelProvider.GEMINI]: 'gemini-2.0-flash',
    [ModelProvider.GROQ]: 'llama-3.3-70b-versatile'
};

// Available Groq models
export const GROQ_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (OpenAI)' },
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (OpenAI)' },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
];

// Available Gemini models
export const GEMINI_MODELS = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
];
