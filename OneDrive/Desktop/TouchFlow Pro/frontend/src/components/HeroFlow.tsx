import React from 'react';
import { motion } from 'framer-motion';

const KEYWORDS = [
    "EFFICIENCY",
    "FLUIDITY",
    "ACCURACY",
    "FLOW",
    "PRECISION",
    "MASTERY",
    "CONSISTENCY",
    "FOCUS"
];

const MarqueeRow: React.FC<{ words: string[], direction?: 'left' | 'right', speed?: number }> = ({ words, direction = 'left', speed = 20 }) => {
    return (
        <div className="flex overflow-hidden select-none gap-8 py-4 opacity-5">
            <motion.div
                initial={{ x: direction === 'left' ? 0 : "-50%" }}
                animate={{ x: direction === 'left' ? "-50%" : 0 }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
                className="flex flex-nowrap gap-8 min-w-full items-center"
            >
                {/* Double the words to ensure seamless loop */}
                {[...words, ...words, ...words, ...words].map((word, i) => (
                    <span
                        key={i}
                        className="text-[12vw] font-black tracking-tighter text-text-main whitespace-nowrap"
                    >
                        {word}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export const HeroFlow: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 flex flex-col justify-center pointer-events-none overflow-hidden py-20">
            <MarqueeRow words={KEYWORDS} speed={30} direction="left" />
            <MarqueeRow words={KEYWORDS.slice().reverse()} speed={45} direction="right" />
            <MarqueeRow words={KEYWORDS.slice(4).concat(KEYWORDS.slice(0, 4))} speed={35} direction="left" />
            <MarqueeRow words={KEYWORDS} speed={50} direction="right" />

            {/* Center Content Shield/Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-main via-transparent to-bg-main pointer-events-none" />
        </div>
    );
};
