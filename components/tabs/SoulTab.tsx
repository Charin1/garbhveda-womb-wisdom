import React, { useState } from 'react';
import { Sun, Play, Pause, Volume2, Music, Mic2, Sparkles } from 'lucide-react';
import Button from '../Button';
import DreamJournal from '../DreamJournal';
import { DailyCurriculum, ActivityCategory, Dream } from '../../types';
import { AUDIO_TRACKS } from '../../data/audioTracks';
import RaagaPlayer from '../features/RaagaPlayer';
import MantraPlayer from '../features/MantraPlayer';
import VisualizationPlayer from '../features/VisualizationPlayer';

interface SoulTabProps {
    curriculum: DailyCurriculum | null;
    dreams: Dream[];
    onSaveDream: (dream: Dream) => void;
    currentTrackId: string | null;
    isPlaying: boolean;
    onPlayTrack: (id: string, text: string) => void;
}

const SoulTab: React.FC<SoulTabProps> = ({ curriculum, dreams, onSaveDream, currentTrackId, isPlaying, onPlayTrack }) => {
    const [activeFeature, setActiveFeature] = useState<'RAAGA' | 'MANTRA' | 'VIZ' | null>(null);
    const spiritActivity = curriculum?.activities.find(a => a.category === ActivityCategory.SPIRITUALITY);

    if (activeFeature === 'RAAGA') {
        return <RaagaPlayer onBack={() => setActiveFeature(null)} />;
    }

    if (activeFeature === 'MANTRA') {
        return <MantraPlayer onBack={() => setActiveFeature(null)} />;
    }

    if (activeFeature === 'VIZ') {
        return <VisualizationPlayer onBack={() => setActiveFeature(null)} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-serif text-gray-800">Sacred Space</h2>
                <p className="text-gray-500 text-sm">Mantras and ancient vibrations</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => setActiveFeature('RAAGA')}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-amber-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Music size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 text-center">Raaga Ritu</span>
                </button>
                <button
                    onClick={() => setActiveFeature('MANTRA')}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-saffron-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center">
                        <Mic2 size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 text-center">Mantra Naad</span>
                </button>
                <button
                    onClick={() => setActiveFeature('VIZ')}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-indigo-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 text-center">Journeys</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dream Journal */}
                <div className="h-full">
                    <DreamJournal
                        dreams={dreams}
                        onSaveDream={onSaveDream}
                    />
                </div>

                {/* Daily Sloka/Story */}
                {spiritActivity && (
                    <div className="bg-saffron-50 rounded-3xl p-6 border border-saffron-100 relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sun size={100} className="text-saffron-500" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider bg-white/50 px-2 py-1 rounded-md w-fit">
                                {spiritActivity.title}
                            </span>
                            <div className="mt-4 prose prose-orange text-gray-700 flex-grow">
                                <p>{spiritActivity.content}</p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => onPlayTrack(spiritActivity.id, spiritActivity.audioPrompt || spiritActivity.content)}
                                    className="bg-saffron-500 hover:bg-saffron-600"
                                >
                                    {isPlaying && currentTrackId === spiritActivity.id ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                                    Chant
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Audio Library List */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Mantra & Raaga Library</h3>
                <div className="space-y-3">
                    {AUDIO_TRACKS.map(track => (
                        <div
                            key={track.id}
                            onClick={() => onPlayTrack(track.id, track.text)}
                            className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${currentTrackId === track.id ? 'bg-sage-50 border-sage-200' : 'bg-white border-gray-100 hover:border-sage-200'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentTrackId === track.id ? 'bg-sage-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {currentTrackId === track.id && isPlaying ? <div className="w-3 h-3 bg-white rounded-sm animate-spin" /> : <Play size={16} fill="currentColor" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-800">{track.title}</h4>
                                <p className="text-xs text-gray-500">{track.category}</p>
                            </div>
                            {currentTrackId === track.id && (
                                <div className="flex items-center gap-2">
                                    <Volume2 size={16} className="text-sage-500" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SoulTab;
