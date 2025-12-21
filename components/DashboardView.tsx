
import React from 'react';
import { UserProgress, AppMode } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Trophy, Zap, Book, Star, PlusCircle, MessageCircle, PlayCircle, Hash, TrendingUp, Target } from 'lucide-react';

interface DashboardViewProps {
  progress: UserProgress;
  setMode: (mode: AppMode) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ progress, setMode }) => {
  // 1. Heatmap Data (from existing grammarMastery)
  const grammarData = Object.entries(progress.grammarMastery).map(([name, value]) => ({
    name,
    mastery: Math.round((value as number) * 100)
  }));

  // 2. Activity Timeline Data (Simulated historical data for the last 7 days)
  const activityTimeline = [
    { day: 'Seg', minutes: 15, lessons: 1 },
    { day: 'Ter', minutes: 30, lessons: 2 },
    { day: 'Qua', minutes: 10, lessons: 0 },
    { day: 'Qui', minutes: 45, lessons: 3 },
    { day: 'Sex', minutes: 20, lessons: 1 },
    { day: 'Sáb', minutes: 60, lessons: 4 },
    { day: 'Dom', minutes: progress.totalPracticeMinutes % 60, lessons: progress.lessonsCompleted.length % 5 },
  ];

  // 3. Radar Chart Data (Mapping grammar/skills to modules)
  const radarData = [
    { subject: 'Professional', A: 85, fullMark: 100 },
    { subject: 'Social', A: 65, fullMark: 100 },
    { subject: 'Grammar', A: 40, fullMark: 100 },
    { subject: 'Regional', A: 30, fullMark: 100 },
    { subject: 'Travel', A: 90, fullMark: 100 },
    { subject: 'Slang', A: 75, fullMark: 100 },
  ];

  const stats = [
    { label: 'Vocabulary', value: progress.vocabulary.length, icon: <Book className="text-blue-500" size={18} /> },
    { label: 'Practice Time', value: `${progress.totalPracticeMinutes}m`, icon: <Zap className="text-yellow-500" size={18} /> },
    { label: 'Est. Level', value: progress.level, icon: <Star className="text-emerald-500" size={18} /> },
    { label: 'Streak', value: `${progress.streak} days`, icon: <Trophy className="text-orange-500" size={18} /> }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-y-auto h-full bg-slate-50 pb-28">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Bom dia, Chandler! 🇧🇷</h1>
          <p className="text-slate-500 font-medium mt-1">Sua fluência em português está evoluindo rápido.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <TrendingUp size={16} className="text-emerald-500" />
          <span className="text-sm font-bold text-slate-700">+12% esta semana</span>
        </div>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => setMode(AppMode.CHAT)}
          className="bg-emerald-600 text-white p-6 rounded-[2.5rem] text-left hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-bold text-xl mb-1">Conversar agora</h3>
            <p className="text-emerald-100 text-sm opacity-90">Pratique com o Iwry.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </button>
        
        <button 
          onClick={() => setMode(AppMode.TEXT_MODE)}
          className="bg-white border border-slate-200 p-6 rounded-[2.5rem] text-left hover:border-emerald-500 hover:shadow-lg transition-all group"
        >
          <div className="bg-slate-100 p-3 rounded-2xl w-fit mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
            <Hash size={24} />
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-1">Modo WhatsApp</h3>
          <p className="text-slate-500 text-sm">Gírias e abreviações.</p>
        </button>

        <button 
          onClick={() => setMode(AppMode.LIVE_VOICE)}
          className="bg-slate-900 text-white p-6 rounded-[2.5rem] text-left hover:bg-black transition-all shadow-xl shadow-slate-900/20 group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <PlayCircle size={24} />
            </div>
            <h3 className="font-bold text-xl mb-1">Chamada ao vivo</h3>
            <p className="text-slate-400 text-sm">Imersão em tempo real.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="p-2 bg-slate-50 rounded-xl w-fit mb-3">{stat.icon}</div>
            <div>
              <h4 className="text-2xl font-bold text-slate-800">{stat.value}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Learning Activity</h3>
            </div>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-500 px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTimeline}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Radar */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-full flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Target size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Skill Balance</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <PolarRadiusAxis hide />
                <Radar name="Mastery" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 font-medium text-center italic">
            "Sua compreensão profissional está excelente!"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Heatmap (Grammar Mastery) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-8 text-slate-800">Mastery by Topic</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grammarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={24}>
                  {grammarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mastery > 60 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Memories & Imports */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Estudos Externos</h3>
          
          <button 
            onClick={() => setMode(AppMode.IMPORT_MEMORY)}
            className="bg-slate-900 text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 mb-6"
          >
            <PlusCircle size={20} />
            Importar Novo Estudo
          </button>

          <div className="space-y-4 flex-1">
            {progress.memories.length > 0 ? (
              progress.memories.slice(0, 3).map((memory, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{memory.topic}</p>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sync</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3">{new Date(memory.date).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1">
                    {memory.extractedVocab.slice(0, 3).map(v => (
                      <span key={v} className="bg-white text-slate-600 text-[9px] px-2 py-0.5 rounded-lg border border-slate-100 font-bold">{v}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                <Book className="mb-3 text-slate-300" size={40} />
                <p className="text-xs font-bold text-slate-400 px-6 uppercase tracking-widest leading-loose">Nenhum estudo <br/> importado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
