import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-02-24.acacia' as any,
});

async function reconcile() {
    console.log('Starting Stripe reconciliation for organizations...');

    const orgs = await prisma.organization.findMany({
        where: {
            stripeSubscriptionId: { not: null }
        }
    });

    console.log(`Found ${orgs.length} organizations with subscription IDs.`);

    for (const org of orgs) {
        console.log(`Processing Org: ${org.name} (${org.id})...`);
        try {
            const sub = await stripe.subscriptions.retrieve(org.stripeSubscriptionId!);

            const priceId = (sub as any).items.data[0].price.id;
            const status = sub.status;

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

            await prisma.organization.update({
                where: { id: org.id },
                data: {
                    planTier,
                    seatLimit,
                    stripePriceId: priceId,
                    planStatus: status.toUpperCase(),
                    currentPeriodEnd: new Date((sub as any).current_period_end * 1000)
                }
            });
            console.log(`Updated ${org.name}: Tier=${planTier}, Status=${status}`);
        } catch (error: any) {
            console.error(`Failed to reconcile ${org.name}:`, error.message);
        }
    }

    console.log('Reconciliation completed.');
    await prisma.$disconnect();
}

reconcile().catch(console.error);
