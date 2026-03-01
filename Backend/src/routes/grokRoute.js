import express from 'express';
import { AI, resetAI } from '../services/AI.js';

const router = express.Router();

router.post("/", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const result = await AI(prompt);
        res.json({ answer: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to get AI response" });
    }
});

router.delete("/", (_req, res) => {
    try {
        resetAI();
        res.status(200).json({ message: "AI reset successfully" });
    } catch (error) {
        console.error("Error resetting AI:", error);
        res.status(500).json({ error: "Error resetting AI" });
    }
});

export default router;
