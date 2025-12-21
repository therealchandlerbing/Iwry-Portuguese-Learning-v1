
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Message } from '../types';
import { Send, Mic, Volume2, Loader2, Square } from 'lucide-react';
import { generateChatResponse, textToSpeech, transcribeAudio, decodeAudioData } from '../services/geminiService';

interface ChatViewProps {
  mode: AppMode;
  messages: Message[];
  onAddMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ mode, messages, onAddMessage }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    if (!textOverride) setInput('');
    onAddMessage({ role: 'user', content: text });
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await generateChatResponse(mode, chatHistory, text);
      onAddMessage({ role: 'assistant', content: response });
    } catch (err) {
      console.error(err);
      onAddMessage({ role: 'assistant', content: "Desculpe, tive um problema técnico. Pode repetir?" });
    } finally {
      setLoading(false);
    }
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 pb-20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] sm:max-w-[80%] group ${msg.role === 'user' ? 'order-2' : ''}`}>
              <div className={`flex items-end gap-1.5 sm:gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`rounded-2xl px-4 py-2.5 sm:py-3 shadow-sm text-[15px] sm:text-base ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white sm:bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
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
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
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
            disabled={!input.trim() || loading}
            className="p-3.5 bg-emerald-600 text-white rounded-2xl active:bg-emerald-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-500/10"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;