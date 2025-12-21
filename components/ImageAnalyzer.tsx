
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { AppMode, Message, DifficultyLevel } from '../types';

interface ImageAnalyzerProps {
  onAddMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  difficulty: DifficultyLevel;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onAddMessage, difficulty }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const prompt = "What do you see in this image? Describe it in Brazilian Portuguese and teach me 5 new words related to this context.";
      const response = await generateChatResponse(AppMode.IMAGE_ANALYSIS, [], prompt, difficulty, undefined, image);
      
      onAddMessage({ role: 'user', content: 'Can you analyze this photo for me?', imageUrl: image });
      onAddMessage({ role: 'assistant', content: response });
      setImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-600">
          <Camera size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Visual Learning</h2>
        <p className="text-slate-500 mb-10 text-lg">Upload a photo of your day, and Iwry will teach you the vocabulary to describe it.</p>

        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-3xl p-16 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-inner transition-all cursor-pointer group"
          >
            <Upload size={40} className="mx-auto mb-5 text-slate-300 group-hover:text-emerald-500" />
            <p className="text-lg font-semibold text-slate-600">Click to upload a photo</p>
            <p className="text-sm text-slate-400 mt-2">Supports PNG, JPG, or WEBP</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative rounded-3xl overflow-hidden aspect-video border-4 border-slate-50 shadow-2xl">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white px-4 py-2 rounded-xl backdrop-blur-md hover:bg-black/80 transition-all text-sm font-bold"
              >
                Clear Photo
              </button>
            </div>
            
            <button
              onClick={analyzeImage}
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/10 transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={28} />
                  Analyze & Teach Me
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-12 pt-10 border-t border-slate-50 grid grid-cols-2 gap-8">
           <div className="text-left">
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Popular Topics</div>
             <div className="space-y-3">
                {['Business Meetings', 'Lunch/Food', 'SP Street View'].map(ex => (
                  <div key={ex} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <ChevronRight size={16} className="text-emerald-500" />
                    {ex}
                  </div>
                ))}
             </div>
           </div>
           <div className="text-right flex flex-col justify-end">
             <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
               "A picture is worth a thousand words... <br/> especially in Portuguese."
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
