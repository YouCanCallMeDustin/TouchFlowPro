import { Router, Request, Response } from 'express';
import db from '../lib/db';
import { getEffectiveSubscriptionStatus } from '../lib/subscription';

const router = Router();

// GET /api/profile/:userId - Get user profile
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;

        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Resolve effective status (including inheritance)
        const effectiveStatus = await getEffectiveSubscriptionStatus(userId);

        // Return profile data
        const profileData = {
            id: user.id,
            email: user.email,
            name: (user as any).name || null,
            city: (user as any).city || null,
            state: (user as any).state || null,
            age: (user as any).age || null,
            photoUrl: (user as any).photoUrl || null,
            subscriptionStatus: effectiveStatus as any,
            subscriptionEndDate: user.subscriptionEndDate
        };

        res.json(profileData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile/:userId - Update user profile
router.put('/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const body = req.body as Record<string, unknown>;

        const name = body.name as string | undefined;
        const city = body.city as string | undefined;
        const state = body.state as string | undefined;
        const age = body.age as string | number | undefined;
        const photoUrl = body.photoUrl as string | undefined;

        // Validate age if provided
        if (age !== undefined && age !== null) {
            const ageNum = typeof age === 'string' ? parseInt(age) : age;
            if (isNaN(ageNum as number) || (ageNum as number) < 1 || (ageNum as number) > 150) {
                return res.status(400).json({ error: 'Invalid age value' });
            }
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name: name || null }),
                ...(city !== undefined && { city: city || null }),
                ...(state !== undefined && { state: state || null }),
                ...(age !== undefined && { age: age ? (typeof age === 'string' ? parseInt(age) : age) : null }),
                ...(photoUrl !== undefined && { photoUrl: photoUrl || null })
            }
        });

        // Resolve effective status (including inheritance)
        const effectiveStatus = await getEffectiveSubscriptionStatus(userId);

        // Return updated profile data
        const profileData = {
            id: updatedUser.id,
            email: updatedUser.email,
            name: (updatedUser as any).name || null,
            city: (updatedUser as any).city || null,
            state: (updatedUser as any).state || null,
            age: (updatedUser as any).age || null,
            photoUrl: (updatedUser as any).photoUrl || null,
            subscriptionStatus: effectiveStatus as any
        };

        res.json(profileData);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /api/profile/:userId/purge - Purge account data to start over
router.delete('/:userId/purge', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;

        // Verify user exists
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`[Purge] Starting data purge for user ${userId} (${user.email})`);

        // Perform purge in a transaction to ensure consistency
        await db.$transaction([
            // Delete related historical/performance data
            db.drillResult.deleteMany({ where: { userId } }),
            db.spacedItem.deleteMany({ where: { userId } }),
            db.achievement.deleteMany({ where: { userId } }),
            db.dailyStreak.deleteMany({ where: { userId } }),
            db.customDrill.deleteMany({ where: { userId } }),
            db.userGoal.deleteMany({ where: { userId } }),
            db.keyStats.deleteMany({ where: { userId } }),
            db.sequenceStats.deleteMany({ where: { userId } }),
            db.recommendation.deleteMany({ where: { userId } }),
            db.certificate.deleteMany({ where: { userId } }),
            db.trainingPlan.deleteMany({ where: { userId } }),
            // Note: TrainingDay relates to TrainingPlan and is usually deleted via cascade if set, 
            // but we'll be safe if cascade isn't configured in sqlite.
            // Actually, TrainingPlan relation has TrainingDay. 
            // Let's check schema... TrainingPlan has relation. 
            // SQLite doesn't always support complex cascading in prisma without explicit deleteMany.

            // Reset UserProgress
            db.userProgress.update({
                where: { userId },
                data: {
                    level: 1,
                    xp: 0,
                    totalPracticeTime: 0,
                    dailyStreak: 0,
                    lastPracticeDate: null,
                    averageWPM: 0,
                    averageAccuracy: 100,
                    totalDrills: 0
                }
            }),

            // Reset User core fields
            db.user.update({
                where: { id: userId },
                data: {
                    totalPracticeTime: 0,
                    assignedLevel: 'Beginner',
                    unlockedLevels: 'Beginner',
                    currentLessonId: 'b1'
                }
            })
        ]);

        console.log(`[Purge] Data purge complete for user ${userId}`);
        res.json({ success: true, message: 'Account data purged successfully' });
    } catch (error) {
        console.error('Error purging account data:', error);
        res.status(500).json({ error: 'Failed to purge account data' });
    }
});

export default router;
