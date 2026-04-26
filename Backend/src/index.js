import express from 'express';
import cors from 'cors';
import grokRoute from './routes/grokRoute.js';
import { aiLimiter } from './middleware/rateLimiters.js';
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));


app.use('/routes/grokRoute', aiLimiter, grokRoute);

app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
