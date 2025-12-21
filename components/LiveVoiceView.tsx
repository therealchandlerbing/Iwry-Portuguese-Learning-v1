
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Info, AlertCircle } from 'lucide-react';
import { decode, encode, decodeAudioData } from '../services/geminiService';

const LiveVoiceView: React.FC = () => {
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
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
            setError("Erro de conexão. Verifique as permissões do microfone.");
            setIsActive(false);
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
          systemInstruction: 'You are Iwry, a dedicated Brazilian Portuguese learning assistant for Chandler. Talk naturally in Portuguese. Be helpful and encouraging.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Não foi possível acessar o microfone.");
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

  return (
    <div className="flex flex-col items-center justify-start sm:justify-center h-full p-6 sm:p-8 bg-slate-900 text-white overflow-y-auto pb-24">
      <div className="max-w-md w-full text-center space-y-10 py-8">
        <div className="relative pt-4">
          <div className={`w-40 h-40 sm:w-56 sm:h-56 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-700 ${
            isActive ? 'border-emerald-500 scale-105 sm:scale-110 shadow-[0_0_60px_rgba(16,185,129,0.25)]' : 'border-slate-800'
          }`}>
            <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full flex items-center justify-center transition-all ${
              isActive ? 'bg-emerald-500/10' : 'bg-slate-800'
            }`}>
              {status === 'speaking' ? (
                <div className="flex gap-2 items-center h-16">
                   {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="w-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${50 + Math.random() * 50}%` }} />
                   ))}
                </div>
              ) : (
                <Mic size={isActive ? 64 : 56} className={isActive ? 'text-emerald-500' : 'text-slate-600'} />
              )}
            </div>
          </div>
          {isActive && (
             <div className="absolute inset-0 rounded-full animate-ping border-2 border-emerald-500/10 pointer-events-none"></div>
          )}
        </div>

        <div className="space-y-3 px-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isActive ? "Iwry está ouvindo..." : "Pronto para falar?"}
          </h3>
          <p className="text-slate-400 text-[15px] sm:text-base leading-relaxed">
            {status === 'connecting' ? 'Conectando ao Iwry...' : 
             status === 'speaking' ? 'Iwry está falando.' :
             isActive ? 'Pode falar em Português, estou ouvindo.' : 
             'Pratique conversação em tempo real sem precisar apertar botões.'}
          </p>
        </div>

        {error && (
          <div className="mx-4 bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-200 text-sm text-left">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            {error}
          </div>
        )}

        <div className="px-4">
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={status === 'connecting'}
            className={`w-full py-5 px-8 rounded-[2rem] font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.96] ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            } disabled:opacity-50`}
          >
            {isActive ? <MicOff size={26} /> : <Mic size={26} />}
            {isActive ? 'Encerrar Chat' : 'Iniciar Sessão'}
          </button>
        </div>

        <div className="mx-4 bg-white/5 p-5 rounded-3xl text-left border border-white/5 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <Info size={20} className="text-slate-300" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              O modo Live usa IA de ultra-baixa latência para diálogos naturais.
              Sinta-se como se estivesse em uma ligação real!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceView;