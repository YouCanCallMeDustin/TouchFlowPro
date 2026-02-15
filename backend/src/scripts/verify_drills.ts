
import prisma from '../lib/db';

async function main() {
    console.log('Verifying Drill Results...');

    // Get most recent user (likely the one active)
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!user) {
        console.log('No users found.');
        return;
    }

    console.log(`Checking results for user: ${user.email} (${user.id})`);

    const results = await prisma.drillResult.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
        take: 10
    });

    console.log('Recent Drill Results:');
    results.forEach(r => {
        console.log(`- DrillID: "${r.drillId}" | Mode: ${r.mode} | Time: ${r.timestamp}`);
    });

    // Check specifically for b1-v0
    const specific = await prisma.drillResult.findFirst({
        where: { userId: user.id, drillId: 'b1-v0' }
    });

    if (specific) {
        console.log('✅ Found b1-v0!');
    } else {
        console.log('❌ Did NOT find b1-v0.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
