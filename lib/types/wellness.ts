// WellStack P2 - Wellness Intelligence Types

// IEQ (Indoor Environmental Quality)
export interface IEQReading {
  timestamp: Date;
  temperature: number; // °F
  humidity: number; // %
  co2: number; // ppm
  voc: number; // ppb (total volatile organic compounds)
  pm25: number; // µg/m³
}

export interface IEQStats {
  min: number;
  max: number;
  avg: number;
}

export interface IEQStatus {
  current: IEQReading;
  // 24h rolling stats
  stats: {
    temperature: IEQStats;
    humidity: IEQStats;
    co2: IEQStats;
  };
  // WELL v2 compliance
  compliance: {
    overall: 'compliant' | 'warning' | 'violation';
    pm25: boolean;
    co2: boolean;
    voc: boolean;
    humidity: boolean;
    temperature: boolean;
  };
  trend: 'improving' | 'stable' | 'declining';
}

// Wellness Score
export interface WellnessScore {
  overall: number; // 0-100
  timestamp: Date;
  components: {
    ieq: number; // 0-100 (30% weight)
    sleep: number; // 0-100 (25% weight)
    safety: number; // 0-100 (25% weight)
    activity: number; // 0-100 (20% weight)
  };
  trend: 'improving' | 'stable' | 'declining';
  percentile?: number; // vs. property average
}

// Fall Risk Assessment
export interface FallRiskFactors {
  gaitAnomaly?: boolean;
  nighttimeActivity?: boolean; // frequent bathroom trips
  environmentalHazards?: string[]; // poor lighting, obstacles
  history?: boolean; // previous falls
}

export interface FallRiskProfile {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-100 (higher = more risk)
  factors: FallRiskFactors;
  lastAssessed: Date;
}

export interface FallActivityEntry {
  id: string;
  timestamp: Date;
  type: 'fall_detected' | 'nighttime_waking' | 'gait_anomaly' | 'zone_entry' | 'zone_exit';
  zone?: string;
  details?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface FallDetectionStatus {
  profile: FallRiskProfile;
  radarStatus: 'online' | 'offline' | 'calibrating';
  coverage: string[]; // zones covered
  recentActivity: FallActivityEntry[];
}

// Sleep Environment
export interface SleepEnvironment {
  // Current conditions
  temperature: number; // bedroom temp °F
  humidity: number; // %
  lightLevel: number; // lux (0 = dark)
  noiseLevel: number; // dB
  
  // Circadian alignment
  circadianScore: number; // 0-100
  lastLightExposure?: Date;
  recommendedBedtime: string; // e.g., "10:00 PM"
  
  // Status
  status: 'optimal' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

// Intervention System
export type InterventionStatus = 'standby' | 'monitoring' | 'active' | 'escalated';

export interface AlertThreshold {
  metric: string;
  operator: 'lt' | 'gt' | 'eq';
  value: number;
  action: 'notify' | 'escalate' | 'maintenance';
}

export interface InterventionConfig {
  status: InterventionStatus;
  thresholds: AlertThreshold[];
  lastTriggered?: Date;
}

// 24h historical data point for charts
export interface IEQHistoryPoint {
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  pm25: number;
  voc: number;
}
