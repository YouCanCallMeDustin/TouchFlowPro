import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    ArrowRight,
    Activity,
    Brain,
    LineChart,
    ShieldCheck,
    Stethoscope,
    Scale,
    Code,
    Terminal,
    Gamepad2,
    Newspaper
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { HeroFlow } from './HeroFlow';
import { FeatureCard } from './Landing/FeatureCard';
import { SpecializationItem } from './Landing/SpecializationItem';

interface LandingPageProps {
    onStartAssessment: () => void;
    onLogin: () => void;
}

const TypingText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            x: 20,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.p
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {words.map((word, index) => (
                <span key={index} className="inline-block mr-[0.25em] whitespace-nowrap">
                    {word.split("").map((char, charIndex) => (
                        <motion.span variants={child} key={charIndex} className="inline-block">
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </motion.p>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAssessment, onLogin }) => {
    // ... existing variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Hero Section */}
            <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4">
                <HeroFlow />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl w-full text-center relative z-10"
                >
                    <motion.div variants={itemVariants} className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-2xl backdrop-blur-sm">
                        <Zap className="text-primary fill-primary/20" size={32} />
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter uppercase italic text-text-main">
                        Elite <br />
                        <span className="text-primary">Typing Mastery.</span>
                    </motion.h1>

                    <TypingText
                        text="Ready to elevate your typing performance to elite levels?"
                        className="text-text-muted text-xl md:text-2xl mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] opacity-60"
                    />

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-xl mx-auto">
                        <Button
                            onClick={onStartAssessment}
                            className="w-full sm:flex-1 py-7 rounded-2xl font-black uppercase tracking-[0.4em] text-[14px] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] group overflow-hidden relative"
                            rightIcon={<ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                        >
                            Start Assessment
                        </Button>
                        <button
                            onClick={onLogin}
                            className="w-full sm:w-auto px-10 py-3 text-[11px] font-black text-text-main uppercase tracking-[0.3em] hover:text-primary transition-colors border-b border-white/10 hover:border-primary pb-2 opacity-60 hover:opacity-100"
                        >
                            Sign In to Profile
                        </button>
                    </motion.div>
                </motion.div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden md:block">
                    <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent" />
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-32 px-4 bg-black/20 backdrop-blur-3xl relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4 block">Engineered for Velocity</span>
                        <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic leading-none">
                            Precision Tools for <br /> Professional Typists
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={LineChart}
                            title="Precision Analytics"
                            description="Deep dive into accuracy, velocity, and key-specific trends. Identify bottlenecks with heatmaps."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Brain}
                            title="AI Adaptation"
                            description="Real-time optimization of practice drills targeting your specific phonetic and kinetic weak points."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Live Insights"
                            description="Dynamic feedback markers monitor consistency and rhythmic focus during every session."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Tier Progression"
                            description="A structured curriculum designed to move you from baseline to world-class professional status."
                            delay={0.4}
                        />
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            </section>

            {/* Curriculum Preview Section */}
            <section className="w-full py-32 px-4 relative overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <Card className="p-12 border-white/5 bg-white/5 backdrop-blur-md relative overflow-hidden group">
                        <div className="text-center mb-16 relative z-10">
                            <h3 className="text-3xl font-black text-text-main tracking-tighter uppercase italic mb-4">Tactical Specializations</h3>
                            <p className="text-text-muted text-sm font-bold uppercase tracking-[0.2em] opacity-40 max-w-lg mx-auto leading-relaxed">
                                Master high-stakes domains with custom terminologies and specialized operational modules.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
                            <SpecializationItem icon={Stethoscope} label="Medical" description="Diagnostic Terminology" delay={0.1} />
                            <SpecializationItem icon={Scale} label="Legal" description="Jurisdiction Metrics" delay={0.2} />
                            <SpecializationItem icon={Code} label="Programming" description="Syntax Engineering" delay={0.3} />
                            <SpecializationItem icon={Newspaper} label="Journalism" description="Narratological Speed" delay={0.4} />
                            <SpecializationItem icon={Terminal} label="DevOps" description="Operational CLI" delay={0.5} />
                            <SpecializationItem icon={Gamepad2} label="Gaming" description="Kinetic Interaction" delay={0.6} />
                        </div>

                        <div className="mt-16 text-center relative z-10">
                            <Button
                                onClick={onStartAssessment}
                                className="px-12 py-5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-[11px] font-black uppercase tracking-[0.3em]"
                            >
                                Explorer All Tiers
                            </Button>
                        </div>

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Card>
                </div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-secondary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </section>

            {/* Footer CTA */}
            <section className="w-full py-24 border-t border-white/5 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-8 opacity-40">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                        <Activity size={16} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Operational</span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter text-text-main mb-12 uppercase italic text-center">
                    Ready to Begin?
                </h3>
                <Button
                    onClick={onStartAssessment}
                    className="px-20 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[14px] shadow-2xl shadow-primary/30"
                >
                    Initialize First Session
                </Button>
            </section>
        </div>
    );
};
