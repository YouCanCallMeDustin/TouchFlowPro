import { Router, Request, Response } from 'express';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { drillLibrary } from '@shared/drillLibrary';

const router = Router();

/**
 * GET /api/recommendations/next
 * Returns the single best drill/action for the user right now.
 */
router.get('/next', authenticateToken, async (req, res, next) => {
    try {
        const userId = (req as AuthRequest).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Check Fatigue (Last 30 mins)
        // Look for recent DrillResults with high fatigueScore
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const recentResults = await prisma.drillResult.findMany({
            where: {
                userId,
                timestamp: { gt: thirtyMinsAgo }
            },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        const recentFatigueScores = recentResults
            .map(r => r.fatigueScore || 0)
            .filter(s => s > 0);

        const avgFatigue = recentFatigueScores.length > 0
            ? recentFatigueScores.reduce((a, b) => a + b, 0) / recentFatigueScores.length
            : 0;

        if (avgFatigue > 60) {
            // Recommendation: Take a break or do a very short drill
            return res.json({
                next: {
                    drillId: 'break',
                    mode: 'break',
                    estimatedMinutes: 5,
                    reasons: ['HIGH_FATIGUE_DETECTED', 'REST_RECOMMENDED'],
                    focus: {}
                }
            });
        }

        // 2. Check Overdue Spaced Items
        const overdueItems = await prisma.spacedItem.findMany({
            where: {
                userId,
                nextReview: { lte: new Date() }
            },
            orderBy: { nextReview: 'asc' }, // Most overdue first
            take: 1
        });

        if (overdueItems.length > 0) {
            const item = overdueItems[0];
            const drill = drillLibrary.find(d => d.id === item.drillId);

            if (drill) {
                return res.json({
                    next: {
                        drillId: drill.id,
                        mode: 'drill',
                        estimatedMinutes: 2, // Estimate
                        title: drill.title,
                        reasons: ['OVERDUE_REVIEW', 'SPACED_REPETITION'],
                        focus: {}
                    }
                });
            }
        }

        // 3. Check Weak Keys (if we had heatmap data - placeholder)
        // ...

        // 4. Default: Suggest a new drill or next in progression
        // Find a drill the user hasn't done yet? 
        // For simple v1, pick a random one they haven't spaced yet, or just a default.
        const userSpacedIds = await prisma.spacedItem.findMany({
            where: { userId },
            select: { drillId: true }
        });
        const doneSet = new Set(userSpacedIds.map(i => i.drillId));

        const newDrill = drillLibrary.find(d => !doneSet.has(d.id));

        if (newDrill) {
            return res.json({
                next: {
                    drillId: newDrill.id,
                    mode: 'drill',
                    estimatedMinutes: 2,
                    title: newDrill.title,
                    reasons: ['NEW_CONTENT', 'PROGRESSION'],
                    focus: {}
                }
            });
        }

        // Fallback: Just return a random drill
        const randomDrill = drillLibrary[Math.floor(Math.random() * drillLibrary.length)];
        return res.json({
            next: {
                drillId: randomDrill.id,
                mode: 'drill',
                estimatedMinutes: 2,
                title: randomDrill.title,
                reasons: ['RANDOM_PRACTICE'],
                focus: {}
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/recommendations/:userId/level
 * Returns progress towards the next level
 */
router.get('/:userId/level', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params as { userId: string };

        const progress = await prisma.userProgress.findUnique({
            where: { userId }
        });

        if (!progress) {
            return res.json({
                level: 1,
                levelName: 'Beginner',
                nextLevelRequirements: { wpm: 20, accuracy: 90 },
                progress: 0
            });
        }

        // Tier logic
        let levelName = 'Beginner';
        if (progress.level > 9) levelName = 'Specialist';
        else if (progress.level > 6) levelName = 'Professional';
        else if (progress.level > 3) levelName = 'Intermediate';

        // Requirement logic (sample scaling)
        const nextWpm = 10 + (progress.level * 10);
        const nextAcc = Math.min(99, 90 + Math.floor(progress.level / 2));

        // XP Math
        const xpToNext = Math.floor(100 * Math.pow(1.5, progress.level - 1));
        const percent = Math.min(100, Math.round((progress.xp / xpToNext) * 100));

        res.json({
            level: progress.level,
            levelName,
            nextLevelRequirements: {
                wpm: nextWpm,
                accuracy: nextAcc
            },
            progress: percent
        });
    } catch (error) {
        console.error('Level info error:', error);
        res.status(500).json({ error: 'Failed to fetch level info' });
    }
});

export default router;
