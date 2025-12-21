
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
}

const Header: React.FC<HeaderProps> = ({ mode }) => {
  const getTitle = () => {
    switch (mode) {
      case AppMode.CHAT: return 'Natural Conversation';
      case AppMode.TEXT_MODE: return 'Informal Messaging (WhatsApp)';
      case AppMode.LIVE_VOICE: return 'Real-Time Practice';
      case AppMode.LESSONS: return 'Structured Lessons';
      case AppMode.DASHBOARD: return 'Your Progress Dashboard';
      case AppMode.QUICK_HELP: return 'Translations & Examples';
      case AppMode.IMAGE_ANALYSIS: return 'Visual Learning';
      default: return 'Fala Comigo';
    }
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">{getTitle()}</h2>
        <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider animate-pulse">
          Iwry Online
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400 font-medium">Daily Goal</p>
          <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
