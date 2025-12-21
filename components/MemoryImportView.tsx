
import React, { useState, useRef } from 'react';
import { Upload, FileText, Camera, Loader2, Sparkles, CheckCircle, ChevronLeft } from 'lucide-react';
import { analyzeMemory } from '../services/geminiService';

interface MemoryImportViewProps {
  onImport: (analysis: any) => void;
}

const MemoryImportView: React.FC<MemoryImportViewProps> = ({ onImport }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImport = async () => {
    if (!text && !image) return;
    setLoading(true);
    try {
      const result = await analyzeMemory(image || text, !!image);
      onImport(result);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="p-6 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Grow Iwry's Memory</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Upload your homework, meeting notes, or an article you read. Iwry will learn what you're studying outside the app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-slate-400" size={20} />
              <h3 className="font-bold text-slate-800">Paste Text</h3>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste Portuguese text from your notes..."
              className="flex-1 min-h-[200px] w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm"
              disabled={!!image || loading}
            />
          </div>

          {/* Image Input */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="text-slate-400" size={20} />
              <h3 className="font-bold text-slate-800">Upload Photo</h3>
            </div>
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all min-h-[200px]"
              >
                <Upload className="text-slate-300 mb-2" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click to upload</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="relative flex-1 rounded-2xl overflow-hidden min-h-[200px]">
                <img src={image} className="absolute inset-0 w-full h-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg text-xs font-bold backdrop-blur-md"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={processImport}
          disabled={loading || (!text && !image)}
          className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Analyzing with AI...
            </>
          ) : (
            <>
              <CheckCircle size={24} />
              Sync with Iwry
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MemoryImportView;
