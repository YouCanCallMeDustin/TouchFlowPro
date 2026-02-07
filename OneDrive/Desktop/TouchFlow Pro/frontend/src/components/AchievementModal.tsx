import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
    type: string;
    name: string;
    icon: string;
    description: string;
}

const ACHIEVEMENT_INFO: Record<string, Omit<Achievement, 'type'>> = {
    'speed_bronze': { name: 'Speed Bronze', icon: '🥉', description: 'Reach 40 WPM' },
    'speed_silver': { name: 'Speed Silver', icon: '🥈', description: 'Reach 70 WPM' },
    'speed_gold': { name: 'Speed Gold', icon: '🥇', description: 'Reach 100 WPM' },
    'accuracy_bronze': { name: 'Accuracy Bronze', icon: '🎯', description: 'Reach 95% Accuracy' },
    'accuracy_silver': { name: 'Accuracy Silver', icon: '💎', description: 'Reach 98% Accuracy' },
    'accuracy_gold': { name: 'Accuracy Gold', icon: '👑', description: 'Reach 100% Accuracy' },
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    achievementType?: string;
    isLeveledUp?: boolean;
    newLevel?: number;
}

const AchievementModal: React.FC<Props> = ({ isOpen, onClose, achievementType, isLeveledUp, newLevel }) => {
    const info = achievementType ? ACHIEVEMENT_INFO[achievementType] : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="relative max-w-sm w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center"
                    >
                        {/* Sparkles/Confetti background simulation */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{ y: -100, opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                    className="absolute bottom-0 text-xl"
                                    style={{ left: `${i * 20}%` }}
                                >
                                    ✨
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative z-10 space-y-6">
                            <motion.div
                                initial={{ rotate: -10, scale: 0.5 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="text-8xl mb-2 drop-shadow-xl"
                            >
                                {isLeveledUp ? '🚀' : (info?.icon || '🏆')}
                            </motion.div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">
                                    {isLeveledUp ? 'New Milestone!' : 'Achievement Unlocked!'}
                                </h3>
                                <h2 className="text-3xl font-black text-text-main leading-tight">
                                    {isLeveledUp ? `Level ${newLevel} Reached` : (info?.name || 'Grand Master')}
                                </h2>
                                <p className="text-text-muted">
                                    {isLeveledUp ? 'Your typing potential is soaring!' : (info?.description || 'You are making incredible progress.')}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-primary-blue to-blue-800 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest text-xs"
                            >
                                Awesome!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AchievementModal;
