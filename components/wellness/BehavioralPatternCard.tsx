'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Bath,
  UtensilsCrossed,
  Clock,
  Footprints,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit } from '@/lib/mock/wellnessData';
import { BehavioralPatterns } from '@/lib/types/wellness';

interface BehavioralPatternCardProps {
  unitId: string;
}

const PATTERN_STATUS_CONFIG = {
  bathroom: {
    normal: { color: 'text-green-600', bg: 'bg-green-50', label: 'Normal' },
    elevated: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Elevated' },
    low: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Low' },
  },
  kitchen: {
    regular: { color: 'text-green-600', bg: 'bg-green-50', label: 'Regular' },
    declining: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Declining' },
    minimal: { color: 'text-red-600', bg: 'bg-red-50', label: 'Minimal' },
  },
  sleepWake: {
    consistent: { color: 'text-green-600', bg: 'bg-green-50', label: 'Consistent' },
    shifting: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Shifting' },
    irregular: { color: 'text-red-600', bg: 'bg-red-50', label: 'Irregular' },
  },
  mobility: {
    active: { color: 'text-green-600', bg: 'bg-green-50', label: 'Active' },
    declining: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Declining' },
    sedentary: { color: 'text-red-600', bg: 'bg-red-50', label: 'Sedentary' },
  },
} as const;

function intensityToColor(value: number): string {
  // 0 = dark/no activity, 1 = high activity (green)
  if (value < 0.1) return 'bg-slate-100';
  if (value < 0.3) return 'bg-emerald-100';
  if (value < 0.5) return 'bg-emerald-200';
  if (value < 0.7) return 'bg-emerald-400';
  if (value < 0.85) return 'bg-emerald-500';
  return 'bg-emerald-600';
}

export function BehavioralPatternCard({ unitId }: BehavioralPatternCardProps) {
  const {
    getBehavioralData,
    fetchBehavioralData,
    isLoadingBehavioral,
    _hasHydrated,
  } = useWellnessStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const behavioral = getBehavioralData(unitId) || getWellnessDataForUnit(unitId).behavioral;

  useEffect(() => {
    if (mounted && _hasHydrated && !getBehavioralData(unitId)) {
      fetchBehavioralData(unitId);
    }
  }, [unitId, fetchBehavioralData, getBehavioralData, mounted, _hasHydrated]);

  const safeData = behavioral || getWellnessDataForUnit('2b').behavioral;

  const getTrendIcon = (trend: BehavioralPatterns['adlTrend']) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getADLColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!mounted || isLoadingBehavioral) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-500" />
              <CardTitle className="text-base font-semibold">Behavioral Patterns</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(safeData.adlTrend)}
              <span className="text-xs text-slate-500 capitalize">{safeData.adlTrend}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ADL Score */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">ADL Consistency</p>
              <p className={`text-2xl font-bold ${getADLColor(safeData.adlConsistency)}`}>
                {safeData.adlConsistency}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </p>
            </div>
            <Badge variant="outline" className={`${getADLColor(safeData.adlConsistency)} border-current`}>
              {safeData.adlConsistency >= 85 ? 'Normal' : safeData.adlConsistency >= 70 ? 'Watch' : 'Concern'}
            </Badge>
          </div>

          {/* Activity Heatmap */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">7-Day Activity</p>
            <div className="space-y-1">
              {safeData.heatmap.map((dayData) => (
                <div key={dayData.day} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 w-7 text-right font-mono">{dayData.day}</span>
                  <div className="flex flex-1 gap-px">
                    {dayData.hours.map((val, h) => (
                      <div
                        key={h}
                        className={`flex-1 h-3 rounded-[1px] ${intensityToColor(val)}`}
                        title={`${dayData.day} ${h}:00 — ${Math.round(val * 100)}%`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {/* Hour labels */}
              <div className="flex items-center gap-1.5">
                <span className="w-7" />
                <div className="flex flex-1 justify-between text-[9px] text-slate-400">
                  <span>0</span>
                  <span>6</span>
                  <span>12</span>
                  <span>18</span>
                  <span>23</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[9px] text-slate-400">Low</span>
              <div className="flex gap-px">
                {['bg-slate-100', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-[1px] ${c}`} />
                ))}
              </div>
              <span className="text-[9px] text-slate-400">High</span>
            </div>
          </div>

          {/* Pattern Indicators */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pattern Indicators</p>
            <div className="grid grid-cols-2 gap-2">
              {/* Bathroom */}
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${PATTERN_STATUS_CONFIG.bathroom[safeData.patterns.bathroom.status].bg}`}>
                <Bath className={`h-3.5 w-3.5 ${PATTERN_STATUS_CONFIG.bathroom[safeData.patterns.bathroom.status].color}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${PATTERN_STATUS_CONFIG.bathroom[safeData.patterns.bathroom.status].color}`}>
                    {PATTERN_STATUS_CONFIG.bathroom[safeData.patterns.bathroom.status].label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {safeData.patterns.bathroom.changePercent > 0 ? '↑' : safeData.patterns.bathroom.changePercent < 0 ? '↓' : ''}
                    {Math.abs(safeData.patterns.bathroom.changePercent)}% bathroom
                  </p>
                </div>
              </div>

              {/* Kitchen */}
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${PATTERN_STATUS_CONFIG.kitchen[safeData.patterns.kitchen.status].bg}`}>
                <UtensilsCrossed className={`h-3.5 w-3.5 ${PATTERN_STATUS_CONFIG.kitchen[safeData.patterns.kitchen.status].color}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${PATTERN_STATUS_CONFIG.kitchen[safeData.patterns.kitchen.status].color}`}>
                    {PATTERN_STATUS_CONFIG.kitchen[safeData.patterns.kitchen.status].label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {safeData.patterns.kitchen.mealsDetected} meals/day
                  </p>
                </div>
              </div>

              {/* Sleep/Wake */}
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${PATTERN_STATUS_CONFIG.sleepWake[safeData.patterns.sleepWake.status].bg}`}>
                <Clock className={`h-3.5 w-3.5 ${PATTERN_STATUS_CONFIG.sleepWake[safeData.patterns.sleepWake.status].color}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${PATTERN_STATUS_CONFIG.sleepWake[safeData.patterns.sleepWake.status].color}`}>
                    {PATTERN_STATUS_CONFIG.sleepWake[safeData.patterns.sleepWake.status].label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {safeData.patterns.sleepWake.avgWake} — {safeData.patterns.sleepWake.avgSleep}
                  </p>
                </div>
              </div>

              {/* Mobility */}
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${PATTERN_STATUS_CONFIG.mobility[safeData.patterns.mobility.status].bg}`}>
                <Footprints className={`h-3.5 w-3.5 ${PATTERN_STATUS_CONFIG.mobility[safeData.patterns.mobility.status].color}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${PATTERN_STATUS_CONFIG.mobility[safeData.patterns.mobility.status].color}`}>
                    {PATTERN_STATUS_CONFIG.mobility[safeData.patterns.mobility.status].label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {safeData.patterns.mobility.dailyMinutes} min/day
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Deviations */}
          {safeData.activeDeviations.length > 0 && (
            <div className="space-y-1.5">
              {safeData.activeDeviations.map((deviation, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-2.5 rounded-md text-sm ${
                    deviation.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                    deviation.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                    deviation.severity === 'critical' ? 'text-red-500' :
                    deviation.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <p className={`text-xs ${
                    deviation.severity === 'critical' ? 'text-red-700' :
                    deviation.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                  }`}>
                    {deviation.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {safeData.activeDeviations.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-green-600 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All patterns within normal range</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
