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

        const totalUsers = await prisma.userProgress.count();

        // Calculate rank (number of people better than user + 1)
        const counts = await Promise.all([
            prisma.userProgress.count({ where: { averageWPM: { gt: progress.averageWPM } } }),
            prisma.userProgress.count({ where: { averageAccuracy: { gt: progress.averageAccuracy } } }),
            prisma.userProgress.count({ where: { dailyStreak: { gt: progress.dailyStreak } } })
        ]);

        const speedRank = counts[0] + 1;
        const accuracyRank = counts[1] + 1;
        const streakRank = counts[2] + 1;

        // Calculate percentiles: (Total - Rank) / Total * 100
        // If Total is 1, avoids division by zero issues or 0% for top rank by ensuring min 1
        // Actually (Total - Rank) / Total is standard. 
        // Example: 100 users, rank 1. (100-1)/100 = 0.99 (99%)
        // Example: 1 user, rank 1. (1-1)/1 = 0 (0%) -> Handle N=1 case to show 100% or something nice?
        // Let's us (Total - Rank + 1) / Total * 100 ? No that's top X%.
        // "Outperforming X%". If I am #1 of 100. I outperform 99 people. 99/100 = 99%.
        // If I am #100 of 100. I outperform 0 people. 0/100 = 0%.
        // Formula: (Total - Rank) / Total * 100.

        // Calculate percentiles:
        // Use peer-relative percentile: (Total - Rank) / (Total - 1) * 100
        // This ensures if you are #1 of 5 peers (rank 1), you outperform 4/4 = 100%.
        // If Total is 1, avoids division by zero.

        const peerCount = Math.max(1, totalUsers - 1);

        const speedPercentile = ((totalUsers - speedRank) / peerCount) * 100;
        const accuracyPercentile = ((totalUsers - accuracyRank) / peerCount) * 100;
        const streakPercentile = ((totalUsers - streakRank) / peerCount) * 100;

        const bestPercentile = Math.max(speedPercentile, accuracyPercentile, streakPercentile);

        res.json({
            speedRank,
            accuracyRank,
            streakRank,
            percentile: Math.round(bestPercentile),
            totalUsers
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
