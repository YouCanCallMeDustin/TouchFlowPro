import prisma from '../lib/db';
import * as fs from 'fs';

async function main() {
    const users = await prisma.user.findMany({
        include: {
            orgMemberships: {
                include: { org: true }
            }
        }
    });

    const output = users.map(u => ({
        email: u.email,
        id: u.id,
        stripeCustomerId: u.stripeCustomerId,
        subStatus: u.subscriptionStatus,
        orgsCount: u.orgMemberships.length
    }));

    fs.writeFileSync('db_check_all.json', JSON.stringify(output, null, 2));
    console.log(`Saved ${users.length} users to db_check_all.json`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
