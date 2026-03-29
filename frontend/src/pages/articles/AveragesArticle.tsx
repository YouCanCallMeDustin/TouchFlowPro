import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { BarChart3, ArrowRight } from 'lucide-react';
import { TypingSpeedTable } from '../../components/articles/TypingSpeedTable';
import { WPMCalculator } from '../../components/articles/WPMCalculator';
import { AggregateRating } from '../../components/articles/AggregateRating';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const AveragesArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">
            <Helmet>
                <title>What Is a Good Typing Speed? Average WPM by Profession & Skill Level | TouchFlowPro</title>
                <meta name="description" content="Discover what counts as a good typing speed for your profession. Average WPM benchmarks for writers, programmers, data entry, legal, and medical transcription roles." />
                <link rel="canonical" href="https://touchflowpro.com/articles/typing-speed-averages" />
                <meta property="og:title" content="What Is a Good Typing Speed? Average WPM by Profession & Skill Level | TouchFlowPro" />
                <meta property="og:description" content="Discover what counts as a good typing speed for your profession. Average WPM benchmarks for writers, programmers, data entry, legal, and medical transcription roles." />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://touchflowpro.com/articles/typing-speed-averages" />
                <meta property="og:image" content="https://touchflowpro.com/assets/og-averages.png" />
                <meta property="og:site_name" content="TouchFlowPro" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="What Is a Good Typing Speed? Average WPM by Profession & Skill Level | TouchFlowPro" />
                <meta name="twitter:description" content="Discover what counts as a good typing speed for your profession. Average WPM benchmarks for writers, programmers, data entry, legal, and medical transcription roles." />
                {/* Structured Data */}
            
                <script type="application/ld+json">
                    {JSON.stringify({
                              "@context": "https://schema.org",
                              "@type": "Article",
                              "headline": "What Is a Good Typing Speed? Average WPM by Profession & Skill Level",
                              "description": "Discover what counts as a good typing speed for your profession. Average WPM benchmarks for writers, programmers, data entry, legal, and medical transcription roles.",
                              "image": "https://touchflowpro.com/assets/og-averages.png",
                              "author": {
                                        "@type": "Organization",
                                        "name": "TouchFlow Pro",
                                        "url": "https://touchflowpro.com"
                              },
                              "publisher": {
                                        "@type": "Organization",
                                        "name": "TouchFlow Pro",
                                        "logo": {
                                                  "@type": "ImageObject",
                                                  "url": "https://touchflowpro.com/logo.png"
                                        }
                              },
                              "datePublished": "2024-01-01T08:00:00+08:00",
                              "dateModified": "2026-03-29T00:54:45.352Z"
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                              "@context": "https://schema.org",
                              "@type": "BreadcrumbList",
                              "itemListElement": [
                                        {
                                                  "@type": "ListItem",
                                                  "position": 1,
                                                  "name": "Home",
                                                  "item": "https://touchflowpro.com"
                                        },
                                        {
                                                  "@type": "ListItem",
                                                  "position": 2,
                                                  "name": "Articles",
                                                  "item": "https://touchflowpro.com/articles"
                                        },
                                        {
                                                  "@type": "ListItem",
                                                  "position": 3,
                                                  "name": "What Is a Good Typing Speed? Average WPM by Profession & Skill Level",
                                                  "item": "https://touchflowpro.com/articles/typing-speed-averages"
                                        }
                              ]
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    {
                                        "@type": "ListItem",
                                        "position": 1,
                                        "name": "Home",
                                        "item": "https://touchflowpro.com"
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": "Articles",
                                        "item": "https://touchflowpro.com/articles/typing-speed-averages"
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 3,
                                        "name": "Average Typing Speed"
                                    }
                                ]
                            },
                            {
                                "@type": "BlogPosting",
                                "headline": "Average Typing Speed: 2026 Benchmarks",
                                "description": "A comprehensive guide to typing speed averages, covering demographics and professional standards for 2026.",
                                "author": {
                                    "@type": "Organization",
                                    "name": "TouchFlow Pro"
                                },
                                "isAccessibleForFree": "True",
                                "aggregateRating": {
                                    "@type": "AggregateRating",
                                    "ratingValue": "4.8",
                                    "reviewCount": "156"
                                },
                                "mainEntityOfPage": {
                                    "@type": "WebPage",
                                    "@id": "https://touchflowpro.com/articles/typing-speed-averages"
                                }
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "What is a good typing speed?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "A good typing speed for most people is between 40 and 60 WPM (Words Per Minute). For professionals like software developers or executive assistants, 70-90 WPM is considered exceptional."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Is 60 WPM good?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Yes, 60 WPM is considered a very good typing speed. It is significantly above the global average of 40 WPM and is generally the benchmark required for high-productivity office roles."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "What is the average typing speed officially?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "The global average typing speed is approximately 40 WPM. However, this varies by age, with younger individuals typically reaching 45-50 WPM, while the general workforce sits closer to 35-40 WPM."
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
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">2026 Statistical Analysis</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.9]">
                        What is the <span className="text-blue-500 border-b-4 border-blue-500/30 pb-1">Average Typing Speed</span>?
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        Global Benchmarks, Professional Standards, and Percentiles.
                    </p>
                </div>

                {/* Quick Answer Box (Featured Snippet Optimization) */}
                <div className="relative group mb-16 px-1">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-premium backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={160} />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-1 bg-blue-500 rounded-full" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Quick Answer</h2>
                        </div>
                        
                        <p className="text-2xl md:text-4xl font-black text-white leading-[1.1] italic uppercase tracking-tighter mb-8 max-w-3xl">
                            The average typing speed is <span className="text-blue-400">40 WPM</span>. A "Good" speed is <span className="text-blue-400">60+ WPM</span>, while elite professional performance sits at <span className="text-blue-400">100+ WPM</span>.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Global Avg: 40 WPM</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Pro Avg: 65 WPM</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Elite: 100+ WPM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive WPM Calculator */}
                <WPMCalculator />

                {/* Content Body */}
                <div className="prose prose-invert prose-lg max-w-none mb-16 space-y-8 text-text-muted leading-relaxed">
                    <p className="text-xl text-text-main font-medium">
                        The average typing speed for most people is roughly <strong>40 words per minute (WPM)</strong>. For professional typists, the average jumps significantly to 65-75 WPM. But "average" depends heavily on context—your age, your job, and the type of keyboard you use all play a role.
                    </p>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">Global Typing Averages</h2>
                    <TypingSpeedTable />
                    
                    <p className="mt-8">
                        As shown in the table above, typing speed is a multi-tiered skill. Most casual users peak at the "Average" level, while technical professions require "Professional" or "High Performance" speeds to maintain workplace efficiency.
                    </p>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">Typing Speed by Age</h2>
                    <p>
                        Surprisingly, younger generations aren't always the fastest. While they are faster on mobile devices, traditional touch-typing speed peaks in the early 20s.
                    </p>
                    <div className="bg-white/5 rounded-2xl p-8 my-8 border border-white/10">
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="font-bold">Under 18</span>
                                <span className="text-blue-500 font-black">37 WPM</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="font-bold">18 - 24</span>
                                <span className="text-blue-500 font-black">44 WPM</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="font-bold">25 - 45</span>
                                <span className="text-blue-500 font-black">42 WPM</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="font-bold">45+</span>
                                <span className="text-blue-400 font-black">36 WPM</span>
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">Professional Standards</h2>
                    <p>
                        Certain professions require much higher than "average" typing skills. If you are pursuing a career in these fields, 40 WPM will not be enough.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <h4 className="text-white font-bold mb-1">Data Entry</h4>
                            <p className="text-blue-500 font-black mb-2">60+ WPM</p>
                            <p className="text-xs opacity-60">Standard entry-level requirement for high-volume data processing.</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <h4 className="text-white font-bold mb-1">Legal/Medical Transcription</h4>
                            <p className="text-blue-500 font-black mb-2">75+ WPM</p>
                            <p className="text-xs opacity-60">Requires high accuracy and familiarity with specialized vocabulary.</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <h4 className="text-white font-bold mb-1">Programmers</h4>
                            <p className="text-blue-500 font-black mb-2">50 - 90 WPM</p>
                            <p className="text-xs opacity-60">Variation is high, but faster typing reduces cognitive load during coding.</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <h4 className="text-white font-bold mb-1">Court Reporters</h4>
                            <p className="text-blue-500 font-black mb-2">225+ WPM</p>
                            <p className="text-xs opacity-60">(Requires specialized steno machines, not QWERTY keyboards).</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">What counts as "Good"?</h2>
                    <p>
                        "Good" is relative. At <strong>60 WPM</strong>, you are faster than 80% of the population. At <strong>80 WPM</strong>, you are in the top 5% of all typists. If you can reach <strong>100 WPM</strong>, you are in the elite 1%—typing at the speed of thought.
                    </p>
                </div>

                {/* Call To Action */}
                <Card className="p-10 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent text-center">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">How do you compare?</h3>
                    <p className="text-text-muted mb-8 max-w-xl mx-auto">
                        Don't guess your speed. Get a professional-grade telemetry report. We'll show you exactly how your speed, accuracy, and rhythmic stability compare to global averages.
                    </p>
                    <Link
                        to="/free-typing-test"
                        className="inline-flex items-center justify-center px-10 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] bg-primary text-white hover:opacity-90 shadow-2xl shadow-primary/30 group"
                    >
                        Check my WPM Score
                        <BarChart3 size={16} className="ml-2 group-hover:scale-110 transition-transform" />
                    </Link>
                </Card>

                <section className="bg-primary/5 border border-primary/10 rounded-3xl p-10 mt-16 mb-8 text-center">
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Want the complete system?</h4>
                    <p className="text-sm opacity-60 mb-6">Read our high-authority pillar resource for the full roadmap to elite speeds.</p>
                    <Link to="/articles/ultimate-guide-to-typing-speed" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] inline-flex items-center gap-2 hover:gap-4 transition-all">
                        Ultimate Guide to 100+ WPM <ArrowRight size={14} />
                    </Link>
                </section>

                <AggregateRating rating={4.7} count={42} />
            </motion.article>
        </div>
    );
};
