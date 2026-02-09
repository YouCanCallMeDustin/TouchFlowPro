import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KEYBOARD_LAYOUT } from '../utils/keyboardLayout';
import { useAuth } from '../context/AuthContext';


interface KeyStats {
    key: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    averageSpeed: number;
}

interface KeyHeatmapProps {
    userId: string;
    timeFilter?: 'today' | 'week' | 'month' | 'all';
    compact?: boolean;
}

export const KeyHeatmap: React.FC<KeyHeatmapProps> = ({
    userId,
    timeFilter = 'all',
    compact = false
}) => {
    const { token } = useAuth();
    const [keyStats, setKeyStats] = useState<Map<string, KeyStats>>(new Map());
    const [loading, setLoading] = useState(true);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeyStats();
    }, [userId, timeFilter]);

    const fetchKeyStats = async () => {
        if (!userId || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/keystroke-tracking/stats/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const stats: KeyStats[] = await response.json();
                const statsMap = new Map(stats.map(s => [s.key, s]));
                setKeyStats(statsMap);
            }
        } catch (error) {
            console.error('Failed to fetch key stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getKeyColor = (key: string): string => {
        const stat = keyStats.get(key) || keyStats.get(key.toLowerCase());

        if (!stat || stat.totalAttempts < 3) {
            return 'var(--bg-card)';
        }

        const accuracy = stat.accuracy;

        if (accuracy >= 95) return 'oklch(65% 0.15 160 / 0.3)'; // Emerald
        if (accuracy >= 90) return 'oklch(65% 0.15 250 / 0.3)';  // Blue
        if (accuracy >= 85) return 'oklch(75% 0.15 80 / 0.3)';   // Amber
        return 'oklch(65% 0.20 20 / 0.3)'; // Rose
    };

    const getKeyStyle = (key: string): React.CSSProperties => {
        const color = getKeyColor(key);
        const isHovered = hoveredKey === key || hoveredKey === key.toLowerCase();

        return {
            backgroundColor: color,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isHovered ? `0 0 20px ${color}` : 'none',
            transition: 'all 0.2s ease',
            zIndex: isHovered ? 10 : 1
        };
    };

    const renderKey = (key: string, width: string = 'w-12') => {
        const stat = keyStats.get(key) || keyStats.get(key.toLowerCase());
        const hasData = stat && stat.totalAttempts >= 3;

        return (
            <motion.div
                key={key}
                className={`${width} ${compact ? 'h-10' : 'h-12'} rounded-xl flex items-center justify-center text-text-main font-black text-xs border border-slate-200/50 dark:border-white/10 cursor-pointer relative transition-all duration-300`}
                style={getKeyStyle(key)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                whileHover={{ scale: 1.1 }}
            >
                {key === ' ' ? 'Space' : key}

                {/* Tooltip */}
                {hoveredKey === key && hasData && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full mb-2 bg-bg-card border border-glass-border text-text-main px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap z-50 backdrop-blur-md"
                    >
                        <div className="font-bold mb-1">{key === ' ' ? 'Space' : key.toUpperCase()}</div>
                        <div>Accuracy: {stat!.accuracy.toFixed(1)}%</div>
                        <div>Attempts: {stat!.totalAttempts}</div>
                        <div>Speed: {stat!.averageSpeed.toFixed(0)}ms</div>
                    </motion.div>
                )}
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className={`${compact ? 'scale-90' : ''} origin-top`}>
            <div className="card p-8 scale-90">
                {/* Header */}
                <div className="mb-12">
                    <h3 className="text-2xl font-black text-text-main mb-3 tracking-tight">Spectral Heatmap</h3>
                    <p className="text-text-muted text-sm opacity-40 uppercase font-black tracking-widest text-[9px]">
                        Hover over keys to see spectral analysis signals.
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap gap-6 justify-center text-[10px] font-black uppercase tracking-widest opacity-60">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(16, 185, 129, 0.6)' }} />
                        <span>Excellent (95%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }} />
                        <span>Good (90-95%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.6)' }} />
                        <span>Okay (85-90%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.6)' }} />
                        <span>Needs Work (&lt;85%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
                        <span>No Data</span>
                    </div>
                </div>

                {/* Number Row */}
                <div className="flex gap-1 mb-1 justify-center">
                    {KEYBOARD_LAYOUT.row1.map(key => renderKey(key))}
                </div>

                {/* Top Row (QWERTY) */}
                <div className="flex gap-1 mb-1 justify-center">
                    <div className="w-16" /> {/* Tab spacer */}
                    {KEYBOARD_LAYOUT.row2.map(key => renderKey(key))}
                </div>

                {/* Home Row (ASDF JKL;) */}
                <div className="flex gap-1 mb-1 justify-center">
                    <div className="w-20" /> {/* Caps Lock spacer */}
                    {KEYBOARD_LAYOUT.row3.map(key => renderKey(key))}
                </div>

                {/* Bottom Row (ZXCV BNM) */}
                <div className="flex gap-1 mb-1 justify-center">
                    {KEYBOARD_LAYOUT.row4.map((key, index) => {
                        // Apply standard Shift widths (Left shift is usually slightly different but let's keep it balanced)
                        const isFirstShift = key === 'Shift' && index === 0;
                        const isLastShift = key === 'Shift' && index === KEYBOARD_LAYOUT.row4.length - 1;
                        const width = (isFirstShift || isLastShift) ? 'w-24' : 'w-12';
                        return renderKey(key, width);
                    })}
                </div>

                {/* Space Bar */}
                <div className="flex gap-1 justify-center mt-2">
                    {renderKey(' ', 'w-96')}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-500/5 dark:bg-text-main/5 rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 group hover:border-primary/20 transition-all">
                        <div className="text-2xl font-black text-primary tracking-tighter">
                            {Array.from(keyStats.values()).filter(s => s.accuracy >= 95 && s.totalAttempts >= 3).length}
                        </div>
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Mastered Keys</div>
                    </div>
                    <div className="bg-slate-500/5 dark:bg-text-main/5 rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 group hover:border-amber-500/20 transition-all">
                        <div className="text-2xl font-black text-amber-500 tracking-tighter">
                            {Array.from(keyStats.values()).filter(s => s.accuracy >= 85 && s.accuracy < 95 && s.totalAttempts >= 3).length}
                        </div>
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Improving Keys</div>
                    </div>
                    <div className="bg-slate-500/5 dark:bg-text-main/5 rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 group hover:border-rose-500/20 transition-all">
                        <div className="text-2xl font-black text-rose-500 tracking-tighter">
                            {Array.from(keyStats.values()).filter(s => s.accuracy < 85 && s.totalAttempts >= 3).length}
                        </div>
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Trouble Keys</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
