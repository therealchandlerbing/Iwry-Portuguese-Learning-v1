/**
 * Flashcard Auto-Generation Utilities
 *
 * Automatically creates flashcards from:
 * - Grammar corrections (from Corrections Hub)
 * - Vocabulary items (from Dictionary)
 * - Lesson content (future enhancement)
 */

import { Flashcard, CorrectionObject, VocabItem, DifficultyLevel } from '../types';
import { createFlashcard } from './spacedRepetition';

/**
 * Generates a flashcard from a grammar correction
 *
 * Creates a fill-in-the-blank or grammar-focused card
 */
export function generateFlashcardFromCorrection(correction: CorrectionObject): Flashcard {
  // Create a fill-in-blank style card
  const front = `Correct this sentence:\n"${correction.incorrect}"`;
  const back = `${correction.corrected}\n\n📚 ${correction.explanation}`;

  return createFlashcard(
    front,
    back,
    'grammar',
    correction.category,
    correction.difficulty,
    'correction',
    correction.id,
    'Think about the grammar rule',
    correction.corrected
  );
}

/**
 * Generates a flashcard from a vocabulary item
 *
 * Creates a translation card (English → Portuguese)
 */
export function generateFlashcardFromVocab(vocabItem: VocabItem): Flashcard {
  // Determine difficulty based on confidence
  let difficulty: DifficultyLevel = DifficultyLevel.BEGINNER;
  if (vocabItem.confidence > 50 && vocabItem.confidence <= 80) {
    difficulty = DifficultyLevel.INTERMEDIATE;
  } else if (vocabItem.confidence > 80) {
    difficulty = DifficultyLevel.ADVANCED;
  }

  const front = `Como se diz em português?\n"${vocabItem.meaning}"`;
  const back = vocabItem.word;

  return createFlashcard(
    front,
    back,
    'translation',
    'Vocabulary',
    difficulty,
    'vocabulary',
    vocabItem.word,
    undefined,
    vocabItem.source
  );
}

/**
 * Auto-generates missing flashcards from corrections
 *
 * Only creates flashcards for corrections that don't already have one
 */
export function autoGenerateCorrectionsFlashcards(
  corrections: CorrectionObject[],
  existingFlashcards: Flashcard[]
): Flashcard[] {
  const existingCorrectionIds = new Set(
    existingFlashcards
      .filter(card => card.sourceType === 'correction')
      .map(card => card.sourceId)
  );

  const newFlashcards: Flashcard[] = [];

  for (const correction of corrections) {
    // Skip if flashcard already exists for this correction
    if (existingCorrectionIds.has(correction.id)) {
      continue;
    }

    newFlashcards.push(generateFlashcardFromCorrection(correction));
  }

  return newFlashcards;
}

/**
 * Auto-generates missing flashcards from vocabulary
 *
 * Only creates flashcards for vocabulary that don't already have one
 */
export function autoGenerateVocabFlashcards(
  vocabulary: VocabItem[],
  existingFlashcards: Flashcard[]
): Flashcard[] {
  const existingVocabWords = new Set(
    existingFlashcards
      .filter(card => card.sourceType === 'vocabulary')
      .map(card => card.sourceId)
  );

  const newFlashcards: Flashcard[] = [];

  for (const vocabItem of vocabulary) {
    // Skip if flashcard already exists for this word
    if (existingVocabWords.has(vocabItem.word)) {
      continue;
    }

    newFlashcards.push(generateFlashcardFromVocab(vocabItem));
  }

  return newFlashcards;
}

/**
 * Auto-generates all missing flashcards from user progress
 *
 * Combines corrections and vocabulary generation
 */
export function autoGenerateAllFlashcards(
  corrections: CorrectionObject[],
  vocabulary: VocabItem[],
  existingFlashcards: Flashcard[]
): Flashcard[] {
  const correctionCards = autoGenerateCorrectionsFlashcards(corrections, existingFlashcards);
  const vocabCards = autoGenerateVocabFlashcards(vocabulary, existingFlashcards);

  return [...correctionCards, ...vocabCards];
}

/**
 * Deletes flashcard when source is removed
 *
 * Use this when a user deletes a correction or vocabulary item
 */
export function deleteFlashcardsForSource(
  flashcards: Flashcard[],
  sourceType: 'correction' | 'vocabulary',
  sourceId: string
): Flashcard[] {
  return flashcards.filter(
    card => !(card.sourceType === sourceType && card.sourceId === sourceId)
  );
}

/**
 * Creates a custom flashcard from user input
 */
export function createCustomFlashcard(
  front: string,
  back: string,
  category: string,
  difficulty: DifficultyLevel,
  hint?: string
): Flashcard {
  return createFlashcard(
    front,
    back,
    'grammar', // Default to grammar for custom cards
    category,
    difficulty,
    'custom',
    undefined,
    hint
  );
}
