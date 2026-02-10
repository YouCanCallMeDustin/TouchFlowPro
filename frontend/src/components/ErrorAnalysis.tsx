import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from './LoadingSkeleton';
import { Target, AlertCircle, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

interface KeyStats {
    key: string;
    attempts: number;
    accuracy: number;
    errors: number;
}

interface ErrorAnalysisProps {
    userId: string;
}

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({ userId }) => {
    const { token } = useAuth();
    const [errorData, setErrorData] = useState<KeyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'chart' | 'list'>('chart');

    useEffect(() => {
        const fetchErrorData = async () => {
            if (!userId || !token) return;

            try {
                setLoading(true);
                const troubleResponse = await apiFetch(`/api/keystroke-tracking/trouble-keys/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (troubleResponse.ok) {
                    const keys: any[] = await troubleResponse.json();
                    const processedKeys: KeyStats[] = keys.map(stat => ({
                        key: stat.key,
                        attempts: stat.attempts || 0,
                        accuracy: stat.accuracy || 0,
                        errors: Math.round((stat.attempts || 0) * (1 - (stat.accuracy || 0) / 100))
                    })).sort((a, b) => b.errors - a.errors);
                    setErrorData(processedKeys.slice(0, 10));
                }
            } catch (error) {
                console.error('Failed to fetch error data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchErrorData();
    }, [userId, token]); // Added token to dependency array

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="card p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <h2 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary transition-transform duration-300 hover:scale-110 pointer-events-none">
                        <Target size={20} />
                    </span>
                    Keystroke Error Analysis
                </h2>
                <div className="flex flex-col bg-slate-500/5 dark:bg-text-main/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm gap-1 w-32">
                    {(['chart', 'list'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all ${view === v ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    {errorData.length === 0 ? (
                        <div className="h-[400px] w-full bg-text-main/5 rounded-3xl p-8 border border-white/5 flex items-center justify-center text-text-muted italic opacity-40 uppercase font-black text-[10px] tracking-widest">
                            No error signals detected
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {view === 'chart' ? (
                                <motion.div
                                    key="chart"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-[400px] w-full bg-text-main/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-20" />
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={errorData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                            <XAxis
                                                dataKey="key"
                                                stroke="currentColor"
                                                opacity={0.4}
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(t) => t.toUpperCase()}
                                            />
                                            <YAxis
                                                stroke="currentColor"
                                                opacity={0.4}
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'var(--text-main)', opacity: 0.05 }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '16px',
                                                    padding: '12px',
                                                    color: 'var(--text-main)'
                                                }}
                                            />
                                            <Bar dataKey="errors" radius={[6, 6, 0, 0]}>
                                                {errorData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${entry.key}`}
                                                        fill={index === 0 ? 'var(--primary)' : 'var(--text-muted)'}
                                                        opacity={index === 0 ? 1 : 0.3}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {errorData.map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-text-main/5 hover:bg-text-main/10 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <span className="text-3xl font-mono font-black text-text-main group-hover:text-primary transition-colors">
                                                    {item.key.toUpperCase()}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{item.errors} ERRORS</span>
                                                    <span className="text-[10px] text-text-muted opacity-40 uppercase font-black">Accuracy: {(item.accuracy || 0).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <TrendingDown size={20} className="text-text-muted opacity-20 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Improvement Suggestions</h3>
                    {errorData.length > 0 && (
                        <div className="p-6 rounded-2xl border border-white/5 bg-text-main/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle size={16} className="text-rose-500 shrink-0" />
                                <span className="text-xs font-black text-text-main uppercase tracking-wider leading-tight">Needs Work</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {errorData.slice(0, 3).map(item => (
                                    <span key={item.key} className="px-3 py-1 bg-white/10 rounded-lg text-lg font-mono font-black text-text-main border border-white/5">
                                        {item.key.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed opacity-60 italic">
                                Practice these keys to improve accuracy and muscle memory.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
