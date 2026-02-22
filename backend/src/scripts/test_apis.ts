import prisma from '../lib/db';

async function testOrgs(userId: string) {
    console.log('--- Testing Orgs Query ---');
    try {
        const memberships = await prisma.orgMember.findMany({
            where: { userId },
            include: {
                org: {
                    include: {
                        _count: {
                            select: { members: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const orgs = memberships.map(m => ({
            ...m.org,
            role: m.role
        }));
        console.log('Success, orgs count:', orgs.length);
        console.log(JSON.stringify(orgs, null, 2));
    } catch (e: any) {
        console.error('Orgs Query Error:', e.message);
    }
}

async function main() {
    const userId = "1fb30c30-fbb0-415c-b55b-ae1b8fdb7d8c";
    await testOrgs(userId);
}

main().then(() => prisma.$disconnect());
