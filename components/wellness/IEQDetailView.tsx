'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  Cpu,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useUnitStore } from '@/lib/store/unitStore';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WELL_THRESHOLDS, getWellnessDataForUnit } from '@/lib/mock/wellnessData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface IEQDetailViewProps {
  propertyId: string;
  unitId: string;
}

// Generate multi-day IEQ history for charts
function generateExtendedHistory(days: number) {
  const data: { timestamp: string; hour: number; temperature: number; humidity: number; co2: number; pm25: number; voc: number }[] = [];
  const now = new Date();

  for (let d = days; d >= 0; d--) {
    for (let h = 0; h < 24; h += (days > 7 ? 4 : 1)) {
      const ts = new Date(now.getTime() - d * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000);
      const hourOfDay = h;

      // Realistic patterns: CO2 rises during occupied hours, temp follows HVAC cycles
      const occupancyFactor = (hourOfDay >= 8 && hourOfDay <= 22) ? 1.0 : 0.3;
      const tempCycle = Math.sin((hourOfDay - 6) * Math.PI / 12) * 2;

      data.push({
        timestamp: ts.toISOString(),
        hour: hourOfDay,
        temperature: 72 + tempCycle + (Math.random() - 0.5) * 1.5,
        humidity: 45 + Math.cos(hourOfDay * 0.3) * 5 + (Math.random() - 0.5) * 3,
        co2: 380 + occupancyFactor * 150 + Math.sin(hourOfDay * 0.5) * 60 + (Math.random() - 0.5) * 40,
        pm25: 6 + occupancyFactor * 4 + Math.random() * 3,
        voc: 120 + occupancyFactor * 80 + Math.random() * 40,
      });
    }
  }

  return data;
}

// Generate exceedance log entries
function generateExceedanceLogs() {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  return [
    { id: '1', timestamp: hoursAgo(72), metric: 'CO2', value: 945, threshold: 900, duration: '18 min', autoRemediation: true, resolved: true },
    { id: '2', timestamp: hoursAgo(120), metric: 'CO2', value: 1020, threshold: 900, duration: '32 min', autoRemediation: true, resolved: true },
    { id: '3', timestamp: hoursAgo(168), metric: 'VOC', value: 540, threshold: 500, duration: '45 min', autoRemediation: false, resolved: true },
    { id: '4', timestamp: hoursAgo(240), metric: 'Humidity', value: 62, threshold: 60, duration: '1h 12min', autoRemediation: true, resolved: true },
  ];
}

// Generate remediation log
function generateRemediationLogs() {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  return [
    { id: '1', timestamp: hoursAgo(72), trigger: 'CO2 exceeded 900 ppm', action: 'HVAC fan speed increased to HIGH', result: 'Resolved in 18 min', icon: 'hvac' },
    { id: '2', timestamp: hoursAgo(120), trigger: 'CO2 exceeded 900 ppm', action: 'HVAC fresh air intake opened', result: 'Resolved in 32 min', icon: 'hvac' },
    { id: '3', timestamp: hoursAgo(240), trigger: 'Humidity exceeded 60%', action: 'Dehumidifier activated', result: 'Resolved in 72 min', icon: 'humidity' },
  ];
}

const METRIC_CONFIG = [
  { key: 'pm25' as const, label: 'PM2.5', unit: 'µg/m³', color: '#ef4444', icon: Wind, thresholdGood: WELL_THRESHOLDS.pm25.good, thresholdWarn: WELL_THRESHOLDS.pm25.warning },
  { key: 'co2' as const, label: 'CO₂', unit: 'ppm', color: '#8b5cf6', icon: Wind, thresholdGood: WELL_THRESHOLDS.co2.good, thresholdWarn: WELL_THRESHOLDS.co2.warning },
  { key: 'voc' as const, label: 'TVOC', unit: 'ppb', color: '#f59e0b', icon: Leaf, thresholdGood: WELL_THRESHOLDS.voc.good, thresholdWarn: WELL_THRESHOLDS.voc.warning },
  { key: 'humidity' as const, label: 'Humidity', unit: '%RH', color: '#3b82f6', icon: Droplets, thresholdGood: WELL_THRESHOLDS.humidity.max, thresholdWarn: WELL_THRESHOLDS.humidity.warningMax },
  { key: 'temperature' as const, label: 'Temperature', unit: '°F', color: '#22c55e', icon: Thermometer, thresholdGood: WELL_THRESHOLDS.temperature.max, thresholdWarn: WELL_THRESHOLDS.temperature.warningMax },
];

export function IEQDetailView({ propertyId, unitId }: IEQDetailViewProps) {
  const property = usePortfolioStore((state) => state.properties.find(p => p.id === propertyId));
  const unit = useUnitStore((state) => state.getUnitById(unitId));
  const { getIEQData, fetchIEQData, _hasHydrated } = useWellnessStore();

  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string>('co2');

  useEffect(() => { setMounted(true); }, []);

  const ieq = getIEQData(unitId) || getWellnessDataForUnit(unitId).ieq;

  useEffect(() => {
    if (mounted && _hasHydrated && !getIEQData(unitId)) {
      fetchIEQData(unitId);
    }
  }, [unitId, fetchIEQData, getIEQData, mounted, _hasHydrated]);

  const safeData = ieq || getWellnessDataForUnit('2b').ieq;

  const historyData = useMemo(() => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return generateExtendedHistory(days);
  }, [timeRange]);

  const exceedanceLogs = useMemo(() => generateExceedanceLogs(), []);
  const remediationLogs = useMemo(() => generateRemediationLogs(), []);

  // Calculate compliance percentages
  const complianceStats = useMemo(() => {
    const total = historyData.length;
    return METRIC_CONFIG.map(m => {
      const compliant = historyData.filter(d => {
        const val = d[m.key];
        if (m.key === 'humidity') return val >= WELL_THRESHOLDS.humidity.min && val <= WELL_THRESHOLDS.humidity.max;
        if (m.key === 'temperature') return val >= WELL_THRESHOLDS.temperature.min && val <= WELL_THRESHOLDS.temperature.max;
        return val <= m.thresholdGood;
      }).length;
      return { ...m, compliant, total, pct: Math.round((compliant / total) * 100) };
    });
  }, [historyData]);

  if (!property || !unit || !mounted) return null;

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    if (timeRange === '24h') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const activeMetricConfig = METRIC_CONFIG.find(m => m.key === selectedMetric) || METRIC_CONFIG[1];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: `Unit ${unit.unitNumber}`, href: `/properties/${propertyId}/units/${unitId}` },
        { label: 'IEQ Detail' },
      ]} />

      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}/units/${unitId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Unit
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Indoor Environmental Quality</h1>
          <p className="text-slate-500">Unit {unit.unitNumber} — {unit.resident?.name || 'Vacant'}</p>
        </div>
        <Badge className={`text-sm ${
          safeData.compliance.overall === 'compliant' ? 'bg-green-100 text-green-700 border-green-200' :
          safeData.compliance.overall === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
          'bg-red-100 text-red-700 border-red-200'
        }`}>
          {safeData.compliance.overall === 'compliant' ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
          WELL v2 {safeData.compliance.overall === 'compliant' ? 'Compliant' : safeData.compliance.overall === 'warning' ? 'Warning' : 'Violation'}
        </Badge>
      </div>

      {/* Top Row: 5 Large Metric Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {METRIC_CONFIG.map((metric, i) => {
          const value = safeData.current[metric.key as keyof typeof safeData.current] as number;
          const isCompliant = safeData.compliance[metric.key as keyof typeof safeData.compliance];
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all ${selectedMetric === metric.key ? 'ring-2 ring-slate-400' : 'hover:shadow-md'}`}
                onClick={() => setSelectedMetric(metric.key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <metric.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{typeof value === 'number' ? Math.round(value) : value}</span>
                    <span className="text-xs text-slate-400">{metric.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                    {isCompliant ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>{isCompliant ? 'Within WELL' : 'Exceeds WELL'}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{activeMetricConfig.label} — Time Series</CardTitle>
            <div className="flex gap-1">
              {(['24h', '7d', '30d', '90d'] as const).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTimestamp}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  interval={Math.max(0, Math.floor(historyData.length / 8))}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  labelFormatter={(l) => new Date(l).toLocaleString()}
                  formatter={(v: number | undefined) => [v != null ? Math.round(v * 10) / 10 : 0, activeMetricConfig.label]}
                />
                <ReferenceLine
                  y={activeMetricConfig.thresholdGood}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{ value: 'WELL Good', position: 'right', fontSize: 10 }}
                />
                <ReferenceLine
                  y={activeMetricConfig.thresholdWarn}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'WELL Warn', position: 'right', fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={activeMetricConfig.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* WELL Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WELL Compliance ({timeRange})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Compliant']} />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {complianceStats.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 95 ? '#22c55e' : entry.pct >= 80 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-sm">
              <span className="text-slate-500">Overall Compliance</span>
              <span className="font-semibold text-green-600">
                {Math.round(complianceStats.reduce((a, c) => a + c.pct, 0) / complianceStats.length)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Exceedance Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exceedance Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {exceedanceLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                  <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${log.resolved ? 'text-yellow-500' : 'text-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.metric}: {log.value} {METRIC_CONFIG.find(m => m.label === log.metric || m.label.includes(log.metric))?.unit}</span>
                      <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exceeded {log.threshold} for {log.duration}
                      {log.autoRemediation && ' — auto-remediated'}
                    </p>
                  </div>
                  {log.resolved && (
                    <Badge variant="outline" className="text-green-600 border-green-200 text-[10px] flex-shrink-0">Resolved</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remediation Log + Sensor Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remediation Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {remediationLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                  <Wrench className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700">{log.trigger}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{log.action}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-green-600">{log.result}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sensor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Cpu className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Awair Element</p>
                  <p className="text-xs text-slate-500">Model: AE-001 · SN: AWR-2B-7F3A</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Last Calibration</p>
                  <p className="font-medium">Jan 15, 2026</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Placement</p>
                  <p className="font-medium">Living Room, 1.2m</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Sampling Rate</p>
                  <p className="font-medium">10-min intervals</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Data Capture</p>
                  <p className="font-medium text-green-600">99.7%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
