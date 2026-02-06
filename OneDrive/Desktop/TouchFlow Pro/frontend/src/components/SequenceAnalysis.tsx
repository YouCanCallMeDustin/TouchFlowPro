import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    const [bigrams, setBigrams] = useState<SequenceStat[]>([]);
    const [trigrams, setTrigrams] = useState<SequenceStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'bigram' | 'trigram'>('bigram');

    useEffect(() => {
        fetchSequences();
    }, [userId, activeTab]);

    const fetchSequences = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/keystroke-tracking/sequences/${userId}?type=${activeTab}&limit=8`);
            if (response.ok) {
                const data = await response.json();
                if (activeTab === 'bigram') setBigrams(data);
                else setTrigrams(data);
            }
        } catch (error) {
            console.error('Failed to fetch sequences:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = activeTab === 'bigram' ? bigrams : trigrams;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        🐢 Speed Bottlenecks
                    </h2>
                    <p className="text-sm text-text-muted mt-1">Slowest character sequences</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('bigram')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'bigram' ? 'bg-white shadow-sm text-primary-blue' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Bigrams
                    </button>
                    <button
                        onClick={() => setActiveTab('trigram')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'trigram' ? 'bg-white shadow-sm text-primary-blue' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Trigrams
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 bg-slate-50 rounded-xl" />
                    ))}
                </div>
            ) : stats.length > 0 ? (
                <div className="space-y-4">
                    {stats.map((s, index) => (
                        <div key={s.id} className="group relative">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-lg font-mono font-black text-slate-700 tracking-widest bg-slate-50 px-2 py-1 rounded">
                                    "{s.sequence}"
                                </span>
                                <span className="text-xs font-bold text-rose-500">
                                    {s.avgSpeed.toFixed(0)} ms
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (s.avgSpeed / 1000) * 100)}%` }}
                                    className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full"
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-black">PRO TIP:</span> These sequences are slowing you down. Practice typing these specific character combinations in isolation to build muscle memory.
                        </p>
                    </div>
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
