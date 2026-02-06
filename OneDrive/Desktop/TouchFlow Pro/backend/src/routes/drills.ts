import { Router } from 'express';
import { drillLibrary } from '@shared/drillLibrary';
import { SpacedScheduler } from '@shared/scheduler';
import prisma from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET all drills
router.get('/', (req, res) => {
    res.json(drillLibrary);
});

// GET drills by difficulty
router.get('/difficulty/:level', (req, res) => {
    const level = req.params.level;
    const filtered = drillLibrary.filter(drill =>
        drill.difficulty.toLowerCase() === level.toLowerCase()
    );
    res.json(filtered);
});

// GET drill by ID
router.get('/:id', (req, res) => {
    const drill = drillLibrary.find(d => d.id === req.params.id);
    if (!drill) {
        return res.status(404).json({ error: 'Drill not found' });
    }
    res.json(drill);
});

// POST complete drill
router.post('/:id/complete', async (req, res) => {
    const { id: drillId } = req.params;
    const { metrics, userId } = req.body;

    // Ensure User exists (UPSERT logic equivalent)
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                id: userId,
                assignedLevel: 'Beginner',
                unlockedLevels: 'Beginner',
                currentLessonId: null,
                createdAt: new Date(),
                email: `placeholder_${userId}@example.com` // Temporary email for anonymous/auto-created users if allowed
            }
        });
    }

    // Save Result
    await prisma.drillResult.create({
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

    // Get existing spaced item
    let spacedItem = await prisma.spacedItem.findFirst({
        where: {
            userId,
            drillId
        }
    });

    const currentItem = spacedItem ? {
        id: spacedItem.drillId,
        interval: spacedItem.interval,
        repetition: spacedItem.repetition,
        efactor: spacedItem.efactor,
        nextReview: spacedItem.nextReview
    } : {
        id: drillId,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReview: new Date()
    };

    const quality = SpacedScheduler.calculateQuality(metrics.accuracy, metrics.netWPM, 60);
    const updatedItemCalc = SpacedScheduler.review(currentItem, quality);

    // Upsert SpacedItem
    if (spacedItem) {
        await prisma.spacedItem.update({
            where: { id: spacedItem.id },
            data: {
                interval: updatedItemCalc.interval,
                repetition: updatedItemCalc.repetition,
                efactor: updatedItemCalc.efactor,
                nextReview: updatedItemCalc.nextReview
            }
        });
    } else {
        await prisma.spacedItem.create({
            data: {
                userId,
                drillId,
                interval: updatedItemCalc.interval,
                repetition: updatedItemCalc.repetition,
                efactor: updatedItemCalc.efactor,
                nextReview: updatedItemCalc.nextReview
            }
        });
    }

    res.json({
        message: 'Drill completed',
        nextReview: updatedItemCalc.nextReview,
        interval: updatedItemCalc.interval
    });
});

export default router;
