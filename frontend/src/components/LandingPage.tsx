import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
    Zap,
    ArrowRight,
    Activity,
    Brain,
    LineChart,
    Check,
    TrendingUp,
    Users,
    FileText,
    History,
    AlertCircle,
    ChevronDown,
    Layout
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { HeroFlow } from './HeroFlow';
import { FeatureCard } from './Landing/FeatureCard';

interface LandingPageProps {
    onStartAssessment: () => void;
    onViewSampleReport: () => void;
    onStartFreeTest: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const PricingCard: React.FC<{
    name: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
    onClick: () => void;
}> = ({ name, price, description, features, cta, popular, onClick }) => (
    <Card className={`p-8 flex flex-col h-full relative ${popular ? 'border-primary ring-1 ring-primary/50' : 'border-white/5'}`}>
        {popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                Most Popular
            </div>
        )}
        <div className="mb-8">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-primary">{price}</span>
                <span className="text-text-muted text-sm font-bold">/mo</span>
            </div>
            <p className="text-text-muted text-sm font-medium opacity-60">{description}</p>
        </div>
        <ul className="flex-1 space-y-4 mb-8">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-bold text-text-main/80 leading-snug">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" />
                    {f}
                </li>
            ))}
        </ul>
        <Button onClick={onClick} className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] ${popular ? '' : 'bg-white/10 hover:bg-white/20'}`}>
            {cta}
        </Button>
    </Card>
);

const AccordionItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-sm md:text-base font-black uppercase tracking-tight text-text-main group-hover:text-primary transition-colors italic">
                    {question}
                </span>
                <ChevronDown className={`transition-transform duration-300 text-primary ${isOpen ? 'rotate-180' : ''}`} size={20} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-sm text-text-muted font-medium leading-relaxed max-w-2xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAssessment, onViewSampleReport, onStartFreeTest }) => {
    return (
        <div className="w-full">
            {/* 1) HERO */}
            <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden px-4 md:px-0">
                <HeroFlow />
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl w-full text-center relative z-10"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
                        <Zap size={14} className="text-primary fill-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Overload Detected: Speed vs Accuracy</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-[5.5rem] font-black mb-6 leading-[0.9] tracking-tighter uppercase italic text-text-main">
                        Type Faster. <br />
                        Stay Accurate. <br />
                        <span className="text-primary">Build Endurance.</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-text-muted text-base md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-bold">
                        TouchFlow Pro is the typing improvement platform for working professionals. Train with spaced repetition, fatigue detection, and performance analytics—so your speed climbs without your accuracy collapsing.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Button
                            onClick={onStartFreeTest}
                            className="w-full sm:w-auto px-12 py-7 rounded-2xl font-black uppercase tracking-[0.3em] text-[13px] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] group relative overflow-hidden"
                        >
                            Start Free (Takes 60 seconds)
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 mb-12">
                        Built for Medical, Legal, and Tech Ops professionals • Track WPM, accuracy, weak keys, fatigue, plateaus
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto mt-16 pb-48">
                        {[
                            "Spaced repetition drills that actually stick",
                            "Fatigue scoring to prevent “fake progress”",
                            "Plateau detection with coaching tips",
                            "Guided training (Medical/Legal/Code)",
                            "Team dashboards + PDF/CSV reports"
                        ].map((bullet, i) => (
                            <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/5 text-left group hover:border-primary/20 transition-all hover:bg-white/[0.08]">
                                <div className="w-2 h-2 rounded-full bg-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold text-text-main/70 uppercase tracking-tight">{bullet}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* 2) TRUST STRIP */}
            <section className="w-full py-16 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-20 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-center">Trusted by serious typists who need results</span>
                    <div className="h-6 w-px bg-white/10 hidden lg:block" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-center">Built for professionals (not beginners)</span>
                    <div className="h-6 w-px bg-white/10 hidden lg:block" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-center">Data-driven metrics (WPM, Accuracy, Fatigue)</span>
                    <div className="h-6 w-px bg-white/10 hidden lg:block" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-center">Secure accounts + org controls + billing</span>
                </div>
            </section>

            {/* 3) THE PROBLEM → YOUR PROMISE */}
            <section className="py-32 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 block">The Performance Gap</span>
                            <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic leading-[0.9] mb-8">
                                Typing speed isn’t the <br />real goal. <span className="text-secondary/50">Reliable performance is.</span>
                            </h2>
                            <p className="text-text-muted text-lg font-bold leading-relaxed mb-8 opacity-60">
                                Most typing sites train you to spike WPM in short bursts. Real work requires accuracy under time pressure, low error rates, and endurance across long sessions.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: "Your true net WPM", icon: TrendingUp },
                                { title: "Error patterns & weak keys", icon: AlertCircle },
                                { title: "Improvement or plateaus", icon: LineChart },
                                { title: "Fatigue detection", icon: Activity }
                            ].map((item, i) => (
                                <Card key={i} className="p-8 border-white/5 bg-white/[0.02] flex flex-col items-start gap-6 group hover:border-primary/20 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <item.icon className="text-primary/60 group-hover:text-primary transition-colors" size={24} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.1em] text-text-main leading-tight italic">{item.title}</h4>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
            </section>

            {/* 4) PRODUCT VALUE (3 cards) */}
            <section className="py-32 px-4 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic mb-6">Engineered for Pros.</h2>
                        <p className="text-text-muted text-sm font-bold uppercase tracking-[0.3em] opacity-40">Precision tools for precision work.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Brain}
                            title="Professional Training Engine"
                            description="Spaced repetition + adaptive drills to turn weak points into strengths."
                        />
                        <FeatureCard
                            icon={LineChart}
                            title="Analytics That Coach You"
                            description="Heatmaps, session history, weekly trends, plateau detection, and next-step recommendations."
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Endurance & Fatigue Awareness"
                            description="Fatigue scoring adjusts intensity and scheduling so you improve without burning out."
                        />
                    </div>
                </div>
            </section>

            {/* 5) HOW IT WORKS (3 steps) */}
            <section className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 block">The Workflow</span>
                        <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic">Success in 3 Steps.</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 hidden md:block" />
                        {[
                            { step: "01", title: "Baseline in 3 minutes", description: "We measure your speed, accuracy, and weak-key profile." },
                            { step: "02", title: "Follow today’s plan", description: "Warmup → reviews → skill block → cooldown. Time-capped and targeted." },
                            { step: "03", title: "Track real improvement", description: "Weekly trends show what’s working—and what’s stalling." }
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-bg-main border border-white/10 flex items-center justify-center text-primary font-black text-2xl italic mb-8 shadow-xl">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight italic mb-4">{step.title}</h3>
                                <p className="text-text-muted text-sm font-medium leading-relaxed max-w-[250px] opacity-60">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-20 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button onClick={onStartFreeTest} className="px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px]">
                                Start Free
                            </Button>
                            <button
                                onClick={onViewSampleReport}
                                className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-colors border-b border-white/10 pb-1"
                            >
                                View Sample Report
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6) FEATURE SECTION (short, punchy) */}
            <section className="py-32 px-4 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center gap-8 mb-24">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic leading-[0.9] mb-4">
                                What you get.
                            </h2>
                            <p className="text-text-muted text-sm font-bold uppercase tracking-[0.3em] opacity-40">Ready for elite performance?</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Guided Training Plans", description: "(Medical / Legal / Code)", icon: Layout },
                            { title: "Smart Recommendations", description: "Break vs. Review vs. New", icon: Brain },
                            { title: "Spaced Repetition", description: "Quality-based intervals", icon: History },
                            { title: "Fatigue Detection", description: "Rhythm + Accuracy drop signals", icon: Activity },
                            { title: "Plateau Watch", description: "Stagnation signals + advice", icon: LineChart },
                            { title: "Session History & Trends", description: "Full diagnostic logs", icon: History },
                            { title: "Organizations", description: "Roles, invites, seat limits", icon: Users },
                            { title: "Enterprise Reports", description: "CSV + Polished PDF exports", icon: FileText }
                        ].map((feat, i) => (
                            <Card key={i} className="p-8 border-white/5 bg-white/[0.02] flex flex-col gap-4 group hover:border-primary/20 transition-all">
                                <feat.icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
                                <div>
                                    <h4 className="text-[13px] font-black uppercase tracking-tight text-text-main mb-1 italic leading-tight">{feat.title}</h4>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-40">{feat.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7) SOCIAL PROOF (placeholders) */}
            <section className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic mb-4">Real results.</h2>
                        <p className="text-text-muted text-sm font-bold uppercase tracking-[0.3em] opacity-40">Built for and with industry pros.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                        <Card className="p-10 border-white/5 bg-white/[0.02] italic">
                            <p className="text-lg font-bold text-text-main mb-8 leading-relaxed opacity-80">
                                “In two weeks my accuracy stopped tanking at higher speeds. The fatigue score was a wake-up call.”
                            </p>
                            <div className="flex items-center gap-4 not-italic">
                                <div className="w-10 h-10 rounded-full bg-primary/20" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest leading-none mb-1">D. Kovacs</h4>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">Front-end Lead</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-10 border-white/5 bg-white/[0.02] italic">
                            <p className="text-lg font-bold text-text-main mb-8 leading-relaxed opacity-80">
                                “The weekly report made it easy to coach our team without micromanaging.”
                            </p>
                            <div className="flex items-center gap-4 not-italic">
                                <div className="w-10 h-10 rounded-full bg-secondary/20" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest leading-none mb-1">M. Chen</h4>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">Ops Manager</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-8 animate-pulse">
                            Early Access: looking for 20 pilot users
                        </p>
                        <Button variant="secondary" className="bg-white/5 border-white/10 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px]">
                            Apply for Pilot
                        </Button>
                    </div>
                </div>
            </section>

            {/* 8) PRICING (clean, confident) */}
            <section className="py-32 px-4 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic mb-6">Simple plans.</h2>
                        <p className="text-text-muted text-sm font-bold uppercase tracking-[0.3em] opacity-40">For individuals and teams.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <PricingCard
                            name="Starter"
                            price="$9"
                            description="For personal improvement"
                            features={[
                                "Training plans + core drills",
                                "Basic analytics",
                                "Session history"
                            ]}
                            cta="Start Starter"
                            onClick={onStartAssessment}
                        />
                        <PricingCard
                            name="Pro"
                            price="$49"
                            description="Teams of up to 10"
                            features={[
                                "Advanced analytics + plateau watch",
                                "Fatigue-aware scheduling",
                                "Premium reports & exports",
                                "Priority feature requests"
                            ]}
                            cta="Go Pro"
                            popular
                            onClick={onStartAssessment}
                        />
                        <PricingCard
                            name="Enterprise"
                            price="$299"
                            description="Up to 100 users"
                            features={[
                                "Org dashboards + coaching metrics",
                                "Seat management + roles",
                                "Weekly PDF/CSV reporting",
                                "Billing portal + admin controls"
                            ]}
                            cta="Contact Sales"
                            onClick={onStartAssessment}
                        />
                    </div>
                    <p className="text-center mt-12 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">
                        No long contracts. Upgrade/downgrade anytime.
                    </p>
                </div>
            </section>

            {/* 9) FAQ (reduce friction) */}
            <section className="py-32 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic leading-[0.9] mb-4">
                            Questions.
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <AccordionItem
                            question="Is this for beginners?"
                            answer="No—TouchFlow Pro is built for intermediate and advanced typists who want measurable progress."
                        />
                        <AccordionItem
                            question="Will it make me faster or just show charts?"
                            answer="It trains speed and accuracy with a system that adapts to your weak points and fatigue. The charts are the diagnostic data used to guide the training."
                        />
                        <AccordionItem
                            question="What’s fatigue detection?"
                            answer="We detect performance drops and rhythm instability. When you’re tired, we adjust intensity so you don’t lock in sloppy habits."
                        />
                        <AccordionItem
                            question="Can teams use this?"
                            answer="Yes. Organizations get dashboards, coaching metrics, and weekly PDF/CSV reports to track team-wide progress."
                        />
                        <AccordionItem
                            question="Do you have a free trial?"
                            answer="Yes—start free, run your baseline, and upgrade when you want advanced analytics and reports."
                        />
                    </div>
                </div>
            </section>

            {/* 10) FINAL CTA (bottom) */}
            <section className="py-40 px-4 relative overflow-hidden text-center bg-gradient-to-b from-transparent to-primary/5">
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-7xl font-black text-text-main tracking-tighter uppercase italic leading-[0.9] mb-12">
                        Ready to type like <br />a pro—<span className="text-primary underline decoration-primary/30 underline-offset-8">consistently?</span>
                    </h2>
                    <p className="text-text-muted text-lg font-bold uppercase tracking-[0.2em] mb-12 opacity-60">
                        Start free, run your baseline, and get your first training plan in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            onClick={onStartFreeTest}
                            className="w-full sm:w-auto px-16 py-7 rounded-2xl font-black uppercase tracking-[0.4em] text-[13px] shadow-2xl shadow-primary/30"
                        >
                            Start Free
                        </Button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none" />
            </section>
        </div>
    );
};
