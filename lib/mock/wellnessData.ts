// WellStack P2 - Mock Wellness Data for Unit 2B (Margaret Chen) and Unit 118 (Eleanor Vasquez)

import { 
  IEQStatus, 
  WellnessScore, 
  FallDetectionStatus, 
  SleepEnvironment,
  IEQHistoryPoint,
  CircadianData,
  BehavioralData,
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
  history: IEQHistoryPoint[];
}> = {
  '2b': {
    ieq: mockIEQStatus,
    wellnessScore: mockWellnessScore,
    fallDetection: mockFallDetectionStatus,
    sleepEnvironment: mockSleepEnvironment,
    history: generateIEQHistory(),
  },
};

// Helper to get wellness data for a unit
export function getWellnessDataForUnit(unitId: string) {
  return wellnessDataByUnit[unitId] || wellnessDataByUnit['2b'];
}

// Circadian Data for Unit 2B
export const mockCircadianData: CircadianData = {
  currentCCT: 4500,
  currentBrightness: 75,
  currentPhase: 'daytime_focus',
  melanopicEDI: 180,
  mEDITarget: 250,
  adherenceWeekly: 87,
  schedule: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    cct: i < 6 ? 2700 : i < 9 ? 4000 : i < 17 ? 5000 : i < 20 ? 3500 : 2700,
    brightness: i < 6 ? 20 : i < 9 ? 60 : i < 17 ? 100 : i < 20 ? 70 : 30
  })),
  overrideActive: false,
  trend: 'stable',
};

// Behavioral Data for Unit 2B
export const mockBehavioralData: BehavioralData = {
  adlConsistency: 82,
  adlTrend: 'stable',
  heatmap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => ({
    day,
    hours: Array.from({ length: 24 }, (_, hour) => {
      let base = 0.1;
      if (hour >= 6 && hour <= 9) base = 0.7;
      if (hour >= 11 && hour <= 13) base = 0.5;
      if (hour >= 17 && hour <= 19) base = 0.6;
      if (hour >= 20) base = 0.2;
      if (hour >= 0 && hour < 6) base = 0.05;
      const noise = Math.random() * 0.2;
      const weekendFactor = (dayIndex === 0 || dayIndex === 6) ? 0.9 : 1;
      return Math.min(1, (base + noise) * weekendFactor);
    })
  })),
  patterns: {
    bathroom: { status: 'normal', changePercent: 0, frequency: 5 },
    kitchen: { status: 'regular', mealsDetected: 3 },
    sleepWake: { status: 'consistent', avgWake: '7:30 AM', avgSleep: '10:30 PM' },
    mobility: { status: 'active', dailyMinutes: 145 }
  },
  activeDeviations: []
};

// ============================================
// UNIT 118 - Eleanor Vasquez (CRITICAL AT-RISK)
// ============================================

// Unit 118 IEQ Status - NON-COMPLIANT (high CO2, TVOC, PM2.5)
export const mockIEQStatus118: IEQStatus = {
  current: {
    timestamp: new Date(),
    temperature: 74,
    humidity: 62,
    co2: 1050,  // NON-COMPLIANT > 1000
    voc: 620,   // NON-COMPLIANT > 500
    pm25: 22,   // NON-COMPLIANT > 15
  },
  stats: {
    temperature: { min: 72, max: 76, avg: 74 },
    humidity: { min: 58, max: 65, avg: 62 },
    co2: { min: 980, max: 1150, avg: 1050 },
  },
  compliance: {
    overall: 'violation',
    pm25: false,
    co2: false,
    voc: false,
    humidity: false,
    temperature: true,
  },
  trend: 'declining',
};

// Unit 118 Wellness Score - 42/100 (CRITICAL)
export const mockWellnessScore118: WellnessScore = {
  overall: 42,
  timestamp: new Date(),
  components: {
    ieq: 35,    // Very poor due to violations
    sleep: 40,  // Poor sleep environment
    safety: 38, // High fall risk
    activity: 55, // Low activity
  },
  trend: 'declining',
  percentile: 12,
};

// Unit 118 Fall Detection - HIGH RISK with recent fall
export const mockFallDetectionStatus118: FallDetectionStatus = {
  profile: {
    level: 'high',
    score: 82,
    factors: {
      gaitAnomaly: true,
      nighttimeActivity: true,
      environmentalHazards: ['poor lighting', 'loose rug'],
      history: true,
    },
    lastAssessed: hoursAgo(6),
  },
  radarStatus: 'online',
  coverage: ['Bedroom', 'Bathroom', 'Hallway'],
  recentActivity: [
    {
      id: 'activity-118-1',
      timestamp: hoursAgo(6),
      type: 'fall_detected',
      zone: 'Bathroom',
      details: 'Fall detected — 6h ago',
      severity: 'high',
    },
    {
      id: 'activity-118-2',
      timestamp: hoursAgo(5),
      type: 'gait_anomaly',
      details: 'Gait anomaly +35% detected post-fall',
      severity: 'high',
    },
    {
      id: 'activity-118-3',
      timestamp: hoursAgo(4),
      type: 'nighttime_waking',
      zone: 'Bathroom',
      details: 'Frequent bathroom trips',
      severity: 'medium',
    },
    {
      id: 'activity-118-4',
      timestamp: hoursAgo(18),
      type: 'zone_entry',
      zone: 'Bedroom',
      details: 'Limited daytime movement',
    },
    {
      id: 'activity-118-5',
      timestamp: hoursAgo(20),
      type: 'zone_exit',
      zone: 'Bedroom',
      details: 'Minimal community engagement',
    },
  ],
};

// Unit 118 Sleep Environment - POOR
export const mockSleepEnvironment118: SleepEnvironment = {
  temperature: 65, // Too cold
  humidity: 65,    // Too high
  lightLevel: 8,   // Too bright
  noiseLevel: 45,  // Elevated
  circadianScore: 45,
  lastLightExposure: hoursAgo(1),
  recommendedBedtime: '10:00 PM',
  status: 'poor',
  recommendations: [
    'Increase bedroom temperature to 68-70°F',
    'Reduce humidity — consider dehumidifier',
    'Address light intrusion from hallway',
    'Investigate noise source',
  ],
};

// Unit 118 Circadian - DECLINING
export const mockCircadianData118: CircadianData = {
  currentCCT: 2200,
  currentBrightness: 30,
  currentPhase: 'night_mode',
  melanopicEDI: 45,
  mEDITarget: 250,
  adherenceWeekly: 42,
  schedule: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    cct: i < 6 ? 2700 : i < 9 ? 4000 : i < 17 ? 5000 : i < 20 ? 3500 : 2700,
    brightness: i < 6 ? 20 : i < 9 ? 60 : i < 17 ? 100 : i < 20 ? 70 : 30
  })),
  overrideActive: false,
  trend: 'declining',
};

// Unit 118 Behavioral - SEDENTARY with deviations
export const mockBehavioralData118: BehavioralData = {
  adlConsistency: 38,
  adlTrend: 'declining',
  heatmap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => ({
    day,
    hours: Array.from({ length: 24 }, (_, hour) => {
      // Very low activity overall
      let base = 0.05;
      if (hour >= 6 && hour <= 9) base = 0.3; // Reduced morning activity
      if (hour >= 11 && hour <= 13) base = 0.2; // Reduced lunch
      if (hour >= 17 && hour <= 19) base = 0.25; // Reduced dinner
      if (hour >= 20) base = 0.1;
      if (hour >= 0 && hour < 6) base = 0.02; // Sleep
      const noise = Math.random() * 0.1;
      return Math.min(1, (base + noise) * 0.5); // 50% of normal activity
    })
  })),
  patterns: {
    bathroom: { status: 'elevated', changePercent: 40, frequency: 8 },
    kitchen: { status: 'declining', mealsDetected: 1 },
    sleepWake: { status: 'irregular', avgWake: '9:30 AM', avgSleep: '11:30 PM' },
    mobility: { status: 'sedentary', dailyMinutes: 28 }
  },
  activeDeviations: [
    {
      pattern: 'bathroom',
      message: 'Bathroom visits increased 40% over 7 days — may indicate UTI or dehydration',
      severity: 'warning'
    },
    {
      pattern: 'social',
      message: '72-hour social isolation flag — no common area visits detected',
      severity: 'critical'
    },
    {
      pattern: 'nutrition',
      message: 'Meal consumption declined to 1x/day — nutritional risk',
      severity: 'warning'
    }
  ]
};

// ============================================
// UNIT 204 - Sarah Mitchell (HEALTHY)
// ============================================

export const mockIEQStatus204: IEQStatus = {
  current: {
    timestamp: new Date(),
    temperature: 72,
    humidity: 48,
    co2: 380,
    voc: 120,
    pm25: 5,
  },
  stats: {
    temperature: { min: 70, max: 74, avg: 72 },
    humidity: { min: 45, max: 52, avg: 48 },
    co2: { min: 350, max: 450, avg: 390 },
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

export const mockWellnessScore204: WellnessScore = {
  overall: 88,
  timestamp: new Date(),
  components: {
    ieq: 95,
    sleep: 88,
    safety: 85,
    activity: 82,
  },
  trend: 'stable',
  percentile: 92,
};

export const mockFallDetectionStatus204: FallDetectionStatus = {
  profile: {
    level: 'low',
    score: 15,
    factors: {
      gaitAnomaly: false,
      nighttimeActivity: false,
      environmentalHazards: [],
      history: false,
    },
    lastAssessed: new Date(),
  },
  radarStatus: 'online',
  coverage: ['Bedroom', 'Bathroom', 'Hallway', 'Living Room'],
  recentActivity: [
    {
      id: 'activity-204-1',
      timestamp: hoursAgo(2),
      type: 'zone_entry',
      zone: 'Living Room',
      details: 'Normal activity',
    },
  ],
};

export const mockSleepEnvironment204: SleepEnvironment = {
  temperature: 69,
  humidity: 52,
  lightLevel: 0.2,
  noiseLevel: 28,
  circadianScore: 94,
  lastLightExposure: hoursAgo(4),
  recommendedBedtime: '10:00 PM',
  status: 'optimal',
  recommendations: [
    'Maintain excellent sleep environment',
    'Keep consistent sleep schedule',
  ],
};

// ============================================
// UNIT 312 - Robert Chen (WATCH - YELLOW)
// ============================================

export const mockIEQStatus312: IEQStatus = {
  current: {
    timestamp: new Date(),
    temperature: 73,
    humidity: 55,
    co2: 680,
    voc: 320,
    pm25: 12,
  },
  stats: {
    temperature: { min: 71, max: 75, avg: 73 },
    humidity: { min: 52, max: 58, avg: 55 },
    co2: { min: 620, max: 750, avg: 680 },
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

export const mockWellnessScore312: WellnessScore = {
  overall: 67,
  timestamp: new Date(),
  components: {
    ieq: 75,
    sleep: 65,
    safety: 68,
    activity: 60,
  },
  trend: 'stable',
  percentile: 45,
};

// Updated wellness data by unit ID
export const wellnessDataByUnit: Record<string, {
  ieq: IEQStatus;
  wellnessScore: WellnessScore;
  fallDetection: FallDetectionStatus;
  sleepEnvironment: SleepEnvironment;
  circadian: CircadianData;
  behavioral: BehavioralData;
  history: IEQHistoryPoint[];
}> = {
  '2b': {
    ieq: mockIEQStatus,
    wellnessScore: mockWellnessScore,
    fallDetection: mockFallDetectionStatus,
    sleepEnvironment: mockSleepEnvironment,
    circadian: mockCircadianData,
    behavioral: mockBehavioralData,
    history: generateIEQHistory(),
  },
  '118': {
    ieq: mockIEQStatus118,
    wellnessScore: mockWellnessScore118,
    fallDetection: mockFallDetectionStatus118,
    sleepEnvironment: mockSleepEnvironment118,
    circadian: mockCircadianData118,
    behavioral: mockBehavioralData118,
    history: generateIEQHistory(),
  },
  '204': {
    ieq: mockIEQStatus204,
    wellnessScore: mockWellnessScore204,
    fallDetection: mockFallDetectionStatus204,
    sleepEnvironment: mockSleepEnvironment204,
    circadian: mockCircadianData,
    behavioral: mockBehavioralData,
    history: generateIEQHistory(),
  },
  '312': {
    ieq: mockIEQStatus312,
    wellnessScore: mockWellnessScore312,
    fallDetection: mockFallDetectionStatus, // Use normal fall detection
    sleepEnvironment: mockSleepEnvironment,
    circadian: mockCircadianData,
    behavioral: {
      ...mockBehavioralData,
      adlConsistency: 65,
      adlTrend: 'stable',
    },
    history: generateIEQHistory(),
  },
};

// Helper to get wellness data for a unit
export function getWellnessDataForUnit(unitId: string) {
  return wellnessDataByUnit[unitId] || wellnessDataByUnit['2b'];
}
