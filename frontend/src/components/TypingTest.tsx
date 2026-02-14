import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingEngine } from '@shared/typingEngine';
import type { KeystrokeEvent, TypingMetrics, LiveMetrics } from '@shared/types';
import { DictationUI } from './DictationMode';
import { VirtualKeyboard } from './VirtualKeyboard';

interface Props {
    text: string;
    onComplete?: (metrics: TypingMetrics, keystrokes: KeystrokeEvent[]) => void;
    suddenDeath?: boolean;
    onSuddenDeathFailure?: () => void;
    dictationMode?: boolean;
    showLiveMetrics?: boolean;
    showVirtualKeyboard?: boolean;
    mode?: string;
    onReset?: () => void;
    timeLimit?: number; // Minutes
}

const TypingTest: React.FC<Props> = ({
    text,
    onComplete,
    suddenDeath,
    onSuddenDeathFailure,
    dictationMode,
    showLiveMetrics = false,
    showVirtualKeyboard = false,
    mode,
    timeLimit
}) => {
    const [userInput, setUserInput] = useState('');
    const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
    const [metrics, setMetrics] = useState<TypingMetrics>({
        grossWPM: 0,
        netWPM: 0,
        accuracy: 0,
        charsTyped: 0,
        errors: 0,
        durationMs: 0,
        errorMap: {}
    });
    const [isStarted, setIsStarted] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [liveWPM, setLiveWPM] = useState(0);
    const [dictationSpeed, setDictationSpeed] = useState(1);
    const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
        currentWPM: 0,
        currentAccuracy: 100,
        keystrokesPerMinute: 0,
        averageKeyDelay: 0,
        timeElapsed: 0
    });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const startTimeRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const resetTest = () => {
        setUserInput('');
        setKeystrokes([]);
        setMetrics({
            grossWPM: 0,
            netWPM: 0,
            accuracy: 0,
            charsTyped: 0,
            errors: 0,
            durationMs: 0,
            errorMap: {}
        });
        setIsStarted(false);
        setIsFailed(false);
        setLiveWPM(0);
        if (timeLimit) setTimeLeft(timeLimit * 60);
        startTimeRef.current = null;
        inputRef.current?.focus();
    };

    useEffect(() => {
        if (timeLimit && !isStarted) {
            setTimeLeft(timeLimit * 60);
        }
    }, [timeLimit, isStarted]);

    useEffect(() => {
        if (isStarted && startTimeRef.current && !isFailed) {
            const interval = setInterval(() => {
                const now = Date.now();
                const elapsed = (now - startTimeRef.current!) / 1000 / 60;

                // Timer Logic
                if (timeLimit) {
                    const secondsElapsed = (now - startTimeRef.current!) / 1000;
                    const remaining = Math.max(0, (timeLimit * 60) - secondsElapsed);
                    setTimeLeft(remaining);

                    if (remaining <= 0) {
                        // Time's up!
                        clearInterval(interval);
                        onComplete?.(metrics, keystrokes);
                    }
                }

                if (elapsed > 0) {
                    const words = userInput.length / 5;
                    setLiveWPM(Math.round(words / elapsed));
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isStarted, userInput, isFailed, timeLimit, metrics, keystrokes, onComplete]);

    useEffect(() => {
        if (showLiveMetrics && isStarted && keystrokes.length > 0 && !isFailed) {
            const interval = setInterval(() => {
                const metrics = TypingEngine.calculateLiveMetrics(keystrokes, text);
                setLiveMetrics(metrics);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [showLiveMetrics, isStarted, keystrokes, text, isFailed]);

    useEffect(() => {
        if (userInput.length === text.length && text.length > 0 && !isFailed) {
            onComplete?.(metrics, keystrokes);
        }
    }, [userInput, text, metrics, keystrokes, onComplete, isFailed]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isFailed) return;
        if (timeLeft === 0 && timeLimit) return;

        if (!isStarted) {
            setIsStarted(true);
            startTimeRef.current = Date.now();
        }

        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Shift') {
            const isCorrect = e.key === text[userInput.length];

            if (suddenDeath && !isCorrect && e.key !== 'Backspace' && e.key !== 'Shift') {
                setIsFailed(true);
                onSuddenDeathFailure?.();
                setTimeout(resetTest, 600);
                return;
            }

            const event: KeystrokeEvent = {
                keyCode: e.code,
                key: e.key,
                eventType: 'keydown',
                timestamp: Date.now(),
                expectedKey: e.key === 'Shift' ? 'Shift' : text[userInput.length]
            };

            const updatedKeystrokes = [...keystrokes, event];
            setKeystrokes(updatedKeystrokes);

            // Only update typing metrics for character keys and backspace
            if (e.key !== 'Shift') {
                const newMetrics = TypingEngine.calculateMetrics(updatedKeystrokes, text);
                setMetrics(newMetrics);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFailed) return;
        if (timeLeft === 0 && timeLimit) return;

        const value = e.target.value;
        if (value.length <= text.length) {
            setUserInput(value);
        }
    };

    const renderText = () => {
        return text.split('').map((char, index) => {
            const isTyped = index < userInput.length;
            const isCurrent = index === userInput.length;
            const isCorrect = isTyped && userInput[index] === char;
            const isError = isTyped && !isCorrect;

            return (
                <motion.span
                    key={index}
                    initial={false}
                    animate={{
                        color: isError ? 'var(--accent)' : isCorrect ? 'var(--primary)' : 'var(--text-muted)',
                        opacity: isTyped ? 1 : 0.4,
                        scale: isCurrent ? 1.1 : 1,
                    }}
                    className={`inline-block font-mono text-xl sm:text-2xl transition-all relative ${isCurrent ? 'font-black' : 'font-medium'}`}
                >
                    {char === ' ' ? '\u00A0' : char}
                    {isCurrent && (
                        <motion.div
                            layoutId="cursor"
                            className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </motion.span>
            );
        });
    };

    const accuracyGlow = metrics.accuracy >= 98 ? 'shadow-primary/10 border-primary/20' : metrics.accuracy >= 90 ? 'shadow-secondary/10 border-secondary/20' : 'shadow-accent/10 border-accent/20';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Velocity', value: liveWPM, unit: 'WPM', color: 'text-primary' },
                    { label: 'Precision', value: metrics.accuracy, unit: '%', color: 'text-secondary' },
                    { label: 'Progress', value: Math.round((userInput.length / text.length) * 100), unit: '%', color: 'text-accent' },
                    {
                        label: timeLimit ? 'Time Left' : 'Key Delay',
                        value: timeLimit && timeLeft !== null ? formatTime(timeLeft) : liveMetrics.averageKeyDelay,
                        unit: timeLimit ? '' : 'ms',
                        color: timeLimit && (timeLeft || 0) < 30 ? 'text-rose-500 animate-pulse' : 'text-text-main'
                    }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card p-2 flex flex-col items-center justify-center space-y-0.5"
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{stat.label}</span>
                        <div className={`text-xl font-black ${stat.color}`}>
                            {stat.value}<span className="text-[9px] ml-0.5 opacity-50">{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Arena */}

            {/* Tactical Stats Overlay (Relocated) */}
            <AnimatePresence>
                {isStarted && !isFailed && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="flex justify-end px-2"
                    >
                        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                            <span className="text-[9px] font-black uppercase tracking-tighter text-white/50">Stability</span>
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-secondary"
                                    animate={{ width: `${metrics.accuracy}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                ref={containerRef}
                className={`relative card p-6 transition-all duration-500 overflow-hidden ${accuracyGlow}`}
            >
                {/* Sudden Death Effects */}
                <AnimatePresence>
                    {isFailed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-accent/20 backdrop-blur-md flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="bg-white dark:bg-slate-900 px-12 py-8 rounded-[2rem] shadow-2xl border-4 border-accent text-center"
                            >
                                <span className="block text-4xl mb-4">💀</span>
                                <h1 className="text-accent text-2xl mb-0">SEQUENCE ABORTED</h1>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Sudden Death Triggered</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Ring Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                        animate={{ width: `${(userInput.length / text.length) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>

                <div className="relative z-10 space-y-8">
                    {dictationMode ? (
                        <DictationUI
                            text={text}
                            isStarted={isStarted}
                            userInput={userInput}
                            onSpeedChange={setDictationSpeed}
                            currentSpeed={dictationSpeed}
                        />
                    ) : (
                        <div className={`min-h-[100px] leading-relaxed select-none ${mode === 'code' ? 'whitespace-pre-wrap break-all font-mono text-left' : 'flex flex-wrap gap-x-0.5 gap-y-4'}`}>
                            {renderText()}
                        </div>
                    )}

                    <div className="relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        <div className={`
                            w-full p-3 text-center rounded-xl border-2 transition-all duration-300
                            ${isStarted ? 'bg-primary/5 border-primary/30 shadow-inner' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10'}
                        `}>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isStarted ? 'text-primary' : 'text-text-muted opacity-50 animate-pulse'}`}>
                                {isStarted ? 'Sequence in Progress...' : 'Press any key to begin session'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tactical Stats Overlay (Floating when typing) */}
            </div>

            {/* Virtual Keyboard Bridge */}
            {showVirtualKeyboard && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card p-4 bg-slate-900/[0.02] dark:bg-white/[0.02]"
                >
                    <VirtualKeyboard
                        nextKey={text[userInput.length]}
                        showFingerGuide={true}
                        compact={true}
                    />
                </motion.div>
            )}

            {!isStarted && !isFailed && (
                <div className="flex justify-center gap-8">
                    {[
                        { icon: '🎯', text: 'FOCUS MODE ON' },
                        { icon: '⌨️', text: 'DYNAMIC FEEDBACK' },
                        { icon: '⚡', text: 'LOW LATENCY ENGINE' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TypingTest;
