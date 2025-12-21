
import React, { useState, useEffect } from 'react';
import { AppMode, Message, UserProgress, VocabItem, MemoryEntry, SessionAnalysis, DifficultyLevel, CorrectionObject, LessonModule, Badge } from './types';
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
import CorrectionLibraryView from './components/CorrectionLibraryView';
import { analyzeSession, checkGrammar } from './services/geminiService';
import { DEFAULT_BADGES } from './constants';

const INITIAL_PROGRESS: UserProgress = {
  level: 'A2',
  difficulty: DifficultyLevel.INTERMEDIATE,
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
  correctionHistory: [],
  streak: 12,
  selectedTopics: [],
  lastSessionDate: new Date(),
  sessionCount: 24,
  generatedModules: [],
  badges: DEFAULT_BADGES
};

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [lastAnalysis, setLastAnalysis] = useState<SessionAnalysis | null>(null);
  const [activeQuizTopic, setActiveQuizTopic] = useState<{title: string, description: string, questions?: any[]} | null>(null);
  const [newlyEarnedBadgeIds, setNewlyEarnedBadgeIds] = useState<string[]>([]);
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
        parsed.correctionHistory = (parsed.correctionHistory || []).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
        if (!parsed.badges) parsed.badges = DEFAULT_BADGES;
        else {
          parsed.badges = parsed.badges.map((b: any) => b.earnedDate ? { ...b, earnedDate: new Date(b.earnedDate) } : b);
        }
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

  // Badge Logic - Check whenever progress changes
  useEffect(() => {
    const checkBadges = () => {
      let updated = false;
      const newlyEarned: string[] = [];
      const newBadges = progress.badges.map(badge => {
        if (badge.isUnlocked) return badge;

        let shouldUnlock = false;
        switch (badge.category) {
          case 'STREAK':
            if (progress.streak >= badge.threshold) shouldUnlock = true;
            break;
          case 'VOCAB':
            const masteredCount = progress.vocabulary.filter(v => v.confidence >= 80).length;
            if (masteredCount >= badge.threshold) shouldUnlock = true;
            break;
          case 'LESSON':
            if (progress.lessonsCompleted.length >= badge.threshold) shouldUnlock = true;
            break;
          case 'MASTERY':
            const maxMastery = Math.max(...Object.values(progress.grammarMastery));
            if (maxMastery * 100 >= badge.threshold) shouldUnlock = true;
            break;
        }

        if (shouldUnlock) {
          updated = true;
          newlyEarned.push(badge.id);
          return { ...badge, isUnlocked: true, earnedDate: new Date() };
        }
        return badge;
      });

      if (updated) {
        setProgress(prev => ({ ...prev, badges: newBadges }));
        setNewlyEarnedBadgeIds(prev => [...prev, ...newlyEarned]);
      }
    };

    const debounceTimer = setTimeout(checkBadges, 1000);
    return () => clearTimeout(debounceTimer);
  }, [progress.streak, progress.vocabulary, progress.lessonsCompleted, progress.grammarMastery]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }]);
  };

  const handleUserMessage = async (msg: Omit<Message, 'id' | 'timestamp'>) => {
    addMessage(msg);

    if (msg.role === 'user' && (mode === AppMode.CHAT || mode === AppMode.LIVE_VOICE || mode === AppMode.TEXT_MODE)) {
      const correctionResult = await checkGrammar(msg.content, progress.difficulty);
      if (correctionResult.hasError) {
        const correctionObj: CorrectionObject = {
          id: Math.random().toString(36).substr(2, 9),
          incorrect: msg.content,
          corrected: correctionResult.corrected,
          explanation: correctionResult.explanation,
          category: correctionResult.category,
          difficulty: progress.difficulty,
          timestamp: new Date()
        };

        setProgress(prev => ({
          ...prev,
          correctionHistory: [correctionObj, ...prev.correctionHistory].slice(0, 50)
        }));

        addMessage({
          role: 'assistant',
          content: `💡 Dica: No seu último texto, o ideal seria: "${correctionResult.corrected}". ${correctionResult.explanation}`,
          isCorrection: true,
          correctionData: correctionObj
        });
      }
    }
  };

  const setDifficulty = (diff: DifficultyLevel) => {
    setProgress(prev => ({ ...prev, difficulty: diff }));
  };

  const startLesson = (prompt: string, customMode: AppMode = AppMode.CHAT) => {
    setMessages([]);
    setMode(customMode);
    handleUserMessage({
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
        const existingWords = new Set(prev.vocabulary.map(v => v.word.toLowerCase()));
        const filteredNewVocab = analysis.newVocab
          .filter(v => !existingWords.has(v.word.toLowerCase()))
          .map(v => ({ ...v, confidence: 10, lastPracticed: new Date() }));
        
        const updatedVocab = [...prev.vocabulary, ...filteredNewVocab].slice(-200);

        const newGrammarMastery = { ...prev.grammarMastery };
        Object.entries(analysis.grammarPerformance).forEach(([pattern, delta]) => {
          if (newGrammarMastery[pattern] !== undefined) {
            newGrammarMastery[pattern] = Math.max(0, Math.min(1, newGrammarMastery[pattern] + delta));
          } else {
            newGrammarMastery[pattern] = Math.max(0.1, Math.min(1, 0.5 + delta));
          }
        });

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

  const startQuiz = (title: string, description: string, questions?: any[]) => {
    setActiveQuizTopic({ title, description, questions });
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

  const handleSaveCustomModule = (mod: LessonModule) => {
    setProgress(prev => ({
      ...prev,
      generatedModules: [mod, ...prev.generatedModules]
    }));
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
    handleUserMessage({
      role: 'assistant',
      content: `Ótimo! Importei seu estudo sobre "${analysis.topic}". Já adicionei ${analysis.vocab.length} palavras novas ao seu vocabulário e notei que você está praticando "${analysis.grammar}". Vamos conversar sobre isso?`
    });
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.DASHBOARD:
        return <DashboardView progress={progress} setMode={setMode} onStartLesson={startLesson} newlyEarnedBadgeIds={newlyEarnedBadgeIds} clearNewlyEarned={() => setNewlyEarnedBadgeIds([])} />;
      case AppMode.CHAT:
      case AppMode.TEXT_MODE:
      case AppMode.QUICK_HELP:
      case AppMode.REVIEW_SESSION:
        return <ChatView mode={mode} messages={messages} onAddMessage={handleUserMessage} difficulty={progress.difficulty} memories={progress.memories} selectedTopics={progress.selectedTopics} onFinish={finishChatSession} />;
      case AppMode.LIVE_VOICE:
        return <LiveVoiceView memories={progress.memories} difficulty={progress.difficulty} />;
      case AppMode.IMAGE_ANALYSIS:
        return <ImageAnalyzer onAddMessage={handleUserMessage} difficulty={progress.difficulty} />;
      case AppMode.IMPORT_MEMORY:
        return <MemoryImportView onImport={syncExternalMemory} />;
      case AppMode.LESSONS:
        return <LessonsView customModules={progress.generatedModules} onSaveCustomModule={handleSaveCustomModule} onStartLesson={startLesson} onStartQuiz={startQuiz} selectedTopics={progress.selectedTopics} onToggleTopic={toggleTopicFocus} />;
      case AppMode.QUIZ:
        return activeQuizTopic ? <QuizView topic={activeQuizTopic} onComplete={() => setMode(AppMode.LESSONS)} /> : <DashboardView progress={progress} setMode={setMode} onStartLesson={startLesson} newlyEarnedBadgeIds={newlyEarnedBadgeIds} clearNewlyEarned={() => setNewlyEarnedBadgeIds([])} />;
      case AppMode.CORRECTION_LIBRARY:
        return <CorrectionLibraryView history={progress.correctionHistory} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} />;
      default:
        return <ReviewSessionView progress={progress} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} />;
    }
  };

  if (isAppLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <EntryScreen onEnter={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900 font-inter">
      <div className="flex flex-1 overflow-hidden h-full">
        <div className="hidden md:block h-full shrink-0">
          <Sidebar currentMode={mode} setMode={setMode} />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
          <Header mode={mode} streak={progress.streak} difficulty={progress.difficulty} setDifficulty={setDifficulty} />
          <main className="flex-1 relative overflow-hidden">
            {renderContent()}
          </main>
        </div>
      </div>
      <MobileNav currentMode={mode} setMode={setMode} />
      
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
