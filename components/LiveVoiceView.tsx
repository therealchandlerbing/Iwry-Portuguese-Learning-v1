
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Info, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { decode, encode, decodeAudioData } from '../services/geminiService';
import { MemoryEntry, DifficultyLevel } from '../types';

interface LiveVoiceViewProps {
  memories?: MemoryEntry[];
  difficulty: DifficultyLevel;
}

const LiveVoiceView: React.FC<LiveVoiceViewProps> = ({ memories, difficulty }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setStatus('connecting');
    setError(null);

    try {
      // Fetch API key from secure endpoint
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError("Você precisa estar autenticado para usar o recurso de voz.");
        setStatus('idle');
        return;
      }

      const keyResponse = await fetch('/api/live-key', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!keyResponse.ok) {
        if (keyResponse.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to initialize voice connection');
      }

      const { key } = await keyResponse.json();
      const ai = new GoogleGenAI({ apiKey: key });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('listening');
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              setStatus('speaking');
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            setError("Houve um erro na conexão. Tente novamente.");
            setIsActive(false);
            setStatus('idle');
          },
          onclose: (e) => {
            setIsActive(false);
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: `Você é o Iwry, o assistente dedicado de Chandler para aprender Português do Brasil. 
          O nível de dificuldade atual de Chandler é ${difficulty}. Ajuste sua complexidade de vocabulário e gramática para este nível. 
          Fale naturalmente em português. Seja encorajador. 
          ${memories && memories.length > 0 ? `Contexto: Chandler estudou recentemente sobre: ${memories.slice(0, 3).map(m => m.topic).join(', ')}.` : ''} 
          Mantenha a conversa fluida e divertida.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: unknown) {
      console.error('Live voice error:', err);
      if (err instanceof Error) {
        if (err.message === 'Authentication failed') {
          setError("Sua sessão expirou. Por favor, faça login novamente.");
        } else if (err.message === 'Failed to initialize voice connection') {
          setError("Não foi possível conectar ao serviço de voz. Tente novamente mais tarde.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Não foi possível acessar seu microfone. Verifique as permissões.");
        } else {
          setError("Ocorreu um erro. Verifique sua conexão e tente novamente.");
        }
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.");
      }
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (sessionRef.current) sessionRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 sm:p-12 bg-slate-900 text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] transition-all duration-1000 ${isActive ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`} />
      </div>

      <div className="max-w-md w-full text-center space-y-12 relative z-10 flex flex-col items-center">
        <div className="relative group">
          <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-[4rem] flex items-center justify-center border-4 transition-all duration-700 relative ${
            isActive ? 'border-emerald-500 scale-105 shadow-[0_0_80px_rgba(16,185,129,0.2)]' : 'border-white/10'
          }`}>
            <div className={`w-36 h-36 sm:w-52 sm:h-52 rounded-[3.5rem] flex items-center justify-center transition-all duration-500 ${
              isActive ? 'bg-emerald-500/20' : 'bg-white/5'
            }`}>
              {status === 'speaking' ? (
                <div className="flex gap-2 items-center h-20">
                   {[1,2,3,4,5].map(i => (
                     <div 
                      key={i} 
                      className="w-3 bg-emerald-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                      style={{ animationDelay: `${i * 0.1}s`, height: `${40 + Math.random() * 60}%` }} 
                     />
                   ))}
                </div>
              ) : (
                <div className="relative">
                  <Mic size={isActive ? 80 : 64} className={`transition-all duration-500 ${isActive ? 'text-emerald-500 scale-110' : 'text-white/20'}`} />
                  {isActive && status === 'listening' && (
                    <div className="absolute inset-0 animate-ping rounded-full border-4 border-emerald-500/20" />
                  )}
                </div>
              )}
            </div>
          </div>
          {isActive && (
             <div className="absolute -inset-8 rounded-[5rem] border-2 border-emerald-500/5 animate-pulse" />
          )}
        </div>

        <div className="space-y-4 px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">{difficulty} Difficulty</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
            {status === 'connecting' ? "Iniciando..." :
             status === 'speaking' ? "Iwry falando" :
             status === 'listening' ? "Iwry ouvindo..." : "Voz com Iwry"}
          </h3>
          <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-xs mx-auto font-medium">
            {status === 'connecting' ? 'Preparando a conexão segura...' : 
             status === 'speaking' ? 'Aguarde o Iwry terminar de falar.' :
             isActive ? 'Fale naturalmente, como em uma ligação real.' : 
             'Pratique conversação fluida sem interrupções e sem botões.'}
          </p>
        </div>

        {error && (
          <div className="mx-4 bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 text-red-200 text-sm text-left animate-in slide-in-from-bottom-2">
            <AlertCircle size={24} className="shrink-0 text-red-500" />
            <p className="font-medium leading-snug">{error}</p>
          </div>
        )}

        <div className="w-full px-4 pt-4">
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={status === 'connecting'}
            className={`w-full py-6 px-10 rounded-[2.5rem] font-black text-lg transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.96] uppercase tracking-[0.1em] ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 ring-4 ring-red-500/10' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 ring-4 ring-emerald-500/10'
            } disabled:opacity-50`}
          >
            {status === 'connecting' ? <Loader2 size={24} className="animate-spin" /> : (isActive ? <MicOff size={24} /> : <Mic size={24} />)}
            {status === 'connecting' ? 'Conectando' : (isActive ? 'Encerrar' : 'Entrar no Chat')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceView;
