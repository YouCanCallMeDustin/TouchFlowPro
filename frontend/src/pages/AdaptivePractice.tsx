import React, { useState, useEffect } from 'react';
import TypingTest from '../components/TypingTest';
import type { TypingMetrics } from '@shared/types';
import { Brain, Target, Activity, ArrowRight, Home, Zap, Award } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface Props {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
}

const AdaptivePractice: React.FC<Props> = ({ userId, onSessionComplete }) => {
    const [loading, setLoading] = useState(true);
    const [troubleKeys, setTroubleKeys] = useState<string[]>([]);
    const [drillText, setDrillText] = useState<string>('');
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        fetchAdaptiveData();
    }, [userId]);

    const fetchAdaptiveData = async () => {
        try {
            setLoading(true);
            const response = await apiFetch(`/api/recommendations/${userId}`);
            const recommendations = await response.json();

            if (recommendations && recommendations.troubleKeys) {
                setTroubleKeys(recommendations.troubleKeys);
            }

            if (recommendations && recommendations.personalizedDrills && recommendations.personalizedDrills.length > 0) {
                setDrillText(recommendations.personalizedDrills[0].content);
            } else {
                setDrillText('The quick brown fox jumps over the lazy dog.');
            }
        } catch (error) {
            console.error('Failed to fetch adaptive data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-text-muted font-black uppercase tracking-widest text-xs">Analyzing Performance Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Tactical Header */}
            <div className="relative overflow-hidden card group min-h-[200px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Brain size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Adaptive Neural Path</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Operational Correction
                    </h1>
                    <p className="text-text-muted text-sm max-w-xl leading-relaxed opacity-70 uppercase tracking-widest font-black">
                        System generated remediation sequence targeting identified inefficiencies.
                    </p>
                </div>

                <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none overflow-hidden hidden md:block">
                    <Brain size={400} className="translate-x-20 -translate-y-20 rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Stats Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="card p-8 border border-white/5 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Target size={14} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Identified Friction</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {troubleKeys.length > 0 ? (
                                    troubleKeys.map(key => (
                                        <div key={key} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary shadow-lg shadow-primary/5">
                                            {key.toUpperCase()}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">No significant friction detected.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={14} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Mission Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-50">Active Module</div>
                                    <div className="text-xs font-black text-text-main uppercase tracking-wider">Dynamic Remediation</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-50">Operational Load</div>
                                    <div className="text-xs font-black text-text-main uppercase tracking-wider">Optimized Neural Sync</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                onClick={() => fetchAdaptiveData()}
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-3"
                            >
                                Re-Scan Performance
                            </button>
                        </div>
                    </div>

                    <div className="card p-8 bg-primary/5 border border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Award size={64} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Pro Tip</h4>
                        <p className="text-[11px] font-bold text-text-main/80 uppercase tracking-widest leading-relaxed relative z-10">
                            The adaptive engine prioritizes keys with high latency or error rates. Focus on deliberate, clean movements to recalibrate.
                        </p>
                    </div>
                </div>

                {/* Training Arena */}
                <div className="lg:col-span-2 space-y-8">
                    {!isStarted ? (
                        <div className="card p-12 text-center border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <Zap size={24} className="text-primary animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black text-text-main uppercase tracking-tighter mb-4">Neural Synchronization</h2>
                            <p className="text-text-muted text-sm max-w-sm mx-auto uppercase tracking-widest font-black opacity-50 mb-10">
                                Prepare for targeted operational sequence. Maintain maximum focus.
                            </p>
                            <button
                                onClick={() => setIsStarted(true)}
                                className="px-10 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.4em] text-[12px] shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 mx-auto"
                            >
                                Initiate Sequence <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <TypingTest
                                text={drillText}
                                onComplete={async (metrics, ks) => {
                                    if (onSessionComplete) {
                                        await onSessionComplete(metrics, 'adaptive', 'adaptive-scan', ks);
                                    }
                                    setIsStarted(false);
                                    fetchAdaptiveData();
                                }}
                            />
                            <button
                                onClick={() => setIsStarted(false)}
                                className="px-6 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all flex items-center gap-2"
                            >
                                <Home size={14} /> Mission Abort
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdaptivePractice;
