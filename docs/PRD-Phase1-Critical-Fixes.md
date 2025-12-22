# Product Requirements Document: Phase 1 - Critical Fixes

**Product:** Fala Comigo - Brazilian Portuguese Learning Companion
**Version:** 1.1.0
**Author:** Engineering Team
**Date:** December 2024
**Priority:** P0 - Critical
**Estimated Effort:** 2-3 days

---

## 1. Executive Summary

Phase 1 addresses critical bugs and missing functionality that directly impact the core user experience. These issues prevent users from tracking their progress accurately, break key features, and include visible typos that affect perceived quality.

### Success Metrics
- All 5 critical bugs resolved
- 100% of users can see accurate streak data
- Practice minutes tracked correctly
- All typos corrected

---

## 2. Requirements

### 2.1 Implement Scenario Content in ChatView

**Current State:**
The "Cenários" (Scenarios) dropdown button in ChatView toggles a state but displays no content when opened.

**File:** `components/ChatView.tsx:207-215`

**Required Behavior:**
1. When user clicks "Cenários" button, a dropdown/panel should appear
2. Panel should display 6-8 conversation scenario options
3. Scenarios should be contextual to the user's difficulty level
4. Clicking a scenario should:
   - Close the dropdown
   - Pre-fill or send a message to start that scenario
   - Update the conversation context

**Scenario List (by difficulty):**

| Scenario | Beginner | Intermediate | Advanced |
|----------|----------|--------------|----------|
| At the Bakery | ✓ | ✓ | - |
| Ordering Food | ✓ | ✓ | ✓ |
| Asking Directions | ✓ | ✓ | ✓ |
| Meeting Someone | ✓ | ✓ | - |
| At the Office | - | ✓ | ✓ |
| Business Meeting | - | - | ✓ |
| Medical Appointment | - | ✓ | ✓ |
| At the Airport | ✓ | ✓ | ✓ |

**Acceptance Criteria:**
- [ ] Dropdown panel renders when `showScenarios` is true
- [ ] Panel contains at least 6 scenario buttons with icons
- [ ] Scenarios filter based on current difficulty level
- [ ] Clicking scenario starts conversation with appropriate prompt
- [ ] Dropdown closes after selection
- [ ] Panel is responsive (works on mobile widths)

**Technical Notes:**
```typescript
const SCENARIOS = [
  {
    id: 'bakery',
    icon: 'Coffee',
    label: 'Na Padaria',
    prompt: 'I just walked into a Brazilian bakery. Help me order a pão de queijo and cafezinho.',
    levels: ['BEGINNER', 'INTERMEDIATE']
  },
  // ... more scenarios
];
```

---

### 2.2 Implement Practice Minutes Tracking

**Current State:**
`totalPracticeMinutes` in UserProgress is always 0. No timing mechanism exists.

**Files:** `App.tsx`, `types.ts`

**Required Behavior:**
1. Track time spent in active learning modes:
   - CHAT
   - TEXT_MODE
   - LIVE_VOICE
   - LESSONS
   - QUIZ
   - REVIEW_SESSION
2. Start timer when entering a tracked mode
3. Stop/pause timer when:
   - Leaving the mode
   - App goes to background (optional)
   - Session ends
4. Update `totalPracticeMinutes` in progress state
5. Persist to localStorage

**Implementation Approach:**
```typescript
// In App.tsx
const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

// Track active learning modes
const TRACKED_MODES = [
  AppMode.CHAT, AppMode.TEXT_MODE, AppMode.LIVE_VOICE,
  AppMode.LESSONS, AppMode.QUIZ, AppMode.REVIEW_SESSION
];

useEffect(() => {
  if (TRACKED_MODES.includes(mode)) {
    setSessionStartTime(new Date());
  } else if (sessionStartTime) {
    const minutes = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000);
    setProgress(prev => ({
      ...prev,
      totalPracticeMinutes: prev.totalPracticeMinutes + minutes
    }));
    setSessionStartTime(null);
  }
}, [mode]);
```

**Acceptance Criteria:**
- [ ] Timer starts when entering tracked mode
- [ ] Timer stops when leaving tracked mode
- [ ] Minutes are added to `totalPracticeMinutes`
- [ ] Dashboard "Minutos" stat shows accurate value
- [ ] Time survives page refresh (via localStorage)
- [ ] Minimum granularity: 1 minute

---

### 2.3 Implement Lesson Completion Tracking

**Current State:**
After completing a lesson submodule, it's not recorded in `lessonsCompleted`.

**Files:** `App.tsx`, `components/LessonsView.tsx`, `components/ChatView.tsx`

**Required Behavior:**
1. When user completes a lesson (finishes chat session started from a lesson):
   - Add submodule ID to `lessonsCompleted` array
   - Avoid duplicates
2. Show visual indicator on completed lessons
3. Update badge progress for "Curriculum Completer"

**Implementation Approach:**

1. Pass submodule ID when starting a lesson:
```typescript
// LessonsView.tsx
<button onClick={() => onStartLesson(sub.prompt, sub.id)}>
```

2. Track active lesson in App.tsx:
```typescript
const [activeSubmoduleId, setActiveSubmoduleId] = useState<string | null>(null);

const startLesson = (prompt: string, submoduleId?: string) => {
  setActiveSubmoduleId(submoduleId || null);
  // ... existing logic
};
```

3. Mark complete in `finishChatSession`:
```typescript
if (activeSubmoduleId && !prev.lessonsCompleted.includes(activeSubmoduleId)) {
  return {
    ...prev,
    lessonsCompleted: [...prev.lessonsCompleted, activeSubmoduleId]
  };
}
```

4. Visual indicator in LessonsView:
```typescript
const isCompleted = lessonsCompleted.includes(sub.id);
// Show checkmark or "Completed" badge
```

**Acceptance Criteria:**
- [ ] Submodule ID passed through lesson flow
- [ ] Completing lesson adds ID to `lessonsCompleted`
- [ ] No duplicate entries allowed
- [ ] LessonsView shows completion status per submodule
- [ ] Dashboard "Aulas Completas" count is accurate
- [ ] "Curriculum Completer" badge unlocks at 5 completions

---

### 2.4 Fix Streak Logic Bug

**Current State:**
Streak only increments, never resets when days are missed.

**File:** `App.tsx:328-333`

**Current Code:**
```typescript
const today = new Date().toDateString();
const last = new Date(prev.lastSessionDate).toDateString();
let newStreak = prev.streak;
if (today !== last) {
   newStreak += 1;  // Always increments!
}
```

**Required Behavior:**
1. If last session was yesterday: increment streak
2. If last session was today: keep streak same
3. If last session was 2+ days ago: reset streak to 1

**Fixed Code:**
```typescript
const today = new Date();
const lastSession = new Date(prev.lastSessionDate);

// Normalize to date only (no time)
const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const lastDate = new Date(lastSession.getFullYear(), lastSession.getMonth(), lastSession.getDate());

const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

let newStreak = prev.streak;
if (diffDays === 0) {
  // Same day - no change
  newStreak = prev.streak;
} else if (diffDays === 1) {
  // Yesterday - increment
  newStreak = prev.streak + 1;
} else {
  // Missed days - reset
  newStreak = 1;
}
```

**Acceptance Criteria:**
- [ ] Streak stays same for multiple sessions on same day
- [ ] Streak increments when practicing on consecutive days
- [ ] Streak resets to 1 when missing one or more days
- [ ] Edge case: handles timezone changes correctly
- [ ] Dashboard streak display updates correctly
- [ ] Streak badges unlock at correct thresholds (3, 7, 30)

**Test Cases:**
| Last Session | Today | Expected Streak (prev=5) |
|--------------|-------|--------------------------|
| 2024-12-20 | 2024-12-20 | 5 (no change) |
| 2024-12-19 | 2024-12-20 | 6 (increment) |
| 2024-12-18 | 2024-12-20 | 1 (reset) |
| 2024-12-15 | 2024-12-20 | 1 (reset) |

---

### 2.5 Fix Typos in QuizView

**Current State:**
Two Portuguese typos in the quiz completion screen.

**File:** `components/QuizView.tsx`

**Fixes Required:**

| Line | Current | Correct |
|------|---------|---------|
| 73 | "Muinto Bem!" | "Muito Bem!" |
| 146 | "Exclicação do Iwry" | "Explicação do Iwry" |

**Acceptance Criteria:**
- [ ] "Muito Bem!" displays correctly on quiz completion
- [ ] "Explicação do Iwry" displays correctly after each answer
- [ ] No other typos introduced

---

## 3. Technical Dependencies

- No new packages required
- No database schema changes
- No API changes required

---

## 4. Testing Requirements

### Unit Tests (if implemented)
- Streak calculation function
- Practice minutes accumulation
- Lesson completion deduplication

### Manual Testing Checklist
- [ ] Complete scenario selection flow
- [ ] Verify practice minutes increment correctly
- [ ] Complete 2 different lesson submodules
- [ ] Test streak across 3 consecutive days
- [ ] Complete a quiz and verify typos are fixed

---

## 5. Rollout Plan

1. Implement fixes in development branch
2. Test each fix individually
3. Run full regression test
4. Deploy to staging
5. Verify on staging
6. Deploy to production

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Streak reset affects existing users | Medium | Low | Only affects future calculations |
| Timer accuracy on mobile | Low | Low | Use Date objects, not intervals |
| Breaking existing localStorage data | Low | Medium | Add migration logic if needed |

---

## 7. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | [ ] |
| Engineering | | | [ ] |
| QA | | | [ ] |
