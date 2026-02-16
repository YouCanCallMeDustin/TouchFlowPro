
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging Subscription State ---');

    console.log('\n1. Checking Organization "Fastest In The World"');
    const org = await prisma.organization.findFirst({
        where: { name: 'Fastest In The World' },
        include: { members: { include: { user: true } } }
    });

    if (!org) {
        console.log('Organization not found!');
    } else {
        console.log(`Org ID: ${org.id}`);
        console.log(`Plan Tier: ${org.planTier}`);
        console.log(`Seat Limit: ${org.seatLimit}`);
        console.log('Members:');
        org.members.forEach(m => {
            console.log(` - ${m.user.email} (${m.role}) -> Status: ${m.user.subscriptionStatus}`);
        });
    }

    console.log('\n2. Checking specific users');
    const users = await prisma.user.findMany({
        where: {
            email: { in: ['touchflowpro@gmail.com', 'dustinshoemake@hotmail.com'] }
        }
    });
    users.forEach(u => {
        console.log(`User: ${u.email}, Status: ${u.subscriptionStatus}, StripeId: ${u.stripeCustomerId}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
