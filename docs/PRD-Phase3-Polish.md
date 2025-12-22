# Product Requirements Document: Phase 3 - Polish & UX Improvements

**Product:** Fala Comigo - Brazilian Portuguese Learning Companion
**Version:** 1.3.0
**Author:** Engineering Team
**Date:** December 2024
**Priority:** P2 - Medium
**Estimated Effort:** 4-6 days
**Prerequisites:** Phase 1 & 2 Complete

---

## 1. Executive Summary

Phase 3 focuses on polish and user experience improvements. These changes enhance the app's professionalism, prevent resource leaks, and improve accessibility for a wider user base.

### Success Metrics
- Form validation catches 100% of invalid inputs
- Zero audio context memory leaks
- All components have loading states
- WCAG 2.1 Level A compliance achieved

---

## 2. Requirements

### 2.1 Add Form Validation

**Current State:**
Login and Registration forms have minimal validation. No email format checking, no password strength indicator, no confirm password field.

**Files:** `components/LoginPage.tsx`, `components/RegisterPage.tsx`

**Required Behavior:**

#### Registration Form
1. **Email Validation**
   - Must be valid email format
   - Show error immediately on blur
   - Error: "Please enter a valid email address"

2. **Password Requirements**
   - Minimum 8 characters (currently 6)
   - At least one uppercase letter
   - At least one number
   - Show strength indicator (Weak/Medium/Strong)
   - Show requirements checklist

3. **Confirm Password**
   - New field below password
   - Must match password exactly
   - Error: "Passwords do not match"

4. **Name Validation**
   - Minimum 2 characters
   - No numbers or special characters (optional)
   - Error: "Please enter your name"

#### Login Form
1. **Email Validation**
   - Same as registration

2. **Password**
   - Just check not empty
   - Error: "Please enter your password"

**Implementation:**

```typescript
// utils/validation.ts
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');

  const isValid = errors.length === 0;
  const strength = errors.length === 0 ? 'strong' : errors.length === 1 ? 'medium' : 'weak';

  return { isValid, strength, errors };
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return null;
};
```

**UI Components:**

```typescript
// Password Strength Indicator
<div className="mt-2">
  <div className="flex gap-1 mb-1">
    {[1, 2, 3].map(i => (
      <div
        key={i}
        className={`h-1 flex-1 rounded-full ${
          strength === 'strong' ? 'bg-emerald-500' :
          strength === 'medium' && i <= 2 ? 'bg-yellow-500' :
          strength === 'weak' && i <= 1 ? 'bg-red-500' :
          'bg-slate-200'
        }`}
      />
    ))}
  </div>
  <p className="text-xs text-slate-500">
    Password strength: <span className={strengthColor}>{strength}</span>
  </p>
</div>

// Requirements Checklist
<ul className="mt-2 space-y-1">
  {requirements.map((req, i) => (
    <li key={i} className={`text-xs flex items-center gap-1 ${
      req.met ? 'text-emerald-600' : 'text-slate-400'
    }`}>
      {req.met ? <Check size={12} /> : <X size={12} />}
      {req.label}
    </li>
  ))}
</ul>
```

**Acceptance Criteria:**
- [ ] Email validation on both forms
- [ ] Password strength indicator on registration
- [ ] Password requirements checklist
- [ ] Confirm password field with match validation
- [ ] Name validation on registration
- [ ] Errors display inline below fields
- [ ] Submit button disabled when form invalid
- [ ] Error states clear when user corrects input

---

### 2.2 Implement Audio Cleanup

**Current State:**
Audio contexts are created for TTS but never closed, causing memory leaks.

**Files:**
- `components/ChatView.tsx:81-97`
- `components/DictionaryView.tsx:32-49`
- `components/DashboardView.tsx` (if TTS added)

**Required Changes:**

1. **Singleton Audio Context Pattern**
```typescript
// services/audioService.ts
class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private getContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    return this.audioContext;
  }

  async playAudio(audioBytes: Uint8Array): Promise<void> {
    // Stop any currently playing audio
    this.stopCurrentAudio();

    const ctx = this.getContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      this.activeSource = null;
    };

    this.activeSource = source;
    source.start();
  }

  stopCurrentAudio(): void {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeSource = null;
    }
  }

  cleanup(): void {
    this.stopCurrentAudio();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioService = AudioService.getInstance();
```

2. **Update Components to Use Service**

```typescript
// ChatView.tsx
import { audioService } from '../services/audioService';

const playAudio = async (text: string, msgId: string) => {
  if (audioLoading) return;
  const cleanText = text.replace(/\*\*|\*/g, '');
  setAudioLoading(msgId);
  try {
    const audioBytes = await textToSpeech(cleanText);
    if (audioBytes) {
      await audioService.playAudio(audioBytes);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setAudioLoading(null);
  }
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    audioService.stopCurrentAudio();
  };
}, []);
```

3. **LiveVoiceView Cleanup**
```typescript
// Already has cleanup in useEffect, but add more thorough cleanup
useEffect(() => {
  return () => {
    // Stop all audio sources
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();

    // Close audio contexts
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }

    // Close session
    if (sessionRef.current) {
      sessionRef.current.close();
    }
  };
}, []);
```

**Acceptance Criteria:**
- [ ] Singleton AudioService created
- [ ] All TTS playback uses AudioService
- [ ] Previous audio stops when new audio plays
- [ ] Audio contexts cleaned up on component unmount
- [ ] No memory leaks after 50+ TTS plays
- [ ] LiveVoiceView cleans up all resources

---

### 2.3 Add Loading States

**Current State:**
Several views have no loading indicators when data is being fetched or processed.

**Files to Update:**
- `components/DashboardView.tsx`
- `components/CorrectionLibraryView.tsx`
- `components/LearningLogView.tsx`
- `components/DictionaryView.tsx`

**Implementation:**

1. **Skeleton Loading Component**
```typescript
// components/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-slate-200 rounded';
  const variantClass = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  return <div className={`${baseClass} ${variantClass[variant]} ${className}`} />;
};

export default Skeleton;

// Usage examples
<Skeleton className="h-6 w-48" />           // Title
<Skeleton className="h-4 w-32" />           // Subtitle
<Skeleton className="h-20 w-full" variant="rectangular" /> // Card
<Skeleton className="h-12 w-12" variant="circular" />      // Avatar
```

2. **DashboardView Loading State**
```typescript
// Show skeleton while progress data might be loading
const [isInitialLoad, setIsInitialLoad] = useState(true);

useEffect(() => {
  // Simulate checking if data is ready
  const timer = setTimeout(() => setIsInitialLoad(false), 100);
  return () => clearTimeout(timer);
}, []);

if (isInitialLoad) {
  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-16 w-32" variant="rectangular" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-96" variant="rectangular" />
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-48" variant="rectangular" />
          <Skeleton className="h-32" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}
```

3. **Dictionary Loading**
```typescript
// Already has loading state, enhance with skeleton
{loading && (
  <div className="space-y-8 animate-pulse">
    <div className="bg-white rounded-[3rem] p-10">
      <Skeleton className="h-12 w-48 mb-4" />
      <Skeleton className="h-6 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-8">
      <Skeleton className="h-48" variant="rectangular" />
      <Skeleton className="h-48" variant="rectangular" />
    </div>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Skeleton component created
- [ ] Dashboard shows skeleton on initial load
- [ ] Dictionary shows skeleton while searching
- [ ] Correction Library shows loading state
- [ ] Learning Log shows loading state
- [ ] Skeletons match actual content layout
- [ ] Smooth transition from skeleton to content

---

### 2.4 Implement Pagination

**Current State:**
Correction Library loads all 50 corrections at once. No pagination for any list views.

**Files:** `components/CorrectionLibraryView.tsx`, `components/LearningLogView.tsx`

**Implementation:**

```typescript
// components/CorrectionLibraryView.tsx
const ITEMS_PER_PAGE = 10;

const CorrectionLibraryView: React.FC<Props> = ({ history, onStartReview }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      {/* Existing content with paginatedHistory instead of history */}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-slate-100 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-bold ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-slate-100 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Correction Library paginated (10 per page)
- [ ] Learning Log paginated (10 per page)
- [ ] Page numbers displayed
- [ ] Previous/Next buttons work
- [ ] Current page highlighted
- [ ] Buttons disabled at boundaries
- [ ] Page state resets when data changes

---

### 2.5 Add Accessibility Features

**Current State:**
No ARIA labels, keyboard navigation, or screen reader support.

**Priority Improvements:**

1. **ARIA Labels for Interactive Elements**
```typescript
// Buttons with icons only
<button
  aria-label="Play pronunciation"
  onClick={playPronunciation}
>
  <Volume2 size={24} />
</button>

// Form inputs
<input
  type="email"
  id="email"
  aria-label="Email address"
  aria-required="true"
  aria-invalid={!!emailError}
  aria-describedby={emailError ? "email-error" : undefined}
/>
{emailError && (
  <p id="email-error" role="alert" className="text-red-500">
    {emailError}
  </p>
)}

// Navigation
<nav aria-label="Main navigation">
  ...
</nav>

// Modal dialogs
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Session Summary</h2>
  ...
</div>
```

2. **Keyboard Navigation**
```typescript
// Make dropdowns keyboard navigable
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Escape':
      setIsOpen(false);
      break;
    case 'ArrowDown':
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
      break;
    case 'Enter':
      handleSelect(items[focusedIndex]);
      break;
  }
};

// Focus trap for modals
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector('button, [href], input, select, textarea');
    (firstFocusable as HTMLElement)?.focus();
  }
}, [isOpen]);
```

3. **Skip Link**
```typescript
// Add to App.tsx at top of return
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
>
  Skip to main content
</a>

<main id="main-content" className="...">
```

4. **Color Contrast Fixes**
```typescript
// Update text colors that don't meet WCAG AA
// Current: text-slate-300 on white = ~4.5:1 (borderline)
// Fix: text-slate-500 on white = 7:1+ (good)

// Check and fix:
// - Error messages
// - Placeholder text
// - Disabled states
// - Badge text
```

5. **Screen Reader Announcements**
```typescript
// Create announcer for dynamic content
const [announcement, setAnnouncement] = useState('');

<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>

// Usage
setAnnouncement('Quiz answer submitted. You got it correct!');
```

**Acceptance Criteria:**
- [ ] All icon buttons have aria-labels
- [ ] Form inputs have proper labels and error states
- [ ] Modals have focus trap
- [ ] Dropdowns navigable with keyboard
- [ ] Skip link present
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Screen reader can announce dynamic changes
- [ ] Tab order is logical

---

## 3. Technical Dependencies

### New Files
- `utils/validation.ts`
- `services/audioService.ts`
- `components/Skeleton.tsx`

### Modified Files
- `components/LoginPage.tsx`
- `components/RegisterPage.tsx`
- `components/ChatView.tsx`
- `components/DictionaryView.tsx`
- `components/LiveVoiceView.tsx`
- `components/DashboardView.tsx`
- `components/CorrectionLibraryView.tsx`
- `components/LearningLogView.tsx`
- Various components (accessibility)

---

## 4. Testing Requirements

### Accessibility Testing
- Run axe DevTools on all pages
- Test with VoiceOver (Mac) or NVDA (Windows)
- Verify keyboard-only navigation
- Check color contrast with WebAIM tool

### Manual Testing Checklist
- [ ] Try registering with invalid email formats
- [ ] Test password strength indicator with various passwords
- [ ] Play TTS 20+ times, check memory usage
- [ ] Navigate all dropdowns with keyboard only
- [ ] Use screen reader to complete a quiz

---

## 5. Rollout Plan

1. Form validation (independent)
2. Audio service refactor (careful testing)
3. Loading states (low risk)
4. Pagination (low risk)
5. Accessibility improvements (iterative)
6. Accessibility audit with external tool
7. Deploy to staging
8. User testing with accessibility needs
9. Deploy to production

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Audio refactor breaks playback | Medium | High | Thorough testing, keep old code available |
| Password requirements too strict | Low | Medium | Clear messaging, reasonable requirements |
| Accessibility changes affect design | Low | Low | Work with design to maintain aesthetics |
| Pagination state bugs | Low | Low | Reset on filter changes |

---

## 7. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | [ ] |
| Engineering | | | [ ] |
| QA | | | [ ] |
| Accessibility | | | [ ] |
