import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/streaks/:userId - Get current streak status
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let streak = await prisma.dailyStreak.findUnique({
            where: { userId }
        });

        if (!streak) {
            // Create initial streak record
            streak = await prisma.dailyStreak.create({
                data: {
                    userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    streakProtections: 0
                }
            });
        }

        res.json(streak);
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ error: 'Failed to fetch streak' });
    }
});

// POST /api/streaks/:userId/record - Record daily practice
router.post('/:userId/record', async (req, res) => {
    try {
        const { userId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = await prisma.dailyStreak.findUnique({
            where: { userId }
        });

        if (!streak) {
            // Create new streak
            streak = await prisma.dailyStreak.create({
                data: {
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastPracticeDate: new Date(),
                    streakProtections: 0
                }
            });
        } else {
            // Check if already practiced today
            const lastPractice = streak.lastPracticeDate ? new Date(streak.lastPracticeDate) : null;
            if (lastPractice) {
                lastPractice.setHours(0, 0, 0, 0);

                const daysDiff = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

                if (daysDiff === 0) {
                    // Already practiced today, no change
                    return res.json(streak);
                } else if (daysDiff === 1) {
                    // Consecutive day - increment streak
                    streak = await prisma.dailyStreak.update({
                        where: { userId },
                        data: {
                            currentStreak: streak.currentStreak + 1,
                            longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
                            lastPracticeDate: new Date()
                        }
                    });
                } else if (daysDiff === 2 && streak.streakProtections > 0) {
                    // Missed one day but have protection
                    streak = await prisma.dailyStreak.update({
                        where: { userId },
                        data: {
                            streakProtections: streak.streakProtections - 1,
                            lastPracticeDate: new Date()
                        }
                    });
                } else {
                    // Streak broken - reset
                    streak = await prisma.dailyStreak.update({
                        where: { userId },
                        data: {
                            currentStreak: 1,
                            lastPracticeDate: new Date()
                        }
                    });
                }
            }
        }

        res.json(streak);
    } catch (error) {
        console.error('Record streak error:', error);
        res.status(500).json({ error: 'Failed to record streak' });
    }
});

// POST /api/streaks/:userId/protect - Use streak protection
router.post('/:userId/protect', async (req, res) => {
    try {
        const { userId } = req.params;

        const streak = await prisma.dailyStreak.findUnique({
            where: { userId }
        });

        if (!streak || streak.streakProtections <= 0) {
            return res.status(400).json({ error: 'No streak protections available' });
        }

        // Award streak protection (can earn through achievements)
        const updated = await prisma.dailyStreak.update({
            where: { userId },
            data: {
                streakProtections: streak.streakProtections + 1
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Protect streak error:', error);
        res.status(500).json({ error: 'Failed to protect streak' });
    }
});

export default router;
