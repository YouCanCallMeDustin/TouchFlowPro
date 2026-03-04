import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ArrowRight, BarChart3, Brain, Activity } from 'lucide-react';
import type { Stage } from '../../App';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const TypingPlateauArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">
            <Helmet>
                <title>Overcoming the Typing Speed Plateau — TouchFlow Pro</title>
                <meta name="description" content="Stuck at 60 or 80 WPM? Learn the science behind typing speed plateaus, why motor learning stalls, and how to break through to 100+ WPM." />
            </Helmet>

            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Performance Guide</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.9]">
                        Overcoming the <span className="text-primary border-b-4 border-primary/30 pb-1">Typing Plateau.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        The science of motor learning stagnation and how to escape the 60 WPM trap.
                    </p>
                </div>

                {/* Content Body */}
                <div className="prose prose-invert prose-lg max-w-none mb-16 space-y-8 text-text-muted leading-relaxed">
                    <p className="text-xl text-text-main font-medium">
                        Almost every touch-typist hits a wall. For many, it's 60 words per minute. For others, it's 80 or 90 WPM. You type every single day for work, sending thousands of messages and writing hundreds of documents, yet your speed hasn't meaningfully increased in years. Why?
                    </p>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">The OK Plateau in Motor Learning</h2>
                    <p>
                        In cognitive science, this phenomenon is called the <strong>"OK Plateau."</strong> Proposed by psychologists studying skill acquisition, the OK Plateau occurs when a skill becomes automated. When you first learned to type, you were in the <em>cognitive phase</em>—you had to actively think about where the "T" or the "P" keys were located.
                    </p>
                    <p>
                        Eventually, you entered the <em>autonomous phase</em>. Your brain offloaded the conscious effort of typing to procedural memory. This is great for your mental bandwidth—you can now think about <em>what</em> to write rather than <em>how</em> to type it. However, it's terrible for skill improvement. Without conscious, deliberate effort, your brain has no reason to optimize your neural pathways any further. You are "good enough," so your speed flatlines.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 not-prose">
                        <Card className="p-6 bg-white/5 border-white/10">
                            <Brain className="text-primary mb-4" size={24} />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Cognitive Phase</h3>
                            <p className="text-xs opacity-60">High mental effort, frequent errors, slow execution while learning mapping.</p>
                        </Card>
                        <Card className="p-6 bg-white/5 border-white/10">
                            <Activity className="text-secondary mb-4" size={24} />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Associative Phase</h3>
                            <p className="text-xs opacity-60">Fewer errors, mapping speeds up, establishing initial muscle memory.</p>
                        </Card>
                        <Card className="p-6 border-primary/30 bg-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-2xl rounded-full" />
                            <BarChart3 className="text-primary mb-4" size={24} />
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-2">The OK Plateau</h3>
                            <p className="text-xs text-text-main opacity-80">Skill becomes subconscious. Progression stops entirely without deliberate shocks.</p>
                        </Card>
                    </div>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">Breaking the Plateau: Deliberate Practice</h2>
                    <p>
                        To break through a typing plateau, you must force yourself back into the cognitive phase. This process requires <strong>Deliberate Practice</strong>. Passive typing (like regular work or mindlessly taking standard typing tests) will not work because your brain defaults to its automated, suboptimal rhythms.
                    </p>

                    <ul className="list-disc pl-6 space-y-4">
                        <li>
                            <strong className="text-white">Targeted Weakness Isolation:</strong> You must identify the specific letters, bigrams (two-letter combinations), or rhythmic transitions that slow you down. A generic test won't fix your specific hesitation on the "P-R" combination.
                        </li>
                        <li>
                            <strong className="text-white">Variable Speed Training:</strong> Forcing yourself to type 10% faster than your baseline (sacrificing accuracy temporarily) forces your nervous system to adapt to higher cadences. Alternatively, typing with 100% strict accuracy at a slower pace rewires bad muscle memory.
                        </li>
                        <li>
                            <strong className="text-white">Fatigue and Focus:</strong> Motor learning requires intense focus. Training past the point of mental fatigue actually solidifies bad habits. 15 minutes of highly focused, analytic practice is vastly superior to an hour of mindless typing.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight">The TouchFlow Engine Advantage</h2>
                    <p>
                        This is exactly why we built TouchFlow Pro. Standard typing sites give you random words and a WPM score. They are measuring tapes, not coaches. TouchFlow Pro uses dynamic analytics to identify your sub-conscious bottlenecks—measuring the milliseconds between specific keystrokes to detect exactly where your muscle memory hesitates.
                    </p>
                    <p>
                        By automatically generating custom drills targeting your specific weak points, we force you out of the OK Plateau and back into active growth.
                    </p>
                </div>

                {/* Call To Action */}
                <Card className="p-10 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent text-center">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Ready to break your plateau?</h3>
                    <p className="text-text-muted mb-8 max-w-xl mx-auto">
                        Take a comprehensive baseline assessment. We'll identify your weak keys, measure your rhythmic stability, and build a custom curriculum to push you past your current limit.
                    </p>
                    <Link
                        to="/free-typing-test"
                        className="inline-flex items-center justify-center px-10 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] bg-[var(--primary)] text-white hover:opacity-90 shadow-2xl shadow-primary/30 group"
                    >
                        Start Free Baseline Test
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Card>
            </motion.article>
        </div>
    );
};
