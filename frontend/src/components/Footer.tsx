import React from 'react';
import { Linkedin, Twitter, Mail, Facebook, Rocket, Cat, ShieldCheck, Box, Target, Terminal } from 'lucide-react';
import { SOCIAL_LINKS, FOOTER_LINKS, RESEARCH_LINKS, CONTACT_INFO } from '../utils/seoConstants';

interface FooterProps {
    onNavigate: (stage: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-bg-main border-t border-white/5 pt-24 pb-12 px-6 relative z-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <div className="text-2xl font-black uppercase tracking-tighter italic mb-6">
                            TouchFlow <span className="text-primary">Pro</span>
                        </div>
                        <p className="text-text-muted text-[11px] font-bold leading-relaxed max-w-sm mb-8 opacity-60 uppercase tracking-wider">
                            Professional-grade typing performance training for serious typists. 
                            Break through the OK Plateau with science-backed drills and fatigue-aware analytics.
                        </p>
                        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
                            <a 
                                href={SOCIAL_LINKS.LINKEDIN} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.X} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="X (Twitter)"
                            >
                                <Twitter size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.FACEBOOK} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="Facebook"
                            >
                                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.WELLFOUND} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="Wellfound"
                            >
                                <Rocket size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.PRODUCTHUNT} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="Product Hunt"
                            >
                                <Cat size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.SAASHUB} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="SaaSHub"
                            >
                                <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.SOURCEFORGE} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="SourceForge"
                            >
                                <Box size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.INDIEHACKERS} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="Indie Hackers"
                            >
                                <Target size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={SOCIAL_LINKS.DEVTO} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="Dev.to"
                            >
                                <Terminal size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href={`mailto:${CONTACT_INFO.EMAIL}`}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                aria-label="Email"
                            >
                                <Mail size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main/40 mb-8 italic">Platform</h4>
                        <ul className="space-y-4">
                            {FOOTER_LINKS.map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => onNavigate(link.stage)}
                                        className="text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-widest"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Research Links */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main/40 mb-8 italic">Research</h4>
                        <ul className="space-y-4">
                            {RESEARCH_LINKS.map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => onNavigate(link.stage)}
                                        className="text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-widest"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Column */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main/40 mb-8">System</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">All Systems Operational</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">
                                v0.9.4 Prototype Build
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-30">
                        &copy; {new Date().getFullYear()} TouchFlow Pro. Developed for precision.
                    </p>
                    <div className="flex items-center gap-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-20 italic">
                            Master your interface.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
