
import React, { useState, useMemo } from 'react';
import { UserProgress, AppMode } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Trophy, Zap, Book, Star, PlusCircle, MessageCircle, 
  TrendingUp, Target, Layers, RotateCcw, Check, X, ChevronRight, Sparkles, Volume2, Loader2, Lightbulb, Activity, Globe, History, AlertCircle
} from 'lucide-react';
import { textToSpeech, decodeAudioData } from '../services/geminiService';

interface DashboardViewProps {
  progress: UserProgress;
  setMode: (mode: AppMode) => void;
  onStartLesson?: (prompt: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ progress, setMode, onStartLesson }) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const studyDeck = useMemo(() => {
    const vocab = [...progress.vocabulary]
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 6)
      .map(v => ({ 
        word: v.word, 
        meaning: v.meaning, 
        source: 'Vocabulário',
        explanation: undefined as string | undefined 
      }));
    
    const corrections = (progress.correctionHistory || [])
      .slice(0, 4)
      .map(c => ({ 
        word: c.incorrect, 
        meaning: c.corrected, 
        source: 'Correção Salva', 
        explanation: c.explanation 
      }));

    return [...vocab, ...corrections].sort(() => Math.random() - 0.5);
  }, [progress.vocabulary, progress.correctionHistory]);

  const radarData = useMemo(() => {
    const grammarValues = Object.values(progress.grammarMastery) as number[];
    const avgGrammar = (grammarValues.reduce((a, b) => a + b, 0) / grammarValues.length) * 100;

    return [
      { subject: 'GRAMÁTICA', A: avgGrammar, fullMark: 100 },
      { subject: 'BUSINESS', A: Math.min(100, progress.lessonsCompleted.filter(l => l.includes('Business')).length * 40 + 30), fullMark: 100 },
      { subject: 'SOCIAL', A: Math.min(100, progress.sessionCount * 2.5), fullMark: 100 },
      { subject: 'VOCABULÁRIO', A: Math.min(100, (progress.vocabulary.length / 100) * 100), fullMark: 100 },
      { subject: 'PRECISÃO', A: Math.max(0, 100 - (progress.correctionHistory.length * 3)), fullMark: 100 },
      { subject: 'CONSISTÊNCIA', A: Math.min(100, (progress.streak / 30) * 100 + 40), fullMark: 100 },
    ];
  }, [progress]);

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
      <div className="h-full bg-slate-900 p-6 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
        <div className="max-w-md w-full flex flex-col items-center gap-8 relative h-full justify-center">
          {!sessionCompleted && (
            <div className="w-full space-y-4 text-center">
              <div className="flex items-center justify-between px-2">
                <button onClick={() => setIsStudyMode(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={28} />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-500 tracking-[0.2em] uppercase">Revisão Ativa</span>
                  <span className="text-sm font-bold text-white/40">Card {currentCardIndex + 1}/{studyDeck.length}</span>
                </div>
                <div className="w-7 h-7" />
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${((currentCardIndex + 1) / studyDeck.length) * 100}%` }} />
              </div>
            </div>
          )}

          {!sessionCompleted ? (
            <div className="w-full perspective-2000">
              <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[3/4] transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{studyDeck[currentCardIndex]?.source}</span>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{studyDeck[currentCardIndex]?.word}</h3>
                  <button onClick={(e) => playPronunciation(e, studyDeck[currentCardIndex]?.word)} className="p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-emerald-500 hover:text-white transition-all">
                    {audioLoading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} />}
                  </button>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-4">Toque para revelar</p>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-600 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white space-y-6">
                  <Star size={48} className="text-emerald-300 mb-4" />
                  <h3 className="text-3xl font-black">{studyDeck[currentCardIndex]?.meaning}</h3>
                  {studyDeck[currentCardIndex]?.explanation && <p className="text-emerald-100 text-sm italic">"{studyDeck[currentCardIndex].explanation}"</p>}
                  <p className="text-emerald-300/40 text-xs font-bold uppercase tracking-widest mt-4">Toque para voltar</p>
                </div>
              </div>
              <div className={`mt-8 flex gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button onClick={() => { setIsFlipped(false); setTimeout(() => currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true), 300); }} className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-black uppercase text-xs">Esqueci</button>
                <button onClick={() => { setIsFlipped(false); setTimeout(() => currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true), 300); }} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-xs">Lembrei!</button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="w-32 h-32 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><Trophy size={64} /></div>
              <h3 className="text-3xl font-black text-white">Sessão Finalizada!</h3>
              <button onClick={() => setIsStudyMode(false)} className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl">Voltar ao Painel</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 overflow-y-auto h-full bg-[#f8fafc] pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Fala, Chandler!</h1>
            <span className="text-3xl">🇧🇷</span>
          </div>
          <p className="text-slate-500 font-bold mt-1">Difficulty: <span className="text-emerald-600 uppercase">{progress.difficulty}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 px-5">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><Activity size={18} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível</p>
              <p className="text-sm font-black text-slate-800">{progress.level}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* IMPROVED RADAR GRAPH */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
          <div className="w-full flex items-center justify-between mb-8 relative z-10">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Perfil de Proficiência</h3>
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner"><Target size={16} /></div>
          </div>
          <div className="h-72 w-full relative z-10 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900, letterSpacing: '0.05em' }} 
                />
                <Radar 
                  name="Chandler" 
                  dataKey="A" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="#10b981" 
                  fillOpacity={0.15} 
                  animationBegin={200}
                  animationDuration={1500}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
            {/* Inner aesthetic circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-slate-100 bg-white/50 backdrop-blur-sm shadow-inner pointer-events-none"></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl"><Lightbulb size={24} /></div>
            <h3 className="text-xl font-black text-slate-800">Sugestões para Você</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
             <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] flex flex-col justify-between group hover:shadow-xl transition-all">
                <div>
                  <h4 className="font-black text-emerald-800 text-lg mb-2">Refinar Subjuntivo</h4>
                  <p className="text-xs text-emerald-600 font-medium leading-relaxed">Notamos que você hesita em frases com "Se eu fosse...". Vamos praticar?</p>
                </div>
                <button onClick={() => onStartLesson?.("Quero praticar o modo subjuntivo em cenários de negócios.")} className="mt-6 py-3 bg-white text-emerald-600 text-xs font-black rounded-xl border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest">Iniciar Drill</button>
             </div>
             <div onClick={() => setIsStudyMode(true)} className="p-6 bg-orange-50 border border-orange-200 rounded-[2.5rem] flex flex-col justify-center items-center text-center cursor-pointer hover:bg-orange-100 transition-all group">
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform"><Layers className="text-orange-500" size={32} /></div>
                <h4 className="font-black text-slate-800 text-lg">Flashcards Inteligentes</h4>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">6 itens pendentes</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className={`p-3 ${stat.color} rounded-2xl w-fit mb-4`}>{stat.icon}</div>
            <div>
              <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Domínio Gramatical</h3>
            <Target size={20} className="text-slate-300" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grammarChartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={100} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="mastery" radius={[0, 10, 10, 0]} barSize={20}>
                  {grammarChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mastery > 60 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <Globe size={18} /> Pílula de Cultura
              </div>
              <h3 className="text-3xl font-black italic tracking-tight">"O jeitinho brasileiro"</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed font-medium">
                Sabe aquela solução improvisada que resolve tudo? Em São Paulo chamamos isso de "gambiarra". Vamos aprender a usar esse termo em um contexto profissional?
              </p>
              <div className="pt-4">
                 <button onClick={() => onStartLesson?.("Explique o conceito de 'jeitinho' e 'gambiarra' no mundo corporativo brasileiro.")} className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-emerald-500 hover:text-white flex items-center gap-2">Discutir com Iwry <ChevronRight size={16} /></button>
              </div>
           </div>
        </div>
      </div>
      <style>{`.perspective-2000 { perspective: 2000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
};

export default DashboardView;
