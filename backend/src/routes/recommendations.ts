import { Router } from 'express';
import prisma from '../lib/db';
import { drillLibrary } from '@shared/drillLibrary';

const router = Router();

/**
 * GET /api/recommendations/next
 * Returns the single best drill/action for the user right now.
 */
router.get('/next', async (req, res, next) => {
    try {
        // Authenticated user via middleware (assuming middleware adds req.user)
        // If strict types, might need casting or extending Request definition.
        const userId = (req as any).user?.userId;

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

export default router;
