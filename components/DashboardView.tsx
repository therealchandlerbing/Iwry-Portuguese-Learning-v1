
import React from 'react';
import { UserProgress } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Zap, Book, Star } from 'lucide-react';

interface DashboardViewProps {
  progress: UserProgress;
}

const DashboardView: React.FC<DashboardViewProps> = ({ progress }) => {
  const grammarData = Object.entries(progress.grammarMastery).map(([name, value]) => ({
    name,
    mastery: Math.round((value as number) * 100)
  }));

  const stats = [
    { label: 'Vocabulary', value: progress.vocabulary.length, icon: <Book className="text-blue-500" size={18} />, sub: 'Active words' },
    { label: 'Practice Time', value: `${progress.totalPracticeMinutes}m`, icon: <Zap className="text-yellow-500" size={18} />, sub: 'Minutes trained' },
    { label: 'Est. Level', value: progress.level, icon: <Star className="text-emerald-500" size={18} />, sub: 'Fluency rating' },
    { label: 'Lessons', value: progress.lessonsCompleted.length, icon: <Trophy className="text-orange-500" size={18} />, sub: 'Topics finished' }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto h-full bg-slate-50 pb-28 sm:pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 bg-slate-50 rounded-lg">{stat.icon}</div>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hidden sm:block">Status</span>
            </div>
            <div>
              <h4 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-none">{stat.value}</h4>
              <p className="text-[11px] sm:text-sm font-semibold text-slate-500 mt-2 truncate">{stat.label}</p>
              <p className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 flex items-center gap-2">
            Grammar Mastery
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </h3>
          <div className="h-60 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grammarData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="mastery" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 640 ? 25 : 40}>
                  {grammarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg sm:text-xl font-bold mb-6 text-slate-800">Active Vocab</h3>
          <div className="space-y-3 flex-1">
            {progress.vocabulary.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 active:border-emerald-200 transition-all">
                <div className="overflow-hidden mr-2">
                  <p className="font-bold text-slate-800 text-sm truncate">{item.word}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{item.meaning}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold text-emerald-600 mb-1">{item.confidence}%</div>
                  <div className="w-14 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${item.confidence}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-2xl active:bg-emerald-100 transition-all mt-6">
            View Full Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;