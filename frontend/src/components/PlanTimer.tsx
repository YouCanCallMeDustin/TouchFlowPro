import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Plus, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface PlanTimerProps {
    durationSeconds: number;
    onComplete: () => void;
    isActive: boolean; // Is the test running?
    onPauseToggle: (paused: boolean) => void;
}

export const PlanTimer: React.FC<PlanTimerProps> = ({ durationSeconds, onComplete, isActive, onPauseToggle }) => {
    const [timeLeft, setTimeLeft] = useState(durationSeconds);
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsFinished(true);
                        onPauseToggle(true); // Auto-pause typing test
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isPaused, timeLeft, onPauseToggle]);

    const handleAddTime = () => {
        setTimeLeft(prev => prev + 60);
        setIsFinished(false);
        setIsPaused(false);
        onPauseToggle(false);
    };

    const handleFinish = () => {
        onComplete();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Calculate progress for circular indicator
    const progress = (timeLeft / durationSeconds) * 100;
    const circumference = 2 * Math.PI * 20; // r=20

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-24 right-8 z-50 flex flex-col items-end gap-2"
        >
            <div className="bg-surface border border-border rounded-xl shadow-xl p-4 flex items-center gap-4 backdrop-blur-md bg-opacity-90">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="absolute inset-0 transform -rotate-90 w-12 h-12">
                        <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-surface-2"
                            fill="none"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-primary transition-all duration-1000 ease-linear"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (progress / 100) * circumference}
                        />
                    </svg>
                    <span className="text-xs font-bold font-mono">{formatTime(timeLeft)}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Training Goal</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setIsPaused(!isPaused); onPauseToggle(!isPaused); }}
                            className="p-1 hover:bg-surface-2 rounded text-text-muted hover:text-text"
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button
                            onClick={handleAddTime}
                            className="p-1 hover:bg-surface-2 rounded text-text-muted hover:text-text"
                            title="Add 1 minute"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={handleFinish}
                            className="p-1 hover:bg-green-500/20 rounded text-green-500"
                            title="Finish Now"
                        >
                            <CheckCircle size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-surface border border-primary rounded-xl shadow-2xl p-6 w-72"
                    >
                        <h3 className="text-lg font-bold mb-2">Goal Reached! 🎉</h3>
                        <p className="text-sm text-text-muted mb-4">You've hit your daily target. Do you want to keep going or finish?</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleAddTime} className="flex-1">
                                +1 Min
                            </Button>
                            <Button size="sm" onClick={handleFinish} className="flex-1">
                                Finish
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
