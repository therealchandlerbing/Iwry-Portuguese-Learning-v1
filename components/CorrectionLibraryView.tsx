
import React from 'react';
import { CorrectionObject } from '../types';
import { History, ArrowRight, CheckCircle2, XCircle, Brain, Info, Sparkles } from 'lucide-react';

interface CorrectionLibraryViewProps {
  history: CorrectionObject[];
  onStartReview: (prompt: string) => void;
}

const CorrectionLibraryView: React.FC<CorrectionLibraryViewProps> = ({ history, onStartReview }) => {
  const startCategoryReview = (category: string) => {
    onStartReview(`Quero praticar especificamente a categoria gramatical: "${category}". Use meus erros anteriores como exemplos.`);
  };

  const categories = Array.from(new Set(history.map(c => c.category)));

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
      <div className="p-6 sm:p-12 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <History size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Biblioteca de Correções</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">Suas falhas transformadas em ativos de aprendizado.</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] border border-dashed border-slate-200 text-center space-y-4">
            <Sparkles size={48} className="mx-auto text-slate-200" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum erro registrado ainda!</p>
            <p className="text-xs text-slate-300">Comece a conversar e o Iwry irá salvar suas correções aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">Erros Recentes</h3>
              <div className="space-y-4">
                {history.map((c) => (
                  <div key={c.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold">{c.timestamp.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-50 text-red-500 rounded-xl mt-1"><XCircle size={18} /></div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Você disse:</p>
                          <p className="text-slate-500 font-medium italic">"{c.incorrect}"</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl mt-1"><CheckCircle2 size={18} /></div>
                        <div>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Forma correta:</p>
                          <p className="text-slate-800 font-black text-lg">"{c.corrected}"</p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                        <Info size={16} className="shrink-0 text-slate-400" />
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {c.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-emerald-900 text-white p-8 rounded-[3rem] shadow-2xl space-y-6">
                <div className="p-4 bg-white/10 w-fit rounded-2xl"><Brain size={32} className="text-emerald-400" /></div>
                <h3 className="text-2xl font-black tracking-tight">Smart Review</h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed font-medium">
                  Pratique as categorias onde você mais erra para atingir a fluência real.
                </p>
                <div className="space-y-3 pt-4">
                  {categories.slice(0, 5).map(cat => (
                    <button
                      key={cat}
                      onClick={() => startCategoryReview(cat)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                    >
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{cat}</span>
                      <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Ativos</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{history.length}</p>
                <p className="text-xs text-slate-500 font-medium">Pontos de melhoria identificados.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrectionLibraryView;
