import { Router, Request, Response } from 'express';
import db from '../lib/db';

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

        // Return profile data
        const profileData = {
            id: user.id,
            email: user.email,
            name: (user as any).name || null,
            city: (user as any).city || null,
            state: (user as any).state || null,
            age: (user as any).age || null,
            photoUrl: (user as any).photoUrl || null,
            createdAt: user.createdAt
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

        // Return updated profile data
        const profileData = {
            id: updatedUser.id,
            email: updatedUser.email,
            name: (updatedUser as any).name || null,
            city: (updatedUser as any).city || null,
            state: (updatedUser as any).state || null,
            age: (updatedUser as any).age || null,
            photoUrl: (updatedUser as any).photoUrl || null
        };

        res.json(profileData);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
