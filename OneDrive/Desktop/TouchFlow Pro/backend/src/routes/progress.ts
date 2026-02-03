import { Router } from 'express';
import { PlacementEngine, DifficultyLevel } from '@shared/placement';
import { Curriculum, UserProgress, LessonResult } from '@shared/curriculum';
import { TypingMetrics } from '@shared/types';
import { getDb } from '../lib/db';
import { drillLibrary } from '@shared/drillLibrary';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to reconstruct UserProgress from DB
async function getUserProgress(userId: string): Promise<UserProgress | null> {
    const db = await getDb();

    // Explicitly casting or using any to avoid implicit any errors if type inference fails
    const user = db.data.users.find((u: any) => u.id === userId);
    if (!user) return null;

    const results = db.data.drillResults.filter((r: any) => r.userId === userId);

    const completedLessons: string[] = [];
    const lessonScores: Record<string, TypingMetrics> = {};

    for (const result of results) {
        lessonScores[result.drillId] = {
            grossWPM: result.grossWPM,
            netWPM: result.netWPM,
            accuracy: result.accuracy,
            charsTyped: 0,
            errors: 0,
            durationMs: result.durationMs || 0,
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

    const unlockedLevels = user.id === 'guest'
        ? ['Beginner', 'Intermediate', 'Professional', 'Specialist'] as DifficultyLevel[]
        : user.unlockedLevels.split(',') as DifficultyLevel[];

    return {
        userId: user.id,
        assignedLevel: user.assignedLevel as DifficultyLevel,
        completedLessons,
        lessonScores,
        currentLesson: user.currentLessonId || null,
        unlockedLevels
    };
}

// POST /api/progress/assessment - Complete assessment and get placement
router.post('/assessment', async (req, res) => {
    const { userId, metrics } = req.body as { userId: string; metrics: TypingMetrics };

    const placement = PlacementEngine.calculatePlacement(metrics);

    const db = await getDb();
    let user = db.data.users.find((u: any) => u.id === userId);

    if (user) {
        user.assignedLevel = placement.level;
        user.unlockedLevels = placement.level;
        user.currentLessonId = placement.recommendedStartLesson;
    } else {
        user = {
            id: userId,
            assignedLevel: placement.level,
            unlockedLevels: placement.level,
            currentLessonId: placement.recommendedStartLesson,
            createdAt: new Date().toISOString()
        };
        db.data.users.push(user);
    }
    await db.write();

    const progress = await getUserProgress(userId);

    res.json({
        placement,
        progress
    });
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
router.post('/:userId/lesson/:lessonId/complete', async (req, res) => {
    const { userId, lessonId } = req.params;
    const { metrics, lesson } = req.body as { metrics: TypingMetrics; lesson: any };

    const db = await getDb();

    // 1. Ensure user exists
    let user = db.data.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Save Result
    db.data.drillResults.push({
        id: uuidv4(),
        userId,
        drillId: lessonId,
        grossWPM: metrics.grossWPM,
        netWPM: metrics.netWPM,
        accuracy: metrics.accuracy,
        durationMs: metrics.durationMs || 0,
        timestamp: new Date().toISOString()
    });

    await db.write();

    // 3. Check Mastery
    const passed = Curriculum.checkMastery(lesson, metrics);

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

            user.assignedLevel = newLevel;
            user.unlockedLevels = newUnlocked.join(',');
            user.currentLessonId = nextLessonId;

            await db.write();

            leveledUp = true;
            levelUpMessage = levelUpCheck.reason;

            progress.assignedLevel = newLevel;
            progress.unlockedLevels = newUnlocked;
            progress.currentLesson = nextLessonId;
        }
    }

    const result: LessonResult = {
        lessonId,
        passed,
        metrics,
        timestamp: new Date()
    };

    res.json({
        result,
        progress,
        leveledUp,
        newLevel,
        levelUpMessage
    });
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
