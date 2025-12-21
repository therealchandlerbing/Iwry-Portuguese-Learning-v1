
import React from 'react';
import { AppMode, DifficultyLevel } from '../types';
import { Trophy, ChevronDown } from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  streak: number;
  difficulty: DifficultyLevel;
  setDifficulty: (diff: DifficultyLevel) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, streak, difficulty, setDifficulty }) => {
  const getTitle = () => {
    switch (mode) {
      case AppMode.DASHBOARD: return 'Dashboard';
      case AppMode.CHAT: return 'Conversation';
      case AppMode.TEXT_MODE: return 'WhatsApp Mode';
      case AppMode.LIVE_VOICE: return 'Real-Time';
      case AppMode.IMPORT_MEMORY: return 'Import Learning';
      case AppMode.IMAGE_ANALYSIS: return 'Visual Learning';
      case AppMode.CORRECTION_LIBRARY: return 'Correction History';
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
          {/* Difficulty Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest">{difficulty}</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-[100]">
              {[DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors ${difficulty === level ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-600'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
            <Trophy size={14} className="fill-orange-600" />
            <span className="text-xs font-bold">{streak} Day Streak</span>
          </div>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chandler" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
        </div>
      </div>
    </header>
  );
};

export default Header;
