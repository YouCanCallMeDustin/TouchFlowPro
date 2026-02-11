import { type RacerState, type RacePhase, type RaceSnapshot, type BotPersonality } from './types';
import { SPACE_QUOTES } from './config';
import { BotRacer } from './BotAI';

export class RaceEngine {
    private phase: RacePhase = 'lobby';
    private text: string = "";
    private startTime: number = 0;
    private player: RacerState;
    private bots: BotRacer[] = [];

    // Analytics State
    private keystrokes: { char: string, time: number, correct: boolean, latency: number }[] = [];
    private lastKeystrokeTime: number = 0;

    // Countdown State
    private countdown: number = 0;

    public onEvent?: (type: string, data?: any) => void;

    constructor(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE' = 'MEDIUM') {
        this.text = SPACE_QUOTES[Math.floor(Math.random() * SPACE_QUOTES.length)];

        this.player = {
            id: 'player', name: 'You', isPlayer: true, color: '#3b82f6',
            progress: 0, velocity: 0, altitude: 0, wpm: 0, rank: 1,
            combo: 0, fuelLevel: 100, fuelEfficiency: 100,
            afterburnerCharge: 0, isBoosting: false,
            cursorIndex: 0, typedContent: ''
        };

        // Init Bots with personalities
        const configs: { name: string, p: BotPersonality, wpm: number, color: string }[] = [
            { name: 'Atlas', p: 'steady', wpm: 40, color: '#ef4444' },
            { name: 'Viper', p: 'burst', wpm: 60, color: '#22c55e' },
            { name: 'Echo', p: 'reactive', wpm: 50, color: '#eab308' },
            { name: 'Nova', p: 'elite', wpm: 90, color: '#a855f7' }
        ];

        // Scale WPM by difficulty
        const multiplier = difficulty === 'EASY' ? 0.7 : difficulty === 'HARD' ? 1.3 : 1.0;

        this.bots = configs.map((c, i) => new BotRacer(
            `bot-${i}`, c.name, c.p, c.wpm * multiplier, c.color
        ));
    }

    start() {
        this.phase = 'countdown';
        this.countdown = 3;

        // Start countdown interval
        const i = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(i);
                this.phase = 'launch';
                this.startTime = performance.now();
                this.lastKeystrokeTime = this.startTime;
                this.onEvent?.('launch');
            }
        }, 1000);
    }

    handleInput(char: string) {
        if (this.phase !== 'launch' && this.phase !== 'orbit') return;
        const now = performance.now();

        // Afterburner Logic Removed per user request
        /* if (char === 'Enter') { ... } */

        const expected = this.text[this.player.cursorIndex];
        const correct = char === expected;

        // Analytics
        const latency = now - this.lastKeystrokeTime;
        this.keystrokes.push({
            char, time: now, correct, latency
        });

        this.lastKeystrokeTime = now;

        if (correct) {
            this.player.typedContent += char;
            this.player.cursorIndex++;
            this.player.combo++;

            // Build Afterburner Charge (faster with higher combo)
            // Keeping charge logic for now in case we repurpose it, but it does nothing active.
            this.player.afterburnerCharge = Math.min(100, this.player.afterburnerCharge + (1 + this.player.combo * 0.05));

            // Check Finish
            if (this.player.cursorIndex >= this.text.length) {
                this.finishPlayer();
            }
        } else {
            // Penalty
            this.player.combo = 0;
            this.player.fuelEfficiency = Math.max(0, this.player.fuelEfficiency - 5);
            this.onEvent?.('error');
        }

        this.updatePlayerProgress();
    }

    // triggerAfterburner removed
    tick(now: number, _dt: number) {
        if (this.phase !== 'launch') return;

        this.bots.forEach(b => b.update(now, this.text.length));

        // Calc WPM
        const elapsedMin = (now - this.startTime) / 60000;
        if (elapsedMin > 0) {
            this.player.wpm = Math.floor((this.player.cursorIndex / 5) / elapsedMin);
        }

        // Rank
        const all = [this.player, ...this.bots.map(b => b.state)];
        all.sort((a, b) => b.progress - a.progress);
        all.forEach((r, i) => r.rank = i + 1);
    }

    updatePlayerProgress() {
        this.player.progress = (this.player.cursorIndex / this.text.length) * 100;
        if (this.player.progress >= 100) this.finishPlayer();
    }

    finishPlayer() {
        if (this.phase === 'launch') {
            this.phase = 'orbit';
            this.onEvent?.('orbit');
        }
    }

    getSnapshot(): RaceSnapshot {
        return {
            phase: this.phase,
            countdown: this.countdown,
            racers: [this.player, ...this.bots.map(b => b.state)],
            player: this.player,
            environment: { layer: 'atmosphere', event: 'none' },
            startTime: this.startTime,
            elapsedTime: this.startTime ? performance.now() - this.startTime : 0
        };
    }
    getText() { return this.text; }
}
