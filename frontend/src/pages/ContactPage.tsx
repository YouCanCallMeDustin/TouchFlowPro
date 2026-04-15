import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';

interface ContactPageProps {
    onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
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
                <title>Contact Support | TouchFlow Pro</title>
                <meta name="description" content="Get in touch with the TouchFlow Pro support team for billing inquiries, technical support, or organizational dashboard setup." />
                <link rel="canonical" href="https://touchflowpro.com/contact" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        "name": "TouchFlow Pro Contact",
                        "description": "Contact info for TouchFlow Pro.",
                        "mainEntity": {
                            "@type": "Organization",
                            "name": "TouchFlow Pro",
                            "email": "touchflowpro@gmail.com"
                        }
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
                        Get In <span className="text-primary italic">Touch.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        We're here to help you hit 120 WPM.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-text-muted font-medium pb-24 max-w-2xl mx-auto">
                    <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <Mail className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-wider text-text-main italic mb-2">Email Support</h2>
                        <p className="mb-4 text-xs">For account inquiries, org upgrades, and general technical support.</p>
                        <a href="mailto:touchflowpro@gmail.com" className="font-bold text-primary hover:text-primary/80 transition-colors text-lg">
                            touchflowpro@gmail.com
                        </a>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center hover:border-secondary/20 transition-colors">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                            <MapPin className="text-secondary w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-wider text-text-main italic mb-2">Headquarters</h2>
                        <p className="mb-4 text-xs">We operate fully remote with primary operations rooted in Washington State.</p>
                        <span className="font-bold text-text-main opacity-80 uppercase tracking-widest text-[11px]">
                            Spokane, WA • USA
                        </span>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
