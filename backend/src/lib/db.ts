import { PrismaClient } from '@prisma/client';

// Simple initialization for cloud-hosted Postgres
// DATABASE_URL is expected to be in environment variables (handled by Prisma automatically)
const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ],
});

// Setup basic event listeners for logging
prisma.$on('info', (e) => console.log('Prisma Info: ' + e.message));
prisma.$on('warn', (e) => console.warn('Prisma Warn: ' + e.message));
prisma.$on('error', (e) => console.error('Prisma Error: ' + e.message));

// Log initialization status (secrets redacted by environment)
const maskedUrl = (process.env.DATABASE_URL || '').replace(/:([^@]+)@/, ':****@');
console.log(`[Prisma] Initializing with DB URL: ${maskedUrl}`);

export default prisma;
