// WellStack P2 - Mock Wellness Data for Unit 2B (Margaret Chen)

import { 
  IEQStatus, 
  WellnessScore, 
  FallDetectionStatus, 
  SleepEnvironment,
  IEQHistoryPoint 
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
