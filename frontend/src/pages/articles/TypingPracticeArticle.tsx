import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ArrowRight } from 'lucide-react';
import { AggregateRating } from '../../components/articles/AggregateRating';
import { Helmet } from 'react-helmet-async';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const TypingPracticeArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">
            <Helmet>
                <title>Typing Practice Drills: Improve Speed & Accuracy | TouchFlowPro</title>
                <meta name="description" content="Improve your typing speed with structured daily practice lessons. Discover advanced exercises designed for professional typists. Start practicing today." />
                <link rel="canonical" href="https://touchflowpro.com/articles/typing-practice" />
                <meta property="og:title" content="Typing Practice Drills: Improve Speed & Accuracy | TouchFlowPro" />
                <meta property="og:description" content="Improve your typing speed with structured daily practice lessons. Discover advanced exercises designed for professional typists. Start practicing today." />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://touchflowpro.com/articles/typing-practice" />
                <meta property="og:image" content="https://touchflowpro.com/assets/og-practice.png" />
                <meta property="og:site_name" content="TouchFlowPro" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Typing Practice Drills: Improve Speed & Accuracy | TouchFlowPro" />
                <meta name="twitter:description" content="Improve your typing speed with structured daily practice lessons. Discover advanced exercises designed for professional typists. Start practicing today." />
            
                <script type="application/ld+json">
                    {JSON.stringify({
                              "@context": "https://schema.org",
                              "@type": "Article",
                              "headline": "Typing Practice Drills: Improve Speed & Accuracy",
                              "description": "Improve your typing speed with structured daily practice lessons. Discover advanced exercises designed for professional typists. Start practicing today.",
                              "image": "https://touchflowpro.com/assets/og-practice.png",
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
                              "dateModified": "2026-03-29T00:54:45.393Z"
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
                                                  "name": "Typing Practice Drills: Improve Speed & Accuracy",
                                                  "item": "https://touchflowpro.com/articles/typing-practice"
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
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-7xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.9]">
                        Typing <span className="text-primary italic">Practice.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        Daily exercises and targeted drills.
                    </p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none mb-16 space-y-8 text-text-muted leading-relaxed">
                    <p className="text-xl text-text-main font-medium">
                        Consistency is the key to progress. Effective <strong>typing practice</strong> requires more than just typing random words; it requires <strong>exercises</strong> that target your neural blind spots.
                    </p>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight italic">Effective Typing Exercises</h2>
                    <p>
                        To see real growth, you must engage in <strong>drills</strong> that isolate specific finger movements. These <strong>exercises</strong> should focus on high-frequency bigrams and tricky combinations.
                    </p>

                    <Card className="p-8 bg-white/5 border-white/10 my-8">
                        <ul className="space-y-4 mb-0">
                            <li><strong>N-Gram Drills:</strong> Practice "th", "er", "on", and "an" until they are subconscious.</li>
                            <li><strong>Accuracy Exercises:</strong> Slow down to 20 WPM to ensure 100% precision.</li>
                            <li><strong>Speed Bursts:</strong> Short 15-second <strong>drills</strong> to push your raw cadence.</li>
                        </ul>
                    </Card>

                    <p>
                        Incorporating these <strong>drills</strong> into your daily <strong>typing practice</strong> is the fastest way to build permanent muscle memory.
                    </p>
                </div>

                <AggregateRating rating={4.8} count={184} />
                
                <section className="bg-primary/5 border border-primary/10 rounded-3xl p-10 mt-16 mb-8 text-center">
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Launch Drills</h4>
                    <Link to="/free-typing-test" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] inline-flex items-center gap-2">
                        Start Custom Drills <ArrowRight size={14} />
                    </Link>
                </section>
            </motion.article>
        </div>
    );
};
