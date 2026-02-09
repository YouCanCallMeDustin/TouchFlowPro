import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

interface AchievementCelebrationProps {
    show: boolean;
    achievement: {
        name: string;
        icon: string;
        description: string;
    } | null;
    onClose: () => void;
}

const AchievementCelebration = ({ show, achievement, onClose }: AchievementCelebrationProps) => {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show || !achievement) return null;

    return (
        <>
            <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.3}
            />
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl p-12 shadow-2xl max-w-md mx-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: 2,
                        }}
                        className="text-8xl mb-6"
                    >
                        {achievement.icon}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-black text-text-main mb-3 bg-gradient-to-r from-primary-blue to-secondary-teal bg-clip-text text-transparent"
                    >
                        Achievement Unlocked!
                    </motion.h2>

                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-bold text-text-main mb-2"
                    >
                        {achievement.name}
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-text-muted text-lg"
                    >
                        {achievement.description}
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        onClick={onClose}
                        className="mt-8 px-8 py-3 bg-gradient-to-r from-primary-blue to-secondary-teal text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        Awesome! 🎉
                    </motion.button>
                </motion.div>
            </motion.div>
        </>
    );
};

export default AchievementCelebration;
