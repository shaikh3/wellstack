// WellStack P1 + P2 + P3 - TypeScript Types

// Re-export wellness types from P2
export type {
  IEQReading,
  IEQStats,
  IEQStatus,
  WellnessScore,
  FallRiskFactors,
  FallRiskProfile,
  FallActivityEntry,
  FallDetectionStatus,
  SleepEnvironment,
  InterventionStatus,
  AlertThreshold,
  InterventionConfig,
  IEQHistoryPoint,
} from './wellness';

// Re-export P3 alert types
export type {
  // Alert
  AlertType,
  AlertSeverity,
  AlertStatus,
  Alert as AlertP3,
  AlertTriggerContext,
  
  // Escalation Workflow
  WorkflowStatus,
  StepAction,
  StepChannel,
  StepStatus,
  RecipientType,
  EscalationWorkflow,
  EscalationStep,
  
  // Workflow Template
  WorkflowCategory,
  WorkflowTemplate,
  WorkflowTemplateStep,
  
  // Alert Rule
  TriggerSource,
  TriggerCondition,
  AlertRule,
  PropertyRuleOverride,
  
  // RPM Enrollment
  RPMStatus,
  RPMDeviceType,
  RPMDeviceStatus,
  ReadingFrequency,
  RPMEnrollment,
  RPMCompliance,
  MonthlyCompliance,
  RPMDevice,
  RPMReading,
  
  // Audit Log
  AuditAction,
  ActorType,
  TargetType,
  PHIType,
  AuditLog,
  
  // Incident Report
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  IncidentReport,
  
  // Timeline
  TimelineEntryType,
  TimelineEntry,
  
  // Property Config
  PropertyAlertConfig,
  
  // Filter & Stats
  AlertFilter,
  AlertDashboardStats,
  RuleTestResult,
} from './alerts';

// Import for use in this file
import type { IEQStatus, WellnessScore, FallRiskProfile, SleepEnvironment, InterventionConfig } from './wellness';
import type { AlertP3 } from './alerts';

// Organization
export interface Portfolio {
  id: string;
  name: string;
  properties: Property[];
}

export interface Property {
  id: string;
  name: string;
  address: string;
  unitCount: number;
  occupiedCount: number;
  vacantCount: number;
  turnCount: number;
  deviceHealth: number;
  buildings: Building[];
  pmsSyncStatus: 'synced' | 'syncing' | 'error';
  lastSyncAt: Date;
}

export interface Building {
  id: string;
  propertyId: string;
  name: string;
  floors: number;
  units: Unit[];
}

// Residents
export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  leaseStart: Date;
  leaseEnd: Date;
  accessCode: string;
}

// Devices
export type DeviceType = 'lock' | 'thermostat' | 'leak_sensor' | 'motion_sensor' | 'contact_sensor';

export interface Device {
  id: string;
  unitId: string;
  name: string;
  type: DeviceType;
  status: 'online' | 'offline' | 'warning';
  batteryLevel?: number;
  lastSeenAt: Date;
  state: DeviceState;
}

export type DeviceState = 
  | { type: 'lock'; locked: boolean; lastUsedAt: Date }
  | { type: 'thermostat'; temperature: number; targetTemp: number; mode: 'heat' | 'cool' | 'auto' | 'off' }
  | { type: 'leak_sensor'; wet: boolean; location: string }
  | { type: 'motion_sensor'; motionDetected: boolean; lastMotionAt: Date }
  | { type: 'contact_sensor'; open: boolean };

// Unit
export type UnitStatus = 'occupied' | 'vacant' | 'turn';

export interface Unit {
  id: string;
  buildingId: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  status: UnitStatus;
  resident?: Resident;
  devices: Device[];
  // P2 Wellness Intelligence Fields
  ieqStatus?: IEQStatus;
  wellnessScore?: WellnessScore;
  fallRiskProfile?: FallRiskProfile;
  sleepEnvironment?: SleepEnvironment;
  interventionConfig?: InterventionConfig;
  // P3-P4 Extension Fields (deprecated, use above)
  fallRisk?: 'low' | 'medium' | 'high';
  interventionStatus?: 'standby' | 'active';
  communityScore?: number;
}

// Access
export type AccessCodeType = 'resident' | 'vendor' | 'tour';

export interface AccessCode {
  id: string;
  unitId: string;
  code: string;
  type: AccessCodeType;
  label?: string;
  expiresAt?: Date;
  createdAt: Date;
  usedCount: number;
  lastUsedAt?: Date;
}

export interface AccessLogEntry {
  id: string;
  unitId: string;
  deviceId: string;
  timestamp: Date;
  actor: string;
  action: 'lock' | 'unlock';
  method: 'pin' | 'app' | 'remote';
}

// Legacy Alert (P1) - Extended by P3 AlertP3
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  propertyId: string;
  unitId: string;
  deviceId?: string;
  severity: AlertSeverity;
  type: string;
  title: string;
  description: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  workOrderId?: string;
  
  // P3 extension fields (optional for backward compatibility)
  residentId?: string;
  status?: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  source?: string;
  sourceId?: string;
  assignedTo?: string;
  assignedRole?: string;
  assignedToName?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolution?: string;
  resolutionNotes?: string;
  workflowId?: string;
  incidentId?: string;
  tags?: string[];
}

// Activity Log
export interface ActivityLogEntry {
  id: string;
  unitId: string;
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
}
