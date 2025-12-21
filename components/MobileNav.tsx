
import React from 'react';
import { AppMode } from '../types';
import { 
  MessageSquare, 
  Smartphone, 
  Mic, 
  LayoutDashboard,
  RefreshCw
} from 'lucide-react';

interface MobileNavProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentMode, setMode }) => {
  const items = [
    { mode: AppMode.CHAT, label: 'Chat', icon: <MessageSquare size={20} /> },
    { mode: AppMode.LIVE_VOICE, label: 'Voice', icon: <Mic size={20} /> },
    { mode: AppMode.REVIEW_SESSION, label: 'Review', icon: <RefreshCw size={20} /> },
    { mode: AppMode.DASHBOARD, label: 'Stats', icon: <LayoutDashboard size={20} /> },
    { mode: AppMode.LESSONS, label: 'More', icon: <Smartphone size={20} /> },
  ];

  return (
    <nav className="md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shrink-0 flex justify-around items-center">
      {items.map((item) => (
        <button
          key={item.mode}
          onClick={() => setMode(item.mode)}
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
    </nav>
  );
};

export default MobileNav;
