import React, { useState, useEffect } from 'react';
import { Smile, ThumbsUp, RefreshCw } from 'lucide-react';
import { generateDadJoke } from '../../services/geminiService';

interface DadJokesProps {
    onBack: () => void;
}

const DadJokes: React.FC<DadJokesProps> = ({ onBack }) => {
    const [joke, setJoke] = useState<string>('Loading a fresh dad joke...');
    const [isLoading, setIsLoading] = useState(false);
    const [sheLaughed, setSheLaughed] = useState(false);

    const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
    const [jokeBatch, setJokeBatch] = useState<string[]>([]);

    // Fetch a new batch of jokes
    const fetchJokeBatch = async () => {
        setIsLoading(true);
        setSheLaughed(false);
        const newBatch = await generateDadJoke();
        setJokeBatch(newBatch);
        setCurrentJokeIndex(0);
        if (newBatch.length > 0) {
            setJoke(newBatch[0]);
        }
        setIsLoading(false);
    };

    // Get next joke from local batch, or fetch new batch if empty
    const nextJoke = async () => {
        setSheLaughed(false);

        // If we have more jokes in the batch
        if (currentJokeIndex < jokeBatch.length - 1) {
            const nextIndex = currentJokeIndex + 1;
            setCurrentJokeIndex(nextIndex);
            setJoke(jokeBatch[nextIndex]);
        } else {
            // Need to fetch new batch
            await fetchJokeBatch();
        }
    };

    useEffect(() => {
        fetchJokeBatch();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in text-slate-100">
            {/* Header */}
            <div className="flex items-center gap-2 text-slate-400 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Dashboard</span>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-rose-400 mb-2">Dad Joke Generator</h1>
                <p className="text-slate-400 text-sm">Laughter is the best medicine (and releases endorphins!)</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 min-h-[300px] flex flex-col items-center justify-center text-center relative">

                <div className="mb-8">
                    <p className="text-2xl font-medium text-white leading-relaxed">
                        "{joke}"
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    {!sheLaughed ? (
                        <button
                            onClick={() => setSheLaughed(true)}
                            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Smile size={24} /> She Laughed!
                        </button>
                    ) : (
                        <div className="w-full py-4 bg-emerald-600/20 text-emerald-400 rounded-xl font-bold text-lg border border-emerald-500/50 flex items-center justify-center gap-2 animate-bounce">
                            <ThumbsUp size={24} /> Mission Accomplished!
                        </div>
                    )}

                    <button
                        onClick={nextJoke}
                        disabled={isLoading}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        {isLoading ? "Fetching..." : "Next Joke"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DadJokes;
