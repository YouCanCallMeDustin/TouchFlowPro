import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// Achievement definitions and types
export const ACHIEVEMENT_CATEGORIES = {
    VELOCITY: 'Velocity',
    PRECISION: 'Precision',
    ENDURANCE: 'Endurance',
    CONSISTENCY: 'Consistency',
    MASTERY: 'Mastery',
    SPECIAL_OPS: 'Special Ops'
};

const ACHIEVEMENT_TYPES: Record<string, { name: string; description: string; icon: string; category: string }> = {
    // VELOCITY (Speed)
    ...Object.fromEntries(Array.from({ length: 29 }, (_, i) => {
        const wpm = (i + 2) * 5; // 10, 15, 20... 150
        return [`speed_${wpm}`, {
            name: `${wpm} WPM Club`,
            description: `Achieve a typing speed of ${wpm} WPM`,
            icon: wpm >= 100 ? '⚡' : '🚀',
            category: ACHIEVEMENT_CATEGORIES.VELOCITY
        }];
    })),

    // PRECISION (Accuracy)
    'accuracy_90': { name: 'Sharp Shooter', description: 'Maintain 90% accuracy', icon: '🎯', category: ACHIEVEMENT_CATEGORIES.PRECISION },
    'accuracy_95': { name: 'Precision Point', description: 'Maintain 95% accuracy', icon: '📍', category: ACHIEVEMENT_CATEGORIES.PRECISION },
    'accuracy_98': { name: 'Elite Marksman', description: 'Maintain 98% accuracy', icon: '🏹', category: ACHIEVEMENT_CATEGORIES.PRECISION },
    'accuracy_99': { name: 'Near Perfection', description: 'Maintain 99% accuracy', icon: '✨', category: ACHIEVEMENT_CATEGORIES.PRECISION },
    'accuracy_100': { name: 'Precision Master', description: 'Achieve 100% accuracy', icon: '💎', category: ACHIEVEMENT_CATEGORIES.PRECISION },

    // ENDURANCE (Volume & Time)
    ...Object.fromEntries([10, 50, 100, 250, 500, 1000, 2500, 5000].map(drills => [`volume_${drills}`, {
        name: drills >= 1000 ? 'Volume King' : 'Drill Sergeant',
        description: `Complete ${drills} total drills`,
        icon: '📚',
        category: ACHIEVEMENT_CATEGORIES.ENDURANCE
    }])),
    ...Object.fromEntries([1, 5, 10, 24, 50, 100, 250, 500].map(hours => [`time_${hours}h`, {
        name: `${hours}h Practice`,
        description: `Dedicated ${hours} total hours to training`,
        icon: '⏳',
        category: ACHIEVEMENT_CATEGORIES.ENDURANCE
    }])),

    // CONSISTENCY (Streaks)
    ...Object.fromEntries([2, 3, 5, 7, 14, 21, 30, 60, 90, 180, 365].map(days => [`streak_${days}`, {
        name: days >= 30 ? 'Unstoppable' : `${days} Day Streak`,
        description: `Practice for ${days} consecutive days`,
        icon: '🔥',
        category: ACHIEVEMENT_CATEGORIES.CONSISTENCY
    }])),

    // MASTERY (Levels & Lessons)
    ...Object.fromEntries(Array.from({ length: 29 }, (_, i) => {
        const level = i + 2;
        return [`level_${level}`, {
            name: `Tier ${level} Clearance`,
            description: `Reach Level ${level}`,
            icon: '🎖️',
            category: ACHIEVEMENT_CATEGORIES.MASTERY
        }];
    })),
    'lessons_10': { name: 'Student of Flow', description: 'Complete 10 lessons', icon: '📖', category: ACHIEVEMENT_CATEGORIES.MASTERY },
    'lessons_25': { name: 'Academic Pulse', description: 'Complete 25 lessons', icon: '🎓', category: ACHIEVEMENT_CATEGORIES.MASTERY },
    'lessons_50': { name: 'Flow Scholar', description: 'Complete 50 lessons', icon: '🏛️', category: ACHIEVEMENT_CATEGORIES.MASTERY },

    // SPECIAL OPS
    'first_drill': { name: 'First Steps', description: 'Complete your first drill', icon: '🏁', category: ACHIEVEMENT_CATEGORIES.SPECIAL_OPS },
    'early_bird': { name: 'Dawn Watch', description: 'Practice before 8 AM', icon: '🌅', category: ACHIEVEMENT_CATEGORIES.SPECIAL_OPS },
    'night_owl': { name: 'Dark Ops', description: 'Practice after 10 PM', icon: '🦉', category: ACHIEVEMENT_CATEGORIES.SPECIAL_OPS },
    'profile_complete': { name: 'Identified', description: 'Complete your user profile', icon: '🆔', category: ACHIEVEMENT_CATEGORIES.SPECIAL_OPS },
    'custom_drill_creator': { name: 'The Forge', description: 'Create your first custom drill', icon: '🔨', category: ACHIEVEMENT_CATEGORIES.SPECIAL_OPS },
    'bible_enthusiast': { name: 'Disciple of Text', description: 'Complete your first Legacy session', icon: '📜', category: ACHIEVEMENT_CATEGORIES.SPECIAL_OPS }
};

// GET /api/achievements/:userId - List all user achievements
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const earned = await prisma.achievement.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' }
        });

        // Map metadata
        const enriched = earned.map(e => ({
            ...e,
            ...(ACHIEVEMENT_TYPES[e.badgeType] || {
                name: e.badgeType.replace(/_/g, ' '),
                description: 'Goal reached',
                icon: '🏅',
                category: 'General'
            })
        }));

        res.json({ achievements: enriched });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// POST /api/achievements/:userId/check - Check and award new achievements
router.post('/:userId/check', async (req, res) => {
    try {
        const { userId } = req.params;
        const newAchievements = await runAchievementCheck(userId);
        res.json({ newAchievements, count: newAchievements.length });
    } catch (error) {
        console.error('Check achievements error:', error);
        res.status(500).json({ error: 'Failed to check achievements' });
    }
});

/**
 * Shared logic to check and award achievements based on user metrics
 */
export async function runAchievementCheck(userId: string): Promise<string[]> {
    const newAchievements: string[] = [];

    // Fetch metrics for evaluation
    const [userProgress, drillCount, streak, results] = await Promise.all([
        prisma.userProgress.findUnique({ where: { userId } }),
        prisma.drillResult.count({ where: { userId } }),
        prisma.dailyStreak.findUnique({ where: { userId } }),
        prisma.drillResult.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 5
        })
    ]);

    if (!userProgress) return [];

    const award = async (badgeType: string) => {
        if (!(await hasAchievement(userId, badgeType))) {
            await awardAchievement(userId, badgeType);
            newAchievements.push(badgeType);
        }
    };

    // 1. EVALUATE VELOCITY (Based on recent results)
    const highestRecentWPM = results.length > 0 ? Math.max(...results.map(r => r.netWPM)) : 0;
    for (let wpm = 10; wpm <= 150; wpm += 5) {
        if (highestRecentWPM >= wpm) await award(`speed_${wpm}`);
    }

    // 2. EVALUATE PRECISION
    const highestRecentAccuracy = results.length > 0 ? Math.max(...results.map(r => r.accuracy)) : 0;
    if (highestRecentAccuracy >= 90) await award('accuracy_90');
    if (highestRecentAccuracy >= 95) await award('accuracy_95');
    if (highestRecentAccuracy >= 98) await award('accuracy_98');
    if (highestRecentAccuracy >= 99) await award('accuracy_99');
    if (highestRecentAccuracy === 100) await award('accuracy_100');

    // 3. EVALUATE ENDURANCE
    const volumes = [10, 50, 100, 250, 500, 1000, 2500, 5000];
    for (const d of volumes) {
        if (drillCount >= d) await award(`volume_${d}`);
    }

    const practiceHours = userProgress.totalPracticeTime / 3600;
    const hourMilestones = [1, 5, 10, 24, 50, 100, 250, 500];
    for (const h of hourMilestones) {
        if (practiceHours >= h) await award(`time_${h}h`);
    }

    // 4. EVALUATE CONSISTENCY
    if (streak) {
        const streakMilestones = [2, 3, 5, 7, 14, 21, 30, 60, 90, 180, 365];
        for (const d of streakMilestones) {
            if (streak.currentStreak >= d) await award(`streak_${d}`);
        }
    }

    // 5. EVALUATE MASTERY
    for (let l = 2; l <= 20; l++) {
        if (userProgress.level >= l) await award(`level_${l}`);
    }
    if (userProgress.totalDrills >= 10) await award('lessons_10');
    if (userProgress.totalDrills >= 25) await award('lessons_25');
    if (userProgress.totalDrills >= 50) await award('lessons_50');

    // 6. EVALUATE SPECIAL OPS
    if (drillCount >= 1) await award('first_drill');

    const hour = new Date().getHours();
    if (hour < 8 && drillCount > 0) await award('early_bird');
    if (hour > 22 && drillCount > 0) await award('night_owl');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.name && user?.photoUrl) await award('profile_complete');

    return newAchievements;
}

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

// Helper functions (Internal use only)
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
