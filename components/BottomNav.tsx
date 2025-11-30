import React from 'react';
import { AppTab } from '../types';
import { Home, Brain, Heart, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.HOME, label: 'Home', icon: Home },
    { id: AppTab.LEARN, label: 'Learn', icon: Brain },
    { id: AppTab.CONNECT, label: 'Connect', icon: Heart },
    { id: AppTab.SOUL, label: 'Soul', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white border-t border-gray-100 px-6 py-3 pb-6 flex justify-between items-center z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-sage-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-sage-50' : 'bg-transparent'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium tracking-wide opacity-100">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;