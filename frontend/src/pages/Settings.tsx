import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { Save, Volume2, Monitor, Shield, User, Loader2, Check, Download } from 'lucide-react';
import { apiFetch } from '../utils/api';
import PageTransition from '../components/PageTransition';

interface UserSettings {
    id: string;
    soundEnabled: boolean;
    reduceMotion: boolean;
    fontScale: 'SM' | 'MD' | 'LG';
    strictAccuracy: boolean;
    autoPauseIdle: boolean;
    dailyGoalMinutes: number;
    defaultFocus: 'BALANCED' | 'SPEED' | 'ACCURACY' | 'ENDURANCE';
    warmupSeconds: number;
    reviewSeconds: number;
    skillSeconds: number;
    cooldownSeconds: number;
    storeRawLogsPractice: boolean;
    storeRawLogsCurriculum: boolean;
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await apiFetch('/api/me/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setSaved(false);
        try {
            const res = await apiFetch('/api/me/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await apiFetch('/api/me/export');
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `touchflow_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const updateSetting = (key: keyof UserSettings, value: any) => {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!settings) return null;

    const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
        <section className="card p-6 border border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </section>
    );

    const Toggle = ({ label, description, value, onChange }: { label: string, description?: string, value: boolean, onChange: (val: boolean) => void }) => (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-medium">{label}</div>
                {description && <div className="text-xs text-text-muted mt-1">{description}</div>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-white/10'}`}
            >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    const Select = ({ label, value, options, onChange }: { label: string, value: string, options: { label: string, value: string }[], onChange: (val: string) => void }) => (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const NumberInput = ({ label, value, min, max, onChange }: { label: string, value: number, min: number, max: number, onChange: (val: number) => void }) => (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</label>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
        </div>
    );

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Settings</h1>
                        <p className="text-text-muted">Customize your training environment</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Section title="Training Preferences" icon={Monitor}>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput
                                label="Daily Goal (Minutes)"
                                value={settings.dailyGoalMinutes}
                                min={5}
                                max={120}
                                onChange={(v) => updateSetting('dailyGoalMinutes', v)}
                            />
                            <Select
                                label="Default Focus"
                                value={settings.defaultFocus}
                                options={[
                                    { label: 'Balanced', value: 'BALANCED' },
                                    { label: 'Speed', value: 'SPEED' },
                                    { label: 'Accuracy', value: 'ACCURACY' },
                                    { label: 'Endurance', value: 'ENDURANCE' }
                                ]}
                                onChange={(v) => updateSetting('defaultFocus', v)}
                            />
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Phase Durations (Seconds)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <NumberInput label="Warmup" value={settings.warmupSeconds} min={30} max={600} onChange={(v) => updateSetting('warmupSeconds', v)} />
                                <NumberInput label="Skill Building" value={settings.skillSeconds} min={60} max={1200} onChange={(v) => updateSetting('skillSeconds', v)} />
                                <NumberInput label="Review" value={settings.reviewSeconds} min={30} max={600} onChange={(v) => updateSetting('reviewSeconds', v)} />
                                <NumberInput label="Cooldown" value={settings.cooldownSeconds} min={30} max={600} onChange={(v) => updateSetting('cooldownSeconds', v)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Typing Experience" icon={Volume2}>
                        <Toggle
                            label="Sound Effects"
                            description="Play sounds for keystrokes and errors"
                            value={settings.soundEnabled}
                            onChange={(v) => updateSetting('soundEnabled', v)}
                        />
                        <Toggle
                            label="Strict Accuracy Mode"
                            description="Must correct errors before proceeding"
                            value={settings.strictAccuracy}
                            onChange={(v) => updateSetting('strictAccuracy', v)}
                        />
                        <Toggle
                            label="Auto-Pause on Idle"
                            description="Pause timer after 5 seconds of inactivity"
                            value={settings.autoPauseIdle}
                            onChange={(v) => updateSetting('autoPauseIdle', v)}
                        />
                        <Toggle
                            label="Reduce Motion"
                            description="Minimize interface animations"
                            value={settings.reduceMotion}
                            onChange={(v) => updateSetting('reduceMotion', v)}
                        />
                        <Select
                            label="Font Scale"
                            value={settings.fontScale}
                            options={[
                                { label: 'Small', value: 'SM' },
                                { label: 'Medium', value: 'MD' },
                                { label: 'Large', value: 'LG' }
                            ]}
                            onChange={(v) => updateSetting('fontScale', v)}
                        />
                    </Section>

                    <Section title="Privacy & Data" icon={Shield}>
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                            <p className="text-xs text-yellow-200">
                                Raw logs store every keystroke and timing for detailed analysis. Disabling will save space but limit advanced analytics.
                            </p>
                        </div>
                        <Toggle
                            label="Store Practice Logs"
                            description="Save detailed keystroke data for practice sessions"
                            value={settings.storeRawLogsPractice}
                            onChange={(v) => updateSetting('storeRawLogsPractice', v)}
                        />
                        <Toggle
                            label="Store Curriculum Logs"
                            description="Save detailed keystroke data for lesson sessions"
                            value={settings.storeRawLogsCurriculum}
                            onChange={(v) => updateSetting('storeRawLogsCurriculum', v)}
                        />

                        <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center">
                            <div>
                                <div className="text-sm font-medium">Download My Data</div>
                                <div className="text-xs text-text-muted mt-1">Export all your account data as JSON</div>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                <Download size={14} />
                                Export
                            </button>
                        </div>
                    </Section>

                    <Section title="Account" icon={User}>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg">
                                <div className="text-xs text-text-muted mb-1">Account ID</div>
                                <div className="font-mono text-xs opacity-50 truncate">{settings.id}</div>
                            </div>
                            <div className="flex justify-end">
                                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                    Delete Account...
                                </button>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </PageTransition>
    );
};

export default Settings;
