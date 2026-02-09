import type { TypingMetrics } from '@shared/types';

export interface UserStats {
    averageWPM: number;
    averageAccuracy: number;
    totalDrills: number;
    recentWPM: number[];
    recentAccuracy: number[];
}

export interface UserLevel {
    level: number;
    levelName: string;
    nextLevelRequirements: {
        wpm: number;
        accuracy: number;
    };
    progress: number; // 0-100
}

/**
 * Calculate user level based on performance stats
 */
export function calculateUserLevel(stats: UserStats): UserLevel {
    const { averageWPM, averageAccuracy } = stats;

    let level = 1;
    let levelName = 'Beginner';

    // Determine level (1-10)
    if (averageWPM >= 180 && averageAccuracy >= 99) {
        level = 10;
        levelName = 'Typing Master';
    } else if (averageWPM >= 160 && averageAccuracy >= 98) {
        level = 9;
        levelName = 'Expert';
    } else if (averageWPM >= 140 && averageAccuracy >= 97) {
        level = 8;
        levelName = 'Expert';
    } else if (averageWPM >= 120 && averageAccuracy >= 95) {
        level = 7;
        levelName = 'Advanced';
    } else if (averageWPM >= 100 && averageAccuracy >= 93) {
        level = 6;
        levelName = 'Advanced';
    } else if (averageWPM >= 80 && averageAccuracy >= 90) {
        level = 5;
        levelName = 'Intermediate';
    } else if (averageWPM >= 60 && averageAccuracy >= 85) {
        level = 4;
        levelName = 'Intermediate';
    } else if (averageWPM >= 40 && averageAccuracy >= 80) {
        level = 3;
        levelName = 'Beginner';
    } else if (averageWPM >= 20 && averageAccuracy >= 70) {
        level = 2;
        levelName = 'Beginner';
    }

    // Get next level requirements
    const nextLevelRequirements = getNextLevelRequirements(level);

    // Calculate progress to next level
    const progress = calculateLevelProgress(averageWPM, averageAccuracy, level, nextLevelRequirements);

    return {
        level,
        levelName,
        nextLevelRequirements,
        progress
    };
}

/**
 * Get requirements for next level
 */
function getNextLevelRequirements(currentLevel: number): { wpm: number; accuracy: number } {
    const requirements: Record<number, { wpm: number; accuracy: number }> = {
        1: { wpm: 20, accuracy: 70 },
        2: { wpm: 40, accuracy: 80 },
        3: { wpm: 60, accuracy: 85 },
        4: { wpm: 80, accuracy: 90 },
        5: { wpm: 100, accuracy: 93 },
        6: { wpm: 120, accuracy: 95 },
        7: { wpm: 140, accuracy: 97 },
        8: { wpm: 160, accuracy: 98 },
        9: { wpm: 180, accuracy: 99 },
        10: { wpm: 200, accuracy: 99.5 }
    };

    return requirements[currentLevel + 1] || { wpm: 200, accuracy: 100 };
}

/**
 * Calculate progress toward next level (0-100)
 */
function calculateLevelProgress(
    currentWPM: number,
    currentAccuracy: number,
    currentLevel: number,
    nextRequirements: { wpm: number; accuracy: number }
): number {
    if (currentLevel >= 10) return 100;

    const currentRequirements = getNextLevelRequirements(currentLevel - 1);

    // Calculate WPM progress
    const wpmRange = nextRequirements.wpm - currentRequirements.wpm;
    const wpmProgress = ((currentWPM - currentRequirements.wpm) / wpmRange) * 100;

    // Calculate accuracy progress
    const accuracyRange = nextRequirements.accuracy - currentRequirements.accuracy;
    const accuracyProgress = ((currentAccuracy - currentRequirements.accuracy) / accuracyRange) * 100;

    // Average of both (both must be met to level up)
    const progress = Math.min(wpmProgress, accuracyProgress);

    return Math.max(0, Math.min(100, progress));
}

/**
 * Get difficulty score for text (1-10)
 */
export function getDifficultyScore(text: string): number {
    let score = 1;

    // Factor 1: Length
    if (text.length > 500) score += 2;
    else if (text.length > 200) score += 1;

    // Factor 2: Punctuation
    const punctuationCount = (text.match(/[.,!?;:]/g) || []).length;
    if (punctuationCount > 10) score += 2;
    else if (punctuationCount > 5) score += 1;

    // Factor 3: Capitalization
    const capitalCount = (text.match(/[A-Z]/g) || []).length;
    if (capitalCount > 20) score += 1;

    // Factor 4: Numbers
    const numberCount = (text.match(/[0-9]/g) || []).length;
    if (numberCount > 10) score += 2;
    else if (numberCount > 5) score += 1;

    // Factor 5: Special characters
    const specialCount = (text.match(/[^a-zA-Z0-9\s.,!?;:]/g) || []).length;
    if (specialCount > 5) score += 2;

    return Math.min(10, score);
}

/**
 * Select adaptive text based on user level and trouble keys
 */
export function selectAdaptiveText(
    availableTexts: Array<{ content: string; difficulty: number }>,
    userLevel: number,
    troubleKeys: string[]
): string {
    if (availableTexts.length === 0) {
        return 'the quick brown fox jumps over the lazy dog';
    }

    // Filter texts by difficulty (within ±1 of user level)
    const suitableTexts = availableTexts.filter(
        text => text.difficulty >= userLevel - 1 && text.difficulty <= userLevel + 1
    );

    if (suitableTexts.length === 0) {
        // Fallback to closest difficulty
        return availableTexts.sort((a, b) =>
            Math.abs(a.difficulty - userLevel) - Math.abs(b.difficulty - userLevel)
        )[0].content;
    }

    // Score texts based on trouble key presence
    const scoredTexts = suitableTexts.map(text => {
        let score = 0;

        troubleKeys.forEach(key => {
            const regex = new RegExp(key.toLowerCase(), 'gi');
            const matches = text.content.match(regex);
            if (matches) {
                score += matches.length * 10;
            }
        });

        // Add randomness to avoid always picking the same text
        score += Math.random() * 5;

        return { text, score };
    });

    // Return highest scoring text
    scoredTexts.sort((a, b) => b.score - a.score);
    return scoredTexts[0].text.content;
}
