import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    LayoutDashboard,
    BookOpen,
    Zap,
    BarChart3,
    Award,
    Trophy,
    Compass,
    Shield,
    Code,
    Gamepad2,
    Users,
    Settings as SettingsIcon,
    LogOut,
    User as UserIcon,
    Home
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from './ui/Button';

// Types (Mirrors App.tsx)
import type { Stage } from '../App';
import type { UserProgress, Lesson } from '@shared/curriculum';

interface HeaderProps {
    user: any | null; // Typed loosely to avoid complex User type deps, or we can import if available
    userProgress: UserProgress | null;
    stage: Stage;
    setStage: (stage: Stage) => void;
    logout: () => void;
    currentLesson: Lesson | null;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    userProgress,
    stage,
    setStage,
    logout,
    currentLesson
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu when stage changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [stage]);

    // Close menu on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'curriculum', label: 'Learn', icon: BookOpen },
        { id: 'practice', label: 'Practice', icon: Zap },
        { id: 'games', label: 'Games', icon: Gamepad2 },
        { id: 'orgs', label: 'Teams', icon: Users },
        { id: 'code_practice', label: 'Code', icon: Compass },
        { id: 'analytics', label: 'Stats', icon: BarChart3 },
        { id: 'achievements', label: 'Awards', icon: Award },
        { id: 'leaderboard', label: 'Ranks', icon: Trophy },
        { id: 'certificate', label: 'Certify', icon: Shield },
        { id: 'extension', label: 'VS Code', icon: Code },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ] as const;

    const isActive = (id: string) => {
        return stage === id ||
            (id === 'curriculum' && (stage === 'lesson' || stage === 'levelup')) ||
            (id === 'games' && stage.startsWith('games_'));
    };

    return (
        <>
            <header className="glass-header rounded-b-[2rem] px-6 sm:px-12 py-2 relative z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">

                    {/* LOGO AREA */}
                    <div className="flex items-center gap-8">
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="TouchFlow Pro"
                            className="h-10 w-auto cursor-pointer active:scale-95 transition-all hover:brightness-110"
                            onClick={() => user ? setStage('dashboard') : setStage('welcome')}
                        />
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
                    </div>

                    {/* DESKTOP ACTIONS (md+) */}
                    <div className="hidden md:flex items-center gap-4 sm:gap-8">
                        {!user ? (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setStage('auth_login')}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-colors whitespace-nowrap"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setStage('auth_signup')}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="flex flex-col items-end gap-1 cursor-pointer group"
                                    onClick={() => setStage('profile')}
                                >
                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-0.5 group-hover:text-secondary transition-colors whitespace-nowrap">Account ID</span>
                                    <span className="text-xs font-bold text-text-main leading-none group-hover:text-primary transition-colors max-w-[150px] truncate">{user.email}</span>
                                </div>

                                {user.subscriptionStatus !== 'pro' && (
                                    <button
                                        onClick={() => setStage('pricing')}
                                        className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap size={12} fill="currentColor" /> Upgrade
                                        </span>
                                    </button>
                                )}

                                <button
                                    onClick={logout}
                                    className="group relative px-5 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 transition-all hover:bg-red-500 hover:text-white active:scale-95 whitespace-nowrap"
                                >
                                    <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em]">Logout</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* MOBILE HAMBURGER (below md) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 text-text-muted hover:text-primary transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* SECONDARY NAV (Desktop/Tablet preferred, but scrollable on mobile if logged in) */}
                {user && userProgress && stage !== 'auth_login' && stage !== 'auth_signup' && stage !== 'welcome' && (
                    <div className="max-w-7xl mx-auto mt-2">
                        <nav className="flex items-center gap-1 nav-container overflow-x-auto scrollbar-none pb-2 md:pb-0">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setStage(item.id as Stage)}
                                    className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative group overflow-hidden whitespace-nowrap ${isActive(item.id)
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 active:scale-95'
                                            : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-500/10 dark:hover:bg-white/5 hover:text-text-main hover:translate-y-[-1px]'
                                        }`}
                                >
                                    <item.icon size={14} strokeWidth={2.5} className={`${isActive(item.id) ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-all`} />
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="px-2 border-t border-white/5 pt-4">
                            <Breadcrumbs
                                items={[
                                    { label: 'Home', onClick: () => setStage('dashboard') },
                                    {
                                        label: stage === 'lesson' ? 'Curriculum' : stage.replace('_', ' '),
                                        onClick: stage === 'lesson' ? () => setStage('curriculum') : undefined,
                                        active: stage !== 'lesson'
                                    },
                                    stage === 'lesson' ? { label: currentLesson?.title || 'Active Session', active: true } : null
                                ].filter((i): i is any => !!i)}
                            />
                        </div>
                    </div>
                )}
            </header>

            {/* MOBILE SLIDE-OVER MENU */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                        />
                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-[#0B1120] border-l border-white/10 z-[100] shadow-2xl flex flex-col p-6"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Menu</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} className="text-text-main" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                                {!user ? (
                                    // GUEST MENU
                                    <div className="flex flex-col gap-4">
                                        <Button
                                            onClick={() => setStage('welcome')}
                                            className="justify-start text-left bg-transparent border-0 hover:bg-white/5 p-4 h-auto"
                                        >
                                            <Home className="mr-3" size={18} />
                                            <span className="font-bold uppercase tracking-wider text-sm">Home</span>
                                        </Button>
                                        <Button
                                            onClick={() => setStage('pricing')}
                                            className="justify-start text-left bg-transparent border-0 hover:bg-white/5 p-4 h-auto"
                                        >
                                            <Zap className="mr-3" size={18} />
                                            <span className="font-bold uppercase tracking-wider text-sm">Pricing</span>
                                        </Button>
                                        <Button
                                            onClick={() => setStage('auth_login')}
                                            variant="outline"
                                            className="w-full justify-center mt-4 border-white/10"
                                        >
                                            LOGIN
                                        </Button>
                                        <Button
                                            onClick={() => setStage('auth_signup')}
                                            className="w-full justify-center"
                                        >
                                            SIGN UP
                                        </Button>
                                    </div>
                                ) : (
                                    // LOGGED IN MENU
                                    <div className="flex flex-col gap-2">
                                        {/* User Info Block */}
                                        <div className="p-4 rounded-xl bg-white/5 mb-4 border border-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-[10px] font-black text-primary uppercase tracking-wider">Account</div>
                                                    <div className="text-xs font-bold text-text-main truncate text-ellipsis">{user.email}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setStage('dashboard')}
                                            className="justify-start text-left bg-transparent border-0 hover:bg-white/5 p-3 h-auto"
                                        >
                                            <LayoutDashboard className="mr-3 text-primary" size={18} />
                                            <span className="font-bold uppercase tracking-wider text-[11px]">Dashboard</span>
                                        </Button>

                                        <Button
                                            onClick={() => setStage('profile')}
                                            className="justify-start text-left bg-transparent border-0 hover:bg-white/5 p-3 h-auto"
                                        >
                                            <UserIcon className="mr-3 text-text-muted" size={18} />
                                            <span className="font-bold uppercase tracking-wider text-[11px]">My Profile</span>
                                        </Button>

                                        {user.subscriptionStatus !== 'pro' && (
                                            <Button
                                                onClick={() => setStage('pricing')}
                                                className="justify-start text-left bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/50 p-3 h-auto mt-2"
                                            >
                                                <Zap className="mr-3 text-primary" size={18} />
                                                <span className="font-bold uppercase tracking-wider text-[11px] text-primary">Upgrade to Pro</span>
                                            </Button>
                                        )}

                                        <div className="h-px bg-white/10 my-2" />

                                        <Button
                                            onClick={logout}
                                            className="justify-start text-left bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 p-3 h-auto text-red-400"
                                        >
                                            <LogOut className="mr-3" size={18} />
                                            <span className="font-bold uppercase tracking-wider text-[11px]">Logout</span>
                                        </Button>

                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
