import { create } from 'zustand';

interface LaunchState {
    pendingLaunch: {
        source: string;
        mode: string;
        title?: string;
        launch: {
            kind: string;
            promptText?: string;
            drillId?: string;
        };
        planItemId?: string;
        recommendedSeconds?: number;
    } | null;
    setPendingLaunch: (launch: any) => void;
    clearPendingLaunch: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
    pendingLaunch: null,
    setPendingLaunch: (launch) => set({ pendingLaunch: launch }),
    clearPendingLaunch: () => set({ pendingLaunch: null }),
}));
