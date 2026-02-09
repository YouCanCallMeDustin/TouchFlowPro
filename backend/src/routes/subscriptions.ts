import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

import { STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, FRONTEND_URL } from '../config';

// Initialize Stripe lazily or ensure dotenv is loaded
let stripe: Stripe;
const getStripe = () => {
    if (!stripe) {
        if (!STRIPE_SECRET_KEY) {
            console.error('FATAL: Stripe Secret Key is missing in config!');
        }
        stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2025-02-24.acacia' as any,
        });
    }
    return stripe;
};

// POST /api/subscriptions/verify-session
router.post('/verify-session', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { sessionId } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Verify the session belongs to this user and is paid
        if (session.metadata?.userId !== userId) {
            return res.status(403).json({ error: 'Session does not belong to this user' });
        }

        if (session.payment_status === 'paid') {
            // Update user status
            await prisma.user.update({
                where: { id: userId },
                data: { subscriptionStatus: 'pro' }
            });
            return res.json({ status: 'pro', updated: true });
        }

        res.json({ status: 'pending', updated: false });

    } catch (error) {
        console.error('Error verifying session:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// GET /api/subscriptions/status
router.get('/status', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id; // Assuming auth middleware populates req.user
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionStatus: true, subscriptionEndDate: true }
        });

        res.json(user);
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// POST /api/subscriptions/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        let customerId = user.stripeCustomerId;

        // Create Stripe customer if not exists
        if (!customerId) {
            const customer = await getStripe().customers.create({
                email: user.email,
                metadata: { userId: user.id }
            });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }

        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: STRIPE_PRO_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/pricing`,
            metadata: {
                userId: userId
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            error: 'Failed to create checkout session',
            debug: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stripeKeyConfigured: !!STRIPE_SECRET_KEY,
                priceIdConfigured: !!STRIPE_PRO_PRICE_ID,
                priceIdValue: STRIPE_PRO_PRICE_ID ? `${STRIPE_PRO_PRICE_ID.substring(0, 5)}...` : 'missing'
            }
        });
    }
});

// Webhook is handled in routes/webhooks.ts

export default router;
