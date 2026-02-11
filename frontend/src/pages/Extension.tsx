import React from 'react';
import { motion } from 'framer-motion';
import { Download, Zap, Target, Clock, Code } from 'lucide-react';

const Extension: React.FC = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                        <Code size={14} />
                        <span>VS Code Extension</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-text-main mb-6 leading-tight">
                        Code at the Speed of <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Thought</span>
                    </h1>

                    <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                        Track your typing speed and accuracy in real-time directly inside VS Code.
                        Improve your productivity and catch errors before they happen.
                    </p>

                    <motion.a
                        href="/downloads/touchflow-pro-tracker-1.0.0.vsix"
                        download
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 bg-primary text-bg-main px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    >
                        <Download size={20} />
                        Download for VS Code
                    </motion.a>

                    <p className="mt-4 text-sm text-text-muted opacity-60">
                        Version 1.0.0 • Free Download • No Account Required
                    </p>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <FeatureCard
                    icon={<Zap className="text-primary" size={32} />}
                    title="Real-Time WPM"
                    description="See exactly how fast you code with live, unobtrusive metrics right in your status bar."
                    delay={0.1}
                />
                <FeatureCard
                    icon={<Target className="text-secondary" size={32} />}
                    title="Accuracy Tracking"
                    description="Monitor your error rate and backspace usage to build precision alongside speed."
                    delay={0.2}
                />
                <FeatureCard
                    icon={<Clock className="text-accent" size={32} />}
                    title="Session Timer"
                    description="Track your productive coding hours with smart auto-pause when you step away."
                    delay={0.3}
                />
            </div>

            {/* Installation Guide */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="card p-8 md:p-12 max-w-4xl mx-auto"
            >
                <h2 className="text-3xl font-heading font-black text-text-main mb-8 text-center">How to Install</h2>
                <div className="space-y-6">
                    <Step number="1" title="Download the Extension">
                        Click the download button above to get the <code className="bg-white/10 px-2 py-1 rounded text-primary">.vsix</code> file.
                    </Step>
                    <Step number="2" title="Open VS Code">
                        Launch Visual Studio Code and open the <strong className="text-text-main">Extensions</strong> view (Ctrl+Shift+X).
                    </Step>
                    <Step number="3" title="Install from VSIX">
                        Click the <strong className="text-text-main">...</strong> menu at the top-right of the Extensions pane and select <strong className="text-text-main">Install from VSIX...</strong>
                    </Step>
                    <Step number="4" title="Select the File">
                        Browse to your downloads folder and select the file you just downloaded.
                    </Step>
                    <Step number="5" title="Start Coding!">
                        You'll see a new <strong className="text-text-main">⚡ 0 WPM</strong> indicator in your bottom status bar. Click it to reset stats.
                    </Step>
                </div>
            </motion.div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="card p-8 hover:border-primary/30 transition-colors group"
    >
        <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-main mb-3">{title}</h3>
        <p className="text-text-muted leading-relaxed">{description}</p>
    </motion.div>
);

const Step = ({ number, title, children }: { number: string, title: string, children: React.ReactNode }) => (
    <div className="flex gap-6 items-start">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black shrink-0 border border-primary/30">
            {number}
        </div>
        <div>
            <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
            <p className="text-text-muted text-lg">{children}</p>
        </div>
    </div>
);

export default Extension;
