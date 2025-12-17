import React, { useState, useEffect } from 'react';
import { Play, Pause, Sun, RotateCw, ExternalLink, Volume2, RotateCcw, RefreshCw } from 'lucide-react';
import { getInitialMantras } from '../../services/geminiService';
import { Mantra } from '../../types';

const FALLBACK_MANTRAS = [
    { id: 'gayatri', title: 'Gayatri Mantra', meaning: 'Illumination of intellect', count: 108, url: 'https://www.youtube.com/watch?v=GEVvyIrQZnA' },
    { id: 'om', title: 'Om Chanting', meaning: 'Universal vibration', count: 21, url: 'https://www.youtube.com/watch?v=8sYK7lm3UKg' },
    { id: 'shanti', title: 'Shanti Mantra', meaning: 'Peace for all beings', count: 11, url: 'https://www.youtube.com/watch?v=8nkzIn42xRI' }
];

interface MantraPlayerProps {
    onBack: () => void;
    initialPlayId?: string | null;
}

// Check if URL is a direct video link or a search URL
const isDirectVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('watch?v=') || url.includes('youtu.be/');
};

const getEmbedUrl = (url?: string, isActive?: boolean) => {
    if (!url) return '';
    if (!isDirectVideoUrl(url)) return '';

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&controls=0&loop=1&playlist=${videoId}&modestbranding=1`;
};

const MantraPlayer: React.FC<MantraPlayerProps> = ({ onBack, initialPlayId }) => {
    const [mantras, setMantras] = useState<Mantra[]>(FALLBACK_MANTRAS);
    const [currentMantra, setCurrentMantra] = useState(mantras[0]);
    const [counter, setCounter] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchDefaults = async () => {
            const defaults = await getInitialMantras();
            if (defaults && defaults.length > 0) {
                setMantras(defaults);

                if (initialPlayId) {
                    const target = defaults.find(m => m.id === initialPlayId);
                    if (target) {
                        setCurrentMantra(target);
                        setIsActive(true);
                    } else {
                        setCurrentMantra(defaults[0]);
                    }
                } else {
                    setCurrentMantra(prev => defaults.find(m => m.id === prev.id) || defaults[0]);
                }
            }
            setInitialLoading(false);
        };
        fetchDefaults();
    }, [initialPlayId]);

    const handleTap = () => {
        if (counter < currentMantra.count) {
            setCounter(c => c + 1);
        }
    };

    const handlePlayClick = () => {
        if (currentMantra.url) {
            if (isDirectVideoUrl(currentMantra.url)) {
                // Direct video - toggle embed playback
                setIsActive(!isActive);
            } else {
                // Search URL - open in new tab
                window.open(currentMantra.url, '_blank', 'noopener,noreferrer');
            }
        }
    };

    const handleRefresh = async () => {
        setInitialLoading(true);
        // Collect current URLs to exclude from next fetch (for variety)
        // Only exclude if they are valid URLs
        const excludeUrls = mantras
            .map(m => m.url)
            .filter(url => url && (url.includes('youtube.com') || url.includes('youtu.be')));

        const defaults = await getInitialMantras(excludeUrls);
        if (defaults && defaults.length > 0) {
            setMantras(defaults);
            // Optionally reset current mantra if it's not valid anymore, or keep it
            setCurrentMantra(prev => defaults.find(m => m.id === prev.id) || defaults[0]);
        }
        setInitialLoading(false);
    };

    const isSearchUrl = !isDirectVideoUrl(currentMantra.url);

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
                {/* Hidden Player - only for direct video URLs */}
                {currentMantra.url && isDirectVideoUrl(currentMantra.url) && (
                    <div className="w-full h-32 mt-4 rounded-xl overflow-hidden shadow-md">
                        <iframe
                            key={currentMantra.id}
                            width="100%"
                            height="100%"
                            src={getEmbedUrl(currentMantra.url, isActive)}
                            title={currentMantra.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                )}
            </div>

            {/* Counter Circle */}
            <div className="flex flex-col items-center mb-8">
                <div
                    onClick={handleTap}
                    className="w-64 h-64 rounded-full border-8 border-saffron-100 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-transform shadow-lg bg-white mb-4"
                >
                    <div className="absolute inset-0 rounded-full border-8 border-saffron-500 transition-all duration-300"
                        style={{ clipPath: `inset(${100 - (counter / currentMantra.count) * 100}% 0 0 0)` }}></div>

                    <span className="text-6xl font-serif font-bold text-saffron-600 z-10">{counter}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-widest z-10">of {currentMantra.count}</span>
                    <p className="text-xs text-saffron-400 mt-2 z-10 font-medium">Tap to Count</p>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setCounter(0); }}
                    className="text-xs text-gray-400 hover:text-saffron-500 font-medium flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <RotateCcw size={12} /> Reset Count
                </button>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={handleRefresh}
                    className={`p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 ${initialLoading ? 'animate-spin' : ''}`}
                    title="Refresh Links"
                    disabled={initialLoading}
                >
                    <RefreshCw size={20} />
                </button>

                <button
                    onClick={handlePlayClick}
                    className="px-6 py-3 bg-saffron-500 text-white rounded-full font-bold shadow-md hover:bg-saffron-600 flex items-center gap-2"
                >
                    {isSearchUrl ? (
                        <>
                            <ExternalLink size={20} />
                            Find Audio
                        </>
                    ) : isActive ? (
                        <>
                            <Pause size={20} />
                            Pause Audio
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            Play Audio
                        </>
                    )}
                </button>
            </div>

            {/* Mantra Selection */}
            <div className="space-y-3">
                {mantras.map(mantra => (
                    <div
                        key={mantra.id}
                        onClick={() => { setCurrentMantra(mantra); setCounter(0); setIsActive(true); }}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${currentMantra.id === mantra.id ? 'bg-saffron-50 border-saffron-200 ring-1 ring-saffron-200' : 'bg-white border-gray-100'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentMantra.id === mantra.id ? 'bg-saffron-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {currentMantra.id === mantra.id && isActive ? <Volume2 size={18} /> : <Play size={18} fill="currentColor" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{mantra.title}</h4>
                            <p className="text-xs text-gray-500">{mantra.meaning}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MantraPlayer;
