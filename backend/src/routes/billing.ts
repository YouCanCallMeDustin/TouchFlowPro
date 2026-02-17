import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-02-24.acacia' as any,
});

/**
 * POST /api/orgs/:orgId/billing/attach
 * Manually attach a Stripe subscription to an organization.
 * Only owner/admin should call this (assuming middleware handles auth, 
 * but for this script we'll just implement the logic).
 */
router.post('/:orgId/billing/attach', async (req, res) => {
    const { orgId } = req.params;
    const { stripeCustomerId, stripeSubscriptionId } = req.body;

    try {
        if (!stripeSubscriptionId) {
            return res.status(400).json({ error: { code: 'MISSING_SUBSCRIPTION_ID', message: 'stripeSubscriptionId is required' } });
        }

        // 1. Validate with Stripe
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        if (!subscription) {
            return res.status(404).json({ error: { code: 'STRIPE_NOT_FOUND', message: 'Subscription not found in Stripe' } });
        }

        const customerId = stripeCustomerId || (typeof subscription.customer === 'string' ? subscription.customer : (subscription.customer as any).id);
        const priceId = (subscription as any).items.data[0].price.id;
        const status = subscription.status;

        // 2. Map Price ID to Tier (Keep in sync with webhooks.ts)
        let planTier = 'FREE';
        let seatLimit = 5;

        if (priceId === process.env.STRIPE_PRICE_TEAM_PRO || priceId === process.env.STRIPE_PRO_PRICE_ID) {
            planTier = 'PRO';
            seatLimit = 10;
        } else if (priceId === process.env.STRIPE_PRICE_TEAM_ENTERPRISE) {
            planTier = 'ENTERPRISE';
            seatLimit = 100;
        }

        if (['canceled', 'unpaid', 'past_due'].includes(status)) {
            planTier = 'FREE';
            seatLimit = 5;
        }

        // 3. Update Org
        const updatedOrg = await prisma.organization.update({
            where: { id: orgId },
            data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: stripeSubscriptionId,
                stripePriceId: priceId,
                planTier,
                seatLimit,
                planStatus: status.toUpperCase(),
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
            }
        });

        res.json(updatedOrg);
    } catch (error: any) {
        console.error('Error attaching billing:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
});

export default router;
