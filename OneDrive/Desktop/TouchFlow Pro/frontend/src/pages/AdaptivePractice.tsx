import React, { useState, useEffect } from 'react';
import TypingTest from '../components/TypingTest';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types';
import { Brain, Target, Activity, ArrowRight, Home, Zap, Award } from 'lucide-react';

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
    const [xpEarned, setXpEarned] = useState<number | null>(null);

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
            <div className="min-h-[80vh] flex items-center justify-center p-8">
                <div className="card text-center max-w-md w-full border border-white/5">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse border border-primary/20">
                        <Brain size={32} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-text-main mb-2 uppercase tracking-tighter">Analyzing Performance</h2>
                    <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Generating personalized neural-sync drill</p>
                </div>
            </div>
        );
    }

    if (sessionComplete && metrics) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-10 space-y-10">
                <div className="card border border-white/5 relative overflow-hidden">
                    <div className="relative z-10 text-center mb-12">
                        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-2xl">
                            <Target size={40} className="text-primary" />
                        </div>
                        <h2 className="text-4xl font-black text-text-main mb-2 uppercase tracking-tighter">Session Complete</h2>
                        <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40">Adaptive Calibration Successful</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center group hover:border-primary/20 transition-all">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-40">Net Velocity</div>
                            <div className="text-5xl font-black text-text-main tracking-tighter group-hover:text-primary transition-colors">{Math.round(metrics.netWPM)} <span className="text-xs opacity-20">WPM</span></div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center group hover:border-secondary/20 transition-all">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-40">Accuracy</div>
                            <div className="text-5xl font-black text-text-main tracking-tighter group-hover:text-secondary transition-colors">{Math.round(metrics.accuracy)}%</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center group hover:border-orange-500/20 transition-all">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-40">XP Earned</div>
                            <div className="text-5xl font-black text-text-main tracking-tighter text-orange-400">+{xpEarned || 0}</div>
                        </div>
                    </div>

                    {troubleKeys.length > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 mb-12 overflow-hidden relative">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity size={16} className="text-primary opacity-50" />
                                <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Keys Refined</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {troubleKeys.map(key => (
                                    <div key={key} className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl font-mono font-bold text-text-main uppercase tracking-widest hover:border-primary/40 transition-colors">
                                        {key}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleNextDrill}
                            className="flex-1 px-8 py-5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Execute Next Drill
                            <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => window.location.href = '/practice'}
                            className="px-8 py-5 bg-white/5 text-text-muted rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-text-main transition-all flex items-center justify-center gap-3"
                        >
                            <Home size={16} />
                            Exit to Command
                        </button>
                    </div>

                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-10 space-y-12">
            {/* Header */}
            {/* Header */}
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-12">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Brain size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Neural Adaptation Mode</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Strategic Practice
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                        AI-optimized targeting for <span className="text-primary font-black uppercase tracking-wider">Precision Refinement</span>. Calibrate your neural pathways.
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
            </div>

            {/* Info Card */}
            {troubleKeys.length > 0 && (
                <div className="card border border-white/5 group relative overflow-hidden py-8">
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-700">
                            <Zap size={28} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Focus Vectors</h3>
                            <div className="text-2xl font-black text-text-main tracking-tighter uppercase truncate">Targeting: {troubleKeys.join(', ')}</div>
                            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest opacity-30 mt-2">Heuristic optimization active for accuracy enhancement</p>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            {/* Typing Test */}
            <TypingTest
                text={practiceText}
                onComplete={handleComplete}
                showLiveMetrics={true}
                showVirtualKeyboard={true}
            />

            {/* Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {[
                    { title: "Priority One", desc: "Focus on accuracy first — velocity is a byproduct of precision.", icon: Target },
                    { title: "Kinetic Learning", desc: "Use the virtual interface to anchor correct finger placement metrics.", icon: Activity },
                    { title: "Sync Routine", desc: "Consistent neural-sync sessions yield exponential performance growth.", icon: Award }
                ].map((tip, i) => (
                    <div key={i} className="card p-8 border border-white/5 hover:border-white/10 transition-colors">
                        <tip.icon size={20} className="text-primary mb-6 opacity-60" />
                        <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] mb-3">{tip.title}</h4>
                        <p className="text-[11px] font-black text-text-main uppercase tracking-widest leading-loose opacity-60">{tip.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdaptivePractice;
