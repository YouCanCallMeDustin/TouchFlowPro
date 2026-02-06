import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessments';
import drillRoutes from './routes/drills';
import progressRoutes from './routes/progress';
import analyticsRoutes from './routes/analytics';
import achievementsRoutes from './routes/achievements';
import streaksRoutes from './routes/streaks';
import historyRoutes from './routes/history';
import uploadRoutes from './routes/upload';
import path from 'path';
import customDrillsRoutes from './routes/customDrills';
import goalsRoutes from './routes/goals';
import preferencesRoutes from './routes/preferences';
import profileRoutes from './routes/profile';
import bibleRoutes from './routes/bible';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/drills', drillRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/streaks', streaksRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/custom-drills', customDrillsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bible', bibleRoutes); // Register bible route
app.use('/api/preferences', preferencesRoutes);
app.use('/api/upload', uploadRoutes); // Register upload route


// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'TouchFlow Pro API is healthy' });
});

export default app;
