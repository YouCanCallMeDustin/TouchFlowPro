import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { resolveResourcePath } from './pathUtils';

// 1. Resolve Path First
const discoveredDbPath = resolveResourcePath('database');
let dbUrl = process.env.DATABASE_URL || `file:${discoveredDbPath}`;

// Force absolute path for SQLite relative URLs
if (dbUrl.startsWith('file:./') || dbUrl.startsWith('file:../')) {
    console.log(`[Prisma] Resolving relative DB URL: ${dbUrl}`);
    dbUrl = `file:${discoveredDbPath}`;
}

// Ensure the path starts with file:/// if it's an absolute Linux path for better compatibility
if (dbUrl.startsWith('file:/') && !dbUrl.startsWith('file:///')) {
    dbUrl = dbUrl.replace('file:/', 'file:///');
}

console.log(`[Prisma] Target DB URL: ${dbUrl}`);

// 2. Instantiate with explicit datasource URL
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ],
});

// 3. Event Listeners
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

prisma.$connect()
    .then(() => console.log('Prisma connected successfully'))
    .catch((e) => console.error('Prisma connection error:', e));

export default prisma;
