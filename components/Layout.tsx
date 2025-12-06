import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: AppTab;
  onTabChange?: (tab: AppTab) => void;
  headerContent?: React.ReactNode;
  theme?: 'MOM' | 'DAD';
}

const Layout: React.FC<LayoutProps> = ({ children, headerContent, theme = 'MOM' }) => {
  const isDad = theme === 'DAD';

  return (
    <div className={`min-h-screen ${isDad ? 'bg-slate-900 text-slate-100 selection:bg-sky-900' : 'bg-slate-50 text-gray-800 selection:bg-rose-quartz-200'} font-sans transition-colors duration-500 flex justify-center`}>
      <div className={`w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl min-h-screen flex flex-col ${isDad ? 'bg-slate-900 shadow-sky-900/20' : 'bg-white shadow-2xl'} shadow-2xl relative overflow-hidden transition-all duration-500`}>

        {/* Background Gradients */}
        {!isDad ? (
          <>
            <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-sage-50 to-white -z-10 pointer-events-none"></div>
            <div className="absolute top-[-100px] left-[-50px] w-64 h-64 bg-saffron-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute top-[100px] right-[-50px] w-64 h-64 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
          </>
        ) : (
          <>
            <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-800 to-slate-900 -z-10 pointer-events-none"></div>
            <div className="absolute top-[-100px] left-[-50px] w-64 h-64 bg-sky-900 rounded-full mix-blend-screen filter blur-3xl opacity-10 pointer-events-none"></div>
            <div className="absolute top-[100px] right-[-50px] w-64 h-64 bg-amber-900 rounded-full mix-blend-screen filter blur-3xl opacity-10 pointer-events-none"></div>
          </>
        )}

        {/* Dynamic Header */}
        <header className={`px-6 py-4 sticky top-0 z-20 backdrop-blur-md border-b flex flex-col gap-2 ${isDad ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-50'}`}>
          <div className={`text-xl font-serif font-bold tracking-wide text-center w-full ${isDad ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-quartz-600'}`}>
            GarbhVeda
          </div>
          {headerContent}
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 px-5 py-6 overflow-y-auto pb-28 custom-scrollbar">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;