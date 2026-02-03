import type { TypingMetrics } from './types';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Professional' | 'Specialist';

export interface PlacementResult {
    level: DifficultyLevel;
    reason: string;
    recommendedStartLesson: string;
}

export class PlacementEngine {
    /**
     * Determines the appropriate difficulty level based on assessment metrics
     */
    static calculatePlacement(metrics: TypingMetrics): PlacementResult {
        const { netWPM, accuracy } = metrics;

        // Penalize low accuracy
        const accuracyPenalty = accuracy < 85 ? 0.7 : 1.0;
        const adjustedWPM = netWPM * accuracyPenalty;

        // Determine level based on adjusted WPM
        if (adjustedWPM < 30) {
            return {
                level: 'Beginner',
                reason: `Your current speed of ${netWPM} WPM with ${accuracy}% accuracy places you in the Beginner track. We'll start with foundational skills.`,
                recommendedStartLesson: 'b1'
            };
        } else if (adjustedWPM < 60) {
            return {
                level: 'Intermediate',
                reason: `Great job! Your ${netWPM} WPM with ${accuracy}% accuracy qualifies you for Intermediate training. We'll focus on speed and complex patterns.`,
                recommendedStartLesson: 'i1'
            };
        } else {
            return {
                level: 'Professional',
                reason: `Excellent! Your ${netWPM} WPM with ${accuracy}% accuracy puts you in the Professional tier. We'll work on elite-level precision and specialized content.`,
                recommendedStartLesson: 'p1'
            };
        }
    }

    /**
     * Checks if user qualifies to level up
     */
    static canLevelUp(
        currentLevel: DifficultyLevel,
        completedLessons: string[],
        lessonScores: Record<string, TypingMetrics>
    ): { canLevelUp: boolean; reason: string } {
        const levelPrefixes: Record<string, string> = {
            'Beginner': 'b',
            'Intermediate': 'i',
            'Professional': 'p'
        };

        const specialistPrefixes = ['m', 'l', 'c', 'j', 'd', 'g'];
        const lessonsInLevel = currentLevel === 'Specialist'
            ? completedLessons.filter(id => specialistPrefixes.some(p => id.startsWith(p)))
            : completedLessons.filter(id => id.startsWith(levelPrefixes[currentLevel]));

        // Need at least 8 completed lessons
        if (lessonsInLevel.length < 8) {
            return {
                canLevelUp: false,
                reason: `Complete ${8 - lessonsInLevel.length} more lessons to unlock the next level.`
            };
        }

        // Check accuracy threshold
        const requiredAccuracy = currentLevel === 'Beginner' ? 90 : 92;
        const passedLessons = lessonsInLevel.filter(id =>
            lessonScores[id] && lessonScores[id].accuracy >= requiredAccuracy
        );

        if (passedLessons.length >= 8) {
            return {
                canLevelUp: true,
                reason: `Congratulations! You've mastered ${passedLessons.length} lessons with ${requiredAccuracy}%+ accuracy.`
            };
        }

        return {
            canLevelUp: false,
            reason: `You need ${8 - passedLessons.length} more lessons with ${requiredAccuracy}%+ accuracy to level up.`
        };
    }

    /**
     * Gets the next difficulty level
     */
    static getNextLevel(currentLevel: DifficultyLevel): DifficultyLevel | null {
        if (currentLevel === 'Beginner') return 'Intermediate';
        if (currentLevel === 'Intermediate') return 'Professional';
        if (currentLevel === 'Professional') return 'Specialist';
        return null; // Already at max level
    }
}
