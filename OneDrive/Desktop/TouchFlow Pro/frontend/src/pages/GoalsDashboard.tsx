import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

interface GoalsDashboardProps {
    userId: string;
}

interface UserGoal {
    id: string;
    userId: string;
    goalType: string;
    targetValue: number;
    currentValue: number;
    deadline: Date | null;
    completed: boolean;
    createdAt: Date;
}

const GoalsDashboard: React.FC<GoalsDashboardProps> = ({ userId }) => {
    const [goals, setGoals] = useState<UserGoal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        goalType: 'wpm_target',
        targetValue: 100,
        deadline: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, [userId]);

    const fetchGoals = async () => {
        try {
            const response = await fetch(`/api/goals/${userId}`);
            const data = await response.json();
            setGoals(data.goals || []);
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/goals/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const newGoal = await response.json();
            setGoals([newGoal, ...goals]);
            setFormData({ goalType: 'wpm_target', targetValue: 100, deadline: '' });
            setShowForm(false);
            toast.success('Goal created!');
        } catch (error) {
            console.error('Failed to create goal:', error);
            toast.error('Failed to create goal');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this goal?')) return;

        try {
            await fetch(`/api/goals/${id}`, { method: 'DELETE' });
            setGoals(goals.filter(g => g.id !== id));
            toast.success('Goal deleted');
        } catch (error) {
            console.error('Failed to delete goal:', error);
            toast.error('Failed to delete goal');
        }
    };

    const getGoalIcon = (type: string) => {
        switch (type) {
            case 'wpm_target': return '⚡';
            case 'accuracy_target': return '🎯';
            case 'daily_practice': return '📅';
            default: return '🎯';
        }
    };

    const getGoalLabel = (type: string) => {
        switch (type) {
            case 'wpm_target': return 'WPM Target';
            case 'accuracy_target': return 'Accuracy Target';
            case 'daily_practice': return 'Daily Practice';
            default: return type;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-2xl font-bold text-primary-blue">Loading...</div>
        </div>;
    }

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-black text-text-main">🎯 Goals</h1>
                    <p className="text-text-muted mt-2">{activeGoals.length} active • {completedGoals.length} completed</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-primary-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                    {showForm ? '✕ Cancel' : '+ New Goal'}
                </button>
            </div>

            {/* Creation Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 space-y-6">
                    <h2 className="text-2xl font-black text-text-main">Create New Goal</h2>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">Goal Type</label>
                        <select
                            value={formData.goalType}
                            onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-blue focus:outline-none font-medium"
                        >
                            <option value="wpm_target">WPM Target</option>
                            <option value="accuracy_target">Accuracy Target</option>
                            <option value="daily_practice">Daily Practice Streak</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                            Target Value {formData.goalType === 'wpm_target' ? '(WPM)' : formData.goalType === 'accuracy_target' ? '(%)' : '(Days)'}
                        </label>
                        <input
                            type="number"
                            value={formData.targetValue}
                            onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
                            min="1"
                            max={formData.goalType === 'accuracy_target' ? '100' : '999'}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-blue focus:outline-none font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                            Deadline (Optional)
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-blue focus:outline-none font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-emerald-700 transition-all"
                    >
                        ✨ Create Goal
                    </button>
                </form>
            )}

            {/* Active Goals */}
            {activeGoals.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-text-main">Active Goals</h2>
                    {activeGoals.map((goal) => {
                        const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                        return (
                            <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl">{getGoalIcon(goal.goalType)}</div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-main">{getGoalLabel(goal.goalType)}</h3>
                                            <p className="text-text-muted text-sm mt-1">
                                                Target: {goal.targetValue}{goal.goalType === 'wpm_target' ? ' WPM' : goal.goalType === 'accuracy_target' ? '%' : ' days'}
                                            </p>
                                            {goal.deadline && (
                                                <p className="text-text-muted text-xs mt-1">
                                                    📅 Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-text-muted">Progress</span>
                                        <span className="text-primary-blue">{goal.currentValue} / {goal.targetValue} ({Math.round(progress)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-text-main">Completed Goals ✓</h2>
                    {completedGoals.map((goal) => (
                        <div key={goal.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border-2 border-emerald-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{getGoalIcon(goal.goalType)}</div>
                                    <div>
                                        <h3 className="text-xl font-black text-text-main flex items-center gap-2">
                                            {getGoalLabel(goal.goalType)}
                                            <span className="text-emerald-600">✓</span>
                                        </h3>
                                        <p className="text-text-muted text-sm">
                                            Target achieved: {goal.targetValue}{goal.goalType === 'wpm_target' ? ' WPM' : goal.goalType === 'accuracy_target' ? '%' : ' days'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {goals.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold text-text-main mb-2">No goals yet</h3>
                    <p className="text-text-muted">Set your first goal to start tracking progress!</p>
                </div>
            )}
        </div>
    );
};

export default GoalsDashboard;
