import { Router } from 'express';
import type { AnalyticsData, ProgressEntry } from '@shared/analytics';

const router = Router();

// In-memory analytics store (replace with database in production)
const analyticsStore: Record<string, AnalyticsData> = {};

// GET analytics for a user
router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    // Initialize if doesn't exist
    if (!analyticsStore[userId]) {
        analyticsStore[userId] = {
            totalLessonsCompleted: 0,
            totalPracticeTime: 0,
            averageWPM: 0,
            averageAccuracy: 0,
            bestWPM: 0,
            currentStreak: 0,
            progressHistory: [],
            weakKeys: {}
        };
    }

    res.json(analyticsStore[userId]);
});

// POST new progress entry
router.post('/:userId/entry', (req, res) => {
    const { userId } = req.params;
    const entry: ProgressEntry = req.body;

    if (!analyticsStore[userId]) {
        analyticsStore[userId] = {
            totalLessonsCompleted: 0,
            totalPracticeTime: 0,
            averageWPM: 0,
            averageAccuracy: 0,
            bestWPM: 0,
            currentStreak: 0,
            progressHistory: [],
            weakKeys: {}
        };
    }

    const analytics = analyticsStore[userId];

    // Add to history
    analytics.progressHistory.push(entry);

    // Update stats
    if (entry.passed) {
        analytics.totalLessonsCompleted++;
    }

    // Recalculate averages
    const allEntries = analytics.progressHistory;
    analytics.averageWPM = Math.round(
        allEntries.reduce((sum, e) => sum + e.wpm, 0) / allEntries.length
    );
    analytics.averageAccuracy = Math.round(
        allEntries.reduce((sum, e) => sum + e.accuracy, 0) / allEntries.length
    );

    // Update best WPM
    analytics.bestWPM = Math.max(analytics.bestWPM, entry.wpm);

    // Calculate streak (simplified - consecutive days)
    analytics.currentStreak = calculateStreak(allEntries);

    res.json(analytics);
});

// POST update weak keys
router.post('/:userId/weak-keys', (req, res) => {
    const { userId } = req.params;
    const { errorMap } = req.body;

    if (!analyticsStore[userId]) {
        analyticsStore[userId] = {
            totalLessonsCompleted: 0,
            totalPracticeTime: 0,
            averageWPM: 0,
            averageAccuracy: 0,
            bestWPM: 0,
            currentStreak: 0,
            progressHistory: [],
            weakKeys: {}
        };
    }

    // Merge error maps
    const analytics = analyticsStore[userId];
    for (const [key, count] of Object.entries(errorMap)) {
        analytics.weakKeys[key] = (analytics.weakKeys[key] || 0) + (count as number);
    }

    res.json(analytics);
});

// Helper function to calculate streak
function calculateStreak(entries: ProgressEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = today;

    for (const entry of sortedEntries) {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0 || daysDiff === 1) {
            if (daysDiff === 1) {
                streak++;
                currentDate = entryDate;
            }
        } else {
            break;
        }
    }

    // Check if practiced today
    const lastEntry = sortedEntries[0];
    const lastEntryDate = new Date(lastEntry.timestamp);
    lastEntryDate.setHours(0, 0, 0, 0);
    if (lastEntryDate.getTime() === today.getTime()) {
        streak++;
    }

    return streak;
}

export default router;
