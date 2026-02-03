export interface SpecialtyTheme {
    category: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    bgClass: string;
    cardClass: string;
    fontClass: string;
    icon: string;
    glowColor: string;
}

export const specialtyThemes: Record<string, SpecialtyTheme> = {
    'Medical': {
        category: 'Medical',
        primaryColor: 'text-blue-600',
        secondaryColor: 'text-teal-500',
        accentColor: 'text-orange-500',
        bgClass: 'from-blue-50 to-teal-50/30',
        cardClass: 'bg-white/70 border-white/50 shadow-blue-100',
        fontClass: 'font-heading',
        icon: '🏥',
        glowColor: 'rgba(30, 58, 138, 0.1)'
    },
    'Legal': {
        category: 'Legal',
        primaryColor: 'text-slate-900',
        secondaryColor: 'text-amber-700',
        accentColor: 'text-slate-700',
        bgClass: 'from-slate-100 to-amber-50/20',
        cardClass: 'bg-white/80 border-slate-200 shadow-slate-200',
        fontClass: 'font-heading',
        icon: '⚖️',
        glowColor: 'rgba(15, 23, 42, 0.05)'
    },
    'Coding': {
        category: 'Coding',
        primaryColor: 'text-indigo-600',
        secondaryColor: 'text-emerald-500',
        accentColor: 'text-fuchsia-500',
        bgClass: 'from-slate-900 via-indigo-950 to-slate-900',
        cardClass: 'bg-slate-900/80 border-indigo-500/30 shadow-indigo-500/20 text-indigo-50',
        fontClass: 'font-mono',
        icon: '💻',
        glowColor: 'rgba(99, 102, 241, 0.2)'
    },
    'Journalism': {
        category: 'Journalism',
        primaryColor: 'text-neutral-900',
        secondaryColor: 'text-red-700',
        accentColor: 'text-neutral-600',
        bgClass: 'from-neutral-200 to-neutral-50',
        cardClass: 'bg-white border-neutral-300 shadow-neutral-400',
        fontClass: 'font-sans',
        icon: '📰',
        glowColor: 'rgba(0, 0, 0, 0.1)'
    },
    'DevOps': {
        category: 'DevOps',
        primaryColor: 'text-green-500',
        secondaryColor: 'text-amber-500',
        accentColor: 'text-slate-400',
        bgClass: 'bg-black',
        cardClass: 'bg-slate-900 border-green-500/50 shadow-green-500/20 text-green-50',
        fontClass: 'font-mono',
        icon: '🛠️',
        glowColor: 'rgba(34, 197, 94, 0.3)'
    },
    'Gaming': {
        category: 'Gaming',
        primaryColor: 'text-purple-500',
        secondaryColor: 'text-cyan-400',
        accentColor: 'text-rose-500',
        bgClass: 'from-slate-900 via-purple-900/20 to-slate-950',
        cardClass: 'bg-slate-900/90 border-purple-500/50 shadow-purple-500/40 text-white',
        fontClass: 'font-heading',
        icon: '🎮',
        glowColor: 'rgba(168, 85, 247, 0.4)'
    }
};

export const getTheme = (category: string): SpecialtyTheme => {
    return specialtyThemes[category] || specialtyThemes['Medical'];
};
