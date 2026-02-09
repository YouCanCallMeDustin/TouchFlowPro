import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { generatePersonalizedDrill, calculateTroubleKeyDensity, generatePracticeDrill } from '../utils/drillGenerator';
import { calculateUserLevel } from '@shared/adaptiveEngine';

const router = Router();
const prisma = new PrismaClient();

interface Recommendation {
    id: string;
    type: 'drill' | 'lesson' | 'custom';
    title: string;
    reason: string;
    priority: number;
    content?: string;
}

/**
 * GET /api/recommendations/:userId
 * Get personalized practice recommendations
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user stats
        const [drillResults, keyStats, userProgress] = await Promise.all([
            prisma.drillResult.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 20
            }),
            prisma.keyStats.findMany({
                where: { userId },
                orderBy: { lastPracticed: 'desc' }
            }),
            prisma.userProgress.findUnique({
                where: { userId }
            })
        ]);

        const recommendations: Recommendation[] = [];

        // 1. Trouble key practice (highest priority)
        const troubleKeys = keyStats
            .filter(stat => {
                const accuracy = stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 100;
                return accuracy < 85 && stat.attempts >= 5;
            })
            .slice(0, 5)
            .map(stat => stat.key);

        if (troubleKeys.length > 0) {
            const personalizedDrill = generatePersonalizedDrill({
                troubleKeys,
                length: 200,
                difficulty: 'medium'
            });

            const density = calculateTroubleKeyDensity(personalizedDrill, troubleKeys);

            recommendations.push({
                id: 'trouble-keys',
                type: 'custom',
                title: `Master ${troubleKeys.slice(0, 3).join(', ')}`,
                reason: `These keys have <85% accuracy (${density.toFixed(0)}% focus)`,
                priority: 10,
                content: personalizedDrill
            });
        }

        // 2. Daily challenge
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyChallenge = await prisma.dailyChallenge.findFirst({
            where: {
                date: {
                    gte: today
                }
            }
        });

        if (dailyChallenge) {
            recommendations.push({
                id: 'daily-challenge',
                type: 'drill',
                title: 'Daily Challenge',
                reason: `${dailyChallenge.type} challenge - Earn ${dailyChallenge.xpReward} XP`,
                priority: 7,
                content: dailyChallenge.content
            });
        }

        // 3. Speed improvement (if avg WPM < 100)
        if (userProgress && userProgress.averageWPM < 100) {
            recommendations.push({
                id: 'speed-training',
                type: 'drill',
                title: 'Speed Training',
                reason: `Current avg: ${userProgress.averageWPM.toFixed(0)} WPM - Practice for speed`,
                priority: 6,
                content: generatePracticeDrill('speed')
            });
        }

        // 4. Accuracy improvement (if avg accuracy < 95)
        if (userProgress && userProgress.averageAccuracy < 95) {
            recommendations.push({
                id: 'precision-practice',
                type: 'drill',
                title: 'Precision Practice',
                reason: `Current avg: ${userProgress.averageAccuracy.toFixed(1)}% - Focus on accuracy`,
                priority: 5,
                content: generatePracticeDrill('accuracy')
            });
        }

        // 5. Consistency practice (if no recent practice)
        const lastPractice = userProgress?.lastPracticeDate;
        if (lastPractice) {
            const daysSinceLastPractice = Math.floor(
                (Date.now() - new Date(lastPractice).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastPractice > 1) {
                recommendations.push({
                    id: 'consistency',
                    type: 'drill',
                    title: 'Keep Your Streak',
                    reason: `Last practice: ${daysSinceLastPractice} day${daysSinceLastPractice > 1 ? 's' : ''} ago`,
                    priority: 8,
                    content: generatePracticeDrill('consistency')
                });
            }
        }

        // Sort by priority
        recommendations.sort((a, b) => b.priority - a.priority);

        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

/**
 * POST /api/recommendations/:userId/dismiss/:recommendationId
 * Dismiss a recommendation
 */
router.post('/:userId/dismiss/:recommendationId', async (req, res) => {
    try {
        const { userId, recommendationId } = req.params;

        // For now, just return success (recommendations are generated on-demand)
        // In a more complex system, we'd store dismissals in the database

        res.json({ success: true });
    } catch (error) {
        console.error('Error dismissing recommendation:', error);
        res.status(500).json({ error: 'Failed to dismiss recommendation' });
    }
});

/**
 * POST /api/recommendations/:userId/complete/:recommendationId
 * Mark a recommendation as completed
 */
router.post('/:userId/complete/:recommendationId', async (req, res) => {
    try {
        const { userId, recommendationId } = req.params;

        // For now, just return success
        // In a more complex system, we'd track completion and adjust future recommendations

        res.json({ success: true });
    } catch (error) {
        console.error('Error completing recommendation:', error);
        res.status(500).json({ error: 'Failed to complete recommendation' });
    }
});

/**
 * GET /api/recommendations/:userId/level
 * Get user level and progress
 */
router.get('/:userId/level', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user stats
        const [drillResults, userProgressRecord] = await Promise.all([
            prisma.drillResult.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 20
            }),
            prisma.userProgress.findUnique({
                where: { userId }
            })
        ]);

        let userProgress = userProgressRecord;

        if (!userProgress) {
            // Re-check if we can derive progress from drill results
            const allDrills = await prisma.drillResult.findMany({ where: { userId } });
            if (allDrills.length > 0) {
                const totalWPM = allDrills.reduce((sum, d) => sum + d.netWPM, 0);
                const totalAccuracy = allDrills.reduce((sum, d) => sum + d.accuracy, 0);
                const totalTime = allDrills.reduce((sum: number, d: { durationMs: number | null }) => sum + (d.durationMs || 0), 0);

                // Create/Update the record so it's synced moving forward
                const newProgress = await prisma.userProgress.upsert({
                    where: { userId },
                    create: {
                        userId,
                        level: 1,
                        xp: 0,
                        totalPracticeTime: Math.floor(totalTime / 1000),
                        averageWPM: totalWPM / allDrills.length,
                        averageAccuracy: totalAccuracy / allDrills.length,
                        totalDrills: allDrills.length,
                        lastPracticeDate: allDrills[0].timestamp
                    },
                    update: {
                        totalPracticeTime: Math.floor(totalTime / 1000),
                        averageWPM: totalWPM / allDrills.length,
                        averageAccuracy: totalAccuracy / allDrills.length,
                        totalDrills: allDrills.length
                    }
                });

                // Continue with the newly created progress
                userProgress = newProgress;
            } else {
                return res.json({
                    level: 1,
                    levelName: 'Beginner',
                    nextLevelRequirements: { wpm: 20, accuracy: 70 },
                    progress: 0
                });
            }
        } else if (userProgress.totalDrills === 0) {
            // Stats exist but drill count is 0? Sync from results
            const allDrills = await prisma.drillResult.findMany({ where: { userId } });
            if (allDrills.length > 0) {
                const totalWPM = allDrills.reduce((sum, d) => sum + d.netWPM, 0);
                const totalAccuracy = allDrills.reduce((sum, d) => sum + d.accuracy, 0);
                const totalTime = allDrills.reduce((sum, d) => sum + (d.durationMs || 0), 0);

                userProgress = await prisma.userProgress.update({
                    where: { userId },
                    data: {
                        totalPracticeTime: Math.floor(totalTime / 1000),
                        averageWPM: totalWPM / allDrills.length,
                        averageAccuracy: totalAccuracy / allDrills.length,
                        totalDrills: allDrills.length
                    }
                });
            }
        }

        // Calculate level
        const recentWPM = drillResults.map((r: { netWPM: number }) => r.netWPM);
        const recentAccuracy = drillResults.map((r: { accuracy: number }) => r.accuracy);

        const levelInfo = calculateUserLevel({
            averageWPM: userProgress.averageWPM,
            averageAccuracy: userProgress.averageAccuracy,
            totalDrills: userProgress.totalDrills,
            recentWPM,
            recentAccuracy
        });

        res.json(levelInfo);
    } catch (error) {
        console.error('Error getting user level:', error);
        res.status(500).json({ error: 'Failed to get user level' });
    }
});

export default router;
