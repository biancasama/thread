# Thread

**Your second brain — for when yours needs a rest.**

Thread is an AI-powered external working memory app that reconstructs your train of thought after interruptions, multitasking, or cognitive overload. You capture scattered fragments — text dumps, screenshots, voice notes — and Gemini stitches them into a structured "thought thread" that tells you exactly where you were and what to do next.

Built at the **Gemini 3 Paris Hackathon 2026** by [Bianca Sama](https://github.com/biancasama).

---

## The Problem

**1 in 3 adults** experience significant cognitive fatigue that disrupts their daily work and life.

For some, it's temporary — a brutal week at work, too many tabs open, one interruption too many. For others, it's persistent and life-altering:

- **Long COVID brain fog** — 65 million people worldwide struggle with persistent cognitive impairment after COVID
- **Post-concussion syndrome** — rebuilding daily cognitive routines after brain injury
- **Burnout and cognitive overload** — knowledge workers who lose their train of thought mid-task, every single day
- **Age-related memory decline** — older adults who need support to maintain independence

The cost is staggering: over **$1 trillion in annual lost productivity** from cognitive decline worldwide. And behind that number are real people — staring at their screen, knowing they were in the middle of something, unable to remember what.

### The Insight

When you lose your train of thought, there's no good way to get it back.

Notes apps don't reconstruct context — they just store text. Reminders don't know what you were doing. Task managers track what's next, not where you *were*. Your brain has to reload from scratch every time, burning through the limited cognitive energy you have left.

What if you could press pause on your brain — and come back to exactly where you left off?

---

## The Solution

Thread is a **cognitive playlist**. It takes scattered fragments of thought — text dumps, screenshots, photos of whiteboards — and uses Gemini's multimodal reasoning to stitch them into a structured thread:

- A clear **title** for what you were working on
- Your **goal** — the end state you're trying to reach
- Your **current step** — what you were doing right now
- **Important context** — synthesized from everything you captured, including what's visible in your screenshots
- **Next actions** — 2 to 4 concrete steps telling you exactly what to do when you come back
- A **priority level** — so you know how urgent it is

When you return — whether it's 10 minutes later or the next morning — you open Thread, tap "Where was I?", and your brain reloads in seconds instead of minutes.

---

## User Journey

1. **You're mid-task.** You feel an interruption coming — a meeting, a phone call, a child tugging at your sleeve, the fog rolling in.

2. **You open Thread.** You type what you're thinking, stream-of-consciousness. You snap a screenshot of what's on your screen. You don't need to be organized — just capture.

3. **Thread processes everything.** Gemini reads your text and *sees* your screenshots together. It reconstructs what you were doing, why, and what comes next. In seconds, you have a structured thread.

4. **You get interrupted.** You handle it. You don't worry about losing your place.

5. **You come back.** Maybe an hour later. Maybe tomorrow. You open Thread and tap your latest thread. There it is: your goal, your current step, the context you'd forgotten, and a checklist of exactly what to do next.

6. **You pick up where you left off.** You check off each action as you go. Your brain didn't have to do the hard work of reconstructing — Thread did it for you.

---

## Who This Helps

| Audience | How Thread helps |
|---|---|
| **Long COVID patients** | Persistent brain fog means losing your train of thought constantly. Thread captures and reconstructs so you don't have to hold it all in your head. |
| **Post-concussion recovery** | Rebuilding cognitive routines is exhausting. Thread provides the scaffolding — structured context and clear next steps — so recovery doesn't mean starting from zero every time. |
| **Overworked professionals** | Context switching kills deep work. Thread lets you dump your state before switching, and reload it instantly when you come back. |
| **Aging adults** | Memory support for daily tasks means more independence and less frustration. Thread is the external memory that's always there. |

---

## Why Gemini 3 Makes This Possible

| Before Gemini | With Gemini |
|---|---|
| Text-only input — screenshots are just files you save and forget | **True multimodal understanding** — Gemini reads your text and *sees* your screenshots in one pass, extracting code, UI state, document content, and visual context |
| Keyword extraction at best — no understanding of what you were actually doing | **Deep reasoning across fragments** — Gemini synthesizes scattered, messy input into a coherent narrative of your thought process |
| Generic summaries that don't help you resume | **Proactive reconstruction of intent** — Gemini infers your goal, identifies your current step, and generates actionable next steps, even from chaotic input |
| Separate models for text and vision, stitched together with brittle pipelines | **Single model, single call** — text and images processed together with shared context, no information lost between modalities |

Thread isn't a wrapper around a chatbot. It's a cognitive tool that only works because Gemini can reason across modalities, understand intent from fragments, and produce structured output that maps directly to how humans resume interrupted work.

---

## How It's Built

```
┌─────────────────────────────────────────────────────────┐
│                    Expo React Native App                │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Capture     │  │   Threads    │  │   Thread     │  │
│  │   Screen      │  │   List       │  │   Detail     │  │
│  │              │  │              │  │              │  │
│  │  Text input   │  │  All saved   │  │  "Where was  │  │
│  │  + Images     │  │  threads     │  │   I?" panel  │  │
│  │  (up to 4)    │  │              │  │  + checklist │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                               │
│         │  Multimodal fragments                         │
│         │  { type: "text"|"image", content: string }    │
│         ▼                                               │
│  ┌──────────────┐       ┌──────────────────────────┐   │
│  │ AsyncStorage  │       │  ThreadContext (React)    │   │
│  │ (persistence) │◄──────│  Local state + API calls  │   │
│  └──────────────┘       └──────────┬───────────────┘   │
└─────────────────────────────────────┼───────────────────┘
                                      │
                                      │ POST /api/thread/parse
                                      ▼
                          ┌──────────────────────┐
                          │   Express 5 API       │
                          │                      │
                          │  • Zod validation     │
                          │  • MIME allowlist      │
                          │  • Size limits (5MB)   │
                          │  • Max 4 images        │
                          └──────────┬───────────┘
                                     │
                                     │ Gemini multimodal parts
                                     │ text → {text}
                                     │ images → {inlineData}
                                     ▼
                          ┌──────────────────────┐
                          │  Gemini 2.5 Flash     │
                          │  (Multimodal AI)      │
                          │                      │
                          │  Text + Vision        │
                          │  → Structured JSON    │
                          │  → Thread object      │
                          └──────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | Expo (React Native) with Expo Router, TypeScript |
| State management | React Context + AsyncStorage (fully local, no account needed) |
| API server | Express 5, TypeScript, Zod validation |
| AI | Gemini 2.5 Flash via Replit AI Integrations (multimodal: text + vision) |
| API contract | OpenAPI 3.1 spec with generated Zod schemas and React Query hooks |
| Monorepo | pnpm workspaces with shared libraries |

### Key Design Decisions

- **No database, no accounts.** Threads persist locally on the device via AsyncStorage. Thread is a personal cognitive tool — your thoughts stay on your device.
- **Multimodal in, structured out.** The API accepts an array of fragments (text and/or base64 images). Gemini processes them all in a single call — no separate vision pipeline.
- **Structured JSON responses.** Gemini returns `responseMimeType: "application/json"` — no parsing heuristics, no regex, just reliable structured output.
- **Guardrails built in.** Server-side MIME allowlist (JPEG, PNG, WebP, GIF), 5MB per-image limit, max 4 images per request. Malformed inputs get clear 400 errors, not silent failures.

---

## The Market

- **200M+** people affected by cognitive impairment worldwide
- **65M** long COVID patients with persistent brain fog
- **$1T+** annual lost productivity from cognitive decline
- Existing tools (notes, reminders, task managers) don't solve the *reconstruction* problem — they store information but don't help you reload your cognitive state

Thread addresses a gap that no current consumer app fills: the moment between losing your train of thought and getting it back.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Expo Go app on your phone (for mobile testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/biancasama/thread.git
cd thread

# Install dependencies
pnpm install

# Set up Gemini API credentials
# (If running on Replit, these are auto-configured via AI Integrations)
export AI_INTEGRATIONS_GEMINI_BASE_URL=your_gemini_base_url
export AI_INTEGRATIONS_GEMINI_API_KEY=your_gemini_api_key

# Start the API server
pnpm --filter @workspace/api-server run dev

# In a separate terminal, start the Expo app
pnpm --filter @workspace/mobile run dev
```

Scan the QR code with Expo Go on your phone to open Thread.

---

## Project Structure

```
thread/
├── artifacts/
│   ├── api-server/          # Express API server (Gemini integration)
│   └── mobile/              # Expo React Native app
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 specification
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   └── integrations-gemini-ai/  # Gemini AI client wrapper
├── pnpm-workspace.yaml
└── package.json
```

---

## Hackathon

**Gemini 3 Paris Hackathon 2026** — March 14, 2026

Thread was built in a single hackathon session as a proof of concept for AI-powered cognitive support. The core question: *Can Gemini's multimodal reasoning reconstruct a human's train of thought from scattered, messy fragments well enough to actually help them get back to work?*

The answer is yes.

---

## License

MIT
