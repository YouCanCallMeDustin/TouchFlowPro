import React from 'react';
import { Card } from './Card';

interface StatTileProps {
    label: string;
    value: string | number;
    unit?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number; // e.g. +5 or -2
        label?: string; // e.g. "vs last week"
    };
    color?: 'primary' | 'secondary' | 'accent' | 'default';
}

export const StatTile: React.FC<StatTileProps> = ({
    label,
    value,
    unit,
    icon,
    trend,
    color = 'default'
}) => {
    const colorStyles = {
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        default: "text-text-main"
    };

    return (
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-surface/50">
            {icon && <div className="text-3xl mb-3 opacity-80">{icon}</div>}

            <div className={`text-4xl font-heading font-extrabold tracking-tight ${colorStyles[color]}`}>
                {value}
                {unit && <span className="text-lg font-semibold ml-1 opacity-60">{unit}</span>}
            </div>

            <div className="text-xs uppercase tracking-widest font-bold text-text-muted mt-2">
                {label}
            </div>

            {trend && (
                <div className={`text-xs mt-3 font-medium ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.value > 0 ? '+' : ''}{trend.value} {trend.label}
                </div>
            )}
        </Card>
    );
};
