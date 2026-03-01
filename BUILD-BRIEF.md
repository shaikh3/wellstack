# WellStack Build Brief — Claude Code Execution Spec

**Purpose:** Complete the WellStack demo frontend across all pillars and cross-cutting layers. P1 and P2 have already been partially built by a previous agent (OpenClaw). This spec covers everything needed for a polished, demo-ready platform. Backend wiring comes later — this is about a frontend that looks finished and shows capability.

**Audience:** Claude Code (builder), Khayyam (approval)

**⚠️ CRITICAL FIRST STEP: CODEBASE AUDIT**

Before writing ANY new code, Claude Code must:

1. **Read the entire existing codebase** — understand the file structure, component library, design system, routing, data model, and mock data patterns already in place.
2. **Inventory what exists for P1** — The base smart home dashboard (portfolio view, property view, unit detail, device cards, alert feed, access control, HVAC, leak detection, fleet management) should already be built. Confirm what's there and what's functional.
3. **Inventory what exists for P2** — Some wellness intelligence components have been built (likely wellness score cards, IEQ monitoring, possibly circadian and fall detection cards). Identify exactly which P2 components exist, their quality level, and whether they match the specs below.
4. **Identify gaps** — Compare existing components against this full spec. Build only what's missing or incomplete. Do NOT rebuild working components.
5. **Match the existing design system** — All new components must use the same theme, card components, color tokens, typography, and layout patterns already in the codebase. Zero visual inconsistency.

**Approach:** Extend and complete the existing application. Every new component plugs into the established shell. Reference the existing codebase for design system tokens, component patterns, and data model structure. DO NOT build a separate app — extend what's there.

---

## 0. Design System Reference (From P1 — MATCH THIS)

Claude Code MUST read the existing codebase to match these patterns exactly:

- **Theme:** Dark mode primary. Background ~#0F1117. Institutional density — Bloomberg terminal aesthetic, NOT consumer app.
- **Color system:** Green = normal/good. Yellow = attention/warning. Red = alert/critical. Blue = informational. Use these consistently for all status indicators across P2–P4.
- **Typography:** Clean sans-serif. Monospaced for data values. Large metric values, small labels.
- **Cards:** Consistent card component with header, key metric, status indicator, optional action buttons. P1 already has `StatusCard` and `DeviceCard` — P2–P4 cards should use the same base component.
- **Layout density:** More data per screen than consumer apps. Operators scan dashboards. Dense is good.
- **Responsive:** Desktop-first. Tablet secondary. No mobile.

### Extension Points Already in P1

The P1 Unit Detail view has reserved layout slots for these cards. Claude Code fills them:

| Slot | Pillar | Component to Build |
|------|--------|--------------------|
| IEQ Mini Card | P2 | Air quality summary with WELL threshold indicators |
| Wellness Score Card | P2 | Composite 0–100 score with trend and breakdown |
| Circadian Card | P2 | Lighting schedule adherence and current CCT |
| Fall/Safety Card | P2 | Presence status, fall events, risk level |
| Sleep Environment Card | P2 | Overnight environmental conditions |
| Alert/Escalation Panel | P3 | Active intervention workflows |
| RPM Status Card | P3 | Enrollment status, compliance tracking |
| Community Context | P4 | Community wellness snippet |

The P1 data model has nullable extension fields on the `Unit` object:
```typescript
wellnessSignals: {}      // ← P2 fills this
wellnessScore: {}        // ← P2 fills this
activeInterventions: []  // ← P3 fills this
rpmStatus: {}           // ← P3 fills this
communityEngagement: {} // ← P4 fills this
```

The P1 `Alert` model already has: `category: 'device' | 'wellness' | 'safety' | 'compliance'` — P2/P3 alerts use the wellness, safety, and compliance categories.

---

## 1. PILLAR 2: WELLNESS INTELLIGENCE

> **AUDIT NOTE:** P2 components have been partially built by OpenClaw. Before building anything in this section, check the existing codebase for each component. If a component exists and looks good — skip it or polish it. If it exists but is incomplete or doesn't match the spec below — upgrade it. If it doesn't exist — build it fresh. The specs below represent the target state for each component.

### 1.1 Unit Detail — Wellness Cards (fills P1 extension slots)

These cards appear in the Unit Detail view's right column, alongside the existing P1 device cards.

#### Wellness Score Card (HERO — most prominent position)

The platform's signature metric. "Credit score for your living environment."

**Layout:**
- Large circular gauge or radial chart: score 0–100, color-coded (green 80–100, yellow 60–79, red <60)
- Trend arrow (↑ ↓ →) with delta from 7 days ago
- Sub-score breakdown as small horizontal bars or mini gauges:
  - IEQ (air quality) — weighted ~30%
  - Safety (fall risk, detection coverage) — weighted ~25%
  - Lighting (circadian adherence) — weighted ~20%
  - Activity (behavioral patterns, ADL consistency) — weighted ~15%
  - Sleep (environment optimization) — weighted ~10%
- Each sub-score shows its own 0–100 value and color
- Tap/click sub-score → expand to show contributing factors

**Mock data shape:**
```typescript
interface WellnessScore {
  overall: number           // 0-100
  trend: 'improving' | 'stable' | 'declining'
  delta7d: number           // change from 7 days ago (+3, -5, etc.)
  lastUpdated: ISO8601
  subscores: {
    ieq: { score: number, factors: { pm25: number, co2: number, voc: number, humidity: number, temp: number } }
    safety: { score: number, factors: { fallRisk: 'low' | 'moderate' | 'high', detectionCoverage: number, lastIncident: ISO8601 | null } }
    lighting: { score: number, factors: { circadianAdherence: number, avgDaytimeMEDI: number, eveningCompliance: number } }
    activity: { score: number, factors: { adlConsistency: number, mobilityScore: number, bathroomPattern: 'normal' | 'elevated' | 'concerning' } }
    sleep: { score: number, factors: { envScore: number, avgTempOvernight: number, lightIntrusion: number, noiseLevel: number } }
  }
}
```

**Visual states:**
- Normal (score 80+): Green accent, no alerts
- Attention (score 60–79): Yellow accent, yellow dot on sub-scores dragging it down
- Critical (score <60): Red accent, pulsing indicator, specific sub-scores highlighted

---

#### IEQ Card (Indoor Environmental Quality)

**Layout:**
- 5 metrics in a compact grid: PM2.5, CO2, TVOC, Humidity, Temperature
- Each metric shows: current value, unit, status indicator (green/yellow/red dot)
- Status based on WELL Building Standard v2 thresholds:
  - PM2.5: Green <15 µg/m³, Yellow 15–35, Red >35
  - CO2: Green <900 ppm, Yellow 900–1200, Red >1200
  - TVOC: Green <500 µg/m³, Yellow 500–1000, Red >1000
  - Humidity: Green 30–60% RH, Yellow 25–30 or 60–70, Red <25 or >70
  - Temperature: Green 20–26°C, Yellow 18–20 or 26–28, Red <18 or >28
- Small sparkline per metric showing last 24 hours
- WELL compliance badge: "WELL Compliant" (green) or "X Exceedances" (yellow/red) based on threshold breaches in last 24h
- Click → expands to full IEQ detail view (see 1.2)

**Mock data shape:**
```typescript
interface IEQSummary {
  pm25: { value: number, unit: 'µg/m³', status: 'good' | 'fair' | 'poor', history24h: number[] }
  co2: { value: number, unit: 'ppm', status: 'good' | 'fair' | 'poor', history24h: number[] }
  tvoc: { value: number, unit: 'µg/m³', status: 'good' | 'fair' | 'poor', history24h: number[] }
  humidity: { value: number, unit: '%RH', status: 'good' | 'fair' | 'poor', history24h: number[] }
  temperature: { value: number, unit: '°C', status: 'good' | 'fair' | 'poor', history24h: number[] }
  wellCompliance: { compliant: boolean, exceedances24h: number, lastExceedance: ISO8601 | null }
  sensorModel: string  // "Awair Element" or "Kaiterra Sensedge Mini"
  lastUpdated: ISO8601
}
```

---

#### Circadian Lighting Card

**Layout:**
- Current lighting state: CCT value (e.g., "4500K"), brightness %, labeled phase ("Morning Energize", "Daytime Focus", "Evening Wind-Down", "Night Mode")
- 24-hour timeline bar showing the circadian protocol schedule — color gradient from warm (low CCT, amber) to cool (high CCT, blue-white) to warm again. Current time marker on the bar.
- Adherence metric: "87% adherence this week" — percentage of time lighting matched the prescribed protocol
- Key metric: "Melanopic EDI" — current value with target reference:
  - Daytime target: ≥250 mEDI (per PLOS Biology consensus)
  - Pre-sleep target: <10 mEDI
  - During sleep target: <1 mEDI
- Small status: "Manual override active" or "Following schedule"

**Mock data shape:**
```typescript
interface CircadianStatus {
  currentCCT: number          // Color temp in Kelvin
  currentBrightness: number   // 0-100%
  currentPhase: 'morning_energize' | 'daytime_focus' | 'evening_winddown' | 'night_mode'
  melanopicEDI: number        // current melanopic equivalent daylight illuminance
  mEDITarget: number          // target for current phase
  adherenceWeekly: number     // 0-100%
  schedule: { hour: number, cct: number, brightness: number }[]  // 24-point schedule
  overrideActive: boolean
  lastManualOverride: ISO8601 | null
}
```

---

#### Fall/Safety Card

**Layout:**
- Top: Risk level badge — "Low Risk" (green), "Moderate Risk" (yellow), "High Risk" (red)
- Presence status: "In unit" / "Away" / "Sleeping" with last motion timestamp
- Fall event summary: "0 falls (90 days)" or "1 fall — Feb 14, 2026" with severity
- If recent fall event: expandable incident detail (timestamp, room, response time, outcome)
- Gait trend indicator: small trend line showing gait variability over 30 days, with annotation if trending toward higher fall risk
- Sensor coverage: "3/4 rooms covered" with room list showing which have mmWave sensors

**Mock data shape:**
```typescript
interface SafetyStatus {
  riskLevel: 'low' | 'moderate' | 'high'
  presenceState: 'in_unit' | 'away' | 'sleeping'
  lastMotion: ISO8601
  currentRoom: string | null     // "bedroom", "bathroom", "living_room", "kitchen"
  fallEvents90d: number
  lastFallEvent: {
    timestamp: ISO8601
    room: string
    severity: 'minor' | 'moderate' | 'severe'
    responseTimeSec: number
    outcome: string
  } | null
  gaitTrend: { date: string, variability: number }[]  // 30-day trend
  sensorCoverage: { room: string, covered: boolean, sensorType: string }[]
}
```

---

#### Sleep Environment Card

**Layout:**
- Last night summary bar: overall sleep environment score (0–100)
- 4 mini metrics in a row:
  - Bedroom temp overnight: avg value + optimal range indicator
  - Light intrusion: "< 1 lux" (green) or "5 lux detected" (red)
  - Noise level: avg dB + events above threshold
  - Air quality overnight: avg PM2.5 and CO2 during sleep hours
- 7-day trend: small line chart of nightly sleep environment scores
- Key insight: one-liner like "Temperature dropped to 16°C at 3am — consider thermostat schedule adjustment"

**Mock data shape:**
```typescript
interface SleepEnvironment {
  lastNightScore: number
  metrics: {
    temperature: { avg: number, min: number, max: number, optimal: [number, number] } // optimal: [18, 22]°C
    lightIntrusion: { avgLux: number, maxLux: number, status: 'optimal' | 'suboptimal' }
    noise: { avgDb: number, eventsAboveThreshold: number, threshold: number }
    airQuality: { avgPM25: number, avgCO2: number }
  }
  trend7d: { date: string, score: number }[]
  insight: string | null
}
```

---

#### Behavioral Pattern Card

**Layout:**
- ADL (Activities of Daily Living) consistency score: 0–100 with trend
- Activity heatmap: 7-day × 24-hour grid showing movement intensity per hour (think GitHub contribution graph but for daily activity). Color intensity = movement level.
- Key pattern indicators (as small pills/badges):
  - Bathroom frequency: "Normal" / "Elevated (↑23%)" / "Low"
  - Kitchen usage: "Regular" / "Declining"
  - Sleep/wake timing: "Consistent" / "Shifting later" / "Irregular"
  - Mobility: "Active" / "Declining" / "Sedentary"
- Deviation alert: if any pattern deviates beyond threshold, show a yellow/red callout: "Bathroom visits increased 40% over 7 days — may indicate UTI"

**Mock data shape:**
```typescript
interface BehavioralPatterns {
  adlConsistency: number  // 0-100
  adlTrend: 'stable' | 'improving' | 'declining'
  heatmap: { day: string, hours: number[] }[]  // 7 days × 24 values (0-1 intensity)
  patterns: {
    bathroom: { status: 'normal' | 'elevated' | 'low', changePercent: number }
    kitchen: { status: 'regular' | 'declining' | 'minimal', mealsDetected: number }
    sleepWake: { status: 'consistent' | 'shifting' | 'irregular', avgWake: string, avgSleep: string }
    mobility: { status: 'active' | 'declining' | 'sedentary', dailyMinutes: number }
  }
  activeDeviations: { pattern: string, message: string, severity: 'info' | 'warning' | 'critical' }[]
}
```

---

### 1.2 IEQ Detail View (Full Page)

**Route:** `/properties/[id]/units/[id]/ieq`

Clicking the IEQ card on the Unit Detail expands to a dedicated IEQ analysis page.

**Layout:**
- **Top row:** 5 large metric cards (PM2.5, CO2, TVOC, Humidity, Temp) — current value, WELL threshold bar (showing where the current value sits relative to the threshold), 24h sparkline, min/max/avg for the day
- **Chart section:** Selectable time range (24h / 7d / 30d / 90d). Line chart showing all 5 metrics overlaid or individually selectable. Threshold lines drawn as horizontal dashed lines in red.
- **WELL Compliance section:**
  - Compliance status per metric: hours in compliance vs. hours out of compliance (stacked bar per metric)
  - Overall compliance percentage for the reporting period
  - Exceedance log: table showing each threshold breach (timestamp, metric, value, duration, whether auto-remediation was triggered)
- **Remediation log:** History of automated actions taken (e.g., "Feb 15 14:23 — CO2 exceeded 1200 ppm → HVAC fan speed increased → Resolved in 12 min")
- **Sensor info:** Device model, serial, last calibration, placement confirmation

---

### 1.3 Wellness Score Detail View (Full Page)

**Route:** `/properties/[id]/units/[id]/wellness`

Clicking the Wellness Score hero card expands to a full breakdown.

**Layout:**
- **Hero section:** Large circular/radial gauge with the overall score. Animated on load.
- **Sub-score panel:** 5 cards in a row, one per sub-score (IEQ, Safety, Lighting, Activity, Sleep). Each shows:
  - Score value (0–100)
  - Weight percentage (shows how much it affects overall)
  - Contributing factors as small metrics
  - Trend arrow
- **Trend chart:** 30/60/90 day line chart of overall wellness score with annotations for significant events (fall detected, IEQ exceedance, behavioral deviation)
- **Score history table:** Daily score with delta, sorted most recent first
- **Comparison context:** "Property average: 76" / "Portfolio average: 72" — shows how this unit compares (uses mock data)

---

### 1.4 Property-Level Wellness Dashboard

**Route:** `/properties/[id]/wellness`

New tab/section on the Property View (alongside existing P1 operational views).

**Layout:**
- **Wellness Score Distribution:** Histogram or bar chart showing how units distribute across score ranges (80–100, 60–79, <60). Quick read: "82% of units above 80."
- **IEQ Heatmap:** Grid of all units, colored by IEQ status (green/yellow/red). Hover shows key metrics. Click → unit detail.
- **Active Wellness Alerts:** Feed of all wellness-category alerts across the property (IEQ breaches, fall events, behavioral deviations). Sorted by severity/recency.
- **Trend summary:** Property-wide average wellness score over time (30d line chart).
- **Top concerns:** Top 5 units with lowest wellness scores or active deviations — quick action list for property manager.

---

## 2. PILLAR 3: INTERVENTION & TRUST

> **BUILD NOTE:** P3 components are likely net-new. Check the codebase to confirm — if any alert escalation or intervention UI exists from P1's alert system, extend it rather than replacing it.

### 2.1 Unit Detail — Intervention Cards (fills P1 extension slots)

#### Alert/Escalation Panel

**Layout (sidebar or panel within unit detail):**
- **Active interventions list:** Each shows:
  - Alert type icon + label (IEQ breach, fall detected, behavioral deviation, device failure)
  - Severity badge (critical/warning/info)
  - Timestamp and duration since triggered
  - Current escalation tier: Tier 1 (auto-remediation) → Tier 2 (staff notification) → Tier 3 (supervisor) → Tier 4 (emergency)
  - Assigned responder (if any)
  - Status: New → Acknowledged → In Progress → Resolved
  - Action buttons: Acknowledge, Assign, Escalate, Resolve
- **Response time indicator:** Time since alert vs. SLA target (e.g., "12 min / 15 min SLA" with progress bar)
- **Resolution log:** Collapsed section showing completed interventions with response times and outcomes

**Mock data shape:**
```typescript
interface Intervention {
  id: string
  type: 'ieq_breach' | 'fall_detected' | 'behavioral_deviation' | 'device_failure' | 'isolation_alert' | 'rpm_compliance'
  severity: 'critical' | 'warning' | 'info'
  title: string          // "CO2 exceeded 1200 ppm in Unit 204"
  description: string
  triggeredAt: ISO8601
  currentTier: 1 | 2 | 3 | 4
  escalationHistory: { tier: number, timestamp: ISO8601, action: string }[]
  assignedTo: string | null
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved'
  resolvedAt: ISO8601 | null
  slaMinutes: number
  responseTimeSec: number | null
}
```

---

#### RPM Status Card

**Layout:**
- Enrollment status badge: "Enrolled" (green), "Eligible — Not Enrolled" (yellow), "Not Eligible" (gray)
- If enrolled:
  - Billing period: "Feb 1–28, 2026"
  - 16-day compliance tracker: visual showing days with data transmission (16 out of 28 required for CPT 99454). Progress bar or calendar grid with filled/empty days.
  - Device transmission status: List of RPM devices (BP monitor, scale, etc.) with last transmission timestamp
  - Monthly billing eligibility: "Eligible — 18/16 days transmitted" or "At Risk — 11/16 days, 5 remaining"
  - Synchronous interaction log: "Last clinician review: Feb 20" (required for CPT 99457)
- CMS billing codes displayed: CPT 99453 (setup), 99454 (device supply/data), 99457 (clinical time), 99458 (additional time)
- Revenue indicator: "$91–$168/patient/month" with actual current-month estimate

**Mock data shape:**
```typescript
interface RPMStatus {
  enrolled: boolean
  eligible: boolean
  enrollmentDate: ISO8601 | null
  billingPeriod: { start: string, end: string }
  complianceDays: number          // days with valid data transmission this period
  requiredDays: number            // 16
  periodDaysTotal: number         // 28-31
  devices: {
    type: 'blood_pressure' | 'weight_scale' | 'glucose_monitor' | 'pulse_oximeter'
    model: string
    lastTransmission: ISO8601
    status: 'active' | 'offline' | 'needs_attention'
  }[]
  lastClinicianReview: ISO8601 | null
  currentMonthRevenue: number     // estimated billing amount
  billingCodes: { code: string, description: string, rate: number, eligible: boolean }[]
}
```

---

### 2.2 Alert Command Center (Full Page)

**Route:** `/alerts` (extends existing P1 alert view)

The P1 alert page shows device alerts. P3 extends this to show ALL alert categories with escalation workflow management.

**Layout:**
- **Filter bar:** Category (Device | Wellness | Safety | Compliance), Severity (Critical | Warning | Info), Status (New | Acknowledged | In Progress | Resolved), Property, Building, Time range
- **Alert feed:** Unified chronological feed with:
  - Category icon (device=wrench, wellness=leaf, safety=shield, compliance=clipboard)
  - Severity color strip (left border)
  - Unit + property reference
  - Alert message
  - Time since triggered
  - Escalation tier indicator (dots or steps: ● ● ○ ○ = tier 2 of 4)
  - Current assignee
  - Quick actions: Acknowledge, Assign, Escalate, Resolve
- **Alert detail slide-out panel:** Clicking an alert opens side panel with:
  - Full event details and sensor data that triggered the alert
  - Escalation timeline: visual step-through of each tier with timestamps
  - Response actions taken
  - Related alerts (same unit, same time window)
  - Resolution notes field
- **Dashboard summary bar (top):**
  - Total active alerts by severity
  - Average response time today vs. SLA
  - Alerts resolved today
  - Overdue alerts (past SLA)

---

### 2.3 WELL Compliance Dashboard

**Route:** `/properties/[id]/compliance`

New tab on Property View — specifically for WELL Building Standard compliance tracking.

**Layout:**
- **Overall compliance scorecard:** Percentage of units meeting WELL v2 thresholds across all metrics. Large donut chart or progress ring.
- **Metric-by-metric breakdown:** Table/grid showing each WELL metric (PM2.5, CO2, TVOC, Humidity, Temp, Lighting, Acoustics), threshold value, % of units compliant, trend direction
- **Non-compliant units list:** Filterable table of units currently breaching any WELL threshold — metric, current value, duration, auto-remediation status
- **Certification evidence panel:**
  - Sensor deployment: count and placement compliance (1 per 325 m², 1.1–1.7m height)
  - Data collection: % of required 10-min intervals captured
  - Exceedance report: exportable summary for WELL auditors
  - "Generate WELL Report" button (placeholder — shows intent)
- **Historical compliance trend:** 30/60/90 day line chart of overall compliance percentage

---

### 2.4 Incident Documentation View

**Route:** `/properties/[id]/incidents`

Formal incident log for liability protection.

**Layout:**
- **Incident table:** Sortable by date, type, unit, severity, status
  - Types: Fall, Environmental Exceedance, Device Failure, Behavioral Alert, Water Damage
  - Each row: timestamp, unit, type, severity, response time, responder, resolution status, documentation completeness (% of fields filled)
- **Incident detail view (click to expand):**
  - Event timeline with all sensor data at time of incident
  - Auto-generated narrative: "At 14:23 EST, mmWave sensor in Unit 204 bathroom detected a fall event. Staff member J. Rodriguez was notified at 14:24 (1 min). On-site response at 14:29 (6 min). Resident assessed — no injury. Incident closed at 14:45."
  - Attached evidence: sensor logs, alert escalation trail, response actions
  - Status: Open → Documented → Reviewed → Closed
  - "Export as PDF" button (placeholder)

---

## 3. PILLAR 4: COMMUNITY INTELLIGENCE

> **BUILD NOTE:** P4 components are net-new. Nothing in this section should exist in the current codebase.

### 3.1 Community Dashboard (Full Page)

**Route:** `/properties/[id]/community`

New major section on the Property View. This is what sells senior living operators — "Will Mom thrive here?"

**Layout:**

#### Community Wellness Score (Hero)
- Large score display (0–100) — distinct from unit-level wellness score
- Sub-components as horizontal bars:
  - Social Engagement Density (% of residents participating in community activities)
  - IEQ Compliance (% of common areas + units meeting WELL thresholds)
  - Safety Incident Rate (inverse — lower is better)
  - Activity Programming Utilization
  - Resident Satisfaction Proxy (composite of engagement + retention)
- Trend line: 30-day community score trend
- Benchmark: "vs. Portfolio Average: +4 points" (for operators with multiple properties)

#### Social Isolation Monitor
- **At-risk residents panel:** List of residents flagged for potential isolation
  - Trigger criteria: hasn't left unit in 48+ hours, declining community engagement, no dining hall visits in 72+ hours
  - Each entry: resident name/unit, days since last community interaction, last dining attendance, activity participation trend (sparkline), risk level (yellow/red)
  - Action button: "Create Wellness Check" (triggers P3 intervention workflow)
- **Community engagement heatmap:** 7-day view showing hourly activity across common areas. Visual like a building activity pulse.

#### Common Area Utilization
- **Area cards:** One per common space (Lobby, Dining Hall, Fitness Center, Activity Room, Garden/Patio, Library)
  - Current occupancy (live or simulated)
  - Peak hours bar chart (24h)
  - Weekly utilization trend
  - Utilization rate vs. capacity
- **Utilization overview:** Property floorplan or grid showing all common areas with heat intensity for current activity level

#### Activity Programming
- **Upcoming events list:** Calendar-style view of community programming (exercise class, bingo, movie night, garden club, etc.)
  - Each event: name, time, location, expected attendance, actual attendance (for past events)
- **Engagement trends:** Chart showing participation rates over time by activity category (Physical, Social, Educational, Creative)
- **Top activities:** Ranked list by attendance rate
- **Declining participation alert:** Flag activities with >20% attendance drop over 30 days

#### Dining Engagement
- **Meal participation dashboard:**
  - Today's participation rate per meal (breakfast, lunch, dinner) as progress bars
  - 7-day and 30-day trend lines
  - Residents with declining participation (flagged list — feeds into isolation detection)
- **Peak dining times:** Histogram of dining hall arrivals by time

---

### 3.2 Family Dashboard

**Route:** `/family/[resident-id]`

This is a separate view — what an adult child sees when they log in to check on Mom.

**Layout:**
- **Warm, reassuring tone.** Not clinical. Not property management. This is "your loved one is thriving."
- **Hero:** Resident name, photo placeholder, community name. Large wellness score with friendly label: "Excellent" / "Good" / "Needs Attention" instead of raw numbers.
- **Activity summary card:**
  - "Active today" / "Resting" / "In community spaces"
  - Activity level this week vs. last week (simple up/down arrow)
  - Community events attended this week (count + list)
- **Environment quality card:**
  - Simple air quality indicator: "Air quality is excellent" with green badge
  - Temperature comfort: "72°F — comfortable range"
  - No raw ppm/µg values — translate to plain language
- **Safety card:**
  - "No incidents this month" (green) or "1 minor incident — Feb 14" (with detail)
  - "Fall detection active in all rooms" — reassurance, not technical
- **Weekly digest:** Summary section mimicking what an email digest would look like:
  - "This week: Mom attended 3 community events, maintained her walking routine, and her living environment has been consistently healthy."
- **Comparison (subtle):** "Margaret's wellness score is above the community average" — gives family confidence
- **Privacy notice:** "Margaret has authorized you to view this information. She can update sharing preferences anytime."

---

### 3.3 Portfolio Benchmarking View

**Route:** `/portfolio/wellness`

For operators with multiple properties. Executive-level view.

**Layout:**
- **Property comparison table:**
  - Properties as rows
  - Columns: Community Wellness Score, Avg Unit Wellness Score, Fall Rate (per 1000 resident-days), IEQ Compliance %, Social Engagement Rate, RPM Enrollment %, Occupancy
  - Sortable by any column
  - Color-coded cells (green/yellow/red based on performance)
- **Rankings:** Properties ranked by community wellness score with sparkline trends
- **Outlier detection:** Flag properties significantly above or below portfolio averages
- **Portfolio summary metrics (top bar):**
  - Portfolio-wide average wellness score
  - Total active wellness alerts
  - Portfolio-wide fall rate
  - RPM revenue (aggregate estimate)

---

## 4. CROSS-CUTTING: NAVIGATION UPDATES

### New Routes to Add

```
EXISTING P1:
  /dashboard                          ← Portfolio view
  /properties/[id]                    ← Property detail
  /properties/[id]/units/[id]         ← Unit detail
  /alerts                             ← Alert triage

NEW P2–P4:
  /properties/[id]/units/[id]/ieq     ← IEQ detail (P2)
  /properties/[id]/units/[id]/wellness ← Wellness score detail (P2)
  /properties/[id]/wellness            ← Property wellness dashboard (P2)
  /properties/[id]/compliance          ← WELL compliance (P3)
  /properties/[id]/incidents           ← Incident documentation (P3)
  /properties/[id]/community           ← Community intelligence (P4)
  /family/[resident-id]               ← Family dashboard (cross-cutting)
  /portfolio/wellness                  ← Portfolio benchmarking (P4)
```

### Sidebar Navigation Updates

Add new sections to the existing sidebar:

```
OPERATIONS (existing P1)
  📊 Dashboard
  🏢 Properties
  🔔 Alerts
  🔧 Fleet Management
  🔑 Access Control
  ❄️  HVAC Management
  💧 Leak Detection

WELLNESS (new — P2)
  💚 Wellness Overview        → /properties/[id]/wellness
  🌡️  IEQ Monitoring          → links to property-level IEQ
  🌙 Circadian Lighting       → (future detail page, for now links to unit)
  🛡️  Safety & Falls           → (future detail page)

INTERVENTIONS (new — P3)
  ⚡ Alert Center             → /alerts (enhanced)
  📋 WELL Compliance          → /properties/[id]/compliance
  📝 Incident Log             → /properties/[id]/incidents
  💊 RPM Management           → (future detail page)

COMMUNITY (new — P4)
  👥 Community Dashboard      → /properties/[id]/community
  📈 Portfolio Analytics      → /portfolio/wellness

FAMILY (separate experience — different nav entirely)
  This uses its own minimal nav, not the operator sidebar
```

---

## 5. MOCK DATA REQUIREMENTS

### Approach

**Check what mock data already exists in the codebase first.** P1 and P2 builds will have established mock data patterns, file locations, and data shapes. Extend them — do NOT create a parallel mock data system.

If existing mock data follows a different structure than what's described below, adapt to the existing pattern. Consistency with what's already built is more important than matching this spec exactly.

For any NEW mock data needed (P3 interventions, P4 community data, family dashboard), follow the same patterns and file organization as the existing mock data.

1. **Consistent across views:** The same unit's wellness score should match between the unit detail card and the property wellness dashboard.
2. **Realistic patterns:** IEQ values should follow daily patterns (CO2 rises during occupied hours, drops when windows open). Activity should have daily rhythms. Don't use random values.
3. **Demo scenarios baked in:**
   - Unit 204: High wellness score (88), everything green — the "good unit"
   - Unit 312: Moderate score (67), elevated bathroom frequency, IEQ yellow — the "watch this one" unit
   - Unit 118: Low score (42), recent fall event, social isolation flag, IEQ non-compliant — the "intervention needed" unit
   - Property average: 76
4. **Time-series data:** Generate 90 days of history for trend charts. Use sinusoidal patterns with noise, not flat lines.
5. **Community data:** 3 properties in portfolio, 50–200 units each, with varying wellness score distributions.
6. **Family dashboard:** At least 2 mock "family member" views — one for a healthy/engaged resident, one for a resident with concerns.

### Mock Data File Structure (if creating new — check existing structure first)

If the codebase already has a mock data directory, add new files alongside existing ones. If not, use this structure:

```
  wellness-scores.ts     ← Unit-level wellness scores and sub-scores
  ieq-data.ts           ← IEQ sensor readings with time series
  circadian-data.ts     ← Lighting schedules and adherence
  safety-data.ts        ← Fall events, risk levels, gait trends
  sleep-data.ts         ← Overnight environment data
  behavioral-data.ts    ← ADL patterns, heatmaps
  interventions.ts      ← Active and historical interventions
  rpm-data.ts           ← RPM enrollment and compliance
  community-data.ts     ← Common area utilization, social isolation, dining, activities
  family-data.ts        ← Family dashboard views
  portfolio-data.ts     ← Multi-property comparison data
  index.ts              ← Exports all mock data with consistent cross-references
```

---

## 6. COMPONENT CHECKLIST

### P2 Components — AUDIT FIRST, then fill gaps
- [ ] `WellnessScoreCard` — Hero card with gauge, sub-scores, trend (MAY EXIST)
- [ ] `WellnessScoreDetail` — Full page breakdown (MAY EXIST)
- [ ] `IEQCard` — Compact 5-metric grid with WELL thresholds (MAY EXIST)
- [ ] `IEQDetail` — Full page with charts, compliance, remediation log (MAY EXIST)
- [ ] `CircadianCard` — Timeline bar, CCT, adherence, mEDI (MAY EXIST)
- [ ] `FallSafetyCard` — Risk level, presence, events, gait trend (MAY EXIST)
- [ ] `SleepEnvironmentCard` — Overnight metrics, 7-day trend (CHECK)
- [ ] `BehavioralPatternCard` — ADL score, heatmap, pattern indicators (CHECK)
- [ ] `PropertyWellnessDashboard` — Score distribution, IEQ heatmap, alerts (CHECK)

### P3 Components — likely net-new
- [ ] `InterventionPanel` — Active interventions with escalation tiers
- [ ] `RPMStatusCard` — Enrollment, compliance tracker, billing codes
- [ ] `AlertCommandCenter` — Enhanced alert page with all categories
- [ ] `WELLComplianceDashboard` — Metric compliance, sensor audit, evidence
- [ ] `IncidentDocumentation` — Incident table, detail view, timeline

### P4 Components — net-new
- [ ] `CommunityWellnessScore` — Community-level composite metric
- [ ] `SocialIsolationMonitor` — At-risk residents, engagement heatmap
- [ ] `CommonAreaUtilization` — Area cards, occupancy, peak hours
- [ ] `ActivityProgramming` — Event calendar, engagement trends
- [ ] `DiningEngagement` — Meal participation, declining trends
- [ ] `FamilyDashboard` — Complete separate experience
- [ ] `PortfolioBenchmarking` — Multi-property comparison table

### Shared/Utility — check what exists, add what's missing
- [ ] `WellnessStatusDot` — Reusable green/yellow/red indicator
- [ ] `SparklineChart` — Small inline trend chart
- [ ] `ThresholdBar` — Shows value position relative to threshold
- [ ] `EscalationSteps` — Visual tier indicator for interventions
- [ ] `ComplianceBadge` — WELL compliant/non-compliant badge
- [ ] `TrendArrow` — Score change indicator
- [ ] Mock data service with all data shapes above

---

## 7. CRITICAL IMPLEMENTATION NOTES

1. **AUDIT FIRST.** Read the entire existing codebase before touching anything. Understand the design system, component library, routing structure, and mock data patterns. Then build only what's missing.

2. **P1 is done. Don't touch it** unless something is broken. The base smart home dashboard (portfolio, property, unit detail, device cards, alerts, access control, HVAC, leak detection, fleet management) should be functional.

3. **P2 is partially done. Fill the gaps.** Some wellness cards (wellness score, IEQ, possibly circadian, fall detection) may already exist. Compare what's built against the specs in Section 1 above. Upgrade or complete — don't rebuild from scratch.

4. **P3, P4, Family Dashboard, and Portfolio Benchmarking are likely net-new.** Build these fresh, but using the exact same design system, card components, and layout patterns from the existing P1/P2 code.

5. **Match the existing design system exactly.** Dark mode. Dense. Institutional. Read the existing CSS/theme before writing any new styles. Use the existing card component as base — don't create a parallel card system.

6. **Extension points are real.** The P1 Unit Detail view has reserved slots for P2 cards. Drop them into those slots — don't restructure the layout.

7. **Alert categories are already in the data model.** P1 alerts use `category: 'device'`. P2/P3 alerts use `'wellness'`, `'safety'`, `'compliance'`. Same alert feed, new categories.

8. **The Family Dashboard is a SEPARATE experience.** Different nav, different tone, different visual language. Warmer, lighter, simpler. It is NOT the operator dashboard with fewer features — it's a fundamentally different product surface.

9. **The Wellness Score is the hero metric.** It should feel like the single most important number on any screen it appears. Design it like a credit score — immediately understood, immediately actionable.

10. **WELL Building Standard thresholds are specific numbers.** Don't make them up. The thresholds listed in this spec are from WELL v2 — use them exactly.

11. **Demo flow in mind:** David Carlson will likely see: Portfolio → Property → Unit 204 (good) → Unit 118 (concerning) → see the alert escalation → see the wellness score react → zoom out to community view → portfolio benchmarking. Every screen should flow naturally in that narrative.

12. **Mock data consistency.** If P1/P2 already has mock data, extend it — don't create a parallel mock data system. Add wellness/intervention/community fields to existing unit/property objects.

---

## 8. WHAT "DONE" LOOKS LIKE

Claude Code delivers a complete, polished dashboard where ALL of the following work — whether they were built fresh or already existed and were verified/upgraded:

**P1 (verify existing — don't rebuild):**
- [ ] Portfolio view shows properties with device health and alert counts
- [ ] Property view shows unit grid with color-coded status
- [ ] Unit detail shows device cards with realistic mock data
- [ ] Lock, thermostat, leak sensor cards functional
- [ ] Alert feed shows device alerts
- [ ] Navigation works across portfolio → property → unit

**P2 (audit, fill gaps, polish):**
- [ ] Unit detail view shows all 6 wellness cards (Wellness Score, IEQ, Circadian, Safety, Sleep, Behavioral) with realistic mock data
- [ ] Wellness Score card is visually the hero — large, prominent, clear sub-score breakdown
- [ ] IEQ card shows real WELL v2 thresholds with green/yellow/red status
- [ ] Clicking IEQ card opens full IEQ detail page with time-series charts
- [ ] Clicking Wellness Score opens full detail page with sub-score breakdown and trends
- [ ] Property Wellness Dashboard shows score distribution and IEQ heatmap across units

**P3 (likely net-new):**
- [ ] Alert feed includes wellness/safety/compliance alerts alongside device alerts
- [ ] Intervention panel shows escalation tiers with visual progression
- [ ] RPM Status card shows 16-day compliance tracker with calendar grid
- [ ] WELL Compliance dashboard shows metric-by-metric property compliance
- [ ] Incident documentation page shows formal incident log with auto-generated narratives

**P4 (net-new):**
- [ ] Community Dashboard shows isolation monitor, common area utilization, dining, activities
- [ ] Community Wellness Score displays as distinct from unit-level score
- [ ] Portfolio Benchmarking shows multi-property comparison with wellness metrics

**Cross-cutting (net-new):**
- [ ] Family Dashboard is a separate, warm, non-technical experience
- [ ] Navigation sidebar includes new P2/P3/P4 sections

**Overall:**
- [ ] All mock data is consistent across views and follows realistic patterns
- [ ] Everything uses the same dark mode, institutional-grade design system
- [ ] Three demo scenario units exist: Unit 204 (good), Unit 312 (watch), Unit 118 (intervention needed)
- [ ] Zero visual inconsistency between existing and new components
