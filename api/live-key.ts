import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import {
  checkRateLimit,
  applyRateLimitHeaders,
  sendRateLimitExceeded,
  RATE_LIMITS
} from '../lib/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Use specific origin or fall back to request origin for authenticated endpoints
  const allowedOrigin = process.env.FRONTEND_URL || req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate session
    const sessionResult = await sql`
      SELECT s.user_id, s.expires_at
      FROM sessions s
      WHERE s.token = ${token}
      AND s.expires_at > NOW()
    `;

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const userId = sessionResult.rows[0].user_id;

    // Rate limiting - User-based for live key requests
    const rateLimitKey = `live-key:user:${userId}`;
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.LIVE_KEY);
    applyRateLimitHeaders(res, rateLimit);

    if (!rateLimit.allowed) {
      return sendRateLimitExceeded(res, rateLimit);
    }

    // Note: The API key must be provided to the client for Live Voice because
    // Google's Gemini Live API requires a direct WebSocket connection from the
    // browser to Google's servers for real-time bidirectional audio streaming.
    // This cannot be proxied through a backend without significant latency.
    // The key is only provided to authenticated users with valid sessions.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Live voice not configured' });
    }

    return res.status(200).json({ key: apiKey });
  } catch (error: unknown) {
    console.error('Live key error:', error);
    return res.status(500).json({ error: 'Failed to get live voice key' });
  }
}
