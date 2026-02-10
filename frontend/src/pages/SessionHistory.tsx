import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { History, Box, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface SessionHistoryProps {
    userId: string;
}

interface DrillResult {
    id: string;
    drillId: string;
    grossWPM: number;
    netWPM: number;
    accuracy: number;
    durationMs: number;
    timestamp: Date;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ userId }) => {
    const [results, setResults] = useState<DrillResult[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('timestamp');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        fetchHistory();
    }, [userId, currentPage, sortBy, order]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await apiFetch(
                `/api/history/${userId}?page=${currentPage}&limit=20&sortBy=${sortBy}&order=${order}`
            );
            const data = await response.json();
            setResults(data.results || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await apiFetch(`/api/history/${userId}/export`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `touchflow-pro-history-${userId}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export:', error);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setOrder('desc');
        }
    };

    if (loading && results.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Syncing Mission Logs...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
            {/* Header */}
            {/* Header */}
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mt-8">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <History size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Session Archives</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Mission History
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                        Review your operational logs. {pagination && <span className="text-primary font-black uppercase tracking-wider">{pagination.totalCount} Sectors Secured</span>} across all deployments.
                    </p>
                </div>

                <div className="absolute right-12 bottom-12 z-10 hidden md:block">
                    <button
                        onClick={handleExport}
                        className="group px-6 py-3.5 bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-primary hover:border-primary/20 transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-black/5 backdrop-blur-sm"
                    >
                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        Export Protocol
                    </button>
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

            {/* History Table Card */}
            <div className="card p-0 overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-premium mt-8">
                <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-500/5 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                <th
                                    className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('drillId')}
                                >
                                    <div className="flex items-center gap-2">
                                        Module Sector
                                        {sortBy === 'drillId' && (order === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                    </div>
                                </th>
                                <th
                                    className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    <div className="flex items-center gap-2">
                                        Date Profile
                                        {sortBy === 'timestamp' && (order === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                                    </div>
                                </th>
                                <th
                                    className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 text-center cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('netWPM')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Velocity (WPM)
                                        {sortBy === 'netWPM' && (order === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                                    </div>
                                </th>
                                <th
                                    className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 text-center cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('accuracy')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Precision (%)
                                        {sortBy === 'accuracy' && (order === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                                    </div>
                                </th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-10">
                                            <History size={64} strokeWidth={1} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">No Session Logs Detected</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                results.map((result, index) => (
                                    <motion.tr
                                        key={result.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="group hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors cursor-default"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-500/5 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10 group-hover:border-primary/20 transition-all">
                                                    <Box size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-text-main group-hover:text-primary transition-colors tracking-tight">
                                                        {result.drillId.includes('-')
                                                            ? `Module ${result.drillId.split('-').pop()}`
                                                            : result.drillId.substring(0, 15) + (result.drillId.length > 15 ? '...' : '')}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-text-muted/40 uppercase tracking-[0.1em]">Tactical Session</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-text-main">{format(new Date(result.timestamp), 'MMM dd, yyyy')}</span>
                                                <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">{format(new Date(result.timestamp), 'HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-6 text-center">
                                            <span className="text-xl font-black text-primary tracking-tighter shadow-primary/20">{result.netWPM.toFixed(0)}</span>
                                        </td>
                                        <td className="px-12 py-6 text-center">
                                            <span className="text-xl font-black text-text-main tracking-tighter">{result.accuracy.toFixed(1)}%</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${result.accuracy >= 95
                                                ? 'bg-primary/5 text-primary border-primary/20'
                                                : 'bg-orange-500/5 text-orange-500 border-orange-500/20'}`}>
                                                {result.accuracy >= 95 ? 'Nominal' : 'Divergent'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Card */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 bg-slate-500/5 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-primary/30 disabled:opacity-30 disabled:grayscale transition-all text-text-muted hover:text-text-main shadow-sm"
                    >
                        Previous Unit
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all flex items-center justify-center ${currentPage === pageNum
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 border border-primary'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-text-muted hover:border-primary/20 hover:text-text-main'
                                        }`}
                                >
                                    {pageNum.toString().padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasMore}
                        className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-primary/30 disabled:opacity-30 disabled:grayscale transition-all text-text-muted hover:text-text-main shadow-sm"
                    >
                        Next Unit
                    </button>
                </div>
            )}
        </div>
    );
};

export default SessionHistory;
