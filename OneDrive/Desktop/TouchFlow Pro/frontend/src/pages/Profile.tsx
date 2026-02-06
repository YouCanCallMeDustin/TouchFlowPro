import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

    // Form state
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

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setName(profile.name || '');
            setCity(profile.city || '');
            setState(profile.state || '');
            setAge(profile.age ? profile.age.toString() : '');
            setPhotoUrl(profile.photoUrl || '');
            setMessage(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size exceeds 5MB limit' });
            return;
        }

        try {
            // Don't set global loading, just show uploading message
            setMessage({ type: 'success', text: 'Uploading photo...' });

            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            // Assuming the backend returns relative URL, we might need to prepend base URL if not proxied correctly
            // But since we serve static files from /api/uploads, the returned url should be good
            setPhotoUrl(data.url);
            setMessage({ type: 'success', text: 'Photo uploaded successfully!' });

            // Clear success message
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Failed to upload photo' });
        }
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="max-w-4xl mx-auto p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 bg-gray-200 rounded-2xl w-1/3" />
                        <div className="h-64 bg-gray-200 rounded-3xl" />
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex items-center gap-6"
                >
                    {profile?.photoUrl && (
                        <img
                            src={profile.photoUrl}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-text-main mb-2">My Profile</h1>
                        <p className="text-text-muted">Manage your personal information</p>
                    </div>
                </motion.div>

                {/* Success/Error Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl ${message.type === 'success'
                            ? 'bg-green-50 border-2 border-green-200 text-green-800'
                            : 'bg-red-50 border-2 border-red-200 text-red-800'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                {/* Profile Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200"
                >
                    <div className="space-y-6">
                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={userEmail}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-text-muted cursor-not-allowed"
                            />
                            <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none transition-colors"
                            />
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Enter your city"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Enter your state"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Enter your age"
                                min="1"
                                max="150"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Photo URL */}
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Profile Photo
                            </label>

                            <div className="flex flex-col gap-4">
                                {/* Upload Button */}
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-blue hover:text-brand-blue transition-all bg-gray-50">
                                        <span>📁 Upload from Computer</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-sm text-text-muted">or</span>
                                </div>

                                {/* URL Input */}
                                <div>
                                    <input
                                        type="url"
                                        value={photoUrl}
                                        onChange={(e) => setPhotoUrl(e.target.value)}
                                        placeholder="https://example.com/photo.jpg"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none transition-colors"
                                    />
                                    <p className="text-xs text-text-muted mt-1">
                                        Enter a URL to your profile photo
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Photo Preview */}
                        {photoUrl && (
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Photo Preview
                                </label>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={photoUrl}
                                        alt="Profile preview"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/96?text=Invalid';
                                        }}
                                    />
                                    <p className="text-sm text-text-muted">
                                        This is how your photo will appear
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {saving ? '⏳ Saving...' : '💾 Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                ↩️ Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Account Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                    <h3 className="text-sm font-bold text-text-main mb-2">Account Information</h3>
                    <p className="text-xs text-text-muted">
                        Account created: {profile ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Profile;
