import Constants from 'expo-constants';

// `extra.apiUrl` is supplied by app.config.js, which in turn reads `API_URL`
// from Mobile/.env. The fallback below only kicks in if the config failed to
// resolve, which shouldn't happen in normal development.
const DEFAULT_API_URL = 'http://localhost:3000';

const fromExtra = Constants?.expoConfig?.extra?.apiUrl;

export const API_URL = fromExtra || DEFAULT_API_URL;

export const ENDPOINTS = {
    grok: `${API_URL}/routes/grokRoute`,
};
