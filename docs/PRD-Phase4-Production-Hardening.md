# Product Requirements Document: Phase 4 - Production Hardening

**Product:** Fala Comigo - Brazilian Portuguese Learning Companion
**Version:** 1.4.0 (Production Ready)
**Author:** Engineering Team
**Date:** December 2024
**Priority:** P2-P3 - Important for Production
**Estimated Effort:** 7-10 days
**Prerequisites:** Phases 1, 2 & 3 Complete

---

## 1. Executive Summary

Phase 4 prepares the application for production deployment at scale. This phase implements security measures, monitoring, testing infrastructure, and progressive web app capabilities to ensure a robust, reliable user experience.

### Success Metrics
- API abuse prevented with rate limiting
- 99.9% error visibility through monitoring
- 80%+ test coverage on critical paths
- PWA installable on mobile devices
- Lighthouse score > 90 on all categories

---

## 2. Requirements

### 2.1 Add Rate Limiting

**Current State:**
No rate limiting on any API endpoints. Vulnerable to abuse and potential cost overruns from Gemini API calls.

**Files:** All files in `api/` directory

**Required Behavior:**

1. **Rate Limits by Endpoint Type:**

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| /api/login | 5 requests | 15 minutes | IP |
| /api/register | 3 requests | 1 hour | IP |
| /api/gemini | 60 requests | 1 minute | User |
| /api/live-key | 10 requests | 1 minute | User |
| /api/progress | 30 requests | 1 minute | User |

2. **Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703097600
```

3. **Error Response (429):**
```json
{
  "error": "Too many requests",
  "retryAfter": 45,
  "message": "Please wait before making more requests"
}
```

**Implementation:**

```typescript
// lib/rateLimit.ts
import { sql } from '@vercel/postgres';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyGenerator: (req: any) => string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Clean old entries and count recent ones
  await sql`
    DELETE FROM rate_limits
    WHERE created_at < ${windowStart.toISOString()}
  `;

  const result = await sql`
    SELECT COUNT(*) as count
    FROM rate_limits
    WHERE key = ${key}
    AND created_at > ${windowStart.toISOString()}
  `;

  const count = parseInt(result.rows[0].count);
  const remaining = Math.max(0, config.limit - count - 1);
  const resetAt = new Date(now.getTime() + config.windowMs);

  if (count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Record this request
  await sql`
    INSERT INTO rate_limits (key, created_at)
    VALUES (${key}, ${now.toISOString()})
  `;

  return { allowed: true, remaining, resetAt };
}

// New table needed
/*
CREATE TABLE rate_limits (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  INDEX idx_rate_limits_key_time (key, created_at)
);
*/
```

**API Middleware:**
```typescript
// api/gemini.ts
import { checkRateLimit } from '../lib/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... CORS headers ...

  // Rate limit check
  const userId = await getUserIdFromToken(req);
  const rateLimitKey = userId ? `user:${userId}` : `ip:${getClientIp(req)}`;

  const rateLimit = await checkRateLimit(rateLimitKey, {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: () => rateLimitKey
  });

  res.setHeader('X-RateLimit-Limit', '60');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.floor(rateLimit.resetAt.getTime() / 1000).toString());

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000),
      message: 'Please wait before making more requests'
    });
  }

  // ... rest of handler ...
}
```

**Acceptance Criteria:**
- [ ] Rate limit table created in database
- [ ] All API endpoints have rate limiting
- [ ] Rate limit headers returned on every response
- [ ] 429 response with retry-after on limit exceeded
- [ ] IP-based limiting for unauthenticated endpoints
- [ ] User-based limiting for authenticated endpoints
- [ ] Old rate limit entries cleaned up automatically

---

### 2.2 Implement Error Tracking

**Current State:**
Errors logged to console only. No visibility into production errors.

**Recommended Solution:** Sentry (free tier available)

**Implementation:**

1. **Install Sentry:**
```bash
npm install @sentry/react @sentry/tracing
```

2. **Initialize in index.tsx:**
```typescript
// index.tsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  }
});
```

3. **Error Boundary Integration:**
```typescript
// components/ErrorBoundary.tsx
import * as Sentry from "@sentry/react";

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack
    }
  });
}
```

4. **API Error Tracking:**
```typescript
// services/geminiService.ts
import * as Sentry from "@sentry/react";

async function callApi(action: string, payload: any) {
  try {
    const response = await fetch(API_ENDPOINT, { ... });
    if (!response.ok) {
      const error = await response.json();
      Sentry.captureMessage(`API Error: ${action}`, {
        level: 'error',
        extra: { payload, error }
      });
      throw new Error(error.error || 'API request failed');
    }
    return data.result;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
```

5. **User Context:**
```typescript
// App.tsx - on login
Sentry.setUser({
  id: user.id.toString(),
  email: user.email,
  username: user.name
});

// On logout
Sentry.setUser(null);
```

**Acceptance Criteria:**
- [ ] Sentry SDK installed and configured
- [ ] All unhandled errors captured
- [ ] API errors tracked with context
- [ ] User context attached to errors
- [ ] Sensitive data scrubbed
- [ ] Source maps uploaded for readable stack traces
- [ ] Alerts configured for critical errors

---

### 2.3 Add Automated Tests

**Current State:**
No tests exist.

**Testing Strategy:**

1. **Unit Tests** - Core logic functions
2. **Integration Tests** - API endpoints
3. **Component Tests** - React components
4. **E2E Tests** - Critical user flows

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});

// src/test/setup.ts
import '@testing-library/jest-dom';
```

**Test Files:**

```typescript
// __tests__/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('returns error for invalid email', () => {
    expect(validateEmail('invalid')).toBe('Please enter a valid email address');
  });

  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
  });
});

describe('validatePassword', () => {
  it('returns strong for valid password', () => {
    const result = validatePassword('SecurePass123');
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('strong');
  });

  it('returns weak for short password', () => {
    const result = validatePassword('abc');
    expect(result.isValid).toBe(false);
    expect(result.strength).toBe('weak');
  });
});
```

```typescript
// __tests__/components/QuizView.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizView from '../../components/QuizView';

// Mock the API
vi.mock('../../services/geminiService', () => ({
  generateQuiz: vi.fn().mockResolvedValue([
    {
      question: 'How do you say "hello" in Portuguese?',
      options: ['Olá', 'Adeus', 'Obrigado', 'Por favor'],
      answer: 0,
      explanation: 'Olá is the standard greeting.'
    }
  ])
}));

describe('QuizView', () => {
  it('shows loading state initially', () => {
    render(<QuizView topic={{ title: 'Greetings', description: 'Basic greetings' }} onComplete={() => {}} />);
    expect(screen.getByText(/Gerando Desafio/i)).toBeInTheDocument();
  });

  it('displays question after loading', async () => {
    render(<QuizView topic={{ title: 'Greetings', description: 'Basic greetings' }} onComplete={() => {}} />);
    expect(await screen.findByText(/How do you say/i)).toBeInTheDocument();
  });

  it('shows explanation after selecting answer', async () => {
    render(<QuizView topic={{ title: 'Greetings', description: 'Basic greetings' }} onComplete={() => {}} />);
    const option = await screen.findByText('Olá');
    fireEvent.click(option);
    expect(await screen.findByText(/Explicação do Iwry/i)).toBeInTheDocument();
  });
});
```

```typescript
// __tests__/api/login.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Vercel postgres
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn()
}));

describe('Login API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing credentials', async () => {
    // Test implementation
  });

  it('returns 401 for invalid password', async () => {
    // Test implementation
  });

  it('returns token for valid login', async () => {
    // Test implementation
  });
});
```

**NPM Scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Acceptance Criteria:**
- [ ] Vitest configured with React Testing Library
- [ ] Unit tests for validation functions (100% coverage)
- [ ] Unit tests for streak calculation
- [ ] Component tests for QuizView
- [ ] Component tests for DictionaryView
- [ ] API tests for login/register
- [ ] Coverage report generated
- [ ] Tests run in CI pipeline

---

### 2.4 PWA Support

**Current State:**
No service worker, no manifest, no offline capability.

**Implementation:**

1. **Web App Manifest:**
```json
// public/manifest.json
{
  "name": "Fala Comigo - Portuguese Learning",
  "short_name": "Fala Comigo",
  "description": "Your AI-powered Brazilian Portuguese learning companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/chat.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

2. **Update index.html:**
```html
<head>
  <!-- Existing content -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#10b981">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Fala Comigo">
</head>
```

3. **Service Worker (with Workbox):**
```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false, // We use our own manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'avatar-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          }
        ]
      }
    })
  ]
});
```

4. **Install Prompt Component:**
```typescript
// components/InstallPrompt.tsx
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-500 rounded-xl">
          <Download size={20} />
        </div>
        <div>
          <h3 className="font-bold mb-1">Install Fala Comigo</h3>
          <p className="text-xs text-slate-400 mb-3">
            Add to your home screen for quick access
          </p>
          <button
            onClick={handleInstall}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
```

**Acceptance Criteria:**
- [ ] manifest.json created with all icons
- [ ] Service worker registers successfully
- [ ] App installable on Chrome/Safari/Edge
- [ ] Offline page displays when no connection
- [ ] Static assets cached for offline access
- [ ] Install prompt shown to users
- [ ] App works offline for viewing cached content
- [ ] Lighthouse PWA score > 90

---

### 2.5 Analytics Integration

**Current State:**
No usage analytics or performance monitoring.

**Recommended Solutions:**
- **Vercel Analytics** (simple, integrated with hosting)
- **Plausible** (privacy-focused alternative)
- **Mixpanel** (detailed product analytics)

**Implementation (Vercel Analytics):**

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```typescript
// index.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
```

**Custom Event Tracking:**
```typescript
// utils/analytics.ts
import { track } from '@vercel/analytics';

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  track(name, properties);
};

// Usage examples
trackEvent('lesson_started', { moduleId: 'a1_1', difficulty: 'BEGINNER' });
trackEvent('quiz_completed', { score: 3, total: 3, topic: 'Greetings' });
trackEvent('vocabulary_saved', { word: 'olá', source: 'dictionary' });
trackEvent('streak_milestone', { days: 7 });
```

**Key Events to Track:**

| Event | Properties | Purpose |
|-------|------------|---------|
| session_started | mode, difficulty | Engagement |
| session_completed | mode, duration, vocabLearned | Completion |
| lesson_started | moduleId, lessonId | Feature usage |
| quiz_completed | score, total, topic | Learning outcomes |
| vocabulary_saved | word, source | Feature usage |
| streak_milestone | days | Retention |
| error_occurred | type, message | Quality |
| feature_used | name | Adoption |

**Acceptance Criteria:**
- [ ] Vercel Analytics installed
- [ ] Speed Insights enabled
- [ ] Custom events tracked
- [ ] User journey visible in dashboard
- [ ] Performance metrics available
- [ ] Privacy-compliant (no PII logged)

---

## 3. Technical Dependencies

### New Packages
```json
{
  "dependencies": {
    "@sentry/react": "^7.x",
    "@sentry/tracing": "^7.x",
    "@vercel/analytics": "^1.x",
    "@vercel/speed-insights": "^1.x"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jsdom": "^23.x",
    "vite-plugin-pwa": "^0.17.x"
  }
}
```

### Database Changes
```sql
CREATE TABLE rate_limits (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_rate_limits_key_time ON rate_limits(key, created_at);
```

### Environment Variables
```
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## 4. Testing Requirements

### Pre-Deployment Checklist
- [ ] Rate limiting tested with load tool
- [ ] Sentry capturing errors correctly
- [ ] All tests passing
- [ ] PWA installable on iOS and Android
- [ ] Analytics events firing
- [ ] Lighthouse audit > 90 all categories

### Load Testing
- Use k6 or Artillery to verify rate limits
- Target: 100 concurrent users without degradation

---

## 5. Rollout Plan

### Week 1
1. Set up rate limiting infrastructure
2. Implement rate limiting on all endpoints
3. Add Sentry error tracking

### Week 2
4. Set up Vitest testing framework
5. Write unit tests for utilities
6. Write component tests

### Week 3
7. Implement PWA with Workbox
8. Create app icons and manifest
9. Add install prompt

### Week 4
10. Integrate analytics
11. Full regression testing
12. Lighthouse optimization
13. Deploy to production

---

## 6. Monitoring & Alerts

### Sentry Alerts
- New error type: Immediate Slack notification
- Error spike (10x normal): Page on-call
- API failure rate > 5%: Alert engineering

### Vercel Analytics Thresholds
- LCP > 2.5s: Performance alert
- CLS > 0.1: Layout shift alert
- FID > 100ms: Interactivity alert

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rate limiting too aggressive | Medium | Medium | Start conservative, adjust based on usage |
| Service worker caching stale content | Low | High | Version cache, clear on deploy |
| Analytics impact on performance | Low | Low | Load async, sample if needed |
| Test setup takes too long | Medium | Low | Start with critical paths only |

---

## 8. Post-Launch Monitoring

### Week 1 After Launch
- Monitor error rates daily
- Check rate limit hit frequency
- Review PWA install rate
- Verify analytics accuracy

### Ongoing
- Weekly error triage
- Monthly performance review
- Quarterly test coverage goals

---

## 9. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | [ ] |
| Engineering | | | [ ] |
| QA | | | [ ] |
| Security | | | [ ] |
| DevOps | | | [ ] |
