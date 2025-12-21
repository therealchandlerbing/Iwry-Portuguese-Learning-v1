
import React, { useState } from 'react';
import { AppMode, DifficultyLevel } from '../types';
import { Trophy, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  streak: number;
  difficulty: DifficultyLevel;
  setDifficulty: (diff: DifficultyLevel) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, streak, difficulty, setDifficulty }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getTitle = () => {
    switch (mode) {
      case AppMode.DASHBOARD: return 'Dashboard';
      case AppMode.CHAT: return 'Conversation';
      case AppMode.TEXT_MODE: return 'WhatsApp Mode';
      case AppMode.LIVE_VOICE: return 'Real-Time';
      case AppMode.IMPORT_MEMORY: return 'Import Learning';
      case AppMode.IMAGE_ANALYSIS: return 'Visual Learning';
      case AppMode.CORRECTION_LIBRARY: return 'Correction History';
      case AppMode.LEARNING_LOG: return 'Learning Log';
      default: return 'Fala Comigo';
    }
  };

  return (
    <header className="pt-[env(safe-area-inset-top)] bg-white border-b flex flex-col shrink-0 sticky top-0 z-[60]">
      <div className="h-14 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm sm:hidden">
            F
          </div>
          <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight">{getTitle()}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Difficulty Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{difficulty}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  {[DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setDifficulty(level);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors ${
                        difficulty === level 
                          ? 'text-emerald-600 bg-emerald-50/50' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{level}</span>
                      {difficulty === level && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
            <Trophy size={14} className="fill-orange-600" />
            <span className="text-xs font-bold">{streak} Day Streak</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
            U
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
