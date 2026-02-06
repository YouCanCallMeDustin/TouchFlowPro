import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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
            const response = await fetch(
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
            const response = await fetch(`/api/history/${userId}/export`);
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-bold text-primary-blue">Loading History...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-black text-text-main">📚 Session History</h1>
                    {pagination && (
                        <p className="text-text-muted mt-2">
                            {pagination.totalCount} drills completed • Page {pagination.currentPage} of {pagination.totalPages}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleExport}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                            <tr>
                                <th
                                    className="px-6 py-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-wider">
                                        Date & Time
                                        {sortBy === 'timestamp' && (order === 'desc' ? ' ▼' : ' ▲')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="font-black text-slate-700 uppercase text-xs tracking-wider">
                                        Drill ID
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('netWPM')}
                                >
                                    <div className="flex items-center justify-center gap-2 font-black text-slate-700 uppercase text-xs tracking-wider">
                                        WPM
                                        {sortBy === 'netWPM' && (order === 'desc' ? ' ▼' : ' ▲')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('accuracy')}
                                >
                                    <div className="flex items-center justify-center gap-2 font-black text-slate-700 uppercase text-xs tracking-wider">
                                        Accuracy
                                        {sortBy === 'accuracy' && (order === 'desc' ? ' ▼' : ' ▲')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="font-black text-slate-700 uppercase text-xs tracking-wider">
                                        Duration
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="font-black text-slate-700 uppercase text-xs tracking-wider">
                                        Errors
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.length > 0 ? (
                                results.map((result) => {
                                    const errors = Math.round(result.grossWPM - result.netWPM);
                                    const durationSec = Math.round(result.durationMs / 1000);
                                    return (
                                        <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-text-main">
                                                <div>{format(new Date(result.timestamp), 'MMM d, yyyy')}</div>
                                                <div className="text-xs text-text-muted">
                                                    {format(new Date(result.timestamp), 'h:mm a')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-text-muted">
                                                {result.drillId.slice(0, 12)}...
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                                    {result.netWPM.toFixed(0)} WPM
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${result.accuracy >= 95
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : result.accuracy >= 85
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {result.accuracy.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-text-muted">
                                                {durationSec}s
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-text-muted">
                                                {errors}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        No drills completed yet. Start practicing to see your history!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        ← Previous
                    </button>
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentPage === pageNum
                                            ? 'bg-primary-blue text-white'
                                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasMore}
                        className="px-4 py-2 rounded-lg font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default SessionHistory;
