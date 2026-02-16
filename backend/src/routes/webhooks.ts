import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-02-24.acacia' as any,
});

// Match the raw body parser to the content type Stripe sends
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !endpointSecret) throw new Error('Missing signature or secret');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        // Return 200 to Stripe even on error to prevent retries if it's a signature mismatch, 
        // but 400 is strictly correct. Stripe retries on non-2xx.
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.updated':
            case 'customer.subscription.created': {
                const sub = event.data.object as Stripe.Subscription;
                // Check if this is an Organization subscription (has orgId in metadata or mapped to an Org)
                const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
                const org = await prisma.organization.findFirst({ where: { stripeCustomerId: customerId } });

                if (org) {
                    await handleOrgSubscriptionUpdate(sub, org);
                } else {
                    // Legacy User subscription logic? Or just ignore?
                    // Existing code didn't handle update/create for users, only deleted?
                }
                break;
            }
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.metadata?.userId && !session.metadata.orgId) {
                    // Update User Subscription (Starter)
                    await prisma.user.update({
                        where: { id: session.metadata.userId },
                        data: { subscriptionStatus: 'starter' }
                    });
                }
                // Handle Org Checkout
                if (session.subscription) {
                    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
                    const sub = await stripe.subscriptions.retrieve(subId);

                    // Check if Org ID was passed in metadata (Preferred)
                    if (session.metadata?.orgId) {
                        const org = await prisma.organization.findUnique({ where: { id: session.metadata.orgId } });
                        if (org) {
                            // Link customer to org if not already
                            if (!org.stripeCustomerId) {
                                const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
                                await prisma.organization.update({
                                    where: { id: org.id },
                                    data: { stripeCustomerId: customerId }
                                });
                            }
                            await handleOrgSubscriptionUpdate(sub, org);
                        }
                    } else {
                        // Fallback: look up by customer ID if we already know it
                        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
                        const org = await prisma.organization.findFirst({ where: { stripeCustomerId: customerId } });
                        if (org) {
                            await handleOrgSubscriptionUpdate(sub, org);
                        }
                    }
                }
                break;
            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

                // Check if it's an Org
                const org = await prisma.organization.findFirst({ where: { stripeCustomerId: customerId } });
                if (org) {
                    await prisma.organization.update({
                        where: { id: org.id },
                        data: {
                            planTier: 'FREE',
                            seatLimit: 5,
                            planStatus: 'CANCELED',
                            stripeSubscriptionId: null,
                            stripePriceId: null
                        }
                    });
                } else {
                    // User subscription
                    await prisma.user.update({
                        where: { stripeCustomerId: customerId },
                        data: { subscriptionStatus: 'free', subscriptionEndDate: new Date() }
                    });
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error('Error handling webhook event:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }

    res.json({ received: true });
});

async function handleOrgSubscriptionUpdate(sub: any, org: any) {
    const priceId = sub.items.data[0].price.id;
    const status = sub.status;

    let planTier = org.planTier;
    let seatLimit = org.seatLimit;

    // Map Price ID to Tier
    if (priceId === process.env.STRIPE_PRICE_TEAM_PRO || priceId === process.env.STRIPE_PRO_PRICE_ID) {
        planTier = 'PRO';
        seatLimit = 10;
    } else if (priceId === process.env.STRIPE_PRICE_TEAM_ENTERPRISE) {
        planTier = 'ENTERPRISE';
        seatLimit = 100;
    }

    // Downgrade if not active/trialing
    if (['canceled', 'unpaid', 'past_due'].includes(status)) {
        if (status === 'canceled' || status === 'unpaid') {
            planTier = 'FREE';
            seatLimit = 5;
        }
    }

    await prisma.organization.update({
        where: { id: org.id },
        data: {
            planTier,
            seatLimit,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            planStatus: status.toUpperCase(),
            currentPeriodEnd: new Date(sub.current_period_end * 1000)
        } as any
    });
}

export default router;
