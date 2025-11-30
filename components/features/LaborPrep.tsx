import React, { useState } from 'react';
import { Play, Pause, Wind, Clock } from 'lucide-react';

interface LaborPrepProps {
    onBack: () => void;
}

const LaborPrep: React.FC<LaborPrepProps> = ({ onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(0);

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Connect</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-teal-700">Labor Prep Visualization</h2>
                <p className="text-gray-500 text-sm">Prepare your mind and body</p>
            </div>

            {/* Visualization Player */}
            <div className="bg-teal-900 rounded-3xl p-8 text-white text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-teal-800 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                        <Wind size={40} className="text-teal-200" />
                    </div>

                    <h3 className="text-xl font-serif mb-2">"Opening Flower" Visualization</h3>
                    <p className="text-teal-200 text-sm mb-8">Imagine your body opening gently like a lotus flower blooming in the morning sun.</p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="w-16 h-16 bg-white text-teal-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-400 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Contraction Timer Tool */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <Clock size={24} className="text-teal-500" />
                    <h3 className="font-bold text-gray-800">Contraction Timer</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Practice timing your surges. Tap to start, tap to stop.</p>
                <button className="w-full py-3 bg-teal-50 text-teal-700 font-bold rounded-xl border border-teal-100 hover:bg-teal-100 transition-colors">
                    Open Timer Tool
                </button>
            </div>
        </div>
    );
};

export default LaborPrep;
