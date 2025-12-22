
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Message, DifficultyLevel } from '../types';
import {
  Send,
  Mic,
  Volume2,
  Loader2,
  MapPin,
  Utensils,
  Sparkles,
  LogOut,
  Image as ImageIcon,
  Users,
  Beer,
  Info,
  CheckCheck,
  ChevronLeft,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ChevronDown,
  Briefcase,
  Store,
  Theater,
  Stethoscope,
  Plane,
  Coffee
} from 'lucide-react';
import { generateChatResponse, textToSpeech, transcribeAudio, decodeAudioData } from '../services/geminiService';

// Scenario definitions for conversation practice
const SCENARIOS = [
  {
    id: 'bakery',
    icon: 'Coffee',
    label: 'Na Padaria',
    prompt: 'I just walked into a Brazilian bakery. Help me order a pão de queijo and cafezinho.',
    levels: ['BEGINNER', 'INTERMEDIATE']
  },
  {
    id: 'ordering-food',
    icon: 'Utensils',
    label: 'Pedindo Comida',
    prompt: 'I am at a restaurant in São Paulo. Help me order a meal and ask about the menu.',
    levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'directions',
    icon: 'MapPin',
    label: 'Pedindo Direções',
    prompt: 'I am lost in Rio de Janeiro. Help me ask for directions to Copacabana beach.',
    levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'meeting-someone',
    icon: 'Users',
    label: 'Conhecendo Alguém',
    prompt: 'I just met a Brazilian at a party. Help me introduce myself and have a casual conversation.',
    levels: ['BEGINNER', 'INTERMEDIATE']
  },
  {
    id: 'at-office',
    icon: 'Briefcase',
    label: 'No Escritório',
    prompt: 'I am starting my first day at a Brazilian office. Help me interact with my new colleagues.',
    levels: ['INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'business-meeting',
    icon: 'Briefcase',
    label: 'Reunião de Negócios',
    prompt: 'I am leading a business meeting with Brazilian partners. Help me conduct the meeting professionally.',
    levels: ['ADVANCED']
  },
  {
    id: 'medical',
    icon: 'Stethoscope',
    label: 'Consulta Médica',
    prompt: 'I need to visit a doctor in Brazil. Help me describe my symptoms and understand the diagnosis.',
    levels: ['INTERMEDIATE', 'ADVANCED']
  },
  {
    id: 'airport',
    icon: 'Plane',
    label: 'No Aeroporto',
    prompt: 'I am at the São Paulo airport. Help me check in for my flight and go through customs.',
    levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  }
];

const getScenarioIcon = (iconName: string) => {
  switch (iconName) {
    case 'Coffee': return Coffee;
    case 'Utensils': return Utensils;
    case 'MapPin': return MapPin;
    case 'Users': return Users;
    case 'Briefcase': return Briefcase;
    case 'Stethoscope': return Stethoscope;
    case 'Plane': return Plane;
    default: return Sparkles;
  }
};

interface ChatViewProps {
  mode: AppMode;
  messages: Message[];
  onAddMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  difficulty: DifficultyLevel;
  memories?: any[];
  selectedTopics?: string[];
  onFinish?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ mode, messages, onAddMessage, difficulty, memories, selectedTopics, onFinish }) => {
  const isWhatsApp = mode === AppMode.TEXT_MODE;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showScenarios, setShowScenarios] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() && !selectedImage) return;
    const currentImage = selectedImage;
    if (!textOverride) setInput('');
    setSelectedImage(null);
    setShowScenarios(false);
    onAddMessage({ role: 'user', content: text, imageUrl: currentImage || undefined });
    setLoading(true);
    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await generateChatResponse(mode, chatHistory, text, difficulty, memories, currentImage || undefined, selectedTopics);
      onAddMessage({ role: 'assistant', content: response });
    } catch (err) {
      onAddMessage({ role: 'assistant', content: "Ops, algo deu errado. Pode tentar de novo? (Oops, something went wrong. Can you try again?)" });
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string, msgId: string) => {
    if (audioLoading) return;
    // Strip markdown before TTS for cleaner voice output
    const cleanText = text.replace(/\*\*|\*/g, '');
    setAudioLoading(msgId);
    try {
      const audioBytes = await textToSpeech(cleanText);
      if (audioBytes) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (err) { console.error(err); } finally { setAudioLoading(null); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setLoading(true);
          const transcription = await transcribeAudio(base64);
          if (transcription.trim()) handleSend(transcription);
          else setLoading(false);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const renderContent = (content: string) => {
    // Split by double line breaks for airy spacing
    const paragraphs = content.split(/\n\s*\n/);

    return paragraphs.map((para, pIdx) => (
      <p key={pIdx} className={pIdx > 0 ? "mt-4" : ""}>
        {para.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic text-slate-500 font-normal">{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className={`flex flex-col h-full relative overflow-hidden transition-all duration-700 ${isWhatsApp ? 'bg-[#e5ddd5]' : 'bg-slate-50'}`}>
      
      {/* HEADER FORK */}
      <div className={`z-40 flex items-center justify-between px-4 py-3 border-b shadow-sm shrink-0 ${
        isWhatsApp ? 'bg-[#075E54] text-white border-[#054c44]' : 'bg-white text-slate-900 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          {isWhatsApp ? (
            <div className="flex items-center gap-2">
              <ChevronLeft size={24} className="cursor-pointer" onClick={onFinish} />
              <div className="relative">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Iwry" alt="Iwry" className="w-10 h-10 rounded-full bg-white/20" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#075E54] rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold leading-none text-base tracking-tight">Iwry</h3>
                <span className="text-[10px] text-emerald-200 opacity-80">online</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-900 text-white rounded-xl"><Users size={18} /></div>
               <div>
                <h3 className="font-black tracking-tighter text-sm uppercase">Tutor de Conversação</h3>
                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Iwry Assistant</p>
               </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isWhatsApp ? (
            <div className="flex items-center gap-5 text-white/90">
              <Video size={20} />
              <Phone size={18} />
              <MoreVertical size={20} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <button 
                onClick={() => setShowScenarios(!showScenarios)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showScenarios ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                 Cenários <ChevronDown size={14} className={`transition-transform duration-300 ${showScenarios ? 'rotate-180' : ''}`} />
               </button>
               <button onClick={onFinish} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"><LogOut size={18} /></button>
            </div>
          )}
        </div>
      </div>

      {/* SCENARIOS DROPDOWN PANEL */}
      {showScenarios && !isWhatsApp && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Escolha um Cenário</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Nível: {difficulty === DifficultyLevel.BEGINNER ? 'Iniciante' : difficulty === DifficultyLevel.INTERMEDIATE ? 'Intermediário' : 'Avançado'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SCENARIOS
                .filter(scenario => scenario.levels.includes(difficulty))
                .map(scenario => {
                  const IconComponent = getScenarioIcon(scenario.icon);
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleSend(scenario.prompt)}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-300 rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm transition-colors">
                        <IconComponent size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700 text-center leading-tight">
                        {scenario.label}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP DOODLE PATTERN */}
      {isWhatsApp && (
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
      )}

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 relative z-10 no-scrollbar">
        {messages.length < 2 && !loading && !isWhatsApp && !showScenarios && (
          <div className="max-w-md mx-auto py-20 text-center space-y-4 animate-in fade-in duration-700">
             <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto text-slate-400 mb-2">
               <Sparkles size={32} />
             </div>
             <h4 className="text-xl font-black text-slate-800 tracking-tight">Como posso te ajudar hoje?</h4>
             <p className="text-sm text-slate-500">Use o menu de <span className="text-emerald-600 font-bold uppercase text-xs">cenários</span> acima ou apenas comece a falar.</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isCorrection = msg.isCorrection;

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[88%] sm:max-w-[75%] group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                
                {/* BUBBLE RENDERING */}
                <div className={`relative flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`px-5 py-4 rounded-3xl shadow-sm border ${
                    isCorrection ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    isWhatsApp ? (isUser ? 'bg-[#DCF8C6] border-[#cedeb7] text-slate-800' : 'bg-white border-slate-100 text-slate-800') :
                    isUser ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
                  }`}>
                    {isCorrection && <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600"><Info size={12} /> Iwry Tip</div>}
                    {msg.imageUrl && <img src={msg.imageUrl} className="rounded-2xl mb-3 border border-black/5" alt="Uploaded" />}
                    
                    <div className={`text-[15px] leading-relaxed ${isUser ? 'font-medium' : ''}`}>
                      {renderContent(msg.content)}
                    </div>

                    <div className={`mt-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-between gap-4 ${isUser ? 'text-white/40' : 'text-slate-300'}`}>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isUser && isWhatsApp && <CheckCheck size={13} className="text-blue-400" />}
                    </div>
                  </div>
                  {!isUser && !isCorrection && (
                    <button onClick={() => playAudio(msg.content, msg.id)} className="p-2.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-emerald-500 hover:scale-110 active:scale-95 transition-all border border-slate-100 mb-1">
                      {audioLoading === msg.id ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
             <div className={`${isWhatsApp ? 'bg-white' : 'bg-white/50'} px-4 py-2 rounded-xl shadow-sm flex items-center gap-2`}>
                <span className={`text-[11px] font-bold italic ${isWhatsApp ? 'text-emerald-800' : 'text-slate-400'}`}>
                  {isWhatsApp ? 'digitando...' : 'Iwry está pensando...'}
                </span>
                <div className="flex gap-1 animate-pulse"><div className="w-1 h-1 bg-slate-300 rounded-full" /><div className="w-1 h-1 bg-slate-300 rounded-full" /><div className="w-1 h-1 bg-slate-300 rounded-full" /></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT BAR FORK */}
      <div className={`p-3 sm:p-4 z-50 shrink-0 ${isWhatsApp ? 'bg-[#F0F2F5]' : 'bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]'}`}>
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          {isWhatsApp ? (
            <div className="flex items-center gap-3 text-slate-500 px-1">
              <Smile size={24} className="cursor-pointer" />
              <Paperclip size={22} onClick={() => fileInputRef.current?.click()} className="cursor-pointer" />
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-emerald-500 bg-slate-50 rounded-xl transition-all"><ImageIcon size={20} /></button>
          )}

          <div className={`flex-1 flex items-center ${isWhatsApp ? 'bg-white rounded-full px-4 py-2 shadow-sm' : ''}`}>
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isWhatsApp ? "Mensagem" : "Escreva em português..."}
              className={`w-full outline-none py-1.5 text-[16px] ${isWhatsApp ? 'bg-transparent text-slate-700' : 'bg-slate-50 px-4 rounded-xl border border-slate-200 focus:border-emerald-500 transition-all'}`}
            />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </div>

          <button 
             onMouseDown={startRecording} onMouseUp={stopRecording}
             onTouchStart={startRecording} onTouchEnd={stopRecording}
             className={`p-3.5 rounded-full shadow-lg transition-all active:scale-90 ${
               isWhatsApp 
                ? 'bg-[#00a884] text-white hover:bg-[#008f72]' 
                : isRecording ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'
             }`}
           >
              {isRecording ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (input.trim() || selectedImage ? <Send size={22} onClick={() => handleSend()} /> : <Mic size={22} />)}
           </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ChatView;
