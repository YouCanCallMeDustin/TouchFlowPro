import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
        {
            emit: 'event',
            level: 'error',
        },
    ],
});

prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
});

prisma.$on('info', (e) => {
    console.log('Info: ' + e.message);
});

prisma.$on('warn', (e) => {
    console.warn('Warn: ' + e.message);
});

prisma.$on('error', (e) => {
    console.error('Error: ' + e.message);
});

const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
console.log(`[Prisma] Initializing with DB URL: ${dbUrl}`);

prisma.$connect()
    .then(() => console.log('Prisma connected successfully'))
    .catch((e) => console.error('Prisma connection error:', e));

export default prisma;

// Types are now inferred from Prisma Client, or can be imported from @prisma/client
// export type { User, DrillResult, SpacedItem } from '@prisma/client';
