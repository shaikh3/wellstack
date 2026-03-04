# Senior Living Operations Skill 🏥

A comprehensive OpenClaw skill for managing senior living facility operations. Provides tools for resident wellness monitoring, indoor environmental quality (IEQ) alert escalation, automated family notifications, daily operations reporting, and integration with WellStack mock data for testing and training.

## Features

### 1. Resident Wellness Check Command
- **Structured wellness assessments** with vital signs, mood evaluation, medication compliance
- **Automated alert generation** for abnormal vitals (fever, hypertension, low oxygen)
- **Pain level tracking** with escalation for severe pain
- **Mobility status monitoring**
- **Medication administration tracking**

### 2. IEQ Alert Escalation Workflow
- **Multi-level escalation** (1-4) based on severity
- **Automated notifications** to appropriate staff roles
- **Resident impact assessment** with affected area mapping
- **Sensor type support**: air quality, temperature, humidity, CO2, noise, lighting, VOC
- **Resolution tracking** and documentation

### 3. Family Notification Templates
- **Multi-channel delivery**: SMS, email, WhatsApp, Telegram
- **Template-based messages** for consistent communication
- **Urgency-based routing** (routine, important, urgent)
- **Delivery confirmation tracking**
- **Language preferences support**

### 4. Daily Ops Report Generator
- **Multiple report types**: summary, detailed, executive, compliance
- **Configurable sections**: occupancy, wellness, incidents, IEQ, staff, maintenance, families
- **Multiple output formats**: markdown, PDF, JSON, CSV
- **Automated distribution** to stakeholders
- **Historical trending**

### 5. WellStack Mock Data Integration
- **Realistic synthetic data** for residents, staff, and sensors
- **Training scenarios**: normal, high acuity, emergency drill, new facility
- **Export formats**: JSON, CSV, SQL insert statements
- **Staff training support** without production data risks

## Installation

```bash
# Clone the skill repository
cd /path/to/openclaw/skills
git clone https://github.com/openclaw/skills/senior-living-ops

# Install dependencies
cd senior-living-ops
npm install

# Build TypeScript
npm run build
```

## Configuration

Add to your OpenClaw skills configuration:

```yaml
skills:
  - name: senior-living-ops
    path: ./skills/senior-living-ops
    config:
      facility_name: "Sunrise Senior Living"
      alert_escalation_levels:
        - level: 1
          assignee: "system"
          actions: ["log"]
        - level: 2
          assignee: "maintenance"
          actions: ["notify", "create_ticket"]
        - level: 3
          assignee: "nursing_supervisor"
          actions: ["alert", "prepare_relocation"]
        - level: 4
          assignee: "administrator"
          actions: ["emergency_protocol"]
      notification_channels:
        - email
        - sms
        - whatsapp
```

## Quick Start

### Performing a Wellness Check

```typescript
import { wellness_check } from './index';

const result = await wellness_check({
  resident_id: 'RES-2024-001',
  check_type: 'morning',
  staff_id: 'STAFF-RN-001',
  vitals: {
    temperature: 36.8,
    blood_pressure: '128/82',
    heart_rate: 72,
    oxygen_saturation: 98
  },
  mood: 'good',
  pain_level: 2,
  medication_taken: true
});

console.log(result.alerts); // Any generated alerts
```

### Handling an IEQ Alert

```typescript
import { ieq_alert_escalate } from './index';

const result = await ieq_alert_escalate({
  alert_id: 'IEQ-2024-03152',
  sensor_type: 'co2',
  location: 'Dining Hall',
  severity: 'high',
  current_value: 1200,
  threshold_value: 1000,
  affected_residents: ['RES-001', 'RES-002'],
  timestamp: new Date().toISOString()
});

console.log(result.escalation_level); // 3
console.log(result.assigned_to);      // Nursing Supervisor
```

### Sending Family Notification

```typescript
import { family_notify } from './index';

const result = await family_notify({
  resident_id: 'RES-2024-001',
  notification_type: 'wellness_update',
  family_contacts: [{
    name: 'Sarah Johnson',
    relationship: 'Daughter',
    channel: 'email',
    contact_info: 'sarah@example.com',
    priority: 1
  }],
  message_content: {
    subject: 'Weekly Wellness Update',
    body: 'Your mother is doing well this week...',
    include_vitals: true,
    include_photo: false,
    language: 'en'
  }
});
```

### Generating Daily Report

```typescript
import { daily_ops_report } from './index';

const report = await daily_ops_report({
  facility_id: 'FAC-SL-001',
  report_date: '2024-03-02',
  report_type: 'executive',
  format: 'markdown',
  include_sections: ['occupancy', 'wellness', 'incidents', 'ieq']
});

console.log(report.summary_stats);
```

### Generating Mock Data

```typescript
import { wellstack_mock_data } from './index';

// Generate residents for training
const residents = await wellstack_mock_data({
  data_type: 'residents',
  count: 50,
  scenario: 'high_acuity'
});

// Generate full facility data
const facility = await wellstack_mock_data({
  data_type: 'full_facility',
  scenario: 'normal'
});
```

## API Reference

See [SKILL.md](./SKILL.md) for complete API documentation including all parameters, return types, and examples.

## Workflows

See [examples/WORKFLOWS.md](./examples/WORKFLOWS.md) for detailed workflow examples:

- Morning Wellness Round
- IEQ Emergency Response
- Family Weekly Update
- Daily Report Generation
- Staff Training Scenario

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npx ts-node tests/wellness-check.test.ts
```

## Directory Structure

```
senior-living-ops/
├── .clawhub/               # OpenClaw metadata
├── examples/               # Workflow examples
│   └── WORKFLOWS.md
├── tests/                  # Test suite
│   └── index.test.ts
├── _meta.json             # Skill metadata
├── index.ts               # Main implementation
├── package.json           # Node.js package
├── README.md              # This file
└── SKILL.md               # OpenClaw skill documentation
```

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `RESIDENT_NOT_FOUND` | Invalid resident ID | Verify ID format |
| `STAFF_UNAUTHORIZED` | Permission denied | Check role assignments |
| `ALERT_ESCALATION_FAILED` | Escalation failed | Use backup contacts |
| `NOTIFICATION_FAILED` | Message delivery failed | Retry alternate channel |
| `WELLSTACK_UNAVAILABLE` | Mock data offline | Use cached data |

## Best Practices

1. **Always validate resident IDs** before performing operations
2. **Document all wellness checks** thoroughly for compliance
3. **Escalate IEQ alerts promptly** based on severity
4. **Respect family communication preferences**
5. **Use mock data for training** before production use
6. **Review daily reports** for trends and anomalies
7. **Maintain privacy** - never share PHI without consent

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [SKILL.md](./SKILL.md)
- Issues: [GitHub Issues](https://github.com/openclaw/skills/issues)
- Discussions: [GitHub Discussions](https://github.com/openclaw/skills/discussions)

---

Built with ❤️ for senior living communities
