
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Briefcase, Globe, Users, Plane, GraduationCap, Info, Target, CheckCircle2, ClipboardCheck, Coffee, MapPin } from 'lucide-react';
import { LessonModule, LessonSubModule } from '../types';

const MODULES: LessonModule[] = [
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
  },
  {
    id: 'social',
    title: 'The Social Fabric',
    icon: 'Users',
    description: 'Integration into Brazilian social circles and groups.',
    submodules: [
      { 
        id: 's1', 
        title: 'Churrasco Etiquette', 
        description: 'Navigating the most important social event in Brazil.', 
        prompt: 'I invited you to a churrasco! How do you arrive, what do you say to the host, and how do you join the group?',
        grammarExplanation: 'Use "A gente" instead of "Nós" to sound like a local. It takes 3rd person singular: "A gente vai" (We go).'
      },
      { 
        id: 's2', 
        title: 'WhatsApp Group Dynamics', 
        description: 'Mastering emojis, stickers, and "áudios".', 
        prompt: 'Simulate a WhatsApp group chat for planning a weekend trip. Use slang and stickers (emojis).',
        grammarExplanation: 'Abbreviate: vc (você), tb (também), pq (porque), blz (beleza). Use "kkk" or "rsrs" for laughing.'
      },
      { 
        id: 's3', 
        title: 'Brazilian Sarcasm', 
        description: 'Understanding humor and not taking things too literally.', 
        prompt: 'Tell me a Brazilian joke or explain how sarcasm works in SP business culture.',
        grammarExplanation: 'Sarcasm often uses "Só que não" (SQN) at the end of a sentence to negate the entire previous statement.'
      },
      { 
        id: 's4', 
        title: 'Making Real Friends', 
        description: 'Moving from "conhecido" to "amigo".', 
        prompt: 'Let\'s practice a casual catch-up between friends. How do you ask about someone\'s family and life warmly?',
        grammarExplanation: 'Ask "Como estão as coisas?" (How are things?). Use the verb "ficar" to describe changes in emotion or state: "Fiquei feliz por você."'
      }
    ]
  },
  {
    id: 'travel',
    title: 'Travel & Lifestyle',
    icon: 'Plane',
    description: 'High-end travel and day-to-day luxury services.',
    submodules: [
      { 
        id: 't1', 
        title: 'Gourmet Dining', 
        description: 'Ordering at top-tier restaurants and handling service.', 
        prompt: 'We are at a high-end restaurant in Jardins. Practice ordering and asking for recommendations.',
        grammarExplanation: 'When ordering, say "Eu vou querer..." or "Pode me trazer...". Avoid direct imperatives like "Me dá".'
      },
      { 
        id: 't2', 
        title: 'Luxury Accommodations', 
        description: 'Checking in and requesting specific amenities.', 
        prompt: 'You are checking into a boutique hotel in Trancoso. Request a room with a view and ask about local tours.',
        grammarExplanation: 'Use "Será que..." to ask questions tentatively: "Será que tem um quarto disponível?" (I wonder if there is...).'
      },
      { 
        id: 't3', 
        title: 'Navigating Logistics', 
        description: 'Talking to private drivers and airport staff.', 
        prompt: 'Scenario: Your private driver is late. Practice calling them and discussing the traffic/route politely.',
        grammarExplanation: 'Gerunds: In Brazil, use "-ndo" (Estou chegando). Avoid the Portuguese "-a" style (Estou a chegar).'
      },
      { 
        id: 't4', 
        title: 'Shopping Manners', 
        description: 'From boutiques in Oscar Freire to local markets.', 
        prompt: 'Practice shopping for a gift. Ask about materials, sizes, and if there is a "desconto à vista".',
        grammarExplanation: 'Brazilians always ask for "desconto". Use "Quanto sai?" or "Dá pra melhorar o preço?" to negotiate.'
      }
    ]
  },
  {
    id: 'workplace',
    title: 'Workplace Culture',
    icon: 'BookOpen',
    description: 'The unwritten rules of working in Brazil.',
    submodules: [
      { 
        id: 'w1', 
        title: 'Hierarchies & Power', 
        description: 'How to address leadership vs. peers.', 
        prompt: 'Explain the difference in addressing a "Diretor" vs. a "Coordenador" in a large Brazilian company.',
        grammarExplanation: 'Address bosses as "O senhor" / "A senhora" until they invite you to use "você". Use titles (Dr., Eng.) if the culture is traditional.'
      },
      { 
        id: 'w2', 
        title: 'Work/Life Integration', 
        description: 'Understanding "cafezinho" and long lunches.', 
        prompt: 'Let\'s have a "cafezinho" chat. Practice the 10 minutes of social talk before a meeting starts.',
        grammarExplanation: '"Bater um papo" means to have a chat. "Tomar um café" is often a metaphor for a meeting that could be social or professional.'
      },
      { 
        id: 'w3', 
        title: 'Holiday Norms', 
        description: 'Carnaval, June Festivals, and office closures.', 
        prompt: 'Discuss the impact of Carnaval on a project timeline. How do you negotiate this with a client?',
        grammarExplanation: '"Folga" is a day off. "Feriado prolongado" or "Ponte" refers to bridging a holiday with a weekend.'
      },
      { 
        id: 'w4', 
        title: 'Tech & Innovation', 
        description: 'Vocabulary for the Brazilian start-up scene.', 
        prompt: 'Let\'s talk about "Unicórnios" and the Brazilian fintech scene. Teach me the specific jargon used here.',
        grammarExplanation: 'Brazilians use many English loanwords in tech (start-up, mindset, budget) but pronounce them with a distinct accent (start-úpi).'
      }
    ]
  }
];

interface LessonsViewProps {
  onStartLesson: (prompt: string) => void;
  onStartQuiz: (title: string, description: string) => void;
  selectedTopics: string[];
  onToggleTopic: (topicId: string) => void;
}

const LessonsView: React.FC<LessonsViewProps> = ({ onStartLesson, onStartQuiz, selectedTopics, onToggleTopic }) => {
  const [selectedModule, setSelectedModule] = useState<LessonModule | null>(null);

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
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Modules
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
              {getIcon(selectedModule.icon)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{selectedModule.title}</h2>
              <p className="text-slate-500">{selectedModule.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {selectedModule.submodules.map((sub) => {
              const isTargeted = selectedTopics.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  className={`group p-6 bg-white border rounded-3xl text-left transition-all flex flex-col justify-between ${
                    isTargeted ? 'border-emerald-500 shadow-xl shadow-emerald-500/5' : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 leading-tight">{sub.title}</h3>
                      <button 
                        onClick={() => onToggleTopic(sub.id)}
                        className={`p-2 rounded-xl transition-all ${
                          isTargeted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                        }`}
                        title={isTargeted ? "Remove target" : "Target for future practice"}
                      >
                        {isTargeted ? <CheckCircle2 size={18} /> : <Target size={18} />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{sub.description}</p>
                    
                    {sub.grammarExplanation && (
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <Info size={14} className="shrink-0" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Grammar Snapshot</span>
                        </div>
                        <p className="text-xs text-emerald-800/80 leading-relaxed italic">
                          {sub.grammarExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onStartLesson(sub.prompt)}
                      className="w-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      Practice Chat <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => onStartQuiz(sub.title, sub.description)}
                      className="w-full border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      Knowledge Check <ClipboardCheck size={14} />
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
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-32">
      <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Structured Learning</h2>
          <p className="text-slate-500 text-lg">Personalized curriculum for Chandler's growth.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all text-left flex flex-col items-start"
            >
              <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-2xl mb-6 transition-colors">
                {getIcon(mod.icon)}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{mod.title}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-1">{mod.description}</p>
              <div className="flex items-center justify-between w-full pt-4 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{mod.submodules.length} Lessons</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-emerald-900 text-white p-8 sm:p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left space-y-4">
              <h3 className="text-2xl font-bold">Custom Request?</h3>
              <p className="text-emerald-100 opacity-80">Want to learn something specific not covered here? Just ask Iwry in the conversation mode!</p>
              <button 
                onClick={() => onStartLesson('I want to create a custom lesson about: ')}
                className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
              >
                Suggest a Topic
              </button>
            </div>
            <div className="hidden sm:block">
               <GraduationCap size={120} className="text-emerald-800 opacity-50" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default LessonsView;
