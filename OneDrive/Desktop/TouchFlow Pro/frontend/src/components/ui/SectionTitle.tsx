import React from 'react';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
    title,
    subtitle,
    align = 'left',
    className = ''
}) => {
    const alignment = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return (
        <div className={`mb-8 ${alignment[align]} ${className}`}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main tracking-tight mb-2">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    );
};
