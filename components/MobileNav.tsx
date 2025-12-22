import React, { useState } from 'react';
import { AppMode } from '../types';
import {
  MessageSquare,
  Mic,
  LayoutDashboard,
  MoreHorizontal,
  X,
  BookOpen,
  Search,
  Camera,
  History,
  FileText,
  RefreshCw,
  Smartphone,
  HelpCircle,
  Upload
} from 'lucide-react';

interface MobileNavProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentMode, setMode }) => {
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { mode: AppMode.CHAT, label: 'Chat', icon: <MessageSquare size={20} /> },
    { mode: AppMode.LIVE_VOICE, label: 'Voice', icon: <Mic size={20} /> },
    { mode: AppMode.DASHBOARD, label: 'Stats', icon: <LayoutDashboard size={20} /> },
  ];

  const moreItems = [
    { mode: AppMode.TEXT_MODE, label: 'WhatsApp', icon: <Smartphone size={18} /> },
    { mode: AppMode.LESSONS, label: 'Lessons', icon: <BookOpen size={18} /> },
    { mode: AppMode.DICTIONARY, label: 'Dictionary', icon: <Search size={18} /> },
    { mode: AppMode.IMAGE_ANALYSIS, label: 'Photo', icon: <Camera size={18} /> },
    { mode: AppMode.REVIEW_SESSION, label: 'Review', icon: <RefreshCw size={18} /> },
    { mode: AppMode.CORRECTION_LIBRARY, label: 'Corrections', icon: <History size={18} /> },
    { mode: AppMode.LEARNING_LOG, label: 'Log', icon: <FileText size={18} /> },
    { mode: AppMode.IMPORT_MEMORY, label: 'Import', icon: <Upload size={18} /> },
    { mode: AppMode.QUICK_HELP, label: 'Help', icon: <HelpCircle size={18} /> },
  ];

  const handleSelectMode = (mode: AppMode) => {
    setMode(mode);
    setShowMore(false);
  };

  // Check if current mode is one of the "more" modes
  const isMoreModeActive = moreItems.some(item => item.mode === currentMode);

  return (
    <>
      {/* Bottom Sheet Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Bottom Sheet */}
      {showMore && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 pb-[env(safe-area-inset-bottom)] md:hidden animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">More Features</h3>
            <button
              onClick={() => setShowMore(false)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {moreItems.map(item => (
              <button
                key={item.mode}
                onClick={() => handleSelectMode(item.mode)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-colors ${
                  currentMode === item.mode
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="mb-2">{item.icon}</div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Nav Bar */}
      <nav className="md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shrink-0">
        <div className="flex justify-around items-center">
          {mainItems.map(item => (
            <button
              key={item.mode}
              onClick={() => handleSelectMode(item.mode)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                currentMode === item.mode
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                currentMode === item.mode ? 'bg-emerald-50' : 'bg-transparent'
              }`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold mt-1 uppercase tracking-tight">
                {item.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
              isMoreModeActive ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${
              isMoreModeActive ? 'bg-emerald-50' : 'bg-transparent'
            }`}>
              <MoreHorizontal size={20} />
            </div>
            <span className="text-[10px] font-semibold mt-1 uppercase tracking-tight">
              More
            </span>
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes slide-in-from-bottom {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-in.slide-in-from-bottom {
          animation: slide-in-from-bottom 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default MobileNav;
