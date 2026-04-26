import express from 'express';
import { AI } from '../services/AI.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { prompt, history } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }
    if (history !== undefined && !Array.isArray(history)) {
        return res.status(400).json({ error: 'History must be an array of messages' });
    }

    try {
        const { answer, history: updatedHistory } = await AI(prompt, history || []);
        return res.json({ answer, history: updatedHistory });
    } catch (error) {
        console.error('Error during AI request:', error);
        return res.status(502).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

export default router;
