import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play } from 'lucide-react';

interface PlanTimerProps {
    durationSeconds: number;
    onComplete: () => void;
    isActive: boolean;
    onPauseToggle: (paused: boolean) => void;
}

export const PlanTimer: React.FC<PlanTimerProps> = ({ durationSeconds, onComplete, isActive, onPauseToggle }) => {
    const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

    useEffect(() => {
        let interval: any;

        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, secondsLeft, onComplete]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed top-6 right-6 z-[100] flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl scale-110 sm:scale-100 origin-right">
            <div className={`p-3 rounded-2xl ${isActive ? 'bg-primary/20 text-primary animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                <Clock size={20} />
            </div>

            <div className="flex flex-col min-w-[100px]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Session Timer</span>
                <span className={`text-2xl font-mono font-black tabular-nums ${secondsLeft < 30 ? 'text-rose-500' : 'text-white'}`}>
                    {formatTime(secondsLeft)}
                </span>
            </div>

            <button
                onClick={() => onPauseToggle(!isActive)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
            >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
            </button>
        </div>
    );
};
