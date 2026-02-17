import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

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

// In Docker (root /app), the DB is at /app/backend/prisma/dev.db
// If running from backend folder, it's at ./prisma/dev.db
const possibleDbPaths = [
    path.resolve(process.cwd(), 'backend/prisma/dev.db'),
    path.resolve(process.cwd(), 'prisma/dev.db'),
    path.resolve(__dirname, '../../../prisma/dev.db'),
    '/app/backend/prisma/dev.db'
];

let finalDbPath = possibleDbPaths[0];
for (const p of possibleDbPaths) {
    if (fs.existsSync(p)) {
        finalDbPath = p;
        break;
    }
}

const dbUrl = process.env.DATABASE_URL || `file:${finalDbPath}`;

console.log(`[Prisma] Initializing with DB URL: ${dbUrl}`);
console.log(`[Prisma] Current Working Directory: ${process.cwd()}`);
console.log(`[Prisma] __dirname: ${__dirname}`);

prisma.$connect()
    .then(() => console.log('Prisma connected successfully'))
    .catch((e) => console.error('Prisma connection error:', e));

export default prisma;

// Types are now inferred from Prisma Client, or can be imported from @prisma/client
// export type { User, DrillResult, SpacedItem } from '@prisma/client';
