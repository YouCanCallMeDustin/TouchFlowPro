import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Target, Activity, Shield, X, CheckCircle2 } from 'lucide-react';
import type { BibleVerse } from '@shared/bibleVerses';
import type { TypingMetrics, KeystrokeEvent, LiveMetrics } from '@shared/types';
import { TypingEngine } from '@shared/typingEngine';

interface BibleLessonViewProps {
    verses: BibleVerse[];
    onComplete: (metrics: TypingMetrics[], keystrokesByVerse?: any[][]) => void;
    onCancel: () => void;
}

type Mode = 'practice' | 'test' | 'complete';

const BibleLessonView: React.FC<BibleLessonViewProps> = ({ verses, onComplete, onCancel }) => {
    const [mode, setMode] = useState<Mode>('practice');
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
    const [completedVerses, setCompletedVerses] = useState<{ metrics: TypingMetrics, keystrokes: KeystrokeEvent[] }[]>([]);
    const [isStarted, setIsStarted] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
        currentWPM: 0,
        currentAccuracy: 100,
        keystrokesPerMinute: 0,
        averageKeyDelay: 0,
        timeElapsed: 0
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const currentVerse = verses[currentVerseIndex];
    const totalVerses = verses.length;

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentVerseIndex, mode]);

    // Live Metrics Update
    useEffect(() => {
        if (isStarted && keystrokes.length > 0) {
            const interval = setInterval(() => {
                const metrics = TypingEngine.calculateLiveMetrics(keystrokes, currentVerse.text);
                setLiveMetrics(metrics);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [isStarted, keystrokes, currentVerse.text]);

    // Auto-Advance Logic
    useEffect(() => {
        if (userInput.length === currentVerse.text.length && currentVerse.text.length > 0) {
            handleVerseComplete();
        }
    }, [userInput, currentVerse.text]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (mode === 'complete') return;

        if (!isStarted) {
            setIsStarted(true);
        }

        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Shift') {
            const event: KeystrokeEvent = {
                keyCode: e.code,
                key: e.key,
                eventType: 'keydown',
                timestamp: Date.now(),
                expectedKey: e.key === 'Shift' ? 'Shift' : currentVerse.text[userInput.length]
            };

            setKeystrokes(prev => [...prev, event]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= currentVerse.text.length) {
            setUserInput(value);
        }
    };

    const handleVerseComplete = () => {
        const finalMetrics = TypingEngine.calculateMetrics(keystrokes, currentVerse.text);
        const newCompleted = { metrics: finalMetrics, keystrokes };

        setCompletedVerses(prev => [...prev, newCompleted]);

        if (mode === 'test' || currentVerseIndex === totalVerses - 1) {
            setMode('complete');
        } else {
            // Seamless auto-advance
            setCurrentVerseIndex(prev => prev + 1);
            setUserInput('');
            setKeystrokes([]);
        }
    };

    const handleSkipToTest = () => {
        const randomIndex = Math.floor(Math.random() * verses.length);
        setMode('test');
        setCurrentVerseIndex(randomIndex);
        setCompletedVerses([]);
        setUserInput('');
        setKeystrokes([]);
        setIsStarted(false);
    };

    const handleFinish = () => {
        onComplete(
            completedVerses.map(v => v.metrics),
            completedVerses.map(v => v.keystrokes)
        );
    };

    const renderText = () => {
        return currentVerse.text.split('').map((char, index) => {
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
                        scale: isCurrent ? 1.05 : 1,
                    }}
                    className={`inline-block font-mono text-xl sm:text-2xl transition-all relative ${isCurrent ? 'font-black' : 'font-medium'}`}
                >
                    {char === ' ' ? '\u00A0' : char}
                    {isCurrent && (
                        <motion.div
                            layoutId="cursor"
                            className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </motion.span>
            );
        });
    };

    if (mode === 'complete') {
        const avgAccuracy = Math.round(
            completedVerses.reduce((sum, v) => sum + v.metrics.accuracy, 0) / completedVerses.length
        );
        const avgWPM = Math.round(
            completedVerses.reduce((sum, v) => sum + v.metrics.netWPM, 0) / completedVerses.length
        );

        return (
            <div className="max-w-4xl mx-auto p-8 animate-in fade-in zoom-in duration-500">
                <div className="card text-center overflow-hidden">
                    {/* Mission Success Header */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />

                    <div className="flex justify-center mb-8 relative">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 relative z-10">
                            <CheckCircle2 size={48} className="text-primary animate-bounce-short" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                    </div>

                    <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase text-text-main">
                        Mission Accomplished
                    </h2>
                    <p className="text-text-muted text-sm font-black uppercase tracking-[0.4em] mb-12 opacity-60">
                        {completedVerses.length === 1 ? 'Individual Verse Extraction Verified' : 'Full Chapter Transmission Complete'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                        <div className="p-8 bg-slate-500/5 dark:bg-white/5 rounded-3xl border border-white/5 group hover:border-primary/20 transition-all">
                            <div className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase mb-2">Operational Velocity</div>
                            <div className="text-5xl font-black text-primary tracking-tighter mb-1">{avgWPM}</div>
                            <div className="text-[9px] font-black text-primary/60 uppercase">Net Words Per Minute</div>
                        </div>
                        <div className="p-8 bg-slate-500/5 dark:bg-white/5 rounded-3xl border border-white/5 group hover:border-secondary/20 transition-all">
                            <div className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase mb-2">Signal Integrity</div>
                            <div className="text-5xl font-black text-secondary tracking-tighter mb-1">{avgAccuracy}%</div>
                            <div className="text-[9px] font-black text-secondary/60 uppercase">System Accuracy</div>
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        className="w-full max-w-sm py-6 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all group lg:mx-auto"
                    >
                        <span className="flex items-center justify-center gap-3">
                            {completedVerses.length === 1 ? 'Secure Test Log' : 'Archive Chapter Log'}
                            <Zap size={14} className="group-hover:animate-pulse" />
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tactical Header Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Signal Velocity', value: liveMetrics.currentWPM, unit: 'WPM', color: 'text-primary', icon: <Activity size={12} /> },
                    { label: 'Transmission Precision', value: liveMetrics.currentAccuracy, unit: '%', color: 'text-secondary', icon: <Target size={12} /> },
                    { label: 'Sector Progress', value: Math.round(((currentVerseIndex + 1) / totalVerses) * 100), unit: '%', color: 'text-accent', icon: <Zap size={12} /> },
                    { label: 'Signal Integrity', value: liveMetrics.averageKeyDelay, unit: 'ms', color: 'text-text-main', icon: <Shield size={12} /> }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card p-3 flex flex-col items-center justify-center space-y-1 group hover:border-primary/30"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="opacity-40 group-hover:text-primary transition-colors">{stat.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">{stat.label}</span>
                        </div>
                        <div className={`text-2xl font-black tracking-tighter ${stat.color}`}>
                            {stat.value}<span className="text-[10px] ml-1 font-semibold opacity-40 uppercase tracking-widest">{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Arena */}
            <div className={`relative card p-8 sm:p-14 transition-all duration-500 overflow-hidden border-white/5`}>
                {/* Deployment Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <BookOpen size={18} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                                {mode === 'practice' ? 'Scripture Extraction' : 'Target Validation'}
                            </div>
                            <h2 className="text-xl font-black tracking-tighter text-text-main uppercase">
                                {currentVerse.reference}
                            </h2>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {mode === 'practice' && (
                            <button
                                onClick={handleSkipToTest}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted transition-all border border-white/5"
                            >
                                <span className="flex items-center gap-2">Skip to Test <Zap size={10} /></span>
                            </button>
                        )}
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-[9px] font-black uppercase tracking-[0.2em] text-accent transition-all border border-accent/20"
                        >
                            <span className="flex items-center gap-2">Abort <X size={10} /></span>
                        </button>
                    </div>
                </div>

                {/* Progress Strip */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                        animate={{ width: `${(userInput.length / currentVerse.text.length) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                    />
                </div>

                <div className="relative z-10 space-y-12">
                    <div className={`min-h-[160px] leading-relaxed select-none flex flex-wrap gap-x-0.5 gap-y-4 items-center justify-center text-center max-w-4xl mx-auto`}>
                        {renderText()}
                    </div>

                    <div className="relative group max-w-md mx-auto">
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
                            w-full p-4 text-center rounded-2xl border transition-all duration-500 overflow-hidden relative
                            ${isStarted ? 'bg-primary/5 border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]' : 'bg-white/5 border-white/10'}
                        `}>
                            {/* Scanning Effect */}
                            {isStarted && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent w-full"
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                            )}

                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] relative z-10 ${isStarted ? 'text-primary' : 'text-text-muted opacity-50 animate-pulse'}`}>
                                {isStarted ? 'Processing Input Sequence...' : 'Begin Scripture Calibration'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deployment Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 gap-6 opacity-40">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Verse {currentVerseIndex + 1} of {totalVerses}
                    </div>
                </div>

                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted text-center max-w-xl">
                    Authorized Scripture Extraction from the <span className="text-text-main">ESV® Bible</span>. Used by Permission.
                </p>

                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">System Active</span>
                </div>
            </div>
        </div>
    );
};

export default BibleLessonView;
