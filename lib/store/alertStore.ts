import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alert, AlertSeverity, AlertStatus, EscalationWorkflow, RPMEnrollment, WorkflowTemplate, AlertRule } from '@/lib/types/alerts';
import { demoAlerts, demoWorkflows, demoRPMEnrollments, demoWorkflowTemplates, demoAlertRules } from '@/lib/mock/alerts';

interface AlertState {
  alerts: Alert[];
  workflows: EscalationWorkflow[];
  rpmEnrollments: RPMEnrollment[];
  workflowTemplates: WorkflowTemplate[];
  alertRules: AlertRule[];
  filter: AlertSeverity | 'all';
  isLoading: boolean;
  
  // Actions - Alerts
  setAlerts: (alerts: Alert[]) => void;
  setFilter: (filter: AlertSeverity | 'all') => void;
  acknowledgeAlert: (alertId: string, userId?: string, userName?: string) => void;
  resolveAlert: (alertId: string, userId?: string, userName?: string, resolution?: string, notes?: string) => void;
  dismissAlert: (alertId: string, reason: string) => void;
  assignAlert: (alertId: string, assignTo: string, assignToName: string, role?: string) => void;
  createWorkOrder: (alertId: string) => string;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => Alert;
  
  // Actions - Workflows
  startWorkflow: (alertId: string, templateId: string) => EscalationWorkflow | null;
  completeWorkflowStep: (workflowId: string, stepOrder: number, notes?: string) => void;
  skipWorkflowStep: (workflowId: string, stepOrder: number, reason: string) => void;
  cancelWorkflow: (workflowId: string, reason: string, cancelledBy?: string) => void;
  
  // Actions - RPM
  updateRPMCompliance: (enrollmentId: string, daysRecorded: number) => void;
  
  // Reset
  resetDemo: () => void;
  
  // Getters
  getFilteredAlerts: () => Alert[];
  getActiveAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];
  getWarningAlerts: () => Alert[];
  getAlertCount: () => number;
  getAlertCountBySeverity: (severity: AlertSeverity) => number;
  getAlertById: (alertId: string) => Alert | undefined;
  getWorkflowById: (workflowId: string) => EscalationWorkflow | undefined;
  getWorkflowByAlertId: (alertId: string) => EscalationWorkflow | undefined;
  getRPMEnrollmentById: (enrollmentId: string) => RPMEnrollment | undefined;
  getRPMEnrollmentByResidentId: (residentId: string) => RPMEnrollment | undefined;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: demoAlerts,
      workflows: demoWorkflows,
      rpmEnrollments: demoRPMEnrollments,
      workflowTemplates: demoWorkflowTemplates,
      alertRules: demoAlertRules,
      filter: 'all',
      isLoading: false,
      
      setAlerts: (alerts) => set({ alerts }),
      
      setFilter: (filter) => set({ filter }),
      
      acknowledgeAlert: (alertId, userId, userName) => {
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { 
            ...a, 
            status: 'acknowledged' as AlertStatus,
            acknowledgedAt: new Date(),
            acknowledgedBy: userId,
            acknowledgedByName: userName,
          } : a
        );
        set({ alerts: updatedAlerts });
      },
      
      resolveAlert: (alertId, userId, userName, resolution, notes) => {
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { 
            ...a, 
            status: 'resolved' as AlertStatus,
            resolvedAt: new Date(),
            resolvedBy: userId,
            resolvedByName: userName,
            resolution,
            resolutionNotes: notes,
          } : a
        );
        set({ alerts: updatedAlerts });
      },
      
      dismissAlert: (alertId, reason) => {
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { 
            ...a, 
            status: 'dismissed' as AlertStatus,
            resolvedAt: new Date(),
            resolution: reason,
          } : a
        );
        set({ alerts: updatedAlerts });
      },
      
      assignAlert: (alertId, assignTo, assignToName, role) => {
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { 
            ...a, 
            assignedTo: assignTo,
            assignedToName: assignToName,
            assignedRole: role,
          } : a
        );
        set({ alerts: updatedAlerts });
      },
      
      createWorkOrder: (alertId) => {
        const workOrderId = `WO-${Math.floor(Math.random() * 90000 + 10000)}`;
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
      
      startWorkflow: (alertId, templateId) => {
        const { workflowTemplates, workflows } = get();
        const template = workflowTemplates.find(t => t.id === templateId);
        if (!template) return null;
        
        const newWorkflow: EscalationWorkflow = {
          id: `wf-${Date.now()}`,
          alertId,
          ruleId: 'manual',
          templateId,
          steps: template.steps.map((step, index) => ({
            order: index,
            action: step.action,
            channel: step.channel,
            recipientType: step.recipientType,
            recipient: step.recipientValue,
            recipientName: step.recipientName,
            slaMinutes: step.slaMinutes,
            delayMinutes: step.delayMinutes,
            status: index === 0 ? 'pending' : 'pending',
            messageTemplate: step.messageTemplate,
            executeIf: step.executeIf,
          })),
          currentStep: 0,
          status: 'in_progress',
          startedAt: new Date(),
        };
        
        set({ workflows: [...workflows, newWorkflow] });
        
        // Update alert with workflow ID
        const { alerts } = get();
        const updatedAlerts = alerts.map(a =>
          a.id === alertId ? { ...a, workflowId: newWorkflow.id } : a
        );
        set({ alerts: updatedAlerts });
        
        return newWorkflow;
      },
      
      completeWorkflowStep: (workflowId, stepOrder, notes) => {
        const { workflows } = get();
        const updatedWorkflows = workflows.map(w => {
          if (w.id !== workflowId) return w;
          
          const updatedSteps = w.steps.map(s =>
            s.order === stepOrder ? { 
              ...s, 
              status: 'acknowledged' as const,
              acknowledgedAt: new Date(),
            } : s
          );
          
          // Move to next step if available
          const nextStep = stepOrder + 1;
          const isLastStep = nextStep >= w.steps.length;
          
          if (isLastStep) {
            return {
              ...w,
              steps: updatedSteps,
              currentStep: nextStep,
              status: 'completed' as const,
              completedAt: new Date(),
            };
          }
          
          return {
            ...w,
            steps: updatedSteps,
            currentStep: nextStep,
          };
        });
        
        set({ workflows: updatedWorkflows });
      },
      
      skipWorkflowStep: (workflowId, stepOrder, reason) => {
        const { workflows } = get();
        const updatedWorkflows = workflows.map(w => {
          if (w.id !== workflowId) return w;
          
          const updatedSteps = w.steps.map(s =>
            s.order === stepOrder ? { 
              ...s, 
              status: 'skipped' as const,
              failureReason: reason,
            } : s
          );
          
          return {
            ...w,
            steps: updatedSteps,
            currentStep: stepOrder + 1,
          };
        });
        
        set({ workflows: updatedWorkflows });
      },
      
      cancelWorkflow: (workflowId, reason, cancelledBy) => {
        const { workflows } = get();
        const updatedWorkflows = workflows.map(w =>
          w.id === workflowId ? {
            ...w,
            status: 'cancelled' as const,
            cancelledAt: new Date(),
            cancelledBy,
            cancellationReason: reason,
          } : w
        );
        
        set({ workflows: updatedWorkflows });
      },
      
      updateRPMCompliance: (enrollmentId, daysRecorded) => {
        const { rpmEnrollments } = get();
        const updatedEnrollments = rpmEnrollments.map(e => {
          if (e.id !== enrollmentId) return e;
          
          const complianceRate = Math.round((daysRecorded / e.compliance.requiredDays) * 100);
          
          return {
            ...e,
            compliance: {
              ...e.compliance,
              currentMonth: daysRecorded,
              complianceRate,
              lastReadingAt: new Date(),
            },
          };
        });
        
        set({ rpmEnrollments: updatedEnrollments });
      },
      
      resetDemo: () => {
        set({ 
          alerts: demoAlerts,
          workflows: demoWorkflows,
          rpmEnrollments: demoRPMEnrollments,
          workflowTemplates: demoWorkflowTemplates,
          alertRules: demoAlertRules,
          filter: 'all',
        });
      },
      
      getFilteredAlerts: () => {
        const { alerts, filter } = get();
        if (filter === 'all') return alerts;
        return alerts.filter(a => a.severity === filter);
      },
      
      getActiveAlerts: () => {
        return get().alerts.filter(a => a.status !== 'resolved' && a.status !== 'dismissed');
      },
      
      getCriticalAlerts: () => {
        return get().alerts.filter(
          a => a.severity === 'critical' && a.status !== 'resolved' && a.status !== 'dismissed'
        );
      },
      
      getWarningAlerts: () => {
        return get().alerts.filter(
          a => a.severity === 'warning' && a.status !== 'resolved' && a.status !== 'dismissed'
        );
      },
      
      getAlertCount: () => {
        return get().alerts.filter(a => a.status !== 'resolved' && a.status !== 'dismissed').length;
      },
      
      getAlertCountBySeverity: (severity) => {
        return get().alerts.filter(
          a => a.severity === severity && a.status !== 'resolved' && a.status !== 'dismissed'
        ).length;
      },
      
      getAlertById: (alertId) => {
        return get().alerts.find(a => a.id === alertId);
      },
      
      getWorkflowById: (workflowId) => {
        return get().workflows.find(w => w.id === workflowId);
      },
      
      getWorkflowByAlertId: (alertId) => {
        return get().workflows.find(w => w.alertId === alertId);
      },
      
      getRPMEnrollmentById: (enrollmentId) => {
        return get().rpmEnrollments.find(e => e.id === enrollmentId);
      },
      
      getRPMEnrollmentByResidentId: (residentId) => {
        return get().rpmEnrollments.find(e => e.residentId === residentId);
      },
    }),
    {
      name: 'wellstack-alerts-storage-v2',
    }
  )
);
