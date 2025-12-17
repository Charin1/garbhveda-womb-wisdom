import React, { useState } from 'react';
import { Brain, Sparkles, Eye, Music, TrendingUp, RefreshCw } from 'lucide-react';
import Button from '../Button';
import { DailyCurriculum, Activity, ActivityCategory } from '../../types';
import RhythmicMath from '../features/RhythmicMath';
import FinancialWisdom from '../features/FinancialWisdom';

interface LearnTabProps {
    curriculum: DailyCurriculum | null;
    onActivitySelect: (activity: Activity) => void;
    generatedImageUrl: string | null;
    isGeneratingImage: boolean;
    onGenerateImage: (prompt: string) => void;
    onRefresh: () => void;
}

const LearnTab: React.FC<LearnTabProps> = ({ curriculum, onActivitySelect, generatedImageUrl, isGeneratingImage, onGenerateImage, onRefresh }) => {
    const [showPuzzleSolution, setShowPuzzleSolution] = useState(false);
    const [activeFeature, setActiveFeature] = useState<'MATH' | 'FINANCE' | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const mathActivity = curriculum?.activities.find(a => a.category === ActivityCategory.MATH);
    const artActivity = curriculum?.activities.find(a => a.category === ActivityCategory.ART);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    if (activeFeature === 'MATH') {
        return <RhythmicMath onBack={() => setActiveFeature(null)} />;
    }

    if (activeFeature === 'FINANCE') {
        return <FinancialWisdom onBack={() => setActiveFeature(null)} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3">
                    <h2 className="text-2xl font-serif text-gray-800">Brain & Beauty</h2>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-full bg-sage-100 hover:bg-sage-200 transition-all disabled:opacity-50"
                        title="Refresh activities"
                    >
                        <RefreshCw size={18} className={`text-sage-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <p className="text-gray-500 text-sm">Stimulating left and right hemispheres</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button
                    onClick={() => setActiveFeature('MATH')}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-sky-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                        <Music size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Rhythmic Math</span>
                </button>
                <button
                    onClick={() => setActiveFeature('FINANCE')}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-emerald-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Financial Wisdom</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EINSTEIN HOUR (Math) */}
                {mathActivity && (
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full">
                        <div className="bg-sky-50 p-4 border-b border-sky-100 flex justify-between items-center">
                            <h3 className="font-bold text-sky-700 flex items-center gap-2">
                                <Brain size={18} /> The Einstein Hour
                            </h3>
                            <span className="text-xs bg-white text-sky-600 px-2 py-1 rounded-full border border-sky-100">Logic</span>
                        </div>
                        <div className="p-6">
                            <h4 className="text-lg font-medium mb-2">{mathActivity.title}</h4>
                            <p className="text-gray-600 mb-6">{mathActivity.content}</p>

                            {mathActivity.solution && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    {!showPuzzleSolution ? (
                                        <button
                                            onClick={() => setShowPuzzleSolution(true)}
                                            className="w-full text-center text-sm text-sage-600 font-medium hover:underline"
                                        >
                                            Tap to reveal solution
                                        </button>
                                    ) : (
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Solution:</p>
                                            <p className="text-gray-700 font-medium">{mathActivity.solution}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resources */}
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Explore Logic</p>
                                <div className="flex flex-wrap gap-2">
                                    {mathActivity.resources.slice(0, 3).map((r, i) => (
                                        <a key={i} href={r.url} target="_blank" className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 truncate max-w-[150px] hover:border-sky-300">
                                            {r.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ART CANVAS */}
                {artActivity && (
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full">
                        <div className="bg-rose-quartz-50 p-4 border-b border-rose-quartz-100 flex justify-between items-center">
                            <h3 className="font-bold text-rose-quartz-700 flex items-center gap-2">
                                <Sparkles size={18} /> Creative Visualization
                            </h3>
                            <span className="text-xs bg-white text-rose-quartz-600 px-2 py-1 rounded-full border border-rose-quartz-100">Right Brain</span>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 italic mb-4">"{artActivity.visualPrompt || artActivity.description}"</p>

                            <div className="w-full aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                                {generatedImageUrl ? (
                                    <img src={generatedImageUrl} alt="Art" className="w-full h-full object-cover animate-fade-in" />
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onGenerateImage(artActivity.visualPrompt || artActivity.description)}
                                        isLoading={isGeneratingImage}
                                    >
                                        <Eye size={16} className="mr-2" /> Generate Visualization
                                    </Button>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Powered by Gemini Imagen</span>
                                <button className="text-xs text-sage-600 font-semibold" onClick={() => onActivitySelect(artActivity)}>
                                    View Full Activity
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnTab;
