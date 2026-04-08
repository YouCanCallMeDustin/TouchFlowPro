import { Linkedin, Twitter, Facebook, Rocket, Cat } from 'lucide-react';
import { SOCIAL_LINKS, FOOTER_LINKS, RESEARCH_LINKS } from '../utils/seoConstants';

interface FooterProps {
    onNavigate: (stage: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-bg-main border-t border-white/5 pt-24 pb-12 px-6 relative z-50">
            <div className="max-w-7xl mx-auto">
                {/* Brand & Initial Notice */}
                <div className="mb-16">
                    <div className="text-2xl font-black uppercase tracking-tighter italic mb-4">
                        TouchFlow <span className="text-primary">Pro</span>
                    </div>
                    <p className="text-[10px] text-text-muted opacity-40 uppercase tracking-widest leading-relaxed max-w-2xl">
                        This platform is protected by proprietary anti-cheat and performance verification systems. 
                        We collect biometric typing patterns for security and performance calibration as described in our <button onClick={() => onNavigate('privacy')} className="hover:text-primary underline transition-colors">Privacy Policy</button>.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
                    {/* About Column */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main mb-8">Platform</h4>
                        <ul className="space-y-4">
                            {FOOTER_LINKS.map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => onNavigate(link.stage)}
                                        className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors hover:translate-x-1 duration-200 transform inline-block"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Research Column */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main mb-8">Science</h4>
                        <ul className="space-y-4">
                            {RESEARCH_LINKS.map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => onNavigate(link.stage)}
                                        className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors hover:translate-x-1 duration-200 transform inline-block"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Business Column */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main mb-8">Organizations</h4>
                        <ul className="space-y-4">
                            <li>
                                <button onClick={() => onNavigate('pricing')} className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors">Team Licensing</button>
                            </li>
                            <li>
                                <button onClick={() => onNavigate('organizations')} className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors tracking-tight">Enterprise Dashboard</button>
                            </li>
                            <li>
                                <button onClick={() => onNavigate('contact')} className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors">Workforce Training</button>
                            </li>
                            <li>
                                <button onClick={() => onNavigate('faq')} className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors">Support & SLAs</button>
                            </li>
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main mb-8">Follow us on</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href={SOCIAL_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-medium text-text-muted hover:text-primary transition-colors group">
                                    <Linkedin size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span>LinkedIn</span>
                                </a>
                            </li>
                            <li>
                                <a href={SOCIAL_LINKS.X} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-medium text-text-muted hover:text-primary transition-colors group">
                                    <Twitter size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span>Twitter (X)</span>
                                </a>
                            </li>
                            <li>
                                <a href={SOCIAL_LINKS.FACEBOOK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-medium text-text-muted hover:text-primary transition-colors group">
                                    <Facebook size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span>Facebook</span>
                                </a>
                            </li>
                            <li>
                                <a href={SOCIAL_LINKS.WELLFOUND} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-medium text-text-muted hover:text-primary transition-colors group">
                                    <Rocket size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span>Wellfound</span>
                                </a>
                            </li>
                            <li>
                                <a href={SOCIAL_LINKS.PRODUCTHUNT} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-medium text-text-muted hover:text-primary transition-colors group">
                                    <Cat size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <span>Product Hunt</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Regional/System Column */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-main mb-8">System Status</h4>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60">All Systems Operational</span>
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-40">
                                v0.9.4 Production Build
                            </div>
                        </div>
                        
                        <div className="pt-8">
                            <div className="inline-flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-not-allowed">
                                <span className="text-[10px] uppercase font-black tracking-tighter">🇺🇸 <span className="ml-2">United States</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal Bar */}
                <div className="pt-12 border-t border-white/5">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8">
                        <button onClick={() => onNavigate('terms')} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary opacity-60 transition-colors">Legal</button>
                        <button onClick={() => onNavigate('privacy')} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary opacity-60 transition-colors">Privacy Policy</button>
                        <button onClick={() => onNavigate('terms')} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary opacity-60 transition-colors">Terms & Conditions</button>
                        <a href={SOCIAL_LINKS.TRUSTPILOT} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary opacity-60 transition-colors">Trust in Reviews</a>
                        <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary opacity-60 transition-colors">System Status</button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary opacity-60 transition-colors">Cookie Preferences</button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-30">
                            &copy; {new Date().getFullYear()} TouchFlow Pro, Inc. All rights reserved. Precision engineered for performance.
                        </p>
                        <div className="flex items-center gap-8 italic opacity-20">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                                Master your interface.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
