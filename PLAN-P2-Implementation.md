# P2 Implementation Plan

## Overview
Building P2 Wellness Intelligence layer for WellStack platform. This transforms the 5 placeholder cards in Unit Detail into real wellness monitoring capabilities with IEQ, Wellness Score, Fall Detection, Sleep Environment, and Intervention Status.

## Files to Create/Modify

### Data Layer
1. **lib/types/wellness.ts** - New TypeScript interfaces for P2 wellness data
2. **lib/mock/wellnessData.ts** - Mock data for Unit 2B (Margaret Chen)
3. **lib/store/wellnessStore.ts** - Zustand store for wellness state management

### Components
4. **components/wellness/IEQCard.tsx** - Real IEQ monitoring with WELL compliance
5. **components/wellness/WellnessScoreCard.tsx** - Score display with component breakdown
6. **components/wellness/FallDetectionCard.tsx** - Risk assessment with mmWave radar status
7. **components/wellness/SleepEnvironmentCard.tsx** - Sleep conditions and circadian score
8. **components/wellness/InterventionStatusCard.tsx** - Alert thresholds and status

### Integration
9. **components/unit/UnitDetail.tsx** - Replace placeholders with real components

### Type Extensions
10. **lib/types/index.ts** - Update existing types to use new wellness interfaces

---

## Component Specifications

### IEQCard
**Props Interface:**
```typescript
interface IEQCardProps {
  unitId: string;
}
```

**Features:**
- Real-time readings display (Temperature, Humidity, CO2, VOC, PM2.5)
- 24h mini sparkline charts using Recharts
- WELL v2 compliance badges (green/yellow/red status)
- Alert indicators for threshold violations
- Trend indicators (↗ improving, → stable, ↘ declining)
- Color-coded status indicators

**Data Displayed:**
- Temperature: 72°F [Good]
- Humidity: 45% [Good]
- CO2: 420ppm [Good]
- VOC: 150 ppb [Compliant ✓]
- PM2.5: 8 µg/m³ [Compliant ✓]

### WellnessScoreCard
**Props Interface:**
```typescript
interface WellnessScoreCardProps {
  unitId: string;
}
```

**Features:**
- Large circular score display (0-100)
- Component breakdown bars (IEQ, Sleep, Safety, Activity)
- Trend indicator with point change
- Property average comparison
- Animated score ring using Framer Motion

**Algorithm:**
- IEQ: 30% weight → 90 score
- Sleep: 25% weight → 85 score
- Safety: 25% weight → 88 score
- Activity: 20% weight → 84 score
- Overall: 87/100

### FallDetectionCard
**Props Interface:**
```typescript
interface FallDetectionCardProps {
  unitId: string;
}
```

**Features:**
- Risk level badge (Low/Medium/High) with color coding
- mmWave radar coverage status
- Zone-based presence tracking (Bedroom, Bath, Hall)
- Recent activity log (nighttime wakings)
- Alert history

**Data for Unit 2B:**
- Risk Level: Low ✓
- Radar Status: Online
- Coverage: Bedroom, Bath, Hall
- Last 7 Days: No incidents, 2 nighttime wakings

### SleepEnvironmentCard
**Props Interface:**
```typescript
interface SleepEnvironmentCardProps {
  unitId: string;
}
```

**Features:**
- Current bedroom conditions (Temp, Humidity, Light, Noise)
- Circadian score (0-100)
- Sleep recommendations
- Lighting schedule display
- Optimal for sleep indicator

**Data for Unit 2B:**
- Temp: 68°F [Ideal]
- Humidity: 50% [Ideal]
- Light: <1 lux [Dark ✓]
- Circadian Score: 92/100
- Lights dim at 9:00 PM

### InterventionStatusCard
**Props Interface:**
```typescript
interface InterventionStatusCardProps {
  unitId: string;
}
```

**Features:**
- Current status (Standby/Active)
- Configured alert thresholds
- Wellness Score < 70 → Notify
- Fall Risk High → Escalate
- IEQ Violation → Maintenance

---

## State Management

### WellnessStore Structure
```typescript
interface WellnessState {
  // Data by unit ID
  ieqData: Record<string, IEQStatus>;
  wellnessScores: Record<string, WellnessScore>;
  fallRiskProfiles: Record<string, FallRiskProfile>;
  sleepEnvironments: Record<string, SleepEnvironment>;
  
  // Loading states
  isLoadingIEQ: boolean;
  isLoadingScore: boolean;
  isLoadingFallRisk: boolean;
  isLoadingSleepEnv: boolean;
  
  // Actions
  fetchIEQData: (unitId: string) => Promise<void>;
  calculateWellnessScore: (unitId: string) => WellnessScore;
  fetchFallRisk: (unitId: string) => Promise<void>;
  fetchSleepEnvironment: (unitId: string) => Promise<void>;
  refreshAllWellnessData: (unitId: string) => Promise<void>;
}
```

---

## Mock Data for Unit 2B (Margaret Chen)

### IEQ Status
```typescript
{
  current: {
    timestamp: new Date(),
    temperature: 72,
    humidity: 45,
    co2: 420,
    voc: 150,
    pm25: 8,
  },
  stats: {
    temperature: { min: 70, max: 74, avg: 72 },
    humidity: { min: 42, max: 48, avg: 45 },
    co2: { min: 380, max: 520, avg: 430 },
  },
  compliance: {
    overall: 'compliant',
    pm25: true,
    co2: true,
    voc: true,
    humidity: true,
  },
  trend: 'stable',
}
```

### Wellness Score
```typescript
{
  overall: 87,
  timestamp: new Date(),
  components: {
    ieq: 90,
    sleep: 85,
    safety: 88,
    activity: 84,
  },
  trend: 'improving',
  percentile: 75, // vs property average
}
```

### Fall Risk Profile
```typescript
{
  level: 'low',
  score: 25,
  factors: {
    gaitAnomaly: false,
    nighttimeActivity: false,
    environmentalHazards: [],
    history: false,
  },
  lastAssessed: new Date(),
}
```

### Sleep Environment
```typescript
{
  temperature: 68,
  humidity: 50,
  lightLevel: 0.5,
  noiseLevel: 32,
  circadianScore: 92,
  lastLightExposure: hoursAgo(3),
  recommendedBedtime: '10:00 PM',
}
```

---

## WELL v2 Compliance Thresholds

| Parameter | Good | Warning | Violation |
|-----------|------|---------|-----------|
| PM2.5 | ≤15 µg/m³ | 16-35 | >35 |
| CO2 | ≤900 ppm | 901-1000 | >1000 |
| VOC | ≤500 ppb | 501-1000 | >1000 |
| Temperature | 68-78°F | 64-67 or 79-82 | <64 or >82 |
| Humidity | 30-60% | 25-29 or 61-70 | <25 or >70 |

---

## IEQ Scoring Algorithm (0-100)

```typescript
function calculateIEQScore(ieq: IEQStatus): number {
  const pm25Score = ieq.current.pm25 <= 15 ? 100 : 
                    ieq.current.pm25 <= 35 ? 70 : 40;
  const co2Score = ieq.current.co2 <= 900 ? 100 :
                   ieq.current.co2 <= 1000 ? 80 : 50;
  const vocScore = ieq.current.voc <= 500 ? 100 :
                   ieq.current.voc <= 1000 ? 75 : 50;
  const tempScore = ieq.current.temperature >= 68 && 
                    ieq.current.temperature <= 78 ? 100 : 70;
  const humidityScore = ieq.current.humidity >= 30 && 
                        ieq.current.humidity <= 60 ? 100 : 75;

  return Math.round((pm25Score + co2Score + vocScore + 
                     tempScore + humidityScore) / 5);
}
```

---

## Build Sequence

### Phase 1: Types & Data (30 min)
1. Create `lib/types/wellness.ts` with all interfaces
2. Update `lib/types/index.ts` to import/export wellness types
3. Create `lib/mock/wellnessData.ts` with Unit 2B data
4. Update `lib/mock/data.ts` to use new IEQ/Wellness types

### Phase 2: Store (20 min)
1. Create `lib/store/wellnessStore.ts`
2. Implement all fetch actions with mock delays
3. Add computed score calculation

### Phase 3: IEQCard (45 min)
1. Build component with readings display
2. Add WELL compliance indicators
3. Create sparkline charts using Recharts
4. Add animations with Framer Motion

### Phase 4: WellnessScoreCard (45 min)
1. Implement circular score display
2. Add component breakdown bars
3. Calculate score using algorithm
4. Add trend and comparison indicators

### Phase 5: FallDetectionCard (30 min)
1. Build risk level display with colors
2. Add coverage status section
3. Create activity log display
4. Add radar status indicator

### Phase 6: SleepEnvironmentCard (30 min)
1. Display current conditions
2. Add circadian score visualization
3. Create sleep recommendations
4. Add lighting schedule

### Phase 7: InterventionStatusCard (20 min)
1. Build status display
2. Add threshold configuration UI
3. Create alert rules display

### Phase 8: Integration (20 min)
1. Update `components/unit/UnitDetail.tsx`
2. Replace placeholder imports with real components
3. Wire up wellness store
4. Ensure proper data flow

### Phase 9: Polish (20 min)
1. Test all components render correctly
2. Verify responsive layout
3. Ensure animations are smooth
4. Check TypeScript strict mode compliance

**Total Estimated Time: ~4.5 hours**

---

## Testing Checklist

- [ ] IEQCard shows all 5 readings (temp, humidity, CO2, VOC, PM2.5)
- [ ] WELL compliance badges render correctly
- [ ] Sparkline charts display 24h history
- [ ] Wellness Score calculates correctly (87 for Unit 2B)
- [ ] Component breakdown shows all 4 components
- [ ] Fall risk shows correct level (Low for Unit 2B)
- [ ] Coverage status displays properly
- [ ] Sleep environment shows all conditions
- [ ] Circadian score displays correctly
- [ ] All cards are responsive (desktop + tablet)
- [ ] Animations are smooth with Framer Motion
- [ ] No TypeScript errors (strict mode)
- [ ] Mock data looks realistic for demo

---

## Dependencies

All dependencies already installed in P1:
- ✅ Zustand (state management)
- ✅ Recharts (charts)
- ✅ Framer Motion (animations)
- ✅ Tailwind CSS (styling)
- ✅ shadcn/ui (components)
- ✅ Lucide React (icons)

---

## Design Guidelines

### Color Scheme (Match P1)
- Primary: slate-900 (text), slate-50 (bg)
- Success: green-500/green-100
- Warning: yellow-500/yellow-100
- Danger: red-500/red-100
- Info: blue-500/blue-100

### Spacing (Match P1)
- Card padding: p-4 or p-6
- Gap between cards: gap-4
- Section margins: space-y-4 or space-y-6

### Typography (Match P1)
- Card titles: text-sm font-medium
- Values: text-2xl or text-3xl font-bold
- Labels: text-xs or text-sm text-slate-500

### Animation (Framer Motion)
- Card entrance: opacity 0→1, y 20→0
- Stagger delay: index * 0.1s
- Hover: shadow-md transition
- Score ring: animated circumference

---

## Key Requirements

1. **Match P1 aesthetic** — Use same color scheme, spacing, typography
2. **Replace placeholders** — All 5 placeholder slots become real components
3. **Mock data only** — No real sensor integration yet
4. **TypeScript strict** — No any types, proper interfaces
5. **Recharts for charts** — 24h sparklines in IEQ card
6. **Framer Motion** — Smooth entrance animations
7. **Zustand** — State management for wellness data

---

## When Complete

Emit: `OPENCLAW_DONE: P2 Wellness Intelligence implemented with IEQ, WellnessScore, FallDetection, SleepEnvironment, and InterventionStatus components`
