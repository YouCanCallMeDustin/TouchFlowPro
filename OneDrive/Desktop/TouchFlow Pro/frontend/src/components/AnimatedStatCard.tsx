import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface AnimatedStatCardProps {
    title: string;
    value: number;
    icon: string;
    color: string;
    suffix?: string;
    decimals?: number;
    delay?: number;
}

const AnimatedStatCard = ({
    title,
    value,
    icon,
    color,
    suffix = '',
    decimals = 0,
    delay = 0
}: AnimatedStatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }}
            className={`${color} border-2 rounded-2xl p-6 transition-all cursor-pointer`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.2 }}
                        className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2"
                    >
                        {title}
                    </motion.div>
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: delay + 0.3 }}
                        className="text-3xl font-black text-text-main"
                    >
                        <CountUp
                            end={value}
                            duration={1.5}
                            delay={delay}
                            decimals={decimals}
                            suffix={suffix}
                        />
                    </motion.div>
                </div>
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        delay: delay + 0.5
                    }}
                    className="text-4xl"
                >
                    {icon}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AnimatedStatCard;
