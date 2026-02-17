import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Simple initialization for cloud-hosted Postgres
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

// Programmatic Initialization / Self-Healing for Postgres
async function initializeDb() {
    try {
        console.log('[Prisma] Verifying database schema...');
        // Query for the User table in Postgres
        const tables: any[] = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'User'`;

        if (tables.length === 0) {
            console.log('[Prisma] CRITICAL: User table missing in Postgres! Triggering programmatic db push...');

            const backendDir = fs.existsSync(path.join(process.cwd(), 'backend'))
                ? path.join(process.cwd(), 'backend')
                : process.cwd();

            console.log(`[Prisma] Executing push in: ${backendDir}`);

            try {
                execSync('npx prisma db push --accept-data-loss', {
                    env: { ...process.env },
                    cwd: backendDir,
                    stdio: 'inherit'
                });
                console.log('[Prisma] Programmatic db push completed.');
            } catch (pushErr: any) {
                console.error('[Prisma] DB Push command failed:', pushErr.message);
            }
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
