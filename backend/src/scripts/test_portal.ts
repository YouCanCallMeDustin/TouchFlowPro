import stripe from '../lib/stripe';
import prisma from '../lib/db';

async function testPortal() {
    const user = await prisma.user.findFirst({
        where: { stripeCustomerId: { not: null } }
    });

    if (!user) {
        console.log('No user with stripe customer id found');
        return;
    }

    console.log(`Testing portal for customer ${user.stripeCustomerId} (user ID: ${user.id})`);

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId!,
            return_url: 'http://localhost:3000/settings',
        });
        console.log('Success:', session.url);
    } catch (e: any) {
        console.error('Stripe Portal Error:', e.message);
        console.error('Code:', e.code);
        console.error('Type:', e.type);
    }
}

testPortal().then(() => prisma.$disconnect());
