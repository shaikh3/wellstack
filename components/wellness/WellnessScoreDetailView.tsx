'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  Heart,
  Wind,
  Moon,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useUnitStore } from '@/lib/store/unitStore';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getWellnessDataForUnit } from '@/lib/mock/wellnessData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface WellnessScoreDetailViewProps {
  propertyId: string;
  unitId: string;
}

const SUB_SCORES = [
  { key: 'ieq' as const, label: 'Air Quality (IEQ)', weight: 30, icon: Wind, color: '#3b82f6', description: 'Indoor air quality, thermal comfort, humidity levels' },
  { key: 'sleep' as const, label: 'Sleep Environment', weight: 25, icon: Moon, color: '#8b5cf6', description: 'Bedroom conditions, circadian lighting, noise levels' },
  { key: 'safety' as const, label: 'Safety & Fall Risk', weight: 25, icon: Shield, color: '#f59e0b', description: 'Fall detection, gait analysis, environmental hazards' },
  { key: 'activity' as const, label: 'Activity & ADL', weight: 20, icon: Activity, color: '#22c55e', description: 'Daily movement patterns, ADL consistency' },
];

// Generate historical wellness score data
function generateScoreHistory(days: number, currentScore: { overall: number; components: { ieq: number; sleep: number; safety: number; activity: number } }) {
  const data: { date: string; overall: number; ieq: number; sleep: number; safety: number; activity: number; event?: string }[] = [];
  const now = new Date();

  for (let d = days; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const daysSinceStart = days - d;
    const progress = daysSinceStart / days;

    // Gradual improvement trend with some noise
    const trendFactor = 0.85 + progress * 0.15;
    const noise = () => (Math.random() - 0.5) * 4;

    const ieq = Math.min(100, Math.round(currentScore.components.ieq * trendFactor + noise()));
    const sleep = Math.min(100, Math.round(currentScore.components.sleep * trendFactor + noise()));
    const safety = Math.min(100, Math.round(currentScore.components.safety * trendFactor + noise()));
    const activity = Math.min(100, Math.round(currentScore.components.activity * trendFactor + noise()));
    const overall = Math.round(ieq * 0.30 + sleep * 0.25 + safety * 0.25 + activity * 0.20);

    let event: string | undefined;
    // Add some notable events
    if (d === Math.round(days * 0.7)) event = 'HVAC optimization applied';
    if (d === Math.round(days * 0.4)) event = 'Circadian schedule activated';
    if (d === Math.round(days * 0.15)) event = 'Sleep protocol adjusted';

    data.push({
      date: date.toISOString(),
      overall,
      ieq,
      sleep,
      safety,
      activity,
      event,
    });
  }

  return data;
}

// Generate score change events
function generateScoreEvents() {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  return [
    { id: '1', timestamp: hoursAgo(6), component: 'IEQ', change: +2, from: 88, to: 90, trigger: 'CO2 levels normalized after ventilation boost' },
    { id: '2', timestamp: hoursAgo(48), component: 'Sleep', change: +3, from: 82, to: 85, trigger: 'Bedroom temp maintained in optimal range overnight' },
    { id: '3', timestamp: hoursAgo(72), component: 'Activity', change: -1, from: 85, to: 84, trigger: 'Slightly reduced afternoon mobility detected' },
    { id: '4', timestamp: hoursAgo(120), component: 'Safety', change: +2, from: 86, to: 88, trigger: 'Gait consistency improved over 5-day window' },
    { id: '5', timestamp: hoursAgo(168), component: 'Overall', change: +3, from: 84, to: 87, trigger: 'All sub-scores trending upward' },
  ];
}

export function WellnessScoreDetailView({ propertyId, unitId }: WellnessScoreDetailViewProps) {
  const property = usePortfolioStore((state) => state.properties.find(p => p.id === propertyId));
  const unit = useUnitStore((state) => state.units.find(u => u.id === unitId));
  const { getWellnessScore, fetchWellnessScore, _hasHydrated } = useWellnessStore();

  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'30d' | '60d' | '90d'>('30d');

  useEffect(() => { setMounted(true); }, []);

  const score = getWellnessScore(unitId) || getWellnessDataForUnit(unitId).wellnessScore;

  useEffect(() => {
    if (mounted && _hasHydrated && !getWellnessScore(unitId)) {
      fetchWellnessScore(unitId);
    }
  }, [unitId, fetchWellnessScore, getWellnessScore, mounted, _hasHydrated]);

  const safeScore = score || getWellnessDataForUnit('2b').wellnessScore;

  const historyData = useMemo(() => {
    const days = timeRange === '30d' ? 30 : timeRange === '60d' ? 60 : 90;
    return generateScoreHistory(days, safeScore);
  }, [timeRange, safeScore]);

  const scoreEvents = useMemo(() => generateScoreEvents(), []);

  // Radar chart data
  const radarData = useMemo(() => SUB_SCORES.map(s => ({
    subject: s.label.split(' (')[0],
    score: safeScore.components[s.key],
    propertyAvg: s.key === 'ieq' ? 82 : s.key === 'sleep' ? 78 : s.key === 'safety' ? 80 : 76,
  })), [safeScore]);

  if (!property || !unit || !mounted) return null;

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 80) return 'text-blue-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreRingColor = (value: number) => {
    if (value >= 90) return 'stroke-green-500';
    if (value >= 80) return 'stroke-blue-500';
    if (value >= 70) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const getScoreBg = (value: number) => {
    if (value >= 90) return 'bg-green-50 border-green-200';
    if (value >= 80) return 'bg-blue-50 border-blue-200';
    if (value >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 90) return 'Excellent';
    if (value >= 80) return 'Good';
    if (value >= 70) return 'Fair';
    return 'Needs Attention';
  };

  // Large ring dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore.overall / 100) * circumference;

  const propertyAvg = 82;
  const portfolioAvg = 79;

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    if (timeRange === '30d') return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: `Unit ${unit.unitNumber}`, href: `/properties/${propertyId}/units/${unitId}` },
        { label: 'Wellness Score' },
      ]} />

      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}/units/${unitId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Unit
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Wellness Score</h1>
          <p className="text-slate-500">Unit {unit.unitNumber} — {unit.resident?.name || 'Vacant'}</p>
        </div>
        <Badge className={`text-sm ${getScoreBg(safeScore.overall)}`}>
          <Heart className="w-4 h-4 mr-1" />
          {getScoreLabel(safeScore.overall)}
        </Badge>
      </div>

      {/* Hero Row: Score Ring + Sub-Scores */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Large Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <svg className="transform -rotate-90 w-44 h-44">
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className={getScoreRingColor(safeScore.overall)}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className={`text-5xl font-bold ${getScoreColor(safeScore.overall)}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {safeScore.overall}
                  </motion.span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 text-sm">
                <div className={`flex items-center gap-1 ${safeScore.trend === 'improving' ? 'text-green-600' : safeScore.trend === 'declining' ? 'text-red-600' : 'text-slate-500'}`}>
                  {safeScore.trend === 'improving' ? <TrendingUp className="h-4 w-4" /> :
                   safeScore.trend === 'declining' ? <TrendingDown className="h-4 w-4" /> :
                   <Minus className="h-4 w-4" />}
                  <span className="capitalize">{safeScore.trend}</span>
                </div>
                {safeScore.percentile && (
                  <Badge variant="outline" className="text-slate-600">
                    Top {100 - safeScore.percentile}%
                  </Badge>
                )}
              </div>

              {/* Comparison */}
              <div className="w-full mt-6 space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Property Avg</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{propertyAvg}</span>
                    <Badge className={`text-xs ${safeScore.overall >= propertyAvg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {safeScore.overall >= propertyAvg ? '+' : ''}{safeScore.overall - propertyAvg}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Portfolio Avg</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{portfolioAvg}</span>
                    <Badge className={`text-xs ${safeScore.overall >= portfolioAvg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {safeScore.overall >= portfolioAvg ? '+' : ''}{safeScore.overall - portfolioAvg}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sub-Score Cards */}
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
          {SUB_SCORES.map((sub, i) => {
            const value = safeScore.components[sub.key];
            const weighted = Math.round(value * sub.weight / 100);
            return (
              <motion.div
                key={sub.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Card className={`border ${getScoreBg(value)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <sub.icon className="h-4 w-4" style={{ color: sub.color }} />
                        <span className="text-sm font-medium">{sub.label.split(' (')[0]}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{sub.weight}% weight</Badge>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-3xl font-bold ${getScoreColor(value)}`}>{value}</span>
                      <span className="text-sm text-slate-400">/100</span>
                      <span className="text-xs text-slate-500 ml-auto">contributes {weighted} pts</span>
                    </div>
                    <Progress value={value} className="h-1.5 mb-2" />
                    <p className="text-xs text-slate-500">{sub.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Score Trend</CardTitle>
            <div className="flex gap-1">
              {(['30d', '60d', '90d'] as const).map(range => (
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
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  interval={Math.max(0, Math.floor(historyData.length / 8))}
                />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  labelFormatter={(l) => new Date(l).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  formatter={(v: number | undefined, name: string | undefined) => [v ?? 0, name === 'overall' ? 'Overall' : (name ?? '').charAt(0).toUpperCase() + (name ?? '').slice(1)]}
                />
                <ReferenceLine y={propertyAvg} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: 'Property Avg', position: 'right', fontSize: 10, fill: '#94a3b8' }} />
                <Area type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2.5} fill="url(#overallGrad)" />
                <Line type="monotone" dataKey="ieq" stroke="#3b82f6" strokeWidth={1} dot={false} opacity={0.4} />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={1} dot={false} opacity={0.4} />
                <Line type="monotone" dataKey="safety" stroke="#f59e0b" strokeWidth={1} dot={false} opacity={0.4} />
                <Line type="monotone" dataKey="activity" stroke="#22c55e" strokeWidth={1} dot={false} opacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Overall</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded opacity-40" /> IEQ</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded opacity-40" /> Sleep</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded opacity-40" /> Safety</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded opacity-40" /> Activity</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Component Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="This Unit" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Property Avg" dataKey="propertyAvg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
                  <Tooltip formatter={(v: number | undefined) => [v ?? 0]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> This Unit</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 inline-block rounded" style={{ borderTop: '1px dashed' }} /> Property Avg</span>
            </div>
          </CardContent>
        </Card>

        {/* Score Change Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Score Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {scoreEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                  <div className={`flex-shrink-0 mt-0.5 ${event.change > 0 ? 'text-green-500' : event.change < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {event.change > 0 ? <TrendingUp className="h-4 w-4" /> : event.change < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.component}</span>
                      <span className={`text-xs font-mono font-medium ${event.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {event.from} → {event.to} ({event.change > 0 ? '+' : ''}{event.change})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{event.trigger}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RPM Billing Context */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Clinical Wellness Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Monitoring Days</p>
              <p className="text-xl font-bold">47</p>
              <p className="text-[10px] text-slate-400">of 90-day enrollment</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Data Transmission</p>
              <p className="text-xl font-bold text-green-600">16+</p>
              <p className="text-[10px] text-slate-400">days/month (CPT 99454 eligible)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Score Stability</p>
              <p className="text-xl font-bold">±2.3</p>
              <p className="text-[10px] text-slate-400">pts avg daily variance</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Interventions Triggered</p>
              <p className="text-xl font-bold">3</p>
              <p className="text-[10px] text-slate-400">auto-remediations this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
