
import React, { useState } from 'react';
import { UserProgress, AppMode, VocabItem } from '../types';
import { RefreshCw, AlertTriangle, BookOpen, ChevronRight, Sparkles, Brain, Info, HelpCircle } from 'lucide-react';

interface ReviewSessionViewProps {
  progress: UserProgress;
  onStartReview: (prompt: string) => void;
}

const GRAMMAR_RULES: Record<string, string> = {
  'Present Tense': 'Regular verbs: -AR (falo), -ER (como), -IR (abro). Irregular favorites: Ser (sou), Estar (estou), Ir (vou).',
  'Future Tense': 'Commonly formed by Ir + Infinitive (Eu vou falar). The formal future ends in -rei (Falarei), but it is rarely heard in speech.',
  'Subjunctive': 'Expresses uncertainty or hope. Triggered by words like "que" or "se". Present: "Que você tenha sorte." Future: "Se eu tiver tempo."',
  'Prepositions': 'A (to), De (from/of), Em (in/on). Contract with articles: Em + A = Na, De + O = Do. Remember: "Vou ao banco" (I go to the bank).',
  'Pronouns': 'Brazilians use "Você" mostly. Object pronouns like "me/te/se" often shift placement in casual speech (Me ajuda!).'
};

const ReviewSessionView: React.FC<ReviewSessionViewProps> = ({ progress, onStartReview }) => {
  const [activeGrammarTip, setActiveGrammarTip] = useState<string | null>(null);

  const weakVocab = progress.vocabulary
    .filter(v => v.confidence < 60)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 6);

  const weakGrammar = Object.entries(progress.grammarMastery)
    .filter(([_, mastery]) => (mastery as number) < 0.5)
    .sort((a, b) => (a[1] as number) - (b[1] as number));

  const recentMemories = progress.memories.slice(0, 2);

  const handleSmartStart = () => {
    const vocabList = weakVocab.map(v => v.word).join(', ');
    const grammarList = weakGrammar.map(g => g[0]).join(' and ');
    const memoryContext = recentMemories.length > 0 
      ? `Also, let's incorporate my recent notes on "${recentMemories[0].topic}".`
      : '';

    const prompt = `I want to start a dedicated review session. Please help me practice these words I'm struggling with: ${vocabList}. Also, focus on my weak grammar areas: ${grammarList}. ${memoryContext}`;
    onStartReview(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
      <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-orange-500/10">
            <RefreshCw size={40} className="animate-spin-slow" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Review Center</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">Focused practice on what matters most for Chandler's fluency right now.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weak Vocab Section */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-orange-600">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-lg">Words to Reinforce</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {weakVocab.length > 0 ? weakVocab.map((v) => (
                <div key={v.word} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">{v.word}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{v.meaning}</p>
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-2">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${v.confidence}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="col-span-2 text-sm text-slate-400 italic">No weak words found! You're doing great.</p>
              )}
            </div>
          </div>

          {/* Grammar & Memories Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <Brain size={20} />
                <h3 className="font-bold text-lg">Grammar Gaps</h3>
              </div>
              <div className="space-y-4">
                {weakGrammar.map(([name, mastery]) => (
                  <div key={name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                        <button 
                          onClick={() => setActiveGrammarTip(activeGrammarTip === name ? null : name)}
                          className={`p-1 rounded-full transition-colors ${activeGrammarTip === name ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-emerald-500'}`}
                        >
                          <HelpCircle size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(mastery as number) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{Math.round((mastery as number) * 100)}%</span>
                      </div>
                    </div>
                    {activeGrammarTip === name && GRAMMAR_RULES[name] && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed italic animate-in slide-in-from-top-1 duration-200">
                        {GRAMMAR_RULES[name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <BookOpen size={20} />
                <h3 className="font-bold text-lg">Memory Recall</h3>
              </div>
              {recentMemories.length > 0 ? recentMemories.map((m) => (
                <div key={m.id} className="p-3 bg-blue-50/50 rounded-2xl flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{m.topic}</p>
                    <p className="text-[10px] text-slate-400">Imported {new Date(m.date).toLocaleDateString()}</p>
                  </div>
                  <Sparkles size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">No recent external memories to recall.</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleSmartStart}
            className="w-full bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20 group relative overflow-hidden flex flex-col items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-20 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-4 bg-white/10 rounded-2xl">
                <Sparkles size={32} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">Start Personalized Review</h3>
                <p className="text-slate-400 text-sm mt-1">Iwry will tailor a conversation focusing on your specific weak points.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs">
                Launch Session <ChevronRight size={16} />
              </div>
            </div>
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium">
            Review sessions adapt in real-time based on your latest mistakes and imports.
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ReviewSessionView;
