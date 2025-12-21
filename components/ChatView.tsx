
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
      // Pass selected topics and current image to provide context
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
    // Clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const playAudio = async (text: string, msgId: string) => {
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
          const transcription = await transcribeAudio(base64);
          handleSend(transcription);
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
    <div className="flex flex-col h-full bg-white sm:bg-slate-50">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {selectedTopics && selectedTopics.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-[10px] uppercase tracking-widest shrink-0">
                <Target size={14} /> Focus:
              </div>
              <div className="flex gap-2">
                {selectedTopics.map(topicId => (
                  <span key={topicId} className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
                    {topicId}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Casual Practice</div>
          )}
        </div>
        {onFinish && messages.length > 1 && (
          <button 
            onClick={onFinish}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors py-1 px-3 rounded-full hover:bg-emerald-50"
          >
            <LogOut size={12} /> Finish Session
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 pb-20">
        {messages.length < 2 && (
          <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-slate-800">Pronto para começar?</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Escolha um cenário ou simplesmente comece a digitar.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {SCENARIO_STARTERS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSend(scenario.prompt)}
                  className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-emerald-500 hover:shadow-lg transition-all text-center group"
                >
                  <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-xl transition-colors">
                    {scenario.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{scenario.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] sm:max-w-[80%] group ${msg.role === 'user' ? 'order-2' : ''}`}>
              <div className={`flex items-end gap-1.5 sm:gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`rounded-2xl px-4 py-2.5 sm:py-3 shadow-sm text-[15px] sm:text-base space-y-2 ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.imageUrl && (
                    <div className="rounded-xl overflow-hidden mb-2">
                      <img src={msg.imageUrl} alt="User upload" className="max-w-full h-auto" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-tight sm:leading-relaxed">{msg.content}</p>
                </div>
                
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playAudio(msg.content, msg.id)}
                    className="p-2.5 text-slate-400 active:text-emerald-500 active:bg-emerald-50 rounded-full transition-all"
                    disabled={!!audioLoading}
                  >
                    {audioLoading === msg.id ? <Loader2 size={18} className="animate-spin text-emerald-500" /> : <Volume2 size={18} />}
                  </button>
                )}
              </div>
              <p className={`text-[10px] mt-1 text-slate-400 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 border border-slate-200/50 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-emerald-500" />
              <span className="text-xs text-slate-500 font-medium italic">Iwry digitando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-3 sm:p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Image Preview Area */}
          {selectedImage && (
            <div className="relative inline-block animate-in slide-in-from-bottom-2 duration-300">
              <img src={selectedImage} alt="Selected" className="h-20 w-auto rounded-xl border-2 border-emerald-500 shadow-lg object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full shadow-lg border border-white"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-slate-100 text-slate-500 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"
              >
                <ImageIcon size={20} />
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
                className={`p-3.5 rounded-full transition-all shadow-sm ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 active:bg-slate-200'
                }`}
              >
                {isRecording ? <Square size={20} /> : <Mic size={20} />}
              </button>
            </div>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Ouvindo..." : "Escreva em português..."}
              className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-[16px] text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              disabled={loading}
            />
            
            <button 
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedImage) || loading}
              className="p-3.5 bg-emerald-600 text-white rounded-2xl active:bg-emerald-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-500/10"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
