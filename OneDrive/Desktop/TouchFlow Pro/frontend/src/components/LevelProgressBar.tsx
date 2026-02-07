import React, { useEffect, useState } from 'react';
import { Sprout, Flame, Zap, Crown, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserLevel {
    level: number;
    levelName: string;
    nextLevelRequirements: {
        wpm: number;
        accuracy: number;
    };
    progress: number;
}

interface Props {
    userId: string;
}

export const LevelProgressBar: React.FC<Props> = ({ userId }) => {
    const [levelInfo, setLevelInfo] = useState<UserLevel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLevelInfo();
    }, [userId]);

    const fetchLevelInfo = async () => {
        try {
            const response = await fetch(`/api/recommendations/${userId}/level`);
            const data = await response.json();
            setLevelInfo(data);
        } catch (error) {
            console.error('Failed to fetch level info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !levelInfo) {
        return (
            <div className="card animate-pulse">
                <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded w-1/4"></div>
                    <div className="h-10 bg-white/5 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    const getLevelConfig = (level: number) => {
        if (level <= 3) return { icon: Sprout, color: 'text-blue-400', bg: 'bg-blue-500/10' };
        if (level <= 6) return { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' };
        if (level <= 9) return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        return { icon: Crown, color: 'text-primary', bg: 'bg-primary/10' };
    };

    const config = getLevelConfig(levelInfo.level);

    return (
        <div className="card relative overflow-hidden group border border-white/5">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${config.bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                        <config.icon className={config.color} size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Functional Tier</div>
                        <div className="text-3xl font-black text-text-main tracking-tighter">
                            {levelInfo.levelName} <span className="opacity-30">Lvl.{levelInfo.level}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Sync Progress</div>
                    <div className="text-3xl font-black text-primary tracking-tighter">
                        {Math.round(levelInfo.progress)}%
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8 z-10">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                    />
                </div>
            </div>

            {/* Next Level Requirements */}
            {levelInfo.level < 10 ? (
                <div className="flex items-center gap-6 relative z-10 px-1 text-text-muted">
                    <div className="flex items-center gap-2">
                        <Target size={14} className="opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            Required: <span className="text-text-main">{levelInfo.nextLevelRequirements.wpm} WPM</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            Precision: <span className="text-text-main">{levelInfo.nextLevelRequirements.accuracy}%</span>
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 py-2">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/5 rounded-xl border border-primary/20">
                        <Crown size={18} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Top Speed Unlocked</span>
                    </div>
                </div>
            )}

            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        </div>
    );
};
