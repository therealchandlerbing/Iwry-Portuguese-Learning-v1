# Iwry - User-Facing Features TODO
**For Personal Use - Focus on Learning Experience**

---

## Current Status: What's Already Built ✅

You have a fully functional Portuguese learning app with:
- ✅ Live Voice Practice (real-time AI conversations)
- ✅ WhatsApp/Text Mode (Brazilian slang texting)
- ✅ Corrections Hub (grammar mistakes tracking)
- ✅ Learning Dashboard (progress visualization)
- ✅ Structured Lessons (A1→B2 curriculum)
- ✅ Dictionary (word lookup with conjugations)
- ✅ Quiz System (AI-generated assessments)
- ✅ Review Center (weak areas practice)

**85% of user-facing features are done!**

---

## What's Missing (User Experience Gaps)

### 1. Traditional Flashcard System ⭐ PRIORITY
**Current State:** Quiz-based review exists, but NO traditional flip-card flashcards
**Gap:** The PRD mentions flashcards with spaced repetition, but it's not implemented

**What You'd Get:**
- Traditional card flipping interface (tap to reveal answer)
- Spaced repetition algorithm (cards appear when you need to review them)
- Auto-generation from:
  - Your grammar mistakes (from Corrections Hub)
  - Your saved vocabulary (from Dictionary)
  - Lesson content
- Self-rating system (Hard/Medium/Easy) to adjust review frequency
- "Due Today" queue (cards scheduled for review)

**User Experience:**
```
┌─────────────────────────┐
│  Como se diz "meeting"? │  ← Front of card
│                         │
│    [Show Answer]        │
└─────────────────────────┘

↓ Tap to flip ↓

┌─────────────────────────┐
│      reunião            │  ← Back of card
│                         │
│  [Hard] [Medium] [Easy] │  ← Rate difficulty
└─────────────────────────┘
```

**Effort:** 8-10 hours to build properly

---

### 2. Better Integration Between Features
**Current State:** Features work independently but don't talk to each other well
**Gap:** Manual work to move mistakes/vocabulary into practice

**Examples of Better Integration:**

**A. Corrections → Flashcards**
- In Corrections Hub, add "Create Flashcard" button next to each mistake
- Auto-generate card: Front = "Wrong sentence", Back = "Correct form + explanation"

**B. Dictionary → Flashcards**
- When you save a word, auto-create flashcard
- Front = English word, Back = Portuguese translation

**C. Lessons → Practice**
- After completing a lesson, get prompted: "Practice this in voice mode?"
- AI uses lesson topic in next conversation

**D. Voice Practice → Targeted Review**
- After voice session, show "Review your mistakes now?" button
- Jump directly to flashcards for those specific errors

**Effort:** 3-4 hours to add these connections

---

### 3. Password Reset (Quality of Life)
**Current State:** If you forget password, you're locked out
**Gap:** No way to reset password

**What You'd Get:**
- "Forgot Password?" link on login
- Email with reset link
- Set new password

**For Personal Use:** This is helpful but lower priority since you know your password

**Effort:** 3-4 hours

---

### 4. Image Analysis Full Integration
**Current State:** ImageAnalyzer component exists but isn't connected
**Gap:** Can't use camera/photos to extract vocabulary

**What You'd Get:**
- Upload photos of Portuguese text (menus, signs, documents)
- AI extracts vocabulary and grammar
- Save words directly to your Dictionary
- Save mistakes to Corrections Hub

**Use Cases:**
- Take photo of restaurant menu → learn food vocabulary
- Upload screenshot of Portuguese article → extract new words
- Snap picture of street sign → practice pronunciation

**Effort:** 3-4 hours to fully integrate

---

### 5. Spaced Repetition for Corrections
**Current State:** Corrections are logged but not actively reviewed on a schedule
**Gap:** No system reminds you to review old mistakes

**What You'd Get:**
- Automatic review scheduling: Day 1 → 3 → 7 → 14 → 30
- "Review Due" notification on Dashboard
- Mark corrections as "Mastered" after 3 correct uses
- Focus practice on mistakes you keep making

**This could be part of the Flashcard system** (integrated approach)

**Effort:** 2-3 hours if built into Flashcards, 5-6 hours as separate system

---

## Recommended Focus: Just Build Flashcards

Since you already have 85% of features working, the **biggest user experience gap is the flashcard system**.

### Why Flashcards Matter Most:
1. **Core learning method** - Spaced repetition is scientifically proven for language learning
2. **Already in your PRD** - You planned for this feature
3. **Ties everything together** - Connects corrections, vocabulary, and lessons
4. **Daily practice loop** - Gives you something to do every day (review 10 cards)

### What Good Flashcards Would Add:
- Open app → See "15 cards due today"
- Practice for 5-10 minutes reviewing cards
- Rate each card (Hard/Medium/Easy)
- System schedules next review automatically
- Progress bar showing mastery of each topic

---

## Simplified Roadmap (Personal Use)

### Option 1: Minimal (Just Flashcards)
**1-2 days of work:**
- Build flashcard UI (flip cards, rating)
- Implement SM-2 spaced repetition algorithm
- Auto-generate from corrections + vocabulary
- Add "Due Today" counter to Dashboard

**Result:** Complete learning loop with daily review habit

---

### Option 2: Enhanced (Flashcards + Integration)
**3-4 days of work:**
- Everything in Option 1
- Add "Create Flashcard" buttons throughout app
- Auto-create cards when saving words/corrections
- Add "Practice This" buttons in Lessons
- Image upload integration

**Result:** Seamless flow between all features

---

### Option 3: Deluxe (Everything)
**5-6 days of work:**
- Everything in Option 2
- Password reset flow
- Advanced spaced repetition stats
- Card editing and management
- Custom card creation from scratch

**Result:** Full-featured personal language learning platform

---

## My Recommendation

**Build Option 1 (Just Flashcards)** - Here's why:
- Biggest bang for buck (1-2 days → complete the app)
- You already have all other core features
- Flashcards are the missing piece for daily practice
- Spaced repetition is essential for retention

Everything else is polish. You can always add password reset, image integration, etc. later if you want them.

---

## Next Steps

**If you want me to build the flashcard system:**
1. I'll create the FlashcardView component (flip cards, rating system)
2. Implement SM-2 spaced repetition algorithm
3. Auto-generate cards from your existing corrections and vocabulary
4. Add "X cards due today" to Dashboard
5. Wire up routing in App.tsx

**Estimated time:** 8-10 hours of development
**Result:** Complete flashcard system with spaced repetition

Want me to start building this now?
