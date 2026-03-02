/**
 * WellStack P3: Intervention & Trust - Alert Types
 * 
 * Data models for alerts, escalation workflows, RPM enrollment,
 * and compliance features.
 */

// ============================================================================
// ALERT
// ============================================================================

export type AlertType = 'wellness' | 'safety' | 'ieq' | 'device';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;                    // UUID v4
  unitId: string;                // Reference to unit
  residentId?: string;           // Optional resident reference
  propertyId: string;
  type: AlertType;
  severity: AlertSeverity;
  source: string;                // Which P2 signal triggered (e.g., "wellness_score", "fall_detected")
  sourceId?: string;             // Reference to triggering entity
  title: string;
  description: string;
  status: AlertStatus;
  
  // Assignment
  assignedTo?: string;           // User ID
  assignedRole?: string;         // Role (e.g., "care_manager", "maintenance")
  assignedToName?: string;       // Display name for assigned user
  
  // Timestamps
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;       // User ID
  acknowledgedByName?: string;   // Display name
  resolvedAt?: Date;
  resolvedBy?: string;           // User ID
  resolvedByName?: string;       // Display name
  
  // Resolution
  resolution?: string;           // How was it resolved
  resolutionNotes?: string;
  
  // Duplication tracking
  duplicateOf?: string;          // Alert ID this is a duplicate of
  duplicateCount?: number;       // Number of duplicates grouped
  
  // Related entities
  workflowId?: string;           // Associated escalation workflow
  incidentId?: string;           // Associated incident report
  workOrderId?: string;          // Associated work order
  
  // Metadata
  tags?: string[];
  
  // Trigger context (from P2)
  triggerContext?: AlertTriggerContext;
}

export interface AlertTriggerContext {
  source: string;
  sourceData: Record<string, unknown>;  // Original P2 signal data
  threshold?: number;
  actualValue?: number;
  previousValue?: number;
  location?: string;
  confidence?: number;
}

// ============================================================================
// ESCALATION WORKFLOW
// ============================================================================

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'escalated' | 'cancelled';
export type StepAction = 'notify' | 'call' | 'dispatch' | 'page' | 'escalate';
export type StepChannel = 'sms' | 'email' | 'push' | 'phone' | 'pager';
export type StepStatus = 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'skipped';
export type RecipientType = 'user' | 'role' | 'group' | 'external' | 'assigned';

export interface EscalationWorkflow {
  id: string;
  alertId: string;
  ruleId: string;                // Which rule triggered this workflow
  templateId: string;            // Workflow template ID
  steps: EscalationStep[];
  currentStep: number;           // 0-indexed, -1 if not started
  status: WorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface EscalationStep {
  order: number;                 // 0-indexed sequence
  action: StepAction;
  channel: StepChannel;
  recipientType: RecipientType;
  recipient: string;             // User ID, role name, or phone/email
  recipientName: string;         // Display name
  recipientContact?: string;     // Contact info (phone/email)
  
  // SLA
  slaMinutes: number;            // Time allowed for this step
  slaDeadline?: Date;            // Calculated deadline
  
  // Execution
  status: StepStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  acknowledgedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  
  // Content
  messageTemplate: string;
  messageSent?: string;          // Actual message content sent
  
  // Conditions
  executeIf?: 'always' | 'unacknowledged' | 'unresolved';
  delayMinutes?: number;         // Wait time before executing
}

// ============================================================================
// WORKFLOW TEMPLATE
// ============================================================================

export type WorkflowCategory = 'wellness' | 'safety' | 'ieq' | 'device' | 'emergency';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  steps: WorkflowTemplateStep[];
  
  // Global SLA
  totalSlaMinutes?: number;
  
  // Behavior
  autoStart: boolean;            // Start immediately on alert
  allowManualStart: boolean;     // Allow manual trigger
  allowCancellation: boolean;
  
  // Property defaults
  defaultRecipients?: {
    roles?: string[];
    users?: string[];
    externalNumbers?: string[];
  };
}

export interface WorkflowTemplateStep {
  order: number;
  action: StepAction;
  channel: StepChannel;
  
  // Recipient selection
  recipientType: RecipientType;
  recipientValue: string;        // Role name, user ID, group ID, or phone/email
  recipientName: string;
  
  // Timing
  slaMinutes: number;
  delayMinutes?: number;         // Wait time before executing
  
  // Conditions
  executeIf?: 'always' | 'unacknowledged' | 'unresolved';
  
  // Content
  messageTemplate: string;
  includeAlertDetails: boolean;
  includeActionLink: boolean;
}

// ============================================================================
// ALERT RULE
// ============================================================================

export type TriggerSource = 'wellness_score' | 'fall_detected' | 'ieq_violation' | 'device_offline' | 'custom';
export type TriggerCondition = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'changed' | 'event';

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  
  // Trigger conditions
  trigger: {
    source: TriggerSource;
    condition: TriggerCondition;
    threshold?: number;          // For numeric comparisons
    duration?: number;           // Duration in minutes condition must persist
    property?: string;           // Specific IEQ property (co2, pm25, etc.)
    countThreshold?: number;     // For count-based triggers (e.g., 3+ violations)
    timeWindow?: number;         // Minutes for count threshold (e.g., 24h = 1440)
  };
  
  // Alert properties
  severity: AlertSeverity;
  titleTemplate: string;         // "{{unitName}}: Wellness Score {{score}}"
  descriptionTemplate: string;
  
  // Escalation workflow
  workflowTemplateId: string;
  
  // Filters
  unitTypes?: string[];          // Apply only to these unit types
  residentTypes?: string[];      // Apply only to these resident types
  
  // Schedule
  activeHours?: {
    start: string;               // "08:00"
    end: string;                 // "22:00"
    timezone: string;
  };
  daysOfWeek?: number[];         // 0 = Sunday, 6 = Saturday
  
  // Property-level configuration
  propertyOverrides?: Record<string, PropertyRuleOverride>;
  
  // Status
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyRuleOverride {
  threshold?: number;
  severity?: AlertSeverity;
  disabled?: boolean;
  workflowTemplateId?: string;
}

// ============================================================================
// RPM ENROLLMENT (Remote Patient Monitoring)
// ============================================================================

export type RPMStatus = 'pending' | 'enrolled' | 'suspended' | 'disenrolled';
export type RPMDeviceType = 'bp_cuff' | 'scale' | 'glucometer' | 'pulse_ox' | 'thermometer';
export type RPMDeviceStatus = 'active' | 'inactive' | 'lost' | 'returned';
export type ReadingFrequency = 'daily' | 'twice_daily' | 'weekly';

export interface RPMEnrollment {
  id: string;
  residentId: string;
  unitId: string;
  status: RPMStatus;
  
  // Enrollment tracking
  enrollmentDate: Date;
  enrollmentSubmittedBy: string;
  enrollmentSubmittedByName?: string;
  
  // Resident info (denormalized for display)
  residentName?: string;
  unitNumber?: string;
  propertyId?: string;
  propertyName?: string;
  
  // Billing
  billingCode: string;           // CPT code (e.g., "99457", "99458")
  billingCodeDescription?: string;
  billingProvider?: string;
  
  // Device assignment
  devices: RPMDevice[];
  
  // Compliance (CMS 16-day rule)
  compliance: RPMCompliance;
  
  // Reading requirements
  requiredMetrics: string[];     // bp, weight, glucose, etc.
  readingFrequency: ReadingFrequency;
  
  // Disenrollment
  disenrollmentDate?: Date;
  disenrollmentReason?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface RPMCompliance {
  currentMonth: number;          // Days with readings this month
  requiredDays: number;          // Always 16
  lastReadingAt?: Date;
  consecutiveDays: number;       // Streak of daily readings
  complianceRate: number;        // Percentage (0-100)
  monthlyHistory?: MonthlyCompliance[];
}

export interface MonthlyCompliance {
  month: string;                 // "2024-02"
  daysRecorded: number;
  requiredDays: number;
  compliant: boolean;
}

export interface RPMDevice {
  id: string;
  type: RPMDeviceType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assignedAt: Date;
  status: RPMDeviceStatus;
  lastReadingAt?: Date;
}

export interface RPMReading {
  id: string;
  enrollmentId: string;
  deviceId: string;
  residentId: string;
  timestamp: Date;
  metricType: string;
  value: number;
  unit: string;
  
  // Out of range handling
  isOutOfRange: boolean;
  normalRange?: { min: number; max: number };
  alertGenerated?: boolean;
  
  // Sync
  syncedToEHR: boolean;
  syncedAt?: Date;
}

// ============================================================================
// AUDIT LOG (HIPAA Compliance)
// ============================================================================

export type AuditAction = 
  | 'alert_created' 
  | 'alert_acknowledged' 
  | 'alert_resolved' 
  | 'alert_dismissed' 
  | 'workflow_started' 
  | 'workflow_step_completed' 
  | 'workflow_cancelled'
  | 'rule_triggered' 
  | 'rpm_reading_recorded' 
  | 'rpm_enrollment_changed'
  | 'user_login' 
  | 'user_action' 
  | 'config_changed';

export type ActorType = 'user' | 'system' | 'integration';
export type TargetType = 'alert' | 'workflow' | 'rule' | 'resident' | 'unit' | 'rpm_enrollment';
export type PHIType = 'demographic' | 'health' | 'billing' | 'care_plan';

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: AuditAction;
  
  actor: {
    type: ActorType;
    id?: string;
    name?: string;
    ip?: string;
  };
  
  target: {
    type: TargetType;
    id: string;
    name?: string;
  };
  
  details: Record<string, unknown>;  // Context-specific details
  
  // HIPAA fields
  phiAccessed: boolean;
  phiType?: PHIType;
  justification?: string;        // Required if phiAccessed
  
  // Tamper evidence
  hash: string;                  // Integrity hash
  previousHash?: string;         // Chain for tamper detection
}

// ============================================================================
// INCIDENT REPORT
// ============================================================================

export type IncidentType = 'fall' | 'medical' | 'safety' | 'ieq' | 'device' | 'other';
export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'near_miss';
export type IncidentStatus = 'open' | 'under_review' | 'closed' | 'escalated';

export interface IncidentReport {
  id: string;
  alertId: string;
  incidentNumber: string;        // e.g., "INC-2024-001234"
  
  // Classification
  type: IncidentType;
  severity: IncidentSeverity;
  
  // Timeline
  occurredAt: Date;
  reportedAt: Date;
  resolvedAt?: Date;
  
  // Details
  summary: string;
  description: string;
  immediateActions: string[];
  
  // Investigation
  rootCause?: string;
  contributingFactors?: string[];
  
  // Resolution
  resolution?: string;
  preventiveActions?: string[];
  
  // Sign-off
  reportedBy: string;
  reportedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  
  // Attachments
  attachments?: string[];        // File URLs
  
  // Status
  status: IncidentStatus;
}

// ============================================================================
// TIMELINE
// ============================================================================

export type TimelineEntryType = 
  | 'alert_created' 
  | 'notification_sent' 
  | 'notification_delivered' 
  | 'acknowledged' 
  | 'assigned' 
  | 'note_added' 
  | 'step_completed' 
  | 'escalated' 
  | 'resolved' 
  | 'workflow_started'
  | 'workflow_cancelled'
  | 'workflow_completed'
  | 'incident_created';

export interface TimelineEntry {
  id: string;
  timestamp: Date;
  type: TimelineEntryType;
  actor: {
    type: ActorType;
    name: string;
    id?: string;
  };
  description: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// PROPERTY ALERT CONFIGURATION
// ============================================================================

export interface PropertyAlertConfig {
  propertyId: string;
  
  // Threshold adjustments
  thresholds: {
    wellnessWarning?: number;    // Default: 70
    wellnessCritical?: number;   // Default: 50
    co2Warning?: number;         // Default: 1000
    deviceOfflineWarning?: number;  // Default: 60 (minutes)
    deviceOfflineCritical?: number; // Default: 240 (minutes)
  };
  
  // Recipient assignment
  recipients: {
    careManager?: string[];      // User IDs
    maintenance?: string[];
    it?: string[];
    emergency?: string[];
  };
  
  // SLA customization
  slaMultipliers: {
    warning?: number;            // 1.0 = default
    critical?: number;
    emergency?: number;
  };
  
  // Quiet hours (reduced notification urgency)
  quietHours?: {
    enabled: boolean;
    start: string;               // "22:00"
    end: string;                 // "07:00"
    timezone: string;
    behavior: 'queue' | 'reduce' | 'ignore_non_critical';
  };
  
  // Duplicate suppression
  duplicateSuppression: {
    enabled: boolean;
    windowMinutes: number;       // Group similar alerts within this window
    maxDuplicates: number;       // Max alerts to create before auto-resolve
  };
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface AlertFilter {
  severity?: AlertSeverity[];
  type?: AlertType[];
  status?: AlertStatus[];
  unitId?: string;
  propertyId?: string;
  assignedTo?: string;
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
}

export interface AlertDashboardStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  open: number;
  acknowledged: number;
  avgResponseTimeMinutes?: number;
}

// ============================================================================
// TEST RESULT
// ============================================================================

export interface RuleTestResult {
  triggered: boolean;
  alert?: Partial<Alert>;
  workflow?: Partial<EscalationWorkflow>;
  executionTime: number;
  logs: string[];
}
