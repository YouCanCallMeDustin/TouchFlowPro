export interface TrainingDayItem {
    id: string;
    blockType: 'WARMUP' | 'REVIEW' | 'SKILL' | 'COOLDOWN';
    mode: 'lesson' | 'practice' | 'bible' | 'code' | 'custom';
    title: string;
    recommendedSeconds: number;
    launch: {
        kind: 'DRILL' | 'LESSON' | 'CUSTOM_TEXT';
        drillId?: string;
        lessonId?: string;
        promptText?: string;
        difficulty?: string;
        tags?: string[];
    };
    isCompleted?: boolean;
}

export interface TrainingDay {
    id: string;
    date: Date;
    items: TrainingDayItem[];
    status: 'PLANNED' | 'COMPLETED' | 'SKIPPED';
    completedAt?: Date;
    estimatedMinutes: number;
}

export interface TrainingPlan {
    id: string;
    userId: string;
    track: string;
    goalWpm: number;
    minutesPerDay: number;
    startDate: Date;
    days: TrainingDay[];
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}
