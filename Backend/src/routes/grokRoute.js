import express from 'express';
import { AI, resetAI } from '../services/AI.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    try {
        const answer = await AI(prompt);
        return res.json({ answer });
    } catch (error) {
        console.error('Error during AI request:', error);
        return res.status(502).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

router.delete('/', (_req, res) => {
    try {
        resetAI();
        console.log('Resetting AI...');
        return res.status(200).json({ status: 'reset' });
    } catch (error) {
        console.error('Error resetting AI:', error);
        return res.status(500).json({ error: 'Error resetting AI' });
    }
});

export default router;
