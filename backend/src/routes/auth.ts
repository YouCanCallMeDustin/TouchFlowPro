import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod'; // Import zod if needed for catch block, though middleware handles it? No, middleware handles `next(err)`. I need to pass errors to next().
import prisma from '../lib/db';
import { JWT_SECRET } from '../config';
import { loginSchema, registerSchema } from '../lib/validation';
import { syncUserWithStripe } from '../lib/stripeSync';
import { getEffectiveSubscriptionStatus } from '../lib/subscription';

const router = Router();
// JWT_SECRET imported from config

// POST /signup
router.post('/signup', async (req, res, next) => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                error: { code: 'EMAIL_EXISTS', message: 'Email already exists' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                id: uuidv4(),
                email,
                passwordHash: hashedPassword,
                assignedLevel: 'Beginner',
                unlockedLevels: 'Beginner',
                currentLessonId: 'b1',
                createdAt: new Date()
            }
        });

        // Trigger Stripe Sync proactively
        await syncUserWithStripe(newUser.id, email);

        // Refetch user to get updated subscription status if sync worked
        const updatedUser = await prisma.user.findUnique({ where: { id: newUser.id } }) || newUser;

        const token = jwt.sign(
            { id: updatedUser.id, email: updatedUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Resolve effective status (including inheritance)
        const effectiveStatus = await getEffectiveSubscriptionStatus(updatedUser.id);

        res.status(201).json({
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                assignedLevel: updatedUser.assignedLevel,
                currentLessonId: updatedUser.currentLessonId,
                subscriptionStatus: effectiveStatus as any,
                subscriptionEndDate: updatedUser.subscriptionEndDate
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.passwordHash) {
            console.warn(`[AuthRoute] Login failed: User not found or no password hash for ${email}`);
            return res.status(401).json({
                error: { code: 'AUTH_FAILED', message: 'Invalid email or password' }
            });
        }

        console.log(`[AuthRoute] Found user ${user.id}, verifying password...`);

        const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordCorrect) {
            console.warn(`[AuthRoute] Invalid password for ${email}`);
            return res.status(401).json({
                error: { code: 'AUTH_FAILED', message: 'Invalid email or password' }
            });
        }

        console.log(`[AuthRoute] Password valid for ${email}. Triggering Stripe Sync...`);

        // Trigger Stripe Sync proactively - but NON-BLOCKING to prevent login failures
        syncUserWithStripe(user.id, user.email).catch(err => {
            console.error('[AuthRoute] Background Stripe Sync failed:', err);
        });

        console.log(`[AuthRoute] Fetching fresh user data...`);
        // Refetch user to get updated status
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } }) || user;

        console.log(`[AuthRoute] Signing token...`);
        const token = jwt.sign(
            { id: updatedUser.id, email: updatedUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`[AuthRoute] Resolving effective status...`);
        // Resolve effective status (including inheritance)
        const effectiveStatus = await getEffectiveSubscriptionStatus(updatedUser.id);

        console.log(`[AuthRoute] Login successful for ${email}`);

        res.json({
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                assignedLevel: updatedUser.assignedLevel,
                currentLessonId: updatedUser.currentLessonId,
                subscriptionStatus: effectiveStatus as any,
                subscriptionEndDate: updatedUser.subscriptionEndDate
            }
        });
    } catch (error) {
        console.error('[AuthRoute] Unexpected error during login logic:', error);
        next(error);
    }
});

// GET /me
router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Proactive sync if local status is free
        if (user.subscriptionStatus === 'free') {
            await syncUserWithStripe(user.id, user.email);
            // Refetch is handled below by reloading local data if needed, 
            // but for simplicity let's just refetch now.
        }

        const freshUser = await prisma.user.findUnique({ where: { id: user.id } }) || user;

        // Resolve effective status (including inheritance)
        const effectiveStatus = await getEffectiveSubscriptionStatus(user.id);

        const responseData = {
            id: freshUser.id,
            email: freshUser.email,
            name: (freshUser as any).name || null,
            assignedLevel: freshUser.assignedLevel,
            currentLessonId: freshUser.currentLessonId,
            subscriptionStatus: effectiveStatus as any,
            subscriptionEndDate: freshUser.subscriptionEndDate
        };

        res.json(responseData);
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
});

export default router;
