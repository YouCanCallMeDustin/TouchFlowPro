import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { resolveResourcePath } from './pathUtils';

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ],
});

prisma.$on('query', (e) => {
    // console.log('Query: ' + e.query);
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

const discoveredDbPath = resolveResourcePath('database');
let dbUrl = process.env.DATABASE_URL || `file:${discoveredDbPath}`;

// If it's a relative SQLite path, force it to be absolute based on discovery
if (dbUrl.startsWith('file:./') || dbUrl.startsWith('file:../')) {
    console.log(`[Prisma] Resolving relative DB URL: ${dbUrl}`);
    dbUrl = `file:${discoveredDbPath}`;
}

console.log(`[Prisma] Initializing with DB URL: ${dbUrl}`);

prisma.$connect()
    .then(() => console.log('Prisma connected successfully'))
    .catch((e) => console.error('Prisma connection error:', e));

export default prisma;
