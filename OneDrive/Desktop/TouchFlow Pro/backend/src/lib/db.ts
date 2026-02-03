import { JSONFilePreset } from 'lowdb/node';

// Define the schema of our "database"
export interface DatabaseSchema {
    users: User[];
    drillResults: DrillResult[];
    spacedItems: SpacedItem[];
}

export interface User {
    id: string;
    email?: string;
    passwordHash?: string;
    assignedLevel: string;
    unlockedLevels: string; // Comma separated
    currentLessonId: string | null;
    createdAt: string;
}

export interface DrillResult {
    id: string;
    userId: string;
    drillId: string;
    grossWPM: number;
    netWPM: number;
    accuracy: number;
    durationMs: number;
    timestamp: string;
}

export interface SpacedItem {
    id: string;
    userId: string;
    drillId: string;
    interval: number;
    repetition: number;
    efactor: number;
    nextReview: string;
}

// Initialize the database
const defaultData: DatabaseSchema = { users: [], drillResults: [], spacedItems: [] };

// Singleton promise
let dbPromise = JSONFilePreset<DatabaseSchema>('db.json', defaultData);

export const getDb = () => dbPromise;

export default dbPromise;
