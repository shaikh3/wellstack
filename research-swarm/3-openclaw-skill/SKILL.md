# WellStack for Senior Living
## Complete OpenClaw Skill Package

---

# 📦 SKILL.md

```yaml
name: wellstack-senior-living
display_name: WellStack Senior Living
version: 1.2.0
description: |
  AI-powered facility management for senior living communities.
  Enables voice-controlled room monitoring, alert management, 
  family communication, wellness checks, and IEQ reporting.
  
  Built for care staff, loved by families, trusted by administrators.

author: WellStack Technologies
category: healthcare
license: MIT

requires:
  openclaw: ">=2026.2.0"
  
integrations:
  - wellstack_api
  - epic_ehr
  - cerner_ehr
  - matrixcare
  - twilio_sms
  - sendgrid_email

triggers:
  voice:
    - "check room {room_number}"
    - "what's the status of {resident_name}"
    - "show me today's alerts"
    - "send update to {family_member}"
    - "who needs wellness checks"
    - "generate IEQ report"
    - "medication reminder for {room_number}"
    
  scheduled:
    - cron: "0 8 * * *"
    - cron: "0 20 * * *"
    
  event_driven:
    - wellstack_alert_triggered
    - wellstack_ieq_threshold_exceeded
    - wellstack_fall_risk_detected

permissions:
  - read:wellstack_api
  - write:wellstack_api
  - read:ehr_integration
  - send:sms
  - send:email
  - read:calendar
```
