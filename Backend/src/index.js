import 'dotenv/config';
import express from 'express';
import grokRoute from './routes/grokRoute.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

app.use("/api/analyze", grokRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
