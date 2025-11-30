import React, { useState } from 'react';
import { Activity, Play } from 'lucide-react';

const YOGA_POSES = [
    {
        id: 'butterfly',
        title: 'Baddha Konasana',
        subtitle: 'Butterfly Pose',
        benefits: 'Opens hips, relieves fatigue',
        trimester: 'All Trimesters',
        image: '🧘‍♀️' // Placeholder for 3D animation
    },
    {
        id: 'cat_cow',
        title: 'Marjaryasana',
        subtitle: 'Cat-Cow Stretch',
        benefits: 'Relieves back pain, shifts baby position',
        trimester: '2nd & 3rd Trimester',
        image: '🐈'
    },
    {
        id: 'mountain',
        title: 'Tadasana',
        subtitle: 'Mountain Pose',
        benefits: 'Improves posture & balance',
        trimester: '1st Trimester',
        image: '🏔️'
    }
];

interface YogaGuideProps {
    onBack: () => void;
    trimester: number;
}

const YogaGuide: React.FC<YogaGuideProps> = ({ onBack, trimester }) => {
    const [activePose, setActivePose] = useState<string | null>(null);

    // Filter poses based on trimester
    // Note: In a real app, we'd have more robust tagging. Here we do simple string matching or show all if generic.
    const filteredPoses = YOGA_POSES.filter(pose => {
        if (pose.trimester.includes("All")) return true;
        if (trimester === 1 && pose.trimester.includes("1st")) return true;
        if (trimester === 2 && pose.trimester.includes("2nd")) return true;
        if (trimester === 3 && pose.trimester.includes("3rd")) return true;
        return false;
    });

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Routine</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-sage-700">Yoga for Trimester {trimester}</h2>
                <p className="text-gray-500 text-sm">Gentle movement for strength & peace</p>
            </div>

            <div className="grid gap-4">
                {filteredPoses.length > 0 ? filteredPoses.map(pose => (
                    <div
                        key={pose.id}
                        className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer ${activePose === pose.id ? 'border-sage-400 ring-2 ring-sage-100' : 'border-gray-100'}`}
                        onClick={() => setActivePose(activePose === pose.id ? null : pose.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-sage-50 rounded-xl flex items-center justify-center text-3xl">
                                {pose.image}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{pose.title}</h3>
                                <p className="text-xs text-sage-600 font-medium">{pose.subtitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{pose.trimester}</span>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activePose === pose.id ? 'bg-sage-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Play size={14} fill="currentColor" />
                            </div>
                        </div>

                        {activePose === pose.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                                <p className="text-sm text-gray-600 mb-3">
                                    <span className="font-bold text-sage-700">Benefits:</span> {pose.benefits}
                                </p>
                                <div className="bg-sage-50 p-3 rounded-xl text-center">
                                    <p className="text-xs text-sage-600 italic">"Inhale deeply as you expand, exhale slowly as you release."</p>
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center text-gray-500 py-10">
                        <p>Rest is best for now. No specific poses for this stage.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YogaGuide;
