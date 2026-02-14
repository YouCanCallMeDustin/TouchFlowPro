import { create } from 'zustand';
import { TrainingDayItem } from '../../../shared/trainingPlan';

interface LaunchState {
    pendingLaunch: {
        source: 'trainingPlan';
        planId: string; // plan ID or day ID really
        planItemId: string;
        mode: string;
        recommendedSeconds: number;
        launch: TrainingDayItem['launch'];
        title: string;
    } | null;
    setPendingLaunch: (launch: LaunchState['pendingLaunch']) => void;
    clearPendingLaunch: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
    pendingLaunch: null,
    setPendingLaunch: (launch) => set({ pendingLaunch: launch }),
    clearPendingLaunch: () => set({ pendingLaunch: null })
}));
