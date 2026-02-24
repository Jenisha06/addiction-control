# 🛡️ Control.
### *AI-Powered Recovery Companion — One Day at a Time*

> **Live Demo:** [addiction-control-4pg7.vercel.app]

---

## 📖 What is Control.?

Control. is a gamified, AI-powered recovery companion for alcohol addiction — built for the moments no one else shows up for.

Most recovery solutions are clinic-dependent, expensive, and unavailable at 2am when a craving hits hardest. Control. changes that. It combines Cognitive Behavioural Therapy, real-time AI conversation, gamification, and crisis support into a single anonymous companion that never sleeps and never judges.

**Recovery isn't linear. Control. never punishes someone for being human.**

---

## ✨ Core Features

### 🤖 NOVA — AI Voice Companion
- Full real-time voice conversation (tap, speak, NOVA responds out loud)
- Powered by **Gemini LLM** with empathetic fine-tuning for recovery
- **Web Speech API** for Speech-to-Text (STT) and Text-to-Speech (TTS)
- Available 24/7 — no appointment, no waitlist, no judgment
- Also works in text/chat mode

### 🧠 AI Thought Reframing (CBT)
- Detects distorted thinking patterns in user messages
- Rewrites negative thoughts into constructive truths
- *"I always fail. I'm weak."* → *"You've tried many times. That's not weakness."*
- Powered by a custom CBT-tuned system prompt on Gemini

### 🔮 AI Risk Assessment
- 10-question onboarding assessment
- Dynamic risk scoring model (High / Moderate / Low)
- Analyses patterns across answers — not just individual responses
- Entire app experience adapts to each user's risk profile

### 🌱 Living Plant Companion
- A plant that grows with every single check-in
- Day 1: Seed → Day 7: Sprout → Day 21: Flowers → Day 90: Fruit
- Miss a day? It doesn't die. It waits — exactly like real recovery
- Most emotionally resonant feature in the app

### 🎮 Gamification System
- XP earned every check-in (50 XP sober, 10 XP if relapsed — honesty rewarded)
- Levelling system with milestone unlocks
- Streak counter with longest streak record
- Badges and achievements

### 🛡️ Craving Shield — Crisis Support
- **Box Breathing** — AI-guided, resets the nervous system in 4 minutes
- **5-4-3-2-1 Grounding** — CBT technique to break the craving spiral
- **15-Minute Timer** — every craving peaks and fades
- **One-Tap SOS** — full screen calm + direct helpline connection
- Crisis support in under 3 seconds

### 📊 Daily Check-In (The Vigil)
- 3 questions, 30 seconds: mood → craving intensity → sober/not sober
- AI watches patterns across check-ins over time
- Surfaces triggers the user didn't know they had

### 📈 Insights Dashboard
- Money saved, calories avoided, health score
- Mood and craving charts (AI pattern analysis)
- Body recovery timeline — what's physically healing hour by hour
- Trigger analysis and personal records

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────┐
│              FRONTEND                    │
│   Next.js · React · Framer Motion       │
│   Fantasy Medieval UI · Mobile-First    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              AI LAYER                   │
│   Gemini LLM (NOVA chatbot + CBT)       │
│   Web Speech API (STT + TTS)            │
│   CBT Engine (system prompt tuning)     │
│   Risk Scoring Model (onboarding)       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              DATABASE                   │
│   Firebase Firestore (real-time sync)   │
│   Firebase Auth (anonymous + Google)    │
└─────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| UI Library | React + Framer Motion |
| AI / LLM | Google Gemini API |
| Voice | Web Speech API (browser-native STT + TTS) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (anonymous + Google OAuth) |
| Styling | Inline styles — custom fantasy medieval design system |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/control-app.git
cd control-app

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 App Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing homepage |
| Sign Up | `/signup` | Anonymous registration |
| Login | `/login` | Returning user login |
| Onboarding | `/onboarding` | AI risk assessment (10 Qs) |
| Dashboard | `/dashboard` | The Keep — home base |
| Check-In | `/checkin` | Daily Vigil (30 sec) |
| Emergency | `/emergency` | Craving Shield + SOS |
| CBT Tools | `/cbt` | Cognitive exercises |
| NOVA | `/chatbot` | AI voice + chat companion |
| Insights | `/insights` | Analytics + progress |
| Community | `/community` | Anonymous fellowship |
| Profile | `/profile` | User settings + stats |
| Recovery Map | `/recovery-map` | Body healing timeline |

---

## 🎯 How the AI Works

### NOVA Voice Loop
```
User speaks → Web Speech API (STT) → Text sent to Gemini API
→ Gemini generates empathetic response → Web Speech API (TTS)
→ NOVA speaks back out loud
```

### CBT Thought Reframing
```
User types negative thought → Gemini detects distortion pattern
→ Applies CBT reframing technique → Returns constructive truth
```

### Risk Assessment Model
```
10 answers collected → Each answer scored by category
→ Total score calculated → High (≥15) / Moderate (≥8) / Low
→ Risk profile saved to Firestore → App experience adapts
```

---

## 🌍 The Vision

**Now (v1.0):** Alcohol recovery companion with NOVA AI, gamification, craving shield, and the living plant.

**Next (v2.0):** Expanding to fast food addiction, social media overuse, gambling, and screen time. Plus a licensed psychologist marketplace — on-demand, in-app sessions.

**Future (v3.0):** Holographic NOVA companion (not on a screen — in your room), predictive relapse prevention AI, and hospital/clinic integrations at global scale.

> *The craving is the same. The spiral is the same. The need for a companion — identical.*

---

## 🔒 Privacy & Safety

- **100% Anonymous** — no real name required anywhere in the app
- Firebase Anonymous Auth — users get a unique ID with no personal data attached
- No data sold, no ads, no tracking beyond what's needed for the recovery features
- Emergency helpline connections are direct — no data passed to third parties

---

## 🆘 Crisis Resources

If you or someone you know needs immediate help:

- **iCall (India):** 9152987821
- **Vandrevala Foundation:** 1860-2662-345
- **NIMHANS:** 080-46110007
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

---

## 👥 Team



| Name | 
|------|
| jenisha dsouza | 
| milu achu mathew | 

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Control. — Because everyone deserves a companion on the hardest quest of their life.**

*ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ*

</div>
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
