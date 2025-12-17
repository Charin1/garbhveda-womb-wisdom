import React from 'react';
import { UserProfile } from '../../types';
import { Heart, Check, Coffee, Footprints, Clock, PhoneOff } from 'lucide-react';

interface SevaTrackerProps {
    user: UserProfile;
    onUpdateUser: (user: UserProfile) => void;
    onBack: () => void;
}

const SEVA_TASKS = [
    { id: 'foot_massage', title: '10-min Foot Massage', points: 50, icon: <Footprints size={20} /> },
    { id: 'made_tea', title: 'Made Herbal Tea', points: 30, icon: <Coffee size={20} /> },
    { id: 'screen_free', title: 'Screen-free Hour', points: 60, icon: <PhoneOff size={20} /> },
    { id: 'listened', title: 'Active Listening (15m)', points: 40, icon: <Heart size={20} /> },
    { id: 'chores', title: 'Handled Chores', points: 40, icon: <Clock size={20} /> },
];

const SevaTracker: React.FC<SevaTrackerProps> = ({ user, onUpdateUser, onBack }) => {

    const handleToggleTask = (taskId: string, points: number) => {
        const today = new Date().toISOString().split('T')[0];
        const historyId = `${today}-${taskId}`;

        const isCompleted = user.sevaHistory?.includes(historyId);

        let newHistory = user.sevaHistory || [];
        let newPoints = user.sevaPoints || 0;

        if (isCompleted) {
            newHistory = newHistory.filter(id => id !== historyId);
            newPoints -= points;
        } else {
            newHistory = [...newHistory, historyId];
            newPoints += points;
        }

        onUpdateUser({
            ...user,
            sevaHistory: newHistory,
            sevaPoints: newPoints
        });
    };

    const isTaskCompletedToday = (taskId: string) => {
        const today = new Date().toISOString().split('T')[0];
        return user.sevaHistory?.includes(`${today}-${taskId}`);
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-100">
            {/* Header */}
            <div className="flex items-center gap-2 text-slate-400 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Dashboard</span>
            </div>

            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-3xl border border-emerald-800/50 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-serif font-bold text-white mb-1">Garbh Seva</h1>
                    <p className="text-emerald-200 text-sm mb-6">Service to the mother is service to the child.</p>

                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold text-white">{user.sevaPoints || 0}</span>
                        <span className="text-sm text-emerald-400 font-bold uppercase mb-2">Karma Points</span>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Heart size={150} />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">Today's Opportunities</h3>
                <div className="space-y-3">
                    {SEVA_TASKS.map(task => {
                        const completed = isTaskCompletedToday(task.id);
                        return (
                            <div
                                key={task.id}
                                onClick={() => handleToggleTask(task.id, task.points)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${completed
                                    ? 'bg-emerald-900/20 border-emerald-800'
                                    : 'bg-slate-800 border-slate-700 hover:border-emerald-700'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                                        }`}>
                                        {completed ? <Check size={20} /> : task.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${completed ? 'text-emerald-400' : 'text-slate-200'}`}>{task.title}</h4>
                                        <p className="text-xs text-slate-500">+{task.points} XP</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SevaTracker;
