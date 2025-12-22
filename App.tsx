
import React, { useState, useEffect } from 'react';
import { AppMode, Message, UserProgress, VocabItem, MemoryEntry, SessionAnalysis, DifficultyLevel, CorrectionObject, LessonModule, Badge, ChatSessionLog } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import LiveVoiceView from './components/LiveVoiceView';
import DashboardView from './components/DashboardView';
import ImageAnalyzer from './components/ImageAnalyzer';
import MemoryImportView from './components/MemoryImportView';
import MobileNav from './components/MobileNav';
import LoadingScreen from './components/LoadingScreen';
import SetupPage from './components/SetupPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LessonsView from './components/LessonsView';
import ReviewSessionView from './components/ReviewSessionView';
import QuizView from './components/QuizView';
import SessionSummaryModal from './components/SessionSummaryModal';
import CorrectionLibraryView from './components/CorrectionLibraryView';
import LearningLogView from './components/LearningLogView';
import DictionaryView from './components/DictionaryView';
import { analyzeSession, checkGrammar } from './services/geminiService';
import { DEFAULT_BADGES } from './constants';

interface AuthUser {
  id: number;
  email: string;
  name: string;
}

type AuthView = 'login' | 'register';

const INITIAL_PROGRESS: UserProgress = {
  level: 'A1',
  difficulty: DifficultyLevel.BEGINNER,
  vocabulary: [],
  lessonsCompleted: [],
  grammarMastery: { 
    'Present Tense': 0.0, 
    'Future Tense': 0.0, 
    'Subjunctive': 0.0,
    'Prepositions': 0.0,
    'Pronouns': 0.0
  },
  totalPracticeMinutes: 0,
  memories: [],
  correctionHistory: [],
  sessionLogs: [],
  streak: 0,
  selectedTopics: [],
  lastSessionDate: new Date(),
  sessionCount: 0,
  generatedModules: [],
  badges: DEFAULT_BADGES
};

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isDbSetup, setIsDbSetup] = useState(false);
  const [isCheckingDb, setIsCheckingDb] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [lastAnalysis, setLastAnalysis] = useState<SessionAnalysis | null>(null);
  const [activeQuizTopic, setActiveQuizTopic] = useState<{title: string, description: string, questions?: any[]} | null>(null);
  const [newlyEarnedBadgeIds, setNewlyEarnedBadgeIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState<string | null>(null);

  // Track active learning modes for practice minutes
  const TRACKED_MODES = [
    AppMode.CHAT, AppMode.TEXT_MODE, AppMode.LIVE_VOICE,
    AppMode.LESSONS, AppMode.QUIZ, AppMode.REVIEW_SESSION
  ];

  // Check database setup status
  useEffect(() => {
    const checkDbSetup = async () => {
      try {
        const response = await fetch('/api/setup');
        const data = await response.json();

        if (data.connected && data.tables?.users && data.tables?.sessions && data.tables?.user_progress) {
          setIsDbSetup(true);
        }
      } catch (error) {
        console.error('Failed to check database status:', error);
      } finally {
        setIsCheckingDb(false);
      }
    };

    checkDbSetup();
  }, []);

  // Check for existing auth token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAppLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);

          // Load user progress from localStorage
          loadProgress();
        } else {
          // Invalid token, clear it
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsAppLoading(false);
      }
    };

    if (isDbSetup) {
      checkAuth();
    } else if (!isCheckingDb) {
      setIsAppLoading(false);
    }
  }, [isDbSetup, isCheckingDb]);

  const loadProgress = () => {
    const saved = localStorage.getItem('fala_comigo_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.lastSessionDate = new Date(parsed.lastSessionDate);
        parsed.vocabulary = (parsed.vocabulary || []).map((v: any) => ({ ...v, lastPracticed: new Date(v.lastPracticed) }));
        parsed.memories = (parsed.memories || []).map((m: any) => ({ ...m, date: new Date(m.date) }));
        parsed.correctionHistory = (parsed.correctionHistory || []).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
        parsed.sessionLogs = (parsed.sessionLogs || []).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          messages: log.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        if (!parsed.badges) parsed.badges = DEFAULT_BADGES;
        else {
          parsed.badges = parsed.badges.map((b: any) => b.earnedDate ? { ...b, earnedDate: new Date(b.earnedDate) } : b);
        }
        setProgress(parsed);
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  };

  const handleLogin = (token: string, userData: AuthUser) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
    loadProgress();

    // Set initial welcome message with user's name
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hi ${userData.name}! I'm Iwry, your Brazilian Portuguese coach. Ready to start your journey to fluency? How can I help you today?`,
      timestamp: new Date()
    }]);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    setMessages([]);
    setMode(AppMode.DASHBOARD);
  };

  useEffect(() => {
    localStorage.setItem('fala_comigo_progress', JSON.stringify(progress));
  }, [progress]);

  // Track practice minutes when entering/leaving tracked modes
  useEffect(() => {
    if (TRACKED_MODES.includes(mode)) {
      // Entering a tracked mode - start timer
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
    } else if (sessionStartTime) {
      // Leaving a tracked mode - calculate and save minutes
      const minutes = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000);
      if (minutes > 0) {
        setProgress(prev => ({
          ...prev,
          totalPracticeMinutes: prev.totalPracticeMinutes + minutes
        }));
      }
      setSessionStartTime(null);
    }
  }, [mode]);

  // Save practice minutes before page unload to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionStartTime && TRACKED_MODES.includes(mode)) {
        const minutes = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000);
        if (minutes > 0) {
          // Synchronously update localStorage before page closes
          const savedProgress = localStorage.getItem('fala_comigo_progress');
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              parsed.totalPracticeMinutes = (parsed.totalPracticeMinutes || 0) + minutes;
              localStorage.setItem('fala_comigo_progress', JSON.stringify(parsed));
            } catch (e) {
              console.error('Failed to save practice minutes on unload', e);
            }
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStartTime, mode]);

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
            const masteryValues = Object.values(progress.grammarMastery) as number[];
            const maxMastery = masteryValues.length > 0 ? Math.max(...masteryValues) : 0;
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
      const result = await checkGrammar(msg.content, progress.difficulty);
      if (result && result.hasError) {
        const correctionObj: CorrectionObject = {
          id: Math.random().toString(36).substr(2, 9),
          incorrect: msg.content,
          corrected: result.corrected,
          explanation: result.explanation,
          category: result.category,
          difficulty: progress.difficulty,
          timestamp: new Date()
        };

        setProgress(prev => ({
          ...prev,
          correctionHistory: [correctionObj, ...prev.correctionHistory].slice(0, 50)
        }));

        addMessage({
          role: 'assistant',
          content: `💡 Coach Tip: Try saying "${result.corrected}". ${result.explanation}`,
          isCorrection: true,
          correctionData: correctionObj
        });
      }
    }
  };

  const setDifficulty = (diff: DifficultyLevel) => {
    const levelMap = {
      [DifficultyLevel.BEGINNER]: 'A1',
      [DifficultyLevel.INTERMEDIATE]: 'A2',
      [DifficultyLevel.ADVANCED]: 'B2',
    };
    setProgress(prev => ({ ...prev, difficulty: diff, level: levelMap[diff] || prev.level }));
  };

  const startLesson = (prompt: string, customMode: AppMode = AppMode.CHAT, submoduleId?: string) => {
    setMessages([]);
    setMode(customMode);
    setActiveSubmoduleId(submoduleId || null);
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
    const currentMode = mode;
    const currentMessages = [...messages];
    const currentDifficulty = progress.difficulty;
    const currentSubmoduleId = activeSubmoduleId;

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

        // Calculate streak based on consecutive days (using UTC for timezone consistency)
        const today = new Date();
        const lastSession = new Date(prev.lastSessionDate);

        // Normalize to UTC date only (no time) for consistent timezone handling
        const todayDateUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
        const lastDateUTC = Date.UTC(lastSession.getUTCFullYear(), lastSession.getUTCMonth(), lastSession.getUTCDate());

        const diffDays = Math.floor((todayDateUTC - lastDateUTC) / (1000 * 60 * 60 * 24));

        let newStreak = prev.streak;
        if (diffDays === 0) {
          // Same day - no change
          newStreak = prev.streak;
        } else if (diffDays === 1) {
          // Yesterday - increment
          newStreak = prev.streak + 1;
        } else {
          // Missed days - reset
          newStreak = 1;
        }

        const newLog: ChatSessionLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          mode: currentMode,
          summary: analysis.summaryText,
          messages: currentMessages,
          newVocabCount: filteredNewVocab.length,
          difficulty: currentDifficulty
        };

        // Track lesson completion if we have an active submodule
        let updatedLessonsCompleted = prev.lessonsCompleted;
        if (currentSubmoduleId && !prev.lessonsCompleted.includes(currentSubmoduleId)) {
          updatedLessonsCompleted = [...prev.lessonsCompleted, currentSubmoduleId];
        }

        return {
          ...prev,
          vocabulary: updatedVocab,
          grammarMastery: newGrammarMastery,
          sessionCount: prev.sessionCount + 1,
          lastSessionDate: new Date(),
          streak: newStreak,
          lessonsCompleted: updatedLessonsCompleted,
          sessionLogs: [newLog, ...(prev.sessionLogs || [])].slice(0, 30)
        };
      });

      setActiveSubmoduleId(null);
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
      content: `Awesome! I've imported your study on "${analysis.topic}". I've added ${analysis.vocab.length} new words to your vocabulary bank.`
    });
  };

  const handleSaveDictionaryWord = (word: string, meaning: string) => {
    setProgress(prev => {
      const exists = prev.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase());
      if (exists) return prev;
      return {
        ...prev,
        vocabulary: [
          ...prev.vocabulary,
          { word, meaning, confidence: 10, lastPracticed: new Date(), source: 'Dictionary' }
        ].slice(-200)
      };
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
      case AppMode.DICTIONARY:
        return <DictionaryView onSaveWord={handleSaveDictionaryWord} savedWords={progress.vocabulary} />;
      case AppMode.IMPORT_MEMORY:
        return <MemoryImportView onImport={syncExternalMemory} />;
      case AppMode.LESSONS:
        return <LessonsView customModules={progress.generatedModules} onSaveCustomModule={handleSaveCustomModule} onStartLesson={startLesson} onStartQuiz={startQuiz} selectedTopics={progress.selectedTopics} onToggleTopic={toggleTopicFocus} lessonsCompleted={progress.lessonsCompleted} />;
      case AppMode.QUIZ:
        return activeQuizTopic ? <QuizView topic={activeQuizTopic} onComplete={() => setMode(AppMode.LESSONS)} /> : <DashboardView progress={progress} setMode={setMode} onStartLesson={startLesson} newlyEarnedBadgeIds={newlyEarnedBadgeIds} clearNewlyEarned={() => setNewlyEarnedBadgeIds([])} />;
      case AppMode.CORRECTION_LIBRARY:
        return <CorrectionLibraryView history={progress.correctionHistory} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} />;
      case AppMode.LEARNING_LOG:
        return <LearningLogView logs={progress.sessionLogs} />;
      default:
        return <ReviewSessionView progress={progress} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} />;
    }
  };

  if (isAppLoading || isCheckingDb) return <LoadingScreen />;

  // Show setup page if database is not configured
  if (!isDbSetup) {
    return <SetupPage onSetupComplete={() => setIsDbSetup(true)} />;
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegister={handleLogin}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900 font-inter">
      <div className="flex flex-1 overflow-hidden h-full">
        <div className="hidden md:block h-full shrink-0">
          <Sidebar progress={progress} currentMode={mode} setMode={setMode} userName={user?.name} onLogout={handleLogout} />
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
