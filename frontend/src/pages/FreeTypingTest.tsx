import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TypingTest from '../components/TypingTest';
import { PlacementEngine } from '@shared/placement';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface FreeTypingTestProps {
    onNavigate: (stage: string) => void;
}

// Engaging strings to pull from to keep the test interesting
const TEST_TEXTS = [
    "Most typists plateau around sixty words per minute because they train their hands to execute words letter by letter instead of recognizing the overarching patterns. True speed is achieved when the brain stops processing individual characters and begins sending entire syllables to the fingers in a single fluid command. This is why practicing random words often fails to produce meaningful improvement in real world scenarios.",
    "The modern keyboard was engineered specifically to prevent mechanical typewriters from jamming. This fact highlights the bizarre reality that we currently use a layout designed to slow us down. Overcoming this requires building specialized muscle memory that bypasses the inefficient key spacing. When you achieve flow state at the keyboard, your fingers dance across the plastic without conscious thought, translating ideas directly into the digital realm.",
    "Data analysis suggests that professional programmers spend less than thirty percent of their time actively typing. However, when the time comes to execute logic, a slow typing speed acts as a massive bottleneck to thought. If you must hunt for a semicolon or awkwardly contort your hand to reach the curly braces, your concentration breaks. Mastering the symbol keys is the easiest way to increase your coding velocity."
];

export const FreeTypingTest: React.FC<FreeTypingTestProps> = ({ onNavigate }) => {
    const [result, setResult] = useState<TypingMetrics | null>(null);
    const [tier, setTier] = useState<string>('');
    const [testText, setTestText] = useState(TEST_TEXTS[Math.floor(Math.random() * TEST_TEXTS.length)]);

    const handleTestComplete = (metrics: TypingMetrics, _keystrokes: KeystrokeEvent[]) => {
        const placement = PlacementEngine.calculatePlacement(metrics);
        setResult(metrics);
        setTier(placement.level);
    };

    const handleRestart = () => {
        setResult(null);
        setTestText(TEST_TEXTS[Math.floor(Math.random() * TEST_TEXTS.length)]);
    };

    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">

            {!result ? (
                <div className="w-full max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Free Assessment</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-text-main mb-6 uppercase tracking-tighter">
                            1-Minute <span className="text-primary border-b-4 border-primary/30 pb-1">Speed Test.</span>
                        </h1>
                        <p className="text-text-muted max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-widest opacity-60">
                            Discover your baseline speed, accuracy, and operational tier. No signup required.
                        </p>
                    </motion.div>

                    <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse opacity-50" />

                        <TypingTest
                            text={testText}
                            onComplete={handleTestComplete}
                            showLiveMetrics={true}
                            showVirtualKeyboard={false}
                            timeLimit={1}
                        />
                    </Card>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl mx-auto text-center mt-12"
                >
                    <Card className="p-12 relative overflow-hidden border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                        <h2 className="text-2xl font-black text-text-muted uppercase tracking-[0.3em] mb-4">Your Results</h2>
                        <div className="flex justify-center items-end gap-2 mb-8">
                            <span className="text-8xl font-black text-white leading-none tracking-tighter">{Math.round(result.netWPM)}</span>
                            <span className="text-xl text-primary font-bold mb-2">WPM</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Accuracy</p>
                                <p className="text-2xl font-bold text-white">{Math.round(result.accuracy)}%</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Performance Tier</p>
                                <p className="text-lg font-bold text-secondary uppercase italic">{tier}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={() => onNavigate('auth_signup')}
                                className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-primary/20"
                            >
                                Save Score & Start Training &rarr;
                            </Button>

                            <button
                                onClick={handleRestart}
                                className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                            >
                                Try Again
                            </button>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default FreeTypingTest;
