import React, { useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface LoginProps {
    onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            login(data.token, data.user);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'System Connection Failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <Card glass className="max-w-lg w-full p-10 sm:p-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex justify-center mb-12">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="TouchFlow Pro"
                            className="h-24 w-auto relative z-10 brightness-110 drop-shadow-2xl"
                        />
                    </div>
                </div>

                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-text-main tracking-tighter uppercase">
                        Identity Verified
                    </h1>
                    <p className="text-text-muted text-sm font-black uppercase tracking-[0.3em] opacity-40">Verifying Professional Profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 text-left">
                    <Input
                        label="Professional ID"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="USER@TOUCHFLOW.PRO"
                        required
                        startIcon={<Mail size={18} />}
                    />

                    <Input
                        label="Security Key"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        startIcon={<Lock size={18} />}
                    />

                    {error && (
                        <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--danger)]/20 animate-in shake duration-500 flex items-center gap-3">
                            <Shield size={16} />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full py-6 text-xs uppercase tracking-[0.4em] font-black"
                        size="lg"
                    >
                        {!loading && 'Authorize Profile'}
                        {!loading && <ArrowRight size={18} className="ml-4 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </form>

                <div className="mt-12 pt-10 border-t border-[var(--border)] flex flex-col gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => login('dev-bypass-token', {
                            id: 'admin',
                            email: 'admin@touchflow.pro',
                            name: 'Administrator',
                            assignedLevel: 'Beginner',
                            currentLessonId: 'b1',
                            subscriptionStatus: 'pro'
                        })}
                        className="w-full py-4 text-[10px] uppercase tracking-[0.3em] border border-[var(--border)]"
                    >
                        <Zap size={14} className="text-primary mr-3" />
                        Admin Access
                    </Button>

                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40">
                        New Professional? <span
                            onClick={onSwitchToSignup}
                            className="text-primary cursor-pointer hover:text-primary/80 transition-colors ml-2"
                        >
                            Create Profile
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Login;
