import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// Achievement definitions
const ACHIEVEMENT_TYPES = {
    'first_drill': { name: 'First Steps', description: 'Complete your first drill', icon: '🎯' },
    'week_streak': { name: 'Week Warrior', description: 'Practice for 7 days straight', icon: '🔥' },
    '100wpm_club': { name: '100 WPM Club', description: 'Achieve 100+ WPM', icon: '⚡' },
    'accuracy_master': { name: 'Precision Pro', description: 'Achieve 100% accuracy', icon: '🎪' },
    'drill_marathon': { name: 'Marathon Runner', description: 'Complete 100 drills', icon: '��' },
    'early_bird': { name: 'Early Bird', description: 'Practice before 8 AM', icon: '🌅' },
    'night_owl': { name: 'Night Owl', description: 'Practice after 10 PM', icon: '🦉' },
    'perfect_week': { name: 'Perfect Week', description: '7 days with 95%+ accuracy', icon: '💎' },
    'speed_demon': { name: 'Speed Demon', description: 'Reach 120+ WPM', icon: '🚀' },
    'completionist': { name: 'Completionist', description: 'Finish all drill categories', icon: '👑' }
};

// GET /api/achievements/:userId - List all user achievements
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const achievements = await prisma.achievement.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' }
        });

        res.json({ achievements });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// POST /api/achievements/:userId/check - Check and award new achievements
router.post('/:userId/check', async (req, res) => {
    try {
        const { userId } = req.params;
        const newAchievements = [];

        // Get user drill results
        const drillCount = await prisma.drillResult.count({ where: { userId } });
        const results = await prisma.drillResult.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        // Check first_drill
        if (drillCount >= 1 && !(await hasAchievement(userId, 'first_drill'))) {
            await awardAchievement(userId, 'first_drill');
            newAchievements.push('first_drill');
        }

        // Check 100wpm_club
        if (results.some(r => r.netWPM >= 100) && !(await hasAchievement(userId, '100wpm_club'))) {
            await awardAchievement(userId, '100wpm_club');
            newAchievements.push('100wpm_club');
        }

        // Check accuracy_master
        if (results.some(r => r.accuracy === 100) && !(await hasAchievement(userId, 'accuracy_master'))) {
            await awardAchievement(userId, 'accuracy_master');
            newAchievements.push('accuracy_master');
        }

        // Check drill_marathon
        if (drillCount >= 100 && !(await hasAchievement(userId, 'drill_marathon'))) {
            await awardAchievement(userId, 'drill_marathon');
            newAchievements.push('drill_marathon');
        }

        // Check speed_demon
        if (results.some(r => r.netWPM >= 120) && !(await hasAchievement(userId, 'speed_demon'))) {
            await awardAchievement(userId, 'speed_demon');
            newAchievements.push('speed_demon');
        }

        // Check streak achievements
        const streak = await prisma.dailyStreak.findUnique({ where: { userId } });
        if (streak && streak.currentStreak >= 7 && !(await hasAchievement(userId, 'week_streak'))) {
            await awardAchievement(userId, 'week_streak');
            newAchievements.push('week_streak');
        }

        res.json({ newAchievements, count: newAchievements.length });
    } catch (error) {
        console.error('Check achievements error:', error);
        res.status(500).json({ error: 'Failed to check achievements' });
    }
});

// GET /api/achievements/available - List all available badges
router.get('/list/available', async (req, res) => {
    try {
        const available = Object.entries(ACHIEVEMENT_TYPES).map(([type, info]) => ({
            type,
            ...info
        }));

        res.json({ achievements: available });
    } catch (error) {
        console.error('Get available achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch available achievements' });
    }
});

// Helper functions
async function hasAchievement(userId: string, badgeType: string): Promise<boolean> {
    const existing = await prisma.achievement.findUnique({
        where: {
            userId_badgeType: {
                userId,
                badgeType
            }
        }
    });
    return !!existing;
}

async function awardAchievement(userId: string, badgeType: string) {
    await prisma.achievement.create({
        data: {
            userId,
            badgeType,
            earnedAt: new Date()
        }
    });
}

export default router;
