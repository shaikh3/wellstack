import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property, Unit } from '@/lib/types';
import { demoProperties } from '@/lib/mock/data';

interface PortfolioState {
  properties: Property[];
  selectedPropertyId: string | null;
  isLoading: boolean;
  
  // Actions
  setProperties: (properties: Property[]) => void;
  selectProperty: (propertyId: string | null) => void;
  updateProperty: (propertyId: string, updates: Partial<Property>) => void;
  resetDemo: () => void;
  
  // Getters
  getSelectedProperty: () => Property | null;
  getTotalUnits: () => number;
  getTotalOccupied: () => number;
  getTotalVacant: () => number;
  getTotalTurn: () => number;
  getAverageDeviceHealth: () => number;
  getTotalAlerts: () => number;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      properties: demoProperties,
      selectedPropertyId: null,
      isLoading: false,
      
      setProperties: (properties) => set({ properties }),
      
      selectProperty: (propertyId) => set({ selectedPropertyId: propertyId }),
      
      updateProperty: (propertyId, updates) => {
        const { properties } = get();
        const updatedProperties = properties.map(p =>
          p.id === propertyId ? { ...p, ...updates } : p
        );
        set({ properties: updatedProperties });
      },
      
      resetDemo: () => {
        set({ 
          properties: demoProperties,
          selectedPropertyId: null,
        });
      },
      
      getSelectedProperty: () => {
        const { properties, selectedPropertyId } = get();
        if (!selectedPropertyId) return null;
        return properties.find(p => p.id === selectedPropertyId) || null;
      },
      
      getTotalUnits: () => {
        return get().properties.reduce((sum, p) => sum + p.unitCount, 0);
      },
      
      getTotalOccupied: () => {
        return get().properties.reduce((sum, p) => sum + p.occupiedCount, 0);
      },
      
      getTotalVacant: () => {
        return get().properties.reduce((sum, p) => sum + p.vacantCount, 0);
      },
      
      getTotalTurn: () => {
        return get().properties.reduce((sum, p) => sum + p.turnCount, 0);
      },
      
      getAverageDeviceHealth: () => {
        const { properties } = get();
        if (properties.length === 0) return 0;
        return Math.round(
          properties.reduce((sum, p) => sum + p.deviceHealth, 0) / properties.length
        );
      },
      
      getTotalAlerts: () => {
        // This will be connected to alert store
        return 12;
      },
    }),
    {
      name: 'wellstack-portfolio-storage',
    }
  )
);
