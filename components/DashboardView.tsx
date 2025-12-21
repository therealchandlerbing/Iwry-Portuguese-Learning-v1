
import React, { useState, useMemo } from 'react';
import { UserProgress, AppMode, VocabItem, CorrectionObject } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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
    // Merge vocab and recent corrections into a single deck
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

    const deck = [...vocab, ...corrections].sort(() => Math.random() - 0.5);
    return deck;
  }, [progress.vocabulary, progress.correctionHistory]);

  const recommendations = useMemo(() => {
    const recs = [];
    
    // Correction recommendation
    if (progress.correctionHistory && progress.correctionHistory.length > 0) {
      const topCategory = progress.correctionHistory[0].category;
      recs.push({
        id: 'correction',
        title: `Revisar: ${topCategory}`,
        desc: `Você cometeu alguns erros em "${topCategory}". Vamos praticar isso agora?`,
        prompt: `Quero revisar meus erros recentes em "${topCategory}". Pode me dar alguns exercícios práticos?`,
        icon: <History className="text-orange-500" size={18} />
      });
    }

    const lowestGrammar = Object.entries(progress.grammarMastery)
      .sort((a, b) => (a[1] as number) - (b[1] as number))[0];
    
    if (lowestGrammar && (lowestGrammar[1] as number) < 0.7) {
      recs.push({
        id: 'grammar',
        title: `Drill: ${lowestGrammar[0]}`,
        desc: `You're at ${Math.round((lowestGrammar[1] as number) * 100)}% mastery. Let's tighten this up.`,
        prompt: `Quero praticar especificamente ${lowestGrammar[0]}. Pode me dar alguns exemplos práticos e depois fazer um roleplay?`,
        icon: <Target className="text-emerald-500" size={18} />
      });
    }

    if (progress.memories.length > 0) {
      const latest = progress.memories[0];
      recs.push({
        id: 'memory',
        title: `Recall: ${latest.topic}`,
        desc: `Let's use the ${latest.extractedVocab.length} new words from your recent study.`,
        prompt: `Vamos ter uma conversa usando o vocabulário e os conceitos do meu estudo sobre "${latest.topic}".`,
        icon: <Sparkles className="text-blue-500" size={18} />
      });
    }

    return recs;
  }, [progress]);

  const radarData = useMemo(() => {
    const grammarValues = Object.values(progress.grammarMastery) as number[];
    const grammarCount = Object.keys(progress.grammarMastery).length;
    const averageGrammar = grammarCount > 0 
      ? (grammarValues.reduce((a: number, b: number) => a + b, 0) / grammarCount) * 100 
      : 0;

    return [
      { subject: 'Grammar', A: averageGrammar, fullMark: 100 },
      { subject: 'Business', A: Math.min(100, progress.lessonsCompleted.filter(l => l.includes('Business') || l.includes('Strategic')).length * 35), fullMark: 100 },
      { subject: 'Social', A: Math.min(100, progress.lessonsCompleted.filter(l => l.includes('Social') || l.includes('Friends')).length * 35), fullMark: 100 },
      { subject: 'Vocab', A: Math.min(100, (progress.vocabulary.length / 50) * 100), fullMark: 100 },
      { subject: 'Accuracy', A: Math.max(0, 100 - (progress.correctionHistory.length * 5)), fullMark: 100 },
      { subject: 'Consistency', A: Math.min(100, (progress.streak / 30) * 100), fullMark: 100 },
    ];
  }, [progress]);

  const stats = [
    { label: 'Vocabulário', value: progress.vocabulary.length, icon: <Book className="text-blue-500" size={18} />, color: 'bg-blue-50' },
    { label: 'Tempo', value: `${progress.totalPracticeMinutes}m`, icon: <Zap className="text-yellow-500" size={18} />, color: 'bg-yellow-50' },
    { label: 'Sessões', value: progress.sessionCount, icon: <MessageCircle className="text-purple-500" size={18} />, color: 'bg-purple-50' },
    { label: 'Erros Salvos', value: progress.correctionHistory.length, icon: <AlertCircle className="text-orange-500" size={18} />, color: 'bg-orange-50' }
  ];

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
                  <span className="text-xs font-black text-emerald-500 tracking-[0.2em] uppercase">Flashcards Inteligentes</span>
                  <span className="text-sm font-bold text-white/40">
                    {currentCardIndex + 1} de {Math.max(1, studyDeck.length)}
                  </span>
                </div>
                <div className="w-7 h-7" />
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${studyDeck.length > 0 ? ((currentCardIndex + 1) / studyDeck.length) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {!sessionCompleted ? (
            <div className="w-full perspective-2000">
              {studyDeck.length > 0 ? (
                <>
                  <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[4/5] sm:aspect-[3/4] transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center space-y-8">
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {studyDeck[currentCardIndex]?.source}
                      </div>
                      <div className="bg-emerald-50 p-5 rounded-[2rem] text-emerald-600 shadow-inner"><Layers size={40} /></div>
                      <div className="relative group/word">
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-tight">{studyDeck[currentCardIndex]?.word}</h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); playPronunciation(e, studyDeck[currentCardIndex]?.word); }} 
                          className="absolute -right-14 top-1/2 -translate-y-1/2 p-3 bg-slate-100 text-slate-500 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                        >
                           {audioLoading ? <Loader2 size={22} className="animate-spin" /> : <Volume2 size={22} />}
                        </button>
                      </div>
                      <div className="pt-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Toque para revelar</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-600 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white space-y-8 overflow-hidden">
                      <div className="bg-white/20 p-5 rounded-[2rem] shadow-inner"><Star size={40} /></div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-black tracking-tight leading-tight">{studyDeck[currentCardIndex]?.meaning}</h3>
                        {studyDeck[currentCardIndex]?.explanation && (
                          <p className="text-emerald-100/60 font-medium italic text-xs max-w-[200px] mx-auto">
                            "{studyDeck[currentCardIndex].explanation}"
                          </p>
                        )}
                      </div>
                      <div className="pt-4">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Toque para voltar</span>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-12 flex gap-4 transition-all duration-500 px-4 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                    <button 
                      onClick={() => { setIsFlipped(false); setTimeout(() => currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true), 300); }} 
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border border-white/10 active:scale-95"
                    >
                      <RotateCcw size={18} /> Esqueci
                    </button>
                    <button 
                      onClick={() => { setIsFlipped(false); setTimeout(() => currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true), 300); }} 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30 transition-all active:scale-95"
                    >
                      <Check size={18} /> Lembrei!
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                   <p className="text-white font-bold">Nenhum item para revisar no momento!</p>
                   <button onClick={() => setIsStudyMode(false)} className="text-emerald-500 underline uppercase text-xs font-black tracking-widest">Voltar ao Painel</button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-10 animate-in zoom-in-95 duration-700 py-10">
              <div className="relative">
                <div className="w-40 h-40 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Trophy size={80} />
                </div>
                <div className="absolute inset-0 rounded-full animate-ping border-4 border-emerald-500/10 pointer-events-none"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white tracking-tight">Sessão Completa!</h3>
                <p className="text-slate-400 font-medium">Seu vocabulário e correções foram reforçados.</p>
              </div>
              <button onClick={() => { setIsStudyMode(false); setSessionCompleted(false); setCurrentCardIndex(0); }} className="w-full bg-white text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95">Voltar ao Painel</button>
            </div>
          )}
        </div>
        <style>{`.perspective-2000 { perspective: 2000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 overflow-y-auto h-full bg-slate-50 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Fala, Chandler!</h1>
            <span className="text-3xl animate-bounce">🇧🇷</span>
          </div>
          <p className="text-slate-500 font-bold tracking-tight">Difficulty: <span className="text-emerald-600 uppercase">{progress.difficulty}</span></p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Activity size={18} /></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível</span>
              <span className="text-sm font-black text-slate-800">{progress.level}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors"><TrendingUp size={18} /></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domínio</span>
              <span className="text-sm font-black text-slate-800">65%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <Target size={120} className="text-emerald-500" />
          </div>
          <div className="w-full flex items-center justify-between mb-8 relative z-10">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Skill Radar</h3>
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Layers size={20} /></div>
          </div>
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800, textAnchor: 'middle' }} />
                <Radar name="Chandler" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} animationBegin={300} animationDuration={1000} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl shadow-sm"><Lightbulb size={24} /></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Recomendações Inteligentes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-6 bg-slate-50 border border-slate-200/50 rounded-[2.5rem] hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex flex-col justify-between group shadow-sm">
                <div>
                  <div className="mb-4 p-3 bg-white w-fit rounded-2xl shadow-sm group-hover:scale-110 transition-transform">{rec.icon}</div>
                  <h4 className="font-black text-slate-800 text-lg mb-2 leading-tight">{rec.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">{rec.desc}</p>
                </div>
                <button 
                  onClick={() => onStartLesson && onStartLesson(rec.prompt)}
                  className="w-full py-4 bg-white text-emerald-600 text-xs font-black rounded-2xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] shadow-sm group-hover:shadow-lg active:scale-95"
                >
                  Iniciar Sessão <ChevronRight size={14} />
                </button>
              </div>
            ))}
            <div 
              onClick={() => setIsStudyMode(true)} 
              className="p-6 bg-orange-50 border border-orange-200/50 rounded-[2.5rem] hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col justify-center items-center text-center cursor-pointer group relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <div className="p-4 bg-white rounded-[2rem] shadow-sm mb-4 group-hover:scale-110 transition-transform">
                   <Layers className="text-orange-500" size={40} />
                 </div>
                 <h4 className="font-black text-slate-800 text-lg mb-1">Review Inteligente</h4>
                 <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Inclui Correções Recentes</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div className={`p-3 ${stat.color} rounded-[1.25rem] w-fit mb-5 group-hover:scale-110 transition-transform shadow-sm`}>{stat.icon}</div>
            <div>
              <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <Globe size={18} /> Pílula de Cultura
              </div>
              <h3 className="text-3xl font-black italic tracking-tight">"O jeitinho brasileiro"</h3>
              <p className="text-emerald-100/70 text-[15px] leading-relaxed font-medium">
                Adaptamos o contexto para seu nível <span className="text-emerald-400 font-black">{progress.difficulty}</span>. Vamos bater um papo?
              </p>
              <div className="pt-4">
                 <button 
                   onClick={() => onStartLesson && onStartLesson("Me conte mais sobre o 'jeitinho brasileiro' e como ele se aplica ao consultor de inovação em SP.")} 
                   className="bg-white/10 hover:bg-white text-emerald-400 hover:text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                 >
                   Discutir com Iwry <ChevronRight size={16} />
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between group">
           <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <Book size={18} className="text-blue-500" /> Palavra do Dia
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">Gambiarra</h3>
                <p className="text-slate-500 font-bold italic">Uma solução improvisada e genial.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner group-hover:bg-blue-50 transition-colors">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  "Essa solução no código é uma <span className="text-blue-600 font-black">gambiarra</span>, mas funciona perfeitamente!"
                </p>
              </div>
           </div>
           <button 
             onClick={() => onStartLesson && onStartLesson("Como posso usar a palavra 'Gambiarra' em uma reunião profissional sem parecer informal demais?")} 
             className="w-full mt-8 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
           >
              Aprender Uso Real
           </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Domínio Gramatical</h3>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shadow-sm"><Target size={20} /></div>
          </div>
          <div className="space-y-8 flex-1">
            {Object.entries(progress.grammarMastery).map(([name, value], idx) => {
              const mastery = Math.round((value as number) * 100);
              return (
                <div key={idx} className="space-y-3 group/gram">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover/gram:text-emerald-600 transition-colors">{name}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg shadow-sm ${mastery > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {mastery}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)] ${mastery > 60 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                      style={{ width: `${mastery}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
