
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { Loader2, CheckCircle2, XCircle, ChevronRight, Trophy, Sparkles } from 'lucide-react';

interface QuizViewProps {
  topic: { title: string; description: string };
  onComplete: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ topic, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const data = await generateQuiz(topic.title, topic.description);
      setQuestions(data);
      setLoading(false);
    };
    fetchQuiz();
  }, [topic]);

  const handleOptionSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (idx === questions[currentIndex].answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-50">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="text-emerald-600" size={40} />
          </div>
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-spin border-t-emerald-500"></div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Gerando Desafio...</h2>
          <p className="text-slate-500 italic max-w-xs mx-auto">Iwry está preparando perguntas exclusivas sobre "{topic.title}" para você.</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 text-center animate-in zoom-in-95 duration-500">
        <div className="w-40 h-40 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner mb-8 rotate-3">
          <Trophy size={80} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Muito Bem!</h2>
        <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">
          Você acertou <span className="text-emerald-600 font-bold">{score} de {questions.length}</span> questões sobre {topic.title}.
        </p>
        <button
          onClick={onComplete}
          className="w-full max-w-xs bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
        >
          Finalizar Desafio
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
      <div className="p-6 sm:p-12 max-w-3xl mx-auto w-full space-y-8">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Conhecimento: {topic.title}</h3>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                    i < currentIndex ? 'bg-emerald-500' : i === currentIndex ? 'bg-emerald-400 animate-pulse' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-sm font-bold text-slate-400">{currentIndex + 1} / {questions.length}</span>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQ.answer === idx;
              
              let variantStyle = "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100";
              if (showResult) {
                if (isCorrect) variantStyle = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20";
                else if (isSelected) variantStyle = "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20";
                else variantStyle = "opacity-40 grayscale pointer-events-none";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between group ${variantStyle}`}
                  disabled={showResult}
                >
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 size={24} className="shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={24} className="shrink-0" />}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-6 pt-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Explicação do Iwry</p>
                <p className="text-slate-600 leading-relaxed italic">{currentQ.explanation}</p>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/10"
              >
                Próxima Pergunta <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
