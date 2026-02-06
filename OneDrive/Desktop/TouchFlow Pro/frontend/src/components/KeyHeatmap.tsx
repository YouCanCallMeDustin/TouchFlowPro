import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KEYBOARD_LAYOUT } from '../utils/keyboardLayout';


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
    const [keyStats, setKeyStats] = useState<Map<string, KeyStats>>(new Map());
    const [loading, setLoading] = useState(true);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeyStats();
    }, [userId, timeFilter]);

    const fetchKeyStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/keystroke-tracking/stats/${userId}`);
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
            return '#4B5563'; // Gray-600 (not enough data)
        }

        const accuracy = stat.accuracy;

        if (accuracy >= 95) return '#10B981'; // Green-500 (excellent)
        if (accuracy >= 90) return '#3B82F6'; // Blue-500 (good)
        if (accuracy >= 85) return '#F59E0B'; // Yellow-500 (okay)
        return '#EF4444'; // Red-500 (needs work)
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
                className={`${width} ${compact ? 'h-10' : 'h-12'} rounded-lg flex items-center justify-center text-white font-bold text-sm border border-gray-700 cursor-pointer relative`}
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
                        className="absolute bottom-full mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap z-50"
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
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`${compact ? 'scale-90' : ''} origin-top`}>
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Keyboard Heatmap</h3>
                    <p className="text-gray-400 text-sm">
                        Hover over keys to see detailed stats. Colors indicate accuracy.
                    </p>
                </div>

                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-4 justify-center text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
                        <span className="text-gray-300">Excellent (95%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                        <span className="text-gray-300">Good (90-95%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
                        <span className="text-gray-300">Okay (85-90%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
                        <span className="text-gray-300">Needs Work (&lt;85%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4B5563' }} />
                        <span className="text-gray-300">No Data</span>
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
                    <div className="w-24" /> {/* Shift spacer */}
                    {KEYBOARD_LAYOUT.row4.map(key => renderKey(key))}
                </div>

                {/* Space Bar */}
                <div className="flex gap-1 justify-center mt-2">
                    {renderKey(' ', 'w-96')}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-500">
                            {Array.from(keyStats.values()).filter(s => s.accuracy >= 95 && s.totalAttempts >= 3).length}
                        </div>
                        <div className="text-xs text-gray-400">Mastered Keys</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="text-2xl font-bold text-yellow-500">
                            {Array.from(keyStats.values()).filter(s => s.accuracy >= 85 && s.accuracy < 95 && s.totalAttempts >= 3).length}
                        </div>
                        <div className="text-xs text-gray-400">Improving Keys</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-500">
                            {Array.from(keyStats.values()).filter(s => s.accuracy < 85 && s.totalAttempts >= 3).length}
                        </div>
                        <div className="text-xs text-gray-400">Trouble Keys</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
