import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Rocket, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { apiFetch } from '../utils/api';

interface CreateOrgModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newOrg: any) => void;
}

const CreateOrgModal: React.FC<CreateOrgModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch('/api/orgs', {
                method: 'POST',
                body: JSON.stringify({ name: name.trim() })
            });

            onSuccess(response);
            setName('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create organization');
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
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Users size={24} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight uppercase">Assemble Team</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Initialize Organization</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Team Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Velocity Engineers"
                                    className="w-full bg-slate-500/5 border border-white/5 rounded-2xl px-6 py-4 text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                                    disabled={loading || !name.trim()}
                                    className="flex-[2] py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Rocket size={16} /> Establish Org
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

export default CreateOrgModal;
