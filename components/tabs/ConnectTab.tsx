import React, { useState } from 'react';
import { Footprints, Heart, MessageCircle, Image as ImageIcon, Wind } from 'lucide-react';
import { DailyCurriculum, ActivityCategory, UserProfile } from '../../types';
import GarbhSamvad from '../features/GarbhSamvad';
import Scrapbook from '../features/Scrapbook';
import LaborPrep from '../features/LaborPrep';

interface ConnectTabProps {
    curriculum: DailyCurriculum | null;
    user: UserProfile | null;
    onKick: () => void;
}

const ConnectTab: React.FC<ConnectTabProps> = ({ curriculum, user, onKick }) => {
    const [activeFeature, setActiveFeature] = useState<'CHAT' | 'SCRAPBOOK' | 'LABOR' | null>(null);
    const bondActivity = curriculum?.activities.find(a => a.category === ActivityCategory.BONDING);

    if (activeFeature === 'CHAT') {
        return <GarbhSamvad onBack={() => setActiveFeature(null)} />;
    }

    if (activeFeature === 'SCRAPBOOK') {
        return <Scrapbook onBack={() => setActiveFeature(null)} />;
    }

    if (activeFeature === 'LABOR') {
        return <LaborPrep onBack={() => setActiveFeature(null)} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kick Counter */}
                <div className="bg-gradient-to-r from-sky-400 to-sky-500 rounded-3xl p-6 text-white shadow-lg shadow-sky-200 relative overflow-hidden h-full">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-serif mb-1">Kick Counter</h2>
                            <Footprints className="text-sky-200 rotate-12" size={32} />
                        </div>
                        <p className="text-sky-100 text-sm mb-6">Track baby's movements today</p>

                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-6xl font-serif font-bold leading-none">{user?.kickCount || 0}</span>
                            <span className="text-sm mb-2 opacity-80">kicks</span>
                        </div>

                        <button
                            onClick={onKick}
                            className="w-full py-3 bg-white text-sky-600 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                        >
                            Tap to Record Kick
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>

                {/* Daily Bonding Prompt */}
                {bondActivity && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4 text-rose-quartz-500">
                            <Heart size={24} fill="currentColor" className="text-rose-quartz-100 stroke-rose-quartz-500" />
                            <h3 className="font-serif text-lg font-bold text-gray-800">Daily Bonding</h3>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
                            {bondActivity.content}
                        </p>

                        <div className="bg-sage-50 rounded-xl p-4 border border-sage-100 mt-auto">
                            <p className="text-xs font-bold text-sage-600 uppercase mb-2">Today's Prompt</p>
                            <p className="text-sage-800 italic">"{bondActivity.description}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectTab;
