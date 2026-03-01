import { Property, Unit, Alert, AccessCode, ActivityLogEntry, Device, Resident } from '@/lib/types';
import { IEQStatus, WellnessScore, FallRiskProfile, SleepEnvironment, InterventionConfig } from '@/lib/types/wellness';

// Helper to create dates relative to now
const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Margaret Chen - Demo Resident
export const demoResident: Resident = {
  id: 'resident-margaret-chen',
  name: 'Margaret Chen',
  email: 'margaret.chen@email.com',
  phone: '(512) 555-0123',
  leaseStart: new Date('2024-01-15'),
  leaseEnd: new Date('2025-01-14'),
  accessCode: '2847',
};

// Demo Devices for Unit 2B
export const demoDevices: Device[] = [
  {
    id: 'lock-1',
    unitId: '2b',
    name: 'Front Door',
    type: 'lock',
    status: 'online',
    batteryLevel: 85,
    lastSeenAt: minutesAgo(2),
    state: { type: 'lock', locked: true, lastUsedAt: hoursAgo(2) },
  },
  {
    id: 'therm-1',
    unitId: '2b',
    name: 'Living Room Thermostat',
    type: 'thermostat',
    status: 'online',
    lastSeenAt: minutesAgo(1),
    state: { type: 'thermostat', temperature: 71, targetTemp: 72, mode: 'cool' },
  },
  {
    id: 'leak-1',
    unitId: '2b',
    name: 'Kitchen Sink Sensor',
    type: 'leak_sensor',
    status: 'online',
    lastSeenAt: minutesAgo(5),
    state: { type: 'leak_sensor', wet: false, location: 'Under kitchen sink' },
  },
  {
    id: 'leak-2',
    unitId: '2b',
    name: 'Bathroom Leak Sensor',
    type: 'leak_sensor',
    status: 'online',
    lastSeenAt: minutesAgo(3),
    state: { type: 'leak_sensor', wet: false, location: 'Under bathroom sink' },
  },
  {
    id: 'motion-1',
    unitId: '2b',
    name: 'Living Room Motion',
    type: 'motion_sensor',
    status: 'online',
    lastSeenAt: minutesAgo(0),
    state: { type: 'motion_sensor', motionDetected: true, lastMotionAt: minutesAgo(0) },
  },
];

// P2 IEQ Status for Unit 2B
const demoIEQStatus: IEQStatus = {
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

// P2 Wellness Score for Unit 2B
const demoWellnessScore: WellnessScore = {
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

// P2 Fall Risk Profile for Unit 2B
const demoFallRiskProfile: FallRiskProfile = {
  level: 'low',
  score: 25,
  factors: {
    gaitAnomaly: false,
    nighttimeActivity: false,
    environmentalHazards: [],
    history: false,
  },
  lastAssessed: new Date(),
};

// P2 Sleep Environment for Unit 2B
const demoSleepEnvironment: SleepEnvironment = {
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

// P2 Intervention Config for Unit 2B
const demoInterventionConfig: InterventionConfig = {
  status: 'standby',
  thresholds: [
    { metric: 'Wellness Score', operator: 'lt', value: 70, action: 'notify' },
    { metric: 'Fall Risk', operator: 'eq', value: 3, action: 'escalate' },
    { metric: 'IEQ Violation', operator: 'eq', value: 1, action: 'maintenance' },
  ],
};

// Harold Finch - At-Risk Demo Resident (Unit 118)
export const demoResident118: Resident = {
  id: 'resident-harold-finch',
  name: 'Harold Finch',
  email: 'harold.finch@email.com',
  phone: '(512) 555-0187',
  leaseStart: new Date('2023-06-01'),
  leaseEnd: new Date('2025-05-31'),
  accessCode: '5193',
};

// Devices for Unit 118 - some degraded
export const demoDevices118: Device[] = [
  {
    id: 'lock-118',
    unitId: '118',
    name: 'Front Door',
    type: 'lock',
    status: 'online',
    batteryLevel: 22,
    lastSeenAt: minutesAgo(5),
    state: { type: 'lock', locked: true, lastUsedAt: hoursAgo(72) },
  },
  {
    id: 'therm-118',
    unitId: '118',
    name: 'Living Room Thermostat',
    type: 'thermostat',
    status: 'online',
    lastSeenAt: minutesAgo(2),
    state: { type: 'thermostat', temperature: 78, targetTemp: 78, mode: 'heat' },
  },
  {
    id: 'leak-118',
    unitId: '118',
    name: 'Bathroom Leak Sensor',
    type: 'leak_sensor',
    status: 'online',
    lastSeenAt: minutesAgo(3),
    state: { type: 'leak_sensor', wet: false, location: 'Under bathroom sink' },
  },
  {
    id: 'motion-118',
    unitId: '118',
    name: 'Living Room Motion',
    type: 'motion_sensor',
    status: 'online',
    lastSeenAt: hoursAgo(4),
    state: { type: 'motion_sensor', motionDetected: false, lastMotionAt: hoursAgo(4) },
  },
];

// P2 IEQ Status for Unit 118 - Non-compliant
const demoIEQStatus118: IEQStatus = {
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

// P2 Wellness Score for Unit 118 - Critical (42)
const demoWellnessScore118: WellnessScore = {
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

// P2 Fall Risk Profile for Unit 118 - High risk, recent fall
const demoFallRiskProfile118: FallRiskProfile = {
  level: 'high',
  score: 82,
  factors: {
    gaitAnomaly: true,
    nighttimeActivity: true,
    environmentalHazards: ['Poor lighting in hallway', 'Loose rug in bathroom'],
    history: true,
  },
  lastAssessed: new Date(),
};

// P2 Sleep Environment for Unit 118 - Poor
const demoSleepEnvironment118: SleepEnvironment = {
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
    'Address light intrusion — 12 lux detected during sleep hours',
    'Investigate noise source — 48 dB exceeds recommended 35 dB',
    'Circadian lighting schedule has been overridden 6 times this week',
  ],
};

// P2 Intervention Config for Unit 118 - Active
const demoInterventionConfig118: InterventionConfig = {
  status: 'escalated',
  thresholds: [
    { metric: 'Wellness Score', operator: 'lt', value: 70, action: 'notify' },
    { metric: 'Fall Risk', operator: 'eq', value: 3, action: 'escalate' },
    { metric: 'IEQ Violation', operator: 'eq', value: 1, action: 'maintenance' },
  ],
  lastTriggered: hoursAgo(6),
};

// Demo Unit 118 - At-Risk scenario
export const demoUnit118: Unit = {
  id: '118',
  buildingId: 'building-b',
  propertyId: 'lakeview-commons',
  unitNumber: '118',
  floor: 1,
  status: 'occupied',
  resident: demoResident118,
  devices: demoDevices118,
  ieqStatus: demoIEQStatus118,
  wellnessScore: demoWellnessScore118,
  fallRiskProfile: demoFallRiskProfile118,
  sleepEnvironment: demoSleepEnvironment118,
  interventionConfig: demoInterventionConfig118,
  fallRisk: 'high',
  interventionStatus: 'active',
  communityScore: 2,
};

// Demo Unit 2B with P2 Wellness Intelligence data
export const demoUnit2B: Unit = {
  id: '2b',
  buildingId: 'building-a',
  propertyId: 'lakeview-commons',
  unitNumber: '2B',
  floor: 2,
  status: 'occupied',
  resident: demoResident,
  devices: demoDevices,
  // P2 Wellness Intelligence Data
  ieqStatus: demoIEQStatus,
  wellnessScore: demoWellnessScore,
  fallRiskProfile: demoFallRiskProfile,
  sleepEnvironment: demoSleepEnvironment,
  interventionConfig: demoInterventionConfig,
  // Legacy fields for backwards compatibility
  fallRisk: 'low',
  interventionStatus: 'standby',
  communityScore: 8,
};

// Generate units for Building A
const generateUnits = (buildingId: string, propertyId: string, prefix: string, floorCount: number, unitsPerFloor: number): Unit[] => {
  const units: Unit[] = [];
  const statuses: Array<'occupied' | 'vacant' | 'turn'> = ['occupied', 'occupied', 'occupied', 'occupied', 'occupied', 'vacant', 'turn'];
  
  for (let floor = 1; floor <= floorCount; floor++) {
    for (let unit = 1; unit <= unitsPerFloor; unit++) {
      const unitId = `${floor}${String.fromCharCode(96 + unit)}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const unitData: Unit = {
        id: unitId,
        buildingId,
        propertyId,
        unitNumber: `${floor}${String.fromCharCode(64 + unit)}`,
        floor,
        status,
        devices: [
          {
            id: `lock-${unitId}`,
            unitId,
            name: 'Front Door',
            type: 'lock',
            status: Math.random() > 0.9 ? 'offline' : 'online',
            batteryLevel: Math.floor(Math.random() * 40) + 60,
            lastSeenAt: minutesAgo(Math.floor(Math.random() * 10)),
            state: { type: 'lock', locked: true, lastUsedAt: hoursAgo(Math.floor(Math.random() * 24)) },
          },
          {
            id: `therm-${unitId}`,
            unitId,
            name: 'Thermostat',
            type: 'thermostat',
            status: 'online',
            lastSeenAt: minutesAgo(Math.floor(Math.random() * 10)),
            state: { type: 'thermostat', temperature: 70 + Math.floor(Math.random() * 5), targetTemp: 72, mode: 'cool' },
          },
        ],
      };
      
      if (status === 'occupied') {
        unitData.resident = {
          id: `resident-${unitId}`,
          name: `Resident ${unitId.toUpperCase()}`,
          email: `resident.${unitId}@email.com`,
          phone: `(512) 555-${Math.floor(Math.random() * 8999 + 1000)}`,
          leaseStart: daysAgo(Math.floor(Math.random() * 365)),
          leaseEnd: daysAgo(-Math.floor(Math.random() * 365)),
          accessCode: `${Math.floor(Math.random() * 8999 + 1000)}`,
        };
      }
      
      units.push(unitData);
    }
  }
  
  // Replace one unit with our demo unit
  const demoIndex = units.findIndex(u => u.unitNumber === '2B');
  if (demoIndex >= 0) {
    units[demoIndex] = demoUnit2B;
  }

  // Inject Unit 118 into Building B
  if (buildingId === 'building-b') {
    units.push(demoUnit118);
  }

  return units;
};

// Demo Properties
export const demoProperties: Property[] = [
  {
    id: 'lakeview-commons',
    name: 'Lakeview Commons',
    address: '123 Wellness Way, Austin, TX 78701',
    unitCount: 48,
    occupiedCount: 42,
    vacantCount: 4,
    turnCount: 2,
    deviceHealth: 98,
    pmsSyncStatus: 'synced',
    lastSyncAt: minutesAgo(3),
    buildings: [
      {
        id: 'building-a',
        propertyId: 'lakeview-commons',
        name: 'Building A',
        floors: 3,
        units: generateUnits('building-a', 'lakeview-commons', 'A', 3, 6),
      },
      {
        id: 'building-b',
        propertyId: 'lakeview-commons',
        name: 'Building B',
        floors: 3,
        units: generateUnits('building-b', 'lakeview-commons', 'B', 3, 6),
      },
    ],
  },
  {
    id: 'oak-ridge-villas',
    name: 'Oak Ridge Villas',
    address: '456 Oak Ridge Dr, Austin, TX 78702',
    unitCount: 96,
    occupiedCount: 88,
    vacantCount: 5,
    turnCount: 3,
    deviceHealth: 97,
    pmsSyncStatus: 'synced',
    lastSyncAt: minutesAgo(5),
    buildings: [
      {
        id: 'oak-building-1',
        propertyId: 'oak-ridge-villas',
        name: 'Building 1',
        floors: 4,
        units: generateUnits('oak-building-1', 'oak-ridge-villas', 'O1', 4, 6),
      },
      {
        id: 'oak-building-2',
        propertyId: 'oak-ridge-villas',
        name: 'Building 2',
        floors: 4,
        units: generateUnits('oak-building-2', 'oak-ridge-villas', 'O2', 4, 6),
      },
    ],
  },
  {
    id: 'sunset-gardens',
    name: 'Sunset Gardens',
    address: '789 Sunset Blvd, Austin, TX 78703',
    unitCount: 103,
    occupiedCount: 98,
    vacantCount: 3,
    turnCount: 2,
    deviceHealth: 99,
    pmsSyncStatus: 'synced',
    lastSyncAt: minutesAgo(2),
    buildings: [
      {
        id: 'sunset-building-1',
        propertyId: 'sunset-gardens',
        name: 'Building 1',
        floors: 4,
        units: generateUnits('sunset-building-1', 'sunset-gardens', 'S1', 4, 8),
      },
      {
        id: 'sunset-building-2',
        propertyId: 'sunset-gardens',
        name: 'Building 2',
        floors: 4,
        units: generateUnits('sunset-building-2', 'sunset-gardens', 'S2', 4, 8),
      },
    ],
  },
];

// Demo Alerts
export const demoAlerts: Alert[] = [
  {
    id: 'alert-1',
    propertyId: 'lakeview-commons',
    unitId: '2b',
    deviceId: 'leak-1',
    severity: 'critical',
    type: 'leak_detected',
    title: 'Leak Detected',
    description: 'Water sensor triggered under kitchen sink',
    createdAt: minutesAgo(2),
  },
  {
    id: 'alert-2',
    propertyId: 'lakeview-commons',
    unitId: '1c',
    deviceId: 'lock-1c',
    severity: 'warning',
    type: 'low_battery',
    title: 'Low Battery',
    description: 'Front door lock battery at 15%',
    createdAt: hoursAgo(1),
  },
  {
    id: 'alert-3',
    propertyId: 'oak-ridge-villas',
    unitId: '4a',
    deviceId: 'lock-4a',
    severity: 'critical',
    type: 'device_offline',
    title: 'Lock Offline',
    description: 'Front door lock has been offline for 15 minutes',
    createdAt: minutesAgo(15),
  },
  {
    id: 'alert-4',
    propertyId: 'sunset-gardens',
    unitId: '2f',
    severity: 'warning',
    type: 'thermostat_offline',
    title: 'Thermostat Offline',
    description: 'Living room thermostat not responding',
    createdAt: hoursAgo(2),
  },
  // Unit 118 - Critical wellness alerts
  {
    id: 'alert-118-1',
    propertyId: 'lakeview-commons',
    unitId: '118',
    severity: 'critical',
    type: 'fall_detected',
    title: 'Fall Detected',
    description: 'mmWave sensor detected fall event in bathroom — response pending',
    createdAt: hoursAgo(6),
  },
  {
    id: 'alert-118-2',
    propertyId: 'lakeview-commons',
    unitId: '118',
    severity: 'critical',
    type: 'isolation_alert',
    title: 'Social Isolation Flag',
    description: 'No door unlock or common area visit in 72+ hours — wellness check recommended',
    createdAt: hoursAgo(12),
  },
  {
    id: 'alert-118-3',
    propertyId: 'lakeview-commons',
    unitId: '118',
    severity: 'warning',
    type: 'ieq_violation',
    title: 'IEQ Non-Compliant',
    description: 'CO₂ at 1050 ppm, TVOC at 620 ppb — exceeding WELL v2 thresholds',
    createdAt: hoursAgo(18),
  },
  {
    id: 'alert-118-4',
    propertyId: 'lakeview-commons',
    unitId: '118',
    severity: 'warning',
    type: 'wellness_score_drop',
    title: 'Wellness Score Critical',
    description: 'Wellness score dropped to 42 — down 15 pts in 7 days',
    createdAt: hoursAgo(24),
  },
];

// Demo Access Codes
export const demoAccessCodes: AccessCode[] = [
  {
    id: 'code-1',
    unitId: '2b',
    code: '2847',
    type: 'resident',
    createdAt: daysAgo(45),
    usedCount: 127,
    lastUsedAt: hoursAgo(2),
  },
  {
    id: 'code-2',
    unitId: '2b',
    code: '4921',
    type: 'vendor',
    label: 'Maintenance',
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    createdAt: daysAgo(1),
    usedCount: 3,
    lastUsedAt: hoursAgo(4),
  },
  {
    id: 'code-3',
    unitId: '2b',
    code: '7382',
    type: 'vendor',
    label: 'Cleaning',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: hoursAgo(2),
    usedCount: 0,
  },
];

// Demo Activity Log
export const demoActivityLog: ActivityLogEntry[] = [
  {
    id: 'activity-1',
    unitId: '2b',
    timestamp: minutesAgo(2),
    action: 'Leak alert triggered',
    actor: 'System',
    details: 'Kitchen sink sensor detected water',
  },
  {
    id: 'activity-2',
    unitId: '2b',
    timestamp: hoursAgo(1),
    action: 'Thermostat adjusted',
    actor: 'Margaret Chen',
    details: 'Temperature set to 72°F',
  },
  {
    id: 'activity-3',
    unitId: '2b',
    timestamp: hoursAgo(2),
    action: 'Lock code used',
    actor: 'Vendor #2847',
    details: 'Front door unlocked',
  },
  {
    id: 'activity-4',
    unitId: '2b',
    timestamp: hoursAgo(5),
    action: 'Motion detected',
    actor: 'System',
    details: 'Living room motion sensor',
  },
  {
    id: 'activity-5',
    unitId: '2b',
    timestamp: daysAgo(1),
    action: 'Vendor code created',
    actor: 'Admin',
    details: 'Maintenance code #4921 generated',
  },
];

// Helper to get all units across all properties
export const getAllUnits = (): Unit[] => {
  const units: Unit[] = [];
  demoProperties.forEach(property => {
    property.buildings.forEach(building => {
      units.push(...building.units);
    });
  });
  return units;
};

// Helper to get unit by ID
export const getUnitById = (unitId: string): Unit | undefined => {
  return getAllUnits().find(u => u.id === unitId);
};

// Helper to get property by ID
export const getPropertyById = (propertyId: string): Property | undefined => {
  return demoProperties.find(p => p.id === propertyId);
};
