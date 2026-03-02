'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Heart,
  Shield,
  Wind,
  Users,
  DollarSign,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  BarChart3,
  Activity,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface PropertyBenchmark {
  id: string;
  name: string;
  communityScore: number;
  avgUnitScore: number;
  fallRate: number; // per 1000 resident-days
  ieqCompliance: number; // percentage
  socialEngagement: number; // percentage
  rpmEnrollment: number; // percentage
  occupancy: number; // percentage
  unitCount: number;
  trend: 'up' | 'down' | 'stable';
  sparkline: number[];
}

function generateBenchmarkData(): PropertyBenchmark[] {
  return [
    {
      id: 'lakeview-commons',
      name: 'Lakeview Commons',
      communityScore: 74,
      avgUnitScore: 76,
      fallRate: 1.2,
      ieqCompliance: 86,
      socialEngagement: 78,
      rpmEnrollment: 65,
      occupancy: 94,
      unitCount: 25,
      trend: 'up',
      sparkline: [68, 70, 69, 72, 71, 73, 74, 74, 75, 74],
    },
    {
      id: 'oak-ridge-villas',
      name: 'Oak Ridge Villas',
      communityScore: 81,
      avgUnitScore: 82,
      fallRate: 0.8,
      ieqCompliance: 92,
      socialEngagement: 85,
      rpmEnrollment: 72,
      occupancy: 97,
      unitCount: 40,
      trend: 'up',
      sparkline: [76, 77, 78, 79, 78, 80, 80, 81, 81, 81],
    },
    {
      id: 'sunset-gardens',
      name: 'Sunset Gardens',
      communityScore: 69,
      avgUnitScore: 71,
      fallRate: 1.8,
      ieqCompliance: 79,
      socialEngagement: 62,
      rpmEnrollment: 48,
      occupancy: 88,
      unitCount: 35,
      trend: 'down',
      sparkline: [73, 72, 71, 72, 70, 71, 70, 69, 69, 69],
    },
  ];
}

function generate90DayTrends() {
  const data: { date: string; lakeview: number; oakridge: number; sunset: number; avg: number }[] = [];
  const now = new Date();
  for (let d = 89; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const l = 68 + (89 - d) * 0.07 + Math.sin(d / 7) * 2 + (Math.random() - 0.5) * 2;
    const o = 76 + (89 - d) * 0.05 + Math.sin(d / 8) * 1.5 + (Math.random() - 0.5) * 2;
    const s = 73 - (89 - d) * 0.04 + Math.sin(d / 6) * 2 + (Math.random() - 0.5) * 2;
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      lakeview: Math.round(Math.max(50, Math.min(100, l))),
      oakridge: Math.round(Math.max(50, Math.min(100, o))),
      sunset: Math.round(Math.max(50, Math.min(100, s))),
      avg: Math.round((l + o + s) / 3),
    });
  }
  return data;
}

type SortKey = 'communityScore' | 'avgUnitScore' | 'fallRate' | 'ieqCompliance' | 'socialEngagement' | 'rpmEnrollment' | 'occupancy';

export function PortfolioBenchmarking() {
  const properties = usePortfolioStore((state) => state.properties);
  const [sortKey, setSortKey] = useState<SortKey>('communityScore');
  const [sortAsc, setSortAsc] = useState(false);

  const benchmarkData = useMemo(() => generateBenchmarkData(), []);
  const trends = useMemo(() => generate90DayTrends(), []);

  const sorted = useMemo(() => {
    const data = [...benchmarkData];
    data.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      // For fall rate, lower is better, so reverse sort logic
      if (sortKey === 'fallRate') {
        return sortAsc ? valB - valA : valA - valB;
      }
      return sortAsc ? valA - valB : valB - valA;
    });
    return data;
  }, [benchmarkData, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  // Portfolio aggregates
  const totalUnits = benchmarkData.reduce((s, p) => s + p.unitCount, 0);
  const portfolioAvgScore = Math.round(benchmarkData.reduce((s, p) => s + p.communityScore * p.unitCount, 0) / totalUnits);
  const totalAlerts = 8; // mock
  const portfolioFallRate = Math.round(benchmarkData.reduce((s, p) => s + p.fallRate, 0) / benchmarkData.length * 10) / 10;
  const rpmRevenue = benchmarkData.reduce((s, p) => s + Math.round(p.unitCount * p.rpmEnrollment / 100 * 130), 0);

  // Radar data for comparison
  const radarData = [
    { metric: 'Community Score', lakeview: 74, oakridge: 81, sunset: 69 },
    { metric: 'IEQ Compliance', lakeview: 86, oakridge: 92, sunset: 79 },
    { metric: 'Social Engagement', lakeview: 78, oakridge: 85, sunset: 62 },
    { metric: 'Safety (inv)', lakeview: 88, oakridge: 92, sunset: 82 },
    { metric: 'RPM Enrollment', lakeview: 65, oakridge: 72, sunset: 48 },
    { metric: 'Occupancy', lakeview: 94, oakridge: 97, sunset: 88 },
  ];

  const SortHeader = ({ label, field, className = '' }: { label: string; field: SortKey; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 ${className}`}
    >
      {label}
      {sortKey === field ? (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
    </button>
  );

  const getCellColor = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'text-green-600';
    if (value >= thresholds[0]) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCellBg = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'bg-green-50';
    if (value >= thresholds[0]) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Benchmarking</h1>
        <p className="text-slate-500">Cross-property wellness performance comparison</p>
      </div>

      {/* Portfolio Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{portfolioAvgScore}</p>
              <p className="text-xs text-slate-500">Portfolio Avg Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAlerts}</p>
              <p className="text-xs text-slate-500">Active Wellness Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{portfolioFallRate}</p>
              <p className="text-xs text-slate-500">Fall Rate / 1000 days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">${rpmRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Est. RPM Revenue/mo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 pl-2 text-xs font-medium text-slate-500">Property</th>
                  <th className="pb-3"><SortHeader label="Community Score" field="communityScore" /></th>
                  <th className="pb-3"><SortHeader label="Avg Unit Score" field="avgUnitScore" /></th>
                  <th className="pb-3"><SortHeader label="Fall Rate" field="fallRate" /></th>
                  <th className="pb-3"><SortHeader label="IEQ Compliance" field="ieqCompliance" /></th>
                  <th className="pb-3"><SortHeader label="Social Engagement" field="socialEngagement" /></th>
                  <th className="pb-3"><SortHeader label="RPM Enrollment" field="rpmEnrollment" /></th>
                  <th className="pb-3"><SortHeader label="Occupancy" field="occupancy" /></th>
                  <th className="pb-3 text-xs font-medium text-slate-500">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 pl-2">
                      <Link href={`/properties/${p.id}`} className="flex items-center gap-2 hover:text-blue-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.unitCount} units</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-bold ${getCellColor(p.communityScore, [65, 75])}`}>{p.communityScore}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${getCellColor(p.avgUnitScore, [65, 75])}`}>{p.avgUnitScore}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${p.fallRate <= 1.0 ? 'text-green-600' : p.fallRate <= 1.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {p.fallRate}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${getCellColor(p.ieqCompliance, [80, 90])}`}>{p.ieqCompliance}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${getCellColor(p.socialEngagement, [65, 75])}`}>{p.socialEngagement}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${getCellColor(p.rpmEnrollment, [50, 70])}`}>{p.rpmEnrollment}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${getCellColor(p.occupancy, [85, 93])}`}>{p.occupancy}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {p.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {p.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {p.trend === 'stable' && <span className="text-slate-400">→</span>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rankings by Community Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...benchmarkData]
              .sort((a, b) => b.communityScore - a.communityScore)
              .map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className={`font-bold ${getCellColor(p.communityScore, [65, 75])}`}>{p.communityScore}</span>
                    </div>
                    <Progress value={p.communityScore} className={`h-1.5 mt-1 ${p.communityScore >= 75 ? '[&>div]:bg-green-500' : p.communityScore >= 65 ? '[&>div]:bg-blue-500' : '[&>div]:bg-yellow-500'}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {p.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {p.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Radar Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Multi-Metric Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Lakeview" dataKey="lakeview" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Oak Ridge" dataKey="oakridge" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Sunset" dataKey="sunset" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><div className="h-2 w-4 bg-blue-500 rounded" /> Lakeview</span>
              <span className="flex items-center gap-1"><div className="h-2 w-4 bg-green-500 rounded" /> Oak Ridge</span>
              <span className="flex items-center gap-1"><div className="h-2 w-4 bg-amber-500 rounded" /> Sunset</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 90-Day Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">90-Day Community Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={12} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="lakeview" stroke="#3b82f6" strokeWidth={2} dot={false} name="Lakeview Commons" />
                <Line type="monotone" dataKey="oakridge" stroke="#22c55e" strokeWidth={2} dot={false} name="Oak Ridge Villas" />
                <Line type="monotone" dataKey="sunset" stroke="#f59e0b" strokeWidth={2} dot={false} name="Sunset Gardens" />
                <Line type="monotone" dataKey="avg" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Portfolio Avg" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><div className="h-2 w-4 bg-blue-500 rounded" /> Lakeview</span>
            <span className="flex items-center gap-1"><div className="h-2 w-4 bg-green-500 rounded" /> Oak Ridge</span>
            <span className="flex items-center gap-1"><div className="h-2 w-4 bg-amber-500 rounded" /> Sunset</span>
            <span className="flex items-center gap-1"><div className="h-2 w-4 bg-slate-400 rounded border-dashed" /> Portfolio Avg</span>
          </div>
        </CardContent>
      </Card>

      {/* Outlier Detection */}
      <Card className="border-yellow-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-base">Outlier Detection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Sunset Gardens — Below Average</p>
              <p className="text-xs text-red-600">Community score 69 is 6 points below portfolio average. Social engagement (62%) and RPM enrollment (48%) are significantly below peers.</p>
            </div>
            <Link href="/properties/sunset-gardens">
              <Button variant="outline" size="sm" className="text-xs">Review</Button>
            </Link>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Oak Ridge Villas — Top Performer</p>
              <p className="text-xs text-green-600">Highest community score (81), lowest fall rate (0.8), best IEQ compliance (92%). Consider as model for best practices.</p>
            </div>
            <Link href="/properties/oak-ridge-villas">
              <Button variant="outline" size="sm" className="text-xs">View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
