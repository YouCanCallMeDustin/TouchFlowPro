import React from 'react';
import { motion } from 'framer-motion';
import { KEYBOARD_LAYOUT, FINGER_COLORS, getCorrectFinger } from '../utils/keyboardLayout';


interface VirtualKeyboardProps {
    nextKey?: string;
    highlightedKeys?: string[];
    showFingerGuide?: boolean;
    compact?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    nextKey,
    highlightedKeys = [],
    showFingerGuide = true,
    compact = false
}) => {

    const getKeyStyle = (key: string): React.CSSProperties => {
        const finger = getCorrectFinger(key);
        const baseColor = FINGER_COLORS[finger];

        // Highlight next key
        if (key === nextKey || key.toLowerCase() === nextKey?.toLowerCase()) {
            return {
                backgroundColor: '#3B82F6', // Blue
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
                transform: 'scale(1.1)',
                zIndex: 10
            };
        }

        // Highlight specific keys
        if (highlightedKeys.includes(key)) {
            return {
                backgroundColor: '#10B981', // Green
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
            };
        }

        // Finger color coding
        if (showFingerGuide) {
            return {
                backgroundColor: baseColor,
                opacity: 0.7
            };
        }

        return {
            backgroundColor: '#374151' // Gray-700
        };
    };

    const renderKey = (key: string, width: string = 'w-12') => {
        return (
            <motion.div
                key={key}
                className={`${width} h-12 ${compact ? 'h-10' : 'h-12'} rounded-lg flex items-center justify-center text-white font-bold text-sm border border-gray-600 transition-all duration-200 cursor-default`}
                style={getKeyStyle(key)}
                whileHover={{ scale: 1.05 }}
            >
                {key === ' ' ? 'Space' : key}
            </motion.div>
        );
    };

    return (
        <div className={`${compact ? 'scale-75' : ''} origin-top`}>
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
                {/* Finger Guide Legend */}
                {showFingerGuide && (
                    <div className="mb-4 flex flex-wrap gap-3 justify-center text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[0] }} />
                            <span className="text-gray-300">Pinkies</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[1] }} />
                            <span className="text-gray-300">Ring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[2] }} />
                            <span className="text-gray-300">Middle</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[3] }} />
                            <span className="text-gray-300">Index</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[4] }} />
                            <span className="text-gray-300">Thumbs</span>
                        </div>
                    </div>
                )}

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

                {/* Next Key Indicator */}
                {nextKey && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center"
                    >
                        <div className="text-sm text-gray-400 mb-1">Next Key:</div>
                        <div className="text-4xl font-bold text-blue-400">
                            {nextKey === ' ' ? 'Space' : nextKey}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
