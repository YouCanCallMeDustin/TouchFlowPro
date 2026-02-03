import { Router } from 'express';
import { drillLibrary } from '@shared/drillLibrary';
import { SpacedScheduler } from '@shared/scheduler';
import { getDb, SpacedItem } from '../lib/db';
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

    const db = await getDb();

    // Ensure User exists
    let user = db.data.users.find((u: any) => u.id === userId);
    if (!user) {
        user = {
            id: userId,
            assignedLevel: 'Beginner',
            unlockedLevels: 'Beginner',
            currentLessonId: null,
            createdAt: new Date().toISOString()
        };
        db.data.users.push(user);
    }

    // Save Result
    db.data.drillResults.push({
        id: uuidv4(),
        userId,
        drillId,
        grossWPM: metrics.grossWPM,
        netWPM: metrics.netWPM,
        accuracy: metrics.accuracy,
        durationMs: metrics.durationMs || 0,
        timestamp: new Date().toISOString()
    });

    // Get existing spaced item or create default
    let spacedItemIndex = db.data.spacedItems.findIndex((i: any) => i.userId === userId && i.drillId === drillId);
    let spacedItem = spacedItemIndex >= 0 ? db.data.spacedItems[spacedItemIndex] : null;

    const currentItem = spacedItem ? {
        id: spacedItem.drillId,
        interval: spacedItem.interval,
        repetition: spacedItem.repetition,
        efactor: spacedItem.efactor,
        nextReview: new Date(spacedItem.nextReview)
    } : {
        id: drillId,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReview: new Date()
    };

    const quality = SpacedScheduler.calculateQuality(metrics.accuracy, metrics.netWPM, 60);
    const updatedItemCalc = SpacedScheduler.review(currentItem, quality);

    const newItem: SpacedItem = {
        id: spacedItem ? spacedItem.id : uuidv4(),
        userId,
        drillId,
        interval: updatedItemCalc.interval,
        repetition: updatedItemCalc.repetition,
        efactor: updatedItemCalc.efactor,
        nextReview: updatedItemCalc.nextReview.toISOString()
    };

    if (spacedItemIndex >= 0) {
        db.data.spacedItems[spacedItemIndex] = newItem;
    } else {
        db.data.spacedItems.push(newItem);
    }

    await db.write();

    res.json({
        message: 'Drill completed',
        nextReview: updatedItemCalc.nextReview,
        interval: updatedItemCalc.interval
    });
});

export default router;
