import React from 'react';
import { X, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const UpgradeModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { token } = useAuth();

    const handleUpgrade = async () => {
        try {
            const data = await apiFetch(`/api/subscriptions/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No checkout URL returned:', data);
                alert('Checkout failed: No URL returned from server.');
            }
        } catch (error: any) {
            console.error('Error during upgrade:', error);

            if (error.status === 401 || error.status === 403) {
                const debugInfo = error.details ? `\n\nDebug Info: ${JSON.stringify(error.details, null, 2)}` : '';
                alert(`Authentication failed: ${error.message}${debugInfo}`);

                // Force logout and redirect
                localStorage.removeItem('tfp_token');
                window.location.href = '/login';
                return;
            }

            const debugInfo = error.details ? `\n\nDebug Info: ${JSON.stringify(error.details, null, 2)}` : '';
            const errorCode = error.code ? ` (${error.code})` : '';
            alert(`Failed to start checkout${errorCode}: ${error.message}${debugInfo}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Abstract Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Zap className="text-white fill-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Level Up</h2>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Unlock Professional Power</p>
                                </div>
                            </div>

                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Accelerate your career with advanced metrics, fatigue tracking, and specialized practice modes designed for professionals.
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    'Advanced Analytics (Fatigue & Hand Bias)',
                                    'Code Mode (Python, JS, React)',
                                    'Medical & Legal Dictionaries',
                                    'Priority Support & Badges',
                                    'Unlimited History Retention'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check size={12} className="text-green-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleUpgrade}
                                className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Upgrade for $9/mo
                            </button>

                            <p className="text-center mt-4 text-xs text-text-muted">
                                Cancel anytime. 100% money-back guarantee.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
