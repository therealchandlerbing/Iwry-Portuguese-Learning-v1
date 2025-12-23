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

// SM-2 Algorithm Constants
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_PASSING_QUALITY = 3; // Quality score threshold for successful review
const MASTERY_REVIEW_COUNT = 5; // Reviews needed for mastery
const MASTERY_EASE_FACTOR = 2.5; // Ease factor threshold for mastery

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

  // Calculate new ease factor (EF) only if card is not being reset
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Bounded between MIN_EASE_FACTOR and MAX_EASE_FACTOR
  let newEaseFactor = flashcard.easeFactor;

  if (q >= MIN_PASSING_QUALITY) {
    newEaseFactor = flashcard.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEaseFactor < MIN_EASE_FACTOR) {
      newEaseFactor = MIN_EASE_FACTOR;
    }
    if (newEaseFactor > MAX_EASE_FACTOR) {
      newEaseFactor = MAX_EASE_FACTOR;
    }
  }

  let newInterval: number;
  const currentInterval = flashcard.interval;

  // If quality is less than MIN_PASSING_QUALITY, reset the card (start over)
  if (q < MIN_PASSING_QUALITY) {
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

  // Update review count only if quality >= MIN_PASSING_QUALITY (otherwise we're resetting)
  const newReviewCount = q >= MIN_PASSING_QUALITY ? flashcard.reviewCount + 1 : 0;

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
  // Create today's date at midnight (avoid mutation)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return flashcards
    .filter(card => !card.isArchived)
    .filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      const reviewDateMidnight = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
      return reviewDateMidnight <= today;
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
    easeFactor: DEFAULT_EASE_FACTOR,
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

  const masteredCards = activeCards.filter(c => c.reviewCount >= MASTERY_REVIEW_COUNT && c.easeFactor >= MASTERY_EASE_FACTOR);
  const learningCards = activeCards.filter(c => c.reviewCount < MASTERY_REVIEW_COUNT);
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
