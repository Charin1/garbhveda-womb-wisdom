import React from 'react';
import { Mood } from '../types';

interface MoodTrackerProps {
  currentMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

const moods = [
  { id: Mood.HAPPY, emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-200' },
  { id: Mood.CALM, emoji: '😌', label: 'Calm', color: 'bg-green-100 border-green-200' },
  { id: Mood.TIRED, emoji: '😴', label: 'Tired', color: 'bg-blue-100 border-blue-200' },
  { id: Mood.ANXIOUS, emoji: '😰', label: 'Anxious', color: 'bg-purple-100 border-purple-200' },
  { id: Mood.ENERGETIC, emoji: '🤩', label: 'Active', color: 'bg-orange-100 border-orange-200' },
];

const MoodTracker: React.FC<MoodTrackerProps> = ({ currentMood, onMoodSelect }) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">How are you feeling, Mama?</h3>
      <div className="flex justify-between">
        {moods.map((m) => {
          const isSelected = currentMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onMoodSelect(m.id)}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-2xl text-xl border ${
                  isSelected ? m.color + ' shadow-md' : 'bg-gray-50 border-transparent'
                }`}
              >
                {m.emoji}
              </div>
              <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodTracker;