import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/preferences/:userId - Get user preferences
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let preferences = await prisma.userPreferences.findUnique({
            where: { userId }
        });

        if (!preferences) {
            // Create default preferences
            preferences = await prisma.userPreferences.create({
                data: {
                    userId,
                    theme: 'default',
                    soundEnabled: true,
                    keyboardLayout: 'qwerty',
                    practiceReminders: false
                }
            });
        }

        res.json(preferences);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// PUT /api/preferences/:userId - Update preferences
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { theme, soundEnabled, keyboardLayout, practiceReminders, reminderTime } = req.body;

        const preferences = await prisma.userPreferences.upsert({
            where: { userId },
            update: {
                theme: theme !== undefined ? theme : undefined,
                soundEnabled: soundEnabled !== undefined ? soundEnabled : undefined,
                keyboardLayout: keyboardLayout !== undefined ? keyboardLayout : undefined,
                practiceReminders: practiceReminders !== undefined ? practiceReminders : undefined,
                reminderTime: reminderTime !== undefined ? reminderTime : undefined
            },
            create: {
                userId,
                theme: theme || 'default',
                soundEnabled: soundEnabled !== undefined ? soundEnabled : true,
                keyboardLayout: keyboardLayout || 'qwerty',
                practiceReminders: practiceReminders || false,
                reminderTime: reminderTime || null
            }
        });

        res.json(preferences);
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export default router;
