
import React from 'react';
import { AppMode } from '../types';
import { Trophy } from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  streak: number;
}

const Header: React.FC<HeaderProps> = ({ mode, streak }) => {
  const getTitle = () => {
    switch (mode) {
      case AppMode.DASHBOARD: return 'Dashboard';
      case AppMode.CHAT: return 'Conversation';
      case AppMode.TEXT_MODE: return 'WhatsApp Mode';
      case AppMode.LIVE_VOICE: return 'Real-Time';
      case AppMode.IMPORT_MEMORY: return 'Import Learning';
      case AppMode.IMAGE_ANALYSIS: return 'Visual Learning';
      default: return 'Fala Comigo';
    }
  };

  return (
    <header className="pt-[env(safe-area-inset-top)] bg-white border-b flex flex-col shrink-0 sticky top-0 z-50">
      <div className="h-14 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm sm:hidden">
            F
          </div>
          <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight">{getTitle()}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
            <Trophy size={14} className="fill-orange-600" />
            <span className="text-xs font-bold">{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] rounded-full"></div>
              </div>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chandler" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
