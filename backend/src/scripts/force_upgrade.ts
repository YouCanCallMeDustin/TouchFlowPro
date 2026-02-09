import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceUpgrade() {
    const email = 'touchflowpro@gmail.com';

    console.log(`Searching for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    console.log(`Found user: ${user.id}`);
    console.log(`Current Status: ${user.subscriptionStatus}`);

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            subscriptionStatus: 'pro',
            subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
    });

    console.log('SUCCESS! User upgraded to PRO.');
    console.log(`New Status: ${updated.subscriptionStatus}`);
}

forceUpgrade()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
