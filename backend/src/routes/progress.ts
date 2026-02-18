import { Router } from 'express';
import { PlacementEngine, DifficultyLevel } from '@shared/placement';
import { Curriculum, UserProgress, LessonResult } from '@shared/curriculum';
import { TypingMetrics } from '@shared/types';
import prisma from '../lib/db';
import { drillLibrary } from '@shared/drillLibrary';
import { v4 as uuidv4 } from 'uuid';
import { updateUserStats } from '../utils/userStats';
import { assessmentSchema, completeLessonSchema } from '../lib/validation';
import { getEffectiveSubscriptionStatus } from '../lib/subscription';

const router = Router();

// Helper to reconstruct UserProgress from DB
async function getUserProgress(userId: string): Promise<UserProgress | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const results = await prisma.drillResult.findMany({ where: { userId } });

    const completedLessons: string[] = [];
    const lessonScores: Record<string, TypingMetrics> = {};

    for (const result of results) {
        lessonScores[result.drillId] = {
            grossWPM: result.grossWPM,
            netWPM: result.netWPM,
            accuracy: result.accuracy,
            charsTyped: 0,
            errors: 0,
            totalMistakes: 0,
            durationMs: result.durationMs,
            errorMap: {}
        };

        const drill = drillLibrary.find(d => d.id === result.drillId);
        if (drill) {
            const threshold = drill.difficulty === 'Beginner' ? 85 : drill.difficulty === 'Intermediate' ? 88 : 90;
            if (result.accuracy >= threshold) {
                if (!completedLessons.includes(result.drillId)) {
                    completedLessons.push(result.drillId);
                }
            }
        }
    }

    const unlockedLevels = user.unlockedLevels.split(',') as DifficultyLevel[];
    const effectiveStatus = await getEffectiveSubscriptionStatus(userId);

    return {
        userId: user.id,
        name: user.name,
        photoUrl: user.photoUrl,
        assignedLevel: user.assignedLevel as DifficultyLevel,
        completedLessons,
        lessonScores,
        currentLesson: user.currentLessonId || null,
        unlockedLevels,
        subscriptionStatus: effectiveStatus as 'free' | 'pro' | 'cancelled'
    };
}

// POST /api/progress/assessment - Complete assessment and get placement
router.post('/assessment', async (req, res, next) => {
    try {
        const { userId, metrics } = assessmentSchema.parse(req.body);

        const fullMetrics: TypingMetrics = {
            ...metrics,
            charsTyped: 0,
            errors: 0,
            totalMistakes: 0,
            errorMap: {}
        };

        const placement = PlacementEngine.calculatePlacement(fullMetrics);

        let user = await prisma.user.findUnique({ where: { id: userId } });

        if (user) {
            user = await prisma.user.update({
                where: { id: userId },
                data: {
                    assignedLevel: placement.level,
                    unlockedLevels: placement.level,
                    currentLessonId: placement.recommendedStartLesson
                }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: `temp_${userId}@example.com`,
                    assignedLevel: placement.level,
                    unlockedLevels: placement.level,
                    currentLessonId: placement.recommendedStartLesson,
                    createdAt: new Date()
                }
            });
        }

        const progress = await getUserProgress(userId);

        res.json({
            placement,
            progress
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/progress/:userId - Get user progress
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const progress = await getUserProgress(userId);

    if (!progress) {
        return res.status(404).json({ error: 'User progress not found. Please complete assessment first.' });
    }

    res.json(progress);
});

// POST /api/progress/:userId/lesson/:lessonId/complete - Complete a lesson
router.post('/:userId/lesson/:lessonId/complete', async (req, res, next) => {
    try {
        const { userId, lessonId } = req.params;
        const { metrics, lesson } = completeLessonSchema.parse(req.body);

        // 1. Ensure user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 2. Save Result
        await prisma.drillResult.create({
            data: {
                userId,
                drillId: lessonId,
                grossWPM: metrics.grossWPM,
                netWPM: metrics.netWPM,
                accuracy: metrics.accuracy,
                durationMs: metrics.durationMs || 0,
                timestamp: new Date()
            }
        });

        const fullMetrics: TypingMetrics = {
            ...metrics,
            charsTyped: 0,
            errors: 0,
            totalMistakes: 0,
            errorMap: {}
        };

        // 2b. Sync aggregate stats for dashboard/recommendations
        await updateUserStats(userId, fullMetrics);

        // 3. Check Mastery
        const passed = Curriculum.checkMastery(lesson, fullMetrics);

        // 4. Update User state
        const progress = await getUserProgress(userId);
        if (!progress) return res.status(500).json({ error: 'Failed to rebuild progress' });

        const levelUpCheck = PlacementEngine.canLevelUp(
            progress.assignedLevel,
            progress.completedLessons,
            progress.lessonScores
        );

        let leveledUp = false;
        let newLevel: DifficultyLevel | null = null;
        let levelUpMessage = "";

        if (levelUpCheck.canLevelUp) {
            newLevel = PlacementEngine.getNextLevel(progress.assignedLevel);
            if (newLevel && !progress.unlockedLevels.includes(newLevel)) {
                const newUnlocked = [...progress.unlockedLevels, newLevel];
                const levelPrefixes: Record<string, string> = { 'Beginner': 'b', 'Intermediate': 'i', 'Professional': 'p', 'Specialist': 'm' };
                const nextLessonId = `${levelPrefixes[newLevel] || 'm'}1`;

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        assignedLevel: newLevel,
                        unlockedLevels: newUnlocked.join(','),
                        currentLessonId: nextLessonId
                    }
                });

                leveledUp = true;
                levelUpMessage = levelUpCheck.reason;

                if (progress) {
                    progress.assignedLevel = newLevel;
                    progress.unlockedLevels = newUnlocked;
                    progress.currentLesson = nextLessonId;
                }
            }
        }

        const result: LessonResult = {
            lessonId,
            passed,
            metrics: {
                ...metrics,
                charsTyped: 0,
                errors: 0,
                totalMistakes: 0,
                errorMap: {}
            },
            timestamp: new Date()
        };

        res.json({
            result,
            progress,
            leveledUp,
            newLevel,
            levelUpMessage
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/progress/:userId/curriculum/:level
router.get('/:userId/curriculum/:level', async (req, res) => {
    const { userId, level } = req.params;
    const progress = await getUserProgress(userId);

    if (!progress) {
        return res.status(404).json({ error: 'User progress not found' });
    }

    const levelPrefixes: Record<string, string> = { 'Beginner': 'b', 'Intermediate': 'i', 'Professional': 'p', 'Specialist': 'm' };
    const prefix = levelPrefixes[level as DifficultyLevel] || 'm';
    const progressPercent = Curriculum.calculateLevelProgress(progress.completedLessons, prefix);

    res.json({
        level,
        progress: progressPercent,
        completedLessons: progress.completedLessons.filter(id => id.startsWith(prefix)),
        currentLesson: progress.currentLesson
    });
});

export default router;
