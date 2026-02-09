import React from 'react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
    active?: boolean;
}

interface Props {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<Props> = ({ items }) => {
    return (
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={item.onClick}
                        disabled={item.active || !item.onClick}
                        className={`transition-colors duration-300 ${item.active
                                ? 'text-primary'
                                : 'text-text-muted hover:text-text-main cursor-pointer'
                            }`}
                    >
                        {item.label}
                    </motion.button>
                    {index < items.length - 1 && (
                        <span className="text-text-muted opacity-30">/</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};
