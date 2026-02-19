import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { resolveResourcePath } from './lib/pathUtils';

// Route Imports
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessments';
import drillRoutes from './routes/drills';
import progressRoutes from './routes/progress';
import analyticsRoutes from './routes/analytics';
import achievementsRoutes from './routes/achievements';
import streaksRoutes from './routes/streaks';
import historyRoutes from './routes/history';
import uploadRoutes from './routes/upload';
import customDrillsRoutes from './routes/customDrills';
import goalsRoutes from './routes/goals';
import profileRoutes from './routes/profile';
import settingsRoutes from './routes/settings';
import preferencesRoutes from './routes/preferences';
import bibleRoutes from './routes/bible';
import keystrokeTrackingRoutes from './routes/keystrokeTracking';
import userProgressRoutes from './routes/userProgress';
import dailyChallengeRoutes from './routes/dailyChallenge';
import recommendationsRoutes from './routes/recommendations';
import sessionsRoutes from './routes/sessions';
import leaderboardRoutes from './routes/leaderboard';
import gamesRoutes from './routes/games';
import webhooksRoutes from './routes/webhooks';
import subscriptionsRoutes from './routes/subscriptions';
import plansRoutes from './routes/plans';
import orgsRoutes from './routes/orgs';
import orgInvitesRoutes from './routes/orgInvites';
import certificatesRoutes from './routes/certificates';
import billingRoutes from './routes/billing';

const app = express();

// Health check with diagnostics
app.get('/health', async (req, res) => {
    let tables: any[] = [];
    try {
        const prisma = require('./lib/db').default;
        // Get all table names in PostgreSQL
        tables = await prisma.$queryRaw`SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    } catch (e) {
        console.error('Health check table probe failed:', e);
    }

    res.json({
        status: 'ok',
        message: 'TouchFlow Pro API is healthy',
        diagnostics: {
            cwd: process.cwd(),
            db: {
                tableCount: tables.length,
                tables: tables.map(t => t.name)
            },
            frontend: {
                exists: true // Simplified as resolveResourcePath throws if missing
            }
        }
    });
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:4000',
        'https://youcancallmedustin.github.io',
        'https://touchflowpro.com',
        'https://www.touchflowpro.com',
        'https://api.touchflowpro.com',
        'https://touchflow-pro-production.up.railway.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(requestLogger);

// Webhooks before json parsing
app.use('/api/webhooks', webhooksRoutes);
app.use(express.json());

// API Routes
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
app.use('/api/me', settingsRoutes);
app.use('/api/bible', bibleRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/keystroke-tracking', keystrokeTrackingRoutes);
app.use('/api/user-progress', userProgressRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/orgs', orgsRoutes);
app.use('/api/org-invites', orgInvitesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/games', gamesRoutes);

// Static Assets
const frontendDist = resolveResourcePath('frontend');
app.use(express.static(frontendDist));
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// SPA Fallback
app.use((req, res) => {
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: { message: 'Asset not found', code: 'ENOENT', path: indexPath } });
    }
});

app.use(errorHandler);

export default app;
