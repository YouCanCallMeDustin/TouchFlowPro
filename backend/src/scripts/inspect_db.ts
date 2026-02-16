
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Comprehensive Database Inspection ---');
    const totalResults = await prisma.drillResult.count();
    console.log(`Total DrillResults: ${totalResults}`);

    const users = await prisma.user.findMany({
        select: { id: true, email: true, createdAt: true }
    });
    console.log(`Total Users: ${users.length}`);

    for (const user of users) {
        const userResultsCount = await prisma.drillResult.count({
            where: { userId: user.id }
        });
        const dates = await prisma.drillResult.findMany({
            where: { userId: user.id },
            select: { timestamp: true },
            orderBy: { timestamp: 'asc' }
        });

        console.log(`User: ${user.email || 'GUEST'} (${user.id})`);
        console.log(`  Created: ${user.createdAt.toISOString()}`);
        console.log(`  Drills Count: ${userResultsCount}`);

        if (userResultsCount > 0) {
            console.log(`  First Drill: ${dates[0].timestamp.toISOString()}`);
            console.log(`  Last Drill: ${dates[dates.length - 1].timestamp.toISOString()}`);

            const uniqueDates = new Set(dates.map(d => d.timestamp.toISOString().split('T')[0]));
            console.log(`  Unique Days: ${uniqueDates.size}`);
            console.log(`  Days: ${Array.from(uniqueDates).join(', ')}`);
        }
        console.log('------------------');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
