# Product Requirements Document: Phase 2 - Core Features

**Product:** Fala Comigo - Brazilian Portuguese Learning Companion
**Version:** 1.2.0
**Author:** Engineering Team
**Date:** December 2024
**Priority:** P1 - High
**Estimated Effort:** 5-7 days
**Prerequisites:** Phase 1 Complete

---

## 1. Executive Summary

Phase 2 addresses high-priority issues that significantly impact user experience and data integrity. These improvements ensure users don't lose their progress, receive proper error feedback, and have full access to app features on all devices.

### Success Metrics
- User progress synced to database with 99.9% reliability
- Zero white-screen crashes from component errors
- Mobile users can access all 13 app modes
- Vocabulary confidence increases through practice

---

## 2. Requirements

### 2.1 Add Progress Sync to Database

**Current State:**
User progress is only saved to localStorage. The `user_progress` table exists but is never written to.

**Files:** `App.tsx`, `api/` (new endpoints needed)

**Required Behavior:**
1. Save progress to database on key events:
   - After finishing a chat session
   - After completing a quiz
   - After saving vocabulary
   - After lesson completion
   - Periodically (every 5 minutes of activity)
2. Load progress from database on login
3. Merge server progress with local progress (conflict resolution)
4. Handle offline gracefully (queue updates)

**Database Schema (existing):**
```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  progress_data JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**New API Endpoints:**

#### GET /api/progress
```typescript
// Request
Headers: { Authorization: 'Bearer <token>' }

// Response 200
{
  "success": true,
  "progress": { /* UserProgress object */ },
  "lastUpdated": "2024-12-20T10:30:00Z"
}

// Response 404 (no progress yet)
{
  "success": true,
  "progress": null
}
```

#### POST /api/progress
```typescript
// Request
Headers: { Authorization: 'Bearer <token>' }
Body: {
  "progress": { /* UserProgress object */ },
  "clientTimestamp": "2024-12-20T10:35:00Z"
}

// Response 200
{
  "success": true,
  "savedAt": "2024-12-20T10:35:01Z"
}
```

**Client Implementation:**

```typescript
// App.tsx - Add sync functions
const syncProgressToServer = async (progress: UserProgress) => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        progress,
        clientTimestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to sync progress:', error);
    // Queue for retry
  }
};

const loadProgressFromServer = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  const response = await fetch('/api/progress', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const data = await response.json();
    return data.progress;
  }
  return null;
};
```

**Conflict Resolution Strategy:**
- Compare `lastSessionDate` timestamps
- Use server data if more recent
- Merge vocabulary lists (union, keep higher confidence)
- Take maximum for streak, sessionCount, totalPracticeMinutes

**Acceptance Criteria:**
- [ ] Progress saves to database after session ends
- [ ] Progress loads from database on login
- [ ] Periodic sync every 5 minutes of activity
- [ ] Local progress preserved if offline
- [ ] Conflict resolution merges data correctly
- [ ] Works for new users (no existing progress)
- [ ] Error handling for failed syncs

---

### 2.2 Implement Vocabulary Confidence Growth

**Current State:**
Vocabulary items are added with `confidence: 10` and never increase.

**Files:** `App.tsx`, `types.ts`

**Required Behavior:**
1. Confidence increases when:
   - Word is used correctly in conversation
   - Word is reviewed in Dictionary
   - Word appears in quiz and user gets it right
2. Confidence decreases when:
   - Word is used incorrectly
   - Quiz question about word is wrong
3. Confidence range: 0-100
4. Display "mastered" status at 80+

**Implementation:**

```typescript
// Add to geminiService.ts
interface SessionVocabPerformance {
  wordsUsedCorrectly: string[];
  wordsUsedIncorrectly: string[];
}

// Enhance analyzeSession to return this

// In App.tsx - finishChatSession
const updateVocabularyConfidence = (
  vocab: VocabItem[],
  performance: SessionVocabPerformance
): VocabItem[] => {
  return vocab.map(item => {
    const wordLower = item.word.toLowerCase();
    let delta = 0;

    if (performance.wordsUsedCorrectly.some(w => w.toLowerCase() === wordLower)) {
      delta = 10; // Increase by 10 for correct usage
    }
    if (performance.wordsUsedIncorrectly.some(w => w.toLowerCase() === wordLower)) {
      delta = -5; // Decrease by 5 for incorrect usage
    }

    return {
      ...item,
      confidence: Math.max(0, Math.min(100, item.confidence + delta)),
      lastPracticed: delta !== 0 ? new Date() : item.lastPracticed
    };
  });
};
```

**Acceptance Criteria:**
- [ ] Confidence increases when word used correctly
- [ ] Confidence decreases when word used incorrectly
- [ ] Confidence capped at 0-100 range
- [ ] Dictionary lookup increases confidence by 5
- [ ] Quiz correct answer increases confidence by 15
- [ ] "Wordsmith" badge counts words with 80+ confidence
- [ ] Dashboard vocabulary count reflects mastered words

---

### 2.3 Add Error Boundaries

**Current State:**
No error boundaries exist. A component crash causes white screen.

**Files:** New component + wrap in `App.tsx`

**Implementation:**

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            {this.props.fallbackMessage || 'Ocorreu um erro inesperado. Tente novamente.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw size={18} />
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Usage in App.tsx:**
```typescript
import ErrorBoundary from './components/ErrorBoundary';

// Wrap main content
<main className="flex-1 relative overflow-hidden">
  <ErrorBoundary>
    {renderContent()}
  </ErrorBoundary>
</main>
```

**Acceptance Criteria:**
- [ ] ErrorBoundary component created
- [ ] Wrapped around main content area
- [ ] Displays friendly error message in Portuguese
- [ ] "Try Again" button resets the error state
- [ ] Error details logged to console
- [ ] Does not break normal rendering

---

### 2.4 Expand Mobile Navigation

**Current State:**
Mobile nav only shows 5 items. Users cannot access Dictionary, Corrections, Learning Log, Image Analysis, or Memory Import on mobile.

**File:** `components/MobileNav.tsx`

**Required Behavior:**
1. Replace current 5-item nav with expandable menu
2. "More" button opens bottom sheet with all modes
3. Quick access to most-used features
4. Full access to all 13 modes

**Implementation Options:**

**Option A: Bottom Sheet Menu**
- Keep 4 main items in bottom nav
- "More" opens slide-up sheet with all other options

**Option B: Two-Row Navigation**
- Top row: Main learning modes
- Second row: Tools (scrollable)

**Recommended: Option A**

```typescript
// components/MobileNav.tsx (updated)
import React, { useState } from 'react';
import { AppMode } from '../types';
import {
  MessageSquare, Mic, LayoutDashboard, MoreHorizontal, X,
  BookOpen, Search, Camera, History, FileText, RefreshCw,
  Smartphone, HelpCircle, Upload
} from 'lucide-react';

const MobileNav: React.FC<MobileNavProps> = ({ currentMode, setMode }) => {
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { mode: AppMode.CHAT, label: 'Chat', icon: <MessageSquare size={20} /> },
    { mode: AppMode.LIVE_VOICE, label: 'Voice', icon: <Mic size={20} /> },
    { mode: AppMode.DASHBOARD, label: 'Stats', icon: <LayoutDashboard size={20} /> },
  ];

  const moreItems = [
    { mode: AppMode.TEXT_MODE, label: 'WhatsApp', icon: <Smartphone size={18} /> },
    { mode: AppMode.LESSONS, label: 'Lessons', icon: <BookOpen size={18} /> },
    { mode: AppMode.DICTIONARY, label: 'Dictionary', icon: <Search size={18} /> },
    { mode: AppMode.IMAGE_ANALYSIS, label: 'Photo', icon: <Camera size={18} /> },
    { mode: AppMode.REVIEW_SESSION, label: 'Review', icon: <RefreshCw size={18} /> },
    { mode: AppMode.CORRECTION_LIBRARY, label: 'Corrections', icon: <History size={18} /> },
    { mode: AppMode.LEARNING_LOG, label: 'Log', icon: <FileText size={18} /> },
    { mode: AppMode.IMPORT_MEMORY, label: 'Import', icon: <Upload size={18} /> },
    { mode: AppMode.QUICK_HELP, label: 'Help', icon: <HelpCircle size={18} /> },
  ];

  return (
    <>
      {/* Bottom Sheet Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowMore(false)} />
      )}

      {/* Bottom Sheet */}
      {showMore && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">More Features</h3>
            <button onClick={() => setShowMore(false)}>
              <X size={24} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {moreItems.map(item => (
              <button
                key={item.mode}
                onClick={() => { setMode(item.mode); setShowMore(false); }}
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-slate-50"
              >
                <div className="text-slate-600 mb-2">{item.icon}</div>
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Nav Bar */}
      <nav className="md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        <div className="flex justify-around items-center">
          {mainItems.map(item => (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl ${
                currentMode === item.mode ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center py-1.5 px-3 rounded-xl text-slate-400"
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-semibold mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
```

**Acceptance Criteria:**
- [ ] 3 main items + "More" button in bottom nav
- [ ] "More" opens bottom sheet
- [ ] All 13 modes accessible from mobile
- [ ] Sheet closes on item selection
- [ ] Sheet closes on overlay tap
- [ ] Smooth animation for sheet
- [ ] Safe area insets respected

---

### 2.5 Dynamic User Name in Prompts

**Current State:**
Several components hardcode "Chandler" in prompts and UI text.

**Files to Update:**
- `components/LiveVoiceView.tsx:131-135` - System instruction
- `components/ReviewSessionView.tsx:53` - Page description
- `api/gemini.ts:186` - Session analysis prompt

**Required Changes:**

1. **LiveVoiceView** - Pass user name as prop:
```typescript
// App.tsx
<LiveVoiceView
  memories={progress.memories}
  difficulty={progress.difficulty}
  userName={user?.name || 'Student'}
/>

// LiveVoiceView.tsx
interface LiveVoiceViewProps {
  memories?: MemoryEntry[];
  difficulty: DifficultyLevel;
  userName?: string;
}

// In systemInstruction:
`Você é o Iwry, o assistente dedicado de ${userName} para aprender Português do Brasil.`
```

2. **ReviewSessionView** - Pass user name as prop:
```typescript
// App.tsx
<ReviewSessionView
  progress={progress}
  onStartReview={(p) => startLesson(p, AppMode.REVIEW_SESSION)}
  userName={user?.name || 'Student'}
/>

// ReviewSessionView.tsx
<p className="text-slate-500 text-lg max-w-md mx-auto">
  Focused practice on what matters most for {userName}'s fluency right now.
</p>
```

3. **API Gemini** - User name not available server-side, make generic:
```typescript
// Change from:
`Analyze this Portuguese practice session for Chandler:`

// To:
`Analyze this Portuguese practice session:`
```

**Acceptance Criteria:**
- [ ] LiveVoiceView uses actual user name
- [ ] ReviewSessionView uses actual user name
- [ ] API prompts are generic (no hardcoded name)
- [ ] Fallback to "Student" if name unavailable
- [ ] No other hardcoded names in codebase

---

## 3. Technical Dependencies

### New Files
- `components/ErrorBoundary.tsx`
- `api/progress.ts`

### Modified Files
- `App.tsx` (progress sync, error boundary, prop passing)
- `components/MobileNav.tsx` (complete rewrite)
- `components/LiveVoiceView.tsx` (add userName prop)
- `components/ReviewSessionView.tsx` (add userName prop)
- `services/geminiService.ts` (vocabulary performance)
- `api/gemini.ts` (remove hardcoded name)

### Database
- No schema changes (using existing `user_progress` table)

---

## 4. Testing Requirements

### Unit Tests
- Progress merge/conflict resolution
- Vocabulary confidence calculations
- ErrorBoundary error catching

### Integration Tests
- Progress sync round-trip
- Mobile navigation all modes accessible

### Manual Testing Checklist
- [ ] Login on Device A, make progress, login on Device B - data syncs
- [ ] Trigger error in component, verify error boundary displays
- [ ] Test all 13 modes accessible from mobile
- [ ] Verify vocabulary confidence changes after session
- [ ] Verify user name appears correctly everywhere

---

## 5. Rollout Plan

1. Implement progress sync API first (can be tested independently)
2. Add ErrorBoundary (low risk)
3. Implement mobile nav expansion
4. Add vocabulary confidence
5. Update dynamic user names
6. Full regression test
7. Deploy to staging
8. Monitor sync reliability
9. Deploy to production

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Progress sync conflicts | Medium | High | Conservative merge strategy, keep latest |
| Mobile nav UX regression | Low | Medium | A/B test with users |
| ErrorBoundary hiding real issues | Low | Low | Log errors, add monitoring |
| Vocabulary confidence too aggressive | Medium | Low | Tune delta values post-launch |

---

## 7. Future Considerations

- Real-time sync with WebSockets
- Offline-first with background sync
- Spaced repetition for vocabulary
- Push notifications for streak reminders

---

## 8. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | [ ] |
| Engineering | | | [ ] |
| QA | | | [ ] |
