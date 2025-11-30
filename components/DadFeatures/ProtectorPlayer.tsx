import React, { useState, useRef } from 'react';
import { Shield, Play, Pause, RefreshCw } from 'lucide-react';

interface ProtectorPlayerProps {
    onBack: () => void;
}

const ProtectorPlayer: React.FC<ProtectorPlayerProps> = ({ onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    // Mock audio duration in seconds (3 minutes)
    const DURATION = 180;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const togglePlay = () => {
        if (isPlaying) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + (100 / DURATION);
                });
            }, 1000);
        }
    };

    const formatTime = (percent: number) => {
        const totalSeconds = (percent / 100) * DURATION;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-100">
            {/* Header */}
            <div className="flex items-center gap-2 text-slate-400 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Dashboard</span>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">The Protector</h1>
                <p className="text-slate-400 text-sm">Visualize a golden shield around the womb.</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">

                {/* Visualizer Mock */}
                <div className="relative mb-12">
                    <div className={`w-40 h-40 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                        <Shield size={64} className="text-amber-500" />
                    </div>
                    {isPlaying && (
                        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
                    )}
                </div>

                {/* Controls */}
                <div className="w-full max-w-xs space-y-6">
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                        <span>{formatTime(progress)}</span>
                        <span>03:00</span>
                    </div>

                    <button
                        onClick={togglePlay}
                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-900/50 transition-all flex items-center justify-center gap-3"
                    >
                        {isPlaying ? <><Pause size={24} /> Pause Session</> : <><Play size={24} /> Begin Visualization</>}
                    </button>

                    <p className="text-xs text-center text-slate-500 italic">
                        "Place your hands on the bump. Imagine a warm, golden light protecting your family."
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ProtectorPlayer;
