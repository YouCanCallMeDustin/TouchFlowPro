import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/30 transition-all hover:bg-white/10 relative overflow-hidden h-full flex flex-col"
        >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20 shadow-lg shadow-primary/5">
                <Icon className="text-primary" size={28} />
            </div>
            <h3 className="text-2xl font-black text-text-main mb-3 uppercase tracking-tighter group-hover:text-primary transition-colors italic">
                {title}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                {description}
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};
