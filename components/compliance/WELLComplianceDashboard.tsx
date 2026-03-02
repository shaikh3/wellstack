'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  Leaf,
  Volume2,
  Sun,
  ChevronLeft,
  Download,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useUnitStore } from '@/lib/store/unitStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WELL_THRESHOLDS } from '@/lib/mock/wellnessData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';

interface WELLComplianceDashboardProps {
  propertyId: string;
}

const WELL_METRICS = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', icon: Wind, threshold: `<${WELL_THRESHOLDS.pm25.good}`, color: '#ef4444' },
  { key: 'co2', label: 'CO₂', unit: 'ppm', icon: Wind, threshold: `<${WELL_THRESHOLDS.co2.good}`, color: '#8b5cf6' },
  { key: 'tvoc', label: 'TVOC', unit: 'ppb', icon: Leaf, threshold: `<${WELL_THRESHOLDS.voc.good}`, color: '#f59e0b' },
  { key: 'humidity', label: 'Humidity', unit: '%RH', icon: Droplets, threshold: `${WELL_THRESHOLDS.humidity.min}-${WELL_THRESHOLDS.humidity.max}`, color: '#3b82f6' },
  { key: 'temperature', label: 'Temperature', unit: '°F', icon: Thermometer, threshold: `${WELL_THRESHOLDS.temperature.min}-${WELL_THRESHOLDS.temperature.max}`, color: '#22c55e' },
  { key: 'lighting', label: 'Circadian Lighting', unit: 'mEDI', icon: Sun, threshold: '≥250 (day)', color: '#f97316' },
  { key: 'acoustics', label: 'Acoustics', unit: 'dB', icon: Volume2, threshold: '<35', color: '#06b6d4' },
];

function generateMetricCompliance(unitCount: number) {
  return WELL_METRICS.map(m => {
    // Realistic compliance rates — some metrics are easier to maintain than others
    const basePct = m.key === 'temperature' ? 94 : m.key === 'humidity' ? 88 : m.key === 'pm25' ? 91 :
                    m.key === 'co2' ? 85 : m.key === 'tvoc' ? 87 : m.key === 'lighting' ? 72 : 90;
    const pct = Math.min(100, Math.max(50, basePct + Math.floor((Math.random() - 0.5) * 8)));
    const compliant = Math.round(unitCount * pct / 100);
    return { ...m, pct, compliant, total: unitCount, trend: Math.random() > 0.3 ? 'up' : 'down' };
  });
}

function generateNonCompliantUnits() {
  return [
    { unitId: '118', unitNumber: '118', metric: 'CO₂', value: '1050 ppm', threshold: '< 900 ppm', duration: '4h 12m', autoRemediation: false },
    { unitId: '118', unitNumber: '118', metric: 'TVOC', value: '620 ppb', threshold: '< 500 ppb', duration: '6h 30m', autoRemediation: false },
    { unitId: '118', unitNumber: '118', metric: 'PM2.5', value: '22 µg/m³', threshold: '< 15 µg/m³', duration: '2h 45m', autoRemediation: false },
    { unitId: '1c', unitNumber: '1C', metric: 'CO₂', value: '945 ppm', threshold: '< 900 ppm', duration: '18m', autoRemediation: true },
    { unitId: '3a', unitNumber: '3A', metric: 'Humidity', value: '62%', threshold: '30-60%', duration: '1h 05m', autoRemediation: true },
  ];
}

function generateComplianceTrend() {
  const data: { date: string; pct: number }[] = [];
  const now = new Date();
  for (let d = 90; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const base = 85 + (90 - d) * 0.05;
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      pct: Math.min(100, Math.round(base + (Math.random() - 0.5) * 6)),
    });
  }
  return data;
}

export function WELLComplianceDashboard({ propertyId }: WELLComplianceDashboardProps) {
  const property = usePortfolioStore((state) => state.properties.find(p => p.id === propertyId));
  const units = useUnitStore((state) => state.getUnitsByProperty(propertyId));
  const occupiedCount = units.filter(u => u.status === 'occupied').length;

  const metricCompliance = useMemo(() => generateMetricCompliance(occupiedCount), [occupiedCount]);
  const nonCompliantUnits = useMemo(() => generateNonCompliantUnits(), []);
  const complianceTrend = useMemo(() => generateComplianceTrend(), []);

  const overallCompliance = metricCompliance.length > 0
    ? Math.round(metricCompliance.reduce((a, c) => a + c.pct, 0) / metricCompliance.length)
    : 0;

  if (!property) return null;

  // Donut chart dimensions
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallCompliance / 100) * circumference;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: 'WELL Compliance' },
      ]} />

      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Property
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">WELL Building Standard v2 Compliance</h1>
          <p className="text-slate-500">{property.name} — {occupiedCount} occupied units monitored</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('WELL report generation coming soon')}>
          <Download className="mr-2 h-4 w-4" /> Generate WELL Report
        </Button>
      </div>

      {/* Top Row: Overall + Sensor Deployment */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall Compliance Ring */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <svg className="transform -rotate-90 w-36 h-36">
                  <circle cx="68" cy="68" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                  <motion.circle
                    cx="68" cy="68" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
                    className={overallCompliance >= 90 ? 'stroke-green-500' : overallCompliance >= 80 ? 'stroke-blue-500' : 'stroke-yellow-500'}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${overallCompliance >= 90 ? 'text-green-600' : overallCompliance >= 80 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    {overallCompliance}%
                  </span>
                  <span className="text-xs text-slate-400">Overall</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">WELL v2 Compliance Rate</p>
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+3% (90d)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metric Breakdown */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Compliance by Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricCompliance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Compliant']} />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                      {metricCompliance.map((entry, i) => (
                        <Cell key={i} fill={entry.pct >= 90 ? '#22c55e' : entry.pct >= 80 ? '#3b82f6' : entry.pct >= 70 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metric Detail Cards */}
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
        {metricCompliance.map((m, i) => (
          <motion.div key={m.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={`border ${m.pct >= 90 ? 'border-green-200' : m.pct >= 80 ? 'border-blue-200' : 'border-yellow-200'}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <m.icon className="h-3 w-3" />
                  <span className="text-[10px] font-medium">{m.label}</span>
                </div>
                <p className={`text-xl font-bold ${m.pct >= 90 ? 'text-green-600' : m.pct >= 80 ? 'text-blue-600' : 'text-yellow-600'}`}>
                  {m.pct}%
                </p>
                <Progress value={m.pct} className="h-1 mt-1" />
                <p className="text-[9px] text-slate-400 mt-1">Threshold: {m.threshold}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Non-Compliant Units */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currently Non-Compliant Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nonCompliantUnits.map((u, i) => (
                <Link key={i} href={`/properties/${propertyId}/units/${u.unitId}`}>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm hover:bg-slate-100 transition-colors cursor-pointer">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${u.autoRemediation ? 'text-yellow-500' : 'text-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Unit {u.unitNumber} — {u.metric}</span>
                        <Badge variant="outline" className="text-[10px]">{u.duration}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current: {u.value} · Threshold: {u.threshold}
                      </p>
                    </div>
                    {u.autoRemediation && (
                      <Badge className="bg-blue-100 text-blue-700 text-[10px] flex-shrink-0">Auto-fixing</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">90-Day Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={12} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Compliance']} />
                  <Line type="monotone" dataKey="pct" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Deployment & Certification Evidence */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sensor Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Cpu className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Awair Element</p>
                  <p className="text-xs text-slate-500">{occupiedCount} units deployed · PM2.5, CO₂, TVOC, Temp, Humidity</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2.5 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Placement Compliance</p>
                  <p className="font-medium text-green-600">100%</p>
                  <p className="text-[10px] text-slate-400">1 per 325m², 1.1-1.7m height</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Data Capture Rate</p>
                  <p className="font-medium text-green-600">99.4%</p>
                  <p className="text-[10px] text-slate-400">10-min sampling intervals</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Last Calibration</p>
                  <p className="font-medium">Jan 15, 2026</p>
                  <p className="text-[10px] text-slate-400">Next: Jul 15, 2026</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Sensors Online</p>
                  <p className="font-medium text-green-600">{occupiedCount}/{occupiedCount}</p>
                  <p className="text-[10px] text-slate-400">All operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certification Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-800">Air Quality (A01-A14)</span>
                </div>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Ready</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-800">Thermal Comfort (T01-T07)</span>
                </div>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Ready</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-800">Light (L01-L08)</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">72% — Needs Work</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-800">Sound (S01-S07)</span>
                </div>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Ready</Badge>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={() => toast.success('Exceedance report export coming soon')}>
                <Download className="mr-2 h-4 w-4" /> Export Exceedance Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
