
import React, { useState, useMemo, useEffect } from 'react';
import { UserProgress, AppMode, DifficultyLevel } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  Trophy, Zap, Book, Star, MessageCircle,
  Target, Layers, ChevronRight, Sparkles, Volume2, Loader2, Lightbulb, Activity, Globe, AlertCircle, X, Award, Flag, Brain
} from 'lucide-react';
import { textToSpeech } from '../services/geminiService';
import { audioService } from '../services/audioService';
import BadgeShowcase from './BadgeShowcase';
import Skeleton from './Skeleton';
import { getDueCount } from '../utils/spacedRepetition';

interface DashboardViewProps {
  progress: UserProgress;
  setMode: (mode: AppMode) => void;
  onStartLesson?: (prompt: string) => void;
  newlyEarnedBadgeIds?: string[];
  clearNewlyEarned?: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ progress, setMode, onStartLesson, newlyEarnedBadgeIds = [], clearNewlyEarned }) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isChartMounted, setIsChartMounted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Delay chart rendering to ensure DOM is ready and prevent MutationObserver errors
  // Using requestAnimationFrame ensures the browser has completed layout before mounting the chart
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIsChartMounted(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Initial loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const labels = useMemo(() => {
    const l = {
      [DifficultyLevel.BEGINNER]: {
        welcome: "Bem-vindo!",
        level: "Seu Nível",
        proficiency: "Benchmark CEFR",
        radarTitle: "RADAR DE HABILIDADES",
        achievements: "Conquistas",
        grammarStats: "Gramática",
        activeReview: "Revisão Ativa",
        subjects: { grammar: "GRAMÁTICA", business: "NEGÓCIOS", social: "SOCIAL", vocab: "VOCABULÁRIO", fluency: "FLUIDEZ", listening: "AUDIÇÃO" }
      },
      [DifficultyLevel.INTERMEDIATE]: {
        welcome: "Bem-vindo de volta!",
        level: "Nível Atual",
        proficiency: "Progresso CEFR",
        radarTitle: "ESTATÍSTICAS",
        achievements: "Conquistas",
        grammarStats: "Gramática",
        activeReview: "Revisão Diária",
        subjects: { grammar: "GRAMÁTICA", business: "NEGÓCIOS", social: "SOCIAL", vocab: "VOCABULÁRIO", fluency: "FLUIDEZ", listening: "AUDIÇÃO" }
      },
      [DifficultyLevel.ADVANCED]: {
        welcome: "Vamos praticar!",
        level: "Nível Avançado",
        proficiency: "Domínio CEFR",
        radarTitle: "ANÁLISE DE FLUÊNCIA",
        achievements: "Títulos",
        grammarStats: "Domínio",
        activeReview: "Mastery Review",
        subjects: { grammar: "GRAMÁTICA", business: "NEGÓCIOS", social: "SOCIAL", vocab: "VOCABULÁRIO", fluency: "FLUIDEZ", listening: "AUDIÇÃO" }
      }
    };
    return l[progress.difficulty] || l[DifficultyLevel.BEGINNER];
  }, [progress.difficulty]);

  const radarData = useMemo(() => {
    const grammarValues = Object.values(progress.grammarMastery) as number[];
    const avgGrammar = (grammarValues.length > 0 ? (grammarValues.reduce((a, b) => a + b, 0) / grammarValues.length) : 0) * 100;

    return [
      { subject: labels.subjects.grammar, A: Math.round(avgGrammar), fullMark: 100 },
      { subject: labels.subjects.business, A: Math.round(progress.lessonsCompleted.filter(l => l.includes('Business')).length * 20), fullMark: 100 },
      { subject: labels.subjects.social, A: Math.round(progress.sessionCount * 2), fullMark: 100 },
      { subject: labels.subjects.vocab, A: Math.round(Math.min(100, (progress.vocabulary.length / 50) * 100)), fullMark: 100 },
      { subject: labels.subjects.fluency, A: Math.round(Math.max(0, (progress.totalPracticeMinutes / 500) * 100)), fullMark: 100 },
      { subject: labels.subjects.listening, A: Math.round(Math.min(100, (progress.totalPracticeMinutes / 300) * 100)), fullMark: 100 },
    ];
  }, [progress, labels]);

  const totalAverage = useMemo(() => {
    const sum = radarData.reduce((acc, curr) => acc + curr.A, 0);
    return Math.round(sum / radarData.length);
  }, [radarData]);

  const flashcardsDueCount = useMemo(() => {
    return getDueCount(progress.flashcards || []);
  }, [progress.flashcards]);

  const stats = [
    { label: 'Vocabulário', value: progress.vocabulary.length, icon: <Book className="text-blue-500" size={18} />, color: 'bg-blue-50' },
    { label: 'Minutos', value: progress.totalPracticeMinutes, icon: <Zap className="text-yellow-500" size={18} />, color: 'bg-yellow-50' },
    { label: 'Sessões', value: progress.sessionCount, icon: <MessageCircle className="text-purple-500" size={18} />, color: 'bg-purple-50' },
    { label: 'Ofensiva', value: progress.streak, icon: <Trophy className="text-orange-500" size={18} />, color: 'bg-orange-50' }
  ];

  // Show loading skeleton during initial load
  if (isInitialLoad) {
    return (
      <div className="p-4 sm:p-8 space-y-10 overflow-y-auto h-full bg-[#f8fafc] pb-32 no-scrollbar">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-32" variant="rectangular" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96" variant="rectangular" />
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-48" variant="rectangular" />
            <Skeleton className="h-32" variant="rectangular" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" variant="rectangular" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 overflow-y-auto h-full bg-[#f8fafc] pb-32 animate-in fade-in duration-700 no-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{labels.welcome}</h1>
          <p className="text-slate-500 font-bold">{labels.level}: <span className="text-emerald-600 uppercase tracking-widest">{progress.difficulty}</span></p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 px-6">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><Flag size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{labels.proficiency}</p>
            <p className="text-lg font-black text-slate-900 leading-none">{progress.level}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="bg-white p-6 sm:p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-full mb-12">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Visão Geral</h3>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{labels.radarTitle}</p>
          </div>

          <div className="h-[350px] w-full relative z-10 flex items-center justify-center min-w-0">
            {isChartMounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RadarChart cx="50%" cy="50%" outerRadius="62%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                  <Radar
                    name="Proficiência"
                    dataKey="A"
                    stroke="#10b981"
                    strokeWidth={4}
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="w-full mt-auto pt-8 border-t border-slate-50 flex justify-between items-end">
             <div className="space-y-0.5">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Média Geral</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black text-slate-900 tracking-tighter">{totalAverage}</span>
                 <span className="text-lg font-black text-emerald-500">%</span>
               </div>
             </div>
             <div className="p-4 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
                <Sparkles size={20} className="text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600 mt-1 uppercase tracking-tighter">PROGRESSO</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8 flex flex-col h-full min-h-0">
          <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-[1.5rem]"><Award size={24} /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{labels.achievements}</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <BadgeShowcase badges={progress.badges} newlyEarnedBadgeIds={newlyEarnedBadgeIds} />
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[1.5rem]"><Flag size={24} /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Caminho da Fluência</h3>
              </div>
              <button onClick={() => setMode(AppMode.LESSONS)} className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:underline">Ver Mapa Completo</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aulas Completas</p>
                <p className="text-3xl font-black text-slate-900">{progress.lessonsCompleted.length}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Domínio Gramatical</p>
                <p className="text-3xl font-black text-slate-900">{Math.round(totalAverage)}%</p>
              </div>
              <div
                className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border-2 border-indigo-200 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => setMode(AppMode.FLASHCARDS)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Flashcards Hoje</p>
                  <Brain size={18} className="text-indigo-500" />
                </div>
                <p className="text-3xl font-black text-indigo-900">{flashcardsDueCount}</p>
                {flashcardsDueCount > 0 && (
                  <p className="text-xs font-semibold text-indigo-600 mt-2 flex items-center gap-1">
                    Revisar agora <ChevronRight size={14} />
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group">
            <div className={`p-3.5 ${stat.color} rounded-2xl w-fit mb-6 shadow-sm group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default DashboardView;
