---
emoji: 🏥
name: senior-living-ops
description: "Comprehensive senior living facility operations management - resident wellness checks, IEQ alerts, family notifications, and daily reporting with WellStack integration."
requires:
  bins: []
  env:
    - WELLSTACK_API_KEY
    - WELLSTACK_ENDPOINT
  config:
    - facility_name
    - alert_escalation_levels
    - notification_channels
  skills:
    - message
---

# Senior Living Operations Skill

Comprehensive skill for managing senior living facility operations. Provides resident wellness monitoring, indoor environmental quality (IEQ) alert escalation, automated family notifications, daily operations reporting, and seamless integration with WellStack mock data for testing and training.

## Overview

This skill helps facility administrators, nurses, and care coordinators:
- Monitor resident wellness through structured check-ins
- Escalate IEQ (Indoor Environmental Quality) alerts based on severity
- Send standardized family notifications across multiple channels
- Generate comprehensive daily operations reports
- Train staff using realistic WellStack mock data

## Tools

### wellness_check

Perform structured wellness checks for residents.

**Description**: Conducts comprehensive wellness assessments including vital signs, mood evaluation, medication compliance, and mobility status. Records findings and flags concerning trends.

**Parameters**:
- `resident_id` (string, required): Unique resident identifier
- `check_type` (enum, required): Type of wellness check - `morning`, `afternoon`, `evening`, `incident`, `scheduled`
- `vitals` (object, optional): Vital signs data
  - `temperature` (number): Body temperature in Celsius
  - `blood_pressure` (string): BP reading e.g., "120/80"
  - `heart_rate` (number): BPM
  - `oxygen_saturation` (number): SpO2 percentage
  - `weight` (number): Weight in kg
- `mood` (enum, optional): `excellent`, `good`, `fair`, `poor`, `concerning`
- `pain_level` (number, optional): 0-10 scale
- `medication_taken` (boolean, optional): Whether medications were taken as prescribed
- `mobility` (enum, optional): `independent`, `assisted`, `wheelchair`, `bedridden`
- `notes` (string, optional): Additional observations
- `staff_id` (string, required): ID of performing staff member

**Returns**:
- `success` (boolean): Operation status
- `check_id` (string): Unique check identifier
- `alerts` (array): Any generated alerts
- `trend_flags` (array): Trending concerns

**Example**:
```json
{
  "resident_id": "RES-2024-001",
  "check_type": "morning",
  "vitals": {
    "temperature": 36.6,
    "blood_pressure": "128/82",
    "heart_rate": 72
  },
  "mood": "good",
  "medication_taken": true,
  "staff_id": "STAFF-NURSE-003"
}
```

---

### ieq_alert_escalate

Process and escalate Indoor Environmental Quality alerts.

**Description**: Handles IEQ sensor alerts (air quality, temperature, humidity, CO2, noise levels) and routes them through appropriate escalation paths based on severity and resident vulnerability.

**Parameters**:
- `alert_id` (string, required): Unique alert identifier
- `sensor_type` (enum, required): `air_quality`, `temperature`, `humidity`, `co2`, `noise`, `lighting`, `voc`
- `location` (string, required): Room or zone identifier
- `severity` (enum, required): `low`, `medium`, `high`, `critical`
- `current_value` (number, required): Current sensor reading
- `threshold_value` (number, required): Threshold that was breached
- `affected_residents` (array, optional): List of resident IDs in affected area
- `timestamp` (string, required): ISO 8601 timestamp
- `auto_escalate` (boolean, optional): Whether to auto-escalate based on rules (default: true)

**Returns**:
- `success` (boolean): Operation status
- `escalation_level` (number): Current escalation level (1-4)
- `assigned_to` (string): Role/person assigned
- `actions_triggered` (array): Automated actions taken
- `estimated_resolution` (string): ETA for resolution

**Example**:
```json
{
  "alert_id": "IEQ-2024-03152",
  "sensor_type": "co2",
  "location": "Dining Hall - East Wing",
  "severity": "high",
  "current_value": 1200,
  "threshold_value": 1000,
  "affected_residents": ["RES-2024-001", "RES-2024-015"],
  "timestamp": "2024-03-02T14:30:00Z"
}
```

---

### family_notify

Send notifications to resident family members.

**Description**: Delivers standardized, compassionate notifications to family members across multiple channels (SMS, email, WhatsApp, Telegram) with appropriate tone and detail level.

**Parameters**:
- `resident_id` (string, required): Resident identifier
- `notification_type` (enum, required): `wellness_update`, `incident_report`, `appointment_reminder`, `general_update`, `urgent`, `visitor_log`
- `family_contacts` (array, required): Contact methods and preferences
  - `name` (string): Family member name
  - `relationship` (string): Relationship to resident
  - `channel` (enum): `sms`, `email`, `whatsapp`, `telegram`
  - `contact_info` (string): Phone/email/handle
  - `priority` (number): 1-3 (1 = primary)
- `message_content` (object, required):
  - `subject` (string): Message subject/title
  - `body` (string): Main message content
  - `include_vitals` (boolean): Include vital signs
  - `include_photo` (boolean): Include recent photo
  - `language` (string): ISO language code (default: "en")
- `urgency` (enum, optional): `routine`, `important`, `urgent`
- `require_confirmation` (boolean, optional): Require read receipt (default: false)

**Returns**:
- `success` (boolean): Operation status
- `delivery_status` (array): Per-channel delivery status
- `message_id` (string): Unique message identifier
- `sent_at` (string): ISO timestamp

**Example**:
```json
{
  "resident_id": "RES-2024-001",
  "notification_type": "wellness_update",
  "family_contacts": [
    {
      "name": "Sarah Johnson",
      "relationship": "Daughter",
      "channel": "whatsapp",
      "contact_info": "+1-555-0123",
      "priority": 1
    }
  ],
  "message_content": {
    "subject": "Weekly Wellness Update - Margaret",
    "body": "Your mother is doing well this week...",
    "include_vitals": true,
    "include_photo": false,
    "language": "en"
  },
  "urgency": "routine"
}
```

---

### daily_ops_report

Generate comprehensive daily operations report.

**Description**: Compiles daily metrics including occupancy, wellness checks completed, incidents, IEQ alerts, staff schedules, maintenance requests, and family communications into a formatted report.

**Parameters**:
- `report_date` (string, optional): Date for report (default: today, format: YYYY-MM-DD)
- `report_type` (enum, optional): `summary`, `detailed`, `executive`, `compliance`
- `include_sections` (array, optional): Specific sections to include:
  - `occupancy`: Resident count and admissions/discharges
  - `wellness`: Wellness check summaries
  - `incidents`: Incident reports
  - `ieq`: IEQ alert summary
  - `staff`: Staff attendance and schedules
  - `maintenance`: Maintenance requests
  - `families`: Family communication log
  - `medication`: Medication administration records
  - `activities`: Activity participation
  - `dining`: Dining service metrics
- `format` (enum, optional): `markdown`, `pdf`, `json`, `csv`
- `recipients` (array, optional): Auto-send to these emails
- `facility_id` (string, required): Facility identifier

**Returns**:
- `success` (boolean): Operation status
- `report_id` (string): Unique report identifier
- `content` (string): Report content (if markdown/json)
- `file_path` (string): Path to generated file (if pdf/csv)
- `summary_stats` (object): Key metrics summary

**Example**:
```json
{
  "facility_id": "FAC-SL-001",
  "report_date": "2024-03-02",
  "report_type": "detailed",
  "include_sections": ["occupancy", "wellness", "incidents", "ieq"],
  "format": "markdown"
}
```

---

### wellstack_mock_data

Generate realistic mock data for testing and training.

**Description**: Creates realistic synthetic data for residents, staff, IEQ sensors, and historical records. Perfect for training new staff, testing workflows, or demonstrating the system.

**Parameters**:
- `data_type` (enum, required): `residents`, `staff`, `sensors`, `wellness_history`, `alerts_history`, `full_facility`
- `count` (number, optional): Number of records to generate (default varies by type)
- `scenario` (enum, optional): `normal`, `high_acuity`, `emergency_drill`, `new_facility`, `staff_training`
- `date_range` (object, optional): Historical date range
  - `start`: Start date (YYYY-MM-DD)
  - `end`: End date (YYYY-MM-DD)
- `output_format` (enum, optional): `json`, `csv`, `insert_statements`
- `export_path` (string, optional): Save to file path

**Returns**:
- `success` (boolean): Operation status
- `data` (array/object): Generated mock data
- `record_count` (number): Number of records
- `file_path` (string, optional): Path if exported

**Example**:
```json
{
  "data_type": "residents",
  "count": 50,
  "scenario": "normal",
  "output_format": "json"
}
```

---

### resident_lookup

Search and retrieve resident information.

**Description**: Query resident database with flexible search criteria. Returns comprehensive resident profiles including care plans, emergency contacts, medical alerts, and recent activity.

**Parameters**:
- `query` (string, optional): Free-text search (name, room, ID)
- `resident_id` (string, optional): Exact resident ID lookup
- `filters` (object, optional):
  - `room_number` (string): Room/unit filter
  - `care_level` (enum): `independent`, `assisted`, `memory_care`, `skilled_nursing`
  - `admission_date_after` (string): Date filter
  - `has_active_alerts` (boolean): Alert status filter
- `include_history` (boolean, optional): Include recent wellness history
- `limit` (number, optional): Max results (default: 20)

**Returns**:
- `success` (boolean): Operation status
- `results` (array): Matching residents
- `count` (number): Total matches

---

### staff_schedule

View and manage staff schedules.

**Description**: Access current staff rosters, schedules, assignments, and availability. Supports shift swaps, overtime tracking, and skill-based assignments.

**Parameters**:
- `date` (string, optional): Date to query (YYYY-MM-DD, default: today)
- `department` (enum, optional): `nursing`, `caregiving`, `maintenance`, `dining`, `activities`, `admin`, `all`
- `shift` (enum, optional): `morning`, `afternoon`, `evening`, `night`, `all`
- `staff_id` (string, optional): Specific staff member lookup
- `action` (enum, optional): `view`, `assign`, `swap`, `request_cover`

**Returns**:
- `success` (boolean): Operation status
- `schedule` (array): Staff assignments
- `coverage_gaps` (array, optional): Identified gaps

---

### medication_round

Track and record medication administration.

**Description**: Manages medication rounds with barcode verification, PRN documentation, refusal tracking, and allergy alerts. Integrates with pharmacy systems.

**Parameters**:
- `round_type` (enum, required): `morning`, `noon`, `evening`, `bedtime`, `prn`
- `nurse_id` (string, required): Administering nurse
- `resident_id` (string, optional): Filter to specific resident
- `status` (enum, optional): `pending`, `in_progress`, `completed`, `review_needed`
- `record_administration` (object, optional): Record a medication given
  - `medication_id` (string)
  - `resident_id` (string)
  - `time_given` (string)
  - `notes` (string)

**Returns**:
- `success` (boolean): Operation status
- `medications` (array): Medication list with status
- `alerts` (array): Any alerts (allergies, interactions)

## Workflows

### Morning Wellness Round

Standard morning wellness check workflow:

1. **Retrieve schedule**: `staff_schedule` for current date, morning shift
2. **Lookup residents**: `resident_lookup` for assigned units
3. **Perform checks**: `wellness_check` for each resident
4. **Flag concerns**: System auto-generates alerts for concerning vitals
5. **Family updates**: `family_notify` for significant changes
6. **Document**: All records saved to resident history

### IEQ Alert Response

Critical environmental alert handling:

1. **Receive alert**: IEQ sensor triggers alert
2. **Escalate**: `ieq_alert_escalate` with severity assessment
3. **Assess impact**: Identify `affected_residents` from location
4. **Take action**: Automated actions per escalation level
   - Level 1: Log and monitor
   - Level 2: Notify maintenance
   - Level 3: Alert nursing supervisor, relocate vulnerable residents
   - Level 4: Emergency protocols, notify families if needed
5. **Track resolution**: Update status until resolved
6. **Document**: Include in daily report

### Family Communication Protocol

Standard family update process:

1. **Identify updates**: Review day's wellness checks, activities, incidents
2. **Draft message**: `family_notify` with appropriate template
3. **Select recipients**: Primary contacts per resident preference
4. **Send**: Multi-channel delivery with confirmation tracking
5. **Follow up**: Retry failed deliveries, escalate urgent unread messages

### Daily Operations Closeout

End-of-day reporting workflow:

1. **Compile data**: `daily_ops_report` with all sections
2. **Review metrics**: Check for anomalies, missing data
3. **Distribute**: Send to administrators, department heads
4. **Archive**: Store for compliance and trending
5. **Handoff**: Flag items for next shift

## Failure Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `RESIDENT_NOT_FOUND` | Invalid resident ID | Verify ID format, search by name |
| `STAFF_UNAUTHORIZED` | Insufficient permissions | Check role assignments, escalate to admin |
| `ALERT_ESCALATION_FAILED` | Unable to reach on-call staff | Use backup contacts, page all supervisors |
| `NOTIFICATION_FAILED` | Message delivery failed | Retry alternate channel, log for follow-up |
| `WELLSTACK_UNAVAILABLE` | Mock data service offline | Use cached templates, retry connection |
| `REPORT_GENERATION_ERROR` | Data compilation failed | Check database connectivity, retry with smaller date range |

## Permissions

Required capabilities for full functionality:

- `database.read`: Query resident and staff records
- `database.write`: Record wellness checks, medications, incidents
- `message.send`: Family notifications
- `sensors.read`: IEQ sensor data access
- `reports.generate`: Create operational reports
- `files.write`: Export reports and mock data

## Integration Notes

### WellStack Mock Data

The WellStack integration provides realistic synthetic data for:
- **Training**: New staff onboarding without real resident data
- **Testing**: Validate workflows before production
- **Demos**: Showcase system capabilities
- **Development**: Build features without production access

Mock data scenarios:
- `normal`: Typical facility operations
- `high_acuity`: Many residents with complex care needs
- `emergency_drill`: Simulated emergency for training
- `new_facility`: Startup with admissions in progress
- `staff_training`: Common scenarios for skill building

### Real Sensor Integration

For production IEQ monitoring, integrate with:
- Awair Omni
- Kaiterra Sensedge
- Honeywell HBT
- Custom MQTT sensors

Map sensor IDs to facility zones in configuration.

## Best Practices

1. **Privacy First**: Never include PHI in family messages without consent
2. **Escalation Awareness**: Know your facility's specific escalation chain
3. **Documentation**: When in doubt, document - thorough records protect residents and staff
4. **Confirmation**: Always confirm critical communications were received
5. **Regular Training**: Use mock data scenarios monthly for staff refreshers
6. **Trend Monitoring**: Watch wellness trends, not just individual readings
7. **Family Preferences**: Respect communication channel preferences

## Example Conversations

**User**: "Check on Mrs. Henderson in room 204"

**Agent**:
> I'll look up Mrs. Henderson and perform a wellness check.

**Function calls**:
```
resident_lookup({"query": "Henderson", "room_number": "204"})
```

**Result**:
```json
{
  "success": true,
  "results": [{
    "resident_id": "RES-2024-015",
    "name": "Margaret Henderson",
    "room": "204-B",
    "care_level": "assisted"
  }]
}
```

**Agent**: "Found Margaret Henderson in room 204-B. What type of wellness check would you like to perform?"

---

**User**: "The dining hall CO2 sensor is showing 1200ppm, that's above threshold"

**Agent**:
> I'll escalate this IEQ alert immediately. That's above safe levels.

**Function calls**:
```
ieq_alert_escalate({
  "alert_id": "IEQ-2024-03153",
  "sensor_type": "co2",
  "location": "Dining Hall",
  "severity": "high",
  "current_value": 1200,
  "threshold_value": 1000,
  "timestamp": "2024-03-02T15:45:00Z"
})
```

**Result**:
```json
{
  "success": true,
  "escalation_level": 3,
  "assigned_to": "Maintenance Supervisor",
  "actions_triggered": [
    "Notify maintenance supervisor",
    "Open ventilation dampers",
    "Alert nursing supervisor",
    "Prepare resident relocation if needed"
  ],
  "estimated_resolution": "30 minutes"
}
```

**Agent**: "Alert escalated to Level 3. Maintenance supervisor has been notified, ventilation is being increased, and nursing is on standby. Estimated resolution: 30 minutes."

---

**User**: "Generate yesterday's daily report for the administrator"

**Agent**:
> I'll compile yesterday's operations report.

**Function calls**:
```
daily_ops_report({
  "facility_id": "FAC-SL-001",
  "report_date": "2024-03-01",
  "report_type": "executive",
  "format": "pdf",
  "include_sections": ["occupancy", "wellness", "incidents", "staff"]
})
```

**Result**:
```json
{
  "success": true,
  "report_id": "RPT-2024-03101",
  "file_path": "/reports/daily/FAC-SL-001_2024-03-01_executive.pdf",
  "summary_stats": {
    "total_residents": 87,
    "wellness_checks_completed": 261,
    "incidents": 2,
    "staff_present": 34
  }
}
```

**Agent**: "Report generated: 87 residents, 261 wellness checks, 2 minor incidents, 34 staff on duty. PDF saved to reports folder."
