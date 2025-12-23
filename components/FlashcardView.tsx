import React, { useState, useEffect } from 'react';
import { Flashcard, UserProgress, AppMode } from '../types';
import { getDueFlashcards, calculateNextReview, ReviewQuality, getFlashcardStats } from '../utils/spacedRepetition';
import { RotateCcw, CheckCircle, XCircle, Brain, TrendingUp, Archive } from 'lucide-react';

interface FlashcardViewProps {
  userProgress: UserProgress;
  updateProgress: (progress: Partial<UserProgress>) => void;
  setMode: (mode: AppMode) => void;
}

export default function FlashcardView({ userProgress, updateProgress, setMode }: FlashcardViewProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // Load due cards on mount
  useEffect(() => {
    const cards = getDueFlashcards(userProgress.flashcards || []);
    setDueCards(cards);
    if (cards.length === 0) {
      setSessionComplete(true);
    }
  }, [userProgress.flashcards]);

  const currentCard = dueCards[currentCardIndex];
  const progress = dueCards.length > 0 ? ((currentCardIndex + 1) / dueCards.length) * 100 : 100;
  const stats = getFlashcardStats(userProgress.flashcards || []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = (quality: ReviewQuality) => {
    if (!currentCard) return;

    // Update the flashcard with new SM-2 values
    const updatedCard = calculateNextReview(currentCard, quality);

    // Update the flashcards array in user progress
    const updatedFlashcards = (userProgress.flashcards || []).map(card =>
      card.id === updatedCard.id ? updatedCard : card
    );

    updateProgress({ flashcards: updatedFlashcards });

    // Move to next card
    setReviewedCount(prev => prev + 1);
    setIsFlipped(false);

    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    const cards = getDueFlashcards(userProgress.flashcards || []);
    setDueCards(cards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setReviewedCount(0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      if (e.key === ' ' && !isFlipped) {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        switch (e.key) {
          case '1':
            handleReview('again');
            break;
          case '2':
            handleReview('hard');
            break;
          case '3':
            handleReview('good');
            break;
          case '4':
            handleReview('easy');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, sessionComplete, currentCard]);

  // No cards available
  if (sessionComplete && dueCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Brain size={20} />
            Statistics
          </button>
        </div>

        {showStats && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Flashcard Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Cards" value={stats.total} icon="📚" />
              <StatCard label="Mastered" value={stats.mastered} icon="⭐" color="text-green-600" />
              <StatCard label="Learning" value={stats.learning} icon="📖" color="text-blue-600" />
              <StatCard label="Struggling" value={stats.struggling} icon="⚠️" color="text-orange-600" />
              <StatCard label="Archived" value={stats.archived} icon="📦" color="text-gray-600" />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">All Caught Up! 🎉</h2>
          <p className="text-lg text-gray-700">
            No flashcards due today. Come back tomorrow for your next review session!
          </p>
          <div className="bg-white rounded-lg p-6 inline-block">
            <p className="text-sm text-gray-600 mb-2">Next Review</p>
            <p className="text-2xl font-bold text-indigo-600">Tomorrow</p>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => setMode(AppMode.DASHBOARD)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setMode(AppMode.CORRECTION_LIBRARY)}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              View Corrections
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session complete
  if (sessionComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-indigo-100 p-6 rounded-full">
              <CheckCircle size={64} className="text-indigo-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Session Complete! 🎉</h2>
          <p className="text-lg text-gray-700">
            You reviewed <span className="font-bold text-indigo-600">{reviewedCount}</span> flashcard{reviewedCount !== 1 ? 's' : ''} today.
          </p>
          <div className="bg-white rounded-lg p-6 space-y-3">
            <p className="text-sm text-gray-600">Session Summary</p>
            <div className="flex gap-6 justify-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{reviewedCount}</p>
                <p className="text-sm text-gray-600">Reviewed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
                <p className="text-sm text-gray-600">Mastered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.learning}</p>
                <p className="text-sm text-gray-600">Learning</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => setMode(AppMode.DASHBOARD)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Review Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active review session
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flashcard Review</h1>
          <p className="text-gray-600 mt-1">
            {currentCardIndex + 1} of {dueCards.length} cards
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Due Today</p>
          <p className="text-2xl font-bold text-indigo-600">{dueCards.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card Metadata */}
      {currentCard && (
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {currentCard.category}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {currentCard.type}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {currentCard.difficulty}
          </span>
        </div>
      )}

      {/* Flashcard */}
      <div
        className="relative w-full h-96 cursor-pointer perspective-1000"
        onClick={!isFlipped ? handleFlip : undefined}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center h-full text-white">
              <div className="text-center space-y-6">
                <p className="text-3xl font-bold leading-relaxed">{currentCard?.front}</p>
                {currentCard?.hint && (
                  <p className="text-indigo-200 text-lg italic">Hint: {currentCard.hint}</p>
                )}
              </div>
              <div className="absolute bottom-6 text-indigo-200 text-sm animate-pulse">
                Click or press Space to reveal answer
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center h-full text-white">
              <div className="text-center space-y-6 mb-8">
                <p className="text-4xl font-bold">{currentCard?.back}</p>
                {currentCard?.exampleSentence && (
                  <p className="text-emerald-100 text-lg italic max-w-2xl">
                    "{currentCard.exampleSentence}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Buttons (only show when flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => handleReview('again')}
            className="flex flex-col items-center gap-2 p-6 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <XCircle size={32} className="text-red-600" />
            <span className="font-semibold text-red-900">Again</span>
            <span className="text-xs text-red-600">Press 1</span>
          </button>

          <button
            onClick={() => handleReview('hard')}
            className="flex flex-col items-center gap-2 p-6 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <TrendingUp size={32} className="text-orange-600" />
            <span className="font-semibold text-orange-900">Hard</span>
            <span className="text-xs text-orange-600">Press 2</span>
          </button>

          <button
            onClick={() => handleReview('good')}
            className="flex flex-col items-center gap-2 p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <CheckCircle size={32} className="text-blue-600" />
            <span className="font-semibold text-blue-900">Good</span>
            <span className="text-xs text-blue-600">Press 3</span>
          </button>

          <button
            onClick={() => handleReview('easy')}
            className="flex flex-col items-center gap-2 p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <Brain size={32} className="text-green-600" />
            <span className="font-semibold text-green-900">Easy</span>
            <span className="text-xs text-green-600">Press 4</span>
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          {!isFlipped ? (
            <>
              <span className="font-semibold">Keyboard shortcut:</span> Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Space</kbd> to flip
            </>
          ) : (
            <>
              <span className="font-semibold">Rate your recall:</span> 1=Again, 2=Hard, 3=Good, 4=Easy
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'text-gray-900' }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
