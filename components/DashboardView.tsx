
import React, { useState, useMemo, useEffect } from 'react';
import { UserProgress, AppMode } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Trophy, Zap, Book, Star, MessageCircle, 
  Target, Layers, ChevronRight, Sparkles, Volume2, Loader2, Lightbulb, Activity, Globe, AlertCircle, X, Award
} from 'lucide-react';
import { textToSpeech, decodeAudioData } from '../services/geminiService';
import BadgeShowcase from './BadgeShowcase';

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

  useEffect(() => {
    if (newlyEarnedBadgeIds.length > 0) {
      const timer = setTimeout(() => {
        clearNewlyEarned?.();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [newlyEarnedBadgeIds, clearNewlyEarned]);

  const studyDeck = useMemo(() => {
    const vocab = [...progress.vocabulary]
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 6)
      .map(v => ({ 
        word: v.word, 
        meaning: v.meaning, 
        source: 'Vocabulário'
      }));
    
    const corrections = (progress.correctionHistory || [])
      .slice(0, 4)
      .map(c => ({ 
        word: c.incorrect, 
        meaning: c.corrected, 
        source: 'Correção Salva'
      }));

    return [...vocab, ...corrections].sort(() => Math.random() - 0.5);
  }, [progress.vocabulary, progress.correctionHistory]);

  const radarData = useMemo(() => {
    const grammarValues = Object.values(progress.grammarMastery) as number[];
    const avgGrammar = (grammarValues.reduce((a, b) => a + b, 0) / grammarValues.length) * 100;

    return [
      { subject: 'GRAMÁTICA', A: Math.round(Math.min(100, avgGrammar)), fullMark: 100 },
      { subject: 'NEGÓCIOS', A: Math.round(Math.min(100, progress.lessonsCompleted.filter(l => l.includes('Business')).length * 35 + 45)), fullMark: 100 },
      { subject: 'SOCIAL', A: Math.round(Math.min(100, progress.sessionCount * 2 + 40)), fullMark: 100 },
      { subject: 'VOCABULÁRIO', A: Math.round(Math.min(100, (progress.vocabulary.length / 80) * 100)), fullMark: 100 },
      { subject: 'FLUIDEZ', A: Math.round(Math.min(100, Math.max(0, 100 - (progress.correctionHistory.length * 2.5) + 30))), fullMark: 100 },
      { subject: 'AUDIÇÃO', A: Math.round(Math.min(100, (progress.totalPracticeMinutes / 200) * 100 + 50)), fullMark: 100 },
    ];
  }, [progress]);

  const totalAverage = useMemo(() => {
    const sum = radarData.reduce((acc, curr) => acc + curr.A, 0);
    return Math.round(sum / radarData.length);
  }, [radarData]);

  const grammarChartData = useMemo(() => {
    return Object.entries(progress.grammarMastery).map(([name, value]) => ({
      name,
      mastery: Math.round((value as number) * 100)
    }));
  }, [progress.grammarMastery]);

  const playPronunciation = async (e: React.MouseEvent, word?: string) => {
    e.stopPropagation();
    if (!word) return;
    setAudioLoading(true);
    try {
      const audioBytes = await textToSpeech(word);
      if (audioBytes) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (err) { console.error(err); } finally { setAudioLoading(false); }
  };

  const stats = [
    { label: 'Vocabulário', value: progress.vocabulary.length, icon: <Book className="text-blue-500" size={18} />, color: 'bg-blue-50' },
    { label: 'Minutos', value: progress.totalPracticeMinutes, icon: <Zap className="text-yellow-500" size={18} />, color: 'bg-yellow-50' },
    { label: 'Sessões', value: progress.sessionCount, icon: <MessageCircle className="text-purple-500" size={18} />, color: 'bg-purple-50' },
    { label: 'Correções', value: progress.correctionHistory.length, icon: <AlertCircle className="text-orange-500" size={18} />, color: 'bg-orange-50' }
  ];

  if (isStudyMode) {
    return (
      <div className="h-full bg-slate-950 p-6 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
        <div className="max-w-md w-full flex flex-col items-center gap-8 relative h-full justify-center">
          {!sessionCompleted && (
            <div className="w-full space-y-4 text-center">
              <div className="flex items-center justify-between px-2">
                <button onClick={() => setIsStudyMode(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={28} />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase">Revisão</span>
                  <span className="text-xs font-bold text-white/40">{currentCardIndex + 1}/{studyDeck.length}</span>
                </div>
                <div className="w-7 h-7" />
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${((currentCardIndex + 1) / studyDeck.length) * 100}%` }} />
              </div>
            </div>
          )}

          {!sessionCompleted ? (
            <div className="w-full perspective-2000">
              <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[4/5] sm:aspect-[3/4] transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 backface-hidden bg-white rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center space-y-8">
                  <span className="px-5 py-2 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">{studyDeck[currentCardIndex]?.source}</span>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{studyDeck[currentCardIndex]?.word}</h3>
                  <button onClick={(e) => playPronunciation(e, studyDeck[currentCardIndex]?.word)} className="p-4 bg-slate-100 text-slate-500 rounded-full hover:bg-emerald-600 hover:text-white transition-all">
                    {audioLoading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} />}
                  </button>
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] mt-8 animate-pulse text-center">Touch to reveal</p>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white space-y-8 overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent pointer-events-none" />
                  <Star size={48} className="text-emerald-500 mb-2" />
                  <h3 className="text-3xl font-black tracking-tight leading-tight">{studyDeck[currentCardIndex]?.meaning}</h3>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mt-8">Flip back</p>
                </div>
              </div>
              <div className={`mt-10 flex gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <button onClick={() => { setIsFlipped(false); setTimeout(() => currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true), 300); }} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">Esqueci</button>
                <button onClick={() => { setIsFlipped(false); setTimeout(() => currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true), 300); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95">Lembrei!</button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-10 animate-in zoom-in-95 duration-700">
              <div className="w-40 h-40 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><Trophy size={80} /></div>
              <h3 className="text-4xl font-black text-white tracking-tighter">Sessão Concluída</h3>
              <button onClick={() => setIsStudyMode(false)} className="w-full bg-white text-slate-950 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-emerald-500 hover:text-white transition-all">Retornar ao Painel</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 overflow-y-auto h-full bg-[#f8fafc] pb-32 animate-in fade-in duration-700 no-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">Fala, Chandler!</h1>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Ativo</div>
          </div>
          <p className="text-slate-500 font-bold">Nível Atual: <span className="text-emerald-600 uppercase tracking-widest">{progress.difficulty}</span></p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 px-6 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><Activity size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Proficiência</p>
            <p className="text-lg font-black text-slate-900 leading-none">{progress.level}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SKILL RADAR CARD */}
        <div className="bg-white p-6 sm:p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50/40 rounded-full -mr-40 -mt-40 opacity-80 pointer-events-none blur-3xl" />
          
          <div className="w-full mb-12 relative z-10">
             <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">COMPETÊNCIA GERAL</h3>
               <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">RADAR DE HABILIDADES</p>
             </div>
             <div className="absolute top-0 right-0 p-3 bg-emerald-50 text-emerald-600 rounded-full shadow-inner border border-emerald-100/50">
               <Target size={20} />
             </div>
          </div>

          <div className="h-[420px] w-full relative z-10 flex items-center justify-center">
            {/* Background pulsing rings to match image depth */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
               <div className="w-[180px] h-[180px] border border-emerald-200 rounded-full animate-pulse" />
               <div className="absolute w-[280px] h-[280px] border border-emerald-100 rounded-full" />
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="62%" data={radarData}>
                <defs>
                  <linearGradient id="radarAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                
                <PolarGrid 
                  stroke="#e2e8f0" 
                  strokeWidth={1} 
                  radialLines={true} 
                  gridType="polygon"
                />
                
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={(props) => {
                    const { payload, x, y, cx, cy } = props;
                    const nx = Number(x);
                    const ny = Number(y);
                    const ncx = Number(cx);
                    const ncy = Number(cy);
                    const dx = nx - ncx;
                    const dy = ny - ncy;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const labelPadding = 26;
                    const lx = ncx + (dx / distance) * (distance + labelPadding);
                    const ly = ncy + (dy / distance) * (distance + labelPadding);
                    const value = radarData.find(d => d.subject === payload.value)?.A;

                    return (
                      <g transform={`translate(${lx},${ly})`}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#64748b"
                          fontSize={9}
                          fontWeight={900}
                          style={{ letterSpacing: '0.12em', fontStyle: 'italic' }}
                        >
                          {payload.value}
                        </text>
                        <text
                           y={14}
                           textAnchor="middle"
                           dominantBaseline="middle"
                           fill="#10b981"
                           fontSize={10}
                           fontWeight={900}
                        >
                           {value}%
                        </text>
                      </g>
                    );
                  }}
                />
                
                <Radar 
                  name="Proficiência" 
                  dataKey="A" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fill="url(#radarAreaGradient)" 
                  fillOpacity={0.6} 
                  dot={(props: any) => {
                    const { cx, cy } = props;
                    return (
                      <circle 
                        cx={cx} cy={cy} r={5} 
                        fill="#10b981" stroke="#fff" strokeWidth={2.5} 
                        className="shadow-xl"
                      />
                    );
                  }}
                  isAnimationActive={true}
                  animationDuration={1800}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Central aesthetic glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-20 flex items-center justify-center ring-[10px] ring-white">
               <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <div className="w-full mt-auto pt-8 border-t border-slate-50 flex justify-between items-end">
             <div className="space-y-0.5">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">MÉDIA TOTAL</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black text-slate-900 tracking-tighter">{totalAverage}</span>
                 <span className="text-lg font-black text-emerald-500">%</span>
               </div>
             </div>
             <div className="p-4 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center">
                <Sparkles size={20} className="text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 mt-1 uppercase tracking-tighter">TOP 5%</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8 flex flex-col h-full">
          {/* Badge Showcase */}
          <div className={`bg-white p-8 rounded-[3.5rem] shadow-sm border transition-all duration-1000 flex flex-col flex-1 relative ${
            newlyEarnedBadgeIds.length > 0 
              ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-xl shadow-amber-500/10 scale-[1.01]' 
              : 'border-slate-100'
          }`}>
            {newlyEarnedBadgeIds.length > 0 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg animate-bounce z-50">
                Novas Conquistas!
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-[1.5rem] shadow-sm transition-colors duration-500 ${
                  newlyEarnedBadgeIds.length > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Award size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Conquistas</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gamificação</span>
            </div>
            <BadgeShowcase badges={progress.badges} newlyEarnedBadgeIds={newlyEarnedBadgeIds} />
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-[1.5rem] shadow-sm"><Lightbulb size={24} /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Estratégias de Hoje</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">IA Sugestões</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1">
              <div className="p-8 bg-emerald-50/40 border border-emerald-100 rounded-[3rem] flex flex-col justify-between group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-default overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  <div className="relative z-10">
                    <div className="w-fit p-3 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform"><Target className="text-emerald-600" size={20} /></div>
                    <h4 className="font-black text-slate-900 text-xl mb-2">Prática de Subjuntivo</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">Seu domínio aumentou 12%. Vamos consolidar em um cenário de negócios?</p>
                  </div>
                  <button onClick={() => onStartLesson?.("Quero uma prática focada em subjuntivo avançado.")} className="mt-8 py-4 bg-white text-emerald-600 text-[10px] font-black rounded-2xl border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-sm relative z-10">Iniciar Módulo</button>
              </div>
              <div onClick={() => setIsStudyMode(true)} className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-950 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-5 bg-white/10 rounded-3xl shadow-inner mb-5 group-hover:scale-110 transition-transform"><Layers className="text-emerald-400" size={40} /></div>
                    <h4 className="font-black text-white text-xl mb-1">Revisão Ativa</h4>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">{studyDeck.length} itens pendentes</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 w-full text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Iniciar Flashcards</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group">
            <div className={`p-3.5 ${stat.color} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-sm`}>{stat.icon}</div>
            <div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-1 animate-in slide-in-from-bottom-2 duration-1000" style={{ animationDelay: `${idx * 0.1}s` }}>{stat.value}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatísticas Gramaticais</h3>
              <p className="text-xs font-black text-slate-900 uppercase">Domínio por Tópico</p>
            </div>
            <Target size={20} className="text-slate-300" />
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grammarChartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, textAnchor: 'end' }} width={110} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="mastery" radius={[0, 12, 12, 0]} barSize={24} animationBegin={500} animationDuration={1200}>
                  {grammarChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mastery > 60 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group flex flex-col justify-center min-h-[450px]">
           <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full -mr-40 -mt-40 opacity-[0.08] group-hover:scale-125 transition-transform duration-1000" />
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px]">
                <Globe size={20} /> Cultura Viva
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black italic tracking-tighter leading-none">"O jeitinho brasileiro"</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  Chandler, vamos entender a sutil diferença entre o "jeitinho" social e a "gambiarra" no contexto profissional de São Paulo.
                </p>
              </div>
              <div className="pt-4">
                 <button onClick={() => onStartLesson?.("Vamos discutir o 'jeitinho brasileiro' no mundo dos negócios.")} className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 flex items-center gap-3 active:scale-95">Explorar com Iwry <ChevronRight size={18} /></button>
              </div>
           </div>
        </div>
      </div>
      <style>{`
        .perspective-2000 { perspective: 2000px; } 
        .transform-style-3d { transform-style: preserve-3d; } 
        .backface-hidden { backface-visibility: hidden; } 
        .rotate-y-180 { transform: rotateY(180deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default DashboardView;
