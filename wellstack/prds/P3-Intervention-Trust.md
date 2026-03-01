# WellStack P3: Intervention & Trust — Technical Specification

**Version:** 1.0  
**Status:** Ready for Build  
**Depends on:** P2 Wellness Intelligence (complete)  
**Research Source:** Notion Pipeline DB (P3: Intervention & Trust research items)

---

## 1. Overview

P3 Intervention & Trust transforms wellness signals from P2 into action workflows. It closes the loop between sensing and response, ensuring that detected anomalies trigger appropriate human intervention through intelligent alerting, escalation, and compliance tracking.

**Core Principle:** Data without action is wasted insight. P3 ensures every wellness signal has a defined response path, SLA, and audit trail.

**Key Capabilities:**
- **Alert Management:** Central triage for all wellness, safety, IEQ, and device alerts
- **Escalation Workflows:** Automated, multi-step response protocols with SLA tracking
- **RPM Enrollment:** Remote Patient Monitoring compliance and billing integration
- **Compliance:** HIPAA audit logging, WELL certification evidence, incident documentation

---

## 2. Data Model

### 2.1 Alert

```typescript
interface Alert {
  id: string;                    // UUID v4
  unitId: string;                // Reference to unit
  residentId?: string;           // Optional resident reference
  type: 'wellness' | 'safety' | 'ieq' | 'device';
  severity: 'critical' | 'warning' | 'info';
  source: string;                // Which P2 signal triggered (e.g., "wellness_score", "fall_detected")
  sourceId?: string;             // Reference to triggering entity
  title: string;
  description: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  
  // Assignment
  assignedTo?: string;           // User ID
  assignedRole?: string;         // Role (e.g., "care_manager", "maintenance")
  
  // Timestamps
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;       // User ID
  resolvedAt?: Date;
  resolvedBy?: string;           // User ID
  
  // Resolution
  resolution?: string;           // How was it resolved
  resolutionNotes?: string;
  
  // Duplication tracking
  duplicateOf?: string;          // Alert ID this is a duplicate of
  duplicateCount?: number;       // Number of duplicates grouped
  
  // Metadata
  tags?: string[];
  propertyId: string;
}
```

### 2.2 EscalationWorkflow

```typescript
interface EscalationWorkflow {
  id: string;
  alertId: string;
  ruleId: string;                // Which rule triggered this workflow
  steps: EscalationStep[];
  currentStep: number;           // 0-indexed, -1 if not started
  status: 'pending' | 'in_progress' | 'completed' | 'escalated' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

interface EscalationStep {
  order: number;                 // 0-indexed sequence
  action: 'notify' | 'call' | 'dispatch' | 'page' | 'escalate';
  channel: 'sms' | 'email' | 'push' | 'phone' | 'pager';
  recipientType: 'user' | 'role' | 'group' | 'external';
  recipient: string;             // User ID, role name, or phone/email
  recipientName: string;         // Display name
  
  // SLA
  slaMinutes: number;            // Time allowed for this step
  slaDeadline?: Date;            // Calculated deadline
  
  // Execution
  status: 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'skipped';
  sentAt?: Date;
  deliveredAt?: Date;
  acknowledgedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  
  // Content
  messageTemplate: string;
  messageSent?: string;          // Actual message content sent
}
```

### 2.3 AlertRule

```typescript
interface AlertRule {
  id: string;
  name: string;
  description?: string;
  
  // Trigger conditions
  trigger: {
    source: 'wellness_score' | 'fall_detected' | 'ieq_violation' | 'device_offline' | 'custom';
    condition: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'changed' | 'event';
    threshold?: number;          // For numeric comparisons
    duration?: number;           // Duration in minutes condition must persist
    property?: string;           // Specific IEQ property (co2, pm25, etc.)
    countThreshold?: number;     // For count-based triggers (e.g., 3+ violations)
    timeWindow?: number;         // Minutes for count threshold (e.g., 24h = 1440)
  };
  
  // Alert properties
  severity: 'critical' | 'warning' | 'info';
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
  propertyOverrides?: Record<string, {
    threshold?: number;
    severity?: 'critical' | 'warning' | 'info';
    disabled?: boolean;
    workflowTemplateId?: string;
  }>;
  
  // Status
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 WorkflowTemplate

```typescript
interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'wellness' | 'safety' | 'ieq' | 'device' | 'emergency';
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

interface WorkflowTemplateStep {
  order: number;
  action: 'notify' | 'call' | 'dispatch' | 'page' | 'escalate';
  channel: 'sms' | 'email' | 'push' | 'phone' | 'pager';
  
  // Recipient selection
  recipientType: 'assigned' | 'role' | 'user' | 'group' | 'external';
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
```

### 2.5 RPMEnrollment

```typescript
interface RPMEnrollment {
  id: string;
  residentId: string;
  unitId: string;
  status: 'pending' | 'enrolled' | 'suspended' | 'disenrolled';
  
  // Enrollment tracking
  enrollmentDate: Date;
  enrollmentSubmittedBy: string;
  
  // Billing
  billingCode: string;           // CPT code (e.g., "99457", "99458")
  billingProvider?: string;
  
  // Device assignment
  devices: RPMDevice[];
  
  // Compliance (CMS 16-day rule)
  compliance: {
    currentMonth: number;        // Days with readings this month
    requiredDays: number;        // Always 16
    lastReadingAt?: Date;
    consecutiveDays: number;     // Streak of daily readings
    complianceRate: number;      // Percentage
  };
  
  // Reading requirements
  requiredMetrics: string[];     // bp, weight, glucose, etc.
  readingFrequency: 'daily' | 'twice_daily' | 'weekly';
  
  // Disenrollment
  disenrollmentDate?: Date;
  disenrollmentReason?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

interface RPMDevice {
  id: string;
  type: 'bp_cuff' | 'scale' | 'glucometer' | 'pulse_ox' | 'thermometer';
  manufacturer: string;
  model: string;
  serialNumber: string;
  assignedAt: Date;
  status: 'active' | 'inactive' | 'lost' | 'returned';
}

interface RPMReading {
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
```

### 2.6 AuditLog

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  action: 'alert_created' | 'alert_acknowledged' | 'alert_resolved' | 'alert_dismissed' | 
          'workflow_started' | 'workflow_step_completed' | 'workflow_cancelled' |
          'rule_triggered' | 'rpm_reading_recorded' | 'rpm_enrollment_changed' |
          'user_login' | 'user_action' | 'config_changed';
  
  actor: {
    type: 'user' | 'system' | 'integration';
    id?: string;
    name?: string;
    ip?: string;
  };
  
  target: {
    type: 'alert' | 'workflow' | 'rule' | 'resident' | 'unit' | 'rpm_enrollment';
    id: string;
  };
  
  details: Record<string, any>;  // Context-specific details
  
  // HIPAA fields
  phiAccessed: boolean;
  phiType?: 'demographic' | 'health' | 'billing' | 'care_plan';
  justification?: string;        // Required if phiAccessed
  
  // Tamper evidence
  hash: string;                  // Integrity hash
  previousHash?: string;         // Chain for tamper detection
}
```

### 2.7 IncidentReport

```typescript
interface IncidentReport {
  id: string;
  alertId: string;
  incidentNumber: string;        // e.g., "INC-2024-001234"
  
  // Classification
  type: 'fall' | 'medical' | 'safety' | 'ieq' | 'device' | 'other';
  severity: 'critical' | 'major' | 'minor' | 'near_miss';
  
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
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Attachments
  attachments?: string[];        // File URLs
  
  // Status
  status: 'open' | 'under_review' | 'closed' | 'escalated';
}
```

---

## 3. Component Specifications

### 3.1 AlertDashboard

**Purpose:** Central triage hub for all alerts across properties.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ALERTS                                          [+ New Alert] [Export]  │
├─────────────────────────────────────────────────────────────────────────┤
│ [🔴 Critical 3]  [🟡 Warning 12]  [🔵 Info 8]  [Filter ▼]  [Search...]  │
├─────────────────────────────────────────────────────────────────────────┤
│ ◻  Severity    Type      Unit        Title              Time    Status  │
│ ─────────────────────────────────────────────────────────────────────── │
│ ◻  🔴 Critical Safety    Unit 3A    Fall Detected       2m ago  Open    │
│ ◻  🔴 Critical Wellness  Unit 2B    Wellness Score 45   15m ago Ack'd   │
│ ◻  🟡 Warning  IEQ       Unit 1C    CO2 Level High      1h ago  Open    │
│ ◻  🟡 Warning  Device    Unit 4D    Hub Offline         2h ago  Open    │
│ ...                                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ [Ack Selected]  [Assign To ▼]  [Export Selected]        Page 1 of 3    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface AlertDashboardProps {
  // Data
  alerts: Alert[];
  workflows: Record<string, EscalationWorkflow>;  // Map alertId -> workflow
  
  // Filters
  defaultFilters?: {
    severity?: ('critical' | 'warning' | 'info')[];
    type?: ('wellness' | 'safety' | 'ieq' | 'device')[];
    status?: ('open' | 'acknowledged' | 'resolved')[];
    unitId?: string;
    dateRange?: { start: Date; end: Date };
  };
  
  // Actions
  onAcknowledge: (alertIds: string[]) => void;
  onAssign: (alertIds: string[], assignTo: string) => void;
  onResolve: (alertId: string, resolution: string) => void;
  onViewDetail: (alertId: string) => void;
  onExport: (alertIds: string[]) => void;
  
  // Real-time
  autoRefresh?: boolean;
  refreshInterval?: number;      // seconds
  
  // Permissions
  canAcknowledge: boolean;
  canAssign: boolean;
  canResolve: boolean;
}
```

**Features:**
- Severity/type/status badges with color coding
- Bulk actions (acknowledge, assign, export)
- Real-time indicators (new alerts pulse, auto-refresh)
- Sortable columns
- Filter presets ("My Alerts", "Critical Unacknowledged", "Today's Alerts")
- Search across title, description, unit

---

### 3.2 AlertDetail

**Purpose:** Single alert view with full context, timeline, and action controls.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Alerts     INC-2024-001245                    [Actions ▼]    │
├─────────────────────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL: Fall Detected                                   2m ago    │
│ Unit 3A • Resident: John Miller                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────────────────────────────────────────┐   │
│ │ CONTEXT     │  │ TIMELINE                                        │   │
│ │             │  │                                                 │   │
│ │ Fall event  │  │ 🔴 2:34 PM  Alert triggered by radar sensor    │   │
│ │ detected    │  │ 🟡 2:35 PM  SMS sent to on-call nurse          │   │
│ │ in bedroom  │  │ ⚪ 2:37 PM  Nurse acknowledged (via SMS)       │   │
│ │ at 2:34 PM  │  │ ⏳ 2:42 PM  ETA: Unit check due                 │   │
│ │           │  │                                                 │   │
│ │ Location:   │  │ [View Full Workflow]                            │   │
│ │ Bedroom     │  │                                                 │   │
│ │             │  ├─────────────────────────────────────────────────┤   │
│ │ [View       │  │ NOTES                                           │   │
│ │  Footage]   │  │                                                 │   │
│ │             │  │ Alice Chen (Nurse): En route, 5 min away        │   │
│ │             │  │ [Add Note...]                                   │   │
│ └─────────────┘  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│ [Acknowledge]  [Assign To]  [Escalate]  [Create Work Order]  [Resolve] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface AlertDetailProps {
  alert: Alert;
  workflow?: EscalationWorkflow;
  unit?: Unit;
  resident?: Resident;
  
  // Context data from P2
  triggerContext?: {
    source: string;
    sourceData: any;              // Original P2 signal data
    threshold?: number;
    actualValue?: number;
  };
  
  // Timeline entries
  timeline: TimelineEntry[];
  
  // Actions
  onAcknowledge: () => void;
  onAssign: (userId: string) => void;
  onEscalate: (reason: string) => void;
  onResolve: (resolution: string, notes?: string) => void;
  onDismiss: (reason: string) => void;
  onAddNote: (note: string) => void;
  onCreateWorkOrder: () => void;
  onViewWorkflow: () => void;
  
  // Permissions
  permissions: {
    canAcknowledge: boolean;
    canAssign: boolean;
    canEscalate: boolean;
    canResolve: boolean;
    canDismiss: boolean;
  };
}

interface TimelineEntry {
  id: string;
  timestamp: Date;
  type: 'alert_created' | 'notification_sent' | 'notification_delivered' | 
        'acknowledged' | 'assigned' | 'note_added' | 'step_completed' | 
        'escalated' | 'resolved' | 'workflow_started';
  actor: {
    type: 'user' | 'system' | 'integration';
    name: string;
  };
  description: string;
  metadata?: Record<string, any>;
}
```

**Features:**
- Full trigger context (what P2 signal, what value, what threshold)
- Visual timeline of all actions
- Escalation workflow progress indicator
- Notes/communication thread
- Quick actions bar
- Related alerts sidebar

---

### 3.3 EscalationWorkflow

**Purpose:** Visual workflow executor with step progress and manual controls.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ESCALATION WORKFLOW                                          [Cancel]  │
│ Fall Response Protocol - Step 2 of 4                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ✅ NOTIFY ON-CALL        ⏳ UNIT CHECK          ○ SUPERVISOR          │
│      SMS sent 2:34 PM        Due: 2:44 PM (5m)      Standby             │
│      Acknowledged 2:35 PM                                             │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────    │
│                                                                         │
│   CURRENT STEP: Unit Check                                              │
│   Assigned to: Alice Chen (RN)                                          │
│   SLA: 4 minutes remaining                                              │
│   [▓▓▓▓▓▓▓▓░░░░░░░░] 60%                                              │
│                                                                         │
│   [Mark Complete]  [Reassign]  [Skip Step]  [Escalate Now]              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ WORKFLOW HISTORY                                                        │
│ 2:35 PM  Alice Chen acknowledged via SMS reply                         │
│ 2:34 PM  SMS notification delivered to +1-555-0199                     │
│ 2:34 PM  Workflow started automatically                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface EscalationWorkflowProps {
  workflow: EscalationWorkflow;
  alert: Alert;
  
  // Step details
  steps: (EscalationStep & {
    recipientName: string;
    recipientContact?: string;
    timeRemaining?: number;      // Seconds (for current step)
    isOverdue: boolean;
  })[];
  
  // Actions
  onCompleteStep: (stepOrder: number, notes?: string) => void;
  onSkipStep: (stepOrder: number, reason: string) => void;
  onReassign: (stepOrder: number, newRecipient: string) => void;
  onEscalateNow: (reason: string) => void;
  onCancelWorkflow: (reason: string) => void;
  onRestartWorkflow: () => void;
  
  // Permissions
  canModify: boolean;
  canCancel: boolean;
}
```

**Features:**
- Visual stepper with progress indicators
- SLA countdown timers with color change (green → yellow → red)
- Step status badges (pending, active, completed, failed, skipped)
- Manual override options (skip, reassign, force escalate)
- History log with timestamps
- Real-time updates

---

### 3.4 RPMEnrollment

**Purpose:** Remote Patient Monitoring enrollment wizard and compliance dashboard.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ RPM ENROLLMENT                                          [+ New] [Export]│
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌───────────────────────────────────────────────┐  │
│ │ RESIDENT        │  │ COMPLIANCE DASHBOARD                          │  │
│ │                 │  │                                               │  │
│ │ Margaret Chen   │  │ Current Month: 18 of 16 days ✓                │  │
│ │ Unit 2B         │  │ Compliance Rate: 100%                         │  │
│ │                 │  │ Consecutive Days: 45                          │  │
│ │ Status:         │  │                                               │  │
│ │ 🟢 Enrolled     │  │ Last Reading: Today 8:32 AM                   │  │
│ │                 │  │                                               │  │
│ │ Billing Code:   │  │ 📊 Monthly Progress                           │  │
│ │ 99457           │  │ [████████████████████░░░░░░░░░░] 67%          │  │
│ │                 │  │                                               │  │
│ │ [Edit] [Suspend]│  │ Next Reading Due: Tomorrow 9:00 AM            │  │
│ └─────────────────┘  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ DEVICES                                                                 │
│ Type          Manufacturer   Model        Serial      Status            │
│ ─────────────────────────────────────────────────────────────────────── │
│ BP Cuff       Omron          HEM-7280T   SN123456    🟢 Active          │
│ Scale         Withings       Body+       SN789012    🟢 Active          │
│                                                                         │
│ [Assign Device]  [Replace Device]  [Record Manual Reading]              │
├─────────────────────────────────────────────────────────────────────────┤
│ READING HISTORY                                                         │
│ Date        Time      Type       Value       Status      Synced         │
│ ─────────────────────────────────────────────────────────────────────── │
│ 2/28/2024   8:32 AM  BP          128/82      Normal      ✓ EHR          │
│ 2/28/2024   8:33 AM  Weight      142.5 lbs   Normal      ✓ EHR          │
│ ...                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface RPMEnrollmentProps {
  enrollment: RPMEnrollment;
  resident: Resident;
  
  // Compliance data
  complianceHistory: {
    month: string;
    daysRecorded: number;
    requiredDays: number;
    compliant: boolean;
  }[];
  
  // Recent readings
  recentReadings: RPMReading[];
  
  // Devices
  devices: RPMDevice[];
  availableDevices: RPMDevice[];  // Unassigned devices for swap
  
  // Actions
  onSuspend: (reason: string) => void;
  onDisenroll: (reason: string) => void;
  onAssignDevice: (device: RPMDevice) => void;
  onReplaceDevice: (oldDeviceId: string, newDevice: RPMDevice) => void;
  onRecordManualReading: (reading: Partial<RPMReading>) => void;
  onSyncToEHR: (readingIds: string[]) => void;
  onExportBilling: (month: string) => void;
}

// Wizard component for new enrollment
interface RPMEnrollmentWizardProps {
  resident: Resident;
  availableDevices: RPMDevice[];
  billingCodes: { code: string; description: string }[];
  
  onComplete: (enrollment: Partial<RPMEnrollment>) => void;
  onCancel: () => void;
}
```

**Features:**
- Step-by-step enrollment wizard
- CMS 16-day compliance tracking with visual indicators
- Device assignment and management
- Manual reading entry for paper logs
- EHR sync status
- Billing code selection with CPT descriptions
- Monthly compliance reports

---

### 3.5 AlertRulesEngine

**Purpose:** Configuration interface for alert rules and thresholds.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ALERT RULES                                    [+ New Rule] [Import]    │
├─────────────────────────────────────────────────────────────────────────┤
│ Rule                          Type       Severity  Status    Actions    │
│ ─────────────────────────────────────────────────────────────────────── │
│ Wellness Score < 70           Wellness   Warning   🟢 Active  [Edit]    │
│ Wellness Score < 50           Wellness   Critical  🟢 Active  [Edit]    │
│ Fall Detected                 Safety     Critical  🟢 Active  [Edit]    │
│ CO2 > 1000ppm                 IEQ        Warning   🟢 Active  [Edit]    │
│ 3+ IEQ Violations (24h)       IEQ        Critical  🟢 Active  [Edit]    │
│ Device Offline > 1hr          Device     Warning   🟢 Active  [Edit]    │
│ Device Offline > 4hr          Device     Critical  🟢 Active  [Edit]    │
│                                                                         │
│ PROPERTY OVERRIDES                                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Sunset Gardens                                                      │ │
│ │ • Wellness Score < 60 (instead of 70) - Property preference         │ │
│ │ • CO2 > 900ppm (instead of 1000) - WELL Gold target                 │ │
│ │ • Quiet Hours: 10 PM - 6 AM (reduced alert noise)                   │ │
│ │ [Edit Overrides]                                                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface AlertRulesEngineProps {
  rules: AlertRule[];
  properties: Property[];
  workflowTemplates: WorkflowTemplate[];
  
  // Property-specific overrides
  propertyOverrides: Record<string, {
    ruleId: string;
    threshold?: number;
    severity?: 'critical' | 'warning' | 'info';
    disabled?: boolean;
    workflowTemplateId?: string;
  }[]>;
  
  // Actions
  onCreateRule: (rule: Partial<AlertRule>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<AlertRule>) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onUpdatePropertyOverride: (propertyId: string, ruleId: string, 
                            override: Partial<PropertyOverride>) => void;
  
  // Test mode
  onTestRule: (ruleId: string, testData: any) => Promise<TestResult>;
}

interface TestResult {
  triggered: boolean;
  alert?: Partial<Alert>;
  workflow?: Partial<EscalationWorkflow>;
  executionTime: number;
}
```

---

## 4. Alert Rules Engine

### 4.1 Default Rules

| Rule ID | Name | Trigger | Severity | Default Workflow |
|---------|------|---------|----------|------------------|
| `wellness-warning` | Wellness Score Low | `wellness_score < 70` | Warning | `notify-care-team` |
| `wellness-critical` | Wellness Score Critical | `wellness_score < 50` | Critical | `escalate-immediately` |
| `fall-detected` | Fall Detected | `fall_detected event` | Critical | `emergency-dispatch` |
| `ieq-co2-warning` | CO2 Elevated | `co2 > 1000 ppm` | Warning | `notify-maintenance` |
| `ieq-multi-violation` | Multiple IEQ Violations | `3+ violations in 24h` | Critical | `notify-manager` |
| `device-offline-warning` | Device Offline | `offline > 1 hour` | Warning | `notify-it` |
| `device-offline-critical` | Device Offline Extended | `offline > 4 hours` | Critical | `notify-manager` |

### 4.2 Rule Details

#### wellness-warning
```typescript
{
  id: 'wellness-warning',
  name: 'Wellness Score Low',
  trigger: {
    source: 'wellness_score',
    condition: 'lt',
    threshold: 70,
    duration: 0  // Immediate
  },
  severity: 'warning',
  titleTemplate: '{{unitName}}: Wellness Score {{actualValue}}',
  descriptionTemplate: 'Wellness score for {{residentName}} has dropped to {{actualValue}}. Review recommended.',
  workflowTemplateId: 'notify-care-team'
}
```

#### wellness-critical
```typescript
{
  id: 'wellness-critical',
  name: 'Wellness Score Critical',
  trigger: {
    source: 'wellness_score',
    condition: 'lt',
    threshold: 50,
    duration: 0
  },
  severity: 'critical',
  titleTemplate: '{{unitName}}: CRITICAL Wellness Score {{actualValue}}',
  descriptionTemplate: 'Critical wellness alert for {{residentName}}. Score: {{actualValue}}. Immediate attention required.',
  workflowTemplateId: 'escalate-immediately'
}
```

#### fall-detected
```typescript
{
  id: 'fall-detected',
  name: 'Fall Detected',
  trigger: {
    source: 'fall_detected',
    condition: 'event',
    duration: 0
  },
  severity: 'critical',
  titleTemplate: '{{unitName}}: FALL DETECTED',
  descriptionTemplate: 'Fall detected in {{location}} for {{residentName}} at {{timestamp}}.',
  workflowTemplateId: 'emergency-dispatch'
}
```

#### ieq-co2-warning
```typescript
{
  id: 'ieq-co2-warning',
  name: 'CO2 Elevated',
  trigger: {
    source: 'ieq_violation',
    condition: 'gt',
    threshold: 1000,
    property: 'co2',
    duration: 10  // 10 minutes sustained
  },
  severity: 'warning',
  titleTemplate: '{{unitName}}: CO2 Level High',
  descriptionTemplate: 'CO2 level in {{unitName}} is {{actualValue}} ppm (threshold: {{threshold}}).',
  workflowTemplateId: 'notify-maintenance'
}
```

#### ieq-multi-violation
```typescript
{
  id: 'ieq-multi-violation',
  name: 'Multiple IEQ Violations',
  trigger: {
    source: 'ieq_violation',
    condition: 'event',
    countThreshold: 3,
    timeWindow: 1440  // 24 hours
  },
  severity: 'critical',
  titleTemplate: '{{unitName}}: Multiple IEQ Violations',
  descriptionTemplate: '{{count}} IEQ violations in {{unitName}} within 24 hours.',
  workflowTemplateId: 'notify-manager'
}
```

#### device-offline-warning
```typescript
{
  id: 'device-offline-warning',
  name: 'Device Offline',
  trigger: {
    source: 'device_offline',
    condition: 'event',
    duration: 60  // 1 hour
  },
  severity: 'warning',
  titleTemplate: '{{unitName}}: Device Offline - {{deviceName}}',
  descriptionTemplate: '{{deviceName}} has been offline for over 1 hour.',
  workflowTemplateId: 'notify-it'
}
```

#### device-offline-critical
```typescript
{
  id: 'device-offline-critical',
  name: 'Device Offline Extended',
  trigger: {
    source: 'device_offline',
    condition: 'event',
    duration: 240  // 4 hours
  },
  severity: 'critical',
  titleTemplate: '{{unitName}}: CRITICAL Device Offline - {{deviceName}}',
  descriptionTemplate: '{{deviceName}} has been offline for over 4 hours. Immediate attention required.',
  workflowTemplateId: 'notify-manager'
}
```

### 4.3 Workflow Templates

#### notify-care-team
```typescript
{
  id: 'notify-care-team',
  name: 'Notify Care Team',
  category: 'wellness',
  autoStart: true,
  steps: [
    {
      order: 0,
      action: 'notify',
      channel: 'push',
      recipientType: 'role',
      recipientValue: 'care_manager',
      recipientName: 'Care Manager',
      slaMinutes: 30,
      executeIf: 'always',
      messageTemplate: 'Wellness alert for {{residentName}} in {{unitName}}. Score: {{score}}.',
      includeAlertDetails: true,
      includeActionLink: true
    },
    {
      order: 1,
      action: 'notify',
      channel: 'email',
      recipientType: 'role',
      recipientValue: 'care_team',
      recipientName: 'Care Team',
      slaMinutes: 60,
      delayMinutes: 15,
      executeIf: 'unacknowledged',
      messageTemplate: 'Wellness alert for {{residentName}} remains unacknowledged after 15 minutes.',
      includeAlertDetails: true,
      includeActionLink: true
    }
  ]
}
```

#### escalate-immediately
```typescript
{
  id: 'escalate-immediately',
  name: 'Immediate Escalation',
  category: 'emergency',
  autoStart: true,
  steps: [
    {
      order: 0,
      action: 'notify',
      channel: 'push',
      recipientType: 'role',
      recipientValue: 'care_manager',
      recipientName: 'Care Manager',
      slaMinutes: 5,
      executeIf: 'always',
      messageTemplate: 'CRITICAL: {{residentName}} wellness score {{score}}. Immediate attention required.',
      includeAlertDetails: true,
      includeActionLink: true
    },
    {
      order: 1,
      action: 'call',
      channel: 'phone',
      recipientType: 'role',
      recipientValue: 'on_call_nurse',
      recipientName: 'On-Call Nurse',
      slaMinutes: 10,
      executeIf: 'unacknowledged',
      messageTemplate: 'Critical wellness alert for {{residentName}}. Please respond.',
      includeAlertDetails: false,
      includeActionLink: false
    },
    {
      order: 2,
      action: 'escalate',
      channel: 'pager',
      recipientType: 'role',
      recipientValue: 'clinical_director',
      recipientName: 'Clinical Director',
      slaMinutes: 15,
      executeIf: 'unacknowledged',
      messageTemplate: 'Unacknowledged critical alert for {{residentName}}.',
      includeAlertDetails: true,
      includeActionLink: true
    }
  ]
}
```

#### emergency-dispatch
```typescript
{
  id: 'emergency-dispatch',
  name: 'Emergency Dispatch',
  category: 'emergency',
  autoStart: true,
  steps: [
    {
      order: 0,
      action: 'dispatch',
      channel: 'push',
      recipientType: 'role',
      recipientValue: 'emergency_responder',
      recipientName: 'Emergency Responder',
      slaMinutes: 3,
      executeIf: 'always',
      messageTemplate: 'FALL DETECTED: {{residentName}} in {{unitName}}, {{location}}.',
      includeAlertDetails: true,
      includeActionLink: true
    },
    {
      order: 1,
      action: 'call',
      channel: 'phone',
      recipientType: 'role',
      recipientValue: 'on_call_nurse',
      recipientName: 'On-Call Nurse',
      slaMinutes: 5,
      executeIf: 'always',
      messageTemplate: 'Fall detected for {{residentName}}. Please respond immediately.',
      includeAlertDetails: false,
      includeActionLink: false
    },
    {
      order: 2,
      action: 'notify',
      channel: 'sms',
      recipientType: 'external',
      recipientValue: '{{emergencyContact}}',
      recipientName: 'Emergency Contact',
      slaMinutes: 10,
      executeIf: 'always',
      messageTemplate: 'Alert: {{residentName}} may need assistance. {{propertyName}} has been notified.',
      includeAlertDetails: false,
      includeActionLink: false
    }
  ]
}
```

### 4.4 Configurable Per Property

```typescript
interface PropertyAlertConfig {
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
```

---

## 5. Integration Points

### 5.1 P2 Wellness Data (Triggers)

```typescript
// Event: wellness_score_calculated
interface WellnessScoreEvent {
  type: 'wellness_score_calculated';
  unitId: string;
  residentId: string;
  score: number;
  previousScore: number;
  timestamp: Date;
  components: WellnessScore['components'];
}

// Event: ieq_violation
interface IEQViolationEvent {
  type: 'ieq_violation';
  unitId: string;
  property: string;              // 'co2', 'pm25', 'voc', etc.
  value: number;
  threshold: number;
  severity: 'warning' | 'violation';
  timestamp: Date;
}

// Event: fall_detected
interface FallDetectedEvent {
  type: 'fall_detected';
  unitId: string;
  residentId: string;
  location: string;
  confidence: number;
  timestamp: Date;
  sensorData: any;
}
```

### 5.2 P1 Device Status (Triggers)

```typescript
// Event: device_offline
interface DeviceOfflineEvent {
  type: 'device_offline';
  deviceId: string;
  unitId: string;
  deviceType: string;
  offlineSince: Date;
  timestamp: Date;
}

// Event: device_back_online
interface DeviceOnlineEvent {
  type: 'device_back_online';
  deviceId: string;
  unitId: string;
  offlineDuration: number;       // seconds
  timestamp: Date;
}
```

### 5.3 SMS/Email Gateway (Actions)

```typescript
interface NotificationGateway {
  sendSMS: (to: string, message: string, alertId?: string) => Promise<{
    messageId: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
  
  sendEmail: (to: string, subject: string, body: string, alertId?: string) => Promise<{
    messageId: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
  
  makeCall: (to: string, message: string, alertId?: string) => Promise<{
    callId: string;
    status: 'initiated' | 'connected' | 'failed' | 'voicemail';
    duration?: number;
  }>;
}
```

### 5.4 PMS Work Orders (Actions)

```typescript
interface WorkOrderIntegration {
  createWorkOrder: (alert: Alert, type: string) => Promise<{
    workOrderId: string;
    status: 'created';
    url: string;
  }>;
  
  linkToAlert: (workOrderId: string, alertId: string) => Promise<void>;
  
  getWorkOrderStatus: (workOrderId: string) => Promise<{
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    assignedTo?: string;
    estimatedCompletion?: Date;
  }>;
}
```

### 5.5 EHR Systems (Future)

```typescript
interface EHRIntegration {
  syncRPMReading: (reading: RPMReading) => Promise<{
    synced: boolean;
    ehrRecordId?: string;
    error?: string;
  }>;
  
  createIncidentNote: (incident: IncidentReport) => Promise<{
    created: boolean;
    noteId?: string;
  }>;
}
```

---

## 6. Compliance Features

### 6.1 HIPAA Audit Logging

```typescript
// Audit trail for all PHI access
interface HIPAAAuditConfig {
  // Automatically log these actions
  autoLogActions: ('read' | 'create' | 'update' | 'delete')[];
  
  // Require justification for PHI access
  requireJustification: boolean;
  
  // Retention
  retentionYears: number;        // Default: 6 years
  
  // Export
  exportFormat: 'json' | 'csv' | 'hl7';
}

// Example audit log entries
const EXAMPLE_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: new Date('2024-02-28T14:35:00Z'),
    action: 'alert_acknowledged',
    actor: { type: 'user', id: 'user-123', name: 'Alice Chen', ip: '192.168.1.45' },
    target: { type: 'alert', id: 'alert-456' },
    details: { alertType: 'fall_detected', unitId: 'unit-3a' },
    phiAccessed: true,
    phiType: 'health',
    justification: 'Emergency response - fall detected'
  },
  {
    id: 'audit-002',
    timestamp: new Date('2024-02-28T14:40:00Z'),
    action: 'rpm_reading_recorded',
    actor: { type: 'system', name: 'RPM Sync Service' },
    target: { type: 'rpm_enrollment', id: 'rpm-789' },
    details: { metricType: 'bp', syncedToEHR: true },
    phiAccessed: true,
    phiType: 'health'
  }
];
```

### 6.2 Incident Documentation

```typescript
// Automatic incident report generation for critical events
interface IncidentDocumentation {
  // Auto-create incident reports for these alert types
  autoCreateFor: ('fall' | 'medical' | 'safety')[];
  
  // Required fields
  requiredFields: {
    summary: boolean;
    rootCause: boolean;
    preventiveActions: boolean;
  };
  
  // Review workflow
  reviewWorkflow: {
    requiresSupervisorReview: boolean;
    requiresDirectorReview: boolean;
    escalationHours: number;
  };
}

// Incident report template
const INCIDENT_TEMPLATE = {
  sections: [
    { id: 'summary', label: 'Incident Summary', required: true, type: 'textarea' },
    { id: 'timeline', label: 'Timeline of Events', required: true, type: 'timeline' },
    { id: 'immediateActions', label: 'Immediate Actions Taken', required: true, type: 'list' },
    { id: 'rootCause', label: 'Root Cause Analysis', required: false, type: 'textarea' },
    { id: 'contributingFactors', label: 'Contributing Factors', required: false, type: 'multiselect' },
    { id: 'preventiveActions', label: 'Preventive Actions', required: true, type: 'list' },
    { id: 'attachments', label: 'Attachments', required: false, type: 'files' }
  ]
};
```

### 6.3 WELL Certification Evidence

```typescript
// WELL v2 Feature tracking
interface WELLEvidence {
  feature: string;               // e.g., 'A01', 'T04'
  concept: string;               // 'Air', 'Water', 'Light', 'Comfort', etc.
  
  // Evidence collected
  evidence: {
    type: 'monitoring_data' | 'incident_report' | 'maintenance_log' | 'audit_trail';
    alertId?: string;
    timestamp: Date;
    description: string;
    attachments: string[];
  }[];
  
  // Compliance status
  compliance: {
    current: 'compliant' | 'at_risk' | 'non_compliant';
    lastVerified: Date;
    nextReview: Date;
  };
}

// WELL Features covered by P3
const WELL_FEATURES: Record<string, string> = {
  'A01': 'Air Quality Standards - IEQ violation tracking',
  'T04': 'Background Noise - Environmental monitoring',
  'M02': 'Incident Reporting - Fall and safety incident documentation',
  'C01': 'Ventilation Effectiveness - CO2 monitoring and alerts',
  'C04': 'VOC Reduction - VOC threshold monitoring'
};
```

### 6.4 Insurance Reporting

```typescript
// Insurance claim support data
interface InsuranceReporting {
  // Incident data package for insurance
  generateIncidentPackage: (incidentId: string) => Promise<{
    incidentReport: IncidentReport;
    relatedAlerts: Alert[];
    auditLogs: AuditLog[];
    responseTimes: {
      alertToAcknowledgment: number;    // seconds
      alertToResolution: number;        // seconds
      workflowStepTimes: number[];      // seconds per step
    };
    complianceStatus: {
      hipaaCompliant: boolean;
      protocolFollowed: boolean;
      documentationComplete: boolean;
    };
  }>;
  
  // Loss prevention metrics
  generateLossPreventionReport: (propertyId: string, dateRange: DateRange) => Promise<{
    totalIncidents: number;
    fallsPrevented: number;           // From early warning alerts
    averageResponseTime: number;
    resolutionRate: number;
    trend: 'improving' | 'stable' | 'worsening';
  }>;
}
```

---

## 7. Mock Data

### 7.1 Scenario 1: Wellness Score Drop

**Timeline:**
```typescript
const SCENARIO_1 = {
  name: 'Unit 2B: Wellness Score Drop',
  unitId: 'unit-2b',
  residentName: 'Margaret Chen',
  
  events: [
    {
      time: '2024-02-28T08:00:00Z',
      type: 'wellness_score_calculated',
      data: { score: 72, previousScore: 78 }
    },
    {
      time: '2024-02-28T08:00:05Z',
      type: 'alert_created',
      alert: {
        id: 'alert-001',
        type: 'wellness',
        severity: 'warning',
        title: 'Unit 2B: Wellness Score 72',
        description: 'Margaret Chen wellness score dropped to 72.',
        status: 'open'
      }
    },
    {
      time: '2024-02-28T08:00:10Z',
      type: 'workflow_started',
      workflow: {
        id: 'wf-001',
        alertId: 'alert-001',
        currentStep: 0,
        status: 'in_progress'
      }
    },
    {
      time: '2024-02-28T08:02:00Z',
      type: 'notification_sent',
      channel: 'push',
      recipient: 'Alice Chen (Care Manager)'
    },
    {
      time: '2024-02-28T08:15:00Z',
      type: 'alert_acknowledged',
      by: 'Alice Chen',
      note: 'Reviewing resident chart and recent activity'
    },
    {
      time: '2024-02-28T09:30:00Z',
      type: 'note_added',
      by: 'Alice Chen',
      note: 'Spoke with Margaret. Reports mild cold symptoms. Monitoring.'
    },
    {
      time: '2024-02-28T14:00:00Z',
      type: 'wellness_score_calculated',
      data: { score: 76, previousScore: 72 }
    },
    {
      time: '2024-02-28T14:00:05Z',
      type: 'alert_resolved',
      by: 'Alice Chen',
      resolution: 'Wellness score recovered. Resident reports feeling better.'
    }
  ]
};
```

### 7.2 Scenario 2: Fall Detected

**Timeline:**
```typescript
const SCENARIO_2 = {
  name: 'Unit 3A: Fall Detected',
  unitId: 'unit-3a',
  residentName: 'Robert Johnson',
  
  events: [
    {
      time: '2024-02-28T14:34:23Z',
      type: 'fall_detected',
      data: { 
        location: 'bedroom', 
        confidence: 0.94,
        sensorData: { radar_signature: 'vertical_drop' }
      }
    },
    {
      time: '2024-02-28T14:34:25Z',
      type: 'alert_created',
      alert: {
        id: 'alert-002',
        type: 'safety',
        severity: 'critical',
        title: 'Unit 3A: FALL DETECTED',
        description: 'Fall detected in bedroom for Robert Johnson.',
        status: 'open'
      }
    },
    {
      time: '2024-02-28T14:34:30Z',
      type: 'workflow_started',
      workflow: {
        id: 'wf-002',
        alertId: 'alert-002',
        currentStep: 0,
        status: 'in_progress',
        steps: [
          { order: 0, action: 'dispatch', status: 'sent', slaDeadline: '2024-02-28T14:37:30Z' },
          { order: 1, action: 'call', status: 'pending', slaMinutes: 5 },
          { order: 2, action: 'notify', status: 'pending', slaMinutes: 10 }
        ]
      }
    },
    {
      time: '2024-02-28T14:34:35Z',
      type: 'notification_sent',
      channel: 'push',
      recipient: 'Emergency Responder Team'
    },
    {
      time: '2024-02-28T14:35:00Z',
      type: 'notification_sent',
      channel: 'phone',
      recipient: 'On-Call Nurse'
    },
    {
      time: '2024-02-28T14:36:00Z',
      type: 'workflow_step_completed',
      step: 0,
      note: 'Emergency responder dispatched'
    },
    {
      time: '2024-02-28T14:38:00Z',
      type: 'workflow_step_completed',
      step: 1,
      note: 'Nurse answered, en route'
    },
    {
      time: '2024-02-28T14:40:00Z',
      type: 'note_added',
      by: 'Maria Santos (Emergency Responder)',
      note: 'On scene. Resident conscious, minor bruising on left arm. No head trauma.'
    },
    {
      time: '2024-02-28T14:45:00Z',
      type: 'workflow_completed',
      workflow: { status: 'completed' }
    },
    {
      time: '2024-02-28T14:50:00Z',
      type: 'incident_report_created',
      incident: {
        id: 'inc-2024-001245',
        type: 'fall',
        severity: 'major'
      }
    },
    {
      time: '2024-02-28T16:00:00Z',
      type: 'alert_resolved',
      by: 'Maria Santos',
      resolution: 'Resident assessed. No serious injuries. Family notified. Incident report filed.'
    }
  ]
};
```

### 7.3 Scenario 3: IEQ Violation

**Timeline:**
```typescript
const SCENARIO_3 = {
  name: 'Unit 1C: IEQ Violation',
  unitId: 'unit-1c',
  residentName: 'Dorothy Williams',
  
  events: [
    {
      time: '2024-02-28T10:00:00Z',
      type: 'ieq_reading',
      data: { co2: 850, pm25: 12, voc: 450 }
    },
    {
      time: '2024-02-28T10:15:00Z',
      type: 'ieq_reading',
      data: { co2: 1020, pm25: 14, voc: 480 }
    },
    {
      time: '2024-02-28T10:15:05Z',
      type: 'alert_created',
      alert: {
        id: 'alert-003',
        type: 'ieq',
        severity: 'warning',
        title: 'Unit 1C: CO2 Level High',
        description: 'CO2 level is 1020 ppm (threshold: 1000).',
        status: 'open'
      }
    },
    {
      time: '2024-02-28T10:15:10Z',
      type: 'workflow_started',
      workflow: {
        id: 'wf-003',
        alertId: 'alert-003',
        steps: [
          { order: 0, action: 'notify', status: 'sent', slaMinutes: 60 }
        ]
      }
    },
    {
      time: '2024-02-28T10:16:00Z',
      type: 'notification_sent',
      channel: 'email',
      recipient: 'Maintenance Team'
    },
    {
      time: '2024-02-28T10:30:00Z',
      type: 'alert_acknowledged',
      by: 'James Wilson',
      note: 'Checking HVAC system'
    },
    {
      time: '2024-02-28T11:00:00Z',
      type: 'work_order_created',
      workOrder: {
        id: 'wo-789',
        type: 'hvac_inspection',
        priority: 'medium'
      }
    },
    {
      time: '2024-02-28T11:30:00Z',
      type: 'note_added',
      by: 'James Wilson',
      note: 'HVAC filter replaced. Vents checked for obstructions.'
    },
    {
      time: '2024-02-28T12:00:00Z',
      type: 'ieq_reading',
      data: { co2: 780, pm25: 8, voc: 320 }
    },
    {
      time: '2024-02-28T12:00:05Z',
      type: 'alert_resolved',
      by: 'James Wilson',
      resolution: 'CO2 levels returned to normal after HVAC maintenance.'
    }
  ]
};
```

### 7.4 Mock Alert Dataset

```typescript
const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    unitId: 'unit-2b',
    residentId: 'resident-mchen',
    type: 'wellness',
    severity: 'warning',
    source: 'wellness_score',
    title: 'Unit 2B: Wellness Score 72',
    description: 'Margaret Chen wellness score dropped to 72 (threshold: 70).',
    status: 'resolved',
    assignedTo: 'user-alice',
    assignedRole: 'care_manager',
    createdAt: new Date('2024-02-28T08:00:05Z'),
    acknowledgedAt: new Date('2024-02-28T08:15:00Z'),
    acknowledgedBy: 'user-alice',
    resolvedAt: new Date('2024-02-28T14:00:05Z'),
    resolvedBy: 'user-alice',
    resolution: 'Wellness score recovered to 76. Resident reports feeling better.',
    propertyId: 'prop-sunset'
  },
  {
    id: 'alert-002',
    unitId: 'unit-3a',
    residentId: 'resident-rjohnson',
    type: 'safety',
    severity: 'critical',
    source: 'fall_detected',
    title: 'Unit 3A: FALL DETECTED',
    description: 'Fall detected in bedroom for Robert Johnson. Confidence: 94%',
    status: 'resolved',
    assignedTo: 'user-maria',
    assignedRole: 'emergency_responder',
    createdAt: new Date('2024-02-28T14:34:25Z'),
    acknowledgedAt: new Date('2024-02-28T14:36:00Z'),
    acknowledgedBy: 'user-maria',
    resolvedAt: new Date('2024-02-28T16:00:00Z'),
    resolvedBy: 'user-maria',
    resolution: 'Resident assessed. Minor bruising, no serious injuries. Incident report filed.',
    propertyId: 'prop-sunset'
  },
  {
    id: 'alert-003',
    unitId: 'unit-1c',
    residentId: 'resident-dwilliams',
    type: 'ieq',
    severity: 'warning',
    source: 'ieq_violation',
    title: 'Unit 1C: CO2 Level High',
    description: 'CO2 level is 1020 ppm (threshold: 1000).',
    status: 'resolved',
    assignedTo: 'user-james',
    assignedRole: 'maintenance',
    createdAt: new Date('2024-02-28T10:15:05Z'),
    acknowledgedAt: new Date('2024-02-28T10:30:00Z'),
    acknowledgedBy: 'user-james',
    resolvedAt: new Date('2024-02-28T12:00:05Z'),
    resolvedBy: 'user-james',
    resolution: 'HVAC filter replaced. CO2 levels returned to normal.',
    propertyId: 'prop-sunset'
  },
  {
    id: 'alert-004',
    unitId: 'unit-4d',
    type: 'device',
    severity: 'warning',
    source: 'device_offline',
    title: 'Unit 4D: Hub Offline',
    description: 'Smart hub has been offline for 1.5 hours.',
    status: 'open',
    createdAt: new Date('2024-02-28T13:00:00Z'),
    propertyId: 'prop-sunset'
  },
  {
    id: 'alert-005',
    unitId: 'unit-5e',
    residentId: 'resident-pdavis',
    type: 'wellness',
    severity: 'critical',
    source: 'wellness_score',
    title: 'Unit 5E: CRITICAL Wellness Score 42',
    description: 'Philip Davis wellness score is 42. Immediate attention required.',
    status: 'acknowledged',
    assignedTo: 'user-sarah',
    assignedRole: 'care_manager',
    createdAt: new Date('2024-02-28T15:30:00Z'),
    acknowledgedAt: new Date('2024-02-28T15:35:00Z'),
    acknowledgedBy: 'user-sarah',
    propertyId: 'prop-sunset'
  }
];
```

---

## 8. UI Specifications

### 8.1 Alert List View

**Row Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ◻  [ICON]  Title                    Unit        Time       [BADGE]      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Severity Icons:**
| Severity | Icon | Color | Background |
|----------|------|-------|------------|
| Critical | 🔴 Circle | Red-500 | Red-50 |
| Warning | 🟡 Triangle | Amber-500 | Amber-50 |
| Info | 🔵 Info circle | Blue-500 | Blue-50 |

**Type Icons:**
| Type | Icon |
|------|------|
| Wellness | 🫁 |
| Safety | 🛡️ |
| IEQ | 🌡️ |
| Device | ⚙️ |

**Status Badges:**
| Status | Style |
|--------|-------|
| Open | Red border, white bg, red text |
| Acknowledged | Amber border, amber-50 bg, amber text |
| Resolved | Green border, green-50 bg, green text |
| Dismissed | Gray border, gray-50 bg, gray text |

### 8.2 Alert Detail View

**Layout Grid:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (full width)                                                      │
├──────────────────────────┬──────────────────────────────────────────────┤
│ CONTEXT PANEL (col-span-4)│ TIMELINE PANEL (col-span-8)                  │
│                          │                                              │
├──────────────────────────┼──────────────────────────────────────────────┤
│                          │ NOTES PANEL (col-span-8)                     │
├──────────────────────────┴──────────────────────────────────────────────┤
│ ACTION BAR (full width, sticky bottom)                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Action Buttons:**
| Button | Variant | Icon | State |
|--------|---------|------|-------|
| Acknowledge | Primary | Check | Enabled if open |
| Assign | Secondary | UserPlus | Always enabled |
| Escalate | Destructive | ArrowUp | Enabled if open/acknowledged |
| Resolve | Primary | CheckCircle | Enabled if acknowledged |
| Dismiss | Ghost | X | Always enabled |

### 8.3 Workflow Stepper UI

**Visual Design:**
```
Completed:    [✓]──●──[ ]──○──[ ]
               │     │     │
Active:       [✓]──[✓]──●──○──[ ]
                         │
Pending:      [✓]──[✓]──[ ]──○──[ ]
                              │
Skipped:      [✓]──[✓]──⊘──[✓]──[ ]
                         │
Failed:       [✓]──[✓]──✕──[ ]──[ ]
```

**Step Node Styles:**
| State | Shape | Color | Animation |
|-------|-------|-------|-----------|
| Pending | Circle outline | Gray-300 | None |
| Active | Circle filled | Blue-500 | Pulse |
| Completed | Circle with check | Green-500 | None |
| Skipped | Circle with slash | Gray-400 | None |
| Failed | Circle with X | Red-500 | None |
| Overdue | Circle filled | Red-500 | Pulse fast |

### 8.4 Dashboard Stats

**Stat Cards:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🔴 CRITICAL    │  │  🟡 WARNING     │  │  ⏱️ AVG RESP    │
│                 │  │                 │  │                 │
│       3         │  │      12         │  │    4.2 min      │
│   ↑ 2 today     │  │   ↓ 5 today     │  │   ↓ 30% better  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Activity Feed:**
```
┌─────────────────────────────────────────────────────────┐
│ RECENT ACTIVITY                                         │
├─────────────────────────────────────────────────────────┤
│ 👤 Alice Chen acknowledged Fall Detected (Unit 3A)      │
│    2 minutes ago                                        │
│ ─────────────────────────────────────────────────────── │
│ 🔔 Critical alert created: Wellness Score 42 (Unit 5E)  │
│    15 minutes ago                                       │
│ ─────────────────────────────────────────────────────── │
│ ✅ James Wilson resolved IEQ violation (Unit 1C)        │
│    1 hour ago                                           │
│ ─────────────────────────────────────────────────────── │
│ 📱 SMS delivered to on-call nurse (+1-555-0199)         │
│    2 hours ago                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Build Sequence

**Phase 1: Data Layer** (1 hour)
- Create alertStore.ts with Zustand
- Define all TypeScript interfaces
- Add mock data scenarios

**Phase 2: Alert Dashboard** (2 hours)
- Build AlertDashboard component
- Implement filters and bulk actions
- Add real-time indicators

**Phase 3: Alert Detail** (2 hours)
- Build AlertDetail view
- Create timeline component
- Add action controls

**Phase 4: Escalation Workflow** (2 hours)
- Build stepper UI
- Implement SLA countdown
- Add manual override options

**Phase 5: RPM Enrollment** (1.5 hours)
- Build enrollment wizard
- Create compliance dashboard
- Add device management

**Phase 6: Alert Rules Engine** (1.5 hours)
- Build rules configuration UI
- Implement property overrides
- Add test mode

**Phase 7: Compliance Features** (1 hour)
- Add audit log viewer
- Create incident report form
- WELL evidence tracking

**Total: ~11 hours**

---

## 10. Dependencies

- **P2 Wellness Intelligence** ✅ Required
- **P1 Base Dashboard** ✅ Required
- **Zustand** ✅ Already in P1
- **Recharts** ✅ Already in P1
- **Framer Motion** ✅ Already in P1
- **date-fns** - For date/time formatting
- **react-countdown** - For SLA timers

---

## 11. Acceptance Criteria

### Must Have (Demo Blockers)

- [x] Full TypeScript interfaces for all entities
- [x] AlertDashboard with filters, search, and bulk actions
- [x] AlertDetail with context, timeline, and actions
- [x] EscalationWorkflow stepper with SLA timers
- [x] RPMEnrollment wizard and compliance tracking
- [x] Alert rules engine with default rules
- [x] Property-level configuration overrides
- [x] Mock data for 3 complete scenarios
- [x] HIPAA audit logging structure
- [x] Incident documentation templates

### Should Have (Polish)

- [ ] Real-time WebSocket updates
- [ ] SMS/Email gateway integration
- [ ] PMS work order integration
- [ ] Mobile-responsive alert views
- [ ] Export to CSV/PDF
- [ ] Alert analytics dashboard

### Nice to Have (Future)

- [ ] AI-powered alert prioritization
- [ ] Predictive alerting
- [ ] Voice call integration
- [ ] EHR bidirectional sync

---

**PRD Author:** ClawK (OpenClaw)  
**Research Source:** Notion Pipeline DB  
**Build Assignee:** Claude Code  
**Target:** P3 Intervention & Trust  
**Location:** Extend existing WellStack prototype
