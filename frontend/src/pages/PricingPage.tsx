import React, { useState } from 'react';
import { Check, X, Zap, Crown, Shield } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import UpgradeModal from '../components/UpgradeModal';

const PricingPage: React.FC = () => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const plans = [
        {
            name: "Starter",
            price: "Free",
            period: "forever",
            description: "Essential tools for daily practice",
            features: [
                "Unlimited Practice Drills",
                "Basic WPM & Accuracy Stats",
                "Standard 30-Day History",
                "Basic Error Heatmap",
            ],
            missing: [
                "Advanced Fatigue Tracking",
                "Code Mode (Python, JS)",
                "Medical & Legal Modes",
                "Hand Bias Analysis"
            ],
            cta: "Current Plan",
            active: false
        },
        {
            name: "Professional",
            price: "$9",
            period: "/ month",
            description: "For serious typists and developers",
            features: [
                "Everything in Starter",
                "Advanced Fatigue Analysis",
                "Code Mode (Python, React, etc.)",
                "Medical & Legal Dictionaries",
                "Hand Bias & Finger Heatmaps",
                "Unlimited History Retention",
                "Priority Support"
            ],
            missing: [],
            cta: "Upgrade Now",
            active: true
        }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Invest in Your <span className="text-primary">Workflow</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto">
                            Unlock the tools used by elite developers and transcriptionists to type faster, accurately, and with less fatigue.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative p-8 rounded-3xl border ${plan.active ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5'} flex flex-col`}
                            >
                                {plan.active && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-bold text-primary uppercase tracking-widest">
                                            <Crown size={12} />
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                                        <span className="text-text-muted font-medium">{plan.period}</span>
                                    </div>
                                    <p className="text-text-muted border-b border-white/10 pb-8">{plan.description}</p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.active ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                                                <Check size={12} />
                                            </div>
                                            <span className="text-sm text-gray-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.missing.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 opacity-40">
                                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                                <X size={12} />
                                            </div>
                                            <span className="text-sm text-gray-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => plan.active ? setShowUpgradeModal(true) : null}
                                    disabled={!plan.active}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${plan.active
                                        ? 'bg-primary text-white hover:scale-[1.02] shadow-xl shadow-primary/20'
                                        : 'bg-white/5 text-text-muted cursor-default'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Trust Signals */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <Shield className="mx-auto mb-4 text-primary" size={32} />
                            <h4 className="font-bold text-white mb-2">Secure Payment</h4>
                            <p className="text-sm text-text-muted">Processed securely via Stripe. We never store your card details.</p>
                        </div>
                        <div className="p-6">
                            <Zap className="mx-auto mb-4 text-primary" size={32} />
                            <h4 className="font-bold text-white mb-2">Instant Access</h4>
                            <p className="text-sm text-text-muted">Features are unlocked immediately after successful payment.</p>
                        </div>
                        <div className="p-6">
                            <Check className="mx-auto mb-4 text-primary" size={32} />
                            <h4 className="font-bold text-white mb-2">Cancel Anytime</h4>
                            <p className="text-sm text-text-muted">No contracts. Cancel your subscription with one click.</p>
                        </div>
                    </div>
                </div>

                <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            </div>
        </PageTransition>
    );
};

export default PricingPage;
