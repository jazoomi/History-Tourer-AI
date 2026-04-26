// Extends app.json with runtime-resolved values. Expo auto-loads `.env` when
// `expo start` runs, so API_URL can be set in Mobile/.env (see .env.example).
// Everything else continues to live in app.json.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    apiUrl: process.env.API_URL || 'http://localhost:3000',
  },
});
