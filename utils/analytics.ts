/**
 * Analytics utilities for tracking user behavior and performance
 * Uses Vercel Analytics when available, falls back to console logging in development
 */

// Check if we're in production
const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  !window.location.hostname.includes('127.0.0.1');

// Dynamic import flag for Vercel Analytics
let vercelAnalytics: any = null;
let isAnalyticsLoaded = false;

/**
 * Initialize analytics - called from index.tsx
 */
export async function initAnalytics(): Promise<void> {
  if (isAnalyticsLoaded) return;

  if (isProduction) {
    try {
      // Vercel Analytics is automatically injected by Vercel
      // but we can also track custom events
      vercelAnalytics = await import('https://esm.sh/@vercel/analytics@1');
      isAnalyticsLoaded = true;
      console.log('Analytics initialized');
    } catch (err) {
      console.warn('Failed to load Vercel Analytics:', err);
    }
  } else {
    console.log('Analytics: Development mode, using console logging');
    isAnalyticsLoaded = true;
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>
): void {
  // Sanitize properties to ensure no PII
  const sanitizedProps = properties ? sanitizeProperties(properties) : undefined;

  if (vercelAnalytics?.track) {
    vercelAnalytics.track(name, sanitizedProps);
  } else if (!isProduction) {
    console.log('[Analytics Event]', name, sanitizedProps);
  }
}

/**
 * Sanitize properties to remove potential PII
 */
function sanitizeProperties(
  props: Record<string, string | number | boolean>
): Record<string, string | number | boolean> {
  const sensitivePatterns = [
    /email/i,
    /password/i,
    /token/i,
    /key/i,
    /secret/i,
    /phone/i,
    /address/i,
  ];

  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(props)) {
    const isSensitive = sensitivePatterns.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Pre-defined event tracking functions for common user actions

/**
 * Track when a user starts a learning session
 */
export function trackSessionStarted(mode: string, difficulty: string): void {
  trackEvent('session_started', { mode, difficulty });
}

/**
 * Track when a user completes a learning session
 */
export function trackSessionCompleted(
  mode: string,
  durationSeconds: number,
  vocabLearned: number
): void {
  trackEvent('session_completed', {
    mode,
    duration: durationSeconds,
    vocab_learned: vocabLearned,
  });
}

/**
 * Track when a user starts a lesson
 */
export function trackLessonStarted(moduleId: string, lessonId: string): void {
  trackEvent('lesson_started', { module_id: moduleId, lesson_id: lessonId });
}

/**
 * Track quiz completion
 */
export function trackQuizCompleted(
  score: number,
  total: number,
  topic: string
): void {
  trackEvent('quiz_completed', { score, total, topic });
}

/**
 * Track vocabulary saved
 */
export function trackVocabularySaved(source: string): void {
  trackEvent('vocabulary_saved', { source });
}

/**
 * Track streak milestone
 */
export function trackStreakMilestone(days: number): void {
  trackEvent('streak_milestone', { days });
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(featureName: string): void {
  trackEvent('feature_used', { name: featureName });
}

/**
 * Track error occurrence (for non-Sentry tracked errors)
 */
export function trackErrorOccurred(errorType: string, message: string): void {
  trackEvent('error_occurred', {
    type: errorType,
    message: message.substring(0, 100), // Truncate long messages
  });
}

/**
 * Track user authentication events
 */
export function trackAuth(action: 'login' | 'register' | 'logout'): void {
  trackEvent('auth', { action });
}

/**
 * Track page/view navigation
 */
export function trackPageView(viewName: string): void {
  trackEvent('page_view', { view: viewName });
}
