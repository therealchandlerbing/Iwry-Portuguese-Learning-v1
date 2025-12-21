
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[9999]">
      <div className="relative">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/20 animate-pulse transition-transform duration-1000">
          F
        </div>
        <div className="absolute -inset-4 border-2 border-emerald-500/20 rounded-[2.5rem] animate-ping duration-[3000ms]"></div>
      </div>
      
      <div className="mt-12 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Fala Comigo</h1>
        <div className="mt-4 flex items-center gap-1.5 justify-center">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Iniciando Iwry...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
