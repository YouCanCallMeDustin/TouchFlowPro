export type TrainingTrack = 'MEDICAL' | 'LEGAL' | 'OPS' | 'CODE' | 'CUSTOM';

export interface PlanItem {
    type: 'WARMUP' | 'REVIEW' | 'SKILL' | 'COOLDOWN';
    title: string;
    drillId?: string; // If specific drill
    minutes: number;
    reason?: string[];
    mode?: string; // "drill", "code", "quote"
}

export interface DailyPlan {
    date: string; // YYYY-MM-DD
    track: TrainingTrack;
    estimatedMinutes: number;
    items: PlanItem[];
    notes: string[];
    status: 'PLANNED' | 'COMPLETED' | 'SKIPPED';
}

export interface GeneratorInput {
    track: TrainingTrack;
    goalWpm: number;
    currentWpm: number;
    currentAccuracy: number;
    fatigueScore: number; // 0-100
    plateauSignal?: string | null; // "speed_plateau", "accuracy_plateau"
    spacedItemsCount: number;
    minutesPerDay: number;
}

export function generateDailyPlan(input: GeneratorInput): DailyPlan {
    const {
        track,
        fatigueScore,
        plateauSignal,
        spacedItemsCount,
        minutesPerDay
    } = input;

    const notes: string[] = [];
    let effectiveMinutes = minutesPerDay;

    // 1. Fatigue Adjustment
    if (fatigueScore > 70) {
        effectiveMinutes = Math.max(5, Math.floor(minutesPerDay * 0.5));
        notes.push("High fatigue detected. Reducing intensity.");
    } else if (fatigueScore > 40) {
        effectiveMinutes = Math.max(10, Math.floor(minutesPerDay * 0.8));
        notes.push("Moderate fatigue. Slight reduction.");
    }

    const items: PlanItem[] = [];
    let remainingMinutes = effectiveMinutes;

    // 2. Warmup (Fixed ~10-15% or 2 mins)
    const warmupMins = Math.max(2, Math.floor(effectiveMinutes * 0.1));
    items.push({
        type: 'WARMUP',
        title: 'Finger Limbering',
        minutes: warmupMins,
        mode: 'practice',
        reason: ['Prepare muscles', 'Establish rhythm']
    });
    remainingMinutes -= warmupMins;

    // 3. Spaced Repetition (Priority)
    if (spacedItemsCount > 0 && remainingMinutes > 5) {
        const reviewMins = Math.min(remainingMinutes - 3, Math.ceil(spacedItemsCount * 0.5)); // 30s per item?
        // Cap review at 40% of session
        const cappedReview = Math.min(reviewMins, Math.floor(effectiveMinutes * 0.4));

        if (cappedReview > 0) {
            items.push({
                type: 'REVIEW',
                title: 'Retention Review',
                minutes: cappedReview,
                mode: 'drill',
                reason: [`${spacedItemsCount} items due for review`]
            });
            remainingMinutes -= cappedReview;
        }
    }

    // 4. Main Skill Block (Adapt to Plateau/Track)
    if (remainingMinutes > 2) {
        const cooldownMins = 2;
        const skillMins = remainingMinutes - cooldownMins;

        if (skillMins > 0) {
            let title = 'Skill Builder';
            let reason = ['Build core proficiency'];
            let mode = 'drill';

            // Track Specifics
            if (track === 'CODE') {
                title = 'Syntax Patterns';
                mode = 'code';
            } else if (track === 'MEDICAL') {
                title = 'Terminology Flow';
                mode = 'custom'; // implied medical dict
            } else if (track === 'LEGAL') {
                title = 'Legal Dictation';
                mode = 'quote';
            }

            // Plateau Overrides
            if (plateauSignal === 'accuracy_plateau') {
                title += ' (Accuracy Focus)';
                reason.push('Breaking accuracy plateau');
            } else if (plateauSignal === 'speed_plateau') {
                title += ' (Speed Bursts)';
                reason.push('Breaking speed plateau');
            }

            items.push({
                type: 'SKILL',
                title: title,
                minutes: skillMins,
                mode: mode,
                reason: reason
            });
            remainingMinutes -= skillMins;
        }

        // 5. Cooldown
        items.push({
            type: 'COOLDOWN',
            title: 'Free Flow',
            minutes: cooldownMins,
            mode: 'practice',
            reason: ['Relax tension', 'Internalize gains']
        });
    }

    return {
        date: new Date().toISOString().split('T')[0],
        track,
        estimatedMinutes: effectiveMinutes,
        items,
        notes,
        status: 'PLANNED'
    };
}
