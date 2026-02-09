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
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.metadata?.userId) {
                    await prisma.user.update({
                        where: { id: session.metadata.userId },
                        data: { subscriptionStatus: 'pro' }
                    });
                }
                break;
            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
                await prisma.user.update({
                    where: { stripeCustomerId: customerId },
                    data: { subscriptionStatus: 'cancelled', subscriptionEndDate: new Date() }
                });
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

export default router;
