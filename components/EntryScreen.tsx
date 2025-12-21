
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface EntryScreenProps {
  onEnter: () => void;
}

const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-[9998] animate-in fade-in duration-700">
      <div className="max-w-sm w-full bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
        <div className="relative mb-8">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chandler" 
            alt="Chandler" 
            className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white">
            <span className="text-[10px] font-bold">BR</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo, Chandler</h2>
        <p className="text-slate-500 mb-10 text-sm leading-relaxed">
          Sua jornada para fluência continua. <br/>
          Iwry está pronto para praticar hoje.
        </p>

        <button 
          onClick={onEnter}
          className="group w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
        >
          Entrar no Iwry
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full border-2 border-white ${i === 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sessão Ativa</span>
        </div>
      </div>

      <p className="mt-12 text-slate-400 text-xs font-medium">
        Personal Brazilian Portuguese Companion v1.0
      </p>
    </div>
  );
};

export default EntryScreen;
