# 🇧🇷 Fala Comigo - Your Personal Brazilian Portuguese Companion

<div align="center">

![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Powered-4285f4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An intelligent, AI-powered language learning platform for mastering Brazilian Portuguese**

[🚀 Features](#-key-features) • [🏗️ Architecture](#️-how-its-built) • [📖 Getting Started](#-getting-started) • [🎯 Learning Modes](#-learning-modes)

</div>

---

## 📋 Table of Contents

- [What is Fala Comigo?](#-what-is-fala-comigo)
- [Key Features](#-key-features)
- [How It's Built](#️-how-its-built)
- [Application Architecture](#-application-architecture)
- [Learning Modes](#-learning-modes)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Feature Deep Dive](#-feature-deep-dive)
- [Data & Privacy](#-data--privacy)

---

## 🌟 What is Fala Comigo?

**Fala Comigo** (Portuguese for "Talk to Me") is your personal Brazilian Portuguese learning companion powered by cutting-edge AI technology. Think of it as having a sophisticated, culturally-aware Brazilian tutor available 24/7, ready to help you master the language through conversation, structured lessons, and real-time feedback.

### 🎭 Meet Iwry - Your AI Tutor

Iwry (pronounced "Yuri") is your dedicated Portuguese coach—a patient, encouraging, and knowledgeable assistant that adapts to your learning level and provides culturally-rich insights into Brazilian Portuguese.

### 🎯 Who Is This For?

- **Beginners** starting their Portuguese journey (A1 level)
- **Intermediate learners** building confidence (A2 level)
- **Advanced students** refining fluency (B2 level)
- Anyone interested in Brazilian culture and language

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎤 Real-Time Voice Conversation
Talk naturally with AI in Portuguese using your microphone. Get instant pronunciation feedback and practice speaking like a native.

### 📚 Smart Dictionary
Look up words instantly with detailed definitions, conjugations, usage examples, and cultural notes specifically for English speakers.

### ✅ Grammar Correction Engine
Receive gentle, context-aware corrections as you practice. Learn from your mistakes with clear explanations.

</td>
<td width="50%">

### 📊 Progress Tracking
Monitor your growth across vocabulary, grammar mastery, learning streaks, and session analytics.

### 🏆 Achievement System
Earn badges for reaching milestones: maintaining streaks, mastering vocabulary, completing lessons, and more.

### 🖼️ Image Analysis
Learn from photos! Upload images of menus, signs, or documents and learn vocabulary in context.

</td>
</tr>
</table>

### 📈 Learning Modes Comparison

| Mode | Best For | Interaction Type | AI Complexity |
|------|----------|------------------|---------------|
| 💬 **Chat** | Natural conversation practice | Text + Voice | High |
| 📱 **Text Mode** | Casual texting practice (WhatsApp style) | Text only | Medium |
| 🎙️ **Live Voice** | Real-time speaking practice | Voice only | Very High |
| 📖 **Lessons** | Structured curriculum learning | Interactive | High |
| ❓ **Quiz** | Testing your knowledge | Multiple choice | Medium |
| 📸 **Image Analysis** | Visual learning from photos | Image + Text | High |
| 📕 **Dictionary** | Word lookup & translation | Search | Fast |

---

## 🏗️ How It's Built

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │   Chat   │  │ Lessons  │  │  Voice   │   │
│  │   View   │  │   View   │  │   View   │  │   View   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LOGIC                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  React State Management (Hooks)                    │     │
│  │  • User Progress • Messages • Modes • Analytics    │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Google Gemini API Integration                │   │
│  │  • Text Chat  • Voice  • Grammar Check  • TTS       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA STORAGE                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Browser LocalStorage (Client-Side Persistence)     │   │
│  │  • Vocabulary • Progress • Corrections • Logs        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 Component Structure

The application is built using **React components** - think of these as individual building blocks that come together to create the full experience:

<details>
<summary><b>🖥️ View Components (Click to expand)</b></summary>

- **DashboardView** - Your learning home base showing progress and recommendations
- **ChatView** - Main conversation interface with Iwry
- **LiveVoiceView** - Real-time voice conversation mode
- **LessonsView** - Structured curriculum with modules and sublessons
- **QuizView** - Interactive assessments
- **DictionaryView** - Word lookup and translation tool
- **ReviewSessionView** - Grammar correction review interface
- **CorrectionLibraryView** - History of all your grammar mistakes
- **LearningLogView** - Complete session history and analytics
- **ImageAnalyzer** - Upload and learn from images
- **CustomModuleGenerator** - AI-generated personalized lessons

</details>

<details>
<summary><b>🧩 UI Components (Click to expand)</b></summary>

- **Sidebar** - Navigation menu (desktop)
- **MobileNav** - Bottom navigation (mobile)
- **Header** - Top app bar with context
- **BadgeShowcase** - Achievement display
- **SessionSummaryModal** - Post-session analytics popup
- **EntryScreen** - Welcome and setup flow
- **LoadingScreen** - Beautiful loading states

</details>

---

## 🔧 Application Architecture

### 📊 Data Flow Diagram

```
User Action
    │
    ▼
┌─────────────────┐
│ React Component │ ──► Update UI State
└─────────────────┘
    │
    ▼
Need AI Response?
    │
    ├─── YES ──► ┌──────────────────┐
    │            │  Gemini Service  │
    │            │  (AI Processing) │
    │            └──────────────────┘
    │                     │
    │                     ▼
    │            ┌──────────────────┐
    │            │   AI Response    │
    │            └──────────────────┘
    │                     │
    ▼                     ▼
┌──────────────────────────────────┐
│    Update User Progress Data     │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│   Save to Browser LocalStorage   │
└──────────────────────────────────┘
    │
    ▼
Display Updated UI to User
```

### 🧠 How the AI Works

The application uses **Google Gemini AI** - one of the world's most advanced language models. Here's what happens when you interact:

1. **You send a message** (text, voice, or image)
2. **The app adds context** about your learning level, vocabulary, and goals
3. **Gemini AI processes** your input and generates a personalized response
4. **The app analyzes** the interaction for new vocabulary and grammar patterns
5. **Your progress updates** automatically, tracking improvements

### 🎯 AI Model Selection

Different features use different AI models optimized for specific tasks:

| Feature | AI Model | Why This Model? |
|---------|----------|-----------------|
| Chat Conversations | Gemini 3 Flash Preview | ⚡ Fast responses, great for dialogue |
| Custom Lessons | Gemini 3 Pro Preview | 🧠 Deep reasoning for curriculum design |
| Real-Time Voice | Gemini 2.5 Flash Native Audio | 🎤 Optimized for live voice streaming |
| Text-to-Speech | Gemini 2.5 Flash TTS | 🔊 Natural Brazilian Portuguese voice |
| Dictionary Lookup | Gemini 3 Flash Preview | ⚡ Instant, accurate translations |

---

## 🎯 Learning Modes

### 1. 💬 Chat Mode - Natural Conversation

Your primary learning mode. Have open-ended conversations about any topic in Portuguese.

**What makes it special:**
- Iwry responds with **bold Portuguese** and *italic English translations*
- Every response includes a "Fluency Tip" for cultural insights
- Grammar corrections happen naturally without interrupting flow
- Topics adapt to your interests and difficulty level

**Example conversation:**
```
You: "Eu gosto de música brasileira"

Iwry: "**Que legal!** *How cool!* **Você tem algum artista favorito?**
*Do you have a favorite artist?*

💡 Fluency Tip: Brazilians often use 'cara' (literally 'face')
as slang for 'dude' or to emphasize surprise!"
```

---

### 2. 📱 Text Mode - WhatsApp Style

Practice the way Brazilians actually text! This mode uses authentic Brazilian texting slang.

**Learn real texting language:**
- `vc` → você (you)
- `pq` → porque (because)
- `tb` → também (also)
- `kkk` → Brazilian laugh (equivalent to "haha")
- `rsrs` → risos (laughter)

**Perfect for:** Understanding texts from Brazilian friends or social media

---

### 3. 🎙️ Live Voice - Real-Time Speaking

The most immersive mode! Have real-time voice conversations using your microphone.

**Features:**
- Speak naturally - AI understands your pronunciation
- Instant voice responses in Brazilian Portuguese
- Real-time transcription shows what you said
- Practice authentic conversation rhythm

**Requirements:** Microphone access

---

### 4. 📖 Lessons - Structured Curriculum

Follow a proven learning path with pre-built lesson modules.

**Curriculum Levels:**

<details>
<summary><b>🟢 A1 Beginner Level</b></summary>

- Basic introductions and greetings
- Numbers, colors, and time
- Family and relationships
- Food and dining
- Daily routines

</details>

<details>
<summary><b>🟡 A2 Intermediate Level</b></summary>

- Shopping and transactions
- Asking for directions
- Describing places
- Past tense narratives
- Making plans

</details>

<details>
<summary><b>🔵 B1-B2 Advanced Level</b></summary>

- Business Portuguese
- Complex grammar (subjunctive)
- Cultural discussions
- Idiomatic expressions
- Professional communication

</details>

**Each lesson includes:**
- 📝 Grammar explanations
- 🎯 Practice exercises
- 📊 Progress milestones
- ❓ Knowledge quizzes

---

### 5. ❓ Quiz Mode - Test Your Knowledge

AI-generated quizzes on any topic you're studying.

**How it works:**
1. Enter a topic (e.g., "food vocabulary")
2. AI generates 3 multiple-choice questions
3. Get instant feedback on answers
4. Review correct answers and explanations

---

### 6. 📕 Dictionary - Smart Lookup

More than just translations—get comprehensive word information.

**For every word, you get:**

| Information | Example |
|-------------|---------|
| **Translation** | estudar → to study |
| **Part of Speech** | Verb (transitive) |
| **Definition** | To dedicate time to learning |
| **Conjugations** | eu estudo, você estuda, ele estuda... |
| **Gender** (for nouns) | o livro (masculine), a casa (feminine) |
| **Usage Example** | "Eu estudo português todos os dias" |
| **Cultural Notes** | False cognates, regional differences |

**Bonus:** Save words directly to your vocabulary list!

---

### 7. 📸 Image Analysis - Visual Learning

Upload photos and learn vocabulary in context.

**Use cases:**
- 📋 Restaurant menus
- 🚏 Street signs
- 📄 Homework or documents
- 📰 Articles or screenshots

The AI will:
- Identify Portuguese text in the image
- Translate and explain vocabulary
- Provide cultural context
- Extract words to your vocabulary list

---

### 8. 📊 Dashboard - Your Learning Hub

Your central command center showing:

**Progress Visualizations:**
- 📈 **Radar Chart** - Six skill areas at a glance
- 📊 **Grammar Mastery** - Progress across 5 grammar categories
- 🔥 **Learning Streak** - Days of consecutive practice
- 📚 **Vocabulary Count** - Total words in your collection

**Quick Actions:**
- 🎯 Start recommended lessons
- 📖 Review vocabulary flashcards
- 🏆 View earned badges
- 📝 See recent corrections

---

## 💻 Technology Stack

### Frontend Framework

```
React 19.2.3 + TypeScript 5.8.2
├── UI Building: React Components
├── Type Safety: TypeScript
├── Build Tool: Vite 6.2.0
├── Styling: Tailwind CSS
└── Icons: Lucide React
```

### AI & Intelligence

```
Google Gemini API
├── Gemini 3 Flash Preview (Fast chat)
├── Gemini 3 Pro Preview (Deep reasoning)
├── Gemini 2.5 Flash Native Audio (Real-time voice)
└── Gemini 2.5 Flash TTS (Text-to-speech)
```

### Data Visualization

```
Recharts 3.6.0
├── Radar Charts (Skill overview)
├── Bar Charts (Grammar mastery)
└── Progress Indicators
```

### Storage

```
Browser LocalStorage
├── User progress
├── Vocabulary lists
├── Session history
├── Grammar corrections
└── Earned badges
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, you'll need:

1. **Node.js** installed on your computer ([Download here](https://nodejs.org/))
2. **A Google Gemini API key** ([Get one here](https://ai.google.dev/))

### Installation Steps

**Step 1: Get the code**
```bash
git clone <repository-url>
cd Iwry-Portuguese-Learning-v1
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Add your API key**

Create a file called `.env.local` in the project folder:
```
GEMINI_API_KEY=your_api_key_here
```

**Step 4: Start the app**
```bash
npm run dev
```

**Step 5: Open in browser**

Navigate to: `http://localhost:3000`

### 🎉 First Time Setup

1. **Welcome Screen** - Enter your name and select your Portuguese level
2. **Choose Difficulty** - Beginner (A1), Intermediate (A2), or Advanced (B2)
3. **Grant Permissions** - Allow microphone access for voice features
4. **Start Learning** - Jump into chat or explore lessons!

---

## 🔍 Feature Deep Dive

### 📈 Progress Tracking System

Your learning journey is tracked across multiple dimensions:

<details>
<summary><b>📚 Vocabulary Tracking</b></summary>

Each word in your vocabulary has:
- **Confidence Score** (0-100) - How well you know it
- **Last Practiced Date** - When you last reviewed it
- **Source** - Where you learned it (lesson, chat, dictionary)
- **Meaning** - English translation

**Auto-Learning:** New words are automatically extracted from conversations!

</details>

<details>
<summary><b>✅ Grammar Mastery (5 Categories)</b></summary>

Track your mastery (0-100%) across:

1. **Present Tense** - Current actions and habits
2. **Future Tense** - Talking about future events
3. **Subjunctive** - Hypotheticals and emotions
4. **Prepositions** - em, de, para, por, etc.
5. **Pronouns** - eu, você, ele, ela, nós, etc.

Progress updates automatically as you practice!

</details>

<details>
<summary><b>📊 Session Analytics</b></summary>

After each conversation, AI analyzes:
- New vocabulary learned
- Grammar patterns used
- Conversation topics covered
- Suggested next steps
- Overall session summary

All sessions are saved to your **Learning Log** for review!

</details>

<details>
<summary><b>🔥 Learning Streaks</b></summary>

Build consistency with streak tracking:
- Practice daily to maintain your streak
- Earn badges for milestone streaks (3, 7, 30 days)
- See your streak count on the dashboard

**Tip:** Even 5 minutes counts toward your streak!

</details>

---

### 🏆 Achievement System

Earn badges as you progress through your learning journey:

| Badge | Category | Requirement | Icon |
|-------|----------|-------------|------|
| **Habit Builder** | Streak | 3-day learning streak | 🔥 |
| **Weekly Warrior** | Streak | 7-day learning streak | 📅 |
| **Language Legend** | Streak | 30-day learning streak | 👑 |
| **Wordsmith** | Vocabulary | Learn 50 words | 📚 |
| **Lexicon Master** | Vocabulary | Learn 100 words | 📖 |
| **Curriculum Completer** | Lessons | Complete 5 lessons | 🎓 |
| **High Achiever** | Mastery | Reach 75% grammar mastery | ⭐ |

**Newly earned badges** appear in a celebration modal!

---

### ✏️ Grammar Correction Engine

Learn from your mistakes with intelligent, non-intrusive corrections.

**How it works:**

1. **You write:** "Eu foi ao mercado ontem"
2. **AI detects error:** Verb conjugation mistake
3. **You receive:**
   ```
   ❌ Incorrect: "Eu foi ao mercado"
   ✅ Correct: "Eu fui ao mercado"

   💡 Explanation: The verb "ir" (to go) conjugates as "fui"
   for first person singular (eu) in the past tense, not "foi".

   Category: Verb Tenses - Past
   ```

**All corrections are saved** to your Correction Library for review!

**Correction Categories:**
- Verb Tenses
- Prepositions
- Pronouns
- Gender Agreement
- Article Usage
- Word Order

---

### 🗂️ Memory System

Import external learning materials to give Iwry context about your studies.

**Memory Types:**
- 📝 **Homework** - Assignments from classes
- 📖 **Reading** - Books, articles you're reading
- 💼 **Meeting** - Portuguese business meetings
- 👥 **Social** - Conversations with native speakers

**Benefits:**
- Iwry references your memories in conversations
- Vocabulary is extracted automatically
- Personalized lessons based on your real-world needs

---

### 🎨 Custom Module Generator

Can't find a lesson on exactly what you need? Generate one!

**Example:** "Create a lesson about ordering food at a Brazilian steakhouse"

**AI will create:**
- Module title and description
- 3-5 submodules with specific topics
- Grammar explanations for each section
- Practice exercises and milestones
- Optional quiz questions

**Powered by:** Gemini 3 Pro with deep reasoning for high-quality curriculum design

---

## 📱 User Interface

### Responsive Design

<table>
<tr>
<td width="50%">

### 🖥️ Desktop Experience
- Permanent sidebar navigation
- Large chat area
- Multi-column layouts
- Full-screen lessons

</td>
<td width="50%">

### 📱 Mobile Experience
- Bottom navigation bar
- Touch-optimized buttons
- Swipeable interfaces
- Mobile voice recording

</td>
</tr>
</table>

### 🎨 Design Philosophy

- **Clean & Minimal** - Focus on learning, not clutter
- **Intuitive Navigation** - Get where you need in one click
- **Consistent Icons** - Lucide React icon set throughout
- **Readable Typography** - Optimized for Portuguese diacritics (á, ã, ç, etc.)

---

## 💾 Data & Privacy

### Where Your Data Lives

**Everything stays on your device!**

- ✅ All progress stored in browser LocalStorage
- ✅ No server-side database
- ✅ Data never leaves your computer
- ✅ Complete privacy

**Exception:** API calls to Google Gemini for AI responses (required for functionality)

### What Data Is Stored

```javascript
{
  "userProfile": {
    "name": "Your name",
    "level": "A1, A2, or B2",
    "difficulty": "Selected difficulty"
  },
  "vocabulary": [/* Array of words you've learned */],
  "grammarMastery": {/* Progress by category */},
  "sessionLogs": [/* Your conversation history */],
  "correctionHistory": [/* Grammar mistakes for review */],
  "badges": [/* Achievements earned */],
  "learningStreak": /* Consecutive practice days */
}
```

### Clear Your Data

You can reset all progress at any time by clearing browser data (LocalStorage).

---

## 🔮 Advanced Features

<details>
<summary><b>🎤 Audio Context & Voice Recognition</b></summary>

**Technical Details:**
- Input: 16kHz audio sampling
- Output: 24kHz speech synthesis
- Voice: "Kore" (Brazilian Portuguese female)
- Streaming: Real-time audio chunks processed as you speak

</details>

<details>
<summary><b>🧠 AI Response Formatting</b></summary>

All AI responses follow consistent formatting:
- **Bold** for Portuguese text
- *Italics* for English translations
- 💡 Fluency Tips as callouts
- Emoji-enhanced learning cues

</details>

<details>
<summary><b>📐 Difficulty Adaptation</b></summary>

Iwry adjusts personality and complexity based on your level:

**A1 (Beginner):**
- Patient, encouraging tone
- Simple vocabulary and short sentences
- Frequent translations
- Basic grammar explanations

**A2 (Intermediate):**
- Friendly, supportive tone
- Moderate complexity
- Occasional translations
- Intermediate grammar

**B2 (Advanced):**
- Sophisticated, peer-like tone
- Complex sentences and idioms
- Minimal translations
- Advanced grammar and cultural nuance

</details>

<details>
<summary><b>🎯 Structured Output with JSON Schemas</b></summary>

For consistency, certain features use AI with structured JSON outputs:
- **Dictionary definitions** - Guaranteed format for conjugations and definitions
- **Session analysis** - Consistent vocabulary extraction and summaries
- **Quiz generation** - Properly formatted multiple-choice questions
- **Custom modules** - Standardized lesson structure

</details>

---

## 📂 Project Structure

```
Iwry-Portuguese-Learning-v1/
│
├── 📄 index.html              # App entry point
├── 📄 index.tsx               # React initialization
├── 📄 App.tsx                 # Main app component
├── 📄 types.ts                # TypeScript type definitions
├── 📄 constants.tsx           # AI prompts & system instructions
├── 📄 vite.config.ts          # Build configuration
├── 📄 package.json            # Dependencies
│
├── 📁 components/             # React UI components
│   ├── DashboardView.tsx      # Learning hub
│   ├── ChatView.tsx           # Conversation interface
│   ├── LiveVoiceView.tsx      # Voice conversation
│   ├── LessonsView.tsx        # Curriculum browser
│   ├── QuizView.tsx           # Assessment interface
│   ├── DictionaryView.tsx     # Word lookup
│   ├── ImageAnalyzer.tsx      # Image learning
│   ├── CorrectionLibraryView.tsx  # Grammar review
│   ├── LearningLogView.tsx    # Session history
│   ├── ReviewSessionView.tsx  # Correction review
│   ├── CustomModuleGenerator.tsx  # Lesson creator
│   ├── BadgeShowcase.tsx      # Achievement display
│   ├── SessionSummaryModal.tsx  # Post-chat analysis
│   ├── Sidebar.tsx            # Desktop navigation
│   ├── MobileNav.tsx          # Mobile navigation
│   ├── Header.tsx             # Top bar
│   ├── EntryScreen.tsx        # Welcome flow
│   └── LoadingScreen.tsx      # Loading states
│
└── 📁 services/
    └── geminiService.ts       # AI integration layer
```

---

## 🎓 Learning Philosophy

Fala Comigo is built on proven language learning principles:

### 1. **Comprehensible Input** (Krashen's Theory)
- Content slightly above your current level (i+1)
- Context helps you understand new words
- Natural acquisition through exposure

### 2. **Immediate Feedback**
- Grammar corrections in real-time
- Pronunciation feedback via voice
- Instant validation of understanding

### 3. **Spaced Repetition**
- Vocabulary tracked with confidence scores
- Review prompts for weak words
- Natural re-exposure in conversations

### 4. **Cultural Context**
- Brazilian Portuguese specifically (not European)
- Slang, idioms, and cultural notes
- Real-world scenarios and use cases

### 5. **Multi-Modal Learning**
- Reading (text chat)
- Listening (voice responses)
- Speaking (voice input)
- Writing (text practice)
- Visual (image analysis)

---

## 🛠️ Development Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |

---

## 🤝 Contributing

This is a personal learning project, but contributions are welcome!

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powering the intelligent tutoring system
- **React Team** - For the incredible UI framework
- **Brazilian Portuguese Community** - For inspiration and cultural insights
- **Language learners worldwide** - For the motivation to build better tools

---

## 📞 Support & Feedback

Found a bug? Have a feature request? Want to share your learning success?

- 🐛 **Report Issues:** Open a GitHub issue
- 💡 **Feature Requests:** Start a discussion
- ⭐ **Show Support:** Star this repository

---

<div align="center">

### 🇧🇷 Boa sorte com seus estudos! 🇧🇷
*(Good luck with your studies!)*

**Made with ❤️ for Portuguese learners everywhere**

[⬆ Back to Top](#-fala-comigo---your-personal-brazilian-portuguese-companion)

</div>
