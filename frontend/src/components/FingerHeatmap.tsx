import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFingerName, getFingerForKey } from '../utils/fingerMapping';
import type { Finger } from '../utils/fingerMapping';
import { useAuth } from '../context/AuthContext';

interface KeyStats {
    key: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    averageSpeed: number;
}

interface FingerStats {
    finger: Finger;
    accuracy: number;
    totalAttempts: number;
    averageSpeed: number;
    troubleKeys: string[];
}

interface FingerHeatmapProps {
    userId: string;
}

export const FingerHeatmap: React.FC<FingerHeatmapProps> = ({ userId }) => {
    const { token } = useAuth();
    const [fingerStats, setFingerStats] = useState<FingerStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [userId]);

    const fetchStats = async () => {
        if (!userId || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/keystroke-tracking/stats/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const stats: KeyStats[] = await response.json();

                // ... (rest of the aggregation logic stays the same)
                const aggregation: Record<Finger, { correct: number, total: number, speeds: number[], troubleKeys: Set<string> }> = {
                    left_pinky: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    left_ring: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    left_middle: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    left_index: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    right_index: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    right_middle: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    right_ring: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    right_pinky: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                    thumb: { correct: 0, total: 0, speeds: [], troubleKeys: new Set() },
                };

                stats.forEach(s => {
                    const finger = getFingerForKey(s.key);
                    if (finger && aggregation[finger]) {
                        aggregation[finger].correct += s.correctAttempts;
                        aggregation[finger].total += s.totalAttempts;
                        aggregation[finger].speeds.push(s.averageSpeed);
                        if (s.accuracy < 90 && s.totalAttempts >= 5) {
                            aggregation[finger].troubleKeys.add(s.key);
                        }
                    }
                });

                const finalStats: FingerStats[] = (Object.keys(aggregation) as Finger[]).map(f => {
                    const data = aggregation[f];
                    const avgSpeed = data.speeds.length > 0
                        ? data.speeds.reduce((a, b) => a + b, 0) / data.speeds.length
                        : 0;

                    return {
                        finger: f,
                        accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 100,
                        totalAttempts: data.total,
                        averageSpeed: avgSpeed,
                        troubleKeys: Array.from(data.troubleKeys).slice(0, 3)
                    };
                });

                setFingerStats(finalStats);
            }
        } catch (error) {
            console.error('Failed to fetch finger stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFingerColor = (accuracy: number, total: number) => {
        if (total < 5) return 'bg-slate-500/10 text-text-muted border-transparent';
        if (accuracy >= 97) return 'bg-emerald-500/40 text-emerald-400 border-emerald-500/50';
        if (accuracy >= 94) return 'bg-primary/40 text-primary border-primary/50';
        if (accuracy >= 90) return 'bg-amber-500/40 text-amber-400 border-amber-500/50';
        return 'bg-rose-500/40 text-rose-400 border-rose-500/50';
    };

    if (loading) return null;

    const leftHand = fingerStats.filter(s => s.finger.startsWith('left'));
    const rightHand = fingerStats.filter(s => s.finger.startsWith('right'));

    return (
        <div className="card p-8">
            <h2 className="text-2xl font-black text-text-main mb-8 flex items-center gap-3 tracking-tight">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">✋</span>
                Finger Accuracy Distribution
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Visual Representation */}
                <div className="xl:col-span-2 flex justify-center items-end gap-4 h-80 bg-slate-500/5 dark:bg-text-main/5 rounded-[2.5rem] p-8 border border-slate-200/50 dark:border-white/5 relative overflow-hidden group/chart">
                    <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-10" />

                    {/* 95% Target Line */}
                    <div className="absolute left-0 right-0 border-t border-dashed border-white/10 dark:border-white/10 z-0 flex items-center px-6" style={{ bottom: '95%' }}>
                        <span className="text-[8px] font-black text-text-muted/30 uppercase tracking-[0.2em]">Target 95%</span>
                    </div>

                    {/* Left Hand Group */}
                    <div className="flex gap-1.5 items-end relative z-10 transition-transform duration-500 group-hover/chart:-translate-x-2">
                        {leftHand.map(s => (
                            <div key={s.finger} className="flex flex-col items-center gap-3 w-12 relative group">
                                {/* Track */}
                                <div className="absolute inset-0 bottom-6 bg-white/5 rounded-t-xl z-0" />

                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, s.accuracy)}%` }}
                                    className={`w-full rounded-t-xl border-t-2 shadow-2xl relative z-10 overflow-hidden ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500 group`}
                                >
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50">
                                        {s.accuracy.toFixed(1)}% ({s.totalAttempts} hits)
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                                <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest truncate w-full text-center relative z-10">
                                    {s.finger.split('_')[1].substring(0, 3)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="w-px h-full bg-white/5 mx-1 shrink-0 self-center relative z-10" />

                    {/* Thumb Group */}
                    <div className="flex flex-col items-center gap-3 w-14 relative z-10 group">
                        {fingerStats.filter(s => s.finger === 'thumb').map(s => (
                            <React.Fragment key={s.finger}>
                                {/* Track */}
                                <div className="absolute inset-0 bottom-6 bg-white/5 rounded-t-xl z-0" />

                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, s.accuracy)}%` }}
                                    className={`w-full rounded-t-xl border-t-2 shadow-2xl relative z-10 overflow-hidden ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500`}
                                >
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50">
                                        {s.accuracy.toFixed(1)}% ({s.totalAttempts} hits)
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest text-center relative z-10">
                                    THU
                                </span>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="w-px h-full bg-white/5 mx-1 shrink-0 self-center relative z-10" />

                    {/* Right Hand Group */}
                    <div className="flex gap-1.5 items-end relative z-10 transition-transform duration-500 group-hover/chart:translate-x-2">
                        {rightHand.map(s => (
                            <div key={s.finger} className="flex flex-col items-center gap-3 w-12 relative group">
                                {/* Track */}
                                <div className="absolute inset-0 bottom-6 bg-white/5 rounded-t-xl z-0" />

                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, s.accuracy)}%` }}
                                    className={`w-full rounded-t-xl border-t-2 shadow-2xl relative z-10 overflow-hidden ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500 group`}
                                >
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50">
                                        {s.accuracy.toFixed(1)}% ({s.totalAttempts} hits)
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                                <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest truncate w-full text-center relative z-10">
                                    {s.finger.split('_')[1].substring(0, 3)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 opacity-40">Diagnostic Matrix</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                        {fingerStats.filter(s => s.totalAttempts > 0).map(s => (
                            <div key={s.finger} className="p-4 rounded-2xl border border-white/5 bg-text-main/5 hover:bg-text-main/10 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{getFingerName(s.finger)}</span>
                                    <span className={`text-xs font-black ${s.accuracy >= 94 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {s.accuracy.toFixed(1)}%
                                    </span>
                                </div>
                                {s.troubleKeys.length > 0 && (
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                        {s.troubleKeys.map(k => (
                                            <span key={k} className="px-1.5 py-0.5 bg-white/5 rounded-md text-[9px] font-mono text-text-muted/80 border border-white/5">
                                                {k === ' ' ? 'SPC' : k.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
