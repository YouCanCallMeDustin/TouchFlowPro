import type { Drill } from './drillLibrary';
import type { TypingMetrics } from './types';
import type { DifficultyLevel } from './placement';

export interface Lesson extends Drill {
    lessonNumber: number;
    prerequisites: string[];
    masteryThreshold: number;
    learningObjectives: string[];
    order?: number;
    xpReward?: number;
}

export interface UserProgress {
    userId: string;
    name?: string | null;
    photoUrl?: string | null;
    assignedLevel: DifficultyLevel;
    completedLessons: string[];
    lessonScores: Record<string, TypingMetrics>;
    currentLesson: string | null;
    unlockedLevels: DifficultyLevel[];
    subscriptionStatus: 'free' | 'pro' | 'cancelled';
}

export interface LessonResult {
    lessonId: string;
    passed: boolean;
    metrics: TypingMetrics;
    timestamp: Date;
}

export class Curriculum {
    /**
     * Converts a drill into a lesson with learning structure
     */
    static drillToLesson(drill: Drill, lessonNumber: number): Lesson {
        // Determine prerequisites (sequential unlocking)
        const prerequisites: string[] = [];
        if (lessonNumber > 1) {
            const prevNumber = lessonNumber - 1;
            const prefix = drill.id.charAt(0);
            prerequisites.push(`${prefix}${prevNumber}`);
        }

        // Set mastery threshold based on difficulty
        const masteryThreshold = drill.difficulty === 'Beginner' ? 85 :
            drill.difficulty === 'Intermediate' ? 88 :
                drill.difficulty === 'Professional' ? 90 : 92; // Specialist/Medical requires 92%

        // Generate learning objectives based on category
        const learningObjectives = this.generateObjectives(drill);

        // Generate Prep Phase Drills (Repeated Words)
        const warmupSteps = this.generatePrepDrills(drill.content);

        return {
            ...drill,
            lessonNumber,
            prerequisites,
            masteryThreshold,
            learningObjectives,
            warmupSteps // Override any static warmup steps
        };
    }

    /**
     * Generates prep drills based on unique words in the content
     */
    private static generatePrepDrills(content: string): { text: string; insight: string }[] {
        // 1. Clean and extract words
        const words = content
            .replace(/[^\w\s']/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(w => w.length > 0);

        // 2. Get unique words, preserving order of appearance
        const uniqueWords = Array.from(new Set(words));

        // 3. Select top 10 (or all if less than 10)
        const selectedWords = uniqueWords.slice(0, 10);

        // 4. Generate drills
        return selectedWords.map(word => {
            // Adjust repetitions based on length to prevent exhaustion
            // User Request: If >= 8 chars, repeat 5 times. Else 10.
            const repetitions = word.length >= 8 ? 5 : 10;

            const repeatedText = Array(repetitions).fill(word).join(' ');
            return {
                text: repeatedText,
                insight: `Master the rhythm of "${word}". Build muscle memory before the final test.`
            };
        });
    }

    /**
     * Generates learning objectives based on drill content
     */
    private static generateObjectives(drill: Drill): string[] {
        const objectives: string[] = [];

        switch (drill.category) {
            case 'Fundamentals':
                objectives.push('Master proper finger placement');
                objectives.push('Build muscle memory for key positions');
                break;
            case 'Bigrams':
            case 'Trigrams':
                objectives.push('Increase speed on common letter combinations');
                objectives.push('Reduce hesitation between keystrokes');
                break;
            case 'Programming':
                objectives.push('Type code syntax accurately');
                objectives.push('Handle special characters with precision');
                break;
            case 'Professional':
            case 'Technical':
            case 'Medical':
            case 'Legal':
            case 'Academic':
            case 'Finance':
            case 'Scientific':
                objectives.push('Master specialized vocabulary');
                objectives.push('Maintain accuracy with complex terms');
                break;
            default:
                objectives.push('Improve typing speed');
                objectives.push('Maintain high accuracy');
        }

        objectives.push(`Achieve ${drill.difficulty === 'Beginner' ? 85 : drill.difficulty === 'Intermediate' ? 88 : 90}% accuracy to unlock next lesson`);

        return objectives;
    }

    /**
     * Checks if a lesson is unlocked for the user
     */
    static isLessonUnlocked(
        lesson: Lesson,
        completedLessons: string[]
    ): boolean {
        // First lesson is always unlocked
        if (lesson.prerequisites.length === 0) {
            return true;
        }

        // Check if all prerequisites are completed
        return lesson.prerequisites.every(prereq =>
            completedLessons.includes(prereq)
        );
    }

    /**
     * Gets the next available lesson for the user
     */
    static getNextLesson(
        lessons: Lesson[],
        completedLessons: string[]
    ): Lesson | null {
        for (const lesson of lessons) {
            if (!completedLessons.includes(lesson.id) &&
                this.isLessonUnlocked(lesson, completedLessons)) {
                return lesson;
            }
        }
        return null;
    }

    /**
     * Checks if user passed the lesson
     */
    static checkMastery(lesson: Lesson, metrics: TypingMetrics): boolean {
        return metrics.accuracy >= lesson.masteryThreshold;
    }

    /**
     * Calculates progress percentage for a difficulty level
     */
    static calculateLevelProgress(
        completedLessons: string[],
        levelPrefix: string,
        totalLessonsInLevel: number = 10
    ): number {
        const completed = completedLessons.filter(id => id.startsWith(levelPrefix)).length;
        return Math.round((completed / totalLessonsInLevel) * 100);
    }
}
