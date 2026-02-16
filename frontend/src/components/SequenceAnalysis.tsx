import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useLaunchStore } from '../state/launchStore';

interface SequenceStat {
    id: string;
    sequence: string;
    type: 'bigram' | 'trigram';
    avgSpeed: number;
    attempts: number;
}

interface SequenceAnalysisProps {
    userId: string;
}

export const SequenceAnalysis: React.FC<SequenceAnalysisProps> = ({ userId }) => {
    const { token } = useAuth();
    const [bigrams, setBigrams] = useState<SequenceStat[]>([]);
    const [trigrams, setTrigrams] = useState<SequenceStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'bigrams' | 'trigrams'>('bigrams');
    const [selectedSequence, setSelectedSequence] = useState<SequenceStat | null>(null);

    useEffect(() => {
        fetchSequences();
    }, [userId, tab]); // Dependency changed to 'tab'

    const fetchSequences = async () => {
        if (!userId || !token) return;

        try {
            setLoading(true);
            const response = await apiFetch(`/api/keystroke-tracking/sequences/${userId}?type=${tab.slice(0, -1)}&limit=8`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (tab === 'bigrams') setBigrams(data);
                else setTrigrams(data);
            }
        } catch (error) {
            console.error('Failed to fetch sequences:', error);
        } finally {
            setLoading(false);
        }
    };

    const data = tab === 'bigrams' ? bigrams : trigrams; // Renamed from stats to data
    const maxTime = Math.max(...data.map(s => s.avgSpeed), 1); // Calculate max speed for bar width

    return (
        <div className="card p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary">⚡</span>
                        Sequence Latency Analysis
                    </h2>
                    <div className="group relative">
                        <HelpCircle size={14} className="text-text-muted opacity-40 hover:opacity-100 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-gray-900 text-white text-[11px] rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl border border-white/5 z-[60]">
                            Latency measures the time delay between specific keystrokes. Lower values indicate fluid muscle memory for these combined patterns.
                        </div>
                    </div>
                </div>
                <div className="flex flex-col bg-slate-500/5 dark:bg-text-main/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm gap-1 w-32">
                    {(['bigrams', 'trigrams'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all ${tab === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-20 bg-text-main/5 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="wait">
                        {data.map((item, idx) => (
                            <motion.button
                                key={item.id} // Changed from item.sequence to item.id for unique key
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedSequence(item)}
                                className="p-6 rounded-2xl border border-white/5 bg-text-main/5 hover:bg-text-main/10 hover:border-primary/20 transition-all group text-left relative overflow-hidden active:scale-95"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-mono font-black text-primary group-hover:scale-110 transition-transform">
                                            {item.sequence.toUpperCase()}
                                        </span>
                                        {idx === 0 && <Zap size={14} className="text-amber-500 animate-pulse" />}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-mono font-black text-text-muted opacity-40">
                                            {(item.avgSpeed / 1000).toFixed(3)}s
                                        </span>
                                        <div className="text-[8px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze Pattern</div>
                                    </div>
                                </div>
                                <div className="h-2 bg-text-main/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.avgSpeed / maxTime) * 100}%` }} // Adjusted calculation
                                        className="h-full bg-gradient-to-r from-primary to-secondary"
                                    />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-4xl mb-4">⌨️</div>
                    <p className="text-slate-400 font-medium">No sequence data yet.<br />Complete more drills to see results.</p>
                </div>
            )}

            <AnimatePresence>
                {selectedSequence && (
                    <SequenceDeepDive
                        stat={selectedSequence}
                        onClose={() => setSelectedSequence(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

interface SequenceDeepDiveProps {
    stat: SequenceStat;
    onClose: () => void;
}

const SequenceDeepDive: React.FC<SequenceDeepDiveProps> = ({ stat, onClose }) => {
    const setPendingLaunch = useLaunchStore(state => state.setPendingLaunch);

    const handleGenerateDrill = () => {
        const drillText = generateSequenceDrill(stat.sequence);

        setPendingLaunch({
            source: 'analytics',
            mode: 'practice',
            title: `Neural Optimization: ${stat.sequence.toUpperCase()}`,
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
                className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 sm:p-12 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Neural Latency</span>
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-white/40 text-[10px] font-black uppercase tracking-widest">{stat.type}</span>
                            </div>
                            <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{stat.sequence.toUpperCase()}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted opacity-60 font-medium">Average Latency</span>
                            <span className="font-mono font-black text-primary text-xl">{(stat.avgSpeed / 1000).toFixed(3)}s</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted opacity-60 font-medium">Total Recorded Samples</span>
                            <span className="text-white font-black">{stat.attempts} pairs</span>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 mb-2">Efficiency Insight</div>
                            <p className="text-text-muted text-sm leading-relaxed">
                                {stat.avgSpeed > 500
                                    ? `This sequence is causing a significant bottleneck in your word-building speed. Your brain is hesitating for ${(stat.avgSpeed / 1000).toFixed(2)}s between these characters.`
                                    : `You have decent muscle memory for this pattern, but there is room to reach sub-200ms fluency for professional-grade speed.`}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerateDrill}
                            className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 font-black uppercase tracking-[0.3em] text-[12px] flex items-center justify-center gap-3 transition-all active:scale-95 group"
                        >
                            <Zap size={18} className="group-hover:animate-pulse" />
                            Launch Optimization Drill
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const generateSequenceDrill = (sequence: string): string => {
    const seq = sequence.toLowerCase();

    // A broader dictionary for sequence-focused words
    const dictionary: Record<string, string[]> = {
        'ls': ['halls', 'calls', 'falls', 'skills', 'walls', 'fills', 'bills', 'pills', 'kells', 'shells', 'swells', 'spells', 'smells', 'dolls', 'tolls', 'rolls', 'polls'],
        'th': ['the', 'this', 'that', 'then', 'there', 'their', 'them', 'these', 'those', 'thought', 'through', 'theory', 'width', 'health', 'truth', 'growth'],
        'ing': ['doing', 'being', 'going', 'king', 'sing', 'ring', 'wing', 'thing', 'morning', 'evening', 'nothing', 'everything', 'working', 'playing'],
        'ion': ['action', 'motion', 'logic', 'version', 'option', 'section', 'region', 'union', 'mission', 'passion', 'vision', 'opinion', 'tension'],
        'er': ['over', 'under', 'ever', 'after', 'enter', 'older', 'newer', 'faster', 'slower', 'water', 'driver', 'server', 'power', 'filter'],
        'in': ['input', 'inside', 'index', 'inner', 'into', 'finish', 'login', 'begin', 'within', 'morning', 'brain', 'train', 'plain'],
        'sh': ['shell', 'shift', 'sharp', 'share', 'short', 'shoot', 'shout', 'ash', 'cash', 'dash', 'flash', 'slash', 'crash', 'trash'],
        'ch': ['chart', 'check', 'child', 'chair', 'chain', 'catch', 'match', 'watch', 'patch', 'batch', 'reach', 'teach', 'bench'],
        'qu': ['quick', 'query', 'queue', 'quite', 'quote', 'quiet', 'quest', 'equal', 'liquid', 'unique', 'squash', 'square', 'squat'],
    };

    let words: string[] = dictionary[seq] || [];

    // If we don't have a specific dictionary, we use a generic placeholder pattern
    // In a real app, this would query a larger word database.
    if (words.length === 0) {
        return `Focus on the sequence: ${seq.toUpperCase()}. Type it repeatedly to build neural paths: ${seq} ${seq} ${seq} ${seq} ${seq} ${seq} ${seq} ${seq} ${seq} ${seq}`;
    }

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, 20).join(' ');

    return result;
};
