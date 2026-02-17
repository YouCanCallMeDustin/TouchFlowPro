import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SQLITE_DB_PATH = process.env.SQLITE_DATABASE_URL
    ? process.env.SQLITE_DATABASE_URL.replace('file:', '')
    : path.join(process.cwd(), 'dev.db');

const postgresPrisma = new PrismaClient();

async function migrate() {
    console.log(`Starting migration from SQLite (${SQLITE_DB_PATH}) to Neon Postgres...`);

    let sqlite;
    try {
        sqlite = new Database(SQLITE_DB_PATH, { readonly: true });
        console.log('Connected to SQLite.');
    } catch (error) {
        console.error('Failed to connect to SQLite:', error);
        process.exit(1);
    }

    try {
        await postgresPrisma.$connect();
        console.log('Connected to Neon Postgres.');
    } catch (error) {
        console.error('Failed to connect to Postgres. Ensure DATABASE_URL is set correctly and Neon is accessible.');
        process.exit(1);
    }

    const tables = [
        'User',
        'Organization',
        'OrgMember',
        'OrgInvite',
        'TrainingPlan',
        'TrainingDay',
        'DrillResult',
        'SessionDetails',
        'SpacedItem',
        'Achievement',
        'DailyStreak',
        'CustomDrill',
        'UserGoal',
        'UserPreferences',
        'KeyStats',
        'SequenceStats',
        'UserProgress',
        'Recommendation',
        'DailyChallenge',
        'Certificate',
        'UserSettings',
        'GameScore'
    ];

    const summary: Record<string, { sqlite: number; postgres: number }> = {};

    for (const table of tables) {
        console.log(`Migrating table: ${table}...`);

        // Get rows from SQLite
        let rows: any[] = [];
        try {
            rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        } catch (error) {
            console.warn(`Could not read table ${table} from SQLite. It might not exist. Skipping.`);
            continue;
        }

        let migratedCount = 0;

        // Batching for performance
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);

            await Promise.all(batch.map(async (row) => {
                // Pre-process row dates (SQLite stores them as strings)
                const data = { ...row };
                for (const key in data) {
                    if (typeof data[key] === 'string' && (key.endsWith('At') || key.endsWith('Date') || key === 'timestamp' || key === 'expiresAt' || key === 'nextReview' || key === 'currentPeriodEnd' || key === 'testDate' || key === 'startDate' || key === 'endDate')) {
                        if (data[key]) data[key] = new Date(data[key]);
                    }
                    // Handle booleans (SQLite stores them as 0/1)
                    if (typeof data[key] === 'number' && (key === 'completed' || key === 'soundEnabled' || key === 'practiceReminders' || key === 'dismissed' || key === 'reduceMotion' || key === 'strictAccuracy' || key === 'autoPauseIdle' || key === 'storeRawLogsPractice' || key === 'storeRawLogsCurriculum')) {
                        data[key] = data[key] === 1;
                    }
                }

                try {
                    // @ts-ignore - dynamic model access
                    await postgresPrisma[table.charAt(0).toLowerCase() + table.slice(1)].upsert({
                        where: { id: data.id },
                        update: data,
                        create: data,
                    });
                    migratedCount++;
                } catch (err) {
                    console.error(`Error migrating ${table} row ID ${data.id}:`, err);
                }
            }));

            console.log(`Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} for ${table}`);
        }

        summary[table] = { sqlite: rows.length, postgres: migratedCount };
    }

    console.log('\n--- Migration Summary ---');
    console.table(summary);

    await postgresPrisma.$disconnect();
    sqlite.close();
    console.log('Migration completed.');
}

migrate().catch(console.error);
