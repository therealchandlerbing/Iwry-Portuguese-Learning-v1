import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Check database connection status
    try {
      await sql`SELECT 1`;

      // Check if tables exist
      const tablesResult = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'sessions', 'user_progress', 'rate_limits')
      `;

      const existingTables = tablesResult.rows.map(r => r.table_name);

      return res.status(200).json({
        connected: true,
        tables: {
          users: existingTables.includes('users'),
          sessions: existingTables.includes('sessions'),
          user_progress: existingTables.includes('user_progress'),
          rate_limits: existingTables.includes('rate_limits')
        }
      });
    } catch (error: any) {
      console.error('Database connection error:', error);
      return res.status(200).json({
        connected: false,
        error: 'Failed to connect to database'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create sessions table for auth tokens
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create user_progress table to store learning data
      await sql`
        CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          progress_data JSONB DEFAULT '{}',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create rate_limits table for API rate limiting
      await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `;

      // Create indexes for better performance
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_key_time ON rate_limits(key, created_at)`;

      return res.status(200).json({
        success: true,
        message: 'Database tables created successfully'
      });
    } catch (error: any) {
      console.error('Setup error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create database tables'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
