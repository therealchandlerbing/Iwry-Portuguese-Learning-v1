import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

/**
 * Get the client IP address from the request
 */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.headers['x-real-ip'] as string || 'unknown';
}

/**
 * Get the user ID from the authorization token
 */
export async function getUserIdFromToken(req: VercelRequest): Promise<number | null> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) return null;

    const result = await sql`
      SELECT user_id FROM sessions
      WHERE token = ${token}
      AND expires_at > NOW()
    `;

    return result.rows.length > 0 ? result.rows[0].user_id : null;
  } catch {
    return null;
  }
}

/**
 * Check rate limit for a given key
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);
  const resetAt = new Date(now.getTime() + config.windowMs);

  try {
    // Clean old entries for this key (older than window)
    await sql`
      DELETE FROM rate_limits
      WHERE key = ${key}
      AND created_at < ${windowStart.toISOString()}
    `;

    // Count recent requests within the window
    const result = await sql`
      SELECT COUNT(*) as count
      FROM rate_limits
      WHERE key = ${key}
      AND created_at > ${windowStart.toISOString()}
    `;

    const count = parseInt(result.rows[0].count, 10);

    if (count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        limit: config.limit
      };
    }

    // Record this request
    await sql`
      INSERT INTO rate_limits (key, created_at)
      VALUES (${key}, ${now.toISOString()})
    `;

    return {
      allowed: true,
      remaining: Math.max(0, config.limit - count - 1),
      resetAt,
      limit: config.limit
    };
  } catch (error) {
    // If rate limit table doesn't exist or other DB error, allow the request
    // but log the error
    console.error('Rate limit check error:', error);
    return {
      allowed: true,
      remaining: config.limit,
      resetAt,
      limit: config.limit
    };
  }
}

/**
 * Apply rate limit headers and return 429 if limit exceeded
 */
export function applyRateLimitHeaders(
  res: VercelResponse,
  result: RateLimitResult
): void {
  res.setHeader('X-RateLimit-Limit', result.limit.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());
}

/**
 * Send a 429 Too Many Requests response
 */
export function sendRateLimitExceeded(
  res: VercelResponse,
  result: RateLimitResult
): void {
  const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
  res.setHeader('Retry-After', retryAfter.toString());
  res.status(429).json({
    error: 'Too many requests',
    retryAfter,
    message: 'Please wait before making more requests'
  });
}

// Pre-configured rate limit settings per endpoint type
export const RATE_LIMITS = {
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 },      // 5 requests per 15 minutes
  REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 },   // 3 requests per hour
  GEMINI: { limit: 60, windowMs: 60 * 1000 },         // 60 requests per minute
  LIVE_KEY: { limit: 10, windowMs: 60 * 1000 },       // 10 requests per minute
  PROGRESS: { limit: 30, windowMs: 60 * 1000 },       // 30 requests per minute
} as const;

/**
 * Periodic cleanup of old rate limit entries (call from a scheduled job or occasionally)
 */
export async function cleanupOldRateLimits(): Promise<void> {
  try {
    // Delete entries older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await sql`
      DELETE FROM rate_limits
      WHERE created_at < ${oneHourAgo.toISOString()}
    `;
  } catch (error) {
    console.error('Rate limit cleanup error:', error);
  }
}
