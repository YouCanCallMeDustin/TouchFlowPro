import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LiveMetricsBar } from '../components/LiveMetricsBar';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { TypingEngine } from '../utils/typingEngine';
import type { KeystrokeEvent, LiveMetrics } from '../utils/types';

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
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Enhanced Typing Practice
                    </h1>
                    <p className="text-gray-400">
                        Real-time feedback with visual keyboard guide
                    </p>
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
