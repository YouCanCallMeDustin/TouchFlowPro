import React from 'react';
import { motion } from 'framer-motion';
import type { Tile as TileType } from '../types';
import classNames from 'classnames';

interface TileProps {
    tile: TileType;
    isSelected: boolean;
    isHint?: boolean;
    onMouseDown: (tile: TileType) => void;
    onMouseEnter: (tile: TileType) => void;
}

export const Tile: React.FC<TileProps> = ({ tile, isSelected, isHint, onMouseDown, onMouseEnter }) => {
    const isRare = tile.type === 'rare';

    return (
        <motion.div
            layoutId={tile.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={classNames(
                'items-center justify-center flex select-none cursor-pointer rounded-xl text-3xl font-black transition-all duration-75 relative overflow-hidden',
                'h-16 w-16 md:h-20 md:w-20',
                {
                    // Default State
                    'bg-slate-800/80 border border-white/5 text-slate-300 shadow-lg backdrop-blur-sm': !isSelected && !isHint && !isRare,
                    'hover:bg-slate-700/80 hover:border-white/20 hover:scale-105 hover:shadow-xl hover:z-10': !isSelected && !isHint,

                    // Hint State
                    'bg-cyan-900/30 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse': isHint && !isSelected,

                    // Selected State
                    'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110 z-20': isSelected,

                    // Rare Letter
                    'text-yellow-400 border-yellow-500/30 shadow-[inset_0_0_10px_rgba(250,204,21,0.2)]': isRare && !isSelected,
                }
            )}
            onMouseDown={() => onMouseDown(tile)}
            onMouseEnter={() => onMouseEnter(tile)}
        >
            {/* Inner Glare */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <span className="relative z-10 drop-shadow-md">{tile.letter}</span>

            {/* Priority Indicator for Rare */}
            {isRare && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
            )}
        </motion.div>
    );
};
