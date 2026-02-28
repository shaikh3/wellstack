import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alert, AlertSeverity } from '@/lib/types';
import { demoAlerts } from '@/lib/mock/data';

interface AlertState {
  alerts: Alert[];
  filter: AlertSeverity | 'all';
  isLoading: boolean;
  
  // Actions
  setAlerts: (alerts: Alert[]) => void;
  setFilter: (filter: AlertSeverity | 'all') => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  createWorkOrder: (alertId: string) => string;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => Alert;
  resetDemo: () => void;
  
  // Getters
  getFilteredAlerts: () => Alert[];
  getActiveAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];
  getWarningAlerts: () => Alert[];
  getAlertCount: () => number;
  getAlertCountBySeverity: (severity: AlertSeverity) => number;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: demoAlerts,
      filter: 'all',
      isLoading: false,
      
      setAlerts: (alerts) => set({ alerts }),
      
      setFilter: (filter) => set({ filter }),
      
      acknowledgeAlert: (alertId) => {
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { ...a, acknowledgedAt: new Date() } : a
        );
        set({ alerts: updatedAlerts });
      },
      
      resolveAlert: (alertId) => {
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { ...a, resolvedAt: new Date() } : a
        );
        set({ alerts: updatedAlerts });
      },
      
      createWorkOrder: (alertId) => {
        const workOrderId = `#${Math.floor(Math.random() * 9000 + 1000)}`;
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { ...a, workOrderId } : a
        );
        set({ alerts: updatedAlerts });
        return workOrderId;
      },
      
      addAlert: (alertData) => {
        const newAlert: Alert = {
          ...alertData,
          id: `alert-${Date.now()}`,
          createdAt: new Date(),
        };
        set(state => ({
          alerts: [newAlert, ...state.alerts],
        }));
        return newAlert;
      },
      
      resetDemo: () => {
        set({ 
          alerts: demoAlerts,
          filter: 'all',
        });
      },
      
      getFilteredAlerts: () => {
        const { alerts, filter } = get();
        if (filter === 'all') return alerts;
        return alerts.filter(a => a.severity === filter);
      },
      
      getActiveAlerts: () => {
        return get().alerts.filter(a => !a.resolvedAt);
      },
      
      getCriticalAlerts: () => {
        return get().alerts.filter(
          a => a.severity === 'critical' && !a.resolvedAt
        );
      },
      
      getWarningAlerts: () => {
        return get().alerts.filter(
          a => a.severity === 'warning' && !a.resolvedAt
        );
      },
      
      getAlertCount: () => {
        return get().alerts.filter(a => !a.resolvedAt).length;
      },
      
      getAlertCountBySeverity: (severity) => {
        return get().alerts.filter(
          a => a.severity === severity && !a.resolvedAt
        ).length;
      },
    }),
    {
      name: 'wellstack-alerts-storage',
    }
  )
);
