import React from 'react';
import { Activity, ActivityCategory } from '../types';
import { Play, BookOpen, Music, Calculator, Palette, CheckCircle, Circle } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onClick: (activity: Activity) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  
  const getIcon = (cat: ActivityCategory) => {
    switch(cat) {
      case ActivityCategory.MATH: return <Calculator size={18} />;
      case ActivityCategory.ART: return <Palette size={18} />;
      case ActivityCategory.DRAWING: return <Palette size={18} />;
      case ActivityCategory.MUSIC: return <Music size={18} />;
      case ActivityCategory.SPIRITUALITY: return <BookOpen size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  const getColor = (cat: ActivityCategory) => {
    switch(cat) {
      case ActivityCategory.MATH: return 'bg-blue-50 text-blue-600 border-blue-100';
      case ActivityCategory.ART: 
      case ActivityCategory.DRAWING: return 'bg-pink-50 text-pink-600 border-pink-100';
      case ActivityCategory.MUSIC: return 'bg-purple-50 text-purple-600 border-purple-100';
      case ActivityCategory.SPIRITUALITY: return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div 
      onClick={() => onClick(activity)}
      className={`group relative p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${activity.isCompleted ? 'opacity-75 grayscale-[0.3]' : ''}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${getColor(activity.category).split(' ')[1].replace('text', 'bg')}`}></div>
      
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-2 border ${getColor(activity.category)}`}>
          {getIcon(activity.category)}
          {activity.category}
        </span>
        <div className="text-sage-500">
            {activity.isCompleted ? <CheckCircle size={20} className="text-sage-500" /> : <Circle size={20} />}
        </div>
      </div>
      
      <h3 className="text-lg font-serif font-semibold text-gray-800 mb-1 group-hover:text-sage-700 transition-colors">
        {activity.title}
      </h3>
      
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
        {activity.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-medium uppercase tracking-wider">
        <span>{activity.durationMinutes} min</span>
        <span className="group-hover:translate-x-1 transition-transform">Start Activity →</span>
      </div>
    </div>
  );
};

export default ActivityCard;
