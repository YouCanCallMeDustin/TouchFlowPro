import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
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

// Clean up triple vs single slash for Linux absolute paths
if (dbUrl.startsWith('file:/') && !dbUrl.startsWith('file:///')) {
    dbUrl = dbUrl.replace('file:/', 'file:///');
}

console.log(`[Prisma] Final Target DB URL: ${dbUrl}`);

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

// 3. Setup event listeners
prisma.$on('info', (e) => console.log('Prisma Info: ' + e.message));
prisma.$on('warn', (e) => console.warn('Prisma Warn: ' + e.message));
prisma.$on('error', (e) => console.error('Prisma Error: ' + e.message));

// 4. Programmatic Initialization / Self-Healing
async function initializeDb() {
    try {
        console.log('[Prisma] Verifying database schema...');
        const tables: any[] = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='User'`;

        if (tables.length === 0) {
            console.log('[Prisma] CRITICAL: User table missing! Triggering programmatic db push...');

            // Determine where the backend folder is relative to process.cwd
            const backendDir = fs.existsSync(path.join(process.cwd(), 'backend'))
                ? path.join(process.cwd(), 'backend')
                : process.cwd();

            console.log(`[Prisma] Executing push in: ${backendDir}`);

            const output = execSync('npx prisma db push --accept-data-loss', {
                env: { ...process.env, DATABASE_URL: dbUrl },
                cwd: backendDir,
                stdio: 'inherit'
            });

            console.log('[Prisma] Programmatic db push completed successfully.');
        } else {
            console.log('[Prisma] Database schema verified (User table exists).');
        }
    } catch (error) {
        console.error('[Prisma] Failed to initialize/verify database:', error);
    }
}

// Run initialization
initializeDb();

export default prisma;
