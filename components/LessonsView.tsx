
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Briefcase, Globe, Users, Plane, GraduationCap, Info, Target, CheckCircle2, ClipboardCheck, Coffee, MapPin, Sparkles, Plus, Trophy, Brain, Flag } from 'lucide-react';
import { LessonModule, LessonSubModule } from '../types';
import CustomModuleGenerator from './CustomModuleGenerator';

const ROADMAP_MODULES: (LessonModule & { levelBench: string })[] = [
  {
    id: 'a1_foundation',
    levelBench: 'A1 - Beginner',
    title: 'A1: The Foundation',
    icon: 'Flag',
    description: 'Basic survival Portuguese for daily interactions.',
    submodules: [
      { 
        id: 'a1_1', 
        title: 'Meeting People', 
        description: 'Introducing yourself and common greetings.', 
        prompt: 'Let\'s practice a basic introduction. Tell me your name and where you are from in Portuguese.',
        grammarExplanation: 'Use "Sou" for permanent traits and "Estou" for temporary states.'
      },
      { 
        id: 'a1_2', 
        title: 'The Bakery (Padaria)', 
        description: 'Ordering coffee and snacks like a local.', 
        prompt: 'You are at a Padaria. Order a pão de queijo and a cafezinho.',
        grammarExplanation: 'Use "Por favor" and "Queria" to be polite.'
      }
    ]
  },
  {
    id: 'a2_survival',
    levelBench: 'A2 - Elementary',
    title: 'A2: Daily Fluency',
    icon: 'Coffee',
    description: 'Handling routine tasks and describing experiences.',
    submodules: [
      { 
        id: 'a2_1', 
        title: 'Asking for Directions', 
        description: 'Navigating the streets of São Paulo.', 
        prompt: 'Ask me for directions to the MASP museum or the nearest Metro.',
        grammarExplanation: 'Learn to use "Onde fica...?" and "Como eu chego...?"'
      }
    ]
  },
  {
    id: 'b1_intermediate',
    levelBench: 'B1 - Intermediate',
    title: 'B1: Working in Brazil',
    icon: 'Briefcase',
    description: 'Communicating professionally and handling abstract topics.',
    submodules: [
      { 
        id: 'b1_1', 
        title: 'Office Small Talk', 
        description: 'Building relationships with coworkers.', 
        prompt: 'Start a conversation with a colleague about the weekend.',
        grammarExplanation: 'Master the "Pretérito Imperfeito" for past habits.'
      }
    ]
  },
  {
    id: 'b2_professional',
    levelBench: 'B2 - Upper Intermediate',
    title: 'B2: Strategic Consultant',
    icon: 'Sparkles',
    description: 'Mastering the "Jeitinho" and corporate culture.',
    submodules: [
      { 
        id: 'b2_1', 
        title: 'Feedback Sessions', 
        description: 'Giving constructive feedback in a Brazilian way.', 
        prompt: 'I am your direct report. Give me feedback on my performance.',
        grammarExplanation: 'Use diminutives and the subjunctive to soften feedback.'
      }
    ]
  }
];

interface LessonsViewProps {
  customModules: LessonModule[];
  onSaveCustomModule: (mod: LessonModule) => void;
  onStartLesson: (prompt: string, customMode?: any, submoduleId?: string) => void;
  onStartQuiz: (title: string, description: string, questions?: any[]) => void;
  selectedTopics: string[];
  onToggleTopic: (topicId: string) => void;
  lessonsCompleted: string[];
}

const LessonsView: React.FC<LessonsViewProps> = ({ customModules, onSaveCustomModule, onStartLesson, onStartQuiz, selectedTopics, onToggleTopic, lessonsCompleted }) => {
  const [selectedModule, setSelectedModule] = useState<LessonModule | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const modules = [...customModules, ...ROADMAP_MODULES];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Briefcase': return <Briefcase size={24} />;
      case 'Globe': return <Globe size={24} />;
      case 'GraduationCap': return <GraduationCap size={24} />;
      case 'Flag': return <Flag size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      case 'Coffee': return <Coffee size={24} />;
      default: return <BookOpen size={24} />;
    }
  };

  if (selectedModule) {
    return (
      <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
        <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
          <button 
            onClick={() => setSelectedModule(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft size={20} />
            Voltar para o Roteiro
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 ${selectedModule.isCustom ? 'bg-slate-900' : 'bg-emerald-600'} text-white rounded-2xl shadow-lg`}>
              {getIcon(selectedModule.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedModule.title}</h2>
              </div>
              <p className="text-slate-500 font-medium">{selectedModule.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {selectedModule.submodules.map((sub) => {
              const isTargeted = selectedTopics.includes(sub.id);
              const isCompleted = lessonsCompleted.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  className={`group p-6 bg-white border rounded-[2.5rem] text-left transition-all flex flex-col justify-between ${
                    isCompleted && isTargeted
                      ? 'border-emerald-500 bg-emerald-50/30 shadow-xl shadow-emerald-500/5'
                      : isCompleted
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : isTargeted
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/5'
                      : 'border-slate-100 hover:border-emerald-300'
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg text-slate-800 group-hover:text-emerald-600 leading-tight">{sub.title}</h3>
                        {isCompleted && (
                          <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                            Concluído
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onToggleTopic(sub.id)}
                        className={`p-2 rounded-xl transition-all ${
                          isTargeted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                        }`}
                      >
                        {isTargeted ? <CheckCircle2 size={18} /> : <Target size={18} />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{sub.description}</p>
                    {sub.grammarExplanation && (
                      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Dica Gramatical</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic">{sub.grammarExplanation}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onStartLesson(sub.prompt, undefined, sub.id)}
                      className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 group-hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {isCompleted ? 'Praticar Novamente' : 'Praticar Chat'} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32 no-scrollbar">
      {isGeneratorOpen && <CustomModuleGenerator onSave={onSaveCustomModule} onClose={() => setIsGeneratorOpen(false)} />}
      
      <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Flag size={24} className="text-emerald-500" />
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Roteiro de Fluência</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">Siga o caminho estruturado dos níveis A1 ao B2.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {ROADMAP_MODULES.map((mod, idx) => (
            <div key={mod.id} className="relative">
              {idx < ROADMAP_MODULES.length - 1 && (
                <div className="absolute left-10 top-20 bottom-0 w-1 bg-slate-200 -z-10" />
              )}
              <div className="flex items-start gap-8">
                <div className="w-20 h-20 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center shadow-sm shrink-0 relative z-10">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">{getIcon(mod.icon)}</div>
                </div>
                <button
                  onClick={() => setSelectedModule(mod)}
                  className="flex-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all text-left hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{mod.levelBench}</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{mod.title}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{mod.description}</p>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Studio */}
        <div className="mt-12 bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full -mr-40 -mt-40 opacity-[0.08] group-hover:scale-125 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight leading-none flex items-center gap-3">
                  <Sparkles className="text-emerald-500" /> Lesson Studio
                </h3>
                <p className="text-slate-400 font-medium max-w-md">Crie aulas personalizadas sobre qualquer tema específico com IA.</p>
              </div>
              <button 
                onClick={() => setIsGeneratorOpen(true)}
                className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 shadow-xl active:scale-95"
              >
                Criar Aula Customizada
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsView;
