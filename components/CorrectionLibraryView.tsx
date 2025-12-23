
import React, { useState, useEffect } from 'react';
import { CorrectionObject } from '../types';
import { History, ArrowRight, CheckCircle2, XCircle, Brain, Info, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from './Skeleton';

interface CorrectionLibraryViewProps {
  history: CorrectionObject[];
  onStartReview: (prompt: string) => void;
}

const ITEMS_PER_PAGE = 10;

const CorrectionLibraryView: React.FC<CorrectionLibraryViewProps> = ({ history, onStartReview }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset page when history changes
  useEffect(() => {
    setCurrentPage(1);
  }, [history.length]);

  const startCategoryReview = (category: string) => {
    onStartReview(`Quero praticar especificamente a categoria gramatical: "${category}". Use meus erros anteriores como exemplos.`);
  };

  // Fixed 'unknown' type error on line 89 by ensuring categories is typed as string[]
  const categories = Array.from(new Set(history.map(c => c.category))) as string[];

  // Pagination calculations
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
        <div className="p-6 sm:p-12 max-w-5xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4">
            <Skeleton className="w-20 h-20 mx-auto" variant="circular" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48" variant="rectangular" />
              ))}
            </div>
            <div className="space-y-8">
              <Skeleton className="h-64" variant="rectangular" />
              <Skeleton className="h-32" variant="rectangular" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
      <div className="p-6 sm:p-12 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <History size={40} aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Biblioteca de Correções</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">Suas falhas transformadas em ativos de aprendizado.</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] border border-dashed border-slate-200 text-center space-y-4">
            <Sparkles size={48} className="mx-auto text-slate-200" aria-hidden="true" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum erro registrado ainda!</p>
            <p className="text-xs text-slate-300">Comece a conversar e o Iwry irá salvar suas correções aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Erros Recentes</h3>
                <span className="text-xs text-slate-400">
                  Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, history.length)} de {history.length}
                </span>
              </div>
              <div className="space-y-4">
                {paginatedHistory.map((c) => (
                  <div key={c.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold">{c.timestamp.toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-50 text-red-500 rounded-xl mt-1"><XCircle size={18} aria-hidden="true" /></div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Você disse:</p>
                          <p className="text-slate-500 font-medium italic">"{c.incorrect}"</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl mt-1"><CheckCircle2 size={18} aria-hidden="true" /></div>
                        <div>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Forma correta:</p>
                          <p className="text-slate-800 font-black text-lg">"{c.corrected}"</p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                        <Info size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {c.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
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
            </div>

            <div className="space-y-8">
              <div className="bg-emerald-900 text-white p-8 rounded-[3rem] shadow-2xl space-y-6">
                <div className="p-4 bg-white/10 w-fit rounded-2xl"><Brain size={32} className="text-emerald-400" aria-hidden="true" /></div>
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
                      aria-label={`Start review for ${cat} category`}
                    >
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{cat}</span>
                      <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
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
