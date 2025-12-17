import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RefreshCw } from 'lucide-react';

interface BreathingExerciseProps {
    onBack: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE' | 'HOLD_EMPTY'>('INHALE');
    const [timer, setTimer] = useState(4);
    const [cycleCount, setCycleCount] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        // Switch phase
                        switch (phase) {
                            case 'INHALE':
                                setPhase('HOLD');
                                return 4;
                            case 'HOLD':
                                setPhase('EXHALE');
                                return 4;
                            case 'EXHALE':
                                setPhase('HOLD_EMPTY');
                                return 4;
                            case 'HOLD_EMPTY':
                                setPhase('INHALE');
                                setCycleCount(c => c + 1);
                                return 4;
                            default:
                                return 4;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, phase]);

    const toggleSession = () => setIsActive(!isActive);

    const getInstruction = () => {
        switch (phase) {
            case 'INHALE': return "Breathe In...";
            case 'HOLD': return "Hold...";
            case 'EXHALE': return "Breathe Out...";
            case 'HOLD_EMPTY': return "Hold...";
        }
    };

    const getScale = () => {
        switch (phase) {
            case 'INHALE': return 'scale-150';
            case 'HOLD': return 'scale-150';
            case 'EXHALE': return 'scale-100';
            case 'HOLD_EMPTY': return 'scale-100';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-100">
            {/* Header */}
            <div className="flex items-center gap-2 text-slate-400 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Dashboard</span>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-indigo-400 mb-2">Bio-Rhythm Sync</h1>
                <p className="text-slate-400 text-sm">Hold Mom's hand. Breathe together.</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">

                <div className={`w-48 h-48 rounded-full bg-indigo-500/20 border-4 border-indigo-400 flex items-center justify-center transition-all duration-[4000ms] ease-linear ${isActive ? getScale() : ''}`}>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white mb-1">{isActive ? timer : <Wind size={32} className="mx-auto" />}</p>
                        <p className="text-xs text-indigo-200 uppercase tracking-widest">{isActive ? phase : "Ready"}</p>
                    </div>
                </div>

                <div className="mt-12 text-center space-y-6">
                    <h3 className="text-2xl font-serif text-white h-8">{isActive ? getInstruction() : "Sync your breath with hers."}</h3>

                    <button
                        onClick={toggleSession}
                        className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2 mx-auto ${isActive
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/50'
                            }`}
                    >
                        {isActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start Sync</>}
                    </button>

                    {cycleCount > 0 && <p className="text-xs text-slate-500">Cycles completed: {cycleCount}</p>}
                </div>

            </div>
        </div>
    );
};

export default BreathingExercise;
