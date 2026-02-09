import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

prisma.$connect()
    .then(() => console.log('Prisma connected successfully'))
    .catch((e) => console.error('Prisma connection error:', e));

export default prisma;

// Types are now inferred from Prisma Client, or can be imported from @prisma/client
// export type { User, DrillResult, SpacedItem } from '@prisma/client';
