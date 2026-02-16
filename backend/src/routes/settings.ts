import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../lib/db';
import { updateSettingsSchema } from '../lib/validation';
import { authenticateToken } from '../middleware/auth';
import { getEffectiveSubscriptionStatus } from '../lib/subscription';

const router = Router();

// GET /api/me/settings
router.get('/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        let settings = await (db as any).userSettings.findUnique({
            where: { userId }
        });

        if (!settings) {
            // Create default settings if not exists
            settings = await (db as any).userSettings.create({
                data: { userId }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch settings' } });
    }
});

// PUT /api/me/settings
router.put('/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Validate request body
        const result = updateSettingsSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid settings data',
                    details: (result as any).error.errors
                }
            });
        }

        const data = result.data;

        // Upsert settings
        const settings = await (db as any).userSettings.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data
            }
        });

        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update settings' } });
    }
});

// GET /api/me/export
router.get('/export', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const prisma = db as any;

        // Fetch all user data in parallel
        const [
            user,
            settings,
            preferences,
            progress,
            history,
            plans,
            achievements,
            customDrills,
            stats
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, email: true, name: true, createdAt: true,
                    totalPracticeTime: true, subscriptionStatus: true
                }
            }),
            prisma.userSettings.findUnique({ where: { userId } }),
            prisma.userPreferences.findUnique({ where: { userId } }),
            prisma.userProgress.findUnique({ where: { userId } }),
            prisma.drillResult.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } }),
            prisma.trainingPlan.findMany({
                where: { userId },
                include: { days: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.achievement.findMany({ where: { userId } }),
            prisma.customDrill.findMany({ where: { userId } }),
            prisma.keyStats.findMany({ where: { userId } })
        ]);

        // Resolve effective status (including inheritance)
        const effectiveStatus = await getEffectiveSubscriptionStatus(userId);

        const exportData = {
            metadata: {
                version: '1.0',
                exportDate: new Date().toISOString(),
                userId: userId
            },
            profile: {
                ...user,
                subscriptionStatus: effectiveStatus
            },
            settings: {
                ...settings,
                preferences
            },
            progress,
            history,
            trainingPlans: plans,
            achievements,
            library: {
                customDrills
            },
            analytics: {
                keyStats: stats
            }
        };

        res.json(exportData);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to export data' } });
    }
});

export default router;
