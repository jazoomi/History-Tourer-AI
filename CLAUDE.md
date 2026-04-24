- NEVER read or search node_modules

# History Tourer AI

A mobile app that identifies and provides historical analysis of items using AI.

## Overview

Users photograph historical items → Backend analyzes via Groq's Llama model → AI returns expert historian analysis and answers follow-up questions.

## Architecture

**Backend** (`/Backend`)
- Express server on port 3000
- Single route: `POST /routes/grokRoute` - sends prompts to Groq AI
- `DELETE /routes/grokRoute` - resets conversation history
- Groq integration with conversation memory for multi-turn dialogue

**Mobile** (`/Mobile`)
- React Native/Expo app
- Three screens: home, camera, image detail
- Converts photos to base64 and sends to backend
- Displays markdown-formatted AI responses

## Key Files

**Backend:**
- `src/index.js` - Express setup and server initialization
- `src/services/AI.js` - Groq API client, conversation history, historian system prompt
- `src/routes/grokRoute.js` - HTTP endpoints for AI requests

**Mobile:**
- `app/index.jsx` - Home screen with Start button
- `app/start.jsx` - Camera view, captures photos and navigates to analysis
- `app/ImageDetail.jsx` - Shows image, AI analysis result, and chat input for follow-ups

## How It Works

1. User starts app and taps Start
2. Camera captures image of historical item
3. Image converted to base64 and sent to `POST /routes/grokRoute`
4. Backend AI analyzes with historian prompt, returns 3-section analysis (Name, Purpose, Historical Context)
5. User can ask follow-up questions, maintains conversation history
6. Delete route resets history when user goes back

## Configuration Notes

- Backend server URL: `Mobile/constants/api.js` (default `http://192.168.2.23:3000`; override via `expoConfig.extra.apiUrl`)
- Groq API key: loaded from `Backend/.env` (`GROQ_API_KEY`); see `Backend/.env.example`
- Backend start script: `npm start` (uses `node --env-file=.env src/index.js`, requires Node 20.6+)
- AI model: `meta-llama/llama-4-scout-17b-16e-instruct` (override via `GROQ_MODEL` env var)
- Temperature: 1, max tokens: 1024
