// ── Accuracy Assassin: Sound Manager ──
// Web Audio API based for low-latency playback

type SoundId = 'tick' | 'death' | 'countdown' | 'go' | 'flawless' | 'roundClear';

interface SoundDef {
    frequency: number;
    duration: number;
    type: OscillatorType;
    gain: number;
    ramp?: number; // frequency ramp end
}

const SOUND_DEFS: Record<SoundId, SoundDef> = {
    tick: { frequency: 800, duration: 0.04, type: 'square', gain: 0.08 },
    death: { frequency: 200, duration: 0.5, type: 'sawtooth', gain: 0.25, ramp: 50 },
    countdown: { frequency: 440, duration: 0.12, type: 'sine', gain: 0.15 },
    go: { frequency: 880, duration: 0.25, type: 'sine', gain: 0.2 },
    flawless: { frequency: 523, duration: 0.3, type: 'sine', gain: 0.15, ramp: 1047 },
    roundClear: { frequency: 660, duration: 0.15, type: 'triangle', gain: 0.12, ramp: 880 },
};

export class SoundManager {
    private ctx: AudioContext | null = null;
    private muted = false;

    constructor(muted = false) {
        this.muted = muted;
    }

    setMuted(muted: boolean) {
        this.muted = muted;
    }

    private ensureContext(): AudioContext {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    play(id: SoundId) {
        if (this.muted) return;

        try {
            const ctx = this.ensureContext();
            const def = SOUND_DEFS[id];
            if (!def) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = def.type;
            osc.frequency.setValueAtTime(def.frequency, ctx.currentTime);

            if (def.ramp) {
                osc.frequency.linearRampToValueAtTime(
                    def.ramp,
                    ctx.currentTime + def.duration,
                );
            }

            gain.gain.setValueAtTime(def.gain, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + def.duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + def.duration + 0.01);
        } catch {
            // Silently fail if audio isn't available
        }
    }

    /** Play a noise burst (for death effect) */
    playNoiseBurst() {
        if (this.muted) return;

        try {
            const ctx = this.ensureContext();
            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

            source.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        } catch {
            // Silently fail
        }
    }

    dispose() {
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
    }
}
