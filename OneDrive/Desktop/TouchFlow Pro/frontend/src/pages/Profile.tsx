import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import PageTransition from '../components/PageTransition';

interface ProfileProps {
    userId: string;
    userEmail: string;
}

interface ProfileData {
    id: string;
    email: string;
    name: string | null;
    city: string | null;
    state: string | null;
    age: number | null;
    photoUrl: string | null;
    createdAt: string;
}

const Profile: React.FC<ProfileProps> = ({ userId, userEmail }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [age, setAge] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/profile/${userId}`);
            const data = await response.json();

            setProfile(data);
            setName(data.name || '');
            setCity(data.city || '');
            setState(data.state || '');
            setAge(data.age ? data.age.toString() : '');
            setPhotoUrl(data.photoUrl || '');
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const response = await fetch(`/api/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || null,
                    city: city.trim() || null,
                    state: state.trim() || null,
                    age: age.trim() ? parseInt(age) : null,
                    photoUrl: photoUrl.trim() || null
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Loading Profile</span>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Fingerprint size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Identity Matrix</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            User Profile
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            Manage your digital signature. Update your <span className="text-primary font-black uppercase tracking-wider">Public Identity</span> and personal settings.
                        </p>
                    </div>

                    {/* Decorative Abstract Mesh */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden hidden md:block">
                        <svg width="400" height="400" viewBox="0 0 400 400" className="translate-x-20 -translate-y-20 animate-[spin_60s_linear_infinite]">
                            <defs>
                                <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                </linearGradient>
                            </defs>
                            <path d="M 0,200 Q 100,100 200,200 T 400,200" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,100 Q 100,0 200,100 T 400,100" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,300 Q 100,200 200,300 T 400,300" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                        </svg>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card relative overflow-hidden border border-slate-200/60 dark:border-white/5"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Sidebar: Avatar and Quick Stats */}
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 shadow-xl border-slate-200/50 dark:border-white/10">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-xl font-black">{name || 'Guest User'}</h2>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{userEmail}</p>
                            </div>

                            <div className="w-full pt-6 border-t border-slate-100 dark:border-white/5 space-y-4 text-left">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-text-muted">
                                    <span>Joined</span>
                                    <span className="text-text-main">{profile ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-text-muted">
                                    <span>Location</span>
                                    <span className="text-text-main">{city ? `${city}, ${state}` : 'Unknown'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Personal Details</span>
                                <h3 className="text-2xl font-black">Edit Your Identity</h3>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted/40"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Age</label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted/40"
                                        placeholder="25"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Spokane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">State</label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="WA"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Photo URL</label>
                                    <input
                                        type="url"
                                        value={photoUrl}
                                        onChange={(e) => setPhotoUrl(e.target.value)}
                                        className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted/40"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white rounded-xl py-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Processing...' : 'Save Settings'}
                                </button>
                                <button
                                    onClick={() => fetchProfile()}
                                    className="px-6 bg-slate-100 dark:bg-slate-800 text-text-muted rounded-xl py-3 text-sm font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Profile;
