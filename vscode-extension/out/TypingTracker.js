"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypingTracker = void 0;
class TypingTracker {
    // Configuration
    constructor(idleTimeoutSeconds = 5) {
        this.totalKeystrokes = 0;
        this.backspaces = 0;
        this.startTime = null;
        this.lastKeystrokeTime = null;
        this.accumulatedTimeSeconds = 0;
        this.isPaused = false;
        this.idleTimeoutMs = 5000;
        this.idleTimer = null;
        // Actually, let's keep it simple for v1.
        // WPM = (Keystrokes / 5) / ((Date.now() - StartTime) / 60000).
        // If we pause, we freeze the time accumulator.
        // Revised State for simplified time tracking
        this.activeDurationMs = 0;
        this.currentBurstStart = null;
        this.idleTimeoutMs = idleTimeoutSeconds * 1000;
    }
    handleKeystroke(isBackspace = false) {
        const now = Date.now();
        // If paused or not started, resume/start
        if (this.isPaused || this.startTime === null) {
            this.resumeSession();
        }
        this.lastKeystrokeTime = now;
        this.totalKeystrokes++;
        if (isBackspace) {
            this.backspaces++;
        }
        this.resetIdleTimer();
    }
    updateConfiguration(idleTimeoutSeconds) {
        this.idleTimeoutMs = idleTimeoutSeconds * 1000;
        this.resetIdleTimer();
    }
    resumeSession() {
        this.isPaused = false;
        if (this.startTime === null) {
            this.startTime = Date.now();
        }
        else {
            // Adjust start time to account for the pause duration so strictly "active" time is incorrectly tracked? 
            // Better approach: track accumulated duration.
            // If we just came back from a pause, we don't want to count the gap.
            // But wpm is usually (chars / time). If I take a break, my wpm drops.
            // "Session WPM" usually counts only active time + short pauses?
            // "Net WPM" usually counts total elapsed time.
            // For a "Pro Tracker", let's use a standard "Session Time" that pauses on long idle.
            // If we were paused, we don't change accumulated time, we just update the "last active" marker.
            // Actually, we need to handle the time gap. 
            // Simple logic: Session is a series of active bursts.
        }
        this.lastKeystrokeTime = Date.now();
    }
    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        this.idleTimer = setTimeout(() => {
            this.pauseSession();
        }, this.idleTimeoutMs);
    }
    pauseSession() {
        if (!this.isPaused && this.lastKeystrokeTime && this.startTime) {
            this.isPaused = true;
            // Add the duration of this burst to accumulated time
            // However, calculation is simpler if we just subtract idle time from total elapsed?
            // Let's stick to: WPM = (TotalChars / 5) / (ActiveMinutes)
            // We need to track 'active milliseconds'.
            // On each keystroke, if we are 'active', we are accumulating time? 
            // No, that's too granular.
            // Better: update 'accumulatedTime' when we pause.
            const sessionCurrentDuration = Date.now() - (this.lastKeystrokeTime || Date.now());
            // Wait, this logic is tricky.
            // Let's try:
            // metrics.sessionDurationSeconds is what we display. 
            // It should update every second while active.
            // Let's refactor for simplicity:
            // Just track start time. If user goes idle, we stop the "clock" for the WPM calculation? 
            // Standard typing tests don't pause. But coding sessions do.
            // Let's count "Active Typing Time".
        }
    }
    start() {
        this.reset();
        this.resume();
    }
    reset() {
        this.totalKeystrokes = 0;
        this.backspaces = 0;
        this.activeDurationMs = 0;
        this.currentBurstStart = null;
        this.isPaused = true;
        if (this.idleTimer)
            clearTimeout(this.idleTimer);
    }
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.currentBurstStart = Date.now();
        }
    }
    handleActivity(isBackspace) {
        if (this.isPaused) {
            this.resume();
        }
        this.totalKeystrokes++;
        if (isBackspace)
            this.backspaces++;
        // Reset idle timer
        if (this.idleTimer)
            clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.pause();
        }, this.idleTimeoutMs);
    }
    pause() {
        if (!this.isPaused && this.currentBurstStart) {
            this.isPaused = true;
            this.activeDurationMs += Date.now() - this.currentBurstStart;
            this.currentBurstStart = null;
        }
    }
    getMetrics() {
        let currentSessionDuration = this.activeDurationMs;
        if (!this.isPaused && this.currentBurstStart) {
            currentSessionDuration += (Date.now() - this.currentBurstStart);
        }
        const minutes = currentSessionDuration / 1000 / 60;
        const wpm = minutes > 0 ? (this.totalKeystrokes / 5) / minutes : 0;
        // Simple accuracy proxy: 100% - (backspaces / total * 100)
        // If backspaces > total/2, it can go negative, clamp to 0. 
        // More realistic: (Total - Backspaces) / Total. 
        // Note: A backspace usually means 1 char typed + 1 char deleted = 2 keystrokes for 0 net chars.
        // Let's simple metric: "Raw Accuracy" = 1 - (Backspaces / TotalKeystrokes)
        const accuracy = this.totalKeystrokes > 0
            ? Math.max(0, 100 * (1 - (this.backspaces / this.totalKeystrokes)))
            : 100;
        return {
            wpm: Math.round(wpm),
            accuracy: Math.round(accuracy),
            totalKeystrokes: this.totalKeystrokes,
            backspaces: this.backspaces,
            sessionDurationSeconds: Math.floor(currentSessionDuration / 1000),
            isPaused: this.isPaused
        };
    }
}
exports.TypingTracker = TypingTracker;
//# sourceMappingURL=TypingTracker.js.map