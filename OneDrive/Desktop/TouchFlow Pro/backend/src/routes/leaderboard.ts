import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

/**
 * GET /api/leaderboard/top
 * Get top performers in different categories
 */
router.get('/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // Fetch top by WPM
        const topSpeed = await prisma.userProgress.findMany({
            where: { averageWPM: { gt: 0 } },
            orderBy: { averageWPM: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        photoUrl: true
                    }
                }
            }
        });

        // Fetch top by Accuracy
        const topAccuracy = await prisma.userProgress.findMany({
            where: { averageAccuracy: { gt: 0 } },
            orderBy: { averageAccuracy: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        photoUrl: true
                    }
                }
            }
        });

        // Fetch top by Streak
        const topStreaks = await prisma.userProgress.findMany({
            where: { dailyStreak: { gt: 0 } },
            orderBy: { dailyStreak: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        photoUrl: true
                    }
                }
            }
        });

        res.json({
            speed: formatLeaderboard(topSpeed),
            accuracy: formatLeaderboard(topAccuracy),
            streaks: formatLeaderboard(topStreaks)
        });

    } catch (error) {
        console.error('Leaderboard top error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * GET /api/leaderboard/rank/:userId
 * Get a specific user's rank
 */
router.get('/rank/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const progress = await prisma.userProgress.findUnique({ where: { userId } });
        if (!progress) {
            return res.status(404).json({ error: 'User progress not found' });
        }

        const counts = await Promise.all([
            prisma.userProgress.count({ where: { averageWPM: { gt: progress.averageWPM } } }),
            prisma.userProgress.count({ where: { averageAccuracy: { gt: progress.averageAccuracy } } }),
            prisma.userProgress.count({ where: { dailyStreak: { gt: progress.dailyStreak } } })
        ]);

        res.json({
            speedRank: counts[0] + 1,
            accuracyRank: counts[1] + 1,
            streakRank: counts[2] + 1
        });

    } catch (error) {
        console.error('Leaderboard rank error:', error);
        res.status(500).json({ error: 'Failed to calculate rank' });
    }
});

function formatLeaderboard(data: any[]) {
    return data.map(item => ({
        userId: item.userId,
        name: item.user.name || item.user.email.split('@')[0],
        photoUrl: item.user.photoUrl,
        level: item.level,
        wpm: item.averageWPM,
        accuracy: item.averageAccuracy,
        streak: item.dailyStreak
    }));
}

export default router;
