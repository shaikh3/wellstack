import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccessCode, AccessLogEntry, AccessCodeType } from '@/lib/types';
import { demoAccessCodes, demoActivityLog } from '@/lib/mock/data';

interface AccessState {
  accessCodes: AccessCode[];
  accessLog: AccessLogEntry[];
  isLoading: boolean;
  
  // Actions
  setAccessCodes: (codes: AccessCode[]) => void;
  generateVendorCode: (unitId: string, label: string, expiresAt: Date) => AccessCode;
  generateTourCode: (unitId: string, prospectName: string, expiresAt: Date) => AccessCode;
  revokeCode: (codeId: string) => void;
  addAccessLogEntry: (entry: Omit<AccessLogEntry, 'id' | 'timestamp'>) => void;
  resetDemo: () => void;
  
  // Getters
  getCodesByUnit: (unitId: string) => AccessCode[];
  getCodesByType: (unitId: string, type: AccessCodeType) => AccessCode[];
  getActiveVendorCodes: (unitId: string) => AccessCode[];
  getLogByUnit: (unitId: string) => AccessLogEntry[];
}

export const useAccessStore = create<AccessState>()(
  persist(
    (set, get) => ({
      accessCodes: demoAccessCodes,
      accessLog: [],
      isLoading: false,
      
      setAccessCodes: (codes) => set({ accessCodes: codes }),
      
      generateVendorCode: (unitId, label, expiresAt) => {
        const code = `${Math.floor(Math.random() * 9000 + 1000)}`;
        const newCode: AccessCode = {
          id: `code-${Date.now()}`,
          unitId,
          code,
          type: 'vendor',
          label,
          expiresAt,
          createdAt: new Date(),
          usedCount: 0,
        };
        set(state => ({
          accessCodes: [...state.accessCodes, newCode],
        }));
        return newCode;
      },
      
      generateTourCode: (unitId, prospectName, expiresAt) => {
        const code = `${Math.floor(Math.random() * 9000 + 1000)}`;
        const newCode: AccessCode = {
          id: `code-${Date.now()}`,
          unitId,
          code,
          type: 'tour',
          label: prospectName,
          expiresAt,
          createdAt: new Date(),
          usedCount: 0,
        };
        set(state => ({
          accessCodes: [...state.accessCodes, newCode],
        }));
        return newCode;
      },
      
      revokeCode: (codeId) => {
        const { accessCodes } = get();
        set({
          accessCodes: accessCodes.filter(c => c.id !== codeId),
        });
      },
      
      addAccessLogEntry: (entryData) => {
        const newEntry: AccessLogEntry = {
          ...entryData,
          id: `log-${Date.now()}`,
          timestamp: new Date(),
        };
        set(state => ({
          accessLog: [newEntry, ...state.accessLog],
        }));
      },
      
      resetDemo: () => {
        set({ 
          accessCodes: demoAccessCodes,
          accessLog: [],
        });
      },
      
      getCodesByUnit: (unitId) => {
        return get().accessCodes.filter(c => c.unitId === unitId);
      },
      
      getCodesByType: (unitId, type) => {
        return get().accessCodes.filter(
          c => c.unitId === unitId && c.type === type
        );
      },
      
      getActiveVendorCodes: (unitId) => {
        return get().accessCodes.filter(
          c =>
            c.unitId === unitId &&
            c.type === 'vendor' &&
            (!c.expiresAt || c.expiresAt > new Date())
        );
      },
      
      getLogByUnit: (unitId) => {
        return get().accessLog.filter(l => l.unitId === unitId);
      },
    }),
    {
      name: 'wellstack-access-storage',
    }
  )
);
