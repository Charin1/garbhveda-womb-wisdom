import React, { useState } from 'react';
import { Sun, ChevronRight, Brain, Sparkles, Heart, Utensils, Activity as ActivityIcon } from 'lucide-react';
import MoodTracker from '../MoodTracker';
import { DailyCurriculum, Activity, ActivityCategory, Mood } from '../../types';
import DietPlanner from '../features/DietPlanner';
import YogaGuide from '../features/YogaGuide';

interface HomeTabProps {
    curriculum: DailyCurriculum | null;
    isLoading: boolean;
    currentMood: Mood | null;
    onMoodSelect: (mood: Mood) => void;
    onActivitySelect: (activity: Activity) => void;
    week: number;
}

const HomeTab: React.FC<HomeTabProps> = ({ curriculum, isLoading, currentMood, onMoodSelect, onActivitySelect, week }) => {
    const [activeFeature, setActiveFeature] = useState<'DIET' | 'YOGA' | null>(null);

    const trimester = week <= 12 ? 1 : week <= 26 ? 2 : 3;

    if (activeFeature === 'DIET') {
        return <DietPlanner onBack={() => setActiveFeature(null)} week={week} />;
    }

    if (activeFeature === 'YOGA') {
        return <YogaGuide onBack={() => setActiveFeature(null)} trimester={trimester} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Daily Sankalpa Card */}
            <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-3xl p-6 text-white shadow-lg shadow-sage-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sage-100 text-xs font-semibold uppercase tracking-wider mb-1">Daily Sankalpa</p>
                        <h2 className="text-2xl font-serif">{curriculum?.sankalpa.virtue || "Loading..."}</h2>
                    </div>
                    <Sun className="text-sage-200" size={24} />
                </div>
                <p className="text-sage-50 mb-4 text-sm leading-relaxed opacity-90">
                    "{curriculum?.sankalpa.description}"
                </p>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-xs font-medium text-center italic">
                        Mantra: {curriculum?.sankalpa.mantra}
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                    onClick={() => setActiveFeature('DIET')}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-sage-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center">
                        <Utensils size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Sattvic Diet</span>
                </button>
                <button
                    onClick={() => setActiveFeature('YOGA')}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-sage-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center">
                        <ActivityIcon size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Yoga for Two</span>
                </button>
            </div>

            {/* Mood Tracker */}
            <MoodTracker currentMood={currentMood} onMoodSelect={onMoodSelect} />

            {/* Routine Timeline */}
            <div>
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4 px-1">Today's Rhythm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-500 rounded-full animate-spin"></div>
                            <p className="text-sage-600 font-medium animate-pulse">Consulting the stars...</p>
                        </div>
                    ) :
                        curriculum?.activities.slice(0, 3).map((activity, idx) => (
                            <div
                                key={idx}
                                onClick={() => onActivitySelect(activity)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                       ${activity.category === ActivityCategory.MATH ? 'bg-blue-400' :
                                        activity.category === ActivityCategory.ART ? 'bg-rose-quartz-400' : 'bg-saffron-400'
                                    }`}>
                                    {activity.category === ActivityCategory.MATH && <Brain size={20} />}
                                    {activity.category === ActivityCategory.ART && <Sparkles size={20} />}
                                    {activity.category === ActivityCategory.SPIRITUALITY && <Sun size={20} />}
                                    {activity.category === ActivityCategory.BONDING && <Heart size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 font-bold uppercase">{activity.category}</p>
                                    <h4 className="text-gray-800 font-medium">{activity.title}</h4>
                                </div>
                                <ChevronRight size={18} className="text-gray-300" />
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default HomeTab;
