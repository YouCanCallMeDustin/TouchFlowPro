import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

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
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.user);
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 sm:p-10">
            <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 sm:p-12 text-center transition-all hover:shadow-3xl">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/assets/logo.png"
                        alt="TouchFlow Pro"
                        className="h-24 sm:h-28 w-auto"
                    />
                </div>

                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold mb-2 bg-gradient-brand bg-clip-text text-transparent">
                    Join TouchFlow Pro
                </h1>
                <p className="text-text-muted text-lg mb-8">Begin your typing mastery journey</p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-main uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-secondary-teal focus:ring-4 focus:ring-secondary-teal/10 transition-all font-body text-base"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-main uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-secondary-teal focus:ring-4 focus:ring-secondary-teal/10 transition-all font-body text-base"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-main uppercase tracking-wider">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-secondary-teal focus:ring-4 focus:ring-secondary-teal/10 transition-all font-body text-base"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-blue to-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
                    <button
                        onClick={() => login('dev-bypass-token', {
                            id: 'guest',
                            email: 'guest@touchflow.pro',
                            assignedLevel: 'Beginner',
                            currentLessonId: 'b1'
                        })}
                        className="w-full bg-slate-50 text-slate-600 py-3 rounded-xl font-bold text-sm border-2 border-slate-100 hover:bg-slate-100 transition-all"
                    >
                        ⚡ Developer Bypass (Guest Access)
                    </button>

                    <div className="text-sm text-text-muted">
                        Already have an account? <span
                            onClick={onSwitchToLogin}
                            className="text-primary-blue font-bold cursor-pointer hover:text-secondary-teal hover:underline transition-colors ml-1"
                        >
                            Sign in
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
