
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Message } from '../types';
import { Send, Mic, Volume2, Loader2, Square, Target, MapPin, Coffee, Utensils, ShoppingBag, Sparkles, LogOut, Image as ImageIcon, X } from 'lucide-react';
import { generateChatResponse, textToSpeech, transcribeAudio, decodeAudioData } from '../services/geminiService';

interface ChatViewProps {
  mode: AppMode;
  messages: Message[];
  onAddMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  memories?: any[];
  selectedTopics?: string[];
  onFinish?: () => void;
}

const SCENARIO_STARTERS = [
  { id: 'food', label: 'Order Food', icon: <Utensils size={16} />, prompt: "I'd like to practice ordering food at a restaurant. You are the waiter and I'm the customer." },
  { id: 'directions', label: 'Directions', icon: <MapPin size={16} />, prompt: "I'm lost in the city. Can you help me practice asking for directions? I'll start." },
  { id: 'padaria', label: 'Bakery', icon: <Coffee size={16} />, prompt: "Let's roleplay at a traditional Brazilian Padaria. You are the atendente." },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={16} />, prompt: "I want to practice shopping for clothes at a mall. You are the salesperson." },
];

const ChatView: React.FC<ChatViewProps> = ({ mode, messages, onAddMessage, memories, selectedTopics, onFinish }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() && !selectedImage) return;

    const currentImage = selectedImage;
    if (!textOverride) setInput('');
    setSelectedImage(null);

    onAddMessage({ role: 'user', content: text, imageUrl: currentImage || undefined });
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await generateChatResponse(mode, chatHistory, text, memories, currentImage || undefined, selectedTopics);
      onAddMessage({ role: 'assistant', content: response });
    } catch (err) {
      console.error(err);
      onAddMessage({ role: 'assistant', content: "Desculpe, tive um problema técnico. Pode repetir?" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const playAudio = async (text: string, msgId: string) => {
    if (audioLoading) return;
    setAudioLoading(msgId);
    try {
      const audioBytes = await textToSpeech(text);
      if (audioBytes) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (err) {
      console.error("Playback error:", err);
    } finally {
      setAudioLoading(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setLoading(true);
          try {
            const transcription = await transcribeAudio(base64);
            if (transcription.trim()) {
              handleSend(transcription);
            } else {
              setLoading(false);
            }
          } catch (e) {
            setLoading(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap no-scrollbar pr-4">
          {selectedTopics && selectedTopics.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-[10px] uppercase tracking-widest shrink-0">
                <Target size={14} /> Focus:
              </div>
              <div className="flex gap-2">
                {selectedTopics.map(topicId => (
                  <span key={topicId} className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px] font-black uppercase tracking-tight">
                    {topicId}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-500" /> Conversação Livre
            </div>
          )}
        </div>
        {onFinish && messages.length > 1 && (
          <button 
            onClick={onFinish}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-all py-2 px-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-200 active:scale-95"
          >
            <LogOut size={12} /> Encerrar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-14 pb-28 px-4 sm:px-8 space-y-4 sm:space-y-6">
        {messages.length < 2 && !loading && (
          <div className="py-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Fala comigo, Chandler!</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                Escolha um cenário profissional ou casual para praticar seu Português hoje.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {SCENARIO_STARTERS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSend(scenario.prompt)}
                  className="bg-white border border-slate-200 p-5 rounded-[2rem] flex flex-col items-center gap-3 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all text-center group active:scale-95"
                >
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-2xl transition-colors shadow-sm">
                    {scenario.icon}
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{scenario.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`max-w-[90%] sm:max-w-[75%] group ${msg.role === 'user' ? 'order-2' : ''}`}>
              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`rounded-3xl px-5 py-3.5 shadow-sm text-[15px] sm:text-base space-y-2 relative ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  {msg.imageUrl && (
                    <div className="rounded-2xl overflow-hidden mb-2 shadow-inner">
                      <img src={msg.imageUrl} alt="User upload" className="max-w-full h-auto" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                </div>
                
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playAudio(msg.content, msg.id)}
                    className={`p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all active:scale-90 ${audioLoading === msg.id ? 'bg-emerald-50' : ''}`}
                    disabled={!!audioLoading}
                    aria-label="Escutar áudio"
                  >
                    {audioLoading === msg.id ? <Loader2 size={18} className="animate-spin text-emerald-500" /> : <Volume2 size={18} />}
                  </button>
                )}
              </div>
              <p className={`text-[10px] mt-1.5 px-2 text-slate-400 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white/50 backdrop-blur border border-slate-200/50 rounded-3xl rounded-bl-none px-5 py-3 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Iwry está pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-slate-50/80 backdrop-blur-xl border-t border-slate-200/60 z-40">
        <div className="max-w-4xl mx-auto space-y-4">
          {selectedImage && (
            <div className="relative inline-block animate-in slide-in-from-bottom-4 duration-300">
              <img src={selectedImage} alt="Selected" className="h-24 w-auto rounded-[1.5rem] border-4 border-white shadow-2xl object-cover ring-2 ring-emerald-500/20" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-slate-900 text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:bg-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-white text-slate-500 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm border border-slate-200 active:scale-90"
                aria-label="Enviar foto"
              >
                <ImageIcon size={22} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              <button 
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/20 ring-4 ring-red-500/10' 
                    : 'bg-white text-slate-500 hover:text-emerald-600 border border-slate-200'
                }`}
                aria-label="Gravar áudio"
              >
                {isRecording ? <Square size={22} /> : <Mic size={22} />}
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? "Solte para transcrever..." : "Escreva em português..."}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-[16px] text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
                disabled={loading}
              />
              {input.trim() && (
                <button 
                  onClick={() => handleSend()}
                  disabled={loading}
                  className="absolute right-2 p-2.5 bg-emerald-600 text-white rounded-xl active:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
            
            {!input.trim() && selectedImage && (
              <button 
                onClick={() => handleSend()}
                disabled={loading}
                className="p-4 bg-emerald-600 text-white rounded-2xl active:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Send size={22} />
              </button>
            )}
          </div>
          {isRecording && (
            <div className="text-center animate-pulse">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Ouvindo você...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
