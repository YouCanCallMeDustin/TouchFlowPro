import { Router } from 'express';
import prisma from '../lib/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/games/:gameId/scores - Submit a new game score
router.post('/:gameId/scores', authenticateToken, async (req: any, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user?.id;
        const { summary } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Save the score
        const newScore = await prisma.gameScore.create({
            data: {
                userId,
                gameId,
                mode: summary.mode || 'arcade',
                score: summary.score,
                roundsCleared: summary.roundsCleared,
                longestStreak: summary.longestStreak,
                avgWpm: summary.avgWpm,
                accuracy: summary.accuracy,
                difficultyLevel: summary.difficultyLevel || 0,
                charsTyped: summary.charsTyped || 0,
                durationSeconds: summary.durationSeconds || 0,
            }
        });

        // Check if this is a PERSONAL HIGH SCORE for the user
        const userBest = await prisma.gameScore.findFirst({
            where: { userId, gameId, mode: summary.mode || 'arcade' },
            orderBy: { score: 'desc' }
        });

        const isPersonalBest = userBest?.id === newScore.id;

        // Calculate global rank
        const higherScores = await prisma.gameScore.count({
            where: {
                gameId,
                mode: summary.mode || 'arcade',
                score: { gt: summary.score }
            }
        });

        res.status(201).json({
            success: true,
            scoreId: newScore.id,
            isPersonalBest,
            rank: higherScores + 1
        });

    } catch (error) {
        console.error('Error saving game score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// GET /api/games/:gameId/leaderboard - Fetch top scores with time filtering
router.get('/:gameId/leaderboard', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { mode = 'arcade', limit = '10', period = 'all' } = req.query;

        // Define time filter
        let dateFilter = {};
        const now = new Date();

        if (period === 'daily') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { timestamp: { gte: startOfDay } };
        } else if (period === 'weekly') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
            const startOfWeek = new Date(now.setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { timestamp: { gte: startOfWeek } };
        }

        const scores = await prisma.gameScore.findMany({
            where: { 
                gameId, 
                mode: mode as string,
                ...dateFilter
            },
            orderBy: { score: 'desc' },
            take: parseInt(limit as string),
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoUrl: true
                    }
                }
            }
        });

        const leaderboard = scores.map(s => ({
            id: s.id,
            userId: s.userId,
            username: s.user.name || s.user.email.split('@')[0],
            photoUrl: (s.user as any).photoUrl || null,
            score: s.score,
            streak: s.longestStreak,
            avgNetWPM: s.avgWpm,
            difficultyLevel: s.difficultyLevel,
            timestamp: s.timestamp.getTime()
        }));

        res.json(leaderboard);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
