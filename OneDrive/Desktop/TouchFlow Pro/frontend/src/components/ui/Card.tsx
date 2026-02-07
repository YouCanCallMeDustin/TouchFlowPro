import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'interactive';
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    noPadding = false,
    ...props
}): React.ReactElement => {
    // Base styles are now handled by the .card class in index.css
    // We append the variant-specific overrides if needed, though .card handles most.

    return (
        <motion.div
            className={`card ${className} ${noPadding ? '!p-0' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...props}
        >
            {/* Inner Glow Effect handled by .card::before */}
            {/* Content with relative z-index to sit above Glow */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-xl font-heading font-bold text-text-main ${className}`}>
        {children}
    </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-sm text-text-muted mt-1 leading-relaxed ${className}`}>
        {children}
    </p>
);
