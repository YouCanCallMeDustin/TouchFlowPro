import { Router, Request } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../lib/db';
import { createPlanSchema, completeItemSchema } from '../lib/validation';
import { drillLibrary } from '@shared/drillLibrary';
import { TrainingDayItem } from '@shared/trainingPlan';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Helper to get start of day (UTC or server local? specific to user implies timezone, but let's stick to server date for MVP stability)
const getTodayDate = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper: Generate items for a day
const generateDailyItems = (plan: any): TrainingDayItem[] => {
    const items: TrainingDayItem[] = [];

    // 1. WARMUP (3-5 mins)
    items.push({
        id: uuidv4(),
        blockType: 'WARMUP',
        mode: 'practice',
        title: 'Finger Warmup',
        recommendedSeconds: 180,
        launch: {
            kind: 'CUSTOM_TEXT',
            promptText: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
            difficulty: 'Easy'
        }
    });

    // 2. SKILL BUILDER (Main drill)
    // Find a drill matching track or random
    const drills = drillLibrary.filter(d => d.category !== 'Code'); // default filter
    const randomDrill = drills[Math.floor(Math.random() * drills.length)];

    if (randomDrill) {
        items.push({
            id: uuidv4(),
            blockType: 'SKILL',
            mode: 'practice', // or 'drill' based on your app's mode
            title: randomDrill.title,
            recommendedSeconds: 600, // 10 mins
            launch: {
                kind: 'DRILL',
                drillId: randomDrill.id,
                difficulty: randomDrill.difficulty,
                tags: randomDrill.tags
            }
        });
    }

    // 3. TARGETED PRACTICE or CODE (if track is CODE)
    if (plan.track === 'CODE') {
        const codeDrills = drillLibrary.filter(d => d.category === 'Code');
        const randomCode = codeDrills[Math.floor(Math.random() * codeDrills.length)];
        if (randomCode) {
            items.push({
                id: uuidv4(),
                blockType: 'SKILL',
                mode: 'code',
                title: randomCode.title,
                recommendedSeconds: 300,
                launch: {
                    kind: 'DRILL',
                    drillId: randomCode.id
                }
            });
        }
    } else {
        // COOLDOWN / REVIEW
        items.push({
            id: uuidv4(),
            blockType: 'REVIEW',
            mode: 'practice',
            title: 'Accuracy Focus',
            recommendedSeconds: 300,
            launch: {
                kind: 'CUSTOM_TEXT',
                promptText: 'Accuracy is more important than speed. Focus on hitting each key in the center.',
                difficulty: 'Normal'
            }
        });
    }

    return items;
};

// GET /api/plans/active
router.get('/active', async (req: Request, res) => {
    try {
        const userId = (req as any).user.id;
        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (!plan) {
            return res.status(404).json({ message: 'No active plan' });
        }
        res.json(plan);
    } catch (error) {
        console.error('Error fetching active plan:', error);
        res.status(500).json({ error: 'Failed to fetch active plan' });
    }
});

// GET /api/plans/active/today
router.get('/active/today', async (req: Request, res) => {
    try {
        const userId = (req as any).user.id;
        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (!plan) {
            return res.status(404).json({ message: 'No active plan' });
        }

        const today = getTodayDate();

        // Find existing day
        let day = await prisma.trainingDay.findFirst({
            where: {
                planId: plan.id,
                date: today
            }
        });

        // Generate if missing
        if (!day) {
            const items = generateDailyItems(plan);
            day = await prisma.trainingDay.create({
                data: {
                    planId: plan.id,
                    date: today,
                    itemsJson: JSON.stringify(items),
                    estimatedMinutes: Math.round(items.reduce((acc, i) => acc + i.recommendedSeconds, 0) / 60),
                    status: 'PLANNED',
                    completedItemIds: '[]'
                }
            });
        }

        // Parse items and attach completion status
        const items: TrainingDayItem[] = JSON.parse(day.itemsJson);
        const completedIds: string[] = JSON.parse(day.completedItemIds || '[]');

        const enrichedItems = items.map(item => ({
            ...item,
            isCompleted: completedIds.includes(item.id)
        }));

        res.json({
            ...day,
            items: enrichedItems,
            completedItemIds: completedIds
        });

    } catch (error) {
        console.error('Error fetching/generating daily plan:', error);
        res.status(500).json({ error: 'Failed to get daily plan' });
    }
});

// POST /api/plans
router.post('/', async (req: Request, res) => {
    try {
        const userId = (req as any).user.id;
        const data = createPlanSchema.parse(req.body);

        // Deactivate existing plans
        await prisma.trainingPlan.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'ARCHIVED' }
        });

        const newPlan = await prisma.trainingPlan.create({
            data: {
                userId,
                track: data.track,
                goalWpm: data.goalWpm,
                goalAccuracy: data.goalAccuracy,
                minutesPerDay: data.minutesPerDay,
                startDate: new Date(),
                status: 'ACTIVE'
            }
        });

        res.status(201).json(newPlan);
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(400).json({ error: 'Invalid plan data' });
    }
});

// POST /api/plans/active/today/complete
router.post('/active/today/complete', async (req: Request, res) => {
    try {
        const userId = (req as any).user.id;
        const { planItemId } = completeItemSchema.parse(req.body);

        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });
        if (!plan) return res.status(404).json({ error: 'No active plan' });

        const today = getTodayDate();
        const day = await prisma.trainingDay.findFirst({
            where: { planId: plan.id, date: today }
        });

        if (!day) return res.status(404).json({ error: 'No daily plan found' });

        const currentCompletedIds: string[] = JSON.parse(day.completedItemIds || '[]');
        const items: TrainingDayItem[] = JSON.parse(day.itemsJson);

        let updatedIds = [...currentCompletedIds];

        if (planItemId) {
            // Toggle item completion
            if (!updatedIds.includes(planItemId)) {
                updatedIds.push(planItemId);
            }
        } else {
            // Mark all complete
            updatedIds = items.map(i => i.id);
        }

        // Check if all items completed
        const allDone = items.every(i => updatedIds.includes(i.id));

        const updatedDay = await prisma.trainingDay.update({
            where: { id: day.id },
            data: {
                completedItemIds: JSON.stringify(updatedIds),
                status: allDone ? 'COMPLETED' : 'PLANNED',
                completedAt: allDone ? new Date() : null
            }
        });

        res.json({
            success: true,
            completedItemIds: updatedIds,
            status: updatedDay.status
        });

    } catch (error) {
        console.error('Error completing item:', error);
        res.status(500).json({ error: 'Failed to update completion' });
    }
});

export default router;
