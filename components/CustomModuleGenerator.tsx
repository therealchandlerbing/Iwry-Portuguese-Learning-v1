
import React, { useState } from 'react';
import { Sparkles, Loader2, X, GraduationCap, Briefcase, Globe, Users, Plane, BookOpen, Coffee, MapPin, ChevronRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { generateCustomModule } from '../services/geminiService';
import { LessonModule } from '../types';

interface CustomModuleGeneratorProps {
  onSave: (mod: LessonModule) => void;
  onClose: () => void;
}

const BRAZILIAN_LOADING_MESSAGES = [
  "Preparando os cafezinhos para o Iwry pensar...",
  "Desenhando o plano de aula no jeitinho brasileiro...",
  "Consultando os mestres da Av. Paulista...",
  "Pegando as melhores gírias cariocas...",
  "Sua jornada personalizada está quase pronta!"
];

const CustomModuleGenerator: React.FC<CustomModuleGeneratorProps> = ({ onSave, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [preview, setPreview] = useState<LessonModule | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Briefcase': return <Briefcase size={20} />;
      case 'Globe': return <Globe size={20} />;
      case 'GraduationCap': return <GraduationCap size={20} />;
      case 'Users': return <Users size={20} />;
      case 'Plane': return <Plane size={20} />;
      case 'BookOpen': return <BookOpen size={20} />;
      case 'Coffee': return <Coffee size={20} />;
      case 'MapPin': return <MapPin size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    
    // Interval for loading messages
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % BRAZILIAN_LOADING_MESSAGES.length);
    }, 3000);

    try {
      const mod = await generateCustomModule(prompt);
      setPreview(mod);
    } catch (err) {
      console.error(err);
      alert("Ops! Houve um erro ao gerar sua aula. Tente ser mais específico.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
               <Sparkles size={24} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">Lesson Studio</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Module Generator</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!preview && !loading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">O que você quer aprender?</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Português para uma viagem de degustação de vinhos no sul, ou Termos técnicos para uma reunião de TI em SP..."
                  className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 resize-none"
                />
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                <GraduationCap className="text-blue-500 shrink-0" size={24} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Dica do Iwry:</strong> Quanto mais detalhes você der (quem são os participantes, onde será a conversa, qual seu objetivo), melhor será a aula!
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center text-center space-y-6">
               <div className="relative">
                 <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="text-emerald-500 animate-pulse" size={32} />
                 </div>
               </div>
               <div className="space-y-2 animate-in fade-in duration-500">
                 <h4 className="text-xl font-black text-slate-800">Criando sua Jornada</h4>
                 <p className="text-slate-400 font-medium italic">"{BRAZILIAN_LOADING_MESSAGES[loadingMsgIdx]}"</p>
               </div>
            </div>
          ) : preview ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                      {getIcon(preview.icon)}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight">{preview.title}</h4>
                      <p className="text-xs font-bold text-slate-400">{preview.description}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Estrutura da Aula</p>
                    {preview.submodules.map((sub, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                         <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</div>
                         <div>
                            <p className="font-black text-slate-800 text-sm leading-tight">{sub.title}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                               {sub.milestones?.map((m, mIdx) => (
                                 <span key={mIdx} className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full font-bold">✓ {m}</span>
                               ))}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
           {!preview ? (
             <button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50"
             >
               {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
               Gerar Módulo Customizado
             </button>
           ) : (
             <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setPreview(null)}
                className="py-5 border-2 border-slate-200 text-slate-400 rounded-2xl font-black text-lg hover:bg-white transition-all active:scale-95"
               >
                 Tentar de Novo
               </button>
               <button 
                onClick={() => {
                  onSave(preview);
                  onClose();
                }}
                className="bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
               >
                 Salvar e Praticar
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CustomModuleGenerator;
