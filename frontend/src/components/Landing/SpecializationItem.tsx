import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SpecializationItemProps {
    icon: LucideIcon;
    label: string;
    description: string;
    delay?: number;
}

export const SpecializationItem: React.FC<SpecializationItemProps> = ({ icon: Icon, label, description, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-500/5 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon size={20} className="text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-main mb-2 truncate w-full">{label}</h4>
            <p className="text-[10px] text-text-muted opacity-40 font-bold uppercase tracking-widest leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
};
