import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Rocket, ShieldCheck, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { TypingMetrics } from '@shared/types';

interface SaveProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    metrics: TypingMetrics | null;
    onSignup: () => void;
    onLogin: () => void;
}

export const SaveProgressModal: React.FC<SaveProgressModalProps> = ({ isOpen, onClose, metrics, onSignup, onLogin }) => {
    if (!isOpen || !metrics) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-bg-main border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-8 sm:p-12 text-center"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-text-muted transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-8 relative">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto border border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] animate-bounce">
                            <Rocket size={40} className="text-primary" />
                        </div>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary/20 rounded-full blur-xl animate-pulse"></div>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-text-main mb-4 tracking-tighter uppercase italic">
                        Elite Potential Detected.
                    </h2>
                    
                    <p className="text-text-muted mb-10 text-sm leading-relaxed max-w-xs mx-auto">
                        You just clocked <span className="text-primary font-black">{Math.round(metrics.netWPM)} WPM</span> with <span className="text-primary font-black">{Math.round(metrics.accuracy)}% accuracy</span>. Claim your profile to save these results and track your path to mastery.
                    </p>

                    <div className="grid grid-cols-1 gap-4 mb-10">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Persistent Analytics</div>
                                <div className="text-xs font-bold text-text-main mt-0.5">Track every keystroke and watch your E-E-A-T score grow.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Award size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Professional Credentials</div>
                                <div className="text-xs font-bold text-text-main mt-0.5">Earn certifications for Medical, Legal, and Code proficiency.</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={onSignup}
                            className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/30"
                        >
                            Claim Session & Sign Up
                        </Button>
                        <div className="flex items-center justify-center gap-4 mt-2">
                             <button 
                                onClick={onLogin}
                                className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
                            >
                                Already have an account? Log In
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-30 hover:opacity-100 transition-opacity"
                    >
                        Continue as Guest • Results Will Not Be Saved
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
