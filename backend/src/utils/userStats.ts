import prisma from '../lib/db';
import { TypingMetrics } from '@shared/types';

/**
 * Update aggregate user statistics in the UserProgress table.
 * This should be called whenever a typing session (drill or lesson) is completed.
 */
export async function updateUserStats(userId: string, metrics: TypingMetrics) {
    // 1. Fetch current progress
    let progress = await prisma.userProgress.findUnique({
        where: { userId }
    });

    if (!progress) {
        // Initialize if not exists
        progress = await prisma.userProgress.create({
            data: {
                userId,
                level: 1,
                xp: 0,
                totalPracticeTime: 0,
                dailyStreak: 0,
                averageWPM: 0,
                averageAccuracy: 100,
                totalDrills: 0
            }
        });
    }

    // 2. Calculate new aggregate stats
    const totalDrills = progress.totalDrills + 1;

    // We calculate a running average
    const newAvgWPM = (progress.averageWPM * progress.totalDrills + metrics.netWPM) / totalDrills;
    const newAvgAccuracy = (progress.averageAccuracy * progress.totalDrills + metrics.accuracy) / totalDrills;
    const additionalPracticeTime = Math.floor((metrics.durationMs || 0) / 1000);

    // 3. Update the table
    return await prisma.userProgress.update({
        where: { userId },
        data: {
            totalDrills,
            averageWPM: newAvgWPM,
            averageAccuracy: newAvgAccuracy,
            totalPracticeTime: { increment: additionalPracticeTime },
            lastPracticeDate: new Date()
        }
    });
}
