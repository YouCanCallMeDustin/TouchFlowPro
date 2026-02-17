import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

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
import settingsRoutes from './routes/settings';
import bibleRoutes from './routes/bible';
// Phase 0 routes
import keystrokeTrackingRoutes from './routes/keystrokeTracking';
import userProgressRoutes from './routes/userProgress';
import dailyChallengeRoutes from './routes/dailyChallenge';
// Phase 3 routes
import recommendationsRoutes from './routes/recommendations';
// Phase 4 routes
import sessionsRoutes from './routes/sessions';
import leaderboardRoutes from './routes/leaderboard';
import gamesRoutes from './routes/games';

const app = express();

// Health check - Enhanced with production diagnostics
app.get('/health', async (req, res) => {
    console.log('Health check called');
    const dbStatus = {
        path: 'unknown',
        exists: false,
        size: 0
    };

    try {
        const prismaLib = require('./lib/db').default;
        // This is a bit hacky to get the resolved path from our db.ts logic
        // We'll just re-check the possible paths here for the health report specifically
        const possibleDbPaths = [
            path.resolve(process.cwd(), 'backend/prisma/dev.db'),
            path.resolve(process.cwd(), 'prisma/dev.db'),
            path.resolve(__dirname, '../../../prisma/dev.db'),
            '/app/backend/prisma/dev.db'
        ];

        for (const p of possibleDbPaths) {
            if (fs.existsSync(p)) {
                dbStatus.path = p;
                dbStatus.exists = true;
                dbStatus.size = fs.statSync(p).size;
                break;
            }
        }
    } catch (e) {
        console.error('Health check DB probe failed:', e);
    }

    res.json({
        status: 'ok',
        message: 'TouchFlow Pro API is healthy',
        diagnostics: {
            cwd: process.cwd(),
            dirname: __dirname,
            nodeEnv: process.env.NODE_ENV,
            db: dbStatus,
            frontendDist: {
                path: path.resolve(process.cwd(), process.cwd().endsWith('backend') ? '../frontend/dist' : 'frontend/dist'),
                exists: fs.existsSync(path.resolve(process.cwd(), process.cwd().endsWith('backend') ? '../frontend/dist' : 'frontend/dist'))
            }
        }
    });
});

import webhooksRoutes from './routes/webhooks';

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:4000',
        'https://youcancallmedustin.github.io',
        'https://touchflowpro-production.up.railway.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(requestLogger);

// Webhook route must be registered before express.json() to handle raw body
app.use('/api/webhooks', webhooksRoutes);

app.use(express.json());

// Debug route
app.get('/api/debug', (req, res) => {
    console.log('Debug route hit');
    res.json({ status: 'ok', timestamp: new Date() });
});

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
app.use('/api/me', settingsRoutes);
app.use('/api/bible', bibleRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/upload', uploadRoutes);
// Phase 0 routes
app.use('/api/keystroke-tracking', keystrokeTrackingRoutes);
app.use('/api/user-progress', userProgressRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
// Phase 3 routes
app.use('/api/recommendations', recommendationsRoutes);
// Phase 4 routes
app.use('/api/sessions', sessionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
// Phase 4+ routes
import subscriptionsRoutes from './routes/subscriptions';
import plansRoutes from './routes/plans';
import orgsRoutes from './routes/orgs';
import orgInvitesRoutes from './routes/orgInvites';
import certificatesRoutes from './routes/certificates';

app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/orgs', orgsRoutes);
app.use('/api/org-invites', orgInvitesRoutes);
app.use('/api/certificates', certificatesRoutes);

import billingRoutes from './routes/billing';
app.use('/api/billing', billingRoutes);
app.use('/api/games', gamesRoutes);



// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve frontend static files (built by Vite)
const possibleFrontendPaths = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../../../../frontend/dist'),
    '/app/frontend/dist'
];

let frontendDist = possibleFrontendPaths[0];
for (const p of possibleFrontendPaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
        frontendDist = p;
        break;
    }
}

console.log(`[Static] Serving frontend from: ${frontendDist} (CWD: ${process.cwd()})`);
app.use(express.static(frontendDist));

// SPA catch-all: any non-API route serves index.html
app.use((req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

export default app;
