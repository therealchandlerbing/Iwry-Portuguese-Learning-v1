/**
 * Error tracking utilities for production monitoring
 * Uses Sentry when available, falls back to console logging
 */

// Error severity levels
export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// User context for error tracking
interface UserContext {
  id?: string;
  email?: string;
  username?: string;
}

// Global state
let isInitialized = false;
let currentUser: UserContext | null = null;

// Dynamic Sentry import (only loads if DSN is configured)
let Sentry: any = null;

/**
 * Initialize error tracking
 * Call this early in the app lifecycle (e.g., in index.tsx)
 */
export async function initErrorTracking(): Promise<void> {
  if (isInitialized) return;

  const dsn = (import.meta as any).env?.VITE_SENTRY_DSN;

  if (dsn) {
    try {
      // Dynamically import Sentry to avoid bundling it if not needed
      const SentryModule = await import('https://esm.sh/@sentry/react@7');
      Sentry = SentryModule;

      Sentry.init({
        dsn,
        environment: (import.meta as any).env?.MODE || 'development',
        tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
        beforeSend(event: any) {
          // Scrub sensitive data from requests
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
          }
          // Remove any potential PII from breadcrumbs
          if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map((breadcrumb: any) => {
              if (breadcrumb.data?.password) {
                breadcrumb.data.password = '[REDACTED]';
              }
              return breadcrumb;
            });
          }
          return event;
        },
      });

      isInitialized = true;
      console.log('Error tracking initialized');
    } catch (err) {
      console.warn('Failed to initialize Sentry:', err);
    }
  } else {
    console.log('Error tracking: Sentry DSN not configured, using console logging');
    isInitialized = true;
  }
}

/**
 * Capture an exception and report it
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, any>
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  if (Sentry) {
    Sentry.captureException(errorObj, {
      extra: context,
    });
  } else {
    console.error('[Error Tracking]', errorObj, context);
  }
}

/**
 * Capture a message/event
 */
export function captureMessage(
  message: string,
  level: ErrorLevel = 'info',
  context?: Record<string, any>
): void {
  if (Sentry) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    const logMethod = level === 'error' || level === 'fatal' ? console.error :
                      level === 'warning' ? console.warn : console.log;
    logMethod(`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * Set user context for error reports
 * Call this after user logs in
 */
export function setUser(user: UserContext | null): void {
  currentUser = user;

  if (Sentry) {
    Sentry.setUser(user);
  }
}

/**
 * Add a breadcrumb for debugging context
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
  level: ErrorLevel = 'info'
): void {
  if (Sentry) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level,
    });
  }
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, {
        ...context,
        functionName: fn.name,
        args: args.map((arg) =>
          typeof arg === 'object' ? '[Object]' : String(arg)
        ),
      });
      throw error;
    }
  }) as T;
}

/**
 * Track API errors with context
 */
export function trackApiError(
  action: string,
  error: Error | unknown,
  payload?: Record<string, any>
): void {
  captureException(error, {
    type: 'API_ERROR',
    action,
    // Sanitize payload to avoid logging sensitive data
    payload: payload ? sanitizePayload(payload) : undefined,
  });
}

/**
 * Sanitize payload to remove sensitive fields
 */
function sanitizePayload(payload: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = '[Object]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Get the current user context
 */
export function getCurrentUser(): UserContext | null {
  return currentUser;
}

/**
 * Create an error boundary fallback handler
 */
export function createErrorBoundaryHandler() {
  return (error: Error, errorInfo: { componentStack: string }) => {
    captureException(error, {
      type: 'REACT_ERROR_BOUNDARY',
      componentStack: errorInfo.componentStack,
    });
  };
}
