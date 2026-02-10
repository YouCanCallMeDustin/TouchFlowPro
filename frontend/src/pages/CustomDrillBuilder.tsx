import React, { useState, useEffect } from 'react';
import { PenTool } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiFetch } from '../utils/api';

interface CustomDrillBuilderProps {
    userId: string;
}

interface CustomDrill {
    id: string;
    userId: string;
    title: string;
    content: string;
    difficulty: string;
    createdAt: Date;
    timesUsed: number;
}

const CustomDrillBuilder: React.FC<CustomDrillBuilderProps> = ({ userId }) => {
    const [drills, setDrills] = useState<CustomDrill[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        difficulty: 'Beginner'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrills();
    }, [userId]);

    const fetchDrills = async () => {
        try {
            const response = await apiFetch(`/api/custom-drills/${userId}`);
            const data = await response.json();
            setDrills(data.drills || []);
        } catch (error) {
            console.error('Failed to fetch drills:', error);
            toast.error('Failed to load custom drills');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            toast.error('Title and content are required');
            return;
        }

        try {
            if (editingId) {
                // Update existing drill
                const response = await apiFetch(`/api/custom-drills/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const updated = await response.json();
                setDrills(drills.map(d => d.id === editingId ? updated : d));
                toast.success('Drill updated successfully!');
            } else {
                // Create new drill
                const response = await apiFetch(`/api/custom-drills/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const newDrill = await response.json();
                setDrills([newDrill, ...drills]);
                toast.success('Drill created successfully!');
            }

            // Reset form
            setFormData({ title: '', content: '', difficulty: 'Beginner' });
            setShowForm(false);
            setEditingId(null);
        } catch (error) {
            console.error('Failed to save drill:', error);
            toast.error('Failed to save drill');
        }
    };

    const handleEdit = (drill: CustomDrill) => {
        setFormData({
            title: drill.title,
            content: drill.content,
            difficulty: drill.difficulty
        });
        setEditingId(drill.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this drill?')) return;

        try {
            await apiFetch(`/api/custom-drills/${id}`, { method: 'DELETE' });
            setDrills(drills.filter(d => d.id !== id));
            toast.success('Drill deleted');
        } catch (error) {
            console.error('Failed to delete drill:', error);
            toast.error('Failed to delete drill');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-bold text-primary-blue">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-8">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <PenTool size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Content Forge</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Custom Drills
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                        Create personalized practice content. Design your own <span className="text-primary font-black uppercase tracking-wider">Training Modules</span> tailored to your needs.
                    </p>
                </div>

                <div className="absolute right-12 bottom-12 z-10 hidden md:block">
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ title: '', content: '', difficulty: 'Beginner' });
                        }}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-3"
                    >
                        {showForm ? '✕ Cancel' : '+ New Drill'}
                    </button>
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

            {/* Creation Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/10 space-y-6">
                    <h2 className="text-2xl font-black text-text-main">
                        {editingId ? 'Edit Drill' : 'Create New Drill'}
                    </h2>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                            Drill Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Python Function Practice"
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border-2 border-white/10 focus:border-primary/50 focus:outline-none font-medium text-text-main placeholder:text-text-muted/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                            Content
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Enter the text you want to practice..."
                            rows={10}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border-2 border-white/10 focus:border-primary/50 focus:outline-none font-mono text-sm text-text-main placeholder:text-text-muted/50"
                        />
                        <div className="text-xs text-text-muted mt-1">
                            {formData.content.length} characters
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                            Difficulty Level
                        </label>
                        <div className="flex gap-3">
                            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, difficulty: level })}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${formData.difficulty === level
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-transparent border-2 border-white/10 text-text-muted hover:border-primary/50 hover:text-text-main'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        {editingId ? '💾 Update Drill' : '✨ Create Drill'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                        }}
                        className="w-full px-6 py-4 bg-transparent text-text-muted rounded-xl font-bold hover:text-text-main transition-all"
                    >
                        Cancel
                    </button>
                </form>
            )}

            {/* Drills List */}
            <div className="space-y-4">
                {drills.length > 0 ? (
                    drills.map((drill) => (
                        <div
                            key={drill.id}
                            className="bg-white/5 rounded-2xl p-6 shadow-lg border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-text-main">{drill.title}</h3>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
                                        <span className="font-bold">{drill.difficulty}</span>
                                        <span>•</span>
                                        <span>{drill.timesUsed} uses</span>
                                        <span>•</span>
                                        <span>{drill.content.length} chars</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(drill)}
                                        className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-bold text-sm hover:bg-primary/30 transition-all"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(drill.id)}
                                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-all border border-red-500/20"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 font-mono text-sm text-text-main whitespace-pre-wrap max-h-48 overflow-y-auto border border-white/5">
                                {drill.content}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white/5 rounded-2xl p-12 text-center shadow-lg border border-white/10">
                        <div className="text-6xl mb-4">✏️</div>
                        <h3 className="text-xl font-bold text-text-main mb-2">No custom drills yet</h3>
                        <p className="text-text-muted">Create your first custom drill to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomDrillBuilder;
