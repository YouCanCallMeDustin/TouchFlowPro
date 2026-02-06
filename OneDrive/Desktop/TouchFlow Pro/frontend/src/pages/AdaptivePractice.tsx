import React, { useState, useEffect } from 'react';
import TypingTest from '../components/TypingTest';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types';

interface Props {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
}

const AdaptivePractice: React.FC<Props> = ({ userId, onSessionComplete }) => {
    const [practiceText, setPracticeText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [metrics, setMetrics] = useState<TypingMetrics | null>(null);
    const [troubleKeys, setTroubleKeys] = useState<string[]>([]);

    useEffect(() => {
        loadAdaptiveDrill();
    }, [userId]);

    const loadAdaptiveDrill = async () => {
        try {
            setLoading(true);

            // Get recommendations (which includes personalized drills)
            const response = await fetch(`/api/recommendations/${userId}`);
            const recommendations = await response.json();

            // Find the first custom drill (trouble key practice)
            const customDrill = recommendations.find((r: any) => r.type === 'custom' && r.content);

            if (customDrill) {
                setPracticeText(customDrill.content);
                // Extract trouble keys from title
                const keys = customDrill.title.match(/[a-z]/gi) || [];
                setTroubleKeys(keys);
            } else {
                // Fallback to a default drill
                setPracticeText('the quick brown fox jumps over the lazy dog');
            }
        } catch (error) {
            console.error('Failed to load adaptive drill:', error);
            setPracticeText('the quick brown fox jumps over the lazy dog');
        } finally {
            setLoading(false);
        }
    };

    const [xpEarned, setXpEarned] = useState<number | null>(null);

    const handleComplete = async (completedMetrics: TypingMetrics, keystrokes: KeystrokeEvent[]) => {
        setMetrics(completedMetrics);
        setSessionComplete(true);

        // Record session
        try {
            if (onSessionComplete) {
                const data = await onSessionComplete(
                    completedMetrics,
                    'adaptive',
                    'adaptive-personal',
                    keystrokes
                );
                if (data && data.xpEarned) {
                    setXpEarned(data.xpEarned);
                }
            } else {
                // Fallback for standalone mode
                await fetch('/api/keystroke-tracking/record', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        keystrokes,
                        metrics: completedMetrics
                    })
                });
            }
        } catch (error) {
            console.error('Failed to record session:', error);
        }
    };

    const handleNextDrill = () => {
        setSessionComplete(false);
        setMetrics(null);
        loadAdaptiveDrill();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8 flex items-center justify-center">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-12 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <span className="text-4xl">🧠</span>
                    </div>
                    <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Analyzing Your Performance...</h2>
                    <p className="text-slate-600">Generating personalized practice drill</p>
                </div>
            </div>
        );
    }

    if (sessionComplete && metrics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8 flex items-center justify-center">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span className="text-5xl">🎯</span>
                        </div>
                        <h2 className="text-3xl font-heading font-black text-slate-900 mb-2">Session Complete!</h2>
                        <p className="text-slate-600">Great work on your adaptive practice</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 text-center">
                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Net WPM</div>
                            <div className="text-4xl font-heading font-black text-blue-700">{Math.round(metrics.netWPM)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-6 text-center">
                            <div className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">Accuracy</div>
                            <div className="text-4xl font-heading font-black text-teal-700">{Math.round(metrics.accuracy)}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 text-center">
                            <div className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-2">XP Gained</div>
                            <div className="text-4xl font-heading font-black text-yellow-700">+{xpEarned || 0}</div>
                        </div>
                    </div>

                    {troubleKeys.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
                            <h3 className="text-lg font-bold text-purple-900 mb-3">Keys Practiced</h3>
                            <div className="flex flex-wrap gap-2">
                                {troubleKeys.map(key => (
                                    <div key={key} className="px-4 py-2 bg-white border border-purple-300 rounded-lg font-mono font-bold text-purple-700">
                                        {key}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={handleNextDrill}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95"
                        >
                            Next Adaptive Drill →
                        </button>
                        <button
                            onClick={() => window.location.href = '/practice'}
                            className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                            Back to Practice
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        <span className="text-purple-700 font-black uppercase tracking-wider text-xs">Adaptive Learning</span>
                    </div>
                    <h1 className="text-5xl font-heading font-black text-slate-900 mb-3">Personalized Practice</h1>
                    <p className="text-xl text-slate-600">AI-generated drill targeting your weak keys</p>
                </div>

                {/* Info Card */}
                {troubleKeys.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-8 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                🎯
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 mb-1">Focusing on: {troubleKeys.join(', ')}</h3>
                                <p className="text-sm text-slate-600">This drill is optimized to improve your accuracy on these keys</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Typing Test */}
                <TypingTest
                    text={practiceText}
                    onComplete={handleComplete}
                    showLiveMetrics={true}
                    showVirtualKeyboard={true}
                />

                {/* Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span>💡</span> Adaptive Practice Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Focus on accuracy first - speed will come naturally</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Use the virtual keyboard to learn correct finger placement</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>Practice daily for best results - consistency is key</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdaptivePractice;
