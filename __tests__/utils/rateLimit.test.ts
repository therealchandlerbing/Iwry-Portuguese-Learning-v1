import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest } from '@vercel/node';

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}));

import { getClientIp, RATE_LIMITS } from '../../lib/rateLimit';

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header (string)', () => {
    const req = {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('extracts IP from x-forwarded-for header (array)', () => {
    const req = {
      headers: {
        'x-forwarded-for': ['192.168.1.2'],
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('192.168.1.2');
  });

  it('falls back to x-real-ip header', () => {
    const req = {
      headers: {
        'x-real-ip': '10.0.0.5',
      },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('10.0.0.5');
  });

  it('returns unknown when no IP headers present', () => {
    const req = {
      headers: {},
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('RATE_LIMITS', () => {
  it('has correct login rate limit configuration', () => {
    expect(RATE_LIMITS.LOGIN.limit).toBe(5);
    expect(RATE_LIMITS.LOGIN.windowMs).toBe(15 * 60 * 1000); // 15 minutes
  });

  it('has correct register rate limit configuration', () => {
    expect(RATE_LIMITS.REGISTER.limit).toBe(3);
    expect(RATE_LIMITS.REGISTER.windowMs).toBe(60 * 60 * 1000); // 1 hour
  });

  it('has correct gemini rate limit configuration', () => {
    expect(RATE_LIMITS.GEMINI.limit).toBe(60);
    expect(RATE_LIMITS.GEMINI.windowMs).toBe(60 * 1000); // 1 minute
  });

  it('has correct live-key rate limit configuration', () => {
    expect(RATE_LIMITS.LIVE_KEY.limit).toBe(10);
    expect(RATE_LIMITS.LIVE_KEY.windowMs).toBe(60 * 1000); // 1 minute
  });

  it('has correct progress rate limit configuration', () => {
    expect(RATE_LIMITS.PROGRESS.limit).toBe(30);
    expect(RATE_LIMITS.PROGRESS.windowMs).toBe(60 * 1000); // 1 minute
  });
});
