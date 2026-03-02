// WellStack P2 - Mock Wellness Data for Unit 2B (Margaret Chen)

import {
  IEQStatus,
  WellnessScore,
  FallDetectionStatus,
  SleepEnvironment,
  IEQHistoryPoint,
  CircadianStatus,
  BehavioralPatterns,
} from '@/lib/types/wellness';

// Helper functions for date generation
const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

// Generate 24h IEQ history data
export function generateIEQHistory(): IEQHistoryPoint[] {
  const data: IEQHistoryPoint[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Add some realistic variation
    const baseTemp = 72;
    const baseHumidity = 45;
    const baseCO2 = 420;
    
    data.push({
      timestamp,
      temperature: baseTemp + Math.sin(i * 0.5) * 2 + (Math.random() - 0.5),
      humidity: baseHumidity + Math.cos(i * 0.3) * 3 + (Math.random() - 0.5) * 2,
      co2: baseCO2 + Math.sin(i * 0.4) * 50 + (Math.random() - 0.5) * 30,
      pm25: 8 + Math.random() * 4,
      voc: 150 + Math.random() * 50,
    });
  }
  
  return data;
}

// Unit 2B IEQ Status - Good readings
export const mockIEQStatus: IEQStatus = {
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
    temperature: true,
  },
  trend: 'stable',
};

// Unit 2B Wellness Score - 87/100
export const mockWellnessScore: WellnessScore = {
  overall: 87,
  timestamp: new Date(),
  components: {
    ieq: 90,
    sleep: 85,
    safety: 88,
    activity: 84,
  },
  trend: 'improving',
  percentile: 75,
};

// Unit 2B Fall Detection Status - Low risk
export const mockFallDetectionStatus: FallDetectionStatus = {
  profile: {
    level: 'low',
    score: 25,
    factors: {
      gaitAnomaly: false,
      nighttimeActivity: false,
      environmentalHazards: [],
      history: false,
    },
    lastAssessed: new Date(),
  },
  radarStatus: 'online',
  coverage: ['Bedroom', 'Bathroom', 'Hallway'],
  recentActivity: [
    {
      id: 'activity-1',
      timestamp: hoursAgo(2),
      type: 'zone_entry',
      zone: 'Bedroom',
      details: 'Motion detected',
    },
    {
      id: 'activity-2',
      timestamp: hoursAgo(6),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Brief bathroom visit',
      severity: 'low',
    },
    {
      id: 'activity-3',
      timestamp: hoursAgo(8),
      type: 'zone_exit',
      zone: 'Bedroom',
      details: 'Left bedroom',
    },
    {
      id: 'activity-4',
      timestamp: hoursAgo(14),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Brief bathroom visit',
      severity: 'low',
    },
    {
      id: 'activity-5',
      timestamp: hoursAgo(24),
      type: 'zone_entry',
      zone: 'Living Room',
      details: 'Evening activity',
    },
  ],
};

// Unit 2B Sleep Environment - Optimal
export const mockSleepEnvironment: SleepEnvironment = {
  temperature: 68,
  humidity: 50,
  lightLevel: 0.5,
  noiseLevel: 32,
  circadianScore: 92,
  lastLightExposure: hoursAgo(3),
  recommendedBedtime: '10:00 PM',
  status: 'optimal',
  recommendations: [
    'Maintain current bedroom temperature',
    'Keep lights dim after 9:00 PM',
    'Excellent sleep environment conditions',
  ],
};

// Unit 2B Circadian Status - Good adherence
export const mockCircadianStatus: CircadianStatus = {
  currentCCT: 4500,
  currentBrightness: 80,
  currentPhase: 'daytime_focus',
  melanopicEDI: 280,
  mEDITarget: 250,
  adherenceWeekly: 87,
  schedule: [
    { hour: 0, cct: 1800, brightness: 0 },
    { hour: 1, cct: 1800, brightness: 0 },
    { hour: 2, cct: 1800, brightness: 0 },
    { hour: 3, cct: 1800, brightness: 0 },
    { hour: 4, cct: 1800, brightness: 0 },
    { hour: 5, cct: 1800, brightness: 0 },
    { hour: 6, cct: 2700, brightness: 30 },
    { hour: 7, cct: 4000, brightness: 60 },
    { hour: 8, cct: 5000, brightness: 80 },
    { hour: 9, cct: 5500, brightness: 90 },
    { hour: 10, cct: 5500, brightness: 100 },
    { hour: 11, cct: 5500, brightness: 100 },
    { hour: 12, cct: 5500, brightness: 100 },
    { hour: 13, cct: 5500, brightness: 100 },
    { hour: 14, cct: 5000, brightness: 90 },
    { hour: 15, cct: 4500, brightness: 85 },
    { hour: 16, cct: 4000, brightness: 80 },
    { hour: 17, cct: 3500, brightness: 70 },
    { hour: 18, cct: 3000, brightness: 60 },
    { hour: 19, cct: 2700, brightness: 50 },
    { hour: 20, cct: 2400, brightness: 40 },
    { hour: 21, cct: 2000, brightness: 20 },
    { hour: 22, cct: 1800, brightness: 5 },
    { hour: 23, cct: 1800, brightness: 0 },
  ],
  overrideActive: false,
  lastManualOverride: null,
};

// Unit 2B Behavioral Patterns - Normal/Healthy
export const mockBehavioralPatterns: BehavioralPatterns = {
  adlConsistency: 91,
  adlTrend: 'stable',
  heatmap: (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      hours: Array.from({ length: 24 }, (_, h) => {
        // Realistic daily rhythm: sleep 0-6, active 7-21, winding down 22-23
        if (h >= 0 && h <= 5) return 0.05 + Math.random() * 0.1;
        if (h === 6) return 0.3 + Math.random() * 0.2;
        if (h >= 7 && h <= 8) return 0.6 + Math.random() * 0.2;
        if (h >= 9 && h <= 11) return 0.7 + Math.random() * 0.2;
        if (h === 12) return 0.8 + Math.random() * 0.15;
        if (h >= 13 && h <= 16) return 0.5 + Math.random() * 0.3;
        if (h >= 17 && h <= 19) return 0.6 + Math.random() * 0.2;
        if (h >= 20 && h <= 21) return 0.4 + Math.random() * 0.2;
        return 0.15 + Math.random() * 0.15; // 22-23
      }),
    }));
  })(),
  patterns: {
    bathroom: { status: 'normal', changePercent: 2 },
    kitchen: { status: 'regular', mealsDetected: 3 },
    sleepWake: { status: 'consistent', avgWake: '6:45 AM', avgSleep: '10:15 PM' },
    mobility: { status: 'active', dailyMinutes: 142 },
  },
  activeDeviations: [],
};

// ============================================================
// Unit 118 — At-Risk / Intervention Needed (Harold Finch)
// ============================================================

// Unit 118 IEQ Status - Non-compliant
const mockIEQStatus118: IEQStatus = {
  current: {
    timestamp: new Date(),
    temperature: 78,
    humidity: 28,
    co2: 1050,
    voc: 620,
    pm25: 22,
  },
  stats: {
    temperature: { min: 76, max: 82, avg: 78 },
    humidity: { min: 24, max: 32, avg: 28 },
    co2: { min: 850, max: 1200, avg: 1020 },
  },
  compliance: {
    overall: 'violation',
    pm25: false,
    co2: false,
    voc: false,
    humidity: false,
    temperature: false,
  },
  trend: 'declining',
};

// Unit 118 Wellness Score - Critical (42)
const mockWellnessScore118: WellnessScore = {
  overall: 42,
  timestamp: new Date(),
  components: {
    ieq: 35,
    sleep: 38,
    safety: 30,
    activity: 55,
  },
  trend: 'declining',
  percentile: 8,
};

// Unit 118 Fall Detection Status - Active fall event, high risk
const mockFallDetectionStatus118: FallDetectionStatus = {
  profile: {
    level: 'high',
    score: 82,
    factors: {
      gaitAnomaly: true,
      nighttimeActivity: true,
      environmentalHazards: ['Poor lighting in hallway', 'Loose rug in bathroom'],
      history: true,
    },
    lastAssessed: new Date(),
  },
  radarStatus: 'online',
  coverage: ['Bedroom', 'Bathroom', 'Hallway'],
  recentActivity: [
    {
      id: 'fall-118-1',
      timestamp: hoursAgo(6),
      type: 'fall_detected',
      zone: 'Bathroom',
      details: 'Fall detected — resident was on floor for 3 minutes before self-recovery. Staff notified.',
      severity: 'high',
    },
    {
      id: 'fall-118-2',
      timestamp: hoursAgo(14),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Extended bathroom visit — 22 minutes (normally 5-8 min)',
      severity: 'medium',
    },
    {
      id: 'fall-118-3',
      timestamp: hoursAgo(20),
      type: 'gait_anomaly',
      zone: 'Hallway',
      details: 'Gait variability increased 35% vs. 30-day baseline',
      severity: 'medium',
    },
    {
      id: 'fall-118-4',
      timestamp: hoursAgo(38),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: '3rd bathroom visit — elevated frequency',
      severity: 'medium',
    },
    {
      id: 'fall-118-5',
      timestamp: hoursAgo(72),
      type: 'zone_exit',
      zone: 'Unit',
      details: 'Last time resident left the unit',
      severity: 'low',
    },
  ],
};

// Unit 118 Sleep Environment - Poor
const mockSleepEnvironment118: SleepEnvironment = {
  temperature: 78,
  humidity: 28,
  lightLevel: 12,
  noiseLevel: 48,
  circadianScore: 34,
  lastLightExposure: hoursAgo(1),
  recommendedBedtime: '10:00 PM',
  status: 'poor',
  recommendations: [
    'Reduce bedroom temperature to 65-68°F for better sleep',
    'Address light intrusion — 12 lux during sleep hours',
    'Investigate noise source — 48 dB exceeds 35 dB threshold',
    'Circadian lighting overridden 6 times this week',
  ],
};

// Unit 118 Circadian Status - Low adherence, overrides
const mockCircadianStatus118: CircadianStatus = {
  currentCCT: 5500,
  currentBrightness: 100,
  currentPhase: 'night_mode', // Wrong phase for the time — override active
  melanopicEDI: 380,
  mEDITarget: 10, // Should be low at night
  adherenceWeekly: 31,
  schedule: [
    { hour: 0, cct: 1800, brightness: 0 },
    { hour: 1, cct: 1800, brightness: 0 },
    { hour: 2, cct: 1800, brightness: 0 },
    { hour: 3, cct: 1800, brightness: 0 },
    { hour: 4, cct: 1800, brightness: 0 },
    { hour: 5, cct: 1800, brightness: 0 },
    { hour: 6, cct: 2700, brightness: 30 },
    { hour: 7, cct: 4000, brightness: 60 },
    { hour: 8, cct: 5000, brightness: 80 },
    { hour: 9, cct: 5500, brightness: 90 },
    { hour: 10, cct: 5500, brightness: 100 },
    { hour: 11, cct: 5500, brightness: 100 },
    { hour: 12, cct: 5500, brightness: 100 },
    { hour: 13, cct: 5500, brightness: 100 },
    { hour: 14, cct: 5000, brightness: 90 },
    { hour: 15, cct: 4500, brightness: 85 },
    { hour: 16, cct: 4000, brightness: 80 },
    { hour: 17, cct: 3500, brightness: 70 },
    { hour: 18, cct: 3000, brightness: 60 },
    { hour: 19, cct: 2700, brightness: 50 },
    { hour: 20, cct: 2400, brightness: 40 },
    { hour: 21, cct: 2000, brightness: 20 },
    { hour: 22, cct: 1800, brightness: 5 },
    { hour: 23, cct: 1800, brightness: 0 },
  ],
  overrideActive: true,
  lastManualOverride: hoursAgo(2),
};

// Unit 118 Behavioral Patterns - Declining / At-Risk
const mockBehavioralPatterns118: BehavioralPatterns = {
  adlConsistency: 38,
  adlTrend: 'declining',
  heatmap: (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, dayIdx) => ({
      day,
      hours: Array.from({ length: 24 }, (_, h) => {
        // Irregular pattern: long sleep, minimal activity, frequent nighttime waking
        if (h >= 0 && h <= 3) return 0.05 + Math.random() * 0.05;
        if (h === 4) return 0.2 + Math.random() * 0.15; // nighttime waking
        if (h >= 5 && h <= 9) return 0.05 + Math.random() * 0.08;
        if (h >= 10 && h <= 11) return 0.15 + Math.random() * 0.1; // late wake
        if (h >= 12 && h <= 14) return 0.2 + Math.random() * 0.15; // minimal activity
        if (h >= 15 && h <= 17) return 0.1 + Math.random() * 0.1; // sedentary
        if (h >= 18 && h <= 20) return 0.15 + Math.random() * 0.1;
        if (h === 21) return 0.3 + Math.random() * 0.1; // bathroom
        if (h >= 22) return 0.08 + Math.random() * 0.08;
        return 0.1;
      }),
    }));
  })(),
  patterns: {
    bathroom: { status: 'elevated', changePercent: 42 },
    kitchen: { status: 'minimal', mealsDetected: 1 },
    sleepWake: { status: 'irregular', avgWake: '10:30 AM', avgSleep: '1:15 AM' },
    mobility: { status: 'sedentary', dailyMinutes: 28 },
  },
  activeDeviations: [
    {
      pattern: 'fall',
      message: 'Fall detected in bathroom 6 hours ago — staff notified, wellness check pending',
      severity: 'critical',
    },
    {
      pattern: 'isolation',
      message: 'No door unlock or common area visit in 72+ hours — social isolation flag',
      severity: 'critical',
    },
    {
      pattern: 'bathroom',
      message: 'Bathroom visits increased 42% over 7 days — may indicate UTI or GI issue',
      severity: 'warning',
    },
    {
      pattern: 'kitchen',
      message: 'Only 1 meal/day detected — declining from 3 meals/day baseline',
      severity: 'warning',
    },
    {
      pattern: 'gait',
      message: 'Gait variability increased 35% — fall risk elevated',
      severity: 'warning',
    },
  ],
};

// ============================================================
// Unit 204 — Healthy / Good (Dorothy Webb)
// ============================================================

// Unit 204 IEQ Status - Good readings
const mockIEQStatus204: IEQStatus = {
  current: {
    timestamp: new Date(),
    temperature: 72,
    humidity: 48,
    co2: 380,
    voc: 120,
    pm25: 5,
  },
  stats: {
    temperature: { min: 70, max: 73, avg: 72 },
    humidity: { min: 45, max: 50, avg: 48 },
    co2: { min: 350, max: 420, avg: 380 },
  },
  compliance: {
    overall: 'compliant',
    pm25: true,
    co2: true,
    voc: true,
    humidity: true,
    temperature: true,
  },
  trend: 'stable',
};

// Unit 204 Wellness Score - 88/100
const mockWellnessScore204: WellnessScore = {
  overall: 88,
  timestamp: new Date(),
  components: {
    ieq: 92,
    sleep: 85,
    safety: 90,
    activity: 84,
  },
  trend: 'stable',
  percentile: 78,
};

// Unit 204 Fall Detection Status - Low risk
const mockFallDetectionStatus204: FallDetectionStatus = {
  profile: {
    level: 'low',
    score: 18,
    factors: {
      gaitAnomaly: false,
      nighttimeActivity: false,
      environmentalHazards: [],
      history: false,
    },
    lastAssessed: new Date(),
  },
  radarStatus: 'online',
  coverage: ['Bedroom', 'Bathroom', 'Hallway'],
  recentActivity: [
    {
      id: 'activity-204-1',
      timestamp: hoursAgo(1),
      type: 'zone_entry',
      zone: 'Living Room',
      details: 'Morning activity',
    },
    {
      id: 'activity-204-2',
      timestamp: hoursAgo(7),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Brief bathroom visit',
      severity: 'low',
    },
    {
      id: 'activity-204-3',
      timestamp: hoursAgo(10),
      type: 'zone_entry',
      zone: 'Bedroom',
      details: 'Retired for the evening',
    },
  ],
};

// Unit 204 Sleep Environment - Optimal
const mockSleepEnvironment204: SleepEnvironment = {
  temperature: 69,
  humidity: 48,
  lightLevel: 0.3,
  noiseLevel: 28,
  circadianScore: 90,
  lastLightExposure: hoursAgo(4),
  recommendedBedtime: '9:30 PM',
  status: 'optimal',
  recommendations: [
    'Maintain current bedroom temperature',
    'Excellent sleep environment conditions',
    'Continue current evening wind-down routine',
  ],
};

// Unit 204 Circadian Status - Good adherence
const mockCircadianStatus204: CircadianStatus = {
  currentCCT: 4500,
  currentBrightness: 80,
  currentPhase: 'daytime_focus',
  melanopicEDI: 270,
  mEDITarget: 250,
  adherenceWeekly: 89,
  schedule: [
    { hour: 0, cct: 1800, brightness: 0 },
    { hour: 1, cct: 1800, brightness: 0 },
    { hour: 2, cct: 1800, brightness: 0 },
    { hour: 3, cct: 1800, brightness: 0 },
    { hour: 4, cct: 1800, brightness: 0 },
    { hour: 5, cct: 1800, brightness: 0 },
    { hour: 6, cct: 2700, brightness: 30 },
    { hour: 7, cct: 4000, brightness: 60 },
    { hour: 8, cct: 5000, brightness: 80 },
    { hour: 9, cct: 5500, brightness: 90 },
    { hour: 10, cct: 5500, brightness: 100 },
    { hour: 11, cct: 5500, brightness: 100 },
    { hour: 12, cct: 5500, brightness: 100 },
    { hour: 13, cct: 5500, brightness: 100 },
    { hour: 14, cct: 5000, brightness: 90 },
    { hour: 15, cct: 4500, brightness: 85 },
    { hour: 16, cct: 4000, brightness: 80 },
    { hour: 17, cct: 3500, brightness: 70 },
    { hour: 18, cct: 3000, brightness: 60 },
    { hour: 19, cct: 2700, brightness: 50 },
    { hour: 20, cct: 2400, brightness: 40 },
    { hour: 21, cct: 2000, brightness: 20 },
    { hour: 22, cct: 1800, brightness: 5 },
    { hour: 23, cct: 1800, brightness: 0 },
  ],
  overrideActive: false,
  lastManualOverride: null,
};

// Unit 204 Behavioral Patterns - Normal/Healthy
const mockBehavioralPatterns204: BehavioralPatterns = {
  adlConsistency: 89,
  adlTrend: 'stable',
  heatmap: (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      hours: Array.from({ length: 24 }, (_, h) => {
        if (h >= 0 && h <= 5) return 0.05 + Math.random() * 0.1;
        if (h === 6) return 0.35 + Math.random() * 0.15;
        if (h >= 7 && h <= 8) return 0.65 + Math.random() * 0.15;
        if (h >= 9 && h <= 11) return 0.7 + Math.random() * 0.2;
        if (h === 12) return 0.75 + Math.random() * 0.15;
        if (h >= 13 && h <= 16) return 0.55 + Math.random() * 0.25;
        if (h >= 17 && h <= 19) return 0.6 + Math.random() * 0.2;
        if (h >= 20 && h <= 21) return 0.35 + Math.random() * 0.2;
        return 0.1 + Math.random() * 0.1;
      }),
    }));
  })(),
  patterns: {
    bathroom: { status: 'normal', changePercent: 0 },
    kitchen: { status: 'regular', mealsDetected: 3 },
    sleepWake: { status: 'consistent', avgWake: '6:30 AM', avgSleep: '9:45 PM' },
    mobility: { status: 'active', dailyMinutes: 135 },
  },
  activeDeviations: [],
};

// Generate good IEQ history for Unit 204
function generateIEQHistory204(): IEQHistoryPoint[] {
  const data: IEQHistoryPoint[] = [];
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp,
      temperature: 72 + Math.sin(i * 0.5) * 1 + (Math.random() - 0.5) * 0.5,
      humidity: 48 + Math.cos(i * 0.3) * 2 + (Math.random() - 0.5),
      co2: 380 + Math.sin(i * 0.4) * 30 + (Math.random() - 0.5) * 20,
      pm25: 5 + Math.random() * 3,
      voc: 120 + Math.random() * 30,
    });
  }

  return data;
}

// ============================================================
// Unit 312 — Watch / Moderate Concern (Robert Chen)
// ============================================================

// Unit 312 IEQ Status - Borderline
const mockIEQStatus312: IEQStatus = {
  current: {
    timestamp: new Date(),
    temperature: 74,
    humidity: 55,
    co2: 820,
    voc: 380,
    pm25: 13,
  },
  stats: {
    temperature: { min: 72, max: 76, avg: 74 },
    humidity: { min: 50, max: 58, avg: 55 },
    co2: { min: 700, max: 900, avg: 820 },
  },
  compliance: {
    overall: 'warning',
    pm25: true,
    co2: true,
    voc: true,
    humidity: true,
    temperature: true,
  },
  trend: 'declining',
};

// Unit 312 Wellness Score - 67/100
const mockWellnessScore312: WellnessScore = {
  overall: 67,
  timestamp: new Date(),
  components: {
    ieq: 72,
    sleep: 60,
    safety: 75,
    activity: 58,
  },
  trend: 'declining',
  percentile: 32,
};

// Unit 312 Fall Detection Status - Medium risk
const mockFallDetectionStatus312: FallDetectionStatus = {
  profile: {
    level: 'medium',
    score: 48,
    factors: {
      gaitAnomaly: false,
      nighttimeActivity: true,
      environmentalHazards: [],
      history: false,
    },
    lastAssessed: new Date(),
  },
  radarStatus: 'online',
  coverage: ['Bedroom', 'Bathroom', 'Hallway'],
  recentActivity: [
    {
      id: 'activity-312-1',
      timestamp: hoursAgo(2),
      type: 'zone_entry',
      zone: 'Living Room',
      details: 'Minimal movement detected',
    },
    {
      id: 'activity-312-2',
      timestamp: hoursAgo(5),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Extended bathroom visit — 15 minutes',
      severity: 'medium',
    },
    {
      id: 'activity-312-3',
      timestamp: hoursAgo(9),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Second nighttime bathroom visit',
      severity: 'low',
    },
    {
      id: 'activity-312-4',
      timestamp: hoursAgo(18),
      type: 'zone_entry',
      zone: 'Kitchen',
      details: 'Brief kitchen activity',
    },
    {
      id: 'activity-312-5',
      timestamp: hoursAgo(26),
      type: 'zone_exit',
      zone: 'Unit',
      details: 'Left unit briefly',
    },
  ],
};

// Unit 312 Sleep Environment - Fair
const mockSleepEnvironment312: SleepEnvironment = {
  temperature: 74,
  humidity: 55,
  lightLevel: 4,
  noiseLevel: 38,
  circadianScore: 58,
  lastLightExposure: hoursAgo(1),
  recommendedBedtime: '10:00 PM',
  status: 'fair',
  recommendations: [
    'Reduce bedroom temperature to 68-70\u00B0F for better sleep',
    'Dim lights earlier in the evening',
    'Consider addressing humidity levels',
  ],
};

// Unit 312 Circadian Status - Moderate adherence
const mockCircadianStatus312: CircadianStatus = {
  currentCCT: 4000,
  currentBrightness: 75,
  currentPhase: 'daytime_focus',
  melanopicEDI: 220,
  mEDITarget: 250,
  adherenceWeekly: 62,
  schedule: [
    { hour: 0, cct: 1800, brightness: 0 },
    { hour: 1, cct: 1800, brightness: 0 },
    { hour: 2, cct: 1800, brightness: 0 },
    { hour: 3, cct: 1800, brightness: 0 },
    { hour: 4, cct: 1800, brightness: 0 },
    { hour: 5, cct: 1800, brightness: 0 },
    { hour: 6, cct: 2700, brightness: 30 },
    { hour: 7, cct: 4000, brightness: 60 },
    { hour: 8, cct: 5000, brightness: 80 },
    { hour: 9, cct: 5500, brightness: 90 },
    { hour: 10, cct: 5500, brightness: 100 },
    { hour: 11, cct: 5500, brightness: 100 },
    { hour: 12, cct: 5500, brightness: 100 },
    { hour: 13, cct: 5500, brightness: 100 },
    { hour: 14, cct: 5000, brightness: 90 },
    { hour: 15, cct: 4500, brightness: 85 },
    { hour: 16, cct: 4000, brightness: 80 },
    { hour: 17, cct: 3500, brightness: 70 },
    { hour: 18, cct: 3000, brightness: 60 },
    { hour: 19, cct: 2700, brightness: 50 },
    { hour: 20, cct: 2400, brightness: 40 },
    { hour: 21, cct: 2000, brightness: 20 },
    { hour: 22, cct: 1800, brightness: 5 },
    { hour: 23, cct: 1800, brightness: 0 },
  ],
  overrideActive: false,
  lastManualOverride: hoursAgo(48),
};

// Unit 312 Behavioral Patterns - Declining
const mockBehavioralPatterns312: BehavioralPatterns = {
  adlConsistency: 58,
  adlTrend: 'declining',
  heatmap: (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      hours: Array.from({ length: 24 }, (_, h) => {
        if (h >= 0 && h <= 4) return 0.05 + Math.random() * 0.08;
        if (h === 5) return 0.15 + Math.random() * 0.1;
        if (h >= 6 && h <= 8) return 0.2 + Math.random() * 0.15;
        if (h >= 9 && h <= 11) return 0.35 + Math.random() * 0.2;
        if (h === 12) return 0.4 + Math.random() * 0.15;
        if (h >= 13 && h <= 16) return 0.25 + Math.random() * 0.2;
        if (h >= 17 && h <= 19) return 0.3 + Math.random() * 0.15;
        if (h >= 20 && h <= 21) return 0.2 + Math.random() * 0.15;
        return 0.08 + Math.random() * 0.1;
      }),
    }));
  })(),
  patterns: {
    bathroom: { status: 'elevated', changePercent: 18 },
    kitchen: { status: 'declining', mealsDetected: 2 },
    sleepWake: { status: 'shifting', avgWake: '8:30 AM', avgSleep: '11:45 PM' },
    mobility: { status: 'declining', dailyMinutes: 65 },
  },
  activeDeviations: [
    {
      pattern: 'activity',
      message: 'Daily activity has declined 28% over the past 2 weeks',
      severity: 'warning',
    },
    {
      pattern: 'bathroom',
      message: 'Nighttime bathroom visits have increased — 2-3 per night vs. baseline of 1',
      severity: 'info',
    },
  ],
};

// Generate borderline IEQ history for Unit 312 (declining trend: 73 -> 67)
function generateIEQHistory312(): IEQHistoryPoint[] {
  const data: IEQHistoryPoint[] = [];
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Gradual worsening trend
    const trendFactor = (24 - i) / 24;
    data.push({
      timestamp,
      temperature: 73 + trendFactor * 1.5 + Math.sin(i * 0.4) * 1 + (Math.random() - 0.5),
      humidity: 52 + trendFactor * 3 + Math.cos(i * 0.3) * 2 + (Math.random() - 0.5),
      co2: 720 + trendFactor * 100 + Math.sin(i * 0.4) * 40 + (Math.random() - 0.5) * 30,
      pm25: 10 + trendFactor * 3 + Math.random() * 3,
      voc: 320 + trendFactor * 60 + Math.random() * 40,
    });
  }

  return data;
}

// Generate degraded IEQ history for Unit 118
function generateIEQHistory118(): IEQHistoryPoint[] {
  const data: IEQHistoryPoint[] = [];
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp,
      temperature: 78 + Math.sin(i * 0.3) * 2 + (Math.random() - 0.5),
      humidity: 28 + Math.cos(i * 0.3) * 3 + (Math.random() - 0.5) * 2,
      co2: 950 + Math.sin(i * 0.4) * 100 + (Math.random() - 0.5) * 60,
      pm25: 18 + Math.random() * 8,
      voc: 550 + Math.random() * 120,
    });
  }

  return data;
}

// WELL v2 Compliance Thresholds
export const WELL_THRESHOLDS = {
  pm25: { good: 15, warning: 35 },
  co2: { good: 900, warning: 1000 },
  voc: { good: 500, warning: 1000 },
  temperature: { min: 68, max: 78, warningMin: 64, warningMax: 82 },
  humidity: { min: 30, max: 60, warningMin: 25, warningMax: 70 },
} as const;

// IEQ Scoring Algorithm (0-100)
export function calculateIEQScore(ieq: IEQStatus): number {
  const { current } = ieq;
  
  const pm25Score = current.pm25 <= WELL_THRESHOLDS.pm25.good ? 100 : 
                    current.pm25 <= WELL_THRESHOLDS.pm25.warning ? 70 : 40;
  
  const co2Score = current.co2 <= WELL_THRESHOLDS.co2.good ? 100 :
                   current.co2 <= WELL_THRESHOLDS.co2.warning ? 80 : 50;
  
  const vocScore = current.voc <= WELL_THRESHOLDS.voc.good ? 100 :
                   current.voc <= WELL_THRESHOLDS.voc.warning ? 75 : 50;
  
  const tempScore = current.temperature >= WELL_THRESHOLDS.temperature.min && 
                    current.temperature <= WELL_THRESHOLDS.temperature.max ? 100 : 
                    current.temperature >= WELL_THRESHOLDS.temperature.warningMin && 
                    current.temperature <= WELL_THRESHOLDS.temperature.warningMax ? 70 : 40;
  
  const humidityScore = current.humidity >= WELL_THRESHOLDS.humidity.min && 
                        current.humidity <= WELL_THRESHOLDS.humidity.max ? 100 :
                        current.humidity >= WELL_THRESHOLDS.humidity.warningMin && 
                        current.humidity <= WELL_THRESHOLDS.humidity.warningMax ? 75 : 50;

  return Math.round((pm25Score + co2Score + vocScore + tempScore + humidityScore) / 5);
}

// Wellness Score Calculation
export function calculateWellnessScore(
  ieqScore: number,
  sleepScore: number,
  safetyScore: number,
  activityScore: number
): number {
  return Math.round(
    ieqScore * 0.30 +
    sleepScore * 0.25 +
    safetyScore * 0.25 +
    activityScore * 0.20
  );
}

// Get IEQ compliance status text
export function getIEQComplianceText(status: IEQStatus['compliance']['overall']): string {
  switch (status) {
    case 'compliant':
      return 'WELL Compliant';
    case 'warning':
      return 'WELL Warning';
    case 'violation':
      return 'WELL Violation';
    default:
      return 'Unknown';
  }
}

// Get trend icon/indicator
export function getTrendIndicator(trend: 'improving' | 'stable' | 'declining'): { icon: string; color: string } {
  switch (trend) {
    case 'improving':
      return { icon: '↗', color: 'text-green-500' };
    case 'stable':
      return { icon: '→', color: 'text-slate-400' };
    case 'declining':
      return { icon: '↘', color: 'text-red-500' };
  }
}

// Mock data by unit ID
export const wellnessDataByUnit: Record<string, {
  ieq: IEQStatus;
  wellnessScore: WellnessScore;
  fallDetection: FallDetectionStatus;
  sleepEnvironment: SleepEnvironment;
  circadian: CircadianStatus;
  behavioral: BehavioralPatterns;
  history: IEQHistoryPoint[];
}> = {
  '2b': {
    ieq: mockIEQStatus,
    wellnessScore: mockWellnessScore,
    fallDetection: mockFallDetectionStatus,
    sleepEnvironment: mockSleepEnvironment,
    circadian: mockCircadianStatus,
    behavioral: mockBehavioralPatterns,
    history: generateIEQHistory(),
  },
  '118': {
    ieq: mockIEQStatus118,
    wellnessScore: mockWellnessScore118,
    fallDetection: mockFallDetectionStatus118,
    sleepEnvironment: mockSleepEnvironment118,
    circadian: mockCircadianStatus118,
    behavioral: mockBehavioralPatterns118,
    history: generateIEQHistory118(),
  },
  '204': {
    ieq: mockIEQStatus204,
    wellnessScore: mockWellnessScore204,
    fallDetection: mockFallDetectionStatus204,
    sleepEnvironment: mockSleepEnvironment204,
    circadian: mockCircadianStatus204,
    behavioral: mockBehavioralPatterns204,
    history: generateIEQHistory204(),
  },
  '312': {
    ieq: mockIEQStatus312,
    wellnessScore: mockWellnessScore312,
    fallDetection: mockFallDetectionStatus312,
    sleepEnvironment: mockSleepEnvironment312,
    circadian: mockCircadianStatus312,
    behavioral: mockBehavioralPatterns312,
    history: generateIEQHistory312(),
  },
};

// Helper to get wellness data for a unit
export function getWellnessDataForUnit(unitId: string) {
  return wellnessDataByUnit[unitId] || wellnessDataByUnit['2b'];
}
