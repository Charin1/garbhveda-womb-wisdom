import React, { useState, useRef } from 'react';
import { Activity, Play, RefreshCw, CheckCircle } from 'lucide-react';

interface KickGameProps {
    onBack: () => void;
}

const KickGame: React.FC<KickGameProps> = ({ onBack }) => {
    const [gameState, setGameState] = useState<'IDLE' | 'WAITING_FOR_KICK' | 'DAD_TURN' | 'SUCCESS'>('IDLE');
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const kickTimeRef = useRef<number | null>(null);

    const startGame = () => {
        setGameState('WAITING_FOR_KICK');
        setReactionTime(null);
    };

    const handleBabyKick = () => {
        kickTimeRef.current = Date.now();
        setGameState('DAD_TURN');
    };

    const handleDadTap = () => {
        if (kickTimeRef.current) {
            const time = Date.now() - kickTimeRef.current;
            setReactionTime(time);
            setGameState('SUCCESS');
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
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Kick-Response Game</h1>
                <p className="text-slate-400 text-sm">Teach baby cause & effect through rhythm.</p>
            </div>

            {/* Game Area */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">

                {gameState === 'IDLE' && (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-sky-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Activity size={48} className="text-sky-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Play?</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">Wait for the baby to kick, then tap the button immediately to respond.</p>
                        </div>
                        <button onClick={startGame} className="px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-sky-900/50 transition-all">
                            Start Game
                        </button>
                    </div>
                )}

                {gameState === 'WAITING_FOR_KICK' && (
                    <div className="text-center space-y-8 w-full">
                        <div className="animate-bounce">
                            <p className="text-2xl font-serif text-sky-300">Waiting for a kick...</p>
                        </div>
                        <button
                            onClick={handleBabyKick}
                            className="w-full py-12 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-3xl text-slate-400 hover:bg-slate-700 hover:border-sky-500 hover:text-sky-400 transition-all"
                        >
                            Tap here when Baby Kicks!
                        </button>
                    </div>
                )}

                {gameState === 'DAD_TURN' && (
                    <div className="text-center space-y-6 w-full animate-in zoom-in duration-300">
                        <h3 className="text-3xl font-bold text-amber-400">TAP NOW!</h3>
                        <p className="text-slate-400">Respond to the baby!</p>
                        <button
                            onClick={handleDadTap}
                            className="w-40 h-40 bg-amber-500 rounded-full mx-auto shadow-[0_0_50px_rgba(245,158,11,0.5)] active:scale-95 transition-transform flex items-center justify-center"
                        >
                            <div className="w-32 h-32 border-4 border-white/30 rounded-full"></div>
                        </button>
                    </div>
                )}

                {gameState === 'SUCCESS' && (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Great Connection!</h3>
                            <p className="text-slate-300">Response time: <span className="text-emerald-400 font-mono font-bold">{reactionTime}ms</span></p>
                        </div>
                        <button onClick={startGame} className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors">
                            <RefreshCw size={18} /> Play Again
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default KickGame;
