import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Volume2, SkipForward, SkipBack, RefreshCw, ExternalLink } from 'lucide-react';
import { generateRaagaRecommendations, getInitialRaagas } from '../../services/geminiService';
import { Raaga } from '../../types';

// Fallback in case API fails
const FALLBACK_RAAGAS = [
    { id: 'yaman', title: 'Raag Yaman', time: 'Evening', benefit: 'Peace & Calm', duration: '15:00', url: 'https://www.youtube.com/watch?v=tUOIqJO_tys' },
    { id: 'bhimpalasi', title: 'Raag Bhimpalasi', time: 'Afternoon', benefit: 'Emotional Balance', duration: '12:30', url: 'https://www.youtube.com/watch?v=twKilA-kozY' },
    { id: 'bhairavi', title: 'Raag Bhairavi', time: 'Morning', benefit: 'Devotion & Love', duration: '18:45', url: 'https://www.youtube.com/watch?v=tLXNNejKhJs' }
];

interface RaagaPlayerProps {
    onBack: () => void;
    initialPlayId?: string | null;
}

// Check if URL is a direct video link or a search URL
const isDirectVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('watch?v=') || url.includes('youtu.be/');
};

const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    // Only create embed URL for direct video links
    if (!isDirectVideoUrl(url)) return '';

    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1`;
};

const RaagaPlayer: React.FC<RaagaPlayerProps> = ({ onBack, initialPlayId }) => {
    const [raagas, setRaagas] = useState<Raaga[]>(FALLBACK_RAAGAS);
    const [currentRaaga, setCurrentRaaga] = useState(raagas[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchDefaults = async () => {
            const defaults = await getInitialRaagas();
            if (defaults && defaults.length > 0) {
                setRaagas(defaults);
                if (initialPlayId) {
                    const target = defaults.find(r => r.id === initialPlayId);
                    if (target) {
                        setCurrentRaaga(target);
                        setIsPlaying(true);
                    } else {
                        setCurrentRaaga(defaults[0]);
                    }
                } else {
                    setCurrentRaaga(defaults[0]);
                }
            }
            setInitialLoading(false);
        };
        fetchDefaults();
    }, [initialPlayId]);

    const handleRefresh = async () => {
        setLoading(true);
        const newRaagas = await generateRaagaRecommendations();
        console.log("Generated Raagas:", newRaagas);
        if (newRaagas && newRaagas.length > 0) {
            setRaagas(newRaagas);
            setCurrentRaaga(newRaagas[0]);
            setIsPlaying(false);
        }
        setLoading(false);
    };

    const handlePlayClick = () => {
        if (currentRaaga.url) {
            if (isDirectVideoUrl(currentRaaga.url)) {
                // Direct video - toggle embed playback
                setIsPlaying(!isPlaying);
            } else {
                // Search URL - open in new tab
                window.open(currentRaaga.url, '_blank', 'noopener,noreferrer');
            }
        }
    };

    const isSearchUrl = !isDirectVideoUrl(currentRaaga.url);

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

                    {isPlaying && isDirectVideoUrl(currentRaaga.url) ? (
                        <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden shadow-inner bg-black/20 backdrop-blur-sm border border-white/20">
                            <iframe
                                key={currentRaaga.id}
                                width="100%"
                                height="100%"
                                src={getEmbedUrl(currentRaaga.url)}
                                title={currentRaaga.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    ) : (
                        <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 shadow-inner">
                            <Music size={64} className="text-white opacity-80" />
                        </div>
                    )}

                    <h3 className="text-2xl font-serif mb-1">{currentRaaga.title}</h3>
                    <p className="text-amber-100 text-sm mb-8">{currentRaaga.time} • {currentRaaga.benefit}</p>

                    {/* Controls */}
                    <div className="flex items-center gap-8">
                        <SkipBack size={24} className="text-amber-200 cursor-pointer hover:text-white" />
                        <button
                            onClick={handlePlayClick}
                            className="w-16 h-16 bg-white text-amber-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                            {isSearchUrl ? (
                                <ExternalLink size={28} />
                            ) : isPlaying ? (
                                <Pause size={32} fill="currentColor" />
                            ) : (
                                <Play size={32} fill="currentColor" className="ml-1" />
                            )}
                        </button>
                        <SkipForward size={24} className="text-amber-200 cursor-pointer hover:text-white" />
                    </div>
                    {isSearchUrl && (
                        <p className="text-xs text-amber-100 mt-4 opacity-80">Click to find {currentRaaga.title} on YouTube</p>
                    )}
                </div>
                {/* Background Decor */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-400 opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-900 opacity-20 rounded-full blur-3xl"></div>

                {/* Loading Override */}
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Finding the perfect Raaga...</p>
                    </div>
                )}
            </div>

            {/* Playlist */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recommended Raagas</h3>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}
                        title="Refresh Recommendations"
                    >
                        <RefreshCw size={16} className="text-gray-500" />
                    </button>
                </div>
                {raagas.map(raaga => (
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
