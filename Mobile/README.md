# History Tourer AI

A mobile app that identifies and explains historical items from a photo. Take a picture, and an AI historian returns its name, purpose, and historical context — then answers your follow-up questions.

> This README covers the whole project. The repo is a monorepo with a Node/Express backend (`/Backend`) and an Expo React Native client (`/Mobile`).

## Architecture

```
+-----------------+        HTTP/JSON         +--------------------+
|  Mobile (Expo)  |  <------------------->   |   Backend (Node)   |
|  expo-router    |                          |   Express 5        |
|  expo-camera    |        base64 image      |   Groq SDK         |
+-----------------+                          +--------------------+
                                                      |
                                                      v
                                             Groq API (Llama 4 Scout)
```

- **Mobile** captures a photo, converts to base64, sends to the backend.
- **Backend** maintains a per-process conversation history and proxies requests to Groq.
- Follow-up questions reuse the same conversation so the historian has image context.

## Requirements

- Node.js **20.6+** (the backend start script uses `node --env-file=.env`)
- npm
- Expo Go on your phone, or an Android/iOS simulator
- A [Groq API key](https://console.groq.com)

## Backend setup

```bash
cd Backend
npm install
cp .env.example .env     # then edit .env and paste your GROQ_API_KEY
npm start                # production: node --env-file=.env src/index.js
npm run dev              # watch mode (auto-restart on changes)
```

The server listens on `PORT` (default `3000`).

### Endpoints

| Method | Path                   | Body / Purpose                                                  |
|--------|------------------------|------------------------------------------------------------------|
| GET    | `/health`              | Liveness check, returns `{ status: "ok" }`                       |
| POST   | `/routes/grokRoute`    | `{ prompt: string }` — either a `data:image/...;base64,...` URL for initial analysis, or plain text for follow-ups. Returns `{ answer }`. |
| DELETE | `/routes/grokRoute`    | Resets the conversation history.                                 |

### Environment variables (`Backend/.env`)

| Key             | Default                                       | Description                     |
|-----------------|-----------------------------------------------|---------------------------------|
| `GROQ_API_KEY`  | *(required)*                                  | Your Groq API key               |
| `PORT`          | `3000`                                        | HTTP port                       |
| `GROQ_MODEL`    | `meta-llama/llama-4-scout-17b-16e-instruct`   | Vision-capable Groq chat model  |

`.env` is gitignored. `.env.example` is the template.

## Mobile setup

```bash
cd Mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` for an emulator.

### Pointing the app at your backend

`Mobile/constants/api.js` controls the backend URL:

```js
const DEFAULT_API_URL = 'http://192.168.2.247:3000';
```

Change this to your machine's LAN IP (the phone must reach it). Alternatively, set it in `app.json` under `expo.extra`:

```json
{
  "expo": {
    "extra": { "apiUrl": "http://10.0.0.5:3000" }
  }
}
```

`localhost` will not work from a physical device — use the LAN IP shown by `ipconfig` / `ifconfig`.

## Project layout

```
History-Tourer-AI/
+-- Backend/
|   +-- .env                 # gitignored; holds GROQ_API_KEY
|   +-- .env.example
|   +-- package.json
|   +-- src/
|       +-- index.js         # Express bootstrap, CORS, error handler
|       +-- routes/
|       |   +-- grokRoute.js # POST/DELETE handlers
|       +-- services/
|           +-- AI.js        # Groq client, conversation history, system prompt
+-- Mobile/
|   +-- app.json
|   +-- package.json
|   +-- app/
|   |   +-- _layout.jsx      # Stack navigator, SafeAreaProvider
|   |   +-- index.jsx        # Home / "Begin Tour"
|   |   +-- start.jsx        # Camera + preview with Retake / Analyze
|   |   +-- ImageDetail.jsx  # Chat view: image, analysis, follow-ups
|   +-- constants/
|       +-- api.js           # Backend URL
|       +-- theme.js         # Parchment / sepia palette
+-- CLAUDE.md                # Notes for Claude Code
```

## How it works

1. User opens the app and taps **Begin Tour** on the home screen.
2. The camera screen captures a photo; the user picks **Retake** or **Analyze**.
3. `ImageDetail` reads the photo as base64 and `POST`s it to `/routes/grokRoute`.
4. Backend appends the image message to conversation history and calls Groq. The system prompt instructs the model to return three bolded sections: **Name of Item**, **Purpose / Function**, **Historical Context & Significance**.
5. The user can ask follow-up questions; the backend preserves the conversation so the model still has the image in context.
6. Leaving the screen sends `DELETE /routes/grokRoute`, which clears the history on the server.

## Tech

- **Backend:** Node 20, Express 5, Groq SDK, CORS, ES modules
- **Mobile:** Expo SDK 54, React Native 0.81, expo-router 6, expo-camera, expo-file-system, react-native-markdown-display, @expo/vector-icons

## Security notes

- The Groq API key must never be committed. `Backend/.env` is gitignored.
- If a key was ever pushed to git history, **rotate it** in the Groq console — git history cannot be scrubbed retroactively from public forks.
- The backend enables CORS for all origins; tighten this if deploying beyond LAN.
- Conversation history is held in a single module-level variable, so the backend is **single-session / single-user**. Running it behind a shared deployment would require per-session storage (Redis, etc.).

## Troubleshooting

**Expo start fails with "Cannot find module …"** — dependencies are out of sync with the installed Expo SDK. Run:
```bash
npx expo install --fix
```

**Phone can't reach the backend** — confirm the IP in `Mobile/constants/api.js` is your machine's LAN IP (not `localhost` / `127.0.0.1`), the phone is on the same Wi-Fi, and no firewall is blocking the port.


