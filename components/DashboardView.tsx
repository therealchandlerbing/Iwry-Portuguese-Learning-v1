
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
    { label: 'Vocabulary', value: progress.vocabulary.length, icon: <Book className="text-blue-500" />, sub: 'Active words' },
    { label: 'Practice Time', value: `${progress.totalPracticeMinutes}m`, icon: <Zap className="text-yellow-500" />, sub: 'Minutes trained' },
    { label: 'Est. Level', value: progress.level, icon: <Star className="text-emerald-500" />, sub: 'Fluency rating' },
    { label: 'Lessons', value: progress.lessonsCompleted.length, icon: <Trophy className="text-orange-500" />, sub: 'Topics finished' }
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-50 rounded-xl">{stat.icon}</div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Status</span>
            </div>
            <h4 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h4>
            <p className="text-sm font-semibold text-slate-600 mt-1">{stat.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-8 text-slate-800">Grammar Mastery</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grammarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="mastery" radius={[8, 8, 0, 0]} barSize={40}>
                  {grammarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Active Vocab</h3>
          <div className="space-y-4 flex-1">
            {progress.vocabulary.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-hover hover:border-emerald-200">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.word}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{item.meaning}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-emerald-600 mb-1">{item.confidence}%</div>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${item.confidence}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-all mt-6">
            View Full Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
