

Developing a AI powered history tourer guide. Take a picture of a image and get details of the artificat with historical contexts, perfect for tourists!


<video src="https://github.com/user-attachments/assets/c24be3e8-10dc-4781-acf3-3748b5e5c9a9"></video>
<img src="https://github.com/user-attachments/assets/6fc29d2d-8e2d-4ab7-afc3-ff9a6c2c33e9" width="300">
<img src="https://github.com/user-attachments/assets/29234fc4-2e12-4e1b-8ae4-e6990c99eb9f" width="300">

## Backend setup

```bash
cd Backend
npm install
cp .env.example .env     # then edit .env and paste your GROQ_API_KEY
npm start                # production: node --env-file=.env src/index.js
npm run dev              # watch mode (auto-restart on changes)

OR  run with docker

docker compose up
```

## Mobile setup

```bash
cd Mobile
npm install
npx expo start
```