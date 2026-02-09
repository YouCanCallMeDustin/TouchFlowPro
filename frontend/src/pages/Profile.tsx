import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Camera, Upload, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';
import PageTransition from '../components/PageTransition';

interface ProfileProps {
    userId: string;
    userEmail: string;
    onProfileUpdate?: () => void;
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
    subscriptionStatus?: 'free' | 'pro' | 'cancelled';
    subscriptionEndDate?: string | null;
}

interface UserAchievement {
    id: string;
    badgeType: string;
    earnedAt: string;
}

interface AvailableAchievement {
    type: string;
    name: string;
    description: string;
    icon: string;
}

const Profile: React.FC<ProfileProps> = ({ userId, userEmail, onProfileUpdate }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [age, setAge] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
    const [availableAchievements, setAvailableAchievements] = useState<AvailableAchievement[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
        fetchAchievements();
    }, [userId]);

    const fetchProfile = async () => {
        if (userId === 'admin') {
            const mockData: ProfileData = {
                id: 'admin',
                email: 'admin@touchflow.pro',
                name: 'Administrator',
                city: 'System',
                state: 'Root',
                age: 99,
                photoUrl: null,
                createdAt: new Date().toISOString(),
                subscriptionStatus: 'pro'
            };
            setProfile(mockData);
            setName(mockData.name || '');
            setCity(mockData.city || '');
            setState(mockData.state || '');
            setAge(mockData.age ? mockData.age.toString() : '');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await apiFetch(`/api/profile/${userId}`);
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

    const fetchAchievements = async () => {
        if (userId === 'admin') {
            setEarnedAchievements([]);
            setAvailableAchievements([]);
            return;
        }
        try {
            setLoadingStats(true);
            const [earnedRes, availableRes] = await Promise.all([
                apiFetch(`/api/achievements/${userId}`),
                apiFetch('/api/achievements/list/available')
            ]);

            const earnedData = await earnedRes.json();
            const availableData = await availableRes.json();

            setEarnedAchievements(earnedData.achievements || []);
            setAvailableAchievements(availableData.achievements || []);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type?.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB.' });
            return;
        }

        try {
            setIsUploading(true);
            setMessage(null);

            const formData = new FormData();
            formData.append('photo', file);

            const response = await apiFetch('/api/upload/profile-photo', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setPhotoUrl(data.url);
            setMessage({ type: 'success', text: 'Photo uploaded! Don\'t forget to save your settings.' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Failed to upload photo.' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const response = await apiFetch(`/api/profile/${userId}`, {
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
            if (onProfileUpdate) onProfileUpdate();
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
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">User Profile</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Account Settings
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            Manage your account details. Update your <span className="text-primary font-black uppercase tracking-wider">Public Profile</span> and personal settings.
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />

                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-60 transition duration-500" />
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 shadow-xl border-slate-200/50 dark:border-white/10">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                    )}

                                    {/* Overlay on hover or uploading */}
                                    <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {isUploading ? (
                                            <Loader2 className="text-white animate-spin" size={24} />
                                        ) : (
                                            <>
                                                <Camera className="text-white mb-1" size={20} />
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                                            </>
                                        )}
                                    </div>
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
                                <h3 className="text-2xl font-black">Edit Your Profile</h3>
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1 flex justify-between items-center">
                                        <span>Photo URL</span>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="text-primary hover:text-primary-dark normal-case flex items-center gap-1.5 transition-colors group"
                                        >
                                            <Upload size={12} className="group-hover:-translate-y-0.5 transition-transform" />
                                            <span className="font-black text-[9px] uppercase tracking-widest">Upload from Computer</span>
                                        </button>
                                    </label>
                                    <input
                                        type="url"
                                        value={photoUrl}
                                        onChange={(e) => setPhotoUrl(e.target.value)}
                                        className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted/40 font-mono text-[11px]"
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

                {/* Subscription Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card border border-slate-200/60 dark:border-white/5 p-8 relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Membership</span>
                            <h3 className="text-2xl font-black">Subscription Status</h3>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${profile?.subscriptionStatus === 'pro' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-500/10 text-text-muted'}`}>
                            {profile?.subscriptionStatus === 'pro' ? 'Pro Member' : 'Free Tier'}
                        </div>
                    </div>

                    <div className="bg-slate-500/5 dark:bg-white/5 rounded-2xl p-6 border border-slate-200/60 dark:border-white/5">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="text-sm font-bold text-text-main mb-1">
                                    {profile?.subscriptionStatus === 'pro' ? 'Active Pro Subscription' : 'Upgrade to TouchFlow Pro'}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {profile?.subscriptionStatus === 'pro'
                                        ? `Renews on ${profile.subscriptionEndDate ? new Date(profile.subscriptionEndDate).toLocaleDateString() : 'Unknown'}`
                                        : 'Unlock advanced analytics, code mode, and more.'}
                                </p>
                            </div>
                            {profile?.subscriptionStatus !== 'pro' && (
                                <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                    Upgrade Now
                                </button>
                            )}
                            {profile?.subscriptionStatus === 'pro' && (
                                <button className="px-6 py-3 bg-slate-500/10 text-text-muted rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-500/20 transition-all">
                                    Manage Subscription
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Milestones Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card border border-slate-200/60 dark:border-white/5 p-8 sm:p-12 relative overflow-hidden"
                >
                    <div className="flex justify-between items-end mb-10">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Achievements</span>
                            <h3 className="text-3xl font-black">Earned Milestones</h3>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-50">Progress</div>
                            <div className="text-xl font-black text-secondary">
                                {earnedAchievements.length} <span className="text-[10px] text-text-muted">of</span> {availableAchievements.length}
                            </div>
                        </div>
                    </div>

                    {loadingStats ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-secondary opacity-20" size={32} />
                        </div>
                    ) : earnedAchievements.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {earnedAchievements.slice(0, 10).map((earned) => {
                                const available = availableAchievements.find(a => a.type === earned.badgeType);
                                if (!available) return null;
                                return (
                                    <div
                                        key={earned.id}
                                        className="group flex flex-col items-center justify-center p-6 bg-secondary/5 rounded-3xl border border-secondary/10 hover:border-secondary/30 transition-all hover:-translate-y-1 cursor-help"
                                        title={available.description}
                                    >
                                        <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-500">{available.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-center">{available.name}</span>
                                    </div>
                                );
                            })}
                            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-dashed border-white/10 hover:border-primary/30 transition-all group">
                                <span className="text-text-muted/20 text-xs font-black uppercase tracking-widest text-center group-hover:text-primary transition-colors">
                                    More Milestones
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-secondary/5 rounded-3xl border border-dashed border-secondary/10">
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted opacity-50 mb-2">No badges earned yet</p>
                            <p className="text-[10px] text-text-muted opacity-30">Complete drills and lessons to unlock your first milestone.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Profile;
