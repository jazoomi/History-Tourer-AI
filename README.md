# History Tourer AI

An AI-powered history tour guide app. Take a photo of any artifact or landmark and get detailed historical context -- perfect for tourists and history enthusiasts.

<img src="https://github.com/user-attachments/assets/6fc29d2d-8e2d-4ab7-afc3-ff9a6c2c33e9" width="300">
<img src="https://github.com/user-attachments/assets/29234fc4-2e12-4e1b-8ae4-e6990c99eb9f" width="300">

## Features

- Take a photo of any historical artifact or landmark
- Get AI-generated analysis: name, purpose, and historical significance
- Ask follow-up questions in natural language

## Tech Stack

- **Mobile**: React Native + Expo (Expo Router)
- **Backend**: Node.js + Express
- **AI**: Groq (Llama 4 Scout 17B)

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Groq API key](https://console.groq.com/)

### Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm run dev
```

### Mobile Setup

```bash
cd Mobile
npm install
```

Create a `.env` file in the `Mobile/` directory (or set the env var before starting):

```
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000
```

Then start the app:

```bash
npx expo start
```

## Project Structure

```
Backend/
  src/
    index.js            # Express server entry point
    routes/grokRoute.js # API route for image analysis & follow-ups
    services/AI.js      # Groq AI integration & conversation management

Mobile/
  app/
    _layout.jsx         # Root navigation layout
    index.jsx           # Home screen
    start.jsx           # Camera screen
    ImageDetail.jsx     # Analysis results & follow-up chat
```
