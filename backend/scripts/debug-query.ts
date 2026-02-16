
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging Auth Query ---');
    const email = 'dustinshoemake@hotmail.com';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`User ID: ${user.id}`);

    // Simulation of the query in auth.ts
    console.log('Running PRO member query...');
    const proMember = await prisma.orgMember.findFirst({
        where: {
            userId: user.id,
            org: {
                planStatus: 'ACTIVE',
                planTier: 'PRO'
            }
        },
        include: { org: true }
    });

    if (proMember) {
        console.log('SUCCESS: Found PRO member record');
        console.log(`Org: ${proMember.org.name} (${proMember.org.id})`);
        console.log(`Plan: ${proMember.org.planTier}`);
    } else {
        console.log('FAILURE: Did NOT find PRO member record');

        // Debug why
        const anyMember = await prisma.orgMember.findFirst({
            where: { userId: user.id },
            include: { org: true }
        });
        if (anyMember) {
            console.log('Found generic membership:');
            console.log(`Org: ${anyMember.org.name}`);
            console.log(`PlanTier: ${anyMember.org.planTier} (Type: ${typeof anyMember.org.planTier})`);
            console.log(`PlanStatus: ${anyMember.org.planStatus} (Type: ${typeof anyMember.org.planStatus})`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
