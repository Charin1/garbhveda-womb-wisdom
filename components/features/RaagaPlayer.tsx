import React, { useState } from 'react';
import { Play, Pause, Music, Volume2, SkipForward, SkipBack } from 'lucide-react';

const RAAGAS = [
    { id: 'yaman', title: 'Raag Yaman', time: 'Evening', benefit: 'Peace & Calm', duration: '15:00' },
    { id: 'bhimpalasi', title: 'Raag Bhimpalasi', time: 'Afternoon', benefit: 'Emotional Balance', duration: '12:30' },
    { id: 'bhairavi', title: 'Raag Bhairavi', time: 'Morning', benefit: 'Devotion & Love', duration: '18:45' }
];

interface RaagaPlayerProps {
    onBack: () => void;
}

const RaagaPlayer: React.FC<RaagaPlayerProps> = ({ onBack }) => {
    const [currentRaaga, setCurrentRaaga] = useState(RAAGAS[0]);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Soul</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-amber-700">Raaga Ritu</h2>
                <p className="text-gray-500 text-sm">Ancient melodies for modern peace</p>
            </div>

            {/* Player Card */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-8 text-white shadow-xl shadow-amber-200 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 shadow-inner">
                        <Music size={64} className="text-white opacity-80" />
                    </div>

                    <h3 className="text-2xl font-serif mb-1">{currentRaaga.title}</h3>
                    <p className="text-amber-100 text-sm mb-8">{currentRaaga.time} • {currentRaaga.benefit}</p>

                    {/* Controls */}
                    <div className="flex items-center gap-8">
                        <SkipBack size={24} className="text-amber-200 cursor-pointer hover:text-white" />
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-16 h-16 bg-white text-amber-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                        <SkipForward size={24} className="text-amber-200 cursor-pointer hover:text-white" />
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-400 opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-900 opacity-20 rounded-full blur-3xl"></div>
            </div>

            {/* Playlist */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Recommended Raagas</h3>
                {RAAGAS.map(raaga => (
                    <div
                        key={raaga.id}
                        onClick={() => { setCurrentRaaga(raaga); setIsPlaying(true); }}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${currentRaaga.id === raaga.id ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:border-amber-100'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentRaaga.id === raaga.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {currentRaaga.id === raaga.id && isPlaying ? <Volume2 size={18} /> : <Play size={18} fill="currentColor" />}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold ${currentRaaga.id === raaga.id ? 'text-amber-800' : 'text-gray-800'}`}>{raaga.title}</h4>
                            <p className="text-xs text-gray-500">{raaga.time}</p>
                        </div>
                        <span className="text-xs font-mono text-gray-400">{raaga.duration}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RaagaPlayer;
