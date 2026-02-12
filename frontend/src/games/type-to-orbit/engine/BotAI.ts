import { type RacerState, type BotPersonality } from './types';

export class BotRacer {
    public wpm: number;
    public difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE' = 'MEDIUM';
    public state: RacerState;
    private targetProgress: number = 0; BotPersonality;
    private targetWpm: number;
    private nextActionTime: number = 0;
    private burstActive: boolean = false;

    constructor(id: string, name: string, personality: BotPersonality, targetWpm: number, color: string) {
        this.personality = personality;
        this.targetWpm = targetWpm;

        this.state = {
            id,
            name,
            isPlayer: false,
            color,
            progress: 0,
            velocity: 0,
            altitude: 0,
            wpm: 0,
            rank: 0,
            combo: 0,
            fuelLevel: 100,
            fuelEfficiency: 100,
            afterburnerCharge: 0,
            isBoosting: false,
            cursorIndex: 0,
            typedContent: ''
        };
        // Initialize first action time
        this.nextActionTime = 0;
    }

    update(now: number, totalChars: number) {
        if (this.state.progress >= 100) return;

        // Decide how much to type based on personality
        if (now >= this.nextActionTime) {
            this.performTyping(now, totalChars);
        }

        // Smooth velocity update
        // If we just typed, velocity goes up. If waiting, decays.
        // Simple logic for now: velocity = wpm
        this.state.velocity = this.state.wpm;

        // Update progress
        this.state.progress = (this.state.cursorIndex / totalChars) * 100;
    }

    private performTyping(now: number, totalChars: number) {
        const charTime = 60000 / (this.targetWpm * 5); // Base time per char

        let delay = charTime;

        switch (this.personality) {
            case 'steady':
                // Consistent, low variance
                delay *= 0.9 + Math.random() * 0.2;
                break;

            case 'burst':
                // Fast bursts, then pause
                if (this.burstActive) {
                    delay *= 0.4; // Very fast
                    if (Math.random() < 0.1) {
                        this.burstActive = false; // End burst
                        delay = 500 + Math.random() * 1000; // Long pause
                    }
                } else {
                    if (Math.random() < 0.05) {
                        this.burstActive = true; // Start burst
                    }
                    delay *= 1.2; // Slower when not bursting
                }
                break;

            case 'reactive':
                // Variable
                delay *= 0.8 + Math.random() * 0.5;
                // Simulate error recovery
                if (Math.random() < 0.02) {
                    delay += 400; // "Correction" pause
                }
                break;

            case 'elite':
                // Perfection
                delay *= 0.95 + Math.random() * 0.1;
                // Use afterburner?
                if (this.state.afterburnerCharge >= 100) {
                    // Fake boost
                    this.state.isBoosting = true;
                    // skip chars logic...
                }
                break;
        }

        this.state.cursorIndex = Math.min(totalChars, this.state.cursorIndex + 1);
        this.nextActionTime = now + delay;
    }
}
