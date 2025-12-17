import React, { useState } from 'react';
import { Sparkles, Search, RefreshCw, Heart } from 'lucide-react';
import { generateVedicNames } from '../../services/geminiService';

interface VedicNameFinderProps {
    onBack: () => void;
    theme?: 'MOM' | 'DAD';
}

const VedicNameFinder: React.FC<VedicNameFinderProps> = ({ onBack, theme = 'MOM' }) => {
    const isDad = theme === 'DAD';
    const accentColor = isDad ? 'text-sky-500' : 'text-rose-500';
    const bgColor = isDad ? 'bg-slate-800 border-slate-700' : 'bg-white border-rose-100';
    const inputBg = isDad ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800';

    const [gender, setGender] = useState('Boy');
    const [startingLetter, setStartingLetter] = useState('');
    const [preference, setPreference] = useState('');
    const [names, setNames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        const results = await generateVedicNames(gender, startingLetter, preference);
        setNames(results);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className={`flex items-center gap-2 cursor-pointer mb-2 ${isDad ? 'text-slate-400' : 'text-gray-500'}`} onClick={onBack}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDad ? 'bg-slate-800' : 'bg-gray-100'}`}>←</div>
                <span className="font-semibold text-sm">Back</span>
            </div>

            <div className="text-center mb-6">
                <h2 className={`text-2xl font-serif font-bold ${isDad ? 'text-white' : 'text-gray-800'}`}>Name Finder</h2>
                <p className={`text-sm ${isDad ? 'text-slate-400' : 'text-gray-500'}`}>Discover beautiful names with meaning</p>
            </div>

            {/* Controls */}
            <div className={`p-6 rounded-3xl border shadow-sm ${bgColor}`}>
                <div className="space-y-4">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDad ? 'text-slate-400' : 'text-gray-500'}`}>Baby's Identity</label>
                        <div className="flex gap-3">
                            {['Boy', 'Girl', 'Unisex'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGender(g)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${gender === g
                                        ? (isDad ? 'bg-sky-600 border-sky-500 text-white' : 'bg-rose-500 border-rose-400 text-white')
                                        : (isDad ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-gray-200 text-gray-400')
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDad ? 'text-slate-400' : 'text-gray-500'}`}>Starting Letter</label>
                            <input
                                value={startingLetter}
                                onChange={(e) => setStartingLetter(e.target.value.slice(0, 1).toUpperCase())}
                                placeholder="A"
                                className={`w-full p-3 rounded-xl border outline-none text-center font-bold ${inputBg} focus:ring-2 ${isDad ? 'focus:ring-sky-500' : 'focus:ring-rose-300'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDad ? 'text-slate-400' : 'text-gray-500'}`}>Theme</label>
                            <select
                                value={preference}
                                onChange={(e) => setPreference(e.target.value)}
                                className={`w-full p-3 rounded-xl border outline-none ${inputBg} focus:ring-2 ${isDad ? 'focus:ring-sky-500' : 'focus:ring-rose-300'}`}
                            >
                                <option value="">Any</option>
                                <option value="Modern">Modern</option>
                                <option value="Traditional">Traditional</option>
                                <option value="Nature">Nature</option>
                                <option value="Spiritual">Spiritual</option>
                                <option value="Royal">Royal</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isDad
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:shadow-sky-900/50'
                            : 'bg-gradient-to-r from-rose-400 to-rose-600 hover:shadow-rose-200'
                            }`}
                    >
                        {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isLoading ? 'Consulting the Stars...' : 'Find Names'}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {names.map((n, i) => (
                    <div key={i} className={`p-5 rounded-2xl border transition-all ${isDad ? 'bg-slate-800 border-slate-700' : 'bg-white border-rose-50 hover:border-rose-200 shadow-sm'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className={`text-xl font-serif font-bold ${isDad ? 'text-sky-300' : 'text-gray-800'}`}>{n.name}</h3>
                                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${isDad ? 'text-slate-500' : 'text-rose-400'}`}>{n.origin} • {n.meaning}</p>
                            </div>
                            <button className={`p-2 rounded-full ${isDad ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-rose-50 text-rose-300'}`}>
                                <Heart size={18} />
                            </button>
                        </div>
                        <p className={`mt-3 text-sm leading-relaxed ${isDad ? 'text-slate-300' : 'text-gray-600'}`}>
                            {n.significance}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VedicNameFinder;
