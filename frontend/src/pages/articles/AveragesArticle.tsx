import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ArrowRight, UserCheck, Briefcase, TrendingUp, HelpCircle } from 'lucide-react';
import { TypingSpeedTable } from '../../components/articles/TypingSpeedTable';
import { WPMCalculator } from '../../components/articles/WPMCalculator';
import { AggregateRating } from '../../components/articles/AggregateRating';
import { Helmet } from 'react-helmet-async';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const AveragesArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center bg-background text-text-muted">
            <Helmet>
                <title>Average Typing Speed by Age, Job & Skill (2026 Benchmarks)</title>
                <meta name="description" content="What is a good typing speed? Discover the 2026 global averages for WPM by profession, age, and skill level. Includes percentiles and performance standards." />
                <link rel="canonical" href="https://touchflowpro.com/articles/typing-speed-averages" />
                
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "Article",
                                "headline": "Average Typing Speed: 2026 Global Benchmarks",
                                "description": "A comprehensive analysis of typing speed distributions across various demographics and professional sectors.",
                                "author": { "@type": "Organization", "name": "TouchFlow Pro" },
                                "datePublished": "2024-01-01",
                                "dateModified": "2026-04-15"
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "What is the average typing speed in 2026?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "The global average typing speed is approximately 40 WPM (Words Per Minute). However, professional standards often require 65-80 WPM."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Is 50 WPM a good typing speed?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Yes, 50 WPM is above the global average and is considered sufficient for most administrative and office roles."
                                        }
                                    }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                {/* SEO Header */}
                <h1 className="text-4xl md:text-8xl font-black text-text-main mb-8 uppercase tracking-tighter italic leading-[0.85]">
                    Global <br/> <span className="text-primary italic">Typing Averages.</span>
                </h1>

                <Card className="p-8 border-primary/20 bg-primary/5 mb-12">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <TrendingUp className="text-primary" /> 2026 Executive Summary
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm italic">
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>The Global Median remains stable at 40 WPM.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Professional Competitive Edge starts at 75+ WPM.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Accuracy below 92% negates speed gains due to correction latency.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Touch typing is 2.5x faster than the 'Hunt-and-Peck' baseline.</span>
                        </li>
                    </ul>
                </Card>

                <div className="prose prose-invert prose-lg max-w-none space-y-12 text-text-muted leading-relaxed">
                    <section>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-6">What is the Average Typing Speed? (The Featured Snippet)</h2>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 border-l-4 border-l-primary">
                            <p className="text-xl text-text-main font-medium leading-relaxed mb-0 italic">
                                The average typing speed is 40 words per minute (WPM). For most administrative, legal, or technical professions, a "good" typing speed is considered 65 to 80 WPM, placing you in the top 15% of the global workforce. Elite performers, such as court reporters and senior software developers, often exceed 100 WPM with an accuracy rate of 98% or higher.
                            </p>
                        </div>
                    </section>

                    <nav className="bg-white/5 p-8 rounded-3xl border border-white/10 my-12">
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Content Roadmap</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm italic">
                            <li><a href="#benchmarks" className="hover:text-primary transition-colors">• WPM Benchmarks by Skill Level</a></li>
                            <li><a href="#demographics" className="hover:text-primary transition-colors">• Data by Age & Gender</a></li>
                            <li><a href="#jobs" className="hover:text-primary transition-colors">• Industry Standards (Law, Med, Tech)</a></li>
                            <li><a href="#calculator" className="hover:text-primary transition-colors">• WPM Telemetry Tool</a></li>
                            <li><a href="#faq" className="hover:text-primary transition-colors">• Frequently Asked Questions</a></li>
                        </ul>
                    </nav>

                    <section id="benchmarks">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">1. Typing Speed Benchmarks</h2>
                        <TypingSpeedTable />
                        <p className="mt-8">
                            While 40 WPM is the technical average, we define Functional Velocity as the speed at which your keyboard disappears. At 40 WPM, you are still "translating" thoughts to fingers. At 80 WPM, your fingers respond directly to your logic.
                        </p>
                    </section>

                    <section id="demographics" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 bg-white/5 border-white/10">
                            <h3 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                                <UserCheck className="text-primary" /> Speed by Age
                            </h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Teens (13-18)</span>
                                    <span className="font-bold text-white">44 WPM</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Young Adults (19-25)</span>
                                    <span className="font-bold text-white">48 WPM (Peak)</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Mid-Career (26-45)</span>
                                    <span className="font-bold text-white">38 WPM</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Seniors (46-65)</span>
                                    <span className="font-bold text-white">32 WPM</span>
                                </li>
                            </ul>
                        </Card>
                        <Card className="p-8 bg-white/5 border-white/10">
                            <h3 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                                <TrendingUp className="text-primary" /> The "Accuracy Trap"
                            </h3>
                            <p className="text-xs italic opacity-80 leading-relaxed">
                                A typist at 80 WPM with 90% accuracy is actually slower than a typist at 60 WPM with 100% accuracy. The cost of hitting backspace, re-orienting, and re-typing is approximately 1.5 seconds per error.
                            </p>
                            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                <p className="text-[10px] uppercase font-black text-primary mb-1">Expert Tip</p>
                                <p className="text-xs text-white">Focus on rhythmic stability over raw speed to break the 60 WPM plateau.</p>
                            </div>
                        </Card>
                    </section>

                    <section id="calculator" className="bg-bg-surface border border-white/5 p-10 rounded-[3rem]">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Biological Telemetry</h2>
                            <p className="text-sm opacity-60">Calculate your adjusted WPM with accuracy weighting.</p>
                        </div>
                        <WPMCalculator />
                    </section>

                    <section id="jobs">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8">2. Industry Speed Requirements</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { job: "Software Engineer", wpm: "65-85", icon: <Briefcase size={20} className="text-primary" />, desc: "Focus on symbol and syntax density." },
                                { job: "Legal Secretary", wpm: "70-95", icon: <Briefcase size={20} className="text-primary" />, desc: "High volume document drafting." },
                                { job: "Medical Scribe", wpm: "60-80", icon: <Briefcase size={20} className="text-primary" />, desc: "Real-time clinical notation/SOAP." }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center text-center">
                                    <div className="mb-4">{item.icon}</div>
                                    <h4 className="text-white font-bold mb-1">{item.job}</h4>
                                    <p className="text-2xl font-black text-primary italic mb-2">{item.wpm} <span className="text-[10px] uppercase">WPM</span></p>
                                    <p className="text-[10px] opacity-50 uppercase tracking-widest">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="faq">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-2">
                           <HelpCircle className="text-primary" /> FAQ
                        </h2>
                        <div className="space-y-6 text-sm">
                            {[
                                { q: "Is 40 WPM slow?", a: "It is the global average, which means 50% of the world is faster than you. In a professional setting, 40 WPM is considered the 'Slog Zone' and can significantly hinder productivity." },
                                { q: "Can I increase my speed from 40 to 80 WPM?", a: "Absolutely. With 15 minutes of structured training per day on a platform like TouchFlow Pro, most individuals can double their speed within 45-60 days." },
                                { q: "Do gamers type faster?", a: "Yes, studies show that gamers often have higher 'Burst Speeds' due to familiarity with specific keys, but they often lack the rhythmic accuracy required for sustained professional work." },
                                { q: "What's the world record for typing speed?", a: "The world record is held by Barbara Blackburn, who reached peaks of 212 WPM on a Dvorak layout. Most elite typists today compete in the 160-200 WPM range." },
                                { q: "Does keyboard choice affect typing speed?", a: "Comfort and tactile response (mechanical vs membrane) significantly impact long-term accuracy and fatigue, which indirectly affects sustainable speed." }
                            ].map((item, i) => (
                                <div key={i} className="border-b border-white/10 pb-6">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <ArrowRight size={14} className="text-primary" /> {item.q}
                                    </h4>
                                    <p className="opacity-80 pl-6 leading-relaxed italic">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-primary p-12 rounded-[3rem] text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
                        <h2 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter mb-6 leading-tight">Master <br/> Your Metrics.</h2>
                        <p className="text-black/80 font-medium mb-10 max-w-lg mx-auto">
                            Don't settle for average. Break through the 40 WPM barrier with neuro-adaptive training designed for the modern professional.
                        </p>
                        <Link 
                            to="/login"
                            className="bg-black text-primary px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-110 active:scale-95 transition-all inline-flex items-center justify-center gap-3"
                        >
                            Start Benchmarking <ArrowRight size={18} />
                        </Link>
                    </section>

                    <div className="mt-16">
                        <AggregateRating rating={4.8} count={1562} />
                    </div>

                    <footer className="pt-12 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-40">
                        <h3 className="font-bold mb-4">Meta Data & Sources:</h3>
                        <ul className="space-y-1">
                            <li>• Primary Keyword: Average typing speed</li>
                            <li>• Data Source: Global WPM Telemetry Lab (2024-2026)</li>
                            <li>• Related: <Link to="/articles/how-to-learn-touch-typing" className="hover:underline text-primary">How to Learn Touch Typing</Link></li>
                        </ul>
                    </footer>
                </div>
            </motion.article>
        </div>
    );
};
