
import React from 'react';
import { UserProgress, AppMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Zap, Book, Star, PlusCircle, MessageCircle, PlayCircle, Hash } from 'lucide-react';

interface DashboardViewProps {
  progress: UserProgress;
  setMode: (mode: AppMode) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ progress, setMode }) => {
  const grammarData = Object.entries(progress.grammarMastery).map(([name, value]) => ({
    name,
    mastery: Math.round((value as number) * 100)
  }));

  const stats = [
    { label: 'Vocabulary', value: progress.vocabulary.length, icon: <Book className="text-blue-500" size={18} /> },
    { label: 'Practice Time', value: `${progress.totalPracticeMinutes}m`, icon: <Zap className="text-yellow-500" size={18} /> },
    { label: 'Est. Level', value: progress.level, icon: <Star className="text-emerald-500" size={18} /> },
    { label: 'Streak', value: `${progress.streak} days`, icon: <Trophy className="text-orange-500" size={18} /> }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 overflow-y-auto h-full bg-slate-50 pb-28">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bom dia, Chandler! 🇧🇷</h1>
          <p className="text-slate-500 font-medium">Ready to take your Portuguese to level C1 today?</p>
        </div>
        <button 
          onClick={() => setMode(AppMode.IMPORT_MEMORY)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
        >
          <PlusCircle size={20} />
          Add External Study
        </button>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => setMode(AppMode.CHAT)}
          className="bg-emerald-600 text-white p-6 rounded-3xl text-left hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 group"
        >
          <div className="bg-white/20 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-xl mb-1">Speak Now</h3>
          <p className="text-emerald-100 text-sm">Practice business conversation with Iwry.</p>
        </button>
        <button 
          onClick={() => setMode(AppMode.TEXT_MODE)}
          className="bg-white border border-slate-200 p-6 rounded-3xl text-left hover:border-emerald-500 transition-all group"
        >
          <div className="bg-slate-100 p-3 rounded-2xl w-fit mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
            <Hash size={24} />
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-1">WhatsApp Practice</h3>
          <p className="text-slate-500 text-sm">Master Brazilian slang and group chat vibes.</p>
        </button>
        <button 
          onClick={() => setMode(AppMode.LIVE_VOICE)}
          className="bg-blue-600 text-white p-6 rounded-3xl text-left hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 group"
        >
          <div className="bg-white/20 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <PlayCircle size={24} />
          </div>
          <h3 className="font-bold text-xl mb-1">Live Call</h3>
          <p className="text-blue-100 text-sm">Zero-latency voice immersion session.</p>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="p-2 bg-slate-50 rounded-xl w-fit mb-3">{stat.icon}</div>
            <h4 className="text-2xl font-bold text-slate-800">{stat.value}</h4>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grammar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Knowledge Heatmap</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grammarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="mastery" radius={[6, 6, 0, 0]} barSize={40}>
                  {grammarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Memories */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Recent Studies</h3>
          <div className="space-y-4 flex-1">
            {progress.memories.length > 0 ? (
              progress.memories.slice(0, 3).map((memory, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-800 text-sm mb-1">{memory.topic}</p>
                  <p className="text-xs text-slate-400 mb-2">{new Date(memory.date).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1">
                    {memory.extractedVocab.slice(0, 2).map(v => (
                      <span key={v} className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold">{v}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Book className="mb-2 text-slate-300" size={32} />
                <p className="text-xs font-medium text-slate-400">No external studies yet. Import your first homework!</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setMode(AppMode.IMPORT_MEMORY)}
            className="w-full py-4 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-2xl mt-6 active:scale-95 transition-all"
          >
            Add Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
