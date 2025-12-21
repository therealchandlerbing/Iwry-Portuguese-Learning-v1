
import React, { useState, useEffect } from 'react';
import { AppMode, Message, UserProgress, VocabItem, MemoryEntry, SessionAnalysis } from './types';
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
import LessonsView from './components/LessonsView';
import ReviewSessionView from './components/ReviewSessionView';
import QuizView from './components/QuizView';
import SessionSummaryModal from './components/SessionSummaryModal';
import { analyzeSession } from './services/geminiService';

const INITIAL_PROGRESS: UserProgress = {
  level: 'A2',
  vocabulary: [
    { word: 'Saudade', meaning: 'Nostalgic longing', confidence: 85, lastPracticed: new Date() },
    { word: 'Gente', meaning: 'People/Us', confidence: 90, lastPracticed: new Date() },
    { word: 'Com certeza', meaning: 'For sure', confidence: 70, lastPracticed: new Date() },
    { word: 'Valeu', meaning: 'Thanks (informal)', confidence: 95, lastPracticed: new Date() },
    { word: 'Inovação', meaning: 'Innovation', confidence: 45, lastPracticed: new Date() },
    { word: 'Relatório', meaning: 'Report', confidence: 30, lastPracticed: new Date() }
  ],
  lessonsCompleted: ['Basic Greetings', 'Business Etiquette Intro'],
  grammarMastery: { 'Present Tense': 0.7, 'Future Tense': 0.3, 'Subjunctive': 0.1 },
  totalPracticeMinutes: 145,
  memories: [],
  streak: 12,
  selectedTopics: [],
  lastSessionDate: new Date(),
  sessionCount: 24
};

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [lastAnalysis, setLastAnalysis] = useState<SessionAnalysis | null>(null);
  const [activeQuizTopic, setActiveQuizTopic] = useState<{title: string, description: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Oi Chandler! Tudo bem? Ready for some Portuguese practice today? I see you haven\'t imported any new external studies today. Want to add something?',
      timestamp: new Date()
    }
  ]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fala_comigo_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Fix date strings back to objects
        parsed.lastSessionDate = new Date(parsed.lastSessionDate);
        parsed.vocabulary = parsed.vocabulary.map((v: any) => ({ ...v, lastPracticed: new Date(v.lastPracticed) }));
        parsed.memories = parsed.memories.map((m: any) => ({ ...m, date: new Date(m.date) }));
        setProgress(parsed);
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
    
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Save progress on change
  useEffect(() => {
    localStorage.setItem('fala_comigo_progress', JSON.stringify(progress));
  }, [progress]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }]);
  };

  const startLesson = (prompt: string, customMode: AppMode = AppMode.CHAT) => {
    setMessages([]);
    setMode(customMode);
    addMessage({
      role: 'user',
      content: prompt.startsWith('I want to') ? prompt : `Quero começar a aula: ${prompt}`
    });
  };

  const finishChatSession = async () => {
    if (messages.length < 3) {
      setMode(AppMode.DASHBOARD);
      return;
    }

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    try {
      const analysis: SessionAnalysis = await analyzeSession(history);
      
      setProgress(prev => {
        // 1. Update Vocabulary
        const existingWords = new Set(prev.vocabulary.map(v => v.word.toLowerCase()));
        const filteredNewVocab = analysis.newVocab
          .filter(v => !existingWords.has(v.word.toLowerCase()))
          .map(v => ({ ...v, confidence: 10, lastPracticed: new Date() }));
        
        const updatedVocab = [...prev.vocabulary, ...filteredNewVocab].slice(-200);

        // 2. Update Grammar
        const newGrammarMastery = { ...prev.grammarMastery };
        Object.entries(analysis.grammarPerformance).forEach(([pattern, delta]) => {
          if (newGrammarMastery[pattern] !== undefined) {
            newGrammarMastery[pattern] = Math.max(0, Math.min(1, newGrammarMastery[pattern] + delta));
          } else {
            newGrammarMastery[pattern] = Math.max(0.1, Math.min(1, 0.5 + delta));
          }
        });

        // 3. Update Streak if needed
        const today = new Date().toDateString();
        const last = new Date(prev.lastSessionDate).toDateString();
        let newStreak = prev.streak;
        if (today !== last) {
           newStreak += 1;
        }

        return {
          ...prev,
          vocabulary: updatedVocab,
          grammarMastery: newGrammarMastery,
          sessionCount: prev.sessionCount + 1,
          lastSessionDate: new Date(),
          streak: newStreak
        };
      });

      setLastAnalysis(analysis);
    } catch (err) {
      console.error("Analysis failed", err);
      setMode(AppMode.DASHBOARD);
    }
  };

  const startQuiz = (title: string, description: string) => {
    setActiveQuizTopic({ title, description });
    setMode(AppMode.QUIZ);
  };

  const toggleTopicFocus = (topicId: string) => {
    setProgress(prev => {
      const alreadySelected = prev.selectedTopics.includes(topicId);
      return {
        ...prev,
        selectedTopics: alreadySelected 
          ? prev.selectedTopics.filter(id => id !== topicId)
          : [...prev.selectedTopics, topicId]
      };
    });
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
      vocabulary: [...prev.vocabulary, ...newVocabItems].slice(-200)
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
        return <DashboardView progress={progress} setMode={setMode} onStartLesson={startLesson} />;
      case AppMode.CHAT:
      case AppMode.TEXT_MODE:
      case AppMode.QUICK_HELP:
      case AppMode.REVIEW_SESSION:
        return <ChatView mode={mode} messages={messages} onAddMessage={addMessage} memories={progress.memories} selectedTopics={progress.selectedTopics} onFinish={finishChatSession} />;
      case AppMode.LIVE_VOICE:
        return <LiveVoiceView memories={progress.memories} />;
      case AppMode.IMAGE_ANALYSIS:
        return <ImageAnalyzer onAddMessage={addMessage} />;
      case AppMode.IMPORT_MEMORY:
        return <MemoryImportView onImport={syncExternalMemory} />;
      case AppMode.LESSONS:
        return <LessonsView onStartLesson={startLesson} onStartQuiz={startQuiz} selectedTopics={progress.selectedTopics} onToggleTopic={toggleTopicFocus} />;
      case AppMode.QUIZ:
        return activeQuizTopic ? <QuizView topic={activeQuizTopic} onComplete={() => setMode(AppMode.LESSONS)} /> : <DashboardView progress={progress} setMode={setMode} onStartLesson={startLesson} />;
      default:
        return <ReviewSessionView progress={progress} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} />;
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
      
      {/* Session Summary Overlay */}
      {lastAnalysis && (
        <SessionSummaryModal 
          analysis={lastAnalysis} 
          onClose={() => {
            setLastAnalysis(null);
            setMode(AppMode.DASHBOARD);
          }} 
        />
      )}
    </div>
  );
};

export default App;
