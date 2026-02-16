import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface AnimatedStatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    suffix?: string;
    decimals?: number;
    delay?: number;
}

const AnimatedStatCard = ({
    title,
    value,
    icon,
    suffix = '',
    decimals = 0,
    delay = 0
}: AnimatedStatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, type: 'spring', damping: 20 }}
            whileHover={{
                y: -5,
                transition: { duration: 0.3 }
            }}
            className="card relative overflow-hidden group border border-white/10 dark:border-white/5 active:scale-95 transition-transform p-6"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
                        </div>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] group-hover:text-text-main transition-colors">
                            {title}
                        </span>
                    </div>

                    <div className="text-3xl font-black text-text-main tracking-tighter">
                        <CountUp
                            end={value}
                            duration={2}
                            delay={delay}
                            decimals={decimals}
                            suffix={suffix}
                        />
                    </div>
                </div>
            </div>

            {/* Decorative background glow that activates on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-x-full group-hover:translate-x-full transform transition-transform" />
        </motion.div>
    );
};

export default AnimatedStatCard;
