import { motion } from 'framer-motion';
import { ArrowLeft, Target, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface AboutPageProps {
    onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full px-4 flex flex-col items-center py-12">
            <Helmet>
                <title>About Us | TouchFlow Pro</title>
                <meta name="description" content="Learn about TouchFlow Pro's mission targeting the 'OK Plateau' with advanced tracking and tailored practices for professionals." />
                <link rel="canonical" href="https://touchflowpro.com/about" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        "name": "About TouchFlow Pro",
                        "url": "https://touchflowpro.com/about",
                        "description": "Learn about TouchFlow Pro's mission targeting the 'OK Plateau' with advanced tracking and tailored practices for professionals."
                    })}
                </script>
            </Helmet>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full"
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
                </button>

                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl md:text-7xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.9]">
                        Our <span className="text-primary italic">Mission.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        While typing games like Monkeytype are great for students, we build precision tools for modern professionals.
                    </p>
                </motion.div>

                <div className="space-y-12 text-sm leading-relaxed text-text-muted font-medium pb-24">
                    <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Target className="text-primary w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-wider text-text-main italic">Solving The "OK Plateau"</h2>
                        </div>
                        <p className="mb-4">
                            Most people learn to type in grade school and then stop improving. They reach the "OK Plateau" — generally around 40 to 60 WPM. They type entirely via sub-conscious muscle memory, but that muscle memory is heavily disorganized and fraught with micro-errors.
                        </p>
                        <p>
                            TouchFlow Pro is designed not for absolute beginners, but for professionals who want to break through that barrier. We utilize concepts from elite motor learning, such as tracking specific finger fatigue, analyzing bigrams, and enforcing high-accuracy floors to prevent the internalization of bad habits.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                                <Users className="text-secondary w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-wider text-text-main italic">Built For Specialized Work</h2>
                        </div>
                        <p className="mb-4">
                            Typing a random string of dictionary words is easy. Typing a complex SOAP note, drafting a legal brief, or writing convoluted React boilerplate is entirely different. Standard typing trainers fail to address the specific nomenclatures that modern professionals deal with daily.
                        </p>
                        <p>
                            That's why our tracks incorporate real Medical Terminology (ICD-10/Anatomy), Legal Lexicons, and actual open-source Code snippets. We want you to train on the exact sequences you get paid to type.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-highlight/10 rounded-xl flex items-center justify-center">
                                <Zap className="text-highlight w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-wider text-text-main italic">Data-Driven Excellence</h2>
                        </div>
                        <p className="mb-4">
                            Improvement requires measurement. We track your keystrokes, your performance under various string encodings, and your specific key fatigue in real-time. By providing you with extensive post-session reports, you finally have the transparency required to achieve 120+ WPM.
                        </p>
                        <div className="mt-8">
                            <Link to="/free-typing-test" className="text-sm font-black text-primary hover:text-primary/80 uppercase tracking-widest inline-flex items-center gap-2">
                                Start Training Now <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
