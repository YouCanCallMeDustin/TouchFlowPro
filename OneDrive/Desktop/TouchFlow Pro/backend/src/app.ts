import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import assessmentRouter from './routes/assessments';
import drillsRouter from './routes/drills';
import progressRouter from './routes/progress';
import analyticsRouter from './routes/analytics';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/drills', drillsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'TouchFlow Pro API is healthy' });
});

export default app;
