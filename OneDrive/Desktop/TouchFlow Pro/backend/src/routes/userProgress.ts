import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/user-progress/:userId
// Get user level, XP, and streak
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let progress = await prisma.userProgress.findUnique({
            where: { userId }
        });

        if (!progress) {
            // Create default progress
            progress = await prisma.userProgress.create({
                data: {
                    userId,
                    level: 1,
                    xp: 0,
                    totalPracticeTime: 0,
                    dailyStreak: 0
                }
            });
        }

        // Calculate XP needed for next level (exponential growth)
        const xpToNextLevel = Math.floor(100 * Math.pow(1.5, progress.level - 1));
        const totalXP = progress.xp;

        res.json({
            level: progress.level,
            currentXP: progress.xp,
            xpToNextLevel,
            totalXP,
            dailyStreak: progress.dailyStreak,
            totalPracticeTime: progress.totalPracticeTime
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({ error: 'Failed to fetch user progress' });
    }
});

// POST /api/user-progress/add-xp
// Award XP for completing activities
router.post('/add-xp', async (req, res) => {
    try {
        const { userId, xp, practiceTime } = req.body;

        const progress = await prisma.userProgress.findUnique({
            where: { userId }
        });

        if (!progress) {
            return res.status(404).json({ error: 'User progress not found' });
        }

        let newXP = progress.xp + xp;
        let newLevel = progress.level;
        let leveledUp = false;

        // Check for level up
        const xpToNextLevel = Math.floor(100 * Math.pow(1.5, newLevel - 1));
        if (newXP >= xpToNextLevel) {
            newLevel++;
            newXP -= xpToNextLevel;
            leveledUp = true;
        }

        const updated = await prisma.userProgress.update({
            where: { userId },
            data: {
                xp: newXP,
                level: newLevel,
                totalPracticeTime: { increment: practiceTime || 0 }
            }
        });

        res.json({
            level: updated.level,
            currentXP: updated.xp,
            xpToNextLevel: Math.floor(100 * Math.pow(1.5, updated.level - 1)),
            leveledUp
        });
    } catch (error) {
        console.error('Add XP error:', error);
        res.status(500).json({ error: 'Failed to add XP' });
    }
});

// POST /api/user-progress/update-streak
// Update daily practice streak
router.post('/update-streak', async (req, res) => {
    try {
        const { userId } = req.body;

        const progress = await prisma.userProgress.findUnique({
            where: { userId }
        });

        if (!progress) {
            return res.status(404).json({ error: 'User progress not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastPractice = progress.lastPracticeDate;
        let newStreak = progress.dailyStreak;

        if (!lastPractice) {
            // First practice
            newStreak = 1;
        } else {
            const lastPracticeDate = new Date(lastPractice);
            lastPracticeDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today.getTime() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Already practiced today, no change
            } else if (daysDiff === 1) {
                // Consecutive day
                newStreak++;
            } else {
                // Streak broken
                newStreak = 1;
            }
        }

        const updated = await prisma.userProgress.update({
            where: { userId },
            data: {
                dailyStreak: newStreak,
                lastPracticeDate: new Date()
            }
        });

        res.json({
            dailyStreak: updated.dailyStreak,
            streakIncreased: newStreak > progress.dailyStreak
        });
    } catch (error) {
        console.error('Update streak error:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

export default router;
