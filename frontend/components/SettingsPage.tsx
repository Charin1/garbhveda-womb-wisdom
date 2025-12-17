import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { ModelProvider, AppConfig, UserProfile } from '../types';
import { storage } from '../services/storageService';
import { updateConfig as updateBackendConfig, DEFAULT_MODELS, GROQ_MODELS, GEMINI_MODELS } from '../services/configService';

interface SettingsPageProps {
    user: UserProfile;
    onUpdateUser: (user: UserProfile) => void;
    onClose: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser, onClose }) => {
    // Local state for form
    const [config, setConfig] = useState<AppConfig>(storage.getConfig());
    const [motherName, setMotherName] = useState(user.name || '');
    const [fatherName, setFatherName] = useState(user.partnerName || '');
    const [pregnancyWeek, setPregnancyWeek] = useState(user.pregnancyWeek);
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleProviderChange = (provider: ModelProvider) => {
        setConfig(prev => ({
            ...prev,
            modelProvider: provider,
            modelName: DEFAULT_MODELS[provider]
        }));
    };

    const handleModelChange = (modelName: string) => {
        setConfig(prev => ({
            ...prev,
            modelName
        }));
    };

    const handleApiKeyChange = (key: string) => {
        setConfig(prev => ({
            ...prev,
            groqApiKey: key
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');

        try {
            // Save config to local storage
            storage.setConfig(config);

            // Update backend config (don't send API key if using Gemini)
            await updateBackendConfig({
                modelProvider: config.modelProvider === ModelProvider.GEMINI ? 'gemini' : 'groq',
                modelName: config.modelName,
                groqApiKey: config.modelProvider === ModelProvider.GROQ ? config.groqApiKey : undefined
            });

            // Update user profile
            const updatedUser: UserProfile = {
                ...user,
                name: motherName,
                partnerName: fatherName,
                pregnancyWeek
            };
            onUpdateUser(updatedUser);

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('[Settings] Error saving:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const models = config.modelProvider === ModelProvider.GROQ ? GROQ_MODELS : GEMINI_MODELS;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                            <Settings className="text-sage-600" size={20} />
                        </div>
                        <h2 className="text-xl font-serif text-gray-800">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Model Configuration Section */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">AI Model Configuration</h3>

                        {/* Provider Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Model Provider</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleProviderChange(ModelProvider.GEMINI)}
                                    className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${config.modelProvider === ModelProvider.GEMINI
                                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    🔷 Gemini
                                </button>
                                <button
                                    onClick={() => handleProviderChange(ModelProvider.GROQ)}
                                    className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${config.modelProvider === ModelProvider.GROQ
                                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    ⚡ Groq
                                </button>
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                            <div className="relative">
                                <select
                                    value={config.modelName}
                                    onChange={(e) => handleModelChange(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-sage-200 focus:border-sage-300 outline-none pr-10"
                                >
                                    {models.map(model => (
                                        <option key={model.id} value={model.id}>{model.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Groq API Key (only show if Groq selected) */}
                        {config.modelProvider === ModelProvider.GROQ && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Groq API Key</label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={config.groqApiKey || ''}
                                        onChange={(e) => handleApiKeyChange(e.target.value)}
                                        placeholder="Enter your Groq API key"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-200 focus:border-sage-300 outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Get your API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-sage-600 hover:underline">console.groq.com</a>
                                </p>
                            </div>
                        )}
                    </section>

                    {/* User Details Section */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">User Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                                <input
                                    type="text"
                                    value={motherName}
                                    onChange={(e) => setMotherName(e.target.value)}
                                    placeholder="Enter mother's name"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                                <input
                                    type="text"
                                    value={fatherName}
                                    onChange={(e) => setFatherName(e.target.value)}
                                    placeholder="Enter father's name"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-300 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pregnancy Week: <span className="text-sage-600 font-bold">{pregnancyWeek}</span>
                                </label>
                                <input
                                    type="range"
                                    min="4"
                                    max="42"
                                    value={pregnancyWeek}
                                    onChange={(e) => setPregnancyWeek(parseInt(e.target.value))}
                                    className="w-full accent-sage-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Week 4</span>
                                    <span>Week 42</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-3xl">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${saveStatus === 'success'
                            ? 'bg-green-500'
                            : saveStatus === 'error'
                                ? 'bg-red-500'
                                : 'bg-sage-500 hover:bg-sage-600'
                            } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <>Saving...</>
                        ) : saveStatus === 'success' ? (
                            <><Check size={18} /> Saved!</>
                        ) : saveStatus === 'error' ? (
                            <>Error saving</>
                        ) : (
                            <><Save size={18} /> Save Settings</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
