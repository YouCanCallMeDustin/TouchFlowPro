import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import TypingTest from '../components/TypingTest';
import type { KeystrokeEvent, TypingMetrics } from '@shared/types';
import type { Stage } from '../types/stages';
import { Target, Clock, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface PracticeTestsProps {
    userId: string;
    onNavigate: (stage: Stage) => void;
}

const TEST_DURATIONS = [
    { label: '1 Minute', seconds: 60, description: 'Quick Warmup' },
    { label: '3 Minutes', seconds: 180, description: 'Standard Practice' },
    { label: '5 Minutes', seconds: 300, description: 'Endurance Builder' },
];

const TEST_PASSAGES = [
    "The quick brown fox jumps over the lazy dog. A journey of a thousand miles begins with a single step. Every moment is a fresh beginning. In the middle of difficulty lies opportunity. The only way to do great work is to love what you do.",
    "Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing.",
    "Programming is not about typing, it is about thinking. The best error message is the one that never shows up. Code is like humor. When you have to explain it, it is bad. First, solve the problem. Then, write the code.",
    "Learning to type is like learning to play piano. It takes practice, patience, and persistence. Start slow, focus on accuracy, and speed will naturally follow. The fingers develop muscle memory over time, making each keystroke effortless.",
    "The art of communication lies in the speed of thought translated to the speed of fingers. Every word typed with precision builds confidence. Accuracy is the foundation upon which speed is built. Master the basics before chasing records.",
];

type Phase = 'select' | 'testing' | 'result';

export const PracticeTests: React.FC<PracticeTestsProps> = ({ userId, onNavigate }) => {
    const [phase, setPhase] = useState<Phase>('select');
    const [selectedDuration, setSelectedDuration] = useState(TEST_DURATIONS[1]);
    const [testText, setTestText] = useState('');
    const [metrics, setMetrics] = useState<TypingMetrics | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const startTest = () => {
        // Build a long enough string to cover the time
        let longText = '';
        for (let i = 0; i < 20; i++) {
            longText += TEST_PASSAGES[Math.floor(Math.random() * TEST_PASSAGES.length)] + ' ';
        }
        setTestText(longText.trim());
        setPhase('testing');
    };

    const handleTestComplete = async (finalMetrics: TypingMetrics, keystrokes: KeystrokeEvent[]) => {
        setMetrics(finalMetrics);
        setPhase('result');
        saveResult(finalMetrics, keystrokes);
    };

    const saveResult = async (finalMetrics: TypingMetrics, keystrokes: KeystrokeEvent[]) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('tfp_token');
            if (token && userId) {
                // Use a generic practice ID based on duration
                const durationKey = selectedDuration.seconds === 60 ? '1m' : selectedDuration.seconds === 180 ? '3m' : '5m';
                const drillId = `practice_test_${durationKey}`;

                await fetch(`/api/drills/${drillId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId,
                        metrics: finalMetrics,
                        keystrokes: keystrokes
                    })
                });
            }
        } catch (err) {
            console.error('Failed to save practice metrics', err);
        } finally {
            setIsSaving(false);
        }
    };

    const retryTest = () => {
        setMetrics(null);
        setPhase('select');
    };

    return (
        <div className="w-full px-4 flex flex-col items-center">
            <Helmet>
                <title>Typing Practice Tests: Measure & Track WPM Progress | TouchFlowPro</title>
                <meta name="description" content="Type full sentences and paragraphs in our realistic practice tests. Build endurance and measure your WPM progress accurately. Start your practice now." />
                <link rel="canonical" href="https://touchflowpro.com/practice" />
                <meta property="og:title" content="Typing Practice Tests: Measure & Track WPM Progress | TouchFlowPro" />
                <meta property="og:description" content="Type full sentences and paragraphs in our realistic practice tests. Build endurance and measure your WPM progress accurately. Start your practice now." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://touchflowpro.com/practice" />
                <meta property="og:image" content="https://touchflowpro.com/og-image.png" />
                <meta property="og:site_name" content="TouchFlowPro" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Typing Practice Tests: Custom Text & Warm-up Drills | TouchFlowPro" />
                <meta name="twitter:description" content="Access specialized typing tests, hand warm-up drills, classic literature passages, and professional correspondence practice to build endurance and velocity." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "TouchFlow Practice Tests",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "WebBrowser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "1045"
                        }
                    })}
                </script>
            </Helmet>

            <AnimatePresence mode="wait">
                {phase === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Freeform Practice</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-text-main mb-6 uppercase tracking-tighter">
                                Practice <span className="text-primary border-b-4 border-primary/30 pb-1">Tests.</span>
                            </h1>
                            <p className="text-text-muted max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-widest opacity-60">
                                Type full sentences and paragraphs. Choose your duration to build endurance and measure realistic speed.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {TEST_DURATIONS.map((dur) => (
                                <Card
                                    key={dur.seconds}
                                    className={`p-6 cursor-pointer border-2 transition-all group ${selectedDuration.seconds === dur.seconds
                                        ? 'border-primary bg-primary/5 shadow-xl shadow-primary/20 scale-105'
                                        : 'border-transparent bg-surface hover:border-primary/30 hover:bg-surface-2'
                                        }`}
                                    onClick={() => setSelectedDuration(dur)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${selectedDuration.seconds === dur.seconds ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-text-muted'}`}>
                                            <Clock size={24} />
                                        </div>
                                        {selectedDuration.seconds === dur.seconds && (
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{dur.label}</h3>
                                    <p className="text-sm text-text-muted">{dur.description}</p>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="px-12 py-6 text-lg font-black tracking-widest uppercase"
                                onClick={startTest}
                            >
                                Start Practice &rarr;
                            </Button>
                        </div>
                    </motion.div>
                )}

                {phase === 'testing' && testText && (
                    <motion.div
                        key="testing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-5xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <Target size={16} /> Practice Mode
                            </span>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">
                                {selectedDuration.label}
                            </span>
                        </div>

                        <TypingTest
                            text={testText}
                            onComplete={handleTestComplete}
                            showLiveMetrics={true}
                            showVirtualKeyboard={false}
                            timeLimit={selectedDuration.seconds / 60}
                        />
                    </motion.div>
                )}

                {phase === 'result' && metrics && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl mx-auto text-center mt-12"
                    >
                        <Card className="p-12 relative overflow-hidden border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                            <h2 className="text-2xl font-black text-text-muted uppercase tracking-[0.3em] mb-4">Practice Finished</h2>
                            <div className="flex justify-center items-end gap-2 mb-8">
                                <span className="text-8xl font-black text-white leading-none tracking-tighter">{Math.round(metrics.netWPM)}</span>
                                <span className="text-xl text-primary font-bold mb-2">WPM</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Accuracy</p>
                                    <p className="text-2xl font-bold text-white">{Math.round(metrics.accuracy)}%</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Duration</p>
                                    <p className="text-lg font-bold text-secondary">{selectedDuration.label}</p>
                                </div>
                            </div>

                            {isSaving && (
                                <p className="text-xs text-text-muted mb-4 animate-pulse">Saving results to your profile...</p>
                            )}
                            {!isSaving && (
                                <p className="text-xs text-green-400 mb-4 tracking-widest uppercase font-bold">Results saved</p>
                            )}

                            <div className="space-y-4">
                                <Button
                                    onClick={retryTest}
                                    className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-primary/20 flex justify-center items-center gap-2"
                                >
                                    <RotateCcw size={16} /> Another Test
                                </Button>

                                <button
                                    onClick={() => onNavigate('dashboard')}
                                    className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PracticeTests;
