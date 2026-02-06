import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { BibleVerse } from '@shared/bibleVerses';
import type { TypingMetrics } from '@shared/types';

interface BibleLessonViewProps {
    verses: BibleVerse[];
    onComplete: (metrics: TypingMetrics[], keystrokesByVerse?: any[][]) => void;
    onCancel: () => void;
}

type Mode = 'practice' | 'test' | 'complete';

const BibleLessonView: React.FC<BibleLessonViewProps> = ({ verses, onComplete, onCancel }) => {
    const [mode, setMode] = useState<Mode>('practice');
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [input, setInput] = useState('');
    const [keystrokes, setKeystrokes] = useState<any[]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [completedVerses, setCompletedVerses] = useState<{ metrics: TypingMetrics, keystrokes: any[] }[]>([]);
    const [showCompletion, setShowCompletion] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const currentVerse = verses[currentVerseIndex];
    const totalVerses = verses.length;

    useEffect(() => {
        // Focus input when component mounts or verse changes
        inputRef.current?.focus();
        setStartTime(Date.now());
        setInput('');
        setShowCompletion(false);
    }, [currentVerseIndex, mode]);

    useEffect(() => {
        // Listen for Enter key on completion screen
        const handleKeyPress = (e: KeyboardEvent) => {
            if (showCompletion && e.key === 'Enter') {
                e.preventDefault();
                handleNextVerse();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showCompletion, currentVerseIndex, totalVerses]);

    const calculateMetrics = (text: string, targetText: string, timeMs: number): TypingMetrics => {
        const words = targetText.split(' ').length;
        const minutes = timeMs / 60000;
        const grossWPM = Math.round(words / minutes);

        // Calculate errors
        let errorCount = 0;
        for (let i = 0; i < Math.max(text.length, targetText.length); i++) {
            if (text[i] !== targetText[i]) errorCount++;
        }

        const accuracy = Math.round(((targetText.length - errorCount) / targetText.length) * 100);
        const netWPM = Math.max(0, Math.round(grossWPM - (errorCount / minutes)));

        return {
            grossWPM,
            netWPM,
            accuracy,
            charsTyped: text.length,
            errors: errorCount,
            durationMs: timeMs,
            errorMap: {}
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const lastChar = value[value.length - 1];

        // Basic keystroke tracking
        const event = {
            key: lastChar || 'Backspace',
            timestamp: Date.now(),
            eventType: 'keydown'
        };
        setKeystrokes(prev => [...prev, event]);

        setInput(value);

        // Check if completed
        if (value === currentVerse.text) {
            handleVerseComplete();
        }
    };

    const handleVerseComplete = () => {
        if (!startTime) return;

        const timeMs = Date.now() - startTime;
        const metrics = calculateMetrics(input, currentVerse.text, timeMs);

        const newCompletedVerses = [...completedVerses, { metrics, keystrokes }];
        setCompletedVerses(newCompletedVerses);
        setShowCompletion(true);
    };

    const handleNextVerse = () => {
        // In test mode, we only test one verse, so complete immediately
        if (mode === 'test') {
            setMode('complete');
            return;
        }

        // In practice mode, continue through all verses
        if (currentVerseIndex < totalVerses - 1) {
            setCurrentVerseIndex(currentVerseIndex + 1);
        } else {
            // All verses completed
            setMode('complete');
        }
    };

    const handleSkipToTest = () => {
        // Select a random verse from the chapter for the test
        const randomIndex = Math.floor(Math.random() * verses.length);
        setMode('test');
        setCurrentVerseIndex(randomIndex);
        setCompletedVerses([]);
    };

    const handleFinish = () => {
        // Map back to just metrics for the onComplete prop, 
        // but we'll need to update the prop signature if we want keystrokes in the parent.
        onComplete(completedVerses.map(v => v.metrics), completedVerses.map(v => v.keystrokes));
    };

    // Render character-by-character comparison
    const renderText = () => {
        const targetText = currentVerse.text;
        return (
            <div className="text-2xl leading-relaxed font-mono mb-8 p-6 bg-slate-50 rounded-2xl">
                {targetText.split('').map((char, idx) => {
                    const inputChar = input[idx];
                    let colorClass = 'text-gray-400';

                    if (inputChar !== undefined) {
                        if (inputChar === char) {
                            colorClass = 'text-green-600';
                        } else {
                            colorClass = 'text-red-600 bg-red-100';
                        }
                    }

                    return (
                        <span key={idx} className={colorClass}>
                            {char}
                        </span>
                    );
                })}
            </div>
        );
    };

    if (mode === 'complete') {
        const avgAccuracy = Math.round(
            completedVerses.reduce((sum, v) => sum + v.metrics.accuracy, 0) / completedVerses.length
        );
        const avgWPM = Math.round(
            completedVerses.reduce((sum, v) => sum + v.metrics.netWPM, 0) / completedVerses.length
        );

        return (
            <div className="max-w-4xl mx-auto p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                >
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-4xl font-bold mb-4">
                        {completedVerses.length === 1 ? 'Test Complete!' : 'Chapter Complete!'}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {completedVerses.length === 1
                            ? `You've completed the test verse: ${currentVerse.reference}`
                            : `You've completed all ${totalVerses} verses from ${currentVerse.book} Chapter ${currentVerse.chapter}`}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-2xl">
                            <div className="text-4xl font-bold text-blue-600">{avgWPM}</div>
                            <div className="text-sm text-gray-600 mt-2">Average WPM</div>
                        </div>
                        <div className="bg-green-50 p-6 rounded-2xl">
                            <div className="text-4xl font-bold text-green-600">{avgAccuracy}%</div>
                            <div className="text-sm text-gray-600 mt-2">Average Accuracy</div>
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        className="bg-primary-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all"
                    >
                        {completedVerses.length === 1 ? 'Finish Test' : 'Complete Chapter'}
                    </button>
                </motion.div>
            </div>
        );
    }

    if (showCompletion) {
        const lastEntry = completedVerses[completedVerses.length - 1];
        const lastMetrics = lastEntry.metrics;

        return (
            <div className="max-w-4xl mx-auto p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                >
                    <div className="text-5xl mb-6">✅</div>
                    <h2 className="text-3xl font-bold mb-4">
                        Verse {currentVerseIndex + 1} of {totalVerses} Complete!
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">{currentVerse.reference}</p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-2xl">
                            <div className="text-4xl font-bold text-blue-600">{lastMetrics.netWPM}</div>
                            <div className="text-sm text-gray-600 mt-2">WPM</div>
                        </div>
                        <div className="bg-green-50 p-6 rounded-2xl">
                            <div className="text-4xl font-bold text-green-600">{lastMetrics.accuracy}%</div>
                            <div className="text-sm text-gray-600 mt-2">Accuracy</div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleNextVerse}
                            className="bg-primary-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all"
                        >
                            {currentVerseIndex < totalVerses - 1 ? 'Next Verse (Press Enter)' : 'Complete Chapter'}
                        </button>
                        {mode === 'practice' && (
                            <button
                                onClick={handleSkipToTest}
                                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all"
                            >
                                Skip to Test
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8 flex justify-between items-center">
                <div>
                    <div className="text-sm font-bold uppercase tracking-wider mb-1">
                        {mode === 'practice' ? '📖 Practice Mode' : '🎯 Test Mode'}
                    </div>
                    <div className="text-2xl font-bold">
                        {mode === 'practice'
                            ? `Verses ${currentVerseIndex + 1} of ${totalVerses}`
                            : 'Test 1 of 1'}
                    </div>
                </div>
                <div className="flex gap-4">
                    {mode === 'practice' && (
                        <button
                            onClick={handleSkipToTest}
                            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Skip to Test
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Current Verse Reference */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{currentVerse.reference}</h2>
            </div>

            {/* Text Display */}
            {renderText()}

            {/* Input Area */}
            <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                className="w-full p-6 text-2xl font-mono border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Start typing the verse..."
                spellCheck={false}
            />

            {/* Progress Bar */}
            <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{currentVerseIndex + 1} / {totalVerses}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((currentVerseIndex + 1) / totalVerses) * 100}%` }}
                    />
                </div>
            </div>

            {/* ESV Copyright Notice */}
            <div className="mt-8 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                    Scripture quotations are from the <span className="font-semibold">ESV</span>® Bible.
                    {' '}
                    <a
                        href="https://www.esv.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                    >
                        www.esv.org
                    </a>
                </p>
            </div>
        </div>
    );
};

export default BibleLessonView;
