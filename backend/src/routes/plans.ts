import { Router, Request, Response } from 'express';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { drillLibrary } from '@shared/drillLibrary';
import { getRandomMedicalDrill } from '@shared/tracks/medical';
import { getRandomLegalDrill } from '@shared/tracks/legal';
import { getRandomCodeDrill } from '@shared/tracks/code';

const router = Router();

// Zod schemas
const createPlanSchema = z.object({
    track: z.enum(['MEDICAL', 'LEGAL', 'OPS', 'CODE']),
    goalWpm: z.number().optional(),
    goalAccuracy: z.number().optional(),
    minutesPerDay: z.number().default(20),
    durationWeeks: z.number().default(4)
});

// Helper types
interface PlanItem {
    id: string;
    title: string;
    blockType: string;
    minutes: number;
    recommendedSeconds: number;
    mode: string;
    launch: {
        kind: string;
        drillId?: string;
        promptText?: string;
    };
    reason: string[];
    isCompleted: boolean;
}

// Helper to generate daily items based on track
const generateDailyItems = async (userId: string, track: string, dayIndex: number, minutesPerDay: number, settings: any = null): Promise<PlanItem[]> => {
    const items: PlanItem[] = [];
    let currentMinutes = 0;
    const targetMinutes = minutesPerDay;

    // Default durations (in seconds)
    const warmupSec = settings?.warmupSeconds || 300; // 5 mins
    const skillSec = settings?.skillSeconds || 900;   // 15 mins
    const reviewSec = settings?.reviewSeconds || 300; // 5 mins
    const cooldownSec = settings?.cooldownSeconds || 300; // 5 mins (used later)

    // 1. Warmup
    const warmupMins = Math.ceil(warmupSec / 60);
    const beginnerDrills = drillLibrary.filter(d => d.difficulty === 'Beginner');
    const warmupDrill = beginnerDrills[Math.floor(Math.random() * beginnerDrills.length)];

    let warmupContent = warmupDrill.content;
    while (warmupContent.length < 100) {
        warmupContent += ' ' + warmupDrill.content;
    }

    items.push({
        id: `warmup-${dayIndex}`,
        title: `Warmup: ${warmupDrill.title}`,
        blockType: 'WARMUP',
        minutes: warmupMins,
        recommendedSeconds: warmupSec,
        mode: 'quote',
        launch: {
            kind: 'DRILL',
            drillId: warmupDrill.id,
            promptText: warmupContent
        },
        reason: ['Get fingers moving', 'Establish rhythm'],
        isCompleted: false
    });
    currentMinutes += warmupMins;

    // 2. Main Skill (Track Specific)
    const skillMins = Math.ceil(skillSec / 60);

    // Track Specific Logic
    if (['MEDICAL', 'LEGAL', 'CODE'].includes(track)) {
        // High Risk Term Review Block
        let weakTerms: any[] = [];
        if (track === 'MEDICAL') {
            weakTerms = await prisma.medicalWeakTerm.findMany({
                where: { userId, mistakeCount: { gte: 3 } },
                orderBy: { mistakeCount: 'desc' },
                take: 10
            });
        } else if (track === 'LEGAL') {
            weakTerms = await prisma.legalWeakTerm.findMany({
                where: { userId, mistakeCount: { gte: 3 } },
                orderBy: { mistakeCount: 'desc' },
                take: 10
            });
        } else if (track === 'CODE') {
            weakTerms = await prisma.codeWeakTerm.findMany({
                where: { userId, mistakeCount: { gte: 3 } },
                orderBy: { mistakeCount: 'desc' },
                take: 10
            });
        }

        if (weakTerms && weakTerms.length > 0) {
            const termList = weakTerms.map(t => t.term).join(' ');
            const repeatedTerms = Array(15).fill(termList).join(' ');
            const reviewBlockMins = Math.min(4, Math.max(2, Math.floor(targetMinutes * 0.15)));

            items.push({
                id: `high-risk-${dayIndex}`,
                title: 'High-Risk Term Review',
                blockType: 'HIGH_RISK_REVIEW',
                minutes: reviewBlockMins,
                recommendedSeconds: reviewBlockMins * 60,
                mode: track === 'CODE' ? 'code' : 'quote',
                launch: {
                    kind: 'DRILL',
                    drillId: 'custom',
                    promptText: repeatedTerms
                },
                reason: ['Frequent terminology errors detected'],
                isCompleted: false
            });
            currentMinutes += reviewBlockMins;
        }

        let specificDrill;
        let defaultTitle = '';
        if (track === 'MEDICAL') {
            specificDrill = getRandomMedicalDrill('CORE') || drillLibrary.find(d => d.id === 'p2') || drillLibrary[0];
            defaultTitle = 'Medical Terminology';
        } else if (track === 'LEGAL') {
            specificDrill = getRandomLegalDrill('CORE') || drillLibrary.find(d => d.id === 'p2') || drillLibrary[0];
            defaultTitle = 'Legal Terminology';
        } else {
            specificDrill = getRandomCodeDrill('CORE') || drillLibrary.find(d => d.id === 'p2') || drillLibrary[0];
            defaultTitle = 'Code Syntax Practice';
        }

        items.push({
            id: `main-${dayIndex}`,
            title: specificDrill.title || defaultTitle,
            blockType: 'SKILL',
            minutes: skillMins,
            recommendedSeconds: skillSec,
            mode: track === 'CODE' ? 'code' : 'quote',
            launch: {
                kind: 'DRILL',
                drillId: specificDrill.id,
                promptText: specificDrill.content || (specificDrill as any).passage
            },
            reason: [`Practice ${track} vocabulary`, 'Build speed'],
            isCompleted: false
        });
        currentMinutes += skillMins;
    } else {
        // Other tracks logic (keep existing fallback for now)
        const trackDrills = drillLibrary.filter(d =>
            (d.title.toUpperCase().includes(track) || d.content.toUpperCase().includes(track))
        );
        const drill = trackDrills.length > 0 ? trackDrills[dayIndex % trackDrills.length] : drillLibrary[dayIndex % drillLibrary.length];

        items.push({
            id: `main-${dayIndex}`,
            title: drill.title,
            blockType: 'SKILL',
            minutes: skillMins,
            recommendedSeconds: skillSec,
            mode: track === 'CODE' ? 'code' : 'quote',
            launch: {
                kind: 'DRILL',
                drillId: drill.id,
                promptText: drill.content
            },
            reason: ['Core skill practice', 'Accuracy focus'],
            isCompleted: false
        });
        currentMinutes += skillMins;
    }

    // 3. Fill the rest of the time
    let cycleIndex = 0;
    const blockDuration = 20; // 20 min blocks generic filler

    while (currentMinutes < targetMinutes) {
        const remaining = targetMinutes - currentMinutes;
        const duration = Math.min(remaining, blockDuration);

        if (duration <= 0) break;

        // Filter out beginner to make it harder
        let randomDrill;

        if (track === 'MEDICAL') {
            const randTier = Math.random() > 0.5 ? 'SPECIALIST' : 'INTERMEDIATE';
            randomDrill = getRandomMedicalDrill(Math.random() > 0.5 ? 'SPECIALIST' : 'INTERMEDIATE') || drillLibrary[0];
        } else if (track === 'LEGAL') {
            randomDrill = getRandomLegalDrill(Math.random() > 0.5 ? 'SPECIALIST' : 'INTERMEDIATE') || drillLibrary[0];
        } else if (track === 'CODE') {
            randomDrill = getRandomCodeDrill(Math.random() > 0.5 ? 'SPECIALIST' : 'INTERMEDIATE') || drillLibrary[0];
        } else {
            const challengeDrills = drillLibrary.filter(d => d.difficulty !== 'Beginner');
            randomDrill = challengeDrills[Math.floor(Math.random() * challengeDrills.length)];
        }

        const types = ['Speed Drills', 'Endurance Block', 'Focus Interpretation'];
        const type = types[cycleIndex % types.length];

        // Tag endurance specifically if it's long
        const isEndurance = randomDrill.focusType === 'ENDURANCE' || duration >= 8;

        items.push({
            id: `block-${dayIndex}-${cycleIndex}`,
            title: `${isEndurance ? 'Endurance' : type}: ${randomDrill.title}`,
            blockType: isEndurance ? 'ENDURANCE' : 'PRACTICE',
            minutes: duration,
            recommendedSeconds: duration * 60,
            mode: track === 'CODE' ? 'code' : 'quote',
            launch: {
                kind: 'DRILL',
                drillId: randomDrill.id,
                promptText: randomDrill.content || (randomDrill as any).passage
            },
            reason: [isEndurance ? 'Sustained typing stamina' : 'Build stamina', 'Increase volume'],
            isCompleted: false
        });

        currentMinutes += duration;
        cycleIndex++;
    }

    return items;
};

// POST /api/plans - Create a new plan
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;
        const { track, goalWpm, goalAccuracy, minutesPerDay, durationWeeks } = createPlanSchema.parse(req.body);

        // Deactivate existing active plans
        await prisma.trainingPlan.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'ARCHIVED' }
        });

        // Create new Plan
        const plan = await prisma.trainingPlan.create({
            data: {
                userId,
                track,
                goalWpm: goalWpm || 60,
                goalAccuracy: goalAccuracy || 98,
                minutesPerDay,
                startDate: new Date(),
                status: 'ACTIVE'
            }
        });

        // Fetch user settings for customization
        const settings = await (prisma as any).userSettings.findUnique({
            where: { userId }
        });

        // Generate Training Days
        const daysToCreate: any[] = [];
        const totalDays = durationWeeks * 7;

        for (let i = 0; i < totalDays; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const items = await generateDailyItems(userId, track, i, minutesPerDay, settings);

            daysToCreate.push({
                planId: plan.id,
                date: date,
                status: 'PLANNED',
                itemsJson: JSON.stringify(items),
                completedItemIds: '[]'
            });
        }

        // Batch create days
        for (const day of daysToCreate) {
            await (prisma as any).trainingDay.create({ data: day });
        }

        res.json(plan);
    } catch (error) {
        console.error('Failed to create plan:', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// GET /api/plans/active - Get current active plan
router.get('/active', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;

        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });

        if (!plan) return res.json(null); // No active plan

        res.json(plan);
    } catch (error) {
        console.error('Failed to get active plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/plans/active/today - Get current active training day
router.get('/active/today', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;

        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });

        if (!plan) return res.status(404).json({ error: 'No active plan' });

        // PROGRESSION LOGIC: Find the first INCOMPLETE day
        // This allows users to advance at their own pace
        let day = await prisma.trainingDay.findFirst({
            where: {
                planId: plan.id,
                status: { not: 'COMPLETED' }
            },
            orderBy: { date: 'asc' }
        });

        // Fallback: If all complete, show the last completed day
        if (!day) {
            day = await prisma.trainingDay.findFirst({
                where: { planId: plan.id },
                orderBy: { date: 'desc' }
            });
        }

        if (!day) {
            return res.json(null);
        }

        const items = JSON.parse(day.itemsJson);
        const completedIds = JSON.parse((day as any).completedItemIds || '[]');

        // Mark items as completed
        const itemsWithStatus = items.map((item: any) => ({
            ...item,
            isCompleted: completedIds.includes(item.id)
        }));

        res.json({
            ...day,
            items: itemsWithStatus,
            estimatedMinutes: plan.minutesPerDay
        });

    } catch (error) {
        console.error('Failed to get todays plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/plans/active/today/complete - Mark current day as complete
router.post('/active/today/complete', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;

        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (!plan) return res.status(404).json({ error: 'No active plan' });

        // Find the current active day (first incomplete)
        const day = await prisma.trainingDay.findFirst({
            where: {
                planId: plan.id,
                status: { not: 'COMPLETED' }
            },
            orderBy: { date: 'asc' }
        });

        if (!day) return res.status(404).json({ error: 'No active training day found' });

        await prisma.trainingDay.update({
            where: { id: day.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Failed to complete day:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/plans/active/item/:itemId/complete - Mark specific item as complete
router.post('/active/item/:itemId/complete', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;
        const { itemId } = req.params;

        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });
        if (!plan) return res.status(404).json({ error: 'No active plan' });

        // PROGRESSION LOGIC: Find the training day that contains this itemId
        // We search all days for this plan because the user might be doing a past or future day
        const allDays = await prisma.trainingDay.findMany({
            where: { planId: plan.id }
        });

        const day = allDays.find(d => {
            try {
                const items = JSON.parse(d.itemsJson);
                return items.some((item: any) => item.id === itemId);
            } catch (e) {
                return false;
            }
        });

        if (!day) return res.status(404).json({ error: 'No training day found containing this item' });

        const completedIds = JSON.parse((day as any).completedItemIds || '[]');
        if (!completedIds.includes(itemId)) {
            completedIds.push(itemId);
        }

        await (prisma as any).trainingDay.update({
            where: { id: day.id },
            data: {
                completedItemIds: JSON.stringify(completedIds)
            }
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Failed to complete item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// POST /api/plans/active/sync - Sync active plan to current user settings (resizes future days)
router.post('/active/sync', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;

        // 1. Get Active Plan
        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (!plan) return res.status(404).json({ error: 'No active plan' });

        // 2. Get User Settings
        const settings = await (prisma as any).userSettings.findUnique({
            where: { userId }
        });

        if (!settings) return res.status(400).json({ error: 'No settings found' });

        // 3. Update Plan Meta
        await prisma.trainingPlan.update({
            where: { id: plan.id },
            data: { minutesPerDay: settings.dailyGoalMinutes }
        });

        // 4. Get Incomplete Days (Future)
        const futureDays = await prisma.trainingDay.findMany({
            where: {
                planId: plan.id,
                status: { not: 'COMPLETED' }
            },
            orderBy: { date: 'asc' }
        });

        // 5. Regenerate content for future days
        for (const day of futureDays) {
            // Calculate relative day index
            const dayIndex = Math.floor((new Date(day.date).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24));

            // Generate new items with NEW settings
            const newItems = await generateDailyItems(userId, plan.track, dayIndex, settings.dailyGoalMinutes, settings);

            await prisma.trainingDay.update({
                where: { id: day.id },
                data: {
                    itemsJson: JSON.stringify(newItems)
                }
            });
        }

        res.json({ success: true, updatedDays: futureDays.length });

    } catch (error) {
        console.error('Failed to sync plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
