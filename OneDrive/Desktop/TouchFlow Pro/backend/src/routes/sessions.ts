import { Router } from 'express';
import prisma from '../lib/db';
import { TypingMetrics } from '@shared/types';
import { calculateUserLevel } from '@shared/adaptiveEngine';

const router = Router();

interface SessionCompleteBody {
    userId: string;
    drillId: string;
    type: 'lesson' | 'practice' | 'adaptive' | 'bible' | 'custom';
    metrics: TypingMetrics;
    keystrokes?: any[];
    liveMetrics?: any[];
}

/**
 * POST /api/sessions/complete
 * Unified endpoint for recording any typing session completion
 */
router.post('/complete', async (req, res) => {
    try {
        const { userId, drillId, type, metrics } = req.body as SessionCompleteBody;

        if (!userId || !metrics) {
            return res.status(400).json({ error: 'Missing required session data' });
        }

        // 1. Save Drill Result
        const drillResult = await prisma.drillResult.create({
            data: {
                userId,
                drillId,
                grossWPM: metrics.grossWPM,
                netWPM: metrics.netWPM,
                accuracy: metrics.accuracy,
                durationMs: metrics.durationMs || 0,
                timestamp: new Date()
            }
        });

        // 1b. Save Keystroke/Session Details
        if (req.body.keystrokes) {
            await prisma.sessionDetails.create({
                data: {
                    sessionId: drillResult.id,
                    keystrokes: JSON.stringify(req.body.keystrokes),
                    liveMetrics: JSON.stringify(req.body.liveMetrics || [])
                }
            });
        }

        // 2. Update User Progress (XP, Level, Stats)
        const currentProgress = await prisma.userProgress.findUnique({
            where: { userId }
        });

        const xpEarned = calculateXPEarned(metrics);
        let leveledUp = false;
        let newLevel = currentProgress?.level || 1;

        if (currentProgress) {
            let totalXP = currentProgress.xp + xpEarned;

            // Simple level up logic
            const xpToNext = Math.floor(100 * Math.pow(1.5, currentProgress.level - 1));
            if (totalXP >= xpToNext) {
                totalXP -= xpToNext;
                newLevel++;
                leveledUp = true;
            }

            // Update average stats
            const totalDrills = currentProgress.totalDrills + 1;
            const newAvgWPM = (currentProgress.averageWPM * currentProgress.totalDrills + metrics.netWPM) / totalDrills;
            const newAvgAccuracy = (currentProgress.averageAccuracy * currentProgress.totalDrills + metrics.accuracy) / totalDrills;

            await prisma.userProgress.update({
                where: { userId },
                data: {
                    xp: totalXP,
                    level: newLevel,
                    totalDrills,
                    averageWPM: newAvgWPM,
                    averageAccuracy: newAvgAccuracy,
                    totalPracticeTime: { increment: Math.floor((metrics.durationMs || 0) / 1000) }
                }
            });
        }

        // 3. Update Streak
        const streakRes = await updateStreak(userId);

        // 4. Check Achievements
        const newAchievements: string[] = [];
        const checkAndAward = async (badgeType: string) => {
            const exists = await prisma.achievement.findUnique({
                where: { userId_badgeType: { userId, badgeType } }
            });
            if (!exists) {
                await prisma.achievement.create({
                    data: { userId, badgeType, earnedAt: new Date() }
                });
                newAchievements.push(badgeType);
            }
        };

        // Speed achievements
        if (metrics.netWPM >= 40) await checkAndAward('speed_bronze');
        if (metrics.netWPM >= 70) await checkAndAward('speed_silver');
        if (metrics.netWPM >= 100) await checkAndAward('speed_gold');

        // Accuracy
        if (metrics.accuracy >= 95) await checkAndAward('accuracy_bronze');
        if (metrics.accuracy >= 98) await checkAndAward('accuracy_silver');
        if (metrics.accuracy >= 100) await checkAndAward('accuracy_gold');

        res.json({
            success: true,
            drillResult,
            xpEarned,
            leveledUp,
            newLevel,
            streak: streakRes,
            newAchievements
        });

    } catch (error) {
        console.error('Session complete error:', error);
        res.status(500).json({ error: 'Failed to record session completion' });
    }
});

/**
 * Calculate XP based on performance
 */
function calculateXPEarned(metrics: TypingMetrics): number {
    const baseXP = Math.floor(metrics.netWPM * 2);
    const accuracyBonus = metrics.accuracy >= 98 ? 50 : metrics.accuracy >= 95 ? 25 : 0;
    return baseXP + accuracyBonus;
}

/**
 * Handle streak updates
 */
async function updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await prisma.userProgress.findUnique({ where: { userId } });
    if (!progress) return null;

    let newStreak = progress.dailyStreak;
    const lastPractice = progress.lastPracticeDate;

    if (!lastPractice) {
        newStreak = 1;
    } else {
        const lastDate = new Date(lastPractice);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak++;
        } else if (diffDays > 1) {
            newStreak = 1;
        }
    }

    await prisma.userProgress.update({
        where: { userId },
        data: {
            dailyStreak: newStreak,
            lastPracticeDate: new Date()
        }
    });

    return {
        currentStreak: newStreak,
        lastPracticeDate: new Date()
    };
}

/**
 * Check for new achievements (including tiered ones)
 */
async function checkAchievements(userId: string, metrics: TypingMetrics, drillId: string) {
    const newEarned: string[] = [];

    // Achievement definitions
    const milestones = [
        { type: 'speed_bronze', threshold: 40, check: (m: TypingMetrics) => m.netWPM >= 40 },
        { type: 'speed_silver', threshold: 70, check: (m: TypingMetrics) => m.netWPM >= 70 },
        { type: 'speed_gold', threshold: 100, check: (m: TypingMetrics) => m.netWPM >= 100 },
        { type: 'accuracy_bronze', threshold: 95, check: (m: TypingMetrics) => m.accuracy >= 95 },
        { type: 'accuracy_silver', threshold: 98, check: (m: TypingMetrics) => m.accuracy >= 98 },
        { type: 'accuracy_gold', threshold: 100, check: (m: TypingMetrics) => m.accuracy >= 100 },
    ];

    for (const milestone of milestones) {
        const exists = await prisma.achievement.findUnique({
            where: { userId_badgeType: { userId, badgeType: milestone.type } }
        });

        if (!exists && milestone.check(metrics)) {
            await prisma.achievement.create({
                data: {
                    userId,
                    badgeType: milestone.type,
                    earnedAt: new Date()
                }
            });
            newEarned.push(milestone.type);
        }
    }

    return newEarned;
}

export default router;
