
import React, { useState } from 'react';
import { ChatSessionLog, Message, AppMode } from '../types';
import { 
  FileText, 
  ChevronRight, 
  Calendar, 
  Tag, 
  MessageCircle, 
  CheckCircle2, 
  X, 
  ArrowLeft,
  BookOpen,
  Smartphone,
  Mic,
  Clock
} from 'lucide-react';

interface LearningLogViewProps {
  logs: ChatSessionLog[];
}

const LearningLogView: React.FC<LearningLogViewProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<ChatSessionLog | null>(null);

  const getModeIcon = (mode: AppMode) => {
    switch (mode) {
      case AppMode.CHAT: return <MessageCircle size={14} />;
      case AppMode.TEXT_MODE: return <Smartphone size={14} />;
      case AppMode.LIVE_VOICE: return <Mic size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getModeLabel = (mode: AppMode) => {
    switch (mode) {
      case AppMode.CHAT: return 'Conversação';
      case AppMode.TEXT_MODE: return 'WhatsApp';
      case AppMode.LIVE_VOICE: return 'Voz';
      default: return 'Prática';
    }
  };

  if (selectedLog) {
    return (
      <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
        <div className="p-4 sm:p-6 bg-white border-b border-slate-200 flex items-center justify-between z-10">
          <button 
            onClick={() => setSelectedLog(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <div className="text-center">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Registro de Sessão</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{selectedLog.timestamp.toLocaleDateString()} {selectedLog.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
            {getModeIcon(selectedLog.mode)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 no-scrollbar">
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              <BookOpen size={12} /> Resumo do Iwry
            </div>
            <p className="text-sm text-emerald-900 font-medium italic leading-relaxed">
              "{selectedLog.summary}"
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Histórico da Conversa</h4>
            <div className="space-y-3">
              {selectedLog.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white' 
                      : msg.isCorrection 
                        ? 'bg-amber-50 border border-amber-100 text-amber-900' 
                        : 'bg-white border border-slate-200 text-slate-700'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32 no-scrollbar">
      <div className="p-6 sm:p-12 max-w-4xl mx-auto w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-slate-900/10">
            <FileText size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Learning Log</h2>
          <p className="text-slate-500 text-lg">Seu histórico de evolução arquivado.</p>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] border border-dashed border-slate-200 text-center space-y-4">
            <Clock size={48} className="mx-auto text-slate-200" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhuma sessão registrada.</p>
            <p className="text-xs text-slate-300">Complete uma conversa para salvar seu primeiro registro.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-center gap-4 group"
              >
                <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-2xl transition-all">
                  {getModeIcon(log.mode)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {log.timestamp.toLocaleDateString()}
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                        {log.difficulty}
                      </span>
                    </div>
                    {log.newVocabCount > 0 && (
                      <span className="text-[9px] font-black text-emerald-600 uppercase">
                        +{log.newVocabCount} Vocab
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate pr-4">
                    {log.summary.length > 60 ? log.summary.substring(0, 60) + '...' : log.summary}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}
        
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Armazenamos suas últimas 30 sessões localmente.
        </p>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default LearningLogView;
