import prisma from './db';
import stripe from './stripe';
import { v4 as uuidv4 } from 'uuid';

/**
 * Synchronizes a local user account with their existing Stripe subscription status.
 * Useful for restoring subscriptions after a database reset or initial signup of existing customers.
 */
export async function syncUserWithStripe(userId: string, email: string) {
    try {
        console.log(`[StripeSync] Starting sync for ${email} (${userId})`);

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.warn(`[StripeSync] User ${userId} not found in database.`);
            return null;
        }

        let stripeCustomerId = user.stripeCustomerId;

        // 1. If no Stripe Customer ID, try to find one by email
        if (!stripeCustomerId) {
            console.log(`[StripeSync] Searching for Stripe customer by email: ${email}`);
            const customers = await stripe.customers.list({
                email: email,
                limit: 1
            });

            if (customers.data.length > 0) {
                stripeCustomerId = customers.data[0].id;
                console.log(`[StripeSync] Found Stripe customer ${stripeCustomerId} for ${email}`);

                await prisma.user.update({
                    where: { id: userId },
                    data: { stripeCustomerId }
                });
            } else {
                console.log(`[StripeSync] No Stripe customer found for ${email}`);
                return { status: user.subscriptionStatus, updated: false };
            }
        }

        // 2. Fetch active subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId!,
            status: 'active',
            expand: ['data.items.data.price']
        });

        if (subscriptions.data.length === 0) {
            console.log(`[StripeSync] No active subscriptions for ${email}`);
            // If local status is not free but Stripe has nothing, we might want to downgrade,
            // but for now let's just return current status unless we're sure.
            return { status: user.subscriptionStatus, updated: false };
        }

        const sub = subscriptions.data[0];
        const priceId = sub.items.data[0].price.id;

        // 3. Determine Plan Status
        let status = 'free';
        let planTier = 'FREE';
        let seatLimit = 1;

        if (priceId === process.env.STRIPE_PRICE_STARTER) {
            status = 'starter';
            planTier = 'FREE';
            seatLimit = 1;
        } else if (priceId === process.env.STRIPE_PRICE_TEAM_PRO || priceId === process.env.STRIPE_PRO_PRICE_ID) {
            status = 'pro';
            planTier = 'PRO';
            seatLimit = 10;
        } else if (priceId === process.env.STRIPE_PRICE_TEAM_ENTERPRISE) {
            status = 'enterprise';
            planTier = 'ENTERPRISE';
            seatLimit = 100;
        }

        console.log(`[StripeSync] Identified plan: ${status} Tier: ${planTier}`);

        // 4. Update User Status
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: status,
                // If they were Starter but now Pro, or vice versa
            }
        });

        // 5. Handle Organization for Team Plans
        if (status === 'pro' || status === 'enterprise') {
            console.log(`[StripeSync] Handling Organization for team plan...`);

            // Try to find if this Stripe Customer is linked to any Org already
            let org = await (prisma.organization as any).findFirst({
                where: { stripeCustomerId: stripeCustomerId }
            });

            if (!org) {
                // Try to find if user is already an admin of an org (maybe ID mismatch)
                const membership = await prisma.orgMember.findFirst({
                    where: { userId: userId, role: 'ADMIN' },
                    include: { org: true }
                });
                if (membership) {
                    org = membership.org;
                }
            }

            if (!org) {
                // Auto-create Organization
                console.log(`[StripeSync] Auto-creating organization for ${email}`);
                org = await (prisma.organization as any).create({
                    data: {
                        id: uuidv4(),
                        name: `${user.name || email.split('@')[0].toUpperCase()}'s Team`,
                        planTier: planTier,
                        seatLimit: seatLimit,
                        stripeCustomerId: stripeCustomerId,
                        stripeSubscriptionId: sub.id,
                        stripePriceId: priceId,
                        planStatus: sub.status.toUpperCase(),
                        currentPeriodEnd: new Date((sub as any).current_period_end * 1000)
                    }
                });

                // Link User as ADMIN
                await prisma.orgMember.create({
                    data: {
                        id: uuidv4(),
                        orgId: (org as any).id,
                        userId: userId,
                        role: 'ADMIN'
                    }
                });
                console.log(`[StripeSync] Created Org ${(org as any).id} and linked user as ADMIN`);
            } else {
                // Update existing Org
                console.log(`[StripeSync] Updating existing organization ${(org as any).id}`);
                await (prisma.organization as any).update({
                    where: { id: (org as any).id },
                    data: {
                        planTier: planTier,
                        seatLimit: seatLimit,
                        stripeCustomerId: stripeCustomerId, // Ensure it's linked
                        stripeSubscriptionId: sub.id,
                        stripePriceId: priceId,
                        planStatus: sub.status.toUpperCase(),
                        currentPeriodEnd: new Date((sub as any).current_period_end * 1000)
                    }
                });
            }
        }

        return { status, updated: true };

    } catch (error) {
        console.error('[StripeSync] Critical error during synchronization:', error);
        return null;
    }
}
