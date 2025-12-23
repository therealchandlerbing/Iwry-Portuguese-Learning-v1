
import React, { useState, useEffect } from 'react';
import { ChatSessionLog, Message, AppMode } from '../types';
import {
  FileText,
  ChevronRight,
  ChevronLeft,
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
import Skeleton from './Skeleton';

interface LearningLogViewProps {
  logs: ChatSessionLog[];
}

const ITEMS_PER_PAGE = 10;

const LearningLogView: React.FC<LearningLogViewProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<ChatSessionLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset page when logs change
  useEffect(() => {
    setCurrentPage(1);
  }, [logs.length]);

  const getModeIcon = (mode: AppMode) => {
    switch (mode) {
      case AppMode.CHAT: return <MessageCircle size={14} aria-hidden="true" />;
      case AppMode.TEXT_MODE: return <Smartphone size={14} aria-hidden="true" />;
      case AppMode.LIVE_VOICE: return <Mic size={14} aria-hidden="true" />;
      default: return <FileText size={14} aria-hidden="true" />;
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

  // Pagination calculations
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate page numbers to display (show max 5 pages)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftBound = Math.max(1, currentPage - 2);
      const rightBound = Math.min(totalPages, currentPage + 2);

      if (leftBound > 1) pages.push(1);
      if (leftBound > 2) pages.push(-1); // -1 represents ellipsis

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) pages.push(-2); // -2 represents ellipsis
      if (rightBound < totalPages) pages.push(totalPages);
    }

    return pages;
  };

  if (selectedLog) {
    return (
      <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
        <div className="p-4 sm:p-6 bg-white border-b border-slate-200 flex items-center justify-between z-10">
          <button
            onClick={() => setSelectedLog(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-black uppercase text-[10px] tracking-widest"
            aria-label="Go back to session list"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar
          </button>
          <div className="text-center">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Registro de Sessão</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{selectedLog.timestamp.toLocaleDateString()} {selectedLog.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400" aria-label={`Session type: ${getModeLabel(selectedLog.mode)}`}>
            {getModeIcon(selectedLog.mode)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 no-scrollbar">
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              <BookOpen size={12} aria-hidden="true" /> Resumo do Iwry
            </div>
            <p className="text-sm text-emerald-900 font-medium italic leading-relaxed">
              "{selectedLog.summary}"
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Histórico da Conversa</h4>
            <div className="space-y-3" role="log" aria-label="Conversation history">
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

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32 no-scrollbar">
        <div className="p-6 sm:p-12 max-w-4xl mx-auto w-full space-y-10">
          <div className="text-center space-y-4">
            <Skeleton className="w-16 h-16 mx-auto" variant="rectangular" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20" variant="rectangular" />
            ))}
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
            <FileText size={32} aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Learning Log</h2>
          <p className="text-slate-500 text-lg">Seu histórico de evolução arquivado.</p>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] border border-dashed border-slate-200 text-center space-y-4">
            <Clock size={48} className="mx-auto text-slate-200" aria-hidden="true" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhuma sessão registrada.</p>
            <p className="text-xs text-slate-300">Complete uma conversa para salvar seu primeiro registro.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-black uppercase tracking-widest text-slate-400">Sessões</span>
              <span className="text-xs text-slate-400">
                Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, logs.length)} de {logs.length}
              </span>
            </div>
            <div className="space-y-4">
              {paginatedLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-center gap-4 group"
                  aria-label={`View session from ${log.timestamp.toLocaleDateString()} - ${log.summary.substring(0, 50)}...`}
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
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination navigation">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>

                <div className="flex gap-1">
                  {getPageNumbers().map((page, idx) => (
                    page < 0 ? (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                          currentPage === page
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                  aria-label="Go to next page"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
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
