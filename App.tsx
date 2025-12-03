import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Button from './components/Button';
import BottomNav from './components/BottomNav';
import MoodTracker from './components/MoodTracker';
import DreamJournal from './components/DreamJournal';
import DadDashboard from './components/DadDashboard';
import ResetButton from './components/ResetButton';
import {
    Activity, ActivityCategory, UserProfile, AppTab, Mood, DailyCurriculum, Dream, UserRole
} from './types';
import { generateDailyCurriculum, generateAudio, generateImage } from './services/geminiService';
import { storage } from './services/storageService';
import { FALLBACK_CURRICULUM } from './data/curriculum';
import { AUDIO_TRACKS } from './data/audioTracks';
import { useAudio } from './hooks/useAudio';
import {
    Play, Pause, Volume2, RefreshCw, Sun, Moon,
    Wind, Music, Brain, Heart, Sparkles, Footprints,
    ChevronRight, ExternalLink, Lightbulb, Eye, CheckCircle, Info, Users
} from 'lucide-react';
import HomeTab from './components/tabs/HomeTab';
import LearnTab from './components/tabs/LearnTab';
import ConnectTab from './components/tabs/ConnectTab';
import SoulTab from './components/tabs/SoulTab';

const App: React.FC = () => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState<AppTab>(storage.getActiveTab());
    const [user, setUser] = useState<UserProfile | null>(null);

    // Data State
    const [curriculum, setCurriculum] = useState<DailyCurriculum | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    // Feature Specific State
    const [currentMood, setCurrentMood] = useState<Mood | null>(null);
    const [tempMotherName, setTempMotherName] = useState('');
    const [tempFatherName, setTempFatherName] = useState('');
    const [tempRole, setTempRole] = useState<UserRole>(UserRole.MOM);
    const [tempWeek, setTempWeek] = useState(12);

    // Audio & Visual State
    const { play, stop, isPlaying, volume, setVolume } = useAudio();
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [showPuzzleSolution, setShowPuzzleSolution] = useState(false);

    // --- Initialization ---
    useEffect(() => {
        // Load user from storage service (handles migration automatically)
        const savedUser = storage.getUser();
        if (savedUser) {
            console.log('[App] User loaded from storage:', savedUser.name);
            setUser(savedUser);
        }

        // Load volume setting
        const savedVolume = storage.getVolume();
        setVolume(savedVolume);
    }, []);

    useEffect(() => {
        if (user && !curriculum && user.role === UserRole.MOM) {
            loadCurriculum();
        }
    }, [user]);

    // ... imports

    const loadCurriculum = async () => {
        if (!user) return;
        setIsLoading(true);

        // Try to generate fresh content
        const data = await generateDailyCurriculum(user.pregnancyWeek);

        // Use generated data if valid, otherwise fallback to hardcoded verified data
        if (data) {
            console.log("[App] Curriculum loaded from AI generation");
            setCurriculum(data);
        } else {
            console.log("[App] Using fallback curriculum due to generation failure");
            setCurriculum(FALLBACK_CURRICULUM);
        }

        setIsLoading(false);
    };

    const handleRefreshCurriculum = async () => {
        console.log('[App] Refreshing curriculum...');
        await loadCurriculum();
    };

    const handleOnboarding = () => {
        const newUser: UserProfile = {
            name: tempRole === UserRole.MOM
                ? (tempMotherName || 'Mother')
                : (tempFatherName || 'Father'),
            partnerName: tempRole === UserRole.MOM
                ? (tempFatherName || undefined)
                : (tempMotherName || undefined),
            role: tempRole,
            pregnancyWeek: tempWeek,
            kickCount: 0,
            lastKickDate: new Date().toISOString(),
            moodHistory: [],
            dreamJournal: [],
            // New Feature Persistence
            chatHistory: [],
            scrapbook: [],
            yogaProgress: [],
            dietFavorites: [],
            // Dad Specific
            sevaPoints: 0,
            sevaHistory: [],
            promises: [],
            pitraVaniHistory: []
        };
        console.log("[App] Creating new user profile:", newUser);
        storage.setUser(newUser);
        setUser(newUser);
    };

    const updateUser = (updatedUser: UserProfile) => {
        setUser(updatedUser);
        storage.setUser(updatedUser);
    };

    const handleReset = () => {
        console.log('[App] Resetting all data');
        storage.resetAll();
        setUser(null);
        setActiveTab(AppTab.HOME);
        setCurriculum(null);
        setGeneratedImageUrl(null);
        setCurrentMood(null);
    };

    const handleTabChange = (tab: AppTab) => {
        setActiveTab(tab);
        storage.setActiveTab(tab);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        storage.setVolume(newVolume);
    };

    const handleKick = () => {
        if (!user) return;
        const now = new Date();
        // Reset count if new day
        const lastDate = new Date(user.lastKickDate);
        let newCount = user.kickCount;

        if (now.getDate() !== lastDate.getDate()) {
            newCount = 1;
        } else {
            newCount += 1;
        }

        const updatedUser = { ...user, kickCount: newCount, lastKickDate: now.toISOString() };
        updateUser(updatedUser);
    };

    const handleMoodSelect = (mood: Mood) => {
        setCurrentMood(mood);
        if (user) {
            const updatedUser = {
                ...user,
                moodHistory: [...user.moodHistory, { date: new Date().toISOString(), mood }]
            };
            updateUser(updatedUser);
        }
    };

    const handleSaveDream = (dream: Dream) => {
        if (!user) return;
        const updatedDreams = [...user.dreamJournal, dream];
        const updatedUser = { ...user, dreamJournal: updatedDreams };
        updateUser(updatedUser);
    };

    const switchRole = () => {
        if (!user) return;
        const newRole = user.role === UserRole.MOM ? UserRole.DAD : UserRole.MOM;
        console.log(`[App] Switching role from ${user.role} to ${newRole}`);

        // Swap names when switching roles
        const updatedUser = {
            ...user,
            role: newRole,
            name: user.partnerName || user.name, // Use partner name as new user name
            partnerName: user.name // Current name becomes partner name
        };

        updateUser(updatedUser);
    };

    const playTrack = async (id: string, text: string) => {
        if (currentTrackId === id && isPlaying) {
            stop();
            setCurrentTrackId(null);
            return;
        }
        setCurrentTrackId(id);
        const buffer = await generateAudio(text);
        if (buffer) play(buffer);
    };

    const handleGenerateImage = async (prompt: string) => {
        setIsGeneratingImage(true);
        const url = await generateImage(prompt);
        setGeneratedImageUrl(url);
        setIsGeneratingImage(false);
    }

    // --- Main App Shell ---

    if (!user) {
        return (
            <Layout>
                <div className="h-full flex flex-col justify-center px-4">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-serif text-sage-600 mb-2">GarbhVeda</h1>
                        <p className="text-gray-400 tracking-widest text-sm uppercase">Womb Wisdom</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-sage-50 border border-white">
                        <label className="block text-sm font-medium text-gray-700 mb-2">I am the...</label>
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setTempRole(UserRole.MOM)}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${tempRole === UserRole.MOM ? 'bg-rose-quartz-100 border-rose-quartz-300 text-rose-quartz-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                            >
                                Mother
                            </button>
                            <button
                                onClick={() => setTempRole(UserRole.DAD)}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${tempRole === UserRole.DAD ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                            >
                                Father
                            </button>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                        <input
                            className="w-full p-4 mb-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-rose-quartz-200 outline-none"
                            value={tempMotherName}
                            onChange={e => setTempMotherName(e.target.value)}
                            placeholder="e.g. Aditi"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                        <input
                            className="w-full p-4 mb-6 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sky-200 outline-none"
                            value={tempFatherName}
                            onChange={e => setTempFatherName(e.target.value)}
                            placeholder="e.g. Rohan"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-2">Pregnancy Week: {tempWeek}</label>
                        <input
                            type="range" min="4" max="42"
                            className="w-full accent-sage-500 mb-8"
                            value={tempWeek}
                            onChange={e => setTempWeek(parseInt(e.target.value))}
                        />
                        <Button className="w-full py-4 text-lg" onClick={handleOnboarding}>Begin Journey</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    // --- Dad Mode ---
    if (user.role === UserRole.DAD) {
        return (
            <DadDashboard
                user={user}
                onUpdateUser={updateUser}
                onSwitchRole={switchRole}
                onReset={handleReset}
            />
        );
    }

    // --- Detail Modal Overlay (For Full Activity View) ---
    if (selectedActivity) {
        return (
            <Layout
                headerContent={
                    <div className="flex items-center gap-2 text-sage-600 cursor-pointer" onClick={() => setSelectedActivity(null)}>
                        <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                        <span className="font-semibold text-sm">Back</span>
                    </div>
                }
            >
                <div className="space-y-6">
                    <span className="px-3 py-1 bg-sage-50 text-sage-600 text-xs font-bold rounded-full uppercase tracking-wider inline-block">
                        {selectedActivity.category}
                    </span>
                    <h1 className="text-3xl font-serif text-gray-800 leading-tight">{selectedActivity.title}</h1>

                    <div className="prose prose-sage text-gray-600">
                        <p>{selectedActivity.content}</p>
                    </div>

                    {/* Resources List */}
                    {selectedActivity.resources?.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                                <ExternalLink size={18} /> Curated Resources
                            </h3>
                            <div className="grid gap-3">
                                {selectedActivity.resources.map((r, i) => (
                                    <a key={i} href={r.url} target="_blank" className="block p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-gray-100">
                                        <h4 className="font-medium text-sky-600 text-sm mb-1">{r.title}</h4>
                                        <p className="text-xs text-gray-500">{r.description}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-20"></div> {/* Bottom spacer */}
                </div>
            </Layout>
        );
    }

    // --- Main Tabbed View (Mom Mode) ---
    return (
        <>
            <Layout
                headerContent={
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-serif text-gray-800">Namaste, {user.name}</h1>
                                <span className="px-2 py-0.5 bg-rose-quartz-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                    Mom Mode
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">
                                Week {user.pregnancyWeek} • {user.kickCount} kicks today
                                {user.partnerName && ` • With: ${user.partnerName}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={switchRole}
                                className="px-3 py-1 bg-slate-100 rounded-full text-xs border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
                            >
                                <Users size={12} /> Switch Role
                            </button>
                            <ResetButton onReset={handleReset} variant="icon" />
                            <div
                                className="w-10 h-10 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center font-bold cursor-pointer hover:bg-sage-200 transition-colors"
                                title="Profile"
                            >
                                {user.name[0]}
                            </div>
                        </div>
                    </div>
                }
            >
                {activeTab === AppTab.HOME && (
                    <HomeTab
                        curriculum={curriculum}
                        isLoading={isLoading}
                        currentMood={currentMood}
                        onMoodSelect={handleMoodSelect}
                        onActivitySelect={setSelectedActivity}
                        onRefresh={handleRefreshCurriculum}
                        week={user.pregnancyWeek}
                    />
                )}
                {activeTab === AppTab.LEARN && (
                    <LearnTab
                        curriculum={curriculum}
                        onActivitySelect={setSelectedActivity}
                        generatedImageUrl={generatedImageUrl}
                        isGeneratingImage={isGeneratingImage}
                        onGenerateImage={handleGenerateImage}
                        onRefresh={handleRefreshCurriculum}
                    />
                )}
                {activeTab === AppTab.CONNECT && (
                    <ConnectTab
                        curriculum={curriculum}
                        user={user}
                        onKick={handleKick}
                    />
                )}
                {activeTab === AppTab.SOUL && (
                    <SoulTab
                        curriculum={curriculum}
                        dreams={user.dreamJournal}
                        onSaveDream={handleSaveDream}
                        currentTrackId={currentTrackId}
                        isPlaying={isPlaying}
                        onPlayTrack={playTrack}
                    />
                )}
            </Layout>

            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
    );
};

export default App;