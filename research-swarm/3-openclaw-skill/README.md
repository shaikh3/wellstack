# WellStack Senior Living - OpenClaw Skill

🎙️ Voice-powered facility management for senior living communities

## Quick Start

```bash
openclaw skills install wellstack-senior-living
openclaw skills config wellstack-senior-living
```

## Voice Commands

| Command | Description |
|---------|-------------|
| "Check room 204" | Room IEQ and status |
| "Show me today's alerts" | Active alerts list |
| "Who needs wellness checks?" | Prioritized check list |
| "Generate IEQ report" | Environmental summary |
| "Send update to family" | Family notification |
| "Medication reminder for room 204" | Room medication alert |

## Configuration

Required:
- `facility_id`: Your WellStack facility ID
- `api_key`: Your WellStack API key

Optional:
- EHR integration (Epic, Cerner, MatrixCare)
- Alert thresholds
- Notification preferences

## Example Dialog

**Staff:** "Check room 204"
**WellStack:** "Room 204 for Mary Johnson. Temperature 72°F, comfortable. Humidity 45%. CO2 850ppm, good air quality. No active alerts."

**Staff:** "Who needs wellness checks?"
**WellStack:** "5 pending, sorted by fall risk. Room 208 highest priority - John Smith, fall risk 82/100."

**Staff:** "Generate IEQ report"
**WellStack:** "7-day report: Air quality score 87/100. WELL compliance: A01 pass, T01 pass, L01 needs attention in Wing B."

## Files

- `SKILL.md` - Skill manifest
- `config.json` - Configuration schema
- `main.js` - Skill implementation
