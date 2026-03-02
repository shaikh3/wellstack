'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  Wind,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useUnitStore } from '@/lib/store/unitStore';
import { useAlertStore } from '@/lib/store/alertStore';
import { Unit } from '@/lib/types';
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
  Tooltip as RechartsTooltip,
} from 'recharts';

interface PropertyWellnessDashboardProps {
  propertyId: string;
}

// Generate mock wellness scores for all units
function generateUnitScores(units: Unit[]): { unitId: string; unitNumber: string; score: number; trend: string; resident: string | null }[] {
  return units.map(u => {
    // Use real data if available, otherwise generate realistic scores
    if (u.wellnessScore) {
      return {
        unitId: u.id,
        unitNumber: u.unitNumber,
        score: u.wellnessScore.overall,
        trend: u.wellnessScore.trend,
        resident: u.resident?.name || null,
      };
    }
    // Generate a realistic score based on unit status
    const baseScore = u.status === 'occupied' ? 70 + Math.floor(Math.random() * 25) : 0;
    return {
      unitId: u.id,
      unitNumber: u.unitNumber,
      score: baseScore,
      trend: Math.random() > 0.3 ? 'stable' : Math.random() > 0.5 ? 'improving' : 'declining',
      resident: u.resident?.name || null,
    };
  }).filter(u => u.score > 0); // Only occupied units
}

// Generate 30-day property average trend
function generatePropertyTrend(): { date: string; score: number }[] {
  const data: { date: string; score: number }[] = [];
  const now = new Date();
  for (let d = 30; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const baseScore = 76 + (30 - d) * 0.1; // Slight upward trend
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: Math.round(baseScore + (Math.random() - 0.5) * 4),
    });
  }
  return data;
}

export function PropertyWellnessDashboard({ propertyId }: PropertyWellnessDashboardProps) {
  const property = usePortfolioStore((state) => state.properties.find(p => p.id === propertyId));
  const units = useUnitStore((state) => state.getUnitsByProperty(propertyId));
  const alerts = useAlertStore((state) =>
    state.alerts.filter(a => a.propertyId === propertyId && !a.resolvedAt)
  );

  const unitScores = useMemo(() => generateUnitScores(units), [units]);
  const propertyTrend = useMemo(() => generatePropertyTrend(), []);

  // Score distribution buckets
  const distribution = useMemo(() => {
    const buckets = [
      { range: '90-100', label: 'Excellent', min: 90, max: 100, count: 0, color: '#22c55e' },
      { range: '80-89', label: 'Good', min: 80, max: 89, count: 0, color: '#3b82f6' },
      { range: '70-79', label: 'Fair', min: 70, max: 79, count: 0, color: '#f59e0b' },
      { range: '60-69', label: 'Attention', min: 60, max: 69, count: 0, color: '#f97316' },
      { range: '<60', label: 'Critical', min: 0, max: 59, count: 0, color: '#ef4444' },
    ];
    unitScores.forEach(u => {
      const bucket = buckets.find(b => u.score >= b.min && u.score <= b.max);
      if (bucket) bucket.count++;
    });
    return buckets;
  }, [unitScores]);

  // Wellness alerts (filter for wellness-related types)
  const wellnessAlerts = useMemo(() =>
    alerts.filter(a =>
      ['fall_detected', 'isolation_alert', 'ieq_violation', 'wellness_score_drop', 'behavioral_deviation'].includes(a.type)
    ).sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return (severityOrder[a.severity as keyof typeof severityOrder] ?? 2) - (severityOrder[b.severity as keyof typeof severityOrder] ?? 2);
    }),
    [alerts]
  );

  // Top concerns — lowest scoring units
  const topConcerns = useMemo(() =>
    [...unitScores].sort((a, b) => a.score - b.score).slice(0, 5),
    [unitScores]
  );

  // IEQ heatmap data — generate for all occupied units
  const ieqHeatmap = useMemo(() => {
    return units
      .filter(u => u.status === 'occupied')
      .map(u => {
        if (u.ieqStatus) {
          return {
            unitId: u.id,
            unitNumber: u.unitNumber,
            status: u.ieqStatus.compliance.overall,
            co2: u.ieqStatus.current.co2,
            pm25: u.ieqStatus.current.pm25,
          };
        }
        // Generate realistic IEQ status
        const r = Math.random();
        return {
          unitId: u.id,
          unitNumber: u.unitNumber,
          status: r > 0.15 ? 'compliant' as const : r > 0.05 ? 'warning' as const : 'violation' as const,
          co2: 380 + Math.floor(Math.random() * 200),
          pm25: 5 + Math.floor(Math.random() * 10),
        };
      });
  }, [units]);

  const avgScore = unitScores.length > 0 ? Math.round(unitScores.reduce((a, c) => a + c.score, 0) / unitScores.length) : 0;
  const aboveEighty = unitScores.filter(u => u.score >= 80).length;
  const aboveEightyPct = unitScores.length > 0 ? Math.round((aboveEighty / unitScores.length) * 100) : 0;
  const compliantCount = ieqHeatmap.filter(u => u.status === 'compliant').length;
  const compliantPct = ieqHeatmap.length > 0 ? Math.round((compliantCount / ieqHeatmap.length) * 100) : 0;

  if (!property) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getIEQColor = (status: string) => {
    if (status === 'compliant') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
                  <p className="text-sm text-slate-500">Avg Wellness Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{aboveEightyPct}%</p>
                  <p className="text-sm text-slate-500">Units Above 80</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Wind className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{compliantPct}%</p>
                  <p className="text-sm text-slate-500">IEQ Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${wellnessAlerts.length > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
                  <AlertTriangle className={`h-5 w-5 ${wellnessAlerts.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${wellnessAlerts.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                    {wellnessAlerts.length}
                  </p>
                  <p className="text-sm text-slate-500">Wellness Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wellness Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip
                    formatter={(v: number | undefined) => [v ?? 0, 'Units']}
                    labelFormatter={(l) => `Score: ${l}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-sm">
              <span className="text-slate-500">{aboveEighty} of {unitScores.length} units above 80</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">{aboveEightyPct}%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Property Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">30-Day Wellness Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={propertyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number | undefined) => [v ?? 0, 'Avg Score']} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-sm">
              <span className="text-slate-500">Property Average</span>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="font-medium">+2 pts (30d)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IEQ Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">IEQ Status by Unit</CardTitle>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Compliant</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" /> Warning</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Violation</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            <TooltipProvider>
              {ieqHeatmap.map(u => (
                <Tooltip key={u.unitId}>
                  <TooltipTrigger asChild>
                    <Link href={`/properties/${propertyId}/units/${u.unitId}`}>
                      <div className={`w-10 h-10 rounded flex items-center justify-center text-[10px] font-medium text-white cursor-pointer hover:ring-2 hover:ring-slate-400 transition-all ${getIEQColor(u.status)}`}>
                        {u.unitNumber}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-0.5">
                      <p className="font-medium">Unit {u.unitNumber}</p>
                      <p className="text-xs">CO₂: {u.co2} ppm</p>
                      <p className="text-xs">PM2.5: {u.pm25} µg/m³</p>
                      <p className={`text-xs font-medium ${u.status === 'compliant' ? 'text-green-400' : u.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {u.status === 'compliant' ? 'WELL Compliant' : u.status === 'warning' ? 'WELL Warning' : 'WELL Violation'}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
            <span className="text-slate-500">{compliantCount} of {ieqHeatmap.length} units compliant</span>
            <span className="font-medium text-green-600">{compliantPct}% WELL compliance</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Wellness Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Wellness Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {wellnessAlerts.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                No active wellness alerts
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {wellnessAlerts.map(alert => (
                  <Link key={alert.id} href={`/properties/${propertyId}/units/${alert.unitId}`}>
                    <div className={`flex items-start gap-2.5 p-3 rounded-lg text-sm cursor-pointer hover:shadow-sm transition-shadow ${
                      alert.severity === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.title}</span>
                          <Badge variant="outline" className="text-[10px]">Unit {units.find(u => u.id === alert.unitId)?.unitNumber || alert.unitId}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Concerns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topConcerns.map((u, i) => (
                <Link key={u.unitId} href={`/properties/${propertyId}/units/${u.unitId}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-xs font-mono text-slate-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Unit {u.unitNumber}</span>
                        <span className={`text-sm font-bold ${getScoreColor(u.score)}`}>{u.score}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-slate-500 truncate">{u.resident || 'Unknown'}</span>
                        <div className={`flex items-center gap-0.5 text-xs ${
                          u.trend === 'declining' ? 'text-red-500' : u.trend === 'improving' ? 'text-green-500' : 'text-slate-400'
                        }`}>
                          {u.trend === 'declining' ? <TrendingDown className="h-3 w-3" /> :
                           u.trend === 'improving' ? <TrendingUp className="h-3 w-3" /> :
                           <Minus className="h-3 w-3" />}
                          <span>{u.trend}</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={u.score} className="w-16 h-1.5" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
