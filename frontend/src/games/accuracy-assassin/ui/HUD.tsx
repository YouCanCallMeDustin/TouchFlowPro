// ── Accuracy Assassin: HUD (Heads-Up Display) ──

import { DIFFICULTY_LEVELS } from '../engine/config';
import type { GameSnapshot } from '../engine/types';

interface HUDProps {
    snapshot: GameSnapshot;
}

export function HUD({ snapshot }: HUDProps) {
    const {
        timeRemaining, streak, grossWPM, accuracy,
        difficultyLevel, comboMeter,
    } = snapshot;

    const seconds = Math.ceil(timeRemaining / 1000);
    const levelName = DIFFICULTY_LEVELS[difficultyLevel as keyof typeof DIFFICULTY_LEVELS]?.name ?? 'Unknown';
    const timePercent = (timeRemaining / 15000) * 100;
    const isLowTime = seconds <= 5;

    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            {/* Timer Bar */}
            <div className="relative h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-100 ${isLowTime ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-primary to-secondary'
                        }`}
                    style={{ width: `${timePercent}%` }}
                />
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <HUDStat label="Time" value={`${seconds}s`} danger={isLowTime} />
                <HUDStat label="Streak" value={String(streak)} highlight={streak >= 3} />
                <HUDStat label="WPM" value={String(grossWPM)} />
                <HUDStat label="Accuracy" value={`${accuracy}%`} />
                <HUDStat label="Level" value={`L${difficultyLevel}`} sublabel={levelName} />

                {/* Combo Meter */}
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Combo</span>
                    <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                            style={{ width: `${comboMeter * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Restart hint */}
            <p className="text-center mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted/40">
                Press R to restart
            </p>
        </div>
    );
}

function HUDStat({ label, value, sublabel, danger, highlight }: {
    label: string;
    value: string;
    sublabel?: string;
    danger?: boolean;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{label}</span>
            <span className={`text-xl font-heading font-black tabular-nums ${danger ? 'text-red-400 animate-pulse' :
                    highlight ? 'text-yellow-400' :
                        'text-text-main'
                }`}>
                {value}
            </span>
            {sublabel && (
                <span className="text-[8px] text-text-muted/60 uppercase tracking-wider">{sublabel}</span>
            )}
        </div>
    );
}
