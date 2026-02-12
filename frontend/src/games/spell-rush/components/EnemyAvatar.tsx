import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../state/store';
import classNames from 'classnames';

export const EnemyAvatar: React.FC = () => {
    const { enemy, lastDamage } = useGameStore();
    const [isHit, setIsHit] = useState(false);

    // Watch for damage to trigger hit animation
    useEffect(() => {
        if (lastDamage && lastDamage > 0) {
            setIsHit(true);
            const timer = setTimeout(() => setIsHit(false), 200);
            return () => clearTimeout(timer);
        }
    }, [lastDamage]);

    if (!enemy) return null;

    const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />

            {/* Monolith Container */}
            <motion.div
                className={classNames(
                    "relative w-24 h-24 bg-slate-900 border-2 rotate-45 flex items-center justify-center overflow-hidden transition-colors duration-100",
                    isHit ? "border-white bg-red-500/50" : "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                )}
                animate={{
                    scale: isHit ? 0.9 : 1,
                    rotate: 45, // Keep rotation
                }}
            >
                {/* Inner Core (HP) */}
                <div className="absolute inset-1 bg-slate-950/80">
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-red-600 transition-all duration-300"
                        style={{ height: `${hpPercent}%` }}
                    />
                </div>

                {/* Eye / Core */}
                <div className="relative z-10 w-8 h-8 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)] animate-ping opacity-20" />
                <div className="absolute z-10 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </motion.div>

            {/* Level Badge */}
            <div className="absolute -bottom-2 bg-slate-900 border border-red-500 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                Lvl {useGameStore.getState().stats.enemyLevel}
            </div>
        </div>
    );
};
