import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { LiveMetricsBar } from '../components/LiveMetricsBar';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { TypingEngine } from '@shared/typingEngine';
import type { KeystrokeEvent, LiveMetrics } from '@shared/types';

export const EnhancedPractice: React.FC = () => {
    const [text] = useState('The quick brown fox jumps over the lazy dog. Practice makes perfect!');
    const [userInput, setUserInput] = useState('');
    const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
    const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
        currentWPM: 0,
        currentAccuracy: 100,
        keystrokesPerMinute: 0,
        averageKeyDelay: 0,
        timeElapsed: 0
    });
    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Calculate live metrics every 500ms
    useEffect(() => {
        if (!isActive || keystrokes.length === 0) return;

        const interval = setInterval(() => {
            const metrics = TypingEngine.calculateLiveMetrics(keystrokes, text);
            setLiveMetrics(metrics);
        }, 500);

        return () => clearInterval(interval);
    }, [keystrokes, text, isActive]);

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isActive) {
            setIsActive(true);
        }

        const keystroke: KeystrokeEvent = {
            keyCode: e.code,
            key: e.key,
            eventType: 'keydown',
            timestamp: Date.now()
        };

        setKeystrokes(prev => [...prev, keystroke]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);

        // Check if completed
        if (e.target.value === text) {
            setIsActive(false);
            const finalMetrics = TypingEngine.calculateMetrics(keystrokes, text);
            alert(`Complete!\nWPM: ${finalMetrics.netWPM}\nAccuracy: ${finalMetrics.accuracy}%`);
        }
    };

    const handleReset = () => {
        setUserInput('');
        setKeystrokes([]);
        setIsActive(false);
        setLiveMetrics({
            currentWPM: 0,
            currentAccuracy: 100,
            keystrokesPerMinute: 0,
            averageKeyDelay: 0,
            timeElapsed: 0
        });
        inputRef.current?.focus();
    };

    // Get next character to type
    const nextChar = text[userInput.length] || '';

    // Render text with highlighting
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = 'text-2xl ';

            if (index < userInput.length) {
                // Already typed
                if (userInput[index] === char) {
                    className += 'text-green-500';
                } else {
                    className += 'text-red-500 bg-red-900/30';
                }
            } else if (index === userInput.length) {
                // Current character
                className += 'text-white bg-blue-500/50 animate-pulse';
            } else {
                // Not yet typed
                className += 'text-gray-500';
            }

            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-8"
                >
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Zap size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Live Assessment</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Enhanced Practice
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            Real-time feedback loop. Utilize the <span className="text-primary font-black uppercase tracking-wider">Visual Keyboard Guide</span> for kinetic reinforcement.
                        </p>
                    </div>

                    {/* Decorative Abstract Mesh */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden hidden md:block">
                        <svg width="400" height="400" viewBox="0 0 400 400" className="translate-x-20 -translate-y-20 animate-[spin_60s_linear_infinite]">
                            <defs>
                                <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                </linearGradient>
                            </defs>
                            <path d="M 0,200 Q 100,100 200,200 T 400,200" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,100 Q 100,0 200,100 T 400,100" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,300 Q 100,200 200,300 T 400,300" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                        </svg>
                    </div>
                </motion.div>

                {/* Live Metrics Bar */}
                {isActive && (
                    <LiveMetricsBar
                        currentWPM={liveMetrics.currentWPM}
                        currentAccuracy={liveMetrics.currentAccuracy}
                        timeElapsed={liveMetrics.timeElapsed}
                        keystrokesPerMinute={liveMetrics.keystrokesPerMinute}
                        averageKeyDelay={liveMetrics.averageKeyDelay}
                    />
                )}

                {/* Text Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800 rounded-2xl p-8 mb-6 shadow-2xl border border-gray-700"
                >
                    <div className="font-mono leading-relaxed mb-4">
                        {renderText()}
                    </div>

                    {/* Hidden Input */}
                    <textarea
                        ref={inputRef}
                        value={userInput}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-gray-900 text-white p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-lg"
                        placeholder="Start typing here..."
                        rows={3}
                    />

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Progress: {userInput.length} / {text.length}</span>
                            <span>{Math.round((userInput.length / text.length) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(userInput.length / text.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Virtual Keyboard */}
                <VirtualKeyboard
                    nextKey={nextChar}
                    showFingerGuide={true}
                />

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={handleReset}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedPractice;
