import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ArrowRight, Zap, Target, Rocket, CheckCircle2 } from 'lucide-react';
import { AggregateRating } from '../../components/articles/AggregateRating';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const SixtyToHundredArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">
            <Helmet>
                <title>60 to 100 WPM: The Elite Typing Roadmap</title>
                <meta name="description" content="A 3-phase technical roadmap to go from 60 WPM to 100+ WPM. Learn the advanced bigram chunking and rhythmic stability techniques used by elite typists." />
                <link rel="canonical" href="https://touchflowpro.com/articles/60-wpm-to-100-wpm" />
                <meta property="og:title" content="60 to 100 WPM: The Elite Typing Roadmap" />
                <meta property="og:description" content="A 3-phase technical roadmap to go from 60 WPM to 100+ WPM. Learn the elite techniques for speed." />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://touchflowpro.com/articles/60-wpm-to-100-wpm" />
                <meta property="og:image" content="https://touchflowpro.com/assets/og-60-to-100.png" />
                <meta property="og:site_name" content="TouchFlowPro" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="60 to 100 WPM: The Elite Typing Roadmap" />
                <meta name="twitter:description" content="A 3-phase technical roadmap to go from 60 WPM to 100+ WPM." />

                <script type="application/ld+json">
                    {JSON.stringify({
                               "@context": "https://schema.org",
                               "@type": "Article",
                               "headline": "60 to 100 WPM: The Elite Typing Roadmap",
                               "description": "A 3-phase technical roadmap to go from 60 WPM to 100+ WPM.",
                               "image": "https://touchflowpro.com/assets/og-60-to-100.png",
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
                               "dateModified": "2026-04-03T00:00:00.000Z"
                    })}
                </script>
            </Helmet>

            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                {/* Mastering Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-8xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.85]">
                        60 To 100 <br/> <span className="text-primary italic">The Roadmap.</span>
                    </h1>
                    <p className="text-text-muted text-xl max-w-3xl mx-auto font-bold uppercase tracking-[0.2em] opacity-80 leading-relaxed">
                        A 3-phase technical transformation from competent to world-class performance.
                    </p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none mb-16 space-y-12 text-text-muted leading-relaxed">
                    <section>
                        <p className="text-2xl text-text-main font-black leading-tight mb-8">
                            Reaching <span className="text-primary italic">100 WPM</span> isn't about typing faster; it's about <span className="text-white">thinking in chunks.</span>
                        </p>
                        <p>
                            Most typists plateau at 60 WPM because they still process individual characters. Elite typists (100+ WPM) process entire words and common "n-grams" as single motor units. This transition requires a fundamental shift in how your brain interacts with the keyboard.
                        </p>
                    </section>

                    {/* The 3-Phase Roadmap */}
                    <div className="space-y-6 not-prose">
                        <Card className="p-8 border-white/5 bg-bg-surface/50 relative overflow-hidden group">
                           <div className="flex gap-6 items-start">
                               <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                   <Zap className="text-primary" size={24} />
                               </div>
                               <div>
                                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Phase 1: Rhythmic Stability (60-80 WPM)</h3>
                                   <p className="text-sm opacity-70 leading-relaxed mb-4">
                                       Stop rushing. The biggest bottleneck at 60 WPM is "bursting"—typing fast on easy words and pausing on hard ones. True speed comes from a perfectly consistent metronome-like rhythm.
                                   </p>
                                   <div className="flex gap-2">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded">Stability First</span>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded">Zero Hesitation</span>
                                   </div>
                               </div>
                           </div>
                        </Card>

                        <Card className="p-8 border-white/5 bg-bg-surface/50 relative overflow-hidden group">
                           <div className="flex gap-6 items-start">
                               <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                   <Target className="text-primary" size={24} />
                               </div>
                               <div>
                                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Phase 2: N-Gram Chunking (80-95 WPM)</h3>
                                   <p className="text-sm opacity-70 leading-relaxed mb-4">
                                       At 80 WPM, you must stop typing "T-H-E" and start firing the "THE" motor sequence as a single command. We call this "Chunking." Your brain must treat common bigrams (th, er, on, an) as single physical gestures.
                                   </p>
                                   <div className="flex gap-2">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded">Motor Units</span>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded">Bigram Focus</span>
                                   </div>
                               </div>
                           </div>
                        </Card>

                        <Card className="p-8 border-white/5 bg-bg-surface/50 relative overflow-hidden group">
                           <div className="flex gap-6 items-start">
                               <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                   <Rocket className="text-primary" size={24} />
                               </div>
                               <div>
                                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Phase 3: The Flow State (100+ WPM)</h3>
                                   <p className="text-sm opacity-70 leading-relaxed mb-4">
                                       Elite performance is about visual lookahead. By the time you type word A, your eyes must already be processing word C. This decouples the visual input from the mechanical output, creating a seamless "Flow State."
                                   </p>
                                   <div className="flex gap-2">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded">Lookahead</span>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded">Elite Mastery</span>
                                   </div>
                               </div>
                           </div>
                        </Card>
                    </div>

                    <section className="space-y-6">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Technical Prerequisites</h2>
                        <ul className="space-y-4 list-none p-0">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="text-primary" size={20} />
                                <span>**Strict Touch Typing**: 100 WPM is impossible with "hybrid" or "hunt and peck" styles.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="text-primary" size={20} />
                                <span>**Mechanical Switches**: Linear or tactile switches provide the millisecond clarity required for high cadences.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="text-primary" size={20} />
                                <span>**Visual Lookahead**: Train your eyes to stay 2-3 words ahead of your hands.</span>
                            </li>
                        </ul>
                    </section>

                    <Card className="p-10 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 text-center">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">The "Mastery" Checklist</h3>
                        <p className="text-white/80 font-medium mb-8">
                            Are you checking all the boxes for elite performance? Most typists miss the "Rhythmic Stability" layer.
                        </p>
                        <div className="flex justify-center">
                           <Link to="/login" className="bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-full hover:scale-105 transition-transform flex items-center gap-3">
                               Review My Checklist <ArrowRight size={20} />
                           </Link>
                        </div>
                    </Card>

                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 my-16 text-center">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6">Escape the "Average" Tier</h3>
                        <p className="text-text-muted mb-8 max-w-xl mx-auto">
                            The difference between 60 WPM and 100 WPM is exactly **one million keystrokes** of deliberate practice. Our system tracks every single one of them.
                        </p>
                        <Link to="/articles/typing-speed-plateau" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] inline-flex items-center gap-2 hover:gap-4 transition-all">
                            Breaking the OK Plateau <ArrowRight size={14} />
                        </Link>
                    </section>
                </div>

                <div className="mb-16">
                   <AggregateRating rating={4.8} count={412} />
                </div>
                
                <section className="bg-primary border border-primary/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
                    <div className="relative z-10">
                        <h4 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-tight">Join The <br/> Elite 1%.</h4>
                        <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto font-medium">
                            Our telemetry-driven roadmap is the only path to guaranteed 100+ WPM professional speeds.
                        </p>
                        <Link to="/free-typing-test" className="bg-white text-primary font-black uppercase tracking-widest px-10 py-5 rounded-full hover:scale-105 transition-transform inline-flex items-center gap-3">
                            Check Your WPM Now <ArrowRight size={20} />
                        </Link>
                    </div>
                </section>
            </motion.article>
        </div>
    );
};
