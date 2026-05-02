import express from 'express';
import { AI } from '../services/AI.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { prompt, image, history } = req.body;

    if (prompt !== undefined && typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt must be a string' });
    }
    if (image !== undefined && typeof image !== 'string') {
        return res.status(400).json({ error: 'Image must be a base64 data URL string' });
    }
    if (!image && (typeof prompt !== 'string' || !prompt.trim())) {
        return res.status(400).json({ error: 'Either a non-empty prompt or an image is required' });
    }
    if (history !== undefined && !Array.isArray(history)) {
        return res.status(400).json({ error: 'History must be an array of messages' });
    }

    try {
        const { answer, history: updatedHistory } = await AI({ prompt, image, history });
        return res.json({ answer, history: updatedHistory });
    } catch (error) {
        console.error('Error during AI request:', error);
        return res.status(502).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

export default router;
