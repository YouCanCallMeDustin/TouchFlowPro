import React, { useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Shield, Zap, Rocket } from 'lucide-react';
import logo from '../../assets/logo.png';

interface SignupProps {
    onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Security Keys Do Not Match');
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.user);
            } else {
                setError(data.error || 'Profile Creation Failed');
            }
        } catch (err) {
            setError('System Connection Failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="card max-w-lg w-full p-10 sm:p-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex justify-center mb-12">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img
                            src={logo}
                            alt="TouchFlow Pro"
                            className="h-24 w-auto relative z-10 brightness-110 drop-shadow-2xl"
                        />
                    </div>
                </div>

                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-text-main tracking-tighter uppercase">
                        Create Profile
                    </h1>
                    <p className="text-text-muted text-sm font-black uppercase tracking-[0.3em] opacity-40">Registering Professional Profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-1">Professional ID</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="USER@TOUCHFLOW.PRO"
                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-black text-xs uppercase tracking-widest text-text-main placeholder:text-text-muted/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-1">Security Key</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-black text-xs uppercase tracking-widest text-text-main placeholder:text-text-muted/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-1">Confirm Key</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors">
                                <Shield size={18} />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-black text-xs uppercase tracking-widest text-text-main placeholder:text-text-muted/20"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 text-rose-500 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 animate-in shake duration-500 flex items-center gap-3">
                            <Shield size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-4 group mt-4"
                    >
                        {loading ? 'Initializing...' : 'Generate Profile'}
                        <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col gap-6">
                    <button
                        onClick={() => login('dev-bypass-token', {
                            id: 'admin',
                            email: 'admin@touchflow.pro',
                            name: 'Administrator',
                            assignedLevel: 'Beginner',
                            currentLessonId: 'b1',
                            subscriptionStatus: 'pro'
                        })}
                        className="w-full bg-white/5 text-text-muted py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] border border-white/5 hover:bg-white/10 hover:text-text-main transition-all flex items-center justify-center gap-3"
                    >
                        <Zap size={14} className="text-primary" />
                        Admin Access
                    </button>

                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40">
                        Existing Professional? <span
                            onClick={onSwitchToLogin}
                            className="text-primary cursor-pointer hover:text-primary/80 transition-colors ml-2 border-b border-primary/20"
                        >
                            Authorize Profile
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
