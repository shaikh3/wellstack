"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Home,
  AlertTriangle,
  DollarSign,
  Plus,
  Heart,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Bell,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useAlertStore } from "@/lib/store/alertStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { toast } from "sonner";

// Wellness scores per property (mock — in production these come from aggregation)
const PROPERTY_WELLNESS: Record<string, { score: number; trend: 'up' | 'down' | 'stable'; fallRate: number; rpmEnrolled: number; rpmTotal: number; interventions: number }> = {
  'lakeview-commons': { score: 74, trend: 'up', fallRate: 1.2, rpmEnrolled: 38, rpmTotal: 42, interventions: 3 },
  'oak-ridge-villas': { score: 81, trend: 'up', fallRate: 0.8, rpmEnrolled: 72, rpmTotal: 96, interventions: 1 },
  'sunset-gardens': { score: 69, trend: 'down', fallRate: 1.8, rpmEnrolled: 85, rpmTotal: 103, interventions: 5 },
};

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accent,
  delay = 0,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: number; direction: 'up' | 'down' };
  accent?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent || 'bg-slate-100'}`}>
            <Icon className={`h-4 w-4 ${accent ? 'text-white' : 'text-slate-600'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <p className={`text-xs ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WellnessScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000" />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        className="fill-slate-900 text-xs font-bold" transform={`rotate(90 ${size/2} ${size/2})`}>
        {score}
      </text>
    </svg>
  );
}

function PropertyCard({ property, wellness, alertCount, delay = 0 }: {
  property: { id: string; name: string; address: string; unitCount: number; deviceHealth: number };
  wellness: { score: number; trend: 'up' | 'down' | 'stable'; fallRate: number; rpmEnrolled: number; rpmTotal: number; interventions: number };
  alertCount: number;
  delay?: number;
}) {
  const rpmPct = Math.round((wellness.rpmEnrolled / wellness.rpmTotal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link href={`/properties/${property.id}`}>
        <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <p className="text-sm text-slate-500">{property.address}</p>
              </div>
              <div className="flex items-center gap-2">
                {alertCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {alertCount}
                  </Badge>
                )}
                {wellness.interventions > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1 border-amber-300 text-amber-700 bg-amber-50">
                    <Activity className="h-3 w-3" />
                    {wellness.interventions}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <WellnessScoreRing score={wellness.score} />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Wellness Score</span>
                  <span className="flex items-center gap-1 text-xs">
                    {wellness.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {wellness.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {wellness.trend === 'stable' && <span className="text-slate-400">—</span>}
                    <span className={wellness.trend === 'up' ? 'text-emerald-600' : wellness.trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
                      {wellness.trend === 'up' ? 'Improving' : wellness.trend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">RPM Enrollment</span>
                  <span className="font-medium text-slate-700">{rpmPct}%</span>
                </div>
                <Progress value={rpmPct} className="h-1.5" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3 text-xs text-slate-500">
              <span>{property.unitCount} units</span>
              <span>Fall rate: {wellness.fallRate}/1000 days</span>
              <span className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${property.deviceHealth >= 95 ? 'bg-emerald-500' : property.deviceHealth >= 90 ? 'bg-amber-500' : 'bg-red-500'}`} />
                {property.deviceHealth}% online
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function PortfolioDashboard() {
  const properties = usePortfolioStore((state) => state.properties);
  const totalUnits = usePortfolioStore((state) => state.getTotalUnits());
  const avgDeviceHealth = usePortfolioStore((state) => state.getAverageDeviceHealth());
  const alerts = useAlertStore((state) => state.alerts);
  const allUnits = useUnitStore((state) => state.units);

  const criticalCount = useMemo(() => alerts.filter(a => a.severity === 'critical' && !a.resolvedAt).length, [alerts]);
  const warningCount = useMemo(() => alerts.filter(a => a.severity === 'warning' && !a.resolvedAt).length, [alerts]);
  const totalAlerts = criticalCount + warningCount;

  // Compute alerts per property
  const alertsByProperty = useMemo(() => {
    const map: Record<string, number> = {};
    alerts.filter(a => !a.resolvedAt).forEach(a => {
      map[a.propertyId] = (map[a.propertyId] || 0) + 1;
    });
    return map;
  }, [alerts]);

  // Portfolio-level wellness
  const avgWellness = useMemo(() => {
    const scores = Object.values(PROPERTY_WELLNESS).map(w => w.score);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, []);

  const totalRpmEnrolled = useMemo(() =>
    Object.values(PROPERTY_WELLNESS).reduce((a, w) => a + w.rpmEnrolled, 0), []);
  const totalRpmTotal = useMemo(() =>
    Object.values(PROPERTY_WELLNESS).reduce((a, w) => a + w.rpmTotal, 0), []);
  const rpmRevenue = useMemo(() => `$${(totalRpmEnrolled * 135).toLocaleString()}`, [totalRpmEnrolled]);

  const totalOccupied = useMemo(() => allUnits.filter(u => u.status === 'occupied').length, [allUnits]);

  const propertyCards = properties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    unitCount: p.unitCount,
    deviceHealth: p.deviceHealth,
  }));

  const recentAlerts = useMemo(() =>
    alerts.filter(a => !a.resolvedAt && a.severity === 'critical').slice(0, 3), [alerts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Overview</h1>
          <p className="text-slate-500">Manage your properties and monitor performance</p>
        </div>
        <Button className="gap-2" onClick={() => toast.success('Add property coming soon')}>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Primary KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Units Managed"
          value={totalUnits.toString()}
          icon={Home}
          trend={{ value: 12, direction: 'up' }}
          delay={0}
        />
        <StatCard
          title="Portfolio Wellness"
          value={avgWellness.toString()}
          icon={Heart}
          accent="bg-emerald-500"
          trend={{ value: 3, direction: 'up' }}
          delay={0.1}
        />
        <StatCard
          title="Active Alerts"
          value={totalAlerts.toString()}
          icon={Bell}
          trend={{ value: 5, direction: 'down' }}
          delay={0.2}
        />
        <StatCard
          title="RPM Revenue/mo"
          value={rpmRevenue}
          icon={DollarSign}
          accent="bg-blue-500"
          trend={{ value: 8, direction: 'up' }}
          delay={0.3}
        />
      </div>

      {/* Secondary wellness strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="bg-slate-50/50">
          <CardContent className="flex items-center gap-3 pt-4 pb-3">
            <Users className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium">{totalOccupied} occupied</p>
              <p className="text-xs text-slate-500">{Math.round((totalOccupied / totalUnits) * 100)}% occupancy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardContent className="flex items-center gap-3 pt-4 pb-3">
            <Shield className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium">{Math.round((totalRpmEnrolled / totalRpmTotal) * 100)}% RPM enrolled</p>
              <p className="text-xs text-slate-500">{totalRpmEnrolled} of {totalRpmTotal} residents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardContent className="flex items-center gap-3 pt-4 pb-3">
            <Activity className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium">9 active interventions</p>
              <p className="text-xs text-slate-500">3 escalated this week</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardContent className="flex items-center gap-3 pt-4 pb-3">
            <div className={`h-2 w-2 rounded-full ${avgDeviceHealth >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div>
              <p className="text-sm font-medium">{avgDeviceHealth}% devices online</p>
              <p className="text-xs text-slate-500">{totalUnits * 5} sensors active</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Properties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Link href="/portfolio/wellness">
            <Button variant="ghost" size="sm" className="text-slate-500 gap-1">
              Benchmarking <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propertyCards.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              wellness={PROPERTY_WELLNESS[property.id] || { score: 75, trend: 'stable' as const, fallRate: 1.0, rpmEnrolled: 0, rpmTotal: 1, interventions: 0 }}
              alertCount={alertsByProperty[property.id] || 0}
              delay={0.4 + index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Critical alerts */}
      {recentAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Alerts ({criticalCount})
                </CardTitle>
                <Link href="/alerts">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 gap-1">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAlerts.map((alert) => (
                <Link key={alert.id} href="/alerts" className="block text-sm text-red-600 hover:underline">
                  ⚠ {alert.title} — {alert.unitId ? `Unit ${alert.unitId}, ` : ''}{properties.find(p => p.id === alert.propertyId)?.name || 'Unknown'}
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
