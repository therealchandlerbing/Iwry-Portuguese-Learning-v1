
import React, { useState, useEffect, useRef } from 'react';
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
import FlashcardView from './components/FlashcardView';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeSession, checkGrammar } from './services/geminiService';
import { DEFAULT_BADGES } from './constants';
import { autoGenerateAllFlashcards } from './utils/flashcardGenerator';

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
  badges: DEFAULT_BADGES,
  flashcards: []
};

// Progress sync interval (5 minutes)
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

// Sync progress to server
const syncProgressToServer = async (progress: UserProgress): Promise<boolean> => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;

  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        progress,
        clientTimestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync progress:', error);
    return false;
  }
};

// Load progress from server
const loadProgressFromServer = async (): Promise<UserProgress | null> => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const response = await fetch('/api/progress', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      return data.progress;
    }
    return null;
  } catch (error) {
    console.error('Failed to load progress from server:', error);
    return null;
  }
};

// Merge server progress with local progress (conflict resolution)
const mergeProgress = (local: UserProgress, server: UserProgress): UserProgress => {
  const localDate = new Date(local.lastSessionDate).getTime();
  const serverDate = new Date(server.lastSessionDate).getTime();

  // Merge vocabulary - union of both, keeping higher confidence
  const vocabMap = new Map<string, VocabItem>();
  [...local.vocabulary, ...server.vocabulary].forEach(item => {
    const key = item.word.toLowerCase();
    const existing = vocabMap.get(key);
    if (!existing || item.confidence > existing.confidence) {
      vocabMap.set(key, item);
    }
  });

  // Take maximum values for numeric fields
  const mergedStreak = Math.max(local.streak, server.streak);
  const mergedSessionCount = Math.max(local.sessionCount, server.sessionCount);
  const mergedPracticeMinutes = Math.max(local.totalPracticeMinutes, server.totalPracticeMinutes);

  // Use the more recent base, but merge in specific fields
  const base = serverDate > localDate ? server : local;

  return {
    ...base,
    vocabulary: Array.from(vocabMap.values()).slice(-200),
    streak: mergedStreak,
    sessionCount: mergedSessionCount,
    totalPracticeMinutes: mergedPracticeMinutes,
    lessonsCompleted: [...new Set([...local.lessonsCompleted, ...server.lessonsCompleted])],
    lastSessionDate: new Date(Math.max(localDate, serverDate))
  };
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
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const progressRef = useRef<UserProgress>(INITIAL_PROGRESS);
  const prevCorrectionsLengthRef = useRef<number>(0);
  const prevVocabularyLengthRef = useRef<number>(0);

  // Keep progressRef in sync with progress state
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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

  const parseProgressDates = (data: any): UserProgress => {
    const parsed = { ...data };
    parsed.lastSessionDate = new Date(parsed.lastSessionDate);
    parsed.vocabulary = (parsed.vocabulary || []).map((v: any) => ({ ...v, lastPracticed: new Date(v.lastPracticed) }));
    parsed.memories = (parsed.memories || []).map((m: any) => ({ ...m, date: new Date(m.date) }));
    parsed.correctionHistory = (parsed.correctionHistory || []).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
    parsed.sessionLogs = (parsed.sessionLogs || []).map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
      messages: log.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
    }));
    parsed.flashcards = (parsed.flashcards || []).map((f: any) => ({
      ...f,
      nextReviewDate: new Date(f.nextReviewDate),
      lastReviewed: f.lastReviewed ? new Date(f.lastReviewed) : null,
      createdDate: new Date(f.createdDate)
    }));
    if (!parsed.badges) parsed.badges = DEFAULT_BADGES;
    else {
      parsed.badges = parsed.badges.map((b: any) => b.earnedDate ? { ...b, earnedDate: new Date(b.earnedDate) } : b);
    }
    return parsed;
  };

  const loadProgress = async () => {
    let localProgress: UserProgress | null = null;

    // Load from localStorage first
    const saved = localStorage.getItem('fala_comigo_progress');
    if (saved) {
      try {
        localProgress = parseProgressDates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local progress", e);
      }
    }

    // Try to load from server and merge
    try {
      const serverProgress = await loadProgressFromServer();
      if (serverProgress) {
        const parsedServer = parseProgressDates(serverProgress);
        if (localProgress) {
          // Merge local and server progress
          const merged = mergeProgress(localProgress, parsedServer);
          setProgress(merged);
          // Sync merged data back to server
          syncProgressToServer(merged);
        } else {
          setProgress(parsedServer);
        }
      } else if (localProgress) {
        setProgress(localProgress);
        // Sync local progress to server for new users
        syncProgressToServer(localProgress);
      }
    } catch (e) {
      console.error("Failed to load server progress", e);
      if (localProgress) {
        setProgress(localProgress);
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

  // Auto-generate flashcards from corrections and vocabulary
  // Only processes NEW items (slice from previous length) to avoid re-iterating over all items
  useEffect(() => {
    const currentCorrectionsLength = progress.correctionHistory.length;
    const currentVocabularyLength = progress.vocabulary.length;

    // Only process if there are NEW items (length increased)
    const hasNewCorrections = currentCorrectionsLength > prevCorrectionsLengthRef.current;
    const hasNewVocabulary = currentVocabularyLength > prevVocabularyLengthRef.current;

    if (hasNewCorrections || hasNewVocabulary) {
      // Only process the NEW items, not all items
      const newCorrections = hasNewCorrections
        ? progress.correctionHistory.slice(prevCorrectionsLengthRef.current)
        : [];
      const newVocabulary = hasNewVocabulary
        ? progress.vocabulary.slice(prevVocabularyLengthRef.current)
        : [];

      const newFlashcards = autoGenerateAllFlashcards(
        newCorrections,
        newVocabulary,
        progress.flashcards || []
      );

      if (newFlashcards.length > 0) {
        setProgress(prev => ({
          ...prev,
          flashcards: [...(prev.flashcards || []), ...newFlashcards]
        }));
      }

      // Update refs to current lengths
      prevCorrectionsLengthRef.current = currentCorrectionsLength;
      prevVocabularyLengthRef.current = currentVocabularyLength;
    }
  }, [progress.correctionHistory.length, progress.vocabulary.length]);

  // Periodic sync to server (every 5 minutes of activity)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Start periodic sync interval
    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      // Only sync if there's been activity (we're in a tracked mode)
      if (TRACKED_MODES.includes(mode) && now - lastSyncRef.current >= SYNC_INTERVAL_MS) {
        // Use ref to get latest progress without causing effect to re-run
        syncProgressToServer(progressRef.current);
        lastSyncRef.current = now;
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isAuthenticated, mode]);

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

        const newProgress = {
          ...prev,
          vocabulary: updatedVocab,
          grammarMastery: newGrammarMastery,
          sessionCount: prev.sessionCount + 1,
          lastSessionDate: new Date(),
          streak: newStreak,
          lessonsCompleted: updatedLessonsCompleted,
          sessionLogs: [newLog, ...(prev.sessionLogs || [])].slice(0, 30)
        };

        // Sync progress to server with the new state (avoids race condition)
        syncProgressToServer(newProgress);

        return newProgress;
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
      const newProgress = {
        ...prev,
        vocabulary: [
          ...prev.vocabulary,
          { word, meaning, confidence: 10, lastPracticed: new Date(), source: 'Dictionary' }
        ].slice(-200)
      };
      // Sync to server after saving vocabulary
      syncProgressToServer(newProgress);
      return newProgress;
    });
  };

  // Boost confidence when an existing word is looked up in dictionary
  const handleBoostConfidence = (word: string) => {
    setProgress(prev => {
      const newVocabulary = prev.vocabulary.map(v => {
        if (v.word.toLowerCase() === word.toLowerCase()) {
          return {
            ...v,
            confidence: Math.min(100, v.confidence + 5), // Increase by 5, cap at 100
            lastPracticed: new Date()
          };
        }
        return v;
      });
      const newProgress = { ...prev, vocabulary: newVocabulary };
      syncProgressToServer(newProgress);
      return newProgress;
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
        return <LiveVoiceView memories={progress.memories} difficulty={progress.difficulty} userName={user?.name || 'Student'} />;
      case AppMode.IMAGE_ANALYSIS:
        return <ImageAnalyzer onAddMessage={handleUserMessage} difficulty={progress.difficulty} />;
      case AppMode.DICTIONARY:
        return <DictionaryView onSaveWord={handleSaveDictionaryWord} onBoostConfidence={handleBoostConfidence} savedWords={progress.vocabulary} />;
      case AppMode.IMPORT_MEMORY:
        return <MemoryImportView onImport={syncExternalMemory} />;
      case AppMode.LESSONS:
        return <LessonsView customModules={progress.generatedModules} onSaveCustomModule={handleSaveCustomModule} onStartLesson={startLesson} onStartQuiz={startQuiz} selectedTopics={progress.selectedTopics} onToggleTopic={toggleTopicFocus} lessonsCompleted={progress.lessonsCompleted} />;
      case AppMode.QUIZ:
        return activeQuizTopic ? <QuizView topic={activeQuizTopic} onComplete={() => setMode(AppMode.LESSONS)} /> : <DashboardView progress={progress} setMode={setMode} onStartLesson={startLesson} newlyEarnedBadgeIds={newlyEarnedBadgeIds} clearNewlyEarned={() => setNewlyEarnedBadgeIds([])} />;
      case AppMode.FLASHCARDS:
        return <FlashcardView userProgress={progress} updateProgress={(partial) => setProgress(prev => ({ ...prev, ...partial }))} setMode={setMode} />;
      case AppMode.CORRECTION_LIBRARY:
        return <CorrectionLibraryView history={progress.correctionHistory} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} />;
      case AppMode.LEARNING_LOG:
        return <LearningLogView logs={progress.sessionLogs} />;
      default:
        return <ReviewSessionView progress={progress} onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)} userName={user?.name || 'your'} />;
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
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Pular para o conteúdo principal
      </a>
      <div className="flex flex-1 overflow-hidden h-full">
        <nav className="hidden md:block h-full shrink-0" aria-label="Navegação principal">
          <Sidebar progress={progress} currentMode={mode} setMode={setMode} userName={user?.name} onLogout={handleLogout} />
        </nav>
        <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
          <Header mode={mode} streak={progress.streak} difficulty={progress.difficulty} setDifficulty={setDifficulty} />
          <main id="main-content" className="flex-1 relative overflow-hidden" role="main">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
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
