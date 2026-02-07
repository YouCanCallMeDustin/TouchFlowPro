import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FINGER_MAP, getFingerName } from '../utils/fingerMapping';
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
                    const finger = FINGER_MAP[s.key.toLowerCase()];
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
        if (total < 10) return 'bg-text-main/10 text-text-muted border-transparent';
        if (accuracy >= 97) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        if (accuracy >= 94) return 'bg-primary/20 text-primary border-primary/30';
        if (accuracy >= 90) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    };

    if (loading) return null;

    const leftHand = fingerStats.filter(s => s.finger.startsWith('left'));
    const rightHand = fingerStats.filter(s => s.finger.startsWith('right')).reverse(); // reverse for visual symmetry

    return (
        <div className="card p-8">
            <h2 className="text-2xl font-black text-text-main mb-8 flex items-center gap-3 tracking-tight">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">✋</span>
                Finger Accuracy Distribution
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Visual Representation */}
                <div className="flex justify-center items-end gap-12 h-[28rem] bg-slate-500/5 dark:bg-text-main/5 rounded-[2.5rem] p-12 border border-slate-200/50 dark:border-white/5 relative overflow-hidden group/chart">
                    <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-10" />
                    {/* Left Hand */}
                    <div className="flex gap-4 items-end relative z-10 transition-transform duration-500 group-hover/chart:translate-x-[-10px]">
                        {leftHand.map(s => (
                            <div key={s.finger} className="flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(20, s.accuracy)}%` }}
                                    className={`w-12 rounded-t-2xl border-t-2 shadow-2xl ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500 relative group`}
                                >
                                    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                                </motion.div>
                                <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest">
                                    {s.finger.split('_')[1].substring(0, 3)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="w-px h-48 bg-slate-200 dark:bg-text-main/10 mx-6 opacity-40" />

                    {/* Right Hand */}
                    <div className="flex gap-4 items-end relative z-10 transition-transform duration-500 group-hover/chart:translate-x-[10px]">
                        {rightHand.map(s => (
                            <div key={s.finger} className="flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(20, s.accuracy)}%` }}
                                    className={`w-12 rounded-t-2xl border-t-2 shadow-2xl ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500 relative group`}
                                >
                                    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                                </motion.div>
                                <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest">
                                    {s.finger.split('_')[1].substring(0, 3)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 opacity-40">Diagnostic Matrix</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fingerStats.filter(s => s.totalAttempts > 0).map(s => (
                            <div key={s.finger} className="p-4 rounded-2xl border border-white/5 bg-text-main/5 hover:bg-text-main/10 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-text-muted uppercase tracking-wider">{getFingerName(s.finger)}</span>
                                    <span className={`text-sm font-black ${s.accuracy >= 95 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {s.accuracy.toFixed(1)}%
                                    </span>
                                </div>
                                {s.troubleKeys.length > 0 && (
                                    <div className="flex gap-2 mt-3">
                                        {s.troubleKeys.map(k => (
                                            <span key={k} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-mono text-text-muted border border-white/5">
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
