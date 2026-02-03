export interface ProgressEntry {
    lessonId: string;
    lessonTitle: string;
    timestamp: number;
    wpm: number;
    accuracy: number;
    errors: number;
    passed: boolean;
}

export interface AnalyticsData {
    totalLessonsCompleted: number;
    totalPracticeTime: number; // in minutes
    averageWPM: number;
    averageAccuracy: number;
    bestWPM: number;
    currentStreak: number; // consecutive days
    progressHistory: ProgressEntry[];
    weakKeys: Record<string, number>; // key -> error count
}
