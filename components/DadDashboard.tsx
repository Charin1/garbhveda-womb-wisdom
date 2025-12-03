import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import Layout from './Layout';
import ResetButton from './ResetButton';
import { Shield, Activity, Heart, Mic, Smile, Wind, Clock, Users } from 'lucide-react';
import KickGame from './DadFeatures/KickGame';
import SevaTracker from './DadFeatures/SevaTracker';
import PitraVani from './DadFeatures/PitraVani';
import DadJokes from './DadFeatures/DadJokes';
import BreathingExercise from './DadFeatures/BreathingExercise';
import ProtectorPlayer from './DadFeatures/ProtectorPlayer';

interface DadDashboardProps {
    user: UserProfile;
    onUpdateUser: (user: UserProfile) => void;
    onSwitchRole: () => void;
    onReset: () => void;
}

const DadDashboard: React.FC<DadDashboardProps> = ({ user, onUpdateUser, onSwitchRole, onReset }) => {
    const [activeFeature, setActiveFeature] = useState<string | null>(null);

    const renderFeature = () => {
        switch (activeFeature) {
            case 'KICK_GAME':
                return <KickGame onBack={() => setActiveFeature(null)} />;
            case 'SEVA':
                return <SevaTracker user={user} onUpdateUser={onUpdateUser} onBack={() => setActiveFeature(null)} />;
            case 'PITRA_VANI':
                return <PitraVani user={user} onUpdateUser={onUpdateUser} onBack={() => setActiveFeature(null)} />;
            case 'JOKES':
                return <DadJokes onBack={() => setActiveFeature(null)} />;
            case 'BREATHING':
                return <BreathingExercise onBack={() => setActiveFeature(null)} />;
            case 'PROTECTOR':
                return <ProtectorPlayer onBack={() => setActiveFeature(null)} />;
            default:
                return null;
        }
    };

    if (activeFeature) {
        return (
            <Layout theme="DAD">
                {renderFeature()}
            </Layout>
        );
    }

    return (
        <Layout
            theme="DAD"
            headerContent={
                <div className="flex justify-between items-center text-slate-100">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-serif font-bold">Captain {user.name}</h1>
                            <span className="px-2 py-0.5 bg-sky-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                Dad Mode
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Week {user.pregnancyWeek} • {user.kickCount} kicks tracked
                            {user.partnerName && ` • With: ${user.partnerName}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSwitchRole}
                            className="px-3 py-1 bg-slate-800 rounded-full text-xs border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1"
                        >
                            <Users size={12} /> Switch Role
                        </button>
                        <ResetButton onReset={onReset} variant="icon" className="bg-slate-800 border border-slate-700 hover:bg-red-900" />
                        <div
                            className="w-10 h-10 rounded-full bg-slate-800 text-slate-100 border border-slate-700 flex items-center justify-center font-bold cursor-pointer hover:bg-slate-700 transition-colors"
                            title="Profile"
                        >
                            {user.name[0]}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-6 animate-fade-in">

                {/* Hero Status */}
                <div className="bg-gradient-to-br from-sky-900 to-slate-900 rounded-3xl p-6 border border-sky-800/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">Mission Status</p>
                                <h2 className="text-2xl font-serif text-white">Guardian of the Womb</h2>
                            </div>
                            <Shield className="text-sky-500" size={24} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400">Seva Points</p>
                                <p className="text-xl font-bold text-white">{user.sevaPoints || 0} XP</p>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400">Baby's Kicks</p>
                                <p className="text-xl font-bold text-white">{user.kickCount}</p>
                            </div>
                        </div>
                    </div>
                    {/* Background Decor */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl"></div>
                </div>

                {/* Action Grid */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">Daily Duties</h3>
                    <div className="grid grid-cols-2 gap-3">

                        <button onClick={() => setActiveFeature('PITRA_VANI')} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-sky-700 transition-all text-left group">
                            <div className="w-10 h-10 rounded-full bg-amber-900/30 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Mic size={20} />
                            </div>
                            <h4 className="font-bold text-slate-200">Pitra Vani</h4>
                            <p className="text-xs text-slate-500 mt-1">Voice of Strength</p>
                        </button>

                        <button onClick={() => setActiveFeature('KICK_GAME')} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-sky-700 transition-all text-left group">
                            <div className="w-10 h-10 rounded-full bg-sky-900/30 text-sky-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Activity size={20} />
                            </div>
                            <h4 className="font-bold text-slate-200">Kick Game</h4>
                            <p className="text-xs text-slate-500 mt-1">Logic & Response</p>
                        </button>

                        <button onClick={() => setActiveFeature('SEVA')} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-sky-700 transition-all text-left group">
                            <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Heart size={20} />
                            </div>
                            <h4 className="font-bold text-slate-200">Garbh Seva</h4>
                            <p className="text-xs text-slate-500 mt-1">Service Tracker</p>
                        </button>

                        <button onClick={() => setActiveFeature('JOKES')} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-sky-700 transition-all text-left group">
                            <div className="w-10 h-10 rounded-full bg-rose-900/30 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Smile size={20} />
                            </div>
                            <h4 className="font-bold text-slate-200">Dad Jokes</h4>
                            <p className="text-xs text-slate-500 mt-1">Laughter Therapy</p>
                        </button>

                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center">
                            <Wind size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-200">Bio-Rhythm Sync</h4>
                            <p className="text-xs text-slate-500">Breathe with Mom</p>
                        </div>
                        <button onClick={() => setActiveFeature('BREATHING')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500">Start</button>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-200">Protector Visualization</h4>
                            <p className="text-xs text-slate-500">3 min guided audio</p>
                        </div>
                        <button onClick={() => setActiveFeature('PROTECTOR')} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-500">Play</button>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default DadDashboard;
