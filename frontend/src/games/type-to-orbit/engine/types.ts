export type RacePhase = 'lobby' | 'countdown' | 'launch' | 'orbit' | 'abort';

export type BotPersonality = 'steady' | 'burst' | 'reactive' | 'elite';

export interface RacerState {
    id: string;
    name: string;
    isPlayer: boolean;
    avatar?: string;
    color: string;

    // Race Physics
    progress: number; // 0-100% (Ground to Orbit)
    velocity: number; // Current visual speed
    altitude: number; // For atmospheric visuals

    // Metric State
    wpm: number;
    rank: number;
    combo: number;

    // Fuel System (Accuracy/Streak)
    fuelLevel: number; // 0-100%
    fuelEfficiency: number; // Rolling accuracy average
    accuracy: number; // 0-100
    // Afterburner
    afterburnerCharge: number; // 0-100%
    isBoosting: boolean;

    // Typing State
    cursorIndex: number;
    typedContent: string;
}

export interface RaceSnapshot {
    phase: RacePhase;
    countdown: number;
    racers: RacerState[];
    player: RacerState;

    // Environment
    environment: {
        layer: 'ground' | 'atmosphere' | 'space';
        event: 'none' | 'solar_wind' | 'turbulence';
    };

    startTime: number;
    elapsedTime: number;
    endTime?: number;
}

export interface AnalyticsData {
    keystrokes: {
        char: string;
        timestamp: number;
        latency: number; // Time since last key
        correct: boolean;
    }[];
    hesitations: { index: number; duration: number }[];
    errors: { char: string; expected: string; count: number }[];
}
