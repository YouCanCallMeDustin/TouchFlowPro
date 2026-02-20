import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DropdownItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
}

interface DropdownProps {
    label: string;
    icon?: LucideIcon;
    items: DropdownItem[];
    isActive?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, icon: Icon, items, isActive }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex-shrink-0" ref={dropdownRef} onMouseLeave={() => setIsOpen(false)}>
            <button
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative group overflow-hidden whitespace-nowrap ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 active:scale-95'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-500/10 dark:hover:bg-white/5 hover:text-text-main hover:translate-y-[-1px]'
                    }`}
            >
                {Icon && (
                    <Icon size={14} strokeWidth={2.5} className={`${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-all`} />
                )}
                <span className="relative z-10">{label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[#0B1120] border border-white/10 shadow-2xl overflow-hidden z-[100] py-2"
                        onMouseEnter={() => setIsOpen(true)}
                    >
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    item.onClick();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {item.icon && <item.icon size={14} strokeWidth={2.5} className="opacity-70" />}
                                {item.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
