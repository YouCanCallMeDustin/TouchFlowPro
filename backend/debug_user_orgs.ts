
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'touchflowpro@gmail.com' },
    include: {
      orgMemberships: {
        include: {
          org: true
        }
      }
    }
  });

  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:');
    console.log({
      id: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
      orgs: user.orgMemberships.map(m => ({
        orgId: m.orgId,
        orgName: m.org.name,
        role: m.role,
        orgStripeCustomerId: m.org.stripeCustomerId
      }))
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
