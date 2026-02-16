import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Zap, ChevronRight, Info } from 'lucide-react';
import { getFingerName, getFingerForKey } from '../utils/fingerMapping';
import type { Finger } from '../utils/fingerMapping';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useLaunchStore } from '../state/launchStore';

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
    const [allKeyStats, setAllKeyStats] = useState<KeyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFinger, setSelectedFinger] = useState<FingerStats | null>(null);

    useEffect(() => {
        fetchStats();
    }, [userId]);

    const fetchStats = async () => {
        if (!userId || !token) return;

        try {
            setLoading(true);
            const response = await apiFetch(`/api/keystroke-tracking/stats/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const stats: KeyStats[] = await response.json();

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

                // Deduplicate and aggregate stats by lowercased key
                const deduplicatedStats: Record<string, KeyStats> = {};
                stats.forEach(s => {
                    const k = s.key.toLowerCase();
                    if (!deduplicatedStats[k]) {
                        deduplicatedStats[k] = { ...s, key: k };
                    } else {
                        const existing = deduplicatedStats[k];
                        const total = existing.totalAttempts + s.totalAttempts;
                        const correct = existing.correctAttempts + s.correctAttempts;
                        const avgSpeed = total > 0
                            ? (existing.averageSpeed * existing.totalAttempts + s.averageSpeed * s.totalAttempts) / total
                            : 0;
                        deduplicatedStats[k] = {
                            key: k,
                            totalAttempts: total,
                            correctAttempts: correct,
                            accuracy: total > 0 ? (correct / total) * 100 : 100,
                            averageSpeed: avgSpeed
                        };
                    }
                });

                const finalKeyStats = Object.values(deduplicatedStats);
                setAllKeyStats(finalKeyStats);
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
            <h2 className="text-2xl font-black text-text-main mb-8 flex items-center justify-between tracking-tight">
                <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">✋</span>
                    Finger Accuracy Distribution
                </div>
                <div className="group relative">
                    <HelpCircle size={18} className="text-text-muted hover:text-primary cursor-help transition-colors" />
                    <div className="absolute top-full right-0 mt-3 w-64 p-4 bg-slate-900 border border-white/10 rounded-2xl text-[10px] text-text-muted leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        <p className="font-bold text-text-main mb-1 uppercase tracking-widest">About this Chart</p>
                        This distribution shows your accuracy per finger based on specific key hits. The dash line represents the <span className="text-primary">Elite 95%</span> threshold. Click any finger index for diagnostic details.
                    </div>
                </div>
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
                                <div className="absolute inset-0 bottom-6 bg-white/5 rounded-t-xl z-0" />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, s.accuracy)}%` }}
                                    className={`w-full rounded-t-xl border-t-2 shadow-2xl relative z-10 overflow-hidden ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500 group`}
                                >
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
                                <div className="absolute inset-0 bottom-6 bg-white/5 rounded-t-xl z-0" />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, s.accuracy)}%` }}
                                    className={`w-full rounded-t-xl border-t-2 shadow-2xl relative z-10 overflow-hidden ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500`}
                                >
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
                                <div className="absolute inset-0 bottom-6 bg-white/5 rounded-t-xl z-0" />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(10, s.accuracy)}%` }}
                                    className={`w-full rounded-t-xl border-t-2 shadow-2xl relative z-10 overflow-hidden ${getFingerColor(s.accuracy, s.totalAttempts)} transition-all duration-500 group`}
                                >
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
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Diagnostic Matrix</h3>
                        <div className="group relative">
                            <Info size={14} className="text-text-muted hover:text-primary cursor-help opacity-40" />
                            <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-900 border border-white/10 rounded-xl text-[9px] text-text-muted leading-tight opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                Click a card to view specific key performance and generate targeted letter drills.
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                        {fingerStats.filter(s => s.totalAttempts > 0).map(s => (
                            <button
                                key={s.finger}
                                onClick={() => setSelectedFinger(s)}
                                className="p-4 rounded-2xl border border-white/5 bg-text-main/5 hover:bg-text-main/10 hover:border-primary/20 transition-all text-left group/card relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{getFingerName(s.finger)}</span>
                                    <span className={`text-xs font-black ${s.accuracy >= 94 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {s.accuracy.toFixed(1)}%
                                    </span>
                                </div>
                                {s.troubleKeys.length > 0 && (
                                    <div className="flex gap-1.5 mt-2 flex-wrap relative z-10">
                                        {s.troubleKeys.map(k => (
                                            <span key={k} className="px-1.5 py-0.5 bg-white/5 rounded-md text-[9px] font-mono text-text-muted/80 border border-white/5">
                                                {k === ' ' ? 'SPC' : k.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover/card:opacity-10 transition-opacity">
                                    <ChevronRight size={32} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedFinger && (
                    <FingerDeepDive
                        stats={selectedFinger}
                        keyStats={allKeyStats.filter(ks => getFingerForKey(ks.key) === selectedFinger.finger)}
                        onClose={() => setSelectedFinger(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

interface FingerDeepDiveProps {
    stats: FingerStats;
    keyStats: KeyStats[];
    onClose: () => void;
}

const FingerDeepDive: React.FC<FingerDeepDiveProps> = ({ stats, keyStats, onClose }) => {
    const setPendingLaunch = useLaunchStore(state => state.setPendingLaunch);

    const handleGenerateDrill = () => {
        // Find the absolute weakest keys (lowest accuracy) for this finger
        const weakKeys = [...keyStats]
            .filter(k => k.totalAttempts >= 1)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5) // Focus on top 5 worst performers
            .map(k => k.key);

        const drillText = generateWeakKeyDrill(weakKeys);

        setPendingLaunch({
            source: 'analytics',
            mode: 'practice',
            title: `Weak Key Focus: ${getFingerName(stats.finger)}`,
            launch: {
                kind: 'CUSTOM_TEXT',
                promptText: drillText
            }
        });

        onClose();
        window.dispatchEvent(new CustomEvent('navigate-to-practice'));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 sm:p-12 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Diagnostic Detail</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.accuracy >= 94 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {stats.accuracy >= 94 ? 'Stable' : 'Unstable'}
                                </span>
                            </div>
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{getFingerName(stats.finger)}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-50">Velocity</div>
                            <div className="text-xl font-black text-white">{Math.round(stats.averageSpeed)} <span className="text-[10px] opacity-40 uppercase font-bold">WPM</span></div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-50">Accuracy</div>
                            <div className={`text-xl font-black ${stats.accuracy >= 94 ? 'text-emerald-500' : 'text-rose-500'}`}>{stats.accuracy.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-50">Total Hits</div>
                            <div className="text-xl font-black text-white">{stats.totalAttempts}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Key Performance Matrix</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {[...keyStats].sort((a, b) => a.accuracy - b.accuracy).map(ks => (
                                <div key={ks.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-mono font-bold text-sm text-white">
                                            {ks.key === ' ' ? 'SPC' : ks.key.toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">{ks.totalAttempts} Hits</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${ks.accuracy >= 95 ? 'text-emerald-500' : ks.accuracy >= 90 ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {ks.accuracy.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerateDrill}
                            className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 font-black uppercase tracking-[0.3em] text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 group"
                        >
                            <Zap size={18} className="group-hover:animate-pulse" />
                            Generate Reinforcement Drill
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const generateWeakKeyDrill = (keys: string[]): string => {
    if (keys.length === 0) return "All keys for this finger are performing at peak levels. Excellent precision!";

    const commonWords: Record<string, string[]> = {
        'a': ['area', 'attack', 'almost', 'always'],
        's': ['system', 'status', 'source', 'sample'],
        'd': ['data', 'detail', 'driver', 'during'],
        'f': ['field', 'focus', 'format', 'future'],
        'j': ['joint', 'judge', 'just', 'jump'],
        'k': ['know', 'keep', 'keyboard', 'kernel'],
        'l': ['level', 'local', 'limit', 'logic'],
        ';': ['coding;', 'end;', 'test;', 'syntax;'],
        'q': ['quick', 'query', 'queue', 'quite'],
        'w': ['water', 'world', 'write', 'window'],
        'e': ['every', 'error', 'entry', 'equal'],
        'r': ['reset', 'range', 'river', 'ready'],
        't': ['track', 'total', 'trend', 'table'],
        'y': ['yearly', 'yellow', 'yield', 'yesterday'],
        'u': ['units', 'usage', 'under', 'upper'],
        'i': ['input', 'index', 'items', 'issue'],
        'o': ['order', 'other', 'object', 'output'],
        'p': ['phase', 'print', 'pilot', 'power'],
        'z': ['zone', 'zero', 'zoom', 'zebra'],
        'x': ['extra', 'exist', 'export', 'exact'],
        'c': ['clear', 'class', 'chart', 'close'],
        'v': ['value', 'valid', 'video', 'view'],
        'b': ['build', 'block', 'basic', 'break'],
        'n': ['next', 'nodes', 'night', 'newly'],
        'm': ['matrix', 'memory', 'manual', 'middle'],
    };

    let words: string[] = [];
    keys.forEach(k => {
        const lowerK = k.toLowerCase();
        if (commonWords[lowerK]) {
            words = [...words, ...commonWords[lowerK]];
        }
    });

    const shuffled = words.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, 20).join(' ');

    return result || `Focus on keys: ${keys.join(' ').toUpperCase()}. Type them repeatedly to build muscle memory.`;
};

export default FingerHeatmap;
