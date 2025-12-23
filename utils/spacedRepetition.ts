/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * The SM-2 algorithm calculates optimal review intervals based on user performance.
 * It uses an "ease factor" that adjusts based on how difficult the user finds each card.
 *
 * Quality ratings:
 * 0 - Complete blackout (no recall)
 * 1 - Incorrect, but remembered upon seeing answer
 * 2 - Incorrect, but answer seemed easy to recall
 * 3 - Correct, but required significant effort
 * 4 - Correct, with some hesitation
 * 5 - Perfect response, immediate recall
 *
 * For user-friendly interface, we'll map these to:
 * - "Again" (quality 0-2) - Review again soon
 * - "Hard" (quality 3) - Review with shorter interval
 * - "Good" (quality 4) - Standard interval
 * - "Easy" (quality 5) - Longer interval
 */

import { Flashcard } from '../types';

export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

/**
 * Maps user-friendly ratings to SM-2 quality scores (0-5)
 */
export function mapQualityToScore(quality: ReviewQuality): number {
  switch (quality) {
    case 'again':
      return 0;
    case 'hard':
      return 3;
    case 'good':
      return 4;
    case 'easy':
      return 5;
    default:
      return 4;
  }
}

/**
 * Calculates the next review date and updates the flashcard's spaced repetition metadata
 *
 * @param flashcard - The flashcard being reviewed
 * @param quality - User's self-rating of recall difficulty
 * @returns Updated flashcard with new interval, ease factor, and next review date
 */
export function calculateNextReview(
  flashcard: Flashcard,
  quality: ReviewQuality
): Flashcard {
  const q = mapQualityToScore(quality);

  // Calculate new ease factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Minimum EF is 1.3 (prevents cards from becoming too difficult)
  let newEaseFactor = flashcard.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newInterval: number;
  const currentInterval = flashcard.interval;

  // If quality is less than 3, reset the card (start over)
  if (q < 3) {
    newInterval = 1; // Review tomorrow
  } else {
    // First review (n=1): 1 day
    // Second review (n=2): 6 days
    // Subsequent reviews: previous interval * ease factor
    if (flashcard.reviewCount === 0) {
      newInterval = 1;
    } else if (flashcard.reviewCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Update review count only if quality >= 3 (otherwise we're resetting)
  const newReviewCount = q >= 3 ? flashcard.reviewCount + 1 : 0;

  return {
    ...flashcard,
    interval: newInterval,
    easeFactor: newEaseFactor,
    reviewCount: newReviewCount,
    lastReviewed: new Date(),
    nextReviewDate: nextReviewDate,
  };
}

/**
 * Gets all flashcards that are due for review (nextReviewDate <= today)
 *
 * @param flashcards - Array of all flashcards
 * @returns Array of flashcards due today, sorted by priority (oldest first)
 */
export function getDueFlashcards(flashcards: Flashcard[]): Flashcard[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  return flashcards
    .filter(card => !card.isArchived)
    .filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    })
    .sort((a, b) => {
      // Sort by next review date (oldest/most overdue first)
      return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
    });
}

/**
 * Gets count of flashcards due today
 */
export function getDueCount(flashcards: Flashcard[]): number {
  return getDueFlashcards(flashcards).length;
}

/**
 * Creates a new flashcard with default spaced repetition values
 *
 * @param front - Question text
 * @param back - Answer text
 * @param type - Card type
 * @param category - Category/topic
 * @param difficulty - Difficulty level
 * @param sourceType - Where the card was created from
 * @param sourceId - Optional reference to source item
 * @returns New flashcard with SM-2 defaults
 */
export function createFlashcard(
  front: string,
  back: string,
  type: Flashcard['type'],
  category: string,
  difficulty: Flashcard['difficulty'],
  sourceType: Flashcard['sourceType'],
  sourceId?: string,
  hint?: string,
  exampleSentence?: string
): Flashcard {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    id: crypto.randomUUID(),
    front,
    back,
    type,
    category,
    difficulty,
    sourceType,
    sourceId,
    hint,
    exampleSentence,

    // SM-2 defaults
    nextReviewDate: tomorrow, // New cards are due tomorrow
    interval: 1,
    easeFactor: 2.5, // Default ease factor
    reviewCount: 0,
    lastReviewed: null,

    createdDate: now,
    isArchived: false,
  };
}

/**
 * Gets statistics about flashcard review performance
 */
export function getFlashcardStats(flashcards: Flashcard[]) {
  const activeCards = flashcards.filter(c => !c.isArchived);
  const dueCards = getDueFlashcards(flashcards);

  const masteredCards = activeCards.filter(c => c.reviewCount >= 5 && c.easeFactor >= 2.5);
  const learningCards = activeCards.filter(c => c.reviewCount < 5);
  const strugglingCards = activeCards.filter(c => c.easeFactor < 2.0);

  return {
    total: activeCards.length,
    dueToday: dueCards.length,
    mastered: masteredCards.length,
    learning: learningCards.length,
    struggling: strugglingCards.length,
    archived: flashcards.filter(c => c.isArchived).length,
  };
}
