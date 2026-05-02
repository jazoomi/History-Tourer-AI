- NEVER read or search `node_modules`.
- Treat the two packages (`Backend/`, `Mobile/`) as independent npm workspaces — install/run commands always target one of them.
- `Backend/.env` holds the real `GROQ_API_KEY`; never commit or echo it.

# Artifact AI

A mobile app for tourists that identifies artifacts and historical items from a photo and lets the user chat with an AI "expert historian" about them.

## Overview

User snaps a photo → Mobile app base64-encodes it → Backend forwards it to Groq's multimodal Llama model with a historian system prompt → AI returns a structured 3-section analysis, then answers follow-up questions using a shared conversation history.

## Repository Layout

```
Artifact-AI/                # repo folder is still History-Tourer-AI on disk
├── Backend/                # Node/Express API (port 3000)
│   ├── src/
│   │   ├── index.js            # Express setup, CORS, /health, error handler
│   │   ├── routes/grokRoute.js # POST + DELETE /routes/grokRoute
│   │   └── services/AI.js      # Groq client, system prompt, in-memory history
│   ├── package.json        # type: "module" (ESM), scripts: start / dev
│   ├── .env                # local only — holds GROQ_API_KEY
│   └── .env.example        # template (commit-safe)
├── Mobile/                 # React Native + Expo app (expo-router)
│   ├── app/                # File-based routes
│   │   ├── _layout.jsx         # Root Stack, hides headers, slide animation
│   │   ├── index.jsx           # Home screen ("Begin Tour" button)
│   │   ├── start.jsx           # Camera view, capture + resize + preview
│   │   └── ImageDetail.jsx     # Analysis screen + chat UI
│   ├── constants/
│   │   ├── api.js              # API_URL + ENDPOINTS.grok
│   │   └── theme.js            # colors / radius / spacing / type tokens
│   ├── assets/             # fonts + app icons
│   ├── app.json            # Expo config (slug, plugins, new arch enabled)
│   └── package.json        # Expo SDK 54, React 19.1, RN 0.81
├── CLAUDE.md               # (this file)
└── README.md
```

## Common Commands

Backend (requires Node 20.6+ for `--env-file`):

```bash
cd Backend
npm install
npm run dev     # node --watch --env-file=.env src/index.js
npm start       # same, without --watch
```

Mobile:

```bash
cd Mobile
npm install
npm start       # expo start (Metro bundler + QR code)
npm run android # expo start --android
npm run ios     # expo start --ios
npm run web     # expo start --web
npm run lint    # expo lint (ESLint via eslint-config-expo flat)
```

There is no test suite and no CI — `Backend/test/` and `Backend/scripts/` are empty placeholders.

## HTTP API

Base URL is whatever `Mobile/constants/api.js` resolves to (see Configuration).

| Method | Path                   | Body / Notes                                                             | Response                       |
| ------ | ---------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| GET    | `/health`              | —                                                                        | `{ status: "ok" }`             |
| POST   | `/routes/grokRoute`    | `{ "prompt": string }` — either a text question or a `data:image/...` URL | `{ "answer": string }`         |
| DELETE | `/routes/grokRoute`    | —                                                                        | `{ "status": "reset" }`        |

Request body limit: `10mb` (`express.json({ limit: '10mb' })`). CORS is open (`cors()` with defaults).

## Data Flow

1. `app/index.jsx` → router pushes `/start`.
2. `app/start.jsx` requests camera permission, captures with `expo-camera`, then pre-compresses via `expo-image-manipulator`:
   - Longest side clamped to `MAX_DIMENSION = 1280`.
   - Re-encoded as JPEG at `compress: 0.6`.
3. Navigates to `/ImageDetail` with `photoUri`.
4. `app/ImageDetail.jsx`:
   - Reads file as base64 using `expo-file-system/legacy` (⚠️ legacy import is intentional on SDK 54).
   - Prefixes `data:image/jpeg;base64,` and POSTs to `ENDPOINTS.grok`.
   - 90-second `AbortController` timeout (`REQUEST_TIMEOUT_MS`).
   - Renders assistant reply with `react-native-markdown-display`.
   - Follow-up questions POST plain text to the same endpoint.
   - Back button calls `DELETE` to reset conversation, then `router.back()`.
5. `Backend/src/services/AI.js`:
   - Detects image prompts by the `data:image/(jpeg|png|webp);base64,` prefix and wraps them as `{ type: "image_url", image_url: { url } }` messages; text prompts go through as plain `{ role: "user", content: string }`.
   - Appends to a **module-level `conversationHistory` array** seeded with the historian system prompt.
   - Calls Groq `chat.completions.create` (non-streaming), pushes the assistant reply back onto the history, and returns it.
   - `resetAI()` rebuilds the history from the system prompt only.

## Important Gotchas

- **Conversation history is a singleton in backend memory.** There is no per-session/user isolation — if two clients hit the server concurrently, they share and pollute each other's context. Any refactor to multi-user must key history by session/user ID.
- **DELETE-on-back is the only reset trigger.** If the mobile app crashes or the user force-quits, the server still holds the previous image + chat. Restarting the backend (or calling `DELETE /routes/grokRoute`) is the fix.
- **Image detection is prefix-based.** Only `data:image/jpeg|png|webp;base64,...` payloads are treated as images; anything else goes as text. The mobile client always sends `data:image/jpeg;base64,...` regardless of source format, which is fine because the manipulator re-encodes to JPEG.
- **System prompt contract.** The historian prompt in `AI.js` mandates three bolded section headers (`**Name of Item:**`, `**Purpose / Function:**`, `**Historical Context & Significance:**`). The markdown renderer in `ImageDetail.jsx` styles `strong` specifically for these. Don't change one without the other.
- **Default API URL is a LAN IP.** `Mobile/constants/api.js` falls back to `http://192.168.2.247:3000`. Expo Go devices must be on the same Wi-Fi, and the LAN IP will be wrong on most machines — override it (see Configuration).
- **Backend uses ESM.** `Backend/package.json` has `"type": "module"`; all imports must use explicit `.js` extensions (e.g. `import grokRoute from './routes/grokRoute.js'`).
- **`--env-file` requires Node 20.6+.** There's no `dotenv` dependency; if Node is older, `start`/`dev` will silently run without the API key and `AI.js` will throw at import time.
- **Expo SDK 54 / RN 0.81 / React 19.1 / New Architecture is enabled** (`app.json` → `newArchEnabled: true`). Any native module additions must be compatible.

## Configuration

Backend (`Backend/.env`, see `Backend/.env.example`):

| Variable        | Default                                         | Purpose                   |
| --------------- | ----------------------------------------------- | ------------------------- |
| `GROQ_API_KEY`  | — (required, throws on boot if missing)         | Groq SDK auth             |
| `GROQ_MODEL`    | `meta-llama/llama-4-scout-17b-16e-instruct`     | Chat completion model     |
| `PORT`          | `3000`                                          | Express listen port       |

Groq call params (hard-coded in `AI.js`): `temperature: 1`, `max_completion_tokens: 1024`, `top_p: 1`, `stream: false`.

Mobile — override the backend URL via `expoConfig.extra.apiUrl` in `Mobile/app.json`:

```json
{
  "expo": {
    "extra": { "apiUrl": "http://<your-lan-ip>:3000" }
  }
}
```

`Mobile/constants/api.js` reads this through `expo-constants` and falls back to `http://192.168.2.247:3000`.

## Styling

All UI uses the parchment/sepia design tokens in `Mobile/constants/theme.js` (`colors`, `radius`, `spacing`, `type`). Icons come from `@expo/vector-icons` (FontAwesome5). Keep new screens consistent with these tokens rather than hardcoding colors/spacing.
