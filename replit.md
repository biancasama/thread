# Thread — AI Working Memory App

## Overview

Thread is an AI-powered external working memory tool that helps users recover their train of thought after interruptions, multitasking, or context switching. It uses Gemini AI to transform raw thoughts into structured "thought threads". Supports multimodal input: users can capture text notes AND attach screenshots/images, which are sent to Gemini's vision API for richer context reconstruction.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **AI**: Gemini via Replit AI Integrations (gemini-2.5-flash, multimodal: text + vision)
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Mobile**: Expo (React Native) with Expo Router
- **Mobile state**: React Context + AsyncStorage
- **Fonts**: Inter (pre-loaded)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── integrations-gemini-ai/ # Gemini AI client
│   └── db/                 # Drizzle ORM (not currently used)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Mobile App (`artifacts/mobile`)
- **Capture Screen**: Text input + image attachments (up to 4 images via expo-image-picker); Gemini parses all fragments into structured threads
- **Threads Screen**: View all saved thought threads
- **Thread Detail Screen**: Full thread view with "Where was I?" recovery panel and interactive next actions checklist
- **Demo Mode**: Load Demo Thread button populates with a pre-built thread
- **Local persistence**: Threads saved via AsyncStorage, survive app restarts
- **Recovery shortcut**: Banner on Capture screen shows latest thread with quick navigation

### API Server (`artifacts/api-server`)
- `POST /api/thread/parse` — Accepts multimodal fragments (text + base64 images), sends to Gemini, returns structured thread JSON
  - Request body: `{ fragments: [{ type: "text"|"image", content: string }] }`
  - Images sent as `data:<mimeType>;base64,<data>` data URLs
  - Express JSON body limit set to 20mb for image payloads
  - No database required; threads persist on device via AsyncStorage

## Thread Data Structure
```json
{
  "thread_title": "string",
  "goal": "string",
  "current_step": "string",
  "important_context": "string",
  "next_actions": ["string"],
  "priority": "low" | "medium" | "high"
}
```

## Fragment Type (API Input)
```json
{
  "type": "text" | "image",
  "content": "string (text content or base64 data URL)"
}
```

## AI Integration
- Uses Replit AI Integrations (no user API key needed)
- Model: `gemini-2.5-flash` with `responseMimeType: "application/json"`
- Multimodal: text fragments as `{text}` parts, image fragments as `{inlineData}` parts
- System prompt frames the AI as a "Cognitive Compass" that reconstructs thought threads from scattered multimodal fragments
- Graceful error handling for malformed responses

## GitHub Repository
- **URL**: https://github.com/biancasama/thread
- **Visibility**: Public
- **Default branch**: main
- **Remote name**: `origin`

## Environment Variables
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Auto-set by Replit
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Auto-set by Replit
- `EXPO_PUBLIC_DOMAIN` — Injected at build time for API URL routing

## Design
- Color: Soft violet/indigo accent (#7C6EEA) on lavender-tinted background (#F8F7FF)
- Typography: Inter (400, 500, 600, 700)
- Custom app icon generated with AI
- Priority badges: Red (high), Amber (medium), Green (low)
- Liquid glass tab bar on iOS 26+
- Tab bar height constant: `TAB_BAR_HEIGHT = 49` in `constants/layout.ts`
