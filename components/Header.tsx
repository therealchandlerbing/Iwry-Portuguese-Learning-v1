
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
}

const Header: React.FC<HeaderProps> = ({ mode }) => {
  const getTitle = () => {
    switch (mode) {
      case AppMode.CHAT: return 'Conversation';
      case AppMode.TEXT_MODE: return 'WhatsApp Mode';
      case AppMode.LIVE_VOICE: return 'Real-Time';
      case AppMode.LESSONS: return 'Lessons';
      case AppMode.DASHBOARD: return 'My Progress';
      case AppMode.QUICK_HELP: return 'Quick Help';
      case AppMode.IMAGE_ANALYSIS: return 'Visual Learning';
      default: return 'Fala Comigo';
    }
  };

  return (
    <header className="pt-[env(safe-area-inset-top)] bg-white/80 backdrop-blur-md border-b flex flex-col shrink-0 sticky top-0 z-50">
      <div className="h-14 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm sm:hidden">
            F
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
          <span className="hidden sm:inline-flex bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
            Iwry Online
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[65%] rounded-full"></div>
            </div>
          </div>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chandler" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-700 sm:hidden" />
        </div>
      </div>
    </header>
  );
};

export default Header;