# Thread

<p align="center">
  <img src="https://raw.githubusercontent.com/biancasama/thread/main/logo.png" alt="Thread — Ariadne's thread through the labyrinth of your mind" width="720" />
</p>

**Your second brain — for when yours needs a rest.**

Thread is an AI-powered external working memory that helps you recover your train of thought after interruptions, multitasking, or cognitive overload.

You capture fragments — text dumps, screenshots, voice notes — and Gemini reconstructs them into a structured **thought thread** that tells you where you were and what to do next.

Built at the **Gemini 3 Paris Hackathon 2026** by Bianca Sama.

---

# Demo

![Thread demo](docs/demo.gif)

A quick demo showing how Thread captures fragments and reconstructs a train of thought.

---

# The Problem

Modern work fragments our attention.

Meetings interrupt deep work. Notifications break focus. Tabs multiply. When the interruption ends, the hardest part is often remembering **what you were doing and why**.

For many people this happens dozens of times per day.

For others, cognitive fatigue makes the problem worse:

- People recovering from illness or burnout may experience persistent brain fog
- Knowledge workers constantly context-switch between tasks
- Older adults may experience mild memory decline affecting daily tasks

The impact is massive. Neurological disorders already create enormous economic strain. For example, **the global cost of dementia alone exceeded $1.3 trillion in 2019 and is projected to reach $2.8 trillion by 2030**.

While Thread does not treat medical conditions, it explores whether AI can help people **offload cognitive reconstruction work in everyday life**.

---

# The Insight

When you lose your train of thought, there is no good way to get it back.

Notes apps store information but rarely reconstruct context.  
Reminders tell you what to do later, not what you were doing now.  
Task managers track tasks but not the **state of your thinking**.

Your brain must rebuild the entire context from scratch.

What if you could **pause your thinking — and return exactly where you left off?**

---

# The Solution

Thread is a **cognitive continuity tool**.

It captures fragments of thought — text, screenshots, or images — and uses Gemini's multimodal reasoning to reconstruct a structured thread:

• **Thread title** — what you were working on  
• **Goal** — the outcome you were aiming for  
• **Current step** — the exact point where you stopped  
• **Important context** — synthesized from everything you captured  
• **Next actions** — concrete steps to resume work  
• **Priority level** — how urgent it is  

When you return — minutes later or the next morning — you open Thread and tap **"Where was I?"**.

Instead of re-thinking everything, your context reloads instantly.

---

# User Journey

You're mid-task. An interruption is coming — a meeting, a phone call, a message.

You open Thread and quickly capture what you're thinking: a rough text dump, maybe a screenshot of what's on your screen.

It doesn't have to be organized.

Thread processes the fragments. Gemini reads the text and images together and reconstructs your intent.

Now you have a structured thread describing:

- your goal
- what you were doing
- what comes next

You handle the interruption.

Later, when you return, you open Thread and tap your latest thread.

There it is: the context you lost, reconstructed in seconds.

---

# Who This Helps

Thread is designed for anyone who experiences frequent context switching or cognitive overload.

| Audience | How Thread helps |
|--------|--------|
| Knowledge workers | Dump task context before switching and resume instantly |
| Students | Capture fragmented research sessions and resume later |
| People experiencing cognitive fatigue | Offload mental reconstruction to an external system |
| Older adults | External memory support for daily tasks |

Thread is **not a medical tool** — it is an experiment in **AI-assisted cognitive continuity**.

---

# Why Gemini Makes This Possible

Before multimodal models like Gemini, reconstructing a train of thought from mixed inputs was extremely difficult.

| Before multimodal AI | With Gemini |
|---|---|
| Screenshots stored as static images | Gemini interprets visual content directly |
| Text and images processed separately | Unified multimodal reasoning |
| Keyword extraction | Context synthesis across fragments |
| Generic summaries | Structured reconstruction of intent |

Gemini can analyze **text and images together in a single prompt**, enabling the model to infer goals, steps, and context from messy input.

---

# Architecture

![Architecture](docs/architecture.png)
