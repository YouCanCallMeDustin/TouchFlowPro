import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, UserPlus, LogIn, type LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface PublicFeatureTeaserProps {
    featureName: string;
    description: string;
    icon: LucideIcon;
    onSignup: () => void;
    onLogin: () => void;
}

export const PublicFeatureTeaser: React.FC<PublicFeatureTeaserProps> = ({
    featureName,
    description,
    icon: Icon,
    onSignup,
    onLogin
}) => {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden card group bg-gradient-to-br from-primary/[0.05] via-transparent to-secondary/[0.05] border border-white/10 p-12 text-center"
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Header Icon */}
                <div className="relative z-10 flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <Icon size={36} className="text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-[#0B1120] shadow-lg">
                            <Lock size={14} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="relative z-10 space-y-6 mb-12">
                    <div className="flex flex-col items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-[0.3em] border border-secondary/20">
                            Member Exclusive Tier
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter uppercase leading-none">
                            {featureName} <span className="text-primary text-2xl align-top">†</span>
                        </h2>
                    </div>
                    
                    <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed opacity-70">
                        {description} Join the elite ranks of TouchFlow operatives to synchronize your profile and unlock this advanced training module.
                    </p>
                </div>

                {/* Conversion Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-main">Persistence Engine</span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">Save your performance trajectory, unlock achievements, and maintain your operational streak.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/20 transition-all text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap size={16} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-main">Elite Analytics</span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">Access heatmaps, bottleneck detection, and professional-grade certification protocols.</p>
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="relative z-10 mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={onSignup}
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn"
                    >
                        Claim My Operative ID <UserPlus size={16} />
                    </Button>
                    <button
                        onClick={onLogin}
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                    >
                        Sector Login <LogIn size={16} />
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={120} />
                </div>
            </motion.div>
        </div>
    );
};
