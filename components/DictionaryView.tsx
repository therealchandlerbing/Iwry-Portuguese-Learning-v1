
import React, { useState } from 'react';
import { Search, Loader2, Volume2, Book, ArrowRight, Info, AlertCircle, Sparkles, Languages } from 'lucide-react';
import { getDictionaryDefinition, textToSpeech, decodeAudioData } from '../services/geminiService';
import { DictionaryEntry } from '../types';

const DictionaryView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await getDictionaryDefinition(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playPronunciation = async () => {
    if (!result || audioLoading) return;
    setAudioLoading(true);
    try {
      const audioBytes = await textToSpeech(result.word);
      if (audioBytes) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAudioLoading(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32 no-scrollbar animate-in fade-in duration-500">
      <div className="p-6 sm:p-12 max-w-4xl mx-auto w-full space-y-12">
        
        {/* Search Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
            <Languages size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dicionário Inglês-Português</h2>
          <p className="text-slate-500 font-medium">Find the perfect Brazilian Portuguese equivalent for any English word.</p>
          
          <form onSubmit={handleSearch} className="max-w-lg mx-auto relative group mt-8">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for an English word..."
              className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-5 pl-14 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-lg text-slate-700 shadow-sm group-hover:shadow-md"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-emerald-500 transition-colors" size={24} />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-3 rounded-full hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        {result && !loading && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            {/* Main Word Card */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{result.word}</h1>
                  <button 
                    onClick={playPronunciation}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-all group"
                  >
                    {audioLoading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} className="group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{result.category}</span>
                  {result.gender && <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{result.gender}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">English Source</p>
                <p className="text-2xl font-black text-emerald-600">{result.translation}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Meaning & Usage */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Sparkles size={14} className="text-emerald-500" /> Significado & Notas
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{result.meaning}</p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-500">
                    <Info size={14} className="mb-2 text-slate-400" />
                    {result.usageNotes}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Languages size={14} className="text-blue-500" /> Exemplos de Uso
                  </div>
                  <div className="space-y-3">
                    {result.examples.map((ex, i) => (
                      <p key={i} className="text-sm font-bold text-slate-600 leading-relaxed border-l-2 border-emerald-500 pl-4 py-1">
                        {ex}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conjugation & Irregularities */}
              <div className="space-y-8">
                {result.category.toLowerCase().includes('verb') && result.conjugation ? (
                  <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Conjugação: {result.tenseInfo || 'Presente'}
                      </div>
                      <Volume2 size={16} className="text-emerald-500" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eu</span>
                          <span className="font-bold text-emerald-400">{result.conjugation.eu}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Você / Tu</span>
                          <span className="font-bold text-emerald-400">{result.conjugation.tu_voce}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ele / Ela</span>
                          <span className="font-bold text-emerald-400">{result.conjugation.ele_ela}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nós</span>
                          <span className="font-bold text-emerald-400">{result.conjugation.nos}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eles / Vocês</span>
                          <span className="font-bold text-emerald-400">{result.conjugation.vcs_eles}</span>
                       </div>
                    </div>

                    {result.irregularities && (
                      <div className="pt-4 mt-4 border-t border-white/10 flex gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Irregularidades</p>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">{result.irregularities}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-100 p-12 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                     <Languages className="text-slate-300" size={48} />
                     <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Sem Conjugação</p>
                     <p className="text-xs text-slate-400 font-medium">Esta palavra não é um verbo conjugável.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryView;
