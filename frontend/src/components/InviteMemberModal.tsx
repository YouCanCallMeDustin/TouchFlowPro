import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Loader2, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { apiFetch } from '../utils/api';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    orgId: string;
    orgName: string;
    onSuccess?: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, orgId, orgName, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setLoading(true);
            setError(null);

            await apiFetch('/api/org-invites', {
                method: 'POST',
                body: JSON.stringify({
                    orgId,
                    email: email.trim(),
                    role: 'MEMBER'
                })
            });

            setSuccess(true);
            setEmail('');
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setError(null);
        setEmail('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                                <Mail size={24} className="text-secondary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight uppercase">Expand Fleet</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">Invite to {orgName}</p>
                            </div>
                        </div>

                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Candidate Email</label>
                                    <input
                                        autoFocus
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="recruit@agency.com"
                                        className="w-full bg-slate-500/5 border border-white/5 rounded-2xl px-6 py-4 text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-secondary/20 bg-secondary hover:bg-secondary/90"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send size={16} /> Dispatch Invitation
                                        </span>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="text-emerald-500" size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-text-main mb-1">Invitation Dispatched</h3>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                                        The invitation has been successfully sent. If the user already has an account, they have been added to the fleet. Otherwise, the system is awaiting their registration.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleClose}
                                    className="w-full py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black"
                                >
                                    Mission Accomplished
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteMemberModal;
