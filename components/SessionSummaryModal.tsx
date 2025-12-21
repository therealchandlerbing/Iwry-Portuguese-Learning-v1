
import React from 'react';
import { SessionAnalysis } from '../types';
import { CheckCircle, ArrowRight, Sparkles, Star, TrendingUp, X } from 'lucide-react';

interface SessionSummaryModalProps {
  analysis: SessionAnalysis;
  onClose: () => void;
}

const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({ analysis, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        <div className="bg-emerald-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Mandou bem!</h2>
              <p className="text-emerald-100 font-medium opacity-90">Session Summary</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <Star size={12} className="text-yellow-500" /> Iwry's Feedback
            </div>
            <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
              "{analysis.summaryText}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={12} className="text-emerald-500" /> New Vocabulary
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.newVocab.length > 0 ? analysis.newVocab.map((v, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                    {v.word}
                  </span>
                )) : (
                  <span className="text-xs text-slate-400 italic">No new words this time.</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <TrendingUp size={12} className="text-blue-500" /> Next Step
              </div>
              <p className="text-xs text-slate-600 font-bold leading-tight">
                {analysis.nextStepRecommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10"
          >
            Go to Dashboard <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;
