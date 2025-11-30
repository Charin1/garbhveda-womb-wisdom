import React, { useState } from 'react';
import { Play, Pause, Sun, RotateCw } from 'lucide-react';

const MANTRAS = [
    { id: 'gayatri', title: 'Gayatri Mantra', meaning: 'Illumination of intellect', count: 108 },
    { id: 'om', title: 'Om Chanting', meaning: 'Universal vibration', count: 21 },
    { id: 'shanti', title: 'Shanti Mantra', meaning: 'Peace for all beings', count: 11 }
];

interface MantraPlayerProps {
    onBack: () => void;
}

const MantraPlayer: React.FC<MantraPlayerProps> = ({ onBack }) => {
    const [currentMantra, setCurrentMantra] = useState(MANTRAS[0]);
    const [counter, setCounter] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const handleTap = () => {
        if (counter < currentMantra.count) {
            setCounter(c => c + 1);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Soul</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-saffron-600">Mantra Naad</h2>
                <p className="text-gray-500 text-sm">Sacred sounds, sacred space</p>
            </div>

            {/* Counter Circle */}
            <div className="flex justify-center mb-8">
                <div
                    onClick={handleTap}
                    className="w-64 h-64 rounded-full border-8 border-saffron-100 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-transform shadow-lg bg-white"
                >
                    <div className="absolute inset-0 rounded-full border-8 border-saffron-500 transition-all duration-300"
                        style={{ clipPath: `inset(${100 - (counter / currentMantra.count) * 100}% 0 0 0)` }}></div>

                    <span className="text-6xl font-serif font-bold text-saffron-600 z-10">{counter}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-widest z-10">of {currentMantra.count}</span>
                    <p className="text-xs text-saffron-400 mt-2 z-10 font-medium">Tap to Count</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setCounter(0)}
                    className="p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                    <RotateCw size={20} />
                </button>
                <button
                    onClick={() => setIsActive(!isActive)}
                    className="px-6 py-3 bg-saffron-500 text-white rounded-full font-bold shadow-md hover:bg-saffron-600 flex items-center gap-2"
                >
                    {isActive ? <Pause size={20} /> : <Play size={20} />}
                    {isActive ? 'Pause Audio' : 'Play Audio'}
                </button>
            </div>

            {/* Mantra Selection */}
            <div className="space-y-3">
                {MANTRAS.map(mantra => (
                    <div
                        key={mantra.id}
                        onClick={() => { setCurrentMantra(mantra); setCounter(0); }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${currentMantra.id === mantra.id ? 'bg-saffron-50 border-saffron-200 ring-1 ring-saffron-200' : 'bg-white border-gray-100'}`}
                    >
                        <h4 className="font-bold text-gray-800">{mantra.title}</h4>
                        <p className="text-xs text-gray-500">{mantra.meaning}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MantraPlayer;
