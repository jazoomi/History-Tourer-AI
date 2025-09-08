import express from 'express';
import grokRoute from './routes/grokRoute';

const app = express();

app.use(express.json({ limit: '10mb' }));

app.use("/routes/grokRoute", grokRoute);



app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

