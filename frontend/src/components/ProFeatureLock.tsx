import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// Since App.tsx manages navigation via stage state, this component needs a way to trigger stage change.
// I'll emit a custom event or accept a prop. However, simpler is to just use window.location or assume App handles URL (it doesn't seems to).
// Navigation in this app is state-based (setStage). 
// I should probably pass an `onUpgrade` callback or use a global event.
// For now, I'll direct them to click the upgrade button in the header or just show a message.
// BETTER: The PricingPage is accessible via stage 'pricing'.
// I'll dispatch a custom event 'navigate-to-pricing' and listen for it in App.tsx? No, that's messy.
// I'll check how Dashboard handles navigation. It passes `onNavigate` prop.
// `AnalyticsDashboard` in App.tsx: `<AnalyticsDashboard />` - NO PROPS passed for navigation?
// Ah, `AnalyticsDashboard` is rendered in `App.tsx` line 468: `<AnalyticsDashboard />`. It doesn't receive `setStage`.
// I should update `App.tsx` to pass `onNavigate` to `AnalyticsDashboard`.

interface Props {
    children: React.ReactNode;
    title?: string;
}

const ProFeatureLock: React.FC<Props> = ({ children, title = "Pro Feature" }) => {
    const { user } = useAuth();
    const isPro = user?.subscriptionStatus === 'pro';

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-3xl border border-white/5">
            <div className="filter blur-md pointer-events-none select-none opacity-50 grayscale transition-all duration-500 group-hover:blur-lg group-hover:opacity-30">
                {children}
            </div>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-black/20 via-black/60 to-black/80 p-6 text-center backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_30px_-5px_var(--primary)] animate-pulse">
                    <Lock size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{title}</h3>
                <p className="text-text-muted text-sm mb-6 max-w-xs">{title} is available exclusively for Pro members.</p>

                {/* We use a global class or ID to trigger the upgrade modal if we can't pass props easily, 
                    OR we just relying on the user finding the button. 
                    Actually, I can use a button that dispatches a custom event which App.tsx listens to, 
                    or simply use local state to show the UpgradeModal inside this component? 
                    But UpgradeModal is in App.tsx (implied? No, I created it as a component).
                    App.tsx renders UpgradeModal? No, PricingPage does.
                    I should just export a global event emitter or use context for navigation.
                */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-pricing'))}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                    <Zap size={14} className="fill-black" />
                    Unlock Now
                </button>
            </div>
        </div>
    );
};

export default ProFeatureLock;
