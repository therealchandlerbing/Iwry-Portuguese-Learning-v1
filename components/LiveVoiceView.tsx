
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
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            setError("Connection error. Please check your mic permissions.");
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
          systemInstruction: 'You are Iwry, a dedicated Brazilian Portuguese learning assistant for Chandler. Talk naturally in Portuguese. Be helpful and encouraging. Use English support only if strictly necessary.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Could not access microphone or connect to the service.");
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
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900 text-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
            isActive ? 'border-emerald-500 scale-110 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-slate-700'
          }`}>
            <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all ${
              isActive ? 'bg-emerald-500/10' : 'bg-slate-800'
            }`}>
              {status === 'speaking' ? (
                <div className="flex gap-1.5 items-center h-12">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${40 + Math.random() * 60}%` }} />
                   ))}
                </div>
              ) : (
                <Mic size={56} className={isActive ? 'text-emerald-500' : 'text-slate-500'} />
              )}
            </div>
          </div>
          {isActive && (
             <div className="absolute inset-0 rounded-full animate-ping border-2 border-emerald-500/20"></div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">
            {isActive ? "Iwry is listening..." : "Ready to speak?"}
          </h3>
          <p className="text-slate-400">
            {status === 'connecting' ? 'Connecting to Iwry...' : 
             status === 'speaking' ? 'Iwry is speaking.' :
             isActive ? 'Go ahead, say something in Portuguese.' : 
             'Try real-time voice practice. No buttons needed once connected.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-200 text-sm text-left">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={status === 'connecting'}
          className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          } disabled:opacity-50`}
        >
          {isActive ? <MicOff size={24} /> : <Mic size={24} />}
          {isActive ? 'Stop Conversation' : 'Start Live Session'}
        </button>

        <div className="bg-slate-800/50 p-5 rounded-2xl text-left border border-slate-700">
          <div className="flex items-start gap-4">
            <div className="bg-slate-700/50 p-2 rounded-lg">
              <Info size={18} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live mode uses ultra-low latency AI for natural turn-taking. 
              Ideal for practicing fluid response and listening under "real world" pressure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceView;
