import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Zap, Users, ArrowRight, Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { apiFetch } from '../utils/api';

interface PricingPageProps {
    onNavigate: (stage: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [showOrgSelector, setShowOrgSelector] = useState<{ plan: string, priceId?: string } | null>(null);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        try {
            const data = await apiFetch('/api/orgs');
            setOrgs(data.orgs || []);
        } catch (error) {
            console.error('Failed to fetch orgs:', error);
        }
    };

    const handleSubscribe = async (planType: string, orgId?: string) => {
        try {
            setLoading(true);
            const response = await apiFetch('/api/subscriptions/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({ planType, orgId })
            });

            if (response.url) {
                window.location.href = response.url;
            } else {
                console.error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Subscription error:', error);
            alert(`Failed to start checkout: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanClick = (plan: any) => {
        if (plan.type === 'STARTER') {
            handleSubscribe('STARTER');
        } else {
            // Team plans require org selection
            if (orgs.length === 0) {
                if (window.confirm("You need a Team Organization to subscribe to this plan. Would you like to create one now?")) {
                    onNavigate('orgs');
                }
            } else if (orgs.length === 1) {
                // Auto-select the only org, but maybe verify?
                // Let's safe side: still show selector or confirm? 
                // Showing selector is safer so they know WHAT they are upgrading.
                setShowOrgSelector({ plan: plan.type });
            } else {
                setShowOrgSelector({ plan: plan.type });
            }
        }
    };

    const plans = [
        {
            name: "Starter",
            type: "STARTER",
            price: "$9",
            period: "/ month",
            description: "For personal improvement",
            features: [
                "Training plans + core drills",
                "Basic analytics",
                "Session history",
                "Unlimited Practice"
            ],
            missing: [
                "Advanced analytics + plateau watch",
                "Fatigue-aware scheduling",
                "Premium reports & exports",
                "Org dashboards"
            ],
            cta: "Start Starter",
            isPopular: false,
            color: "blue"
        },
        {
            name: "Pro",
            type: "PRO",
            price: "$49",
            period: "/ month",
            description: "Teams of up to 10",
            features: [
                "Advanced analytics + plateau watch",
                "Fatigue-aware scheduling",
                "Premium reports & exports",
                "Priority feature requests",
                "10 Seats Included"
            ],
            missing: [
                "Org dashboards + coaching metrics", // Actually Pro has some dashboard, but Enterprise has more?
                "Seat management + roles",
                "Weekly PDF/CSV reporting"
                // Adjusting based on user screenshot/request logic
            ],
            cta: "Go Pro",
            isPopular: true,
            color: "primary"
        },
        {
            name: "Enterprise",
            type: "ENTERPRISE",
            price: "$299",
            period: "/ month",
            description: "Up to 100 users",
            features: [
                "Org dashboards + coaching metrics",
                "Seat management + roles",
                "Weekly PDF/CSV reporting",
                "Billing portal + admin controls",
                "100 Seats Included"
            ],
            missing: [],
            cta: "Contact Sales", // Logic says "Contact Sales" in screenshot, but user wants to implement payment?
            // "Can you implement this payment system... make whatever necessary changes"
            // I'll make it clickable for now given the request, or maybe "Upgrade".
            // Let's make it clickable "Upgrade to Enterprise"
            isPopular: false,
            color: "purple"
        }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Choose Your <span className="text-primary">Trajectory</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto">
                            Scalable plans for individuals and high-performance engineering teams.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative p-8 rounded-3xl border flex flex-col ${plan.isPopular
                                    ? 'border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-2 ${plan.name === 'Enterprise' ? 'text-white' : 'text-white'
                                        }`}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-6xl font-black text-white tracking-tighter">{plan.price}</span>
                                        <span className="text-text-muted font-medium text-sm">{plan.period}</span>
                                    </div>
                                    <p className="text-text-muted border-b border-white/10 pb-8">{plan.description}</p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.isPopular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'
                                                }`}>
                                                <Check size={12} />
                                            </div>
                                            <span className="text-sm text-gray-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.missing.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 opacity-40">
                                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <X size={12} />
                                            </div>
                                            <span className="text-sm text-gray-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePlanClick(plan)}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${plan.isPopular
                                        ? 'bg-primary text-white hover:scale-[1.02] shadow-xl shadow-primary/20'
                                        : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Trust Signals */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/5 pt-12">
                        <div className="p-6">
                            <Shield className="mx-auto mb-4 text-primary" size={32} />
                            <h4 className="font-bold text-white mb-2">Secure Payment</h4>
                            <p className="text-sm text-text-muted">Processed securely via Stripe.</p>
                        </div>
                        <div className="p-6">
                            <Zap className="mx-auto mb-4 text-primary" size={32} />
                            <h4 className="font-bold text-white mb-2">Instant Access</h4>
                            <p className="text-sm text-text-muted">Features unlock immediately.</p>
                        </div>
                        <div className="p-6">
                            <Users className="mx-auto mb-4 text-primary" size={32} />
                            <h4 className="font-bold text-white mb-2">Team Management</h4>
                            <p className="text-sm text-text-muted">Easily manage seats and roles.</p>
                        </div>
                    </div>
                </div>

                {/* Org Selector Modal */}
                {showOrgSelector && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full relative">
                            <button
                                onClick={() => setShowOrgSelector(null)}
                                className="absolute top-6 right-6 p-2 text-text-muted hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Select Organization</h3>
                            <p className="text-text-muted text-sm mb-6">Which team are you upgrading to {showOrgSelector.plan}?</p>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6 pr-2">
                                {orgs.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => handleSubscribe(showOrgSelector.plan, org.id)}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/50 transition-all group text-left"
                                    >
                                        <div>
                                            <div className="font-bold text-white">{org.name}</div>
                                            <div className="text-xs text-text-muted">{org.planTier} Plan • {org._count?.members || 1} Members</div>
                                        </div>
                                        <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => onNavigate('orgs')}
                                className="w-full py-4 rounded-xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                            >
                                + Create New Organization
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default PricingPage;
