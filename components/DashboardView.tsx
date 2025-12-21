
import React, { useState, useMemo } from 'react';
import { UserProgress, AppMode, VocabItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Trophy, Zap, Book, Star, PlusCircle, MessageCircle, PlayCircle, 
  Hash, TrendingUp, Target, Layers, RotateCcw, Check, X, ChevronRight, Sparkles, Volume2, Loader2, Lightbulb 
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
    return [...progress.vocabulary]
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 10);
  }, [progress.vocabulary]);

  const recommendations = useMemo(() => {
    const recs = [];
    
    // Find lowest grammar mastery
    // Added type assertions to a[1] and b[1] to fix arithmetic operation errors
    const lowestGrammar = Object.entries(progress.grammarMastery)
      .sort((a, b) => (a[1] as number) - (b[1] as number))[0];
    
    // Added type assertion to lowestGrammar[1] to fix comparison and multiplication errors
    if (lowestGrammar && (lowestGrammar[1] as number) < 0.6) {
      recs.push({
        id: 'grammar',
        title: `Pratique ${lowestGrammar[0]}`,
        desc: `Sua maestria está em ${Math.round((lowestGrammar[1] as number) * 100)}%. Vamos melhorar?`,
        prompt: `Quero praticar especificamente ${lowestGrammar[0]}. Pode me dar alguns exemplos e exercícios?`
      });
    }

    // Check recent memories
    if (progress.memories.length > 0) {
      const latest = progress.memories[0];
      recs.push({
        id: 'memory',
        title: `Aplique seu estudo: ${latest.topic}`,
        desc: `Você importou este tema recentemente. Vamos usar o vocabulário em uma conversa real?`,
        prompt: `Vamos ter uma conversa usando o vocabulário do meu estudo sobre "${latest.topic}".`
      });
    }

    // Default recommendation if needed
    if (recs.length < 2) {
      recs.push({
        id: 'casual',
        title: 'Bate-papo de Faria Lima',
        desc: 'Pratique seu "business Portuguese" para reuniões em São Paulo.',
        prompt: 'Vamos praticar uma conversa de networking profissional em São Paulo.'
      });
    }

    return recs;
  }, [progress]);

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < studyDeck.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleResetStudy = () => {
    setIsStudyMode(false);
    setSessionCompleted(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setAudioLoading(false);
  };

  const playPronunciation = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if (audioLoading) return;
    
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
    } catch (err) {
      console.error("Pronunciation error:", err);
    } finally {
      setAudioLoading(false);
    }
  };

  const grammarData = Object.entries(progress.grammarMastery).map(([name, value]) => ({
    name,
    mastery: Math.round((value as number) * 100)
  }));

  const activityTimeline = [
    { day: 'Seg', minutes: 15, lessons: 1 },
    { day: 'Ter', minutes: 30, lessons: 2 },
    { day: 'Qua', minutes: 10, lessons: 0 },
    { day: 'Qui', minutes: 45, lessons: 3 },
    { day: 'Sex', minutes: 20, lessons: 1 },
    { day: 'Sáb', minutes: 60, lessons: 4 },
    { day: 'Dom', minutes: 25, lessons: 1 },
  ];

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
    { label: 'Sessions', value: progress.sessionCount, icon: <MessageCircle className="text-purple-500" size={18} /> },
    { label: 'Streak', value: `${progress.streak} days`, icon: <Trophy className="text-orange-500" size={18} /> }
  ];

  if (isStudyMode) {
    return (
      <div className="h-full bg-slate-50 p-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-md w-full flex flex-col items-center gap-8 relative h-full justify-center">
          {!sessionCompleted && (
            <div className="w-full space-y-4 text-center">
              <div className="flex items-center justify-between px-2">
                <button onClick={handleResetStudy} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">
                  {currentCardIndex + 1} / {studyDeck.length}
                </span>
                <div className="w-6 h-6" />
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${((currentCardIndex + 1) / studyDeck.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {!sessionCompleted ? (
            <div className="w-full perspective-1000">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full aspect-[3/4] transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col items-center justify-center p-10 text-center space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600">
                    <Layers size={32} />
                  </div>
                  <div className="relative group/word">
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight">{studyDeck[currentCardIndex].word}</h3>
                    <button 
                      onClick={(e) => playPronunciation(e, studyDeck[currentCardIndex].word)}
                      className="absolute -right-12 top-1/2 -translate-y-1/2 p-2.5 bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-all shadow-sm"
                    >
                      {audioLoading ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Volume2 size={18} />}
                    </button>
                  </div>
                  <div className="pt-4 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Toque para revelar</span>
                    <RotateCcw size={20} className="text-slate-300 animate-pulse" />
                  </div>
                </div>

                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-600 rounded-[3rem] shadow-2xl shadow-emerald-500/20 flex flex-col items-center justify-center p-10 text-center text-white space-y-6">
                   <div className="bg-white/20 p-4 rounded-3xl">
                    <Star size={32} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">{studyDeck[currentCardIndex].meaning}</h3>
                  <p className="text-emerald-100/80 text-sm leading-relaxed max-w-[200px]">
                    "Pratique esta palavra hoje Chandler!"
                  </p>
                </div>
              </div>

              <div className={`mt-10 flex gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                  className="flex-1 bg-white border border-slate-200 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Esqueci
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Lembrei!
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Trophy size={64} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800">Parabéns!</h3>
                <p className="text-slate-500">Você revisou 10 palavras hoje. <br/> Seu vocabulário está ficando mais forte.</p>
              </div>
              <button 
                onClick={handleResetStudy}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all"
              >
                Voltar ao Painel
              </button>
            </div>
          )}
        </div>
        
        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-y-auto h-full bg-slate-50 pb-28">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setMode(AppMode.CHAT)}
              className="bg-emerald-600 text-white p-6 rounded-[2.5rem] text-left hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 group relative overflow-hidden h-40"
            >
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="bg-white/20 p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Conversar</h3>
                  <p className="text-emerald-100 text-sm opacity-90">Pratique com o Iwry.</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </button>
            
            <button 
              onClick={() => setIsStudyMode(true)}
              className="bg-orange-500 text-white p-6 rounded-[2.5rem] text-left hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 group relative overflow-hidden h-40"
            >
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="bg-white/20 p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Flashcards</h3>
                  <p className="text-orange-100 text-sm opacity-90">Revisar 10 palavras.</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Lightbulb size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Recomendado para Você</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map(rec => (
                <div key={rec.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-emerald-200 transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">{rec.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{rec.desc}</p>
                  </div>
                  <button 
                    onClick={() => onStartLesson && onStartLesson(rec.prompt)}
                    className="w-full py-2 bg-white text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Iniciar <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Seus Estudos Externos</h3>
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
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Evolução do Domínio</h3>
            </div>
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

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-8 text-slate-800">Gramática por Tópico</h3>
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
      </div>
    </div>
  );
};

export default DashboardView;
