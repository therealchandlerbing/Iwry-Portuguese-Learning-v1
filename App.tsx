
import React, { useState, useEffect } from 'react';
import { AppMode, Message, UserProgress, VocabItem, MemoryEntry } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import LiveVoiceView from './components/LiveVoiceView';
import DashboardView from './components/DashboardView';
import ImageAnalyzer from './components/ImageAnalyzer';
import MemoryImportView from './components/MemoryImportView';
import MobileNav from './components/MobileNav';
import LoadingScreen from './components/LoadingScreen';
import EntryScreen from './components/EntryScreen';

const INITIAL_PROGRESS: UserProgress = {
  level: 'A2',
  vocabulary: [
    { word: 'Saudade', meaning: 'Nostalgic longing', confidence: 85, lastPracticed: new Date() },
    { word: 'Gente', meaning: 'People/Us', confidence: 90, lastPracticed: new Date() },
    { word: 'Com certeza', meaning: 'For sure', confidence: 70, lastPracticed: new Date() },
    { word: 'Valeu', meaning: 'Thanks (informal)', confidence: 95, lastPracticed: new Date() }
  ],
  lessonsCompleted: ['Basic Greetings', 'Business Etiquette Intro'],
  grammarMastery: { 'Present Tense': 0.7, 'Future Tense': 0.3, 'Subjunctive': 0.1 },
  totalPracticeMinutes: 145,
  memories: [],
  streak: 12
};

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Oi Chandler! Tudo bem? Ready for some Portuguese practice today? I see you haven\'t imported any new external studies today. Want to add something?',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }]);
  };

  const syncExternalMemory = (analysis: any) => {
    const newMemory: MemoryEntry = {
      id: Date.now().toString(),
      date: new Date(),
      topic: analysis.topic,
      content: `Grammar: ${analysis.grammar}`,
      extractedVocab: analysis.vocab.map((v: any) => v.word),
      type: 'homework'
    };

    const newVocabItems: VocabItem[] = analysis.vocab.map((v: any) => ({
      word: v.word,
      meaning: v.meaning,
      confidence: 10,
      lastPracticed: new Date(),
      source: 'External Study'
    }));

    setProgress(prev => ({
      ...prev,
      memories: [newMemory, ...prev.memories],
      vocabulary: [...prev.vocabulary, ...newVocabItems].slice(-100) // Keep latest 100
    }));

    setMode(AppMode.DASHBOARD);
    addMessage({
      role: 'assistant',
      content: `Ótimo! Importei seu estudo sobre "${analysis.topic}". Já adicionei ${analysis.vocab.length} palavras novas ao seu vocabulário e notei que você está praticando "${analysis.grammar}". Vamos conversar sobre isso?`
    });
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.DASHBOARD:
        return <DashboardView progress={progress} setMode={setMode} />;
      case AppMode.CHAT:
      case AppMode.TEXT_MODE:
      case AppMode.QUICK_HELP:
        return <ChatView mode={mode} messages={messages} onAddMessage={addMessage} memories={progress.memories} />;
      case AppMode.LIVE_VOICE:
        return <LiveVoiceView memories={progress.memories} />;
      case AppMode.DASHBOARD:
        return <DashboardView progress={progress} setMode={setMode} />;
      case AppMode.IMAGE_ANALYSIS:
        return <ImageAnalyzer onAddMessage={addMessage} />;
      case AppMode.IMPORT_MEMORY:
        return <MemoryImportView onImport={syncExternalMemory} />;
      case AppMode.LESSONS:
        return (
          <div className="flex flex-col items-center justify-start h-full p-6 text-center bg-slate-50 overflow-y-auto pb-32">
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Structured Lessons</h2>
            <p className="text-slate-500 mb-8 max-w-md">Tailored modules for Chandler.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
              {[
                { title: 'Business Meetings', icon: '💼' },
                { title: 'SP/Rio Slang', icon: '🇧🇷' },
                { title: 'Subjunctive', icon: '📝' },
                { title: 'Etiquette', icon: '🤝' }
              ].map(topic => (
                <button 
                  key={topic.title}
                  onClick={() => setMode(AppMode.CHAT)}
                  className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 transition-all text-left group"
                >
                  <div className="text-3xl mb-3">{topic.icon}</div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-600">{topic.title}</div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center">Feature under active development...</div>;
    }
  };

  if (isAppLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <EntryScreen onEnter={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900 font-inter">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar currentMode={mode} setMode={setMode} />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Header mode={mode} streak={progress.streak} />
          <main className="flex-1 relative overflow-hidden">
            {renderContent()}
          </main>
        </div>
      </div>
      <MobileNav currentMode={mode} setMode={setMode} />
    </div>
  );
};

export default App;
