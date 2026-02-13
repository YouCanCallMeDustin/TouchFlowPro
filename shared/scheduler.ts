export interface SpacedItem {
    id: string;
    interval: number; // in days
    repetition: number;
    efactor: number;
    nextReview: Date;
}

export class SpacedScheduler {
    /**
     * Simplified SM-2 Algorithm
     * quality: 0-5 (0: total failure, 5: perfect)
     */
    static review(item: SpacedItem, quality: number, fatigueScore: number = 0): SpacedItem {
        let { interval, repetition, efactor } = item;

        // FATIGUE MODIFIER:
        // High fatigue means the user's performance might not reflect true mastery.
        // We should be conservative with interval growth.
        let fatiguePenalty = 0;
        if (fatigueScore > 50) fatiguePenalty = 1; // Minor impact
        if (fatigueScore > 75) fatiguePenalty = 2; // Major impact

        // Adjusted quality for scheduling purposes (doesn't affect displayed score)
        const schedulingQuality = Math.max(0, quality - fatiguePenalty);

        if (schedulingQuality >= 3) {
            if (repetition === 0) {
                interval = 1;
            } else if (repetition === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * efactor);
            }
            repetition += 1;
        } else {
            repetition = 0;
            interval = 1;
        }

        // Update E-Factor
        // Standard SM-2 formula
        efactor = efactor + (0.1 - (5 - schedulingQuality) * (0.08 + (5 - schedulingQuality) * 0.02));

        // Fatigue logic: If very tired, prevent E-Factor from growing too much
        if (fatigueScore > 60 && efactor > 1.3) {
            efactor -= 0.1;
        }

        if (efactor < 1.3) efactor = 1.3;

        // Safety cap: If fatigue was critical (>80), do not extend interval beyond 3 days
        if (fatigueScore > 80 && interval > 3) {
            interval = 3;
        }

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return {
            ...item,
            interval,
            repetition,
            efactor,
            nextReview
        };
    }

    static calculateQuality(accuracy: number, netWPM: number, targetWPM: number): number {
        // Basic mapping: 
        // Accuracy > 98% and WPM > Target -> 5
        // Accuracy > 95% -> 4
        // Accuracy > 90% -> 3
        // Accuracy > 80% -> 2
        // Accuracy < 80% -> 1

        if (accuracy < 80) return 1;
        if (accuracy < 85) return 2;
        if (accuracy < 90) return 3;
        if (accuracy < 95) return 4;
        return 5;
    }
}
