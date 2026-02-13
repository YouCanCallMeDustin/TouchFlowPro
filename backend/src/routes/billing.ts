import express from 'express';
import Stripe from 'stripe';
import prisma from '../lib/db';
import { authenticateToken } from '../middleware/auth';
import { requireOrgRole } from '../middleware/orgAuth';
import { z } from 'zod';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
} as any);

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// POST /api/billing/checkout
// Create a checkout session for upgrading to Pro/Enterprise
router.post('/checkout', authenticateToken, requireOrgRole(['OWNER']), async (req, res) => {
    try {
        const { orgId } = (req as any).user; // middleware doesn't strictly type orgId on user, but we usually grab it from body/params
        // Fix: Use body orgId as per spec, but verify ownership
        const body = z.object({
            orgId: z.string(),
            planTier: z.enum(['PRO', 'ENTERPRISE']),
            seats: z.number().optional()
        }).parse(req.body);

        // Check ownership/permissions for this specific org
        const membership = await prisma.orgMember.findFirst({
            where: { orgId: body.orgId, userId: (req as any).user.id, role: 'OWNER' }
        });
        if (!membership) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not an owner of this org' } });

        const org = await prisma.organization.findUnique({ where: { id: body.orgId } });
        if (!org) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Org not found' } });

        // Determine Price ID
        const priceId = body.planTier === 'PRO'
            ? process.env.STRIPE_PRICE_PRO
            : process.env.STRIPE_PRICE_ENTERPRISE;

        if (!priceId) {
            return res.status(500).json({ error: { code: 'CONFIG_ERROR', message: 'Stripe prices not configured' } });
        }

        // Determine Quantity (Seats)
        // Pro: Defaults to 20 or input? Spec said: default seats = current members or 5 min.
        // Actually, subscription usually has "per seat" pricing or "flat tier" pricing.
        // Let's assume Flat Tier pricing for now based on previous simple model (Free=5, Pro=20, Ent=100)
        // OR Per-Seat pricing. The requirements were "PRO and ENTERPRISE are paid subscriptions" and "Seat limits are enforced based on Stripe subscription quantity or tier".
        // Let's go with Fixed Tiers for simplicity unless "quantity" is explicitly part of the Price.
        // If the Price is "per unit", we pass quantity. If it's "flat fee", quantity is 1.
        // Let's assume Flat Fee for the "Tier" which *includes* the seat limit.
        // If Price is set to recurring, quantity 1.

        let quantity = 1;
        // If the user wants per-seat billing, they would set quantity = seats.
        // For this implementation, we will treat it as a Flat Subscription for the Tier.

        // If customer already exists, reuse.
        let customerId = org.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: (req as any).user.email, // Use owner's email as default
                metadata: { orgId: org.id }
            });
            customerId = customer.id;
            await prisma.organization.update({
                where: { id: org.id },
                data: { stripeCustomerId: customerId } as any
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: quantity,
                },
            ],
            success_url: `${APP_URL}/orgs?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${APP_URL}/orgs?canceled=true`,
            subscription_data: {
                metadata: { orgId: org.id, planTier: body.planTier }
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// POST /api/billing/portal
// Create a billing portal session
router.post('/portal', authenticateToken, requireOrgRole(['OWNER']), async (req, res) => {
    try {
        const { orgId } = z.object({ orgId: z.string() }).parse(req.body);

        // Check permission
        const membership = await prisma.orgMember.findFirst({
            where: { orgId, userId: (req as any).user.id, role: 'OWNER' }
        });
        if (!membership) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not an owner' } });

        const org = await prisma.organization.findUnique({ where: { id: orgId } });
        if (!org || !org.stripeCustomerId) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'No billing account found' } });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: org.stripeCustomerId,
            return_url: `${APP_URL}/orgs`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Portal error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// Webhook handler moved to src/routes/webhooks.ts

export default router;
