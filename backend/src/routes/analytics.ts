import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/analytics/:userId/trends - Performance trends over time
router.get('/:userId/trends', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = '30' } = req.query;
        const daysNum = parseInt(days as string);

        const where: any = { userId };
        if (daysNum > 0) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - daysNum);
            where.timestamp = { gte: daysAgo };
        }

        const results = await prisma.drillResult.findMany({
            where,
            orderBy: {
                timestamp: 'asc'
            },
            select: {
                grossWPM: true,
                netWPM: true,
                accuracy: true,
                timestamp: true,
                drillId: true
            }
        });

        // Group by date and calculate daily averages
        const dailyStats = results.reduce((acc: any, result) => {
            const date = result.timestamp.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { wpmSum: 0, accuracySum: 0, count: 0 };
            }
            acc[date].wpmSum += result.netWPM;
            acc[date].accuracySum += result.accuracy;
            acc[date].count += 1;
            return acc;
        }, {});

        const trends = Object.entries(dailyStats).map(([date, stats]: [string, any]) => ({
            date,
            avgWPM: Math.round(stats.wpmSum / stats.count),
            avgAccuracy: Math.round((stats.accuracySum / stats.count) * 10) / 10,
            drillCount: stats.count
        }));

        res.json({ trends });
    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

// GET /api/analytics/:userId/weak-keys - Character error analysis
router.get('/:userId/weak-keys', async (req, res) => {
    try {
        const { userId } = req.params;

        const results = await prisma.drillResult.findMany({
            where: { userId },
            select: {
                drillId: true,
                accuracy: true,
                timestamp: true
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 50 // Last 50 drills
        });

        // Note: We don't have errorMap stored in DB yet, so return placeholder
        // This will be enhanced when we add error tracking
        const weakKeys = [
            { character: 'p', errorCount: 12, accuracy: 85.3 },
            { character: 'q', errorCount: 9, accuracy: 87.1 },
            { character: ';', errorCount: 8, accuracy: 88.5 }
        ];

        res.json({
            weakKeys,
            totalDrillsAnalyzed: results.length,
            note: 'Error map tracking will be added in next update'
        });
    } catch (error) {
        console.error('Weak keys error:', error);
        res.status(500).json({ error: 'Failed to analyze weak keys' });
    }
});

// GET /api/analytics/:userId/heatmap - Practice time heatmap
router.get('/:userId/heatmap', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = '90' } = req.query;
        const daysNum = parseInt(days as string);

        const where: any = { userId };
        if (daysNum > 0) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - daysNum);
            where.timestamp = { gte: daysAgo };
        }

        const results = await prisma.drillResult.findMany({
            where,
            select: {
                timestamp: true,
                durationMs: true
            }
        });

        // Group by date and sum practice time
        const heatmapData = results.reduce((acc: any, result) => {
            const date = result.timestamp.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, totalMinutes: 0, drillCount: 0 };
            }
            acc[date].totalMinutes += Math.round(result.durationMs / 60000);
            acc[date].drillCount += 1;
            return acc;
        }, {});

        const heatmap = Object.values(heatmapData);

        res.json({ heatmap });
    } catch (error) {
        console.error('Heatmap error:', error);
        res.status(500).json({ error: 'Failed to generate heatmap' });
    }
});

// GET /api/analytics/:userId/summary - Comprehensive stats dashboard
router.get('/:userId/summary', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get all drill results
        const results = await prisma.drillResult.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' }
        });

        if (results.length === 0) {
            return res.json({
                totalDrills: 0,
                averageWPM: 0,
                averageAccuracy: 0,
                highestWPM: 0,
                totalPracticeTime: 0,
                recentImprovement: 0
            });
        }

        // Calculate stats
        const totalDrills = results.length;
        const averageWPM = Math.round(results.reduce((sum, r) => sum + r.netWPM, 0) / totalDrills);
        const averageAccuracy = Math.round((results.reduce((sum, r) => sum + r.accuracy, 0) / totalDrills) * 10) / 10;
        const highestWPM = Math.max(...results.map(r => r.netWPM));
        const totalPracticeTime = Math.round(results.reduce((sum, r) => sum + r.durationMs, 0) / 60000); // in minutes

        // Calculate improvement (last 10 vs previous 10)
        const recent = results.slice(0, 10);
        const previous = results.slice(10, 20);
        const recentAvg = recent.length > 0 ? recent.reduce((sum, r) => sum + r.netWPM, 0) / recent.length : 0;
        const previousAvg = previous.length > 0 ? previous.reduce((sum, r) => sum + r.netWPM, 0) / previous.length : 0;
        const recentImprovement = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0;

        // Get streak info
        const streak = await prisma.dailyStreak.findUnique({
            where: { userId }
        });

        res.json({
            totalDrills,
            averageWPM,
            averageAccuracy,
            highestWPM,
            totalPracticeTime,
            recentImprovement,
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0
        });
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

export default router;
