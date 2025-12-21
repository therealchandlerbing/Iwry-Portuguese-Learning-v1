
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Briefcase, Globe, Users, Plane, GraduationCap } from 'lucide-react';
import { LessonModule, LessonSubModule } from '../types';

const MODULES: LessonModule[] = [
  {
    id: 'professional',
    title: 'Professional Excellence',
    icon: 'Briefcase',
    description: 'Master innovation consulting and business etiquette in SP.',
    submodules: [
      { id: 'p1', title: 'Strategic Presentations', description: 'Pitching complex ideas to Brazilian stakeholders.', prompt: 'Let\'s practice a strategic presentation. I am a Brazilian partner, and you are pitching a new innovation framework. Start by greeting me formally.' },
      { id: 'p2', title: 'Networking with Partners', description: 'Small talk that builds real trust in a professional setting.', prompt: 'We are at a business coffee in Faria Lima. Let\'s practice professional networking. How do you start the conversation?' },
      { id: 'p3', title: 'Feedback & Reviews', description: 'The Brazilian way of giving "feedback construtivo".', prompt: 'I am your colleague and I just finished a project. Give me constructive feedback in a warm but professional Brazilian way.' },
      { id: 'p4', title: 'Difficult Negotiations', description: 'Handling pushback and finding common ground.', prompt: 'We are negotiating a deadline. I am pushing for sooner, you need more time. Let\'s find a middle ground in Portuguese.' }
    ]
  },
  {
    id: 'regional',
    title: 'Regional Flavors',
    icon: 'Globe',
    description: 'Navigate the nuances between Rio and São Paulo.',
    submodules: [
      { id: 'r1', title: 'Rio: Beach to Boardroom', description: 'Understanding the Carioca pace and informal professional blend.', prompt: 'Scenario: Meeting a Carioca client near Ipanema. Practice the shift from informal chat to business.' },
      { id: 'r2', title: 'SP: Business Speed', description: 'The fast-paced, direct style of the Paulistano corporate world.', prompt: 'Scenario: A quick, efficient 15-minute sync in a São Paulo office. Be direct but polite.' },
      { id: 'r3', title: 'Decoding Regional Slang', description: 'When to use "uai", "bah", "meu", or "mermão".', prompt: 'Teach me about regional slang today. Start by explaining the difference between SP "meu" and Rio "cara".' },
      { id: 'r4', title: 'National Identity', description: 'Cultural touchstones that every Brazilian knows.', prompt: 'Let\'s talk about Brazilian cultural icons today. Who are some figures Chandler should know for social contexts?' }
    ]
  },
  {
    id: 'grammar',
    title: 'Functional Grammar',
    icon: 'GraduationCap',
    description: 'Grammar that actually helps you communicate better.',
    submodules: [
      { id: 'g1', title: 'The Subjunctive Mood', description: 'Mastering "If I were..." and "When I have...".', prompt: 'Let\'s drill the subjunctive. Give me scenarios where I have to express doubt, wishes, or possibilities.' },
      { id: 'g2', title: 'Future Scenarios', description: 'Talking about project goals and personal plans.', prompt: 'Practice the future tense. Tell me about your goals for the next 6 months in innovation consulting.' },
      { id: 'g3', title: 'Pronouns in Speech', description: 'Using object pronouns like a native, not a textbook.', prompt: 'Let\'s practice using "lo", "la", and "lhe" naturally, or when to just drop them like Brazilians do.' },
      { id: 'g4', title: 'Prepositions & Contractions', description: 'Never trip over "no", "na", "ao", or "pelo" again.', prompt: 'Give me a quiz on prepositions and contractions in the context of describing a city.' }
    ]
  },
  {
    id: 'social',
    title: 'The Social Fabric',
    icon: 'Users',
    description: 'Integration into Brazilian social circles and groups.',
    submodules: [
      { id: 's1', title: 'Churrasco Etiquette', description: 'Navigating the most important social event in Brazil.', prompt: 'I invited you to a churrasco! How do you arrive, what do you say to the host, and how do you join the group?' },
      { id: 's2', title: 'WhatsApp Group Dynamics', description: 'Mastering emojis, stickers, and "áudios".', prompt: 'Simulate a WhatsApp group chat for planning a weekend trip. Use slang and stickers (emojis).' },
      { id: 's3', title: 'Brazilian Sarcasm', description: 'Understanding humor and not taking things too literally.', prompt: 'Tell me a Brazilian joke or explain how sarcasm works in SP business culture.' },
      { id: 's4', title: 'Making Real Friends', description: 'Moving from "conhecido" to "amigo".', prompt: 'Let\'s practice a casual catch-up between friends. How do you ask about someone\'s family and life warmly?' }
    ]
  },
  {
    id: 'travel',
    title: 'Travel & Lifestyle',
    icon: 'Plane',
    description: 'High-end travel and day-to-day luxury services.',
    submodules: [
      { id: 't1', title: 'Gourmet Dining', description: 'Ordering at top-tier restaurants and handling service.', prompt: 'We are at a high-end restaurant in Jardins. Practice ordering and asking for recommendations.' },
      { id: 't2', title: 'Luxury Accommodations', description: 'Checking in and requesting specific amenities.', prompt: 'You are checking into a boutique hotel in Trancoso. Request a room with a view and ask about local tours.' },
      { id: 't3', title: 'Navigating Logistics', description: 'Talking to private drivers and airport staff.', prompt: 'Scenario: Your private driver is late. Practice calling them and discussing the traffic/route politely.' },
      { id: 't4', title: 'Shopping Manners', description: 'From boutiques in Oscar Freire to local markets.', prompt: 'Practice shopping for a gift. Ask about materials, sizes, and if there is a "desconto à vista".' }
    ]
  },
  {
    id: 'workplace',
    title: 'Workplace Culture',
    icon: 'BookOpen',
    description: 'The unwritten rules of working in Brazil.',
    submodules: [
      { id: 'w1', title: 'Hierarchies & Power', description: 'How to address leadership vs. peers.', prompt: 'Explain the difference in addressing a "Diretor" vs. a "Coordenador" in a large Brazilian company.' },
      { id: 'w2', title: 'Work/Life Integration', description: 'Understanding "cafezinho" and long lunches.', prompt: 'Let\'s have a "cafezinho" chat. Practice the 10 minutes of social talk before a meeting starts.' },
      { id: 'w3', title: 'Holiday Norms', description: 'Carnaval, June Festivals, and office closures.', prompt: 'Discuss the impact of Carnaval on a project timeline. How do you negotiate this with a client?' },
      { id: 'w4', title: 'Tech & Innovation', description: 'Vocabulary for the Brazilian start-up scene.', prompt: 'Let\'s talk about "Unicórnios" and the Brazilian fintech scene. Teach me the specific jargon used here.' }
    ]
  }
];

interface LessonsViewProps {
  onStartLesson: (prompt: string) => void;
}

const LessonsView: React.FC<LessonsViewProps> = ({ onStartLesson }) => {
  const [selectedModule, setSelectedModule] = useState<LessonModule | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Briefcase': return <Briefcase size={24} />;
      case 'Globe': return <Globe size={24} />;
      case 'GraduationCap': return <GraduationCap size={24} />;
      case 'Users': return <Users size={24} />;
      case 'Plane': return <Plane size={24} />;
      case 'BookOpen': return <BookOpen size={24} />;
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedModule.submodules.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onStartLesson(sub.prompt)}
                className="group p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 mb-2">{sub.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{sub.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Lesson <ChevronRight size={14} />
                </div>
              </button>
            ))}
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
