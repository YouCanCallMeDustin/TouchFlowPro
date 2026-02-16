import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from './AuthContext';
import { soundManager } from '../utils/soundManager';

export interface UserSettings {
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

interface SettingsContextType {
    settings: UserSettings | null;
    loading: boolean;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<boolean>;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        if (!user) {
            setSettings(null);
            setLoading(false);
            return;
        }

        try {
            const data = await apiFetch<UserSettings>('/api/me/settings');
            setSettings(data);

            // Sync side effects
            if (data && typeof data.soundEnabled === 'boolean') {
                soundManager.setEnabled(data.soundEnabled);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        if (!user || !settings) return false;

        const updated = { ...settings, ...newSettings };

        // Optimistic update
        setSettings(updated);

        // Sync side effects immediately for responsiveness
        if (typeof newSettings.soundEnabled === 'boolean') {
            soundManager.setEnabled(newSettings.soundEnabled);
        }

        try {
            const response = await apiFetch('/api/me/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (response.ok) {
                return true;
            } else {
                // Rollback on failure
                refreshSettings();
                return false;
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            refreshSettings();
            return false;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
