import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Sparkles, Target, ArrowRight, EyeOff, Layout, ListChecks, HelpCircle } from 'lucide-react';
import { AggregateRating } from '../../components/articles/AggregateRating';
import { Helmet } from 'react-helmet-async';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const BeginnersGuideArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center bg-background text-text-muted">
            <Helmet>
                <title>How to Learn Touch Typing: The Definitive 2026 Beginner's Guide</title>
                <meta name="description" content="Master touch typing from scratch. Learn the home row, finger zones, and the 'No-Sight' rule to double your typing speed in 30 days. Perfect for beginners." />
                <link rel="canonical" href="https://touchflowpro.com/articles/how-to-learn-touch-typing" />
                
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "HowTo",
                                "name": "How to Learn Touch Typing",
                                "description": "A step-by-step guide to mastering the keyboard without looking at your hands.",
                                "step": [
                                    { "@type": "HowToStep", "text": "Position your fingers on the Home Row (A,S,D,F and J,K,L,;)." },
                                    { "@type": "HowToStep", "text": "Assign each finger a specific set of vertical keys (Finger Zones)." },
                                    { "@type": "HowToStep", "text": "Practice without looking at the keyboard ('The No-Sight Rule')." },
                                    { "@type": "HowToStep", "text": "Prioritize accuracy over speed until muscle memory is established." }
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
                    How to Learn <br/> <span className="text-primary italic">Touch Typing.</span>
                </h1>

                <Card className="p-8 border-primary/20 bg-primary/5 mb-12">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <ListChecks className="text-primary" /> Beginner's Survival Kit
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm italic">
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>The Home Row is your permanent base of operations.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Rule #1: Never look down. Use a cloth if you have to.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Daily Sprints: 15 minutes of guided practice beats 3 hours of gaming.</span>
                        </li>
                        <li className="flex gap-2">
                            <ArrowRight size={16} className="text-primary shrink-0" />
                            <span>Accuracy &gt; WPM: Speed is a byproduct of precise muscle memory.</span>
                        </li>
                    </ul>
                </Card>

                <div className="prose prose-invert prose-lg max-w-none space-y-12 text-text-muted leading-relaxed">
                    <section>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-6 text-center md:text-left">What is Touch Typing? (The Definition)</h2>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 border-l-4 border-l-primary">
                            <p className="text-xl text-text-main font-medium leading-relaxed mb-0 italic">
                                Touch typing is the ability to type on a keyboard without looking at the keys, relying entirely on muscle memory and tactile feedback. By assigning specific "finger zones" to each of your ten fingers, you eliminate the mental load of searching for keys, allowing for speeds of 80-120+ WPM with near-perfect accuracy.
                            </p>
                        </div>
                    </section>

                    <nav className="bg-white/5 p-8 rounded-3xl border border-white/10 my-12">
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Mastery Roadmap</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm italic">
                            <li><a href="#homerow" className="hover:text-primary transition-colors">• Phase 1: The Home Row Foundation</a></li>
                            <li><a href="#zones" className="hover:text-primary transition-colors">• Phase 2: Mapping Your Finger Zones</a></li>
                            <li><a href="#posture" className="hover:text-primary transition-colors">• Phase 3: Ergonomics & Biomechanics</a></li>
                            <li><a href="#strategy" className="hover:text-primary transition-colors">• Phase 4: Training Strategy for Speed</a></li>
                            <li><a href="#faq" className="hover:text-primary transition-colors">• Frequently Asked Questions</a></li>
                        </ul>
                    </nav>

                    <section id="homerow">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">Phase 1: The Home Row Foundation</h2>
                        <p>
                            Every keyboard has two small tactile bumps on the F and J keys. These are your "home" sensors. Your left index finger rests on F, and your right index finger rests on J. From here, your fingers naturally fall onto the A, S, D, F and J, K, L, ; keys.
                        </p>
                        <Card className="p-6 bg-white/5 border border-white/10 my-8">
                            <h4 className="text-primary font-black uppercase text-[10px] tracking-widest mb-2">The Golden Rule</h4>
                            <p className="text-sm italic mb-0">Your fingers must always return to the home row after hitting a key in the upper or lower rows. This is the only way to establish "Spatio-Tactile Neutrality."</p>
                        </Card>
                    </section>

                    <section id="zones">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-6">Phase 2: Mapping Your Finger Zones</h2>
                        <p>
                            Most beginners fail because they use the wrong finger for the right key. Each finger is responsible for a vertical column:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 text-sm">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h5 className="font-bold text-white mb-2">Left Hand</h5>
                                <ul className="space-y-1 opacity-80">
                                    <li>Pinky: Q, A, Z</li>
                                    <li>Ring: W, S, X</li>
                                    <li>Middle: E, D, C</li>
                                    <li>Index: R, T, F, G, V, B</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h5 className="font-bold text-white mb-2">Right Hand</h5>
                                <ul className="space-y-1 opacity-80">
                                    <li>Index: Y, U, H, J, N, M</li>
                                    <li>Middle: I, K, ,</li>
                                    <li>Ring: O, L, .</li>
                                    <li>Pinky: P, ;, /, Shift, Enter</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section id="posture" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                        {[
                            { title: "Elbow Angle", icon: <Layout />, desc: "Maintain a 90-degree angle to prevent shoulder strain." },
                            { title: "Wrist Position", icon: <Target />, desc: "Keep wrists elevated and straight; never rest them on the desk." },
                            { title: "No-Sight Rule", icon: <EyeOff />, desc: "Cover your hands if you find yourself peeking at the keys." }
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                                <div className="text-primary flex justify-center mb-4">{item.icon}</div>
                                <h4 className="text-white font-black uppercase text-xs mb-2">{item.title}</h4>
                                <p className="text-[10px] opacity-60 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section id="strategy">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8">Phase 4: Training Strategy for Speed</h2>
                        <p>
                            If you focus on speed at the start, you will hit a plateau at 40 WPM that is nearly impossible to break. Follow this Accuracy-First Protocol:
                        </p>
                        <div className="space-y-8">
                            {[
                                { step: 1, title: "The 100% Rule", desc: "Do not move to the next lesson until you can type the current paragraph with zero errors." },
                                { step: 2, title: "Rhythmic Stability", desc: "Listen to the sound of your keys. They should be rhythmic and even, like a metronome." },
                                { step: 3, title: "The 'Burst-to-Drift' Shift", desc: "Once accuracy is 98%, start pushing for 'Bursts' on short words while maintaining 'Drift' on long ones." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 border-l-2 border-primary/20 pl-6">
                                    <span className="text-4xl font-black text-white/10">0{item.step}</span>
                                    <div>
                                        <h4 className="text-white font-bold mb-1 tracking-tight">{item.title}</h4>
                                        <p className="text-sm opacity-60">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Card className="my-16 overflow-hidden border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/10 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Learning Stage</th>
                                    <th className="px-6 py-4">Typical WPM</th>
                                    <th className="px-6 py-4 text-right">Key Focus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                <tr>
                                    <td className="px-6 py-4 font-bold">Absolute Beginner</td>
                                    <td className="px-6 py-4 italic">5 - 15 WPM</td>
                                    <td className="px-6 py-4 text-right opacity-50">Home Row Placement</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold text-primary">Intermediate</td>
                                    <td className="px-6 py-4 text-primary font-black">30 - 50 WPM</td>
                                    <td className="px-6 py-4 text-right text-primary">Spatial Memory</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold text-white">Professional</td>
                                    <td className="px-6 py-4 text-white font-black">70 - 100+ WPM</td>
                                    <td className="px-6 py-4 text-right text-white">Rhythmic Latency</td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>

                    <section id="faq">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-2">
                           <HelpCircle className="text-primary" /> FAQ
                        </h2>
                        <div className="space-y-6 text-sm">
                            {[
                                { q: "How long does it take to learn touch typing?", a: "With 20 minutes of daily practice, most beginners reach 'Cognitive Neutrality' (no searching for keys) in 3 weeks and 50 WPM in 8 weeks." },
                                { q: "Can I learn at age 40 or 50?", a: "Yes. Muscle memory (neuroplasticity) remains highly active for motor tasks regardless of age. Adult learners often have better discipline, which leads to faster gains." },
                                { q: "Do I need a mechanical keyboard?", a: "While not required, mechanical keyboards provide tactile feedback that helps your brain confirm key actuation faster, which speeds up early muscle memory building." },
                                { q: "Should I use Dvorak or QWERTY?", a: "Stick with QWERTY. While Dvorak is slightly more efficient, the accessibility of QWERTY across all devices makes it the superior choice for 99% of people." }
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
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
                        <Sparkles className="text-black/20 absolute -top-10 -left-10" size={200} />
                        <h2 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter mb-6 leading-tight">Start Your <br/> Journey Right.</h2>
                        <p className="text-black/80 font-medium mb-10 max-w-lg mx-auto">
                            Don't waste months on games. Join the TouchFlow Pro Beginner Track and build the neural pathways for elite typing speed from day one.
                        </p>
                        <Link 
                            to="/login"
                            className="bg-black text-primary px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:translate-x-4 transition-all inline-flex items-center justify-center gap-3"
                        >
                            Begin Training <ArrowRight size={18} />
                        </Link>
                    </section>

                    <div className="mt-16">
                        <AggregateRating rating={4.9} count={2831} />
                    </div>

                    <footer className="pt-12 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-40">
                        <h3 className="font-bold mb-4">Meta Data & Sources:</h3>
                        <ul className="space-y-1">
                            <li>• Primary Keyword: how to learn touch typing</li>
                            <li>• Expert Review: TouchFlow Instructional Design Team</li>
                            <li>• Related: <Link to="/articles/typing-speed-averages" className="hover:underline text-primary">Average Typing Speed Data</Link></li>
                        </ul>
                    </footer>
                </div>
            </motion.article>
        </div>
    );
};
