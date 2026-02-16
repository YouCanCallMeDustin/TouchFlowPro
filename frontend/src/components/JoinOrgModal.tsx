import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Loader2, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { apiFetch } from '../utils/api';

interface JoinOrgModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (org: any) => void;
}

const JoinOrgModal: React.FC<JoinOrgModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch('/api/org-invites/accept', {
                method: 'POST',
                body: JSON.stringify({ token: token.trim() })
            });

            onSuccess(response.org);
            setToken('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Invalid or expired token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Key size={24} className="text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight uppercase">Redeem Invite</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Join existing organization</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Invitation Token</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Paste your token here..."
                                    className="w-full bg-slate-500/5 border border-white/5 rounded-2xl px-6 py-4 text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !token.trim()}
                                    className="flex-[2] py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Check size={16} /> Link Profile
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default JoinOrgModal;
