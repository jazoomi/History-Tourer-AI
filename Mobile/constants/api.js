import Constants from 'expo-constants';

const DEFAULT_API_URL = 'http://192.168.2.247:3000';

const fromExtra = Constants?.expoConfig?.extra?.apiUrl;

export const API_URL = fromExtra || DEFAULT_API_URL;

export const ENDPOINTS = {
    grok: `${API_URL}/routes/grokRoute`,
};
