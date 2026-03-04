# Senior Living Operations - Example Workflows

This directory contains example workflows demonstrating common use cases for the Senior Living Operations skill.

## Table of Contents

1. [Morning Wellness Round](#morning-wellness-round)
2. [IEQ Emergency Response](#ieq-emergency-response)
3. [Family Weekly Update](#family-weekly-update)
4. [Daily Report Generation](#daily-report-generation)
5. [Staff Training Scenario](#staff-training-scenario)

---

## Morning Wellness Round

### Scenario
Perform morning wellness checks for all residents on the second floor assigned to Nurse Williams.

### Workflow Steps

```typescript
import { 
  staff_schedule, 
  resident_lookup, 
  wellness_check 
} from '../index';

async function morningWellnessRound() {
  // Step 1: Get Nurse Williams' assigned residents
  const schedule = await staff_schedule({
    date: '2024-03-02',
    department: 'nursing',
    shift: 'morning'
  });

  // Step 2: Find residents in rooms 200-299 (2nd floor)
  const residents = await resident_lookup({
    filters: { floor: 2 },
    limit: 50
  });

  // Step 3: Perform wellness checks
  const results = [];
  for (const resident of residents.results) {
    const check = await wellness_check({
      resident_id: resident.resident_id,
      check_type: 'morning',
      staff_id: 'STAFF-RN-001', // Nurse Williams
      vitals: {
        temperature: 36.8,
        blood_pressure: '128/82',
        heart_rate: 72,
        oxygen_saturation: 98
      },
      mood: 'good',
      pain_level: 2,
      medication_taken: true,
      mobility: 'assisted'
    });
    results.push(check);
  }

  // Step 4: Report summary
  const alerts = results.filter(r => r.alerts.length > 0);
  console.log(`Completed ${results.length} wellness checks`);
  console.log(`${alerts.length} residents have alerts requiring attention`);
  
  return results;
}
```

### Expected Output
```json
{
  "checks_completed": 24,
  "alerts_generated": 3,
  "medications_refused": 0,
  "concerning_moods": 1,
  "average_check_time": "4.5 minutes"
}
```

---

## IEQ Emergency Response

### Scenario
High CO2 levels detected in the dining hall during lunch service.

### Workflow Steps

```typescript
import { 
  ieq_alert_escalate, 
  resident_lookup,
  family_notify 
} from '../index';

async function ieqEmergencyResponse() {
  // Step 1: Receive sensor alert and escalate
  const alert = await ieq_alert_escalate({
    alert_id: 'IEQ-2024-03152',
    sensor_type: 'co2',
    location: 'Dining Hall - East Wing',
    severity: 'high',
    current_value: 1200,
    threshold_value: 1000,
    affected_residents: ['RES-2024-001', 'RES-2024-015', 'RES-2024-023'],
    timestamp: new Date().toISOString()
  });

  console.log(`Alert escalated to Level ${alert.escalation_level}`);
  console.log(`Assigned to: ${alert.assigned_to}`);
  console.log('Actions triggered:', alert.actions_triggered);

  // Step 2: If critical, notify families
  if (alert.escalation_level >= 3) {
    for (const residentId of ['RES-2024-001', 'RES-2024-015', 'RES-2024-023']) {
      const resident = await resident_lookup({ resident_id: residentId });
      
      await family_notify({
        resident_id: residentId,
        notification_type: 'general_update',
        family_contacts: resident.results[0].emergency_contacts.map((ec: any) => ({
          name: ec.name,
          relationship: ec.relationship,
          channel: ec.notification_preferences[0] || 'email',
          contact_info: ec.phone,
          priority: 1
        })),
        message_content: {
          subject: 'Facility Update - Environmental Adjustment',
          body: `We are addressing a temporary air quality adjustment in the dining area. Your loved one is safe and has been relocated to an alternative dining space. We will update you when normal operations resume.`,
          include_vitals: false,
          include_photo: false,
          language: 'en'
        },
        urgency: 'important'
      });
    }
  }

  return alert;
}
```

### Expected Output
```json
{
  "escalation_level": 3,
  "assigned_to": "Nursing Supervisor",
  "actions_triggered": [
    "Alert nursing supervisor",
    "Notify maintenance supervisor", 
    "Prepare resident relocation if needed",
    "Document in incident log"
  ],
  "estimated_resolution": "30 minutes",
  "families_notified": 3
}
```

---

## Family Weekly Update

### Scenario
Send weekly wellness updates to families of all independent living residents.

### Workflow Steps

```typescript
import { 
  resident_lookup, 
  wellness_check,
  family_notify 
} from '../index';

async function familyWeeklyUpdate() {
  // Step 1: Get independent living residents
  const residents = await resident_lookup({
    filters: { care_level: 'independent' },
    include_history: true,
    limit: 100
  });

  const results = [];

  // Step 2: Send personalized updates
  for (const resident of residents.results) {
    // Get recent wellness checks
    const recentChecks = resident.recent_checks || [];
    const avgMood = calculateAverageMood(recentChecks);
    const activityParticipation = 'Good - attended 4 of 5 scheduled activities';

    const notification = await family_notify({
      resident_id: resident.resident_id,
      notification_type: 'wellness_update',
      family_contacts: resident.emergency_contacts.map((ec: any) => ({
        name: ec.name,
        relationship: ec.relationship,
        channel: ec.notification_preferences[0] || 'email',
        contact_info: ec.email || ec.phone,
        priority: 1
      })),
      message_content: {
        subject: `Weekly Update - ${resident.first_name} ${resident.last_name}`,
        body: generateWeeklyUpdateText(resident, recentChecks, avgMood, activityParticipation),
        include_vitals: true,
        include_photo: false,
        language: resident.preferred_language
      },
      urgency: 'routine',
      require_confirmation: false
    });

    results.push(notification);
  }

  return {
    total_sent: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  };
}

function calculateAverageMood(checks: any[]): string {
  const moodScores: Record<string, number> = {
    excellent: 4, good: 3, fair: 2, poor: 1, concerning: 0
  };
  
  if (checks.length === 0) return 'No data';
  
  const total = checks.reduce((sum, check) => 
    sum + (moodScores[check.mood || 'fair'] || 2), 0);
  const avg = total / checks.length;
  
  if (avg >= 3.5) return 'Excellent';
  if (avg >= 2.5) return 'Good';
  if (avg >= 1.5) return 'Fair';
  return 'Needs Attention';
}

function generateWeeklyUpdateText(resident: any, checks: any[], mood: string, activities: string): string {
  return `Dear Family,

We hope this message finds you well. Here is your weekly update for ${resident.first_name}:

**Overall Wellbeing:** ${mood}
**Activity Participation:** ${activities}
**Medication Compliance:** 100%
**Recent Vitals:** Within normal ranges

${resident.first_name} particularly enjoyed the music therapy session on Wednesday and the garden walk on Friday. Social engagement remains strong.

If you have any questions, please don't hesitate to reach out to our care team.

Warm regards,
Sunrise Senior Living Team`;
}
```

### Expected Output
```json
{
  "total_sent": 32,
  "successful": 31,
  "failed": 1,
  "delivery_method_breakdown": {
    "email": 28,
    "sms": 3,
    "whatsapp": 1
  }
}
```

---

## Daily Report Generation

### Scenario
Generate end-of-day operations report for facility administrator.

### Workflow Steps

```typescript
import { daily_ops_report } from '../index';

async function generateDailyReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  // Generate comprehensive report
  const report = await daily_ops_report({
    facility_id: 'FAC-SL-001',
    report_date: dateStr,
    report_type: 'executive',
    format: 'markdown',
    include_sections: [
      'occupancy',
      'wellness', 
      'incidents',
      'ieq',
      'staff',
      'maintenance',
      'families'
    ],
    recipients: [
      'admin@facility.com',
      'director@facility.com'
    ]
  });

  console.log('Report generated:', report.report_id);
  console.log('Summary Stats:', report.summary_stats);

  // Save to file system
  if (report.content) {
    const fs = require('fs');
    const path = `/reports/daily/${report.report_id}.md`;
    fs.writeFileSync(path, report.content);
    console.log('Report saved to:', path);
  }

  return report;
}
```

### Expected Output
```markdown
# Daily Operations Report
**Facility:** FAC-SL-001  
**Date:** 2024-03-01  
**Type:** executive

## Summary Statistics
- Total Residents: 87
- Wellness Checks: 261
- Active IEQ Alerts: 2
- Staff Present: 34
- New Admissions: 1
- Discharges: 0

## Occupancy
Current occupancy: 94% (87/92 beds)
- Independent Living: 32 residents
- Assisted Living: 35 residents
- Memory Care: 12 residents
- Skilled Nursing: 8 residents

## Wellness Summary
All scheduled wellness checks completed (100% compliance)
- Alerts generated: 4 (all addressed)
- Medication compliance: 98.5%
- Fall incidents: 0

## IEQ Status
2 active alerts requiring attention:
- Room 204: Temperature slightly elevated (investigating HVAC)
- Dining Hall: CO2 returned to normal after lunch service

## Staffing
- Scheduled: 38
- Present: 34
- Call-outs: 3
- Overtime: 2

## Maintenance
- Work orders completed: 12
- Pending: 3 (non-critical)

## Family Communications
- Notifications sent: 45
- Delivery success: 98%
- Responses received: 12
```

---

## Staff Training Scenario

### Scenario
Create mock data for training new CNAs on the wellness check workflow.

### Workflow Steps

```typescript
import { 
  wellstack_mock_data, 
  resident_lookup,
  wellness_check 
} from '../index';

async function staffTrainingScenario() {
  // Step 1: Generate training data
  const mockData = await wellstack_mock_data({
    data_type: 'full_facility',
    scenario: 'staff_training',
    output_format: 'json'
  });

  console.log('Training environment initialized');
  console.log(`- Residents: ${mockData.data.residents.length}`);
  console.log(`- Staff: ${mockData.data.staff.length}`);
  console.log(`- Sample Alerts: ${mockData.data.alerts.length}`);

  // Step 2: Training exercise - High acuity scenario
  console.log('\n=== TRAINING EXERCISE ===');
  console.log('Scenario: Morning wellness round with various conditions');

  const trainingCases = [
    {
      name: 'Normal Resident',
      vitals: { temperature: 36.8, blood_pressure: '120/80', heart_rate: 72 },
      mood: 'good',
      pain_level: 1
    },
    {
      name: 'Fever Detection',
      vitals: { temperature: 38.5, blood_pressure: '130/85', heart_rate: 88 },
      mood: 'poor',
      pain_level: 5
    },
    {
      name: 'Low Oxygen',
      vitals: { temperature: 36.6, blood_pressure: '125/78', heart_rate: 95, oxygen_saturation: 89 },
      mood: 'fair',
      pain_level: 3
    },
    {
      name: 'Medication Refusal',
      vitals: { temperature: 36.7, blood_pressure: '118/76', heart_rate: 68 },
      mood: 'concerning',
      pain_level: 0,
      medication_taken: false
    }
  ];

  const traineeId = 'STAFF-TRAINING-001';

  for (const testCase of trainingCases) {
    console.log(`\nProcessing: ${testCase.name}`);
    
    const result = await wellness_check({
      resident_id: 'RES-TRAINING-001',
      check_type: 'morning',
      staff_id: traineeId,
      vitals: testCase.vitals,
      mood: testCase.mood as any,
      pain_level: testCase.pain_level,
      medication_taken: testCase.medication_taken ?? true
    });

    console.log(`  Alerts: ${result.alerts.length > 0 ? result.alerts.join(', ') : 'None'}`);
    console.log(`  Actions Required: ${result.alerts.length > 0 ? 'YES - Follow protocol' : 'Continue monitoring'}`);
  }

  return {
    training_complete: true,
    scenarios_completed: trainingCases.length,
    recommendations: [
      'Practice fever protocol',
      'Review oxygen saturation thresholds',
      'Study medication refusal documentation'
    ]
  };
}
```

### Expected Output
```
Training environment initialized
- Residents: 50
- Staff: 30
- Sample Alerts: 20

=== TRAINING EXERCISE ===
Scenario: Morning wellness round with various conditions

Processing: Normal Resident
  Alerts: None
  Actions Required: Continue monitoring

Processing: Fever Detection
  Alerts: FEVER: Temperature 38.5C
  Actions Required: YES - Follow protocol

Processing: Low Oxygen
  Alerts: LOW_O2: 89%, HIGH_HR: 95 BPM
  Actions Required: YES - Follow protocol

Processing: Medication Refusal
  Alerts: MEDICATION_REFUSED
  Actions Required: YES - Follow protocol
```

---

## Running the Examples

### Prerequisites
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Run Individual Examples
```bash
# Morning wellness round
npx ts-node examples/morning-wellness-round.ts

# IEQ emergency response
npx ts-node examples/ieq-emergency-response.ts

# Family weekly update
npx ts-node examples/family-weekly-update.ts

# Daily report generation
npx ts-node examples/daily-report-generation.ts

# Staff training scenario
npx ts-node examples/staff-training-scenario.ts
```

### Integration with OpenClaw

These workflows can be triggered via OpenClaw skill calls:

```
User: "Run morning wellness round for floor 2"
Agent: [Executes morningWellnessRound workflow]

User: "Dining hall CO2 is at 1200ppm"
Agent: [Executes ieqEmergencyResponse workflow]

User: "Send weekly updates to families"
Agent: [Executes familyWeeklyUpdate workflow]

User: "Generate yesterday's daily report"
Agent: [Executes generateDailyReport workflow]

User: "Start staff training scenario"
Agent: [Executes staffTrainingScenario workflow]
```
