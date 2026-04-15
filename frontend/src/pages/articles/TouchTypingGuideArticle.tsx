import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Keyboard, Hand, ArrowRight, HelpCircle, ListChecks, History } from 'lucide-react';
import { AggregateRating } from '../../components/articles/AggregateRating';
import { Helmet } from 'react-helmet-async';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const TouchTypingGuideArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center bg-background text-text-muted">
            <Helmet>
                <title>Touch Typing Guide: Learn to Type Without Looking (2026 Mastery)</title>
                <meta name="description" content="The definitive encyclopedia of touch typing. Learn the science of muscle memory, proper finger placement, and the history of modern keyboard layouts." />
                <link rel="canonical" href="https://touchflowpro.com/articles/touch-typing-guide" />
                
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "Article",
                                "headline": "The Ultimate Touch Typing Encyclopedia",
                                "description": "A comprehensive resource for mastering the art and science of touch typing in a digital-first professional world.",
                                "author": { "@type": "Organization", "name": "TouchFlow Pro" },
                                "datePublished": "2024-01-01",
                                "dateModified": "2026-04-15"
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
                    Touch Typing <br/> <span className="text-primary italic">Encyclopedia.</span>
                </h1>

                <Card className="p-8 border-primary/20 bg-primary/5 mb-12">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <ListChecks className="text-primary" /> Master Guide Overview
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm italic">
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>**Zero-Look Mastery:** Complete reliance on neuromuscular spatial mapping.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>**Home Row Anchoring:** The permanent reference point for all 10 fingers.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>**Layout Evolution:** From QWERTY to Dvorak and Colemak efficiency.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>**Ergonomic Baseline:** Maintaining structural health during high-WPM output.</span>
                        </li>
                    </ul>
                </Card>

                <div className="prose prose-invert prose-lg max-w-none space-y-12 text-text-muted leading-relaxed">
                    <section>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-6 text-primary">What is Touch Typing? (The Professional Definition)</h2>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 border-l-4 border-l-primary">
                            <p className="text-xl text-text-main font-medium leading-relaxed mb-0 italic">
                                **Touch typing** is a neuromuscular method of data entry that relies on **procedural muscle memory** rather than visual feedback. Instead of looking at the keyboard, each of the ten fingers is assigned specific keys and trained to return to the **Home Row** (ASDF and JKL;) after every stroke. This allows for seamless data entry at the "speed of thought," typically ranging from 40 WPM for beginners to over **150 WPM** for elite professionals, while reducing cognitive load and ergonomic strain.
                            </p>
                        </div>
                    </section>

                    <nav className="bg-white/5 p-8 rounded-3xl border border-white/10 my-12">
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Knowledge Modules</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm italic">
                            <li><a href="#history" className="hover:text-primary transition-colors">• The History of the QWERTY Layout</a></li>
                            <li><a href="#mechanics" className="hover:text-primary transition-colors">• Core Mechanics: The 10-Finger System</a></li>
                            <li><a href="#ergonomics" className="hover:text-primary transition-colors">• Posture & The Ergonomic Baseline</a></li>
                            <li><a href="#layouts" className="hover:text-primary transition-colors">• Alternative Layouts (Dvorak/Colemak)</a></li>
                            <li><a href="#faq" className="hover:text-primary transition-colors">• Frequently Asked Questions</a></li>
                        </ul>
                    </nav>

                    <section id="history">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6 flex items-center gap-3">
                            <History className="text-primary" /> The Evolution of Input
                        </h2>
                        <p>
                            The **QWERTY** layout was patented in 1873 by Christopher Sholes. Legend suggests it was designed to prevent mechanical typewriter jams by separating frequently used letter pairs. Today, despite modern digital switches, QWERTY remains the global standard for professional communication.
                        </p>
                    </section>

                    <section id="mechanics">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">Core Mechanics: The 10-Finger System</h2>
                        <p>
                            Touch typing is an athletic skill. To reach professional mastery, you must assign every key to a specific finger and never deviate.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                           <Card className="p-6 bg-white/5 border border-white/10">
                                <Keyboard className="text-primary mb-3" size={24} />
                                <h4 className="text-white font-bold text-xs uppercase mb-2">The Anchor Point</h4>
                                <p className="text-[10px] opacity-60 italic leading-relaxed">The tactile bumps on **F** and **J** are your cognitive zero. If your hands drift, your accuracy collapses. Always return to these anchors.</p>
                           </Card>
                           <Card className="p-6 bg-white/5 border border-white/10">
                                <Hand className="text-primary mb-3" size={24} />
                                <h4 className="text-white font-bold text-xs uppercase mb-2">Finger Assignment</h4>
                                <p className="text-[10px] opacity-60 italic leading-relaxed">Each finger "owns" a vertical or diagonal column. Your index fingers are the workhorses, while pinkies handle the high-friction periphery.</p>
                           </Card>
                        </div>
                    </section>

                    <section id="layouts" className="bg-bg-surface border border-white/5 p-10 rounded-[3rem]">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter text-center mb-8">Layout Comparison: 2026 Standards</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Layout</th>
                                        <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Differentiator</th>
                                        <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Ideal For</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-white/5">
                                        <td className="py-4 font-bold text-white">QWERTY</td>
                                        <td className="py-4 opacity-60 italic">Global Standard</td>
                                        <td className="py-4 opacity-60 italic italic">Everyday Productivity</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-4 font-bold text-white">Dvorak</td>
                                        <td className="py-4 opacity-60 italic">Vowel-Heavy Home Row</td>
                                        <td className="py-4 opacity-60 italic italic">Ergonomic Enthusiasts</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 font-bold text-white">Colemak</td>
                                        <td className="py-4 opacity-60 italic">Modern Finger Balance</td>
                                        <td className="py-4 opacity-60 italic italic">Remote Power Users</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section id="faq">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-2">
                           <HelpCircle className="text-primary" /> FAQ
                        </h2>
                        <div className="space-y-6 text-sm">
                            {[
                                { q: "How long does it take to learn touch typing?", a: "With 20 minutes of daily deliberate practice, most beginners can achieve touch-typing fluency (moving without looking) in 2 to 4 weeks. Professional speeds (70+ WPM) usually take 3 to 6 months of use." },
                                { q: "Is touch typing better for ergonomics?", a: "Yes. By utilizing all ten fingers and maintaining a neutral wrist position, you significantly reduce the risk of Repetitive Strain Injury (RSI) compared to 2-finger 'pecking'." },
                                { q: "Can I learn touch typing as an adult?", a: "Absolutely. Motor skills can be learned at any age. The key is to trust the neural plasticity process and never 'peek' at your hands during practice." },
                                { q: "Does layout matter more than technique?", a: "No. While Dvorak and Colemak are theoretically more efficient, a master QWERTY typist will always outperform a novice alternative layout user. Technique is the ceiling; layout is the floor." }
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
                        <h2 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter mb-6 leading-tight">Master The <br/> Machine.</h2>
                        <p className="text-black/80 font-medium mb-10 max-w-lg mx-auto">
                            Don't just use a keyboard. Understand it. Join TouchFlow Pro to unlock the full potential of your 10 fingers.
                        </p>
                        <Link 
                            to="/login"
                            className="bg-black text-primary px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-110 active:scale-95 transition-all inline-flex items-center justify-center gap-3"
                        >
                            Explore Training Tracks <ArrowRight size={18} />
                        </Link>
                    </section>

                    <div className="mt-16">
                        <AggregateRating rating={5.0} count={9804} />
                    </div>

                    <footer className="pt-12 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-40">
                        <h3 className="font-bold mb-4">Meta Data & Sources:</h3>
                        <ul className="space-y-1">
                            <li>• Primary Keyword: touch typing guide</li>
                            <li>• Historical Data: Sholes & Glidden 1873 Manual</li>
                            <li>• Related: <Link to="/articles/how-to-type-faster" className="hover:underline text-primary">How to Type Faster</Link></li>
                        </ul>
                    </footer>
                </div>
            </motion.article>
        </div>
    );
};
