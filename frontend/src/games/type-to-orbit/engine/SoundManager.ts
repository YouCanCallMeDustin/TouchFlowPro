export class SoundManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private initialized = false;

    constructor() {
        // Lazy init to handle browser autoplay policies
    }

    init() {
        if (this.initialized) return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Master volume
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    resume() {
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // High-pitched blip for typing
    playType() {
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        // Randomize pitch slightly for organic feel
        // Base frequency 800Hz, +/- 50Hz
        const freq = 800 + (Math.random() * 100 - 50);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Envelope: Instant attack, short decay
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Low buzz/thud for error
    playError() {
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    // White noise sweep for launch
    playLaunch() {
        if (!this.ctx || !this.masterGain) return;

        const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;

        const gain = this.ctx.createGain();

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // Sweep filter up
        filter.frequency.setValueAtTime(100, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(5000, this.ctx.currentTime + 1.5);

        // Fade out
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

        noise.start();
    }

    // Major chord arpeggio for orbit
    playOrbit() {
        if (!this.ctx || !this.masterGain) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major (C5, E5, G5, C6)
        const now = this.ctx.currentTime;
        const ctx = this.ctx;
        const masterGain = this.masterGain;

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(masterGain);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 1.5);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 1.5);
        });
    }
}

export const soundManager = new SoundManager();
