import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Unit, Device, DeviceState, Resident } from '@/lib/types';
import { getAllUnits, demoUnit2B } from '@/lib/mock/data';

interface UnitState {
  units: Unit[];
  selectedUnitId: string | null;
  isLoading: boolean;
  
  // Actions
  setUnits: (units: Unit[]) => void;
  selectUnit: (unitId: string | null) => void;
  updateUnit: (unitId: string, updates: Partial<Unit>) => void;
  updateDevice: (unitId: string, deviceId: string, updates: Partial<Device>) => void;
  updateDeviceState: (unitId: string, deviceId: string, state: DeviceState) => void;
  addAccessCode: (unitId: string, code: string, type: 'vendor' | 'tour', label?: string, expiresAt?: Date) => void;
  resetDemo: () => void;
  
  // Getters
  getSelectedUnit: () => Unit | null;
  getUnitById: (unitId: string) => Unit | undefined;
  getUnitsByProperty: (propertyId: string) => Unit[];
  getUnitsByStatus: (propertyId: string, status: Unit['status']) => Unit[];
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set, get) => ({
      units: getAllUnits(),
      selectedUnitId: null,
      isLoading: false,
      
      setUnits: (units) => set({ units }),
      
      selectUnit: (unitId) => set({ selectedUnitId: unitId }),
      
      updateUnit: (unitId, updates) => {
        const { units } = get();
        const updatedUnits = units.map(u =>
          u.id === unitId ? { ...u, ...updates } : u
        );
        set({ units: updatedUnits });
      },
      
      updateDevice: (unitId, deviceId, updates) => {
        const { units } = get();
        const updatedUnits = units.map(u => {
          if (u.id !== unitId) return u;
          const updatedDevices = u.devices.map(d =>
            d.id === deviceId ? { ...d, ...updates } : d
          );
          return { ...u, devices: updatedDevices };
        });
        set({ units: updatedUnits });
      },
      
      updateDeviceState: (unitId, deviceId, state) => {
        const { units } = get();
        const updatedUnits = units.map(u => {
          if (u.id !== unitId) return u;
          const updatedDevices = u.devices.map(d =>
            d.id === deviceId ? { ...d, state } : d
          );
          return { ...u, devices: updatedDevices };
        });
        set({ units: updatedUnits });
      },
      
      addAccessCode: (unitId, code, type, label, expiresAt) => {
        // Access codes are managed in accessStore
        // This is just a placeholder for unit-level access code tracking
      },
      
      resetDemo: () => {
        set({ 
          units: getAllUnits(),
          selectedUnitId: null,
        });
      },
      
      getSelectedUnit: () => {
        const { units, selectedUnitId } = get();
        if (!selectedUnitId) return null;
        return units.find(u => u.id === selectedUnitId) || null;
      },
      
      getUnitById: (unitId) => {
        return get().units.find(u => u.id === unitId);
      },
      
      getUnitsByProperty: (propertyId) => {
        return get().units.filter(u => u.propertyId === propertyId);
      },
      
      getUnitsByStatus: (propertyId, status) => {
        return get().units.filter(
          u => u.propertyId === propertyId && u.status === status
        );
      },
    }),
    {
      name: 'wellstack-units-storage',
    }
  )
);
