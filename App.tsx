
import React, { useState } from 'react';
import { AppMode, Message, UserProgress } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import LiveVoiceView from './components/LiveVoiceView';
import DashboardView from './components/DashboardView';
import ImageAnalyzer from './components/ImageAnalyzer';
import MobileNav from './components/MobileNav';

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
  totalPracticeMinutes: 145
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Oi Chandler! Tudo bem? Ready for some Portuguese practice today? We can chat, practice some "girias" (slang), or focus on professional terms for your meetings.',
      timestamp: new Date()
    }
  ]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }]);
  };

  const startLessonTopic = (topic: string) => {
    setMode(AppMode.CHAT);
    addMessage({ 
      role: 'user', 
      content: `I'd like a lesson about ${topic}.` 
    });
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.CHAT:
      case AppMode.TEXT_MODE:
      case AppMode.QUICK_HELP:
        return <ChatView mode={mode} messages={messages} onAddMessage={addMessage} />;
      case AppMode.LIVE_VOICE:
        return <LiveVoiceView />;
      case AppMode.DASHBOARD:
        return <DashboardView progress={progress} />;
      case AppMode.IMAGE_ANALYSIS:
        return <ImageAnalyzer onAddMessage={addMessage} />;
      case AppMode.LESSONS:
        return (
          <div className="flex flex-col items-center justify-start sm:justify-center h-full p-6 sm:p-8 text-center bg-slate-50 overflow-y-auto pb-32 sm:pb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-800">Structured Lessons</h2>
            <p className="text-slate-500 mb-8 sm:mb-10 max-w-md">Pick a professional or cultural context to focus on today, Chandler.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl">
              {[
                { title: 'Business Meetings', desc: 'Phrases for professional negotiation and innovation consulting.', icon: '💼' },
                { title: 'SP/Rio Slang', desc: 'Casual communication and WhatsApp abbreviations like "kkk" and "tmj".', icon: '🇧🇷' },
                { title: 'Subjunctive Tense', desc: 'Mastering "se" and "quando" for complex ideas.', icon: '📝' },
                { title: 'Cultural Etiquette', desc: 'Direct vs Indirect communication styles in Brazilian business.', icon: '🤝' }
              ].map(topic => (
                <button 
                  key={topic.title}
                  onClick={() => startLessonTopic(topic.title)}
                  className="p-5 sm:p-6 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all text-left group"
                >
                  <div className="text-3xl mb-3">{topic.icon}</div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-600 mb-1">{topic.title}</div>
                  <div className="text-sm text-slate-400">{topic.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center">Feature under active development...</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentMode={mode} setMode={setMode} />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Header mode={mode} />
          
          <main className="flex-1 relative overflow-hidden">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentMode={mode} setMode={setMode} />
    </div>
  );
};

export default App;