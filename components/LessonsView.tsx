
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Briefcase, Globe, Users, Plane, GraduationCap, Info, Target, CheckCircle2, ClipboardCheck, Coffee, MapPin, Sparkles, Plus, Trophy, Brain } from 'lucide-react';
import { LessonModule, LessonSubModule } from '../types';
import CustomModuleGenerator from './CustomModuleGenerator';

const STATIC_MODULES: LessonModule[] = [
  {
    id: 'professional',
    title: 'Professional Excellence',
    icon: 'Briefcase',
    description: 'Master innovation consulting and business etiquette in SP.',
    submodules: [
      { 
        id: 'p1', 
        title: 'Strategic Presentations', 
        description: 'Pitching complex ideas to Brazilian stakeholders.', 
        prompt: 'Let\'s practice a strategic presentation. I am a Brazilian partner, and you are pitching a new innovation framework. Start by greeting me formally.',
        grammarExplanation: 'In professional SP, use "Você" rather than "Tu". When presenting, use the Future Tense (ir + infinitive) like "Nós vamos implementar..." for a proactive tone.'
      },
      { 
        id: 'p2', 
        title: 'Networking with Partners', 
        description: 'Small talk that builds real trust in a professional setting.', 
        prompt: 'We are at a business coffee in Faria Lima. Let\'s practice professional networking. How do you start the conversation?',
        grammarExplanation: 'Brazilians often use "Pois não?" to be helpful or "Fique à vontade" to make you comfortable. Use "Gostaria de..." (Conditional) to express wishes politely.'
      },
      { 
        id: 'p3', 
        title: 'Feedback & Reviews', 
        description: 'The Brazilian way of giving "feedback construtivo".', 
        prompt: 'I am your colleague and I just finished a project. Give me constructive feedback in a warm but professional Brazilian way.',
        grammarExplanation: 'Diminutives like "probleminha" soften feedback. Use "Acho que..." followed by the Subjunctive to sound less aggressive: "Acho que seja melhor..."'
      },
      { 
        id: 'p4', 
        title: 'Difficult Negotiations', 
        description: 'Handling pushback and finding common ground.', 
        prompt: 'We are negotiating a deadline. I am pushing for sooner, you need more time. Let\'s find a middle ground in Portuguese.',
        grammarExplanation: 'Use the "Imperfeito do Indicativo" for politeness: "Eu queria (not quero) pedir um prazo maior." It sounds like "I was wondering if I could ask..."'
      }
    ]
  },
  {
    id: 'survival',
    title: 'Daily Life & Survival',
    icon: 'Coffee',
    description: 'Essential survival skills for navigating Brazil effortlessly.',
    submodules: [
      { 
        id: 'd1', 
        title: 'Ordering at a Padaria', 
        description: 'The art of the Brazilian bakery: from pão de queijo to pingado.', 
        prompt: 'I am the atendente at a traditional padaria in SP. Practice ordering a "média" and a "pão na chapa".',
        grammarExplanation: 'Say "Eu vou querer..." or "Me vê um..." for a natural local feel. "Capi" is short for Capuccino in some places, but "Pingado" is the classic coffee with milk.'
      },
      { 
        id: 'd2', 
        title: 'Asking for Directions', 
        description: 'Finding your way around the city without a GPS.', 
        prompt: 'You are lost in Avenida Paulista. Ask me for directions to the nearest Metro station or the MASP museum.',
        grammarExplanation: 'Use "Como eu chego em...?" or "Onde fica...?". Brazilians often give directions using "Virar" (to turn) and "Seguir reto" (go straight).'
      },
      { 
        id: 'd3', 
        title: 'Public Transport', 
        description: 'Navigating the Metro, CPTM, and "Busão" like a local.', 
        prompt: 'Scenario: You are at the ticket office of a Metro station. Ask how to get to a specific destination and which line to take.',
        grammarExplanation: 'Use the preposition "De" for transport: "Vou de metrô", "Vou de ônibus". "Baldeação" is the word for transferring between lines.'
      },
      { 
        id: 'd4', 
        title: 'At the Pharmacy', 
        description: 'Describing basic health needs and symptoms.', 
        prompt: 'You have a headache and need some medicine. Go to a Brazilian farmácia and explain your symptoms to the pharmacist.',
        grammarExplanation: 'The verb "Ter" is used for symptoms: "Tô com dor de cabeça" (I have a headache). Use "Estou sentindo..." for feelings.'
      }
    ]
  },
  {
    id: 'regional',
    title: 'Regional Flavors',
    icon: 'Globe',
    description: 'Navigate the nuances between Rio and São Paulo.',
    submodules: [
      { 
        id: 'r1', 
        title: 'Rio: Beach to Boardroom', 
        description: 'Understanding the Carioca pace and informal professional blend.', 
        prompt: 'Scenario: Meeting a Carioca client near Ipanema. Practice the shift from informal chat to business.',
        grammarExplanation: 'Cariocas use "Tu" often, usually with the 3rd person conjugation (Tu fala). Use "Cara" and "Mermão" as casual fillers between points.'
      },
      { 
        id: 'r2', 
        title: 'SP: Business Speed', 
        description: 'The fast-paced, direct style of the Paulistano corporate world.', 
        prompt: 'Scenario: A quick, efficient 15-minute sync in a São Paulo office. Be direct but polite.',
        grammarExplanation: 'Paulistanos love the word "Meu". In SP, "Você" is almost universal. Grammar is usually more aligned with formal standards in writing but fast in speech.'
      },
      { 
        id: 'r3', 
        title: 'Decoding Regional Slang', 
        description: 'When to use "uai", "bah", "meu", or "mermão".', 
        prompt: 'Teach me about regional slang today. Start by explaining the difference between SP "meu" and Rio "cara".',
        grammarExplanation: 'Slang often functions as punctuation. "Bah" (RS) expresses surprise, while "Uai" (MG) is for hesitation or emphasis at the end of a thought.'
      },
      { 
        id: 'r4', 
        title: 'National Identity', 
        description: 'Cultural touchstones that every Brazilian knows.', 
        prompt: 'Let\'s talk about Brazilian cultural icons today. Who are some figures Chandler should know for social contexts?',
        grammarExplanation: 'Reference "Jeitinho Brasileiro" using the personal infinitive: "Para nós resolvermos isso..." rather than a standard infinitive.'
      }
    ]
  },
  {
    id: 'grammar',
    title: 'Functional Grammar',
    icon: 'GraduationCap',
    description: 'Grammar that actually helps you communicate better.',
    submodules: [
      { 
        id: 'g1', 
        title: 'The Subjunctive Mood', 
        description: 'Mastering "If I were..." and "When I have...".', 
        prompt: 'Let\'s drill the subjunctive. Give me scenarios where I have to express doubt, wishes, or possibilities.',
        grammarExplanation: 'Present Subjunctive: used after "que" when expressing feelings. Ex: "Espero que você tenha (not tem) sucesso." It reflects subjective reality.'
      },
      { 
        id: 'g2', 
        title: 'Future Scenarios', 
        description: 'Talking about project goals and personal plans.', 
        prompt: 'Practice the future tense. Tell me about your goals for the next 6 months in innovation consulting.',
        grammarExplanation: 'The Future Subjunctive is vital for "if/when" future conditions: "Se eu tiver (not tenho) tempo, eu vou." Note: Tiver comes from Ter.'
      },
      { 
        id: 'g3', 
        title: 'Pronouns in Speech', 
        description: 'Using object pronouns like a native, not a textbook.', 
        prompt: 'Let\'s practice using "lo", "la", and "lhe" naturally, or when to just drop them like Brazilians do.',
        grammarExplanation: 'In speech, Brazilians often skip direct objects: "Eu vi (ele)" instead of "Eu o vi". "Lhe" is replaced by "para você" in most casual SP/Rio contexts.'
      },
      { 
        id: 'g4', 
        title: 'Prepositions & Contractions', 
        description: 'Never trip over "no", "na", "ao", or "pelo" again.', 
        prompt: 'Give me a quiz on prepositions and contractions in the context of describing a city.',
        grammarExplanation: 'A + O = AO. EM + A = NA. DE + O = DO. Movement to a place: use "A" (Vou à praia) for short visits and "Para" (Vou para casa) for staying longer.'
      }
    ]
  }
];

interface LessonsViewProps {
  customModules: LessonModule[];
  onSaveCustomModule: (mod: LessonModule) => void;
  onStartLesson: (prompt: string) => void;
  onStartQuiz: (title: string, description: string, questions?: any[]) => void;
  selectedTopics: string[];
  onToggleTopic: (topicId: string) => void;
}

const LessonsView: React.FC<LessonsViewProps> = ({ customModules, onSaveCustomModule, onStartLesson, onStartQuiz, selectedTopics, onToggleTopic }) => {
  const [selectedModule, setSelectedModule] = useState<LessonModule | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const modules = [...customModules, ...STATIC_MODULES];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Briefcase': return <Briefcase size={24} />;
      case 'Globe': return <Globe size={24} />;
      case 'GraduationCap': return <GraduationCap size={24} />;
      case 'Users': return <Users size={24} />;
      case 'Plane': return <Plane size={24} />;
      case 'BookOpen': return <BookOpen size={24} />;
      case 'Coffee': return <Coffee size={24} />;
      case 'MapPin': return <MapPin size={24} />;
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
            Back to Modules
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 ${selectedModule.isCustom ? 'bg-slate-900' : 'bg-emerald-600'} text-white rounded-2xl shadow-lg`}>
              {getIcon(selectedModule.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedModule.title}</h2>
                {selectedModule.isCustom && <Sparkles size={20} className="text-emerald-500" />}
              </div>
              <p className="text-slate-500 font-medium">{selectedModule.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {selectedModule.submodules.map((sub) => {
              const isTargeted = selectedTopics.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  className={`group p-6 bg-white border rounded-[2.5rem] text-left transition-all flex flex-col justify-between ${
                    isTargeted ? 'border-emerald-500 shadow-xl shadow-emerald-500/5' : 'border-slate-100 hover:border-emerald-300'
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-lg text-slate-800 group-hover:text-emerald-600 leading-tight">{sub.title}</h3>
                      <button 
                        onClick={() => onToggleTopic(sub.id)}
                        className={`p-2 rounded-xl transition-all ${
                          isTargeted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                        }`}
                      >
                        {isTargeted ? <CheckCircle2 size={18} /> : <Target size={18} />}
                      </button>
                    </div>
                    
                    {sub.milestones && (
                      <div className="space-y-1.5 mb-6">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Milestones</p>
                         {sub.milestones.map((m, i) => (
                           <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                             {m}
                           </div>
                         ))}
                      </div>
                    )}

                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{sub.description}</p>
                    
                    {sub.grammarExplanation && (
                      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Brain size={14} className="shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Grammar Snapshot</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                          {sub.grammarExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onStartLesson(sub.prompt)}
                      className="w-full bg-slate-900 group-hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      Practice Chat <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => onStartQuiz(sub.title, sub.description, sub.unitTest)}
                      className="w-full border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      Unit Test <ClipboardCheck size={14} />
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
            <GraduationCap size={24} className="text-emerald-500" />
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Currículo de Fluência</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">Jornadas personalizadas para a evolução do Chandler.</p>
        </div>

        {/* Studio Banner */}
        <div className="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full -mr-40 -mt-40 opacity-[0.08] group-hover:scale-125 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="p-2 bg-emerald-500 text-white rounded-lg"><Sparkles size={20} /></div>
                  <h3 className="text-2xl font-black tracking-tight leading-none">Lesson Studio</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-md">
                   Não encontrou o que precisa? Peça para o Iwry gerar um módulo customizado sobre qualquer tópico com testes e metas.
                </p>
              </div>
              <button 
                onClick={() => setIsGeneratorOpen(true)}
                className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 flex items-center gap-3 active:scale-95 shrink-0"
              >
                Criar Aula Nova <Plus size={18} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className={`group p-8 rounded-[3rem] border shadow-sm transition-all text-left flex flex-col items-start relative ${
                mod.isCustom ? 'bg-white border-emerald-100 ring-2 ring-emerald-500/5' : 'bg-white border-slate-100 hover:border-emerald-300'
              }`}
            >
              {mod.isCustom && <div className="absolute top-6 right-6 text-emerald-500"><Sparkles size={16} /></div>}
              <div className={`p-4 rounded-2xl mb-6 transition-colors ${mod.isCustom ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                {getIcon(mod.icon)}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{mod.title}</h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium flex-1 line-clamp-3">{mod.description}</p>
              <div className="flex items-center justify-between w-full pt-6 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{mod.submodules.length} Etapas</span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default LessonsView;
