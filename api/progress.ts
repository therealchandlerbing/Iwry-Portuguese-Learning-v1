import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

async function validateSession(token: string): Promise<{ userId: number } | null> {
  try {
    const sessionResult = await sql`
      SELECT s.user_id
      FROM sessions s
      WHERE s.token = ${token}
      AND s.expires_at > NOW()
    `;

    if (sessionResult.rows.length === 0) {
      return null;
    }

    return { userId: sessionResult.rows[0].user_id };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate authentication
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const session = await validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { userId } = session;

  // GET /api/progress - Load progress from database
  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT progress_data, updated_at
        FROM user_progress
        WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        // No progress yet for this user
        return res.status(200).json({
          success: true,
          progress: null,
          lastUpdated: null
        });
      }

      const row = result.rows[0];
      return res.status(200).json({
        success: true,
        progress: row.progress_data,
        lastUpdated: row.updated_at
      });
    } catch (error: any) {
      console.error('Failed to load progress:', error);
      return res.status(500).json({ error: 'Failed to load progress' });
    }
  }

  // POST /api/progress - Save progress to database
  if (req.method === 'POST') {
    try {
      const { progress, clientTimestamp } = req.body;

      if (!progress) {
        return res.status(400).json({ error: 'Progress data is required' });
      }

      // Use upsert to insert or update
      await sql`
        INSERT INTO user_progress (user_id, progress_data, updated_at)
        VALUES (${userId}, ${JSON.stringify(progress)}, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          progress_data = ${JSON.stringify(progress)},
          updated_at = NOW()
      `;

      return res.status(200).json({
        success: true,
        savedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Failed to save progress:', error);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
