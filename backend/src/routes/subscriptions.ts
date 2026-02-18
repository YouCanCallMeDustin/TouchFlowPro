import express from 'express';
import stripe from '../lib/stripe';
import prisma from '../lib/db';
import { authenticateToken } from '../middleware/auth';
import { syncUserWithStripe } from '../lib/stripeSync';
import { FRONTEND_URL } from '../config';

import { getEffectiveSubscriptionStatus } from '../lib/subscription';

const router = express.Router();

// POST /api/subscriptions/verify-session
router.post('/verify-session', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { sessionId } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Verify the session belongs to this user and is paid
        if (session.metadata?.userId !== userId) {
            return res.status(403).json({ error: 'Session does not belong to this user' });
        }

        if (session.payment_status === 'paid') {
            const planType = session.metadata?.planType;
            let newStatus = 'pro';

            if (planType === 'STARTER') newStatus = 'starter';
            else if (planType === 'PRO') newStatus = 'pro';
            else if (planType === 'ENTERPRISE') newStatus = 'enterprise';

            // Update user status
            await prisma.user.update({
                where: { id: userId },
                data: { subscriptionStatus: newStatus }
            });

            // Update Organization if applicable
            if (session.metadata?.orgId) {
                const orgId = session.metadata.orgId;
                const seatLimit = planType === 'ENTERPRISE' ? 100 : 10;
                const priceId = session.line_items?.data[0]?.price?.id;

                await prisma.organization.update({
                    where: { id: orgId },
                    data: {
                        planTier: (planType || 'PRO') as any, // Cast to any to match Enum
                        seatLimit: seatLimit,
                        planStatus: 'ACTIVE',
                        stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id,
                        stripePriceId: priceId
                    } as any
                });
            }

            return res.json({ status: newStatus, updated: true });
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
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const userPromise = prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionEndDate: true }
        });

        const statusPromise = getEffectiveSubscriptionStatus(userId);

        const [user, status] = await Promise.all([userPromise, statusPromise]);

        res.json({
            subscriptionStatus: status,
            subscriptionEndDate: user?.subscriptionEndDate
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// POST /api/subscriptions/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { planType, orgId } = req.body; // planType: 'STARTER', 'PRO', 'ENTERPRISE'

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        let customerId = user.stripeCustomerId;

        // Create Stripe customer if not exists
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id }
            });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }

        let priceId;
        let successUrl = `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
        let cancelUrl = `${FRONTEND_URL}/pricing`;
        const metadata: any = { userId };

        switch (planType) {
            case 'STARTER':
                priceId = process.env.STRIPE_PRICE_STARTER;
                cancelUrl = `${FRONTEND_URL}/dashboard`; // Or wherever
                break;
            case 'PRO': // Team Pro
                priceId = process.env.STRIPE_PRICE_TEAM_PRO || process.env.STRIPE_PRO_PRICE_ID || 'price_1T1FGxIPOGZ3hiJyx8tGWxvx'; // Fallback for backward compat
                metadata.orgId = orgId;
                if (!orgId) return res.status(400).json({ error: 'Organization ID required for Pro plan' });
                break;
            case 'ENTERPRISE': // Team Enterprise
                priceId = process.env.STRIPE_PRICE_TEAM_ENTERPRISE;
                metadata.orgId = orgId;
                if (!orgId) return res.status(400).json({ error: 'Organization ID required for Enterprise plan' });
                break;
            default:
                // Default fallback to old behavior if no planType provided, or error?
                // Let's assume 'PRO' was the old default if we want backward compatibility, 
                // but better to be explicit.
                return res.status(400).json({ error: 'Invalid plan type' });
        }

        if (!priceId) {
            console.error(`[Stripe] Price ID not configured for plan: ${planType}. Check your environment variables.`);
            return res.status(500).json({
                error: {
                    message: 'Payment configuration error: Price ID not found for this plan.',
                    code: 'MISSING_PRICE_ID',
                    details: { planType }
                }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                ...metadata,
                planType
            }
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        res.status(error.status || 500).json({
            error: {
                message: error.message || 'Failed to create checkout session',
                code: error.code || 'STRIPE_ERROR',
                details: error.raw || error
            }
        });
    }
});

// Webhook is handled in routes/webhooks.ts

// POST /api/subscriptions/create-portal-session
router.post('/create-portal-session', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'No subscription found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${FRONTEND_URL}/settings`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

// POST /api/subscriptions/sync
router.post('/sync', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Use the centralized sync utility
        const result = await syncUserWithStripe(userId, user.email);

        if (!result) {
            return res.status(500).json({ error: 'Failed to sync subscription' });
        }

        res.json({
            status: result.status,
            updated: result.updated,
            message: result.updated ? 'Subscription updated' : 'Subscription already up to date'
        });

    } catch (error) {
        console.error('Error syncing subscription:', error);
        res.status(500).json({ error: 'Failed to sync subscription' });
    }
});

export default router;
