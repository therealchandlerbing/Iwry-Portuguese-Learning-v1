
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
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Target,
  History
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const groups = [
    {
      label: 'Learning Modes',
      items: [
        { mode: AppMode.CHAT, label: 'Conversation', icon: <MessageSquare size={18} /> },
        { mode: AppMode.TEXT_MODE, label: 'Texting (WhatsApp)', icon: <Smartphone size={18} /> },
        { mode: AppMode.LIVE_VOICE, label: 'Live Voice Practice', icon: <Mic size={18} />, highlight: true },
      ]
    },
    {
      label: 'Tools & Analysis',
      items: [
        { mode: AppMode.IMAGE_ANALYSIS, label: 'Photo Analysis', icon: <Camera size={18} /> },
        { mode: AppMode.LESSONS, label: 'Structured Lessons', icon: <BookOpen size={18} /> },
        { mode: AppMode.REVIEW_SESSION, label: 'Review Center', icon: <RefreshCw size={18} /> },
        { mode: AppMode.CORRECTION_LIBRARY, label: 'Corrections', icon: <History size={18} /> },
      ]
    },
    {
      label: 'Support',
      items: [
        { mode: AppMode.QUICK_HELP, label: 'Quick Help', icon: <HelpCircle size={18} /> },
        { mode: AppMode.DASHBOARD, label: 'My Progress', icon: <LayoutDashboard size={18} /> },
      ]
    }
  ];

  return (
    <aside className="w-[260px] bg-[#0f172a] text-white flex flex-col border-r border-slate-800/50 shrink-0 h-full relative z-50">
      {/* Brand Section */}
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="relative group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            F
          </div>
          <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-black text-lg leading-tight tracking-tight">Fala Comigo</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portuguese Companion</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => setMode(item.mode)}
                    className={`w-full group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                    )}
                    {item.highlight && !isActive && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Live</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Progress Mini-Card */}
      <div className="px-4 mb-4">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-3 hover:bg-slate-800/60 transition-colors group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível Atual</span>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
              <TrendingUp size={12} />
              A2+
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Progresso Semanal</span>
              <span>65%</span>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all group-hover:w-[68%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-slate-800/50 bg-[#0c1222]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group">
          <div className="relative">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chandler" 
              alt="Avatar" 
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 group-hover:border-emerald-500/50 transition-colors" 
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-sm" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-slate-200 truncate group-hover:text-white transition-colors">Chandler Bing</p>
            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">Estudante Intermediário</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
