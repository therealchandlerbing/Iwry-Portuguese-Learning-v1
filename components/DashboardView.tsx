
import React, { useState, useMemo } from 'react';
import { UserProgress, AppMode, VocabItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Trophy, Zap, Book, Star, PlusCircle, MessageCircle, 
  TrendingUp, Target, Layers, RotateCcw, Check, X, ChevronRight, Sparkles, Volume2, Loader2, Lightbulb, Activity, Globe
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

  // Active Recall Deck: Focus on low confidence words
  const studyDeck = useMemo(() => {
    return [...progress.vocabulary]
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 10);
  }, [progress.vocabulary]);

  // Adaptive Recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    const lowestGrammar = Object.entries(progress.grammarMastery)
      .sort((a, b) => (a[1] as number) - (b[1] as number))[0];
    
    if (lowestGrammar && (lowestGrammar[1] as number) < 0.7) {
      recs.push({
        id: 'grammar',
        title: `Drill: ${lowestGrammar[0]}`,
        desc: `You're at ${Math.round((lowestGrammar[1] as number) * 100)}% mastery. Let's tighten this up with a roleplay.`,
        prompt: `Quero praticar especificamente ${lowestGrammar[0]}. Pode me dar alguns exemplos práticos e depois fazer um roleplay?`,
        icon: <Target className="text-emerald-500" size={18} />
      });
    }

    if (progress.memories.length > 0) {
      const latest = progress.memories[0];
      recs.push({
        id: 'memory',
        title: `Recall: ${latest.topic}`,
        desc: `Let's use the ${latest.extractedVocab.length} new words from your recent study in conversation.`,
        prompt: `Vamos ter uma conversa usando o vocabulário e os conceitos do meu estudo sobre "${latest.topic}".`,
        icon: <Sparkles className="text-blue-500" size={18} />
      });
    }

    if (progress.sessionCount < 30) {
      recs.push({
        id: 'casual',
        title: 'Meeting the Team',
        desc: 'New in SP? Let\'s practice the first 5 minutes of an office interaction.',
        prompt: 'Vamos praticar os primeiros 5 minutos de conversa quando chegamos no escritório em São Paulo.',
        icon: <MessageCircle className="text-purple-500" size={18} />
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
      { subject: 'Regional', A: Math.min(100, progress.lessonsCompleted.filter(l => l.includes('Rio') || l.includes('SP') || l.includes('Regional')).length * 35), fullMark: 100 },
      { subject: 'Consistency', A: Math.min(100, (progress.streak / 30) * 100), fullMark: 100 },
    ];
  }, [progress]);

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
                <button onClick={() => setIsStudyMode(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">
                  {currentCardIndex + 1} / {studyDeck.length}
                </span>
                <div className="w-6 h-6" />
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentCardIndex + 1) / studyDeck.length) * 100}%` }} />
              </div>
            </div>
          )}

          {!sessionCompleted ? (
            <div className="w-full perspective-1000">
              <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[3/4] transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-10 text-center space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600"><Layers size={32} /></div>
                  <div className="relative group/word">
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight">{studyDeck[currentCardIndex]?.word}</h3>
                    <button onClick={(e) => { e.stopPropagation(); playPronunciation(e, studyDeck[currentCardIndex]?.word); }} className="absolute -right-12 top-1/2 -translate-y-1/2 p-2.5 bg-slate-100 text-slate-500 rounded-full shadow-sm hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                       {audioLoading ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toque para revelar</span>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-600 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-10 text-center text-white space-y-6">
                  <div className="bg-white/20 p-4 rounded-3xl"><Star size={32} /></div>
                  <h3 className="text-3xl font-bold">{studyDeck[currentCardIndex]?.meaning}</h3>
                  <p className="text-emerald-100/80 text-sm">"Não esqueça mais essa, Chandler!"</p>
                </div>
              </div>
              <div className={`mt-10 flex gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button onClick={() => { setIsFlipped(false); currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true); }} className="flex-1 bg-white border border-slate-200 text-slate-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><RotateCcw size={18} /> Esqueci</button>
                <button onClick={() => { setIsFlipped(false); currentCardIndex < studyDeck.length - 1 ? setCurrentCardIndex(c => c + 1) : setSessionCompleted(true); }} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"><Check size={18} /> Lembrei!</button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in-95">
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Trophy size={64} /></div>
              <h3 className="text-3xl font-black text-slate-800">Sessão Completa!</h3>
              <p className="text-slate-500">Seu cérebro agradece. Vocabulário atualizado.</p>
              <button onClick={() => { setIsStudyMode(false); setSessionCompleted(false); setCurrentCardIndex(0); }} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg">Voltar ao Painel</button>
            </div>
          )}
        </div>
        <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
      </div>
    );
  }

  const playPronunciation = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
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

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-y-auto h-full bg-slate-50 pb-28">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            E aí, Chandler! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Ready for your daily Portuguese push?</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">Level: {progress.level}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-slate-700">Mastery: 65%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800">Skill Overview</h3>
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={18} /></div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <Radar name="Chandler" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Lightbulb size={18} /></div>
            <h3 className="text-lg font-bold text-slate-800">Adaptive Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-emerald-200 transition-all flex flex-col justify-between group">
                <div>
                  <div className="mb-3">{rec.icon}</div>
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">{rec.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{rec.desc}</p>
                </div>
                <button 
                  onClick={() => onStartLesson && onStartLesson(rec.prompt)}
                  className="w-full py-3 bg-white text-emerald-600 text-xs font-black rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Start Session <ChevronRight size={14} />
                </button>
              </div>
            ))}
            <div onClick={() => setIsStudyMode(true)} className="p-6 bg-orange-50 border border-orange-100 rounded-[2rem] hover:border-orange-200 transition-all flex flex-col justify-center items-center text-center cursor-pointer group">
               <Layers className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
               <h4 className="font-bold text-slate-800 mb-1">Quick Vocabulary</h4>
               <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">10 Card Sprint</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="p-2.5 bg-slate-50 rounded-xl w-fit mb-4">{stat.icon}</div>
            <div>
              <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-[10px]">
                <Globe size={14} /> Culture Snippet
              </div>
              <h3 className="text-2xl font-bold italic">"O jeitinho brasileiro"</h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                Not just for bending rules, it's about creativity and warmth in problem-solving. In SP business, it's the bridge that builds trust before a contract.
              </p>
              <div className="pt-2">
                 <button onClick={() => onStartLesson && onStartLesson("Tell me more about 'O jeitinho brasileiro' and how it applies to innovation consulting in SP.")} className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 hover:text-white transition-colors">
                   Discuss with Iwry <ChevronRight size={14} />
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                <Book size={14} className="text-blue-500" /> Word of the Day
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">Gambiarrra</h3>
                <p className="text-slate-500 text-sm italic mt-1">A clever, improvised solution.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed">
                  "Essa solução no código é uma gambiarra, mas funciona por enquanto!"
                </p>
              </div>
           </div>
           <button onClick={() => onStartLesson && onStartLesson("How can I use the word 'Gambiarra' in a professional meeting without sounding too informal?")} className="w-full mt-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Learn Usage
           </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Grammar Focus</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Target size={18} /></div>
          </div>
          <div className="space-y-6">
            {Object.entries(progress.grammarMastery).map(([name, value], idx) => {
              const mastery = Math.round((value as number) * 100);
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">{name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${mastery > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {mastery}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${mastery > 60 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
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
