import React, { useState } from 'react';
import { Save, Volume2, Monitor, Shield, User, Loader2, Check, Download, Info, CreditCard } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useSettings, type UserSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface SettingsProps {
    onNavigate?: (stage: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { settings, loading, updateSettings } = useSettings();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);

    // Initialize local settings when they load
    React.useEffect(() => {
        if (settings && !localSettings) {
            setLocalSettings(settings);
        }
    }, [settings, localSettings]);

    const handleNavigateToPricing = () => {
        if (onNavigate) {
            onNavigate('pricing');
        } else {
            window.location.href = '/pricing';
        }
    };

    const handleManageSubscription = async () => {
        try {
            const { apiFetch } = await import('../utils/api');
            const response = await apiFetch('/api/subscriptions/create-portal-session', {
                method: 'POST'
            });
            if (response.url) {
                window.location.href = response.url;
            } else {
                alert('Could not redirect to subscription portal.');
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Failed to open subscription portal.');
        }
    };

    const handleSave = async () => {
        if (!localSettings) return;
        setSaving(true);
        setSaved(false);
        const success = await updateSettings(localSettings);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setSaving(false);
    };

    const handleExport = async () => {
        // ... (this stays the same logic, but I'll move it here)
        try {
            const { apiFetch } = await import('../utils/api');
            const data = await apiFetch('/api/me/export');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
        setLocalSettings(prev => prev ? { ...prev, [key]: value } : null);
    };

    if (loading || !localSettings) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const Section = ({ title, description, icon: Icon, children }: { title: string, description?: string, icon: any, children: React.ReactNode }) => (
        <section className="card p-6 border border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">{title}</h3>
                        {description && <p className="text-[10px] text-text-muted uppercase tracking-widest">{description}</p>}
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </section>
    );

    const ItemLabel = ({ label, description }: { label: string, description?: string }) => (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{label}</span>
                <div className="group relative">
                    <Info size={12} className="text-text-muted hover:text-primary cursor-help transition-colors" />
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] text-text-muted leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );

    const Toggle = ({ label, helpText, value, onChange }: { label: string, helpText?: string, value: boolean, onChange: (val: boolean) => void }) => (
        <div className="flex items-center justify-between">
            <ItemLabel label={label} description={helpText} />
            <button
                onClick={() => onChange(!value)}
                className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-white/10'}`}
            >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    const Select = ({ label, helpText, value, options, onChange }: { label: string, helpText?: string, value: string, options: { label: string, value: string }[], onChange: (val: string) => void }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</label>
                <div className="group relative">
                    <Info size={12} className="text-text-muted hover:text-primary cursor-help transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] text-text-muted leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        {helpText}
                    </div>
                </div>
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none hover:bg-white/[0.08] cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const NumberInput = ({ label, helpText, value, min, max, onChange }: { label: string, helpText?: string, value: number, min: number, max: number, onChange: (val: number) => void }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</label>
                <div className="group relative">
                    <Info size={12} className="text-text-muted hover:text-primary cursor-help transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] text-text-muted leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        {helpText}
                    </div>
                </div>
            </div>
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
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Configuration</h1>
                        <p className="text-text-muted text-sm font-medium">Fine-tune your high-performance training environment.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`
                            flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all 
                            ${saved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20'}
                            disabled:opacity-50 active:scale-95
                        `}
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                        {saving ? 'Syncing...' : saved ? 'Synced' : 'Commit Changes'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Section title="Training Deck" icon={Monitor} description="PLANNING & TARGETS">
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput
                                label="Daily Goal"
                                helpText="Your target practice time in minutes per day. Used to track streak progress."
                                value={localSettings.dailyGoalMinutes}
                                min={5}
                                max={120}
                                onChange={(v) => updateSetting('dailyGoalMinutes', v)}
                            />
                            <Select
                                label="Default Focus"
                                helpText="The primary objective for your training recommendations."
                                value={localSettings.defaultFocus}
                                options={[
                                    { label: 'Balanced', value: 'BALANCED' },
                                    { label: 'Speed', value: 'SPEED' },
                                    { label: 'Accuracy', value: 'ACCURACY' },
                                    { label: 'Endurance', value: 'ENDURANCE' }
                                ]}
                                onChange={(v) => updateSetting('defaultFocus', v)}
                            />
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-40">Phase Durations (Sec)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <NumberInput label="Warmup" helpText="Length of the initial movement calibration phase." value={localSettings.warmupSeconds} min={30} max={600} onChange={(v) => updateSetting('warmupSeconds', v)} />
                                <NumberInput label="Skill Building" helpText="The core training block focused on new patterns." value={localSettings.skillSeconds} min={60} max={1200} onChange={(v) => updateSetting('skillSeconds', v)} />
                                <NumberInput label="Review" helpText="Spaced repetition phase for previously learned items." value={localSettings.reviewSeconds} min={30} max={600} onChange={(v) => updateSetting('reviewSeconds', v)} />
                                <NumberInput label="Cooldown" helpText="Final relaxation phase to cement muscle memory." value={localSettings.cooldownSeconds} min={30} max={600} onChange={(v) => updateSetting('cooldownSeconds', v)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Interface Logic" icon={Volume2} description="PHYSICAL FEEDBACK">
                        <Toggle
                            label="Sonic Feedback"
                            helpText="Auditory triggers for keystrokes and errors. Key for establishing rhythm."
                            value={localSettings.soundEnabled}
                            onChange={(v) => updateSetting('soundEnabled', v)}
                        />
                        <Toggle
                            label="Auto-Pause"
                            helpText="Halts the session timer automatically after 5 seconds of inactivity."
                            value={localSettings.autoPauseIdle}
                            onChange={(v) => updateSetting('autoPauseIdle', v)}
                        />
                        <Toggle
                            label="Reduce Animation"
                            helpText="Simplifies interface transitions to minimize visual fatigue."
                            value={localSettings.reduceMotion}
                            onChange={(v) => updateSetting('reduceMotion', v)}
                        />
                        <Select
                            label="Visual Scale"
                            helpText="Adjusts the font size of the typing arena."
                            value={localSettings.fontScale}
                            options={[
                                { label: 'Tactical (SM)', value: 'SM' },
                                { label: 'Standard (MD)', value: 'MD' },
                                { label: 'Focus (LG)', value: 'LG' }
                            ]}
                            onChange={(v) => updateSetting('fontScale', v)}
                        />
                    </Section>

                    <Section title="Data Architecture" icon={Shield} description="ANALYTICS & PRIVACY">
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-4">
                            <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                                Raw telemetry logs store precise inter-key timings. Essential for heatmaps and rhythm analysis.
                            </p>
                        </div>
                        <Toggle
                            label="Practice Logs"
                            helpText="Store telemetry for free-form practice."
                            value={localSettings.storeRawLogsPractice}
                            onChange={(v) => updateSetting('storeRawLogsPractice', v)}
                        />
                        <Toggle
                            label="Curriculum Logs"
                            helpText="Store telemetry for guided lessons."
                            value={localSettings.storeRawLogsCurriculum}
                            onChange={(v) => updateSetting('storeRawLogsCurriculum', v)}
                        />

                        <div className="pt-6 mt-4 border-t border-white/5 flex justify-between items-center">
                            <div>
                                <div className="text-sm font-bold">Telemetry Export</div>
                                <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-black opacity-40">JSON SYSTEM DUMP</div>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                            >
                                <Download size={12} />
                                Export
                            </button>
                        </div>
                    </Section>

                    <Section title="Subscription" icon={CreditCard} description="BILLING & PLANS">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 opacity-50">Current Plan</div>
                                <div className="font-bold text-xl text-white flex items-center gap-2">
                                    {user?.subscriptionStatus?.toUpperCase() || 'FREE'}
                                    {user?.subscriptionStatus !== 'free' && (
                                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {user?.subscriptionStatus === 'free' ? (
                                    <button
                                        onClick={handleNavigateToPricing}
                                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                                    >
                                        Upgrade
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleNavigateToPricing}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 w-full"
                                        >
                                            Change Plan
                                        </button>
                                        <button
                                            onClick={handleManageSubscription}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 w-full"
                                        >
                                            Manage
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={async () => {
                                        try {
                                            const { apiFetch } = await import('../utils/api');
                                            const res = await apiFetch('/api/subscriptions/sync', { method: 'POST' });

                                            // Even if not "updated" in DB, the effective status might have changed (e.g. joined team)
                                            // or we just want to ensure the frontend is fresh.
                                            alert(`Subscription Synchronization Complete.\nResolved Status: ${res.status.toUpperCase()}${res.updated ? '\n(Database updated)' : ''}`);

                                            // Hard reload to refresh all contexts (Auth, User, etc)
                                            window.location.reload();
                                        } catch (e) {
                                            console.error('Sync failed:', e);
                                            alert('Failed to synchronize subscription status. Please try logging out and back in if the issue persists.');
                                        }
                                    }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 w-full flex items-center justify-center gap-2"
                                >
                                    <Monitor size={12} /> Sync Status
                                </button>
                            </div>
                        </div>
                    </Section>

                    <Section title="Identity" icon={User} description="PROFILE PERSISTENCE">
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 opacity-50">Unique Identifier</div>
                                <div className="font-mono text-[10px] opacity-40 truncate">{localSettings.id}</div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={async () => {
                                        if (window.confirm('WARNING: This will permanently delete all your practice history, statistics, and progress. You will start over as a Beginner. Your account and subscription will remain active. PROCEED?')) {
                                            try {
                                                const { apiFetch } = await import('../utils/api');
                                                await apiFetch(`/api/profile/${user?.id}/purge`, {
                                                    method: 'DELETE'
                                                });
                                                alert('Data purged successfully. Restarting session...');
                                                window.location.reload();
                                            } catch (error) {
                                                console.error('Purge failed:', error);
                                                alert('Failed to purge account data.');
                                            }
                                        }
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                                >
                                    Purge Account Data...
                                </button>
                            </div>
                        </div>
                    </Section>
                </div>
            </div >
        </PageTransition >
    );
};

export default Settings;
