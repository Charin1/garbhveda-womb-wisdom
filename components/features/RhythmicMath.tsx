import React, { useState, useRef } from 'react';
import { Play, Pause, Music, Brain } from 'lucide-react';

const MATH_BEATS = [
    { id: 'tables_2', title: 'Table of 2 (Tabla Beat)', duration: '2:30', bpm: 80 },
    { id: 'primes', title: 'Prime Numbers (Flute Flow)', duration: '3:15', bpm: 60 },
    { id: 'fibonacci', title: 'Fibonacci Sequence (Drum)', duration: '1:45', bpm: 90 },
];

interface RhythmicMathProps {
    onBack: () => void;
}

const RhythmicMath: React.FC<RhythmicMathProps> = ({ onBack }) => {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const togglePlay = (id: string) => {
        if (playingId === id) {
            // Stop
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPlayingId(null);
            setProgress(0);
        } else {
            // Start
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPlayingId(id);
            setProgress(0);
            intervalRef.current = setInterval(() => {
                setProgress(p => (p >= 100 ? 0 : p + 1));
            }, 100);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Learn</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-sky-700">Rhythmic Math</h2>
                <p className="text-gray-500 text-sm">Logic meets Rhythm</p>
            </div>

            <div className="space-y-4">
                {MATH_BEATS.map(beat => (
                    <div
                        key={beat.id}
                        className={`bg-white p-4 rounded-2xl shadow-sm border transition-all ${playingId === beat.id ? 'border-sky-400 ring-2 ring-sky-50' : 'border-gray-100'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${playingId === beat.id ? 'bg-sky-500 text-white animate-pulse' : 'bg-sky-50 text-sky-500'}`}>
                                {playingId === beat.id ? <Music size={20} /> : <Brain size={20} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{beat.title}</h3>
                                <p className="text-xs text-gray-500">{beat.bpm} BPM • {beat.duration}</p>
                            </div>
                            <button
                                onClick={() => togglePlay(beat.id)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingId === beat.id ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400 hover:bg-sky-50 hover:text-sky-500'}`}
                            >
                                {playingId === beat.id ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                            </button>
                        </div>

                        {playingId === beat.id && (
                            <div className="mt-4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-sky-500 h-full transition-all duration-100 ease-linear"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RhythmicMath;
