
import React from 'react';
import { AppMode } from '../types';
import { 
  MessageSquare, 
  Smartphone, 
  Mic, 
  BookOpen, 
  LayoutDashboard, 
  HelpCircle, 
  Camera,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const items = [
    { mode: AppMode.CHAT, label: 'Conversation', icon: <MessageSquare size={20} /> },
    { mode: AppMode.TEXT_MODE, label: 'Texting (WhatsApp)', icon: <Smartphone size={20} /> },
    { mode: AppMode.LIVE_VOICE, label: 'Live Voice Practice', icon: <Mic size={20} /> },
    { mode: AppMode.IMAGE_ANALYSIS, label: 'Photo Analysis', icon: <Camera size={20} /> },
    { mode: AppMode.LESSONS, label: 'Structured Lessons', icon: <BookOpen size={20} /> },
    { mode: AppMode.REVIEW_SESSION, label: 'Review Center', icon: <RefreshCw size={20} /> },
    { mode: AppMode.QUICK_HELP, label: 'Quick Help', icon: <HelpCircle size={20} /> },
    { mode: AppMode.DASHBOARD, label: 'My Progress', icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
          F
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Fala Comigo</h1>
          <p className="text-xs text-slate-400">Your Portuguese Companion</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentMode === item.mode 
                ? 'bg-emerald-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chandler" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-700" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Chandler</p>
            <p className="text-xs text-slate-400 truncate">Intermediate Student</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
