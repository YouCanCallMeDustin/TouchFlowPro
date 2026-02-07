import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'outline' | 'success';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider leading-none";

    const variants = {
        default: "bg-surface-2 text-text-muted border border-border",
        primary: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary/10 text-secondary border border-secondary/20",
        accent: "bg-accent/10 text-accent-dark border border-accent/20",
        success: "bg-green-500/10 text-green-600 border border-green-500/20",
        outline: "bg-transparent border border-text-muted text-text-muted",
    };

    return (
        <span className={`${baseClasses} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
