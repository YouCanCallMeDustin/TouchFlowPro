import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

    useEffect(() => {
        fetchSequences();
    }, [userId, tab]); // Dependency changed to 'tab'

    const fetchSequences = async () => {
        if (!userId || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/keystroke-tracking/sequences/${userId}?type=${tab.slice(0, -1)}&limit=8`, {
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
                <h2 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">⚡</span>
                    Sequence Latency Analysis
                </h2>
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
                            <motion.div
                                key={item.id} // Changed from item.sequence to item.id for unique key
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl border border-white/5 bg-text-main/5 hover:bg-text-main/10 transition-colors group"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-mono font-black text-primary group-hover:scale-110 transition-transform">
                                            {item.sequence.toUpperCase()}
                                        </span>
                                        {idx === 0 && <Zap size={14} className="text-amber-500 animate-pulse" />}
                                    </div>
                                    <span className="text-xs font-mono font-black text-text-muted opacity-40">
                                        {(item.avgSpeed / 1000).toFixed(3)}s
                                    </span>
                                </div>
                                <div className="h-2 bg-text-main/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.avgSpeed / maxTime) * 100}%` }} // Adjusted calculation
                                        className="h-full bg-gradient-to-r from-primary to-secondary"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-4xl mb-4">⌨️</div>
                    <p className="text-slate-400 font-medium">No sequence data yet.<br />Complete more drills to see results.</p>
                </div>
            )}
        </div>
    );
};
