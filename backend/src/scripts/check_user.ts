import prisma from '../lib/db';
import * as fs from 'fs';

async function main() {
    const users = await prisma.user.findMany({
        where: { subscriptionStatus: { in: ['pro', 'enterprise'] } },
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
        subEndDate: u.subscriptionEndDate,
        orgsCount: u.orgMemberships.length,
        orgs: u.orgMemberships.map(m => ({
            name: m.org.name, tier: m.org.planTier
        }))
    }));

    fs.writeFileSync('db_check.json', JSON.stringify(output, null, 2));
    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
