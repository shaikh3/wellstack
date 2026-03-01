// WellStack P2 - Wellness Intelligence Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  IEQStatus,
  WellnessScore,
  FallDetectionStatus,
  SleepEnvironment,
  IEQHistoryPoint,
} from '@/lib/types/wellness';
import {
  getWellnessDataForUnit,
  calculateIEQScore,
  generateIEQHistory,
} from '@/lib/mock/wellnessData';
import { delays } from '@/lib/mock/delays';

interface WellnessState {
  // Data by unit ID
  ieqData: Record<string, IEQStatus>;
  wellnessScores: Record<string, WellnessScore>;
  fallDetectionStatus: Record<string, FallDetectionStatus>;
  sleepEnvironments: Record<string, SleepEnvironment>;
  ieqHistory: Record<string, IEQHistoryPoint[]>;
  
  // Loading states
  isLoadingIEQ: boolean;
  isLoadingScore: boolean;
  isLoadingFallRisk: boolean;
  isLoadingSleepEnv: boolean;
  
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  // Actions
  fetchIEQData: (unitId: string) => Promise<void>;
  fetchWellnessScore: (unitId: string) => Promise<void>;
  fetchFallDetection: (unitId: string) => Promise<void>;
  fetchSleepEnvironment: (unitId: string) => Promise<void>;
  refreshAllWellnessData: (unitId: string) => Promise<void>;
  
  // Getters
  getIEQData: (unitId: string) => IEQStatus | undefined;
  getWellnessScore: (unitId: string) => WellnessScore | undefined;
  getFallDetection: (unitId: string) => FallDetectionStatus | undefined;
  getSleepEnvironment: (unitId: string) => SleepEnvironment | undefined;
  getIEQHistory: (unitId: string) => IEQHistoryPoint[];
  calculateIEQScore: (unitId: string) => number;
}

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      // Initial state
      ieqData: {},
      wellnessScores: {},
      fallDetectionStatus: {},
      sleepEnvironments: {},
      ieqHistory: {},
      
      isLoadingIEQ: false,
      isLoadingScore: false,
      isLoadingFallRisk: false,
      isLoadingSleepEnv: false,
      
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      // Fetch IEQ data for a unit
      fetchIEQData: async (unitId: string) => {
        set({ isLoadingIEQ: true });
        await delays.standard();
        
        const data = getWellnessDataForUnit(unitId);
        const history = generateIEQHistory();
        
        set((state) => ({
          ieqData: { ...state.ieqData, [unitId]: data.ieq },
          ieqHistory: { ...state.ieqHistory, [unitId]: history },
          isLoadingIEQ: false,
        }));
      },
      
      // Fetch wellness score for a unit
      fetchWellnessScore: async (unitId: string) => {
        set({ isLoadingScore: true });
        await delays.standard();
        
        const data = getWellnessDataForUnit(unitId);
        
        set((state) => ({
          wellnessScores: { ...state.wellnessScores, [unitId]: data.wellnessScore },
          isLoadingScore: false,
        }));
      },
      
      // Fetch fall detection status for a unit
      fetchFallDetection: async (unitId: string) => {
        set({ isLoadingFallRisk: true });
        await delays.standard();
        
        const data = getWellnessDataForUnit(unitId);
        
        set((state) => ({
          fallDetectionStatus: { ...state.fallDetectionStatus, [unitId]: data.fallDetection },
          isLoadingFallRisk: false,
        }));
      },
      
      // Fetch sleep environment for a unit
      fetchSleepEnvironment: async (unitId: string) => {
        set({ isLoadingSleepEnv: true });
        await delays.standard();
        
        const data = getWellnessDataForUnit(unitId);
        
        set((state) => ({
          sleepEnvironments: { ...state.sleepEnvironments, [unitId]: data.sleepEnvironment },
          isLoadingSleepEnv: false,
        }));
      },
      
      // Refresh all wellness data for a unit
      refreshAllWellnessData: async (unitId: string) => {
        const { 
          fetchIEQData, 
          fetchWellnessScore, 
          fetchFallDetection, 
          fetchSleepEnvironment 
        } = get();
        
        await Promise.all([
          fetchIEQData(unitId),
          fetchWellnessScore(unitId),
          fetchFallDetection(unitId),
          fetchSleepEnvironment(unitId),
        ]);
      },
      
      // Getters
      getIEQData: (unitId: string) => {
        return get().ieqData[unitId];
      },
      
      getWellnessScore: (unitId: string) => {
        return get().wellnessScores[unitId];
      },
      
      getFallDetection: (unitId: string) => {
        return get().fallDetectionStatus[unitId];
      },
      
      getSleepEnvironment: (unitId: string) => {
        return get().sleepEnvironments[unitId];
      },
      
      getIEQHistory: (unitId: string) => {
        return get().ieqHistory[unitId] || [];
      },
      
      calculateIEQScore: (unitId: string) => {
        const ieq = get().ieqData[unitId];
        if (!ieq) return 0;
        return calculateIEQScore(ieq);
      },
    }),
    {
      name: 'wellstack-wellness-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
