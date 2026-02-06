import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FINGER_MAP, getFingerName } from '../utils/fingerMapping';
import type { Finger } from '../utils/fingerMapping';

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
    const [fingerStats, setFingerStats] = useState<FingerStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [userId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/keystroke-tracking/stats/${userId}`);
            if (response.ok) {
                const stats: KeyStats[] = await response.json();

                // Aggregate by finger
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
        if (total < 10) return 'bg-slate-200 text-slate-500';
        if (accuracy >= 97) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (accuracy >= 94) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (accuracy >= 90) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-rose-100 text-rose-700 border-rose-200';
    };

    if (loading) return null;

    const leftHand = fingerStats.filter(s => s.finger.startsWith('left'));
    const rightHand = fingerStats.filter(s => s.finger.startsWith('right')).reverse(); // reverse for visual symmetry

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                ✋ Finger Accuracy Distribution
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Visual Representation (Simplified) */}
                <div className="flex justify-center items-end gap-8 h-64 bg-slate-50 rounded-3xl p-8">
                    {/* Left Hand */}
                    <div className="flex gap-2 items-end">
                        {leftHand.map(s => (
                            <div key={s.finger} className="flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(20, s.accuracy)}%` }}
                                    className={`w-8 rounded-t-lg border-t-2 ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all`}
                                />
                                <span className="text-[10px] font-bold text-slate-400 rotate-45 mt-2">
                                    {s.finger.split('_')[1].toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Right Hand */}
                    <div className="flex gap-2 items-end">
                        {rightHand.map(s => (
                            <div key={s.finger} className="flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(20, s.accuracy)}%` }}
                                    className={`w-8 rounded-t-lg border-t-2 ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all`}
                                />
                                <span className="text-[10px] font-bold text-slate-400 -rotate-45 mt-2">
                                    {s.finger.split('_')[1].toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Diagnostic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fingerStats.filter(s => s.totalAttempts > 0).map(s => (
                            <div key={s.finger} className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-slate-600">{getFingerName(s.finger)}</span>
                                    <span className={`text-xs font-black ${s.accuracy >= 95 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {s.accuracy.toFixed(1)}%
                                    </span>
                                </div>
                                {s.troubleKeys.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                        {s.troubleKeys.map(k => (
                                            <span key={k} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500">
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
