'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit } from '@/lib/mock/wellnessData';
import { CircadianStatus } from '@/lib/types/wellness';

interface CircadianCardProps {
  unitId: string;
}

const PHASE_CONFIG: Record<CircadianStatus['currentPhase'], {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  morning_energize: { label: 'Morning Energize', icon: Sunrise, color: 'text-amber-500', bg: 'bg-amber-50' },
  daytime_focus: { label: 'Daytime Focus', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  evening_winddown: { label: 'Evening Wind-Down', icon: Sunset, color: 'text-orange-500', bg: 'bg-orange-50' },
  night_mode: { label: 'Night Mode', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

function cctToColor(cct: number): string {
  // Map CCT to a CSS color for the timeline bar
  if (cct <= 2000) return '#ff8a2b';
  if (cct <= 2700) return '#ffab4a';
  if (cct <= 3500) return '#ffc76b';
  if (cct <= 4500) return '#ffe4a1';
  if (cct <= 5000) return '#fff4d6';
  return '#f0f4ff'; // 5500K+ cool white / blue-white
}

export function CircadianCard({ unitId }: CircadianCardProps) {
  const {
    getCircadianData,
    fetchCircadianData,
    isLoadingCircadian,
    _hasHydrated,
  } = useWellnessStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const circadian = getCircadianData(unitId) || getWellnessDataForUnit(unitId).circadian;

  useEffect(() => {
    if (mounted && _hasHydrated && !getCircadianData(unitId)) {
      fetchCircadianData(unitId);
    }
  }, [unitId, fetchCircadianData, getCircadianData, mounted, _hasHydrated]);

  const safeData = circadian || getWellnessDataForUnit('2b').circadian;
  const phase = PHASE_CONFIG[safeData.currentPhase];
  const PhaseIcon = phase.icon;

  const currentHour = new Date().getHours();

  // Find next schedule transition
  const nextTransition = (() => {
    const schedule = safeData.schedule;
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].hour > currentHour) {
        const nextCCT = schedule[i].cct;
        const prevCCT = i > 0 ? schedule[i - 1].cct : schedule[schedule.length - 1].cct;
        if (nextCCT !== prevCCT) {
          const h = schedule[i].hour;
          const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
          return { hour: h, label, cct: nextCCT };
        }
      }
    }
    return { hour: 6, label: '6:00 AM', cct: 2700 };
  })();

  const getMEDIStatus = () => {
    if (safeData.currentPhase === 'night_mode' || safeData.currentPhase === 'evening_winddown') {
      return safeData.melanopicEDI <= 10 ? 'good' : 'high';
    }
    return safeData.melanopicEDI >= 250 ? 'good' : 'low';
  };

  const mediStatus = getMEDIStatus();

  if (!mounted || isLoadingCircadian) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-semibold">Circadian Lighting</CardTitle>
            </div>
            {safeData.overrideActive ? (
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                <AlertCircle className="w-3 h-3 mr-1" /> Override
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> On Schedule
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Phase */}
          <div className={`flex items-center gap-3 p-3 rounded-lg ${phase.bg}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/80`}>
              <PhaseIcon className={`h-5 w-5 ${phase.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{phase.label}</p>
              <p className="text-xs text-slate-500">
                {safeData.currentCCT.toLocaleString()}K · {safeData.currentBrightness}% brightness
              </p>
            </div>
          </div>

          {/* 24h Timeline Bar */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">24h Schedule</p>
            <div className="relative">
              <div className="flex h-6 rounded-full overflow-hidden border border-slate-200">
                {safeData.schedule.map((point, i) => (
                  <div
                    key={i}
                    className="flex-1 relative"
                    style={{
                      backgroundColor: point.brightness === 0
                        ? '#1e1b4b'
                        : cctToColor(point.cct),
                      opacity: point.brightness === 0 ? 1 : Math.max(0.3, point.brightness / 100),
                    }}
                  />
                ))}
              </div>
              {/* Current time marker */}
              <div
                className="absolute top-0 w-0.5 h-6 bg-slate-900"
                style={{ left: `${(currentHour / 24) * 100}%` }}
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white" />
              </div>
              {/* Hour labels */}
              <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                <span>12a</span>
                <span>6a</span>
                <span>12p</span>
                <span>6p</span>
                <span>12a</span>
              </div>
            </div>
          </div>

          {/* mEDI + Adherence */}
          <div className="grid grid-cols-2 gap-3">
            {/* Melanopic EDI */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs">Melanopic EDI</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeData.melanopicEDI}</span>
                <span className="text-xs text-slate-400">mEDI</span>
              </div>
              <div className={`flex items-center gap-1 text-xs ${
                mediStatus === 'good' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {mediStatus === 'good' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                <span>
                  {mediStatus === 'good'
                    ? 'On target'
                    : mediStatus === 'high'
                    ? 'Too high for phase'
                    : `Below ${safeData.mEDITarget} target`}
                </span>
              </div>
            </div>

            {/* Weekly Adherence */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs">Adherence</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeData.adherenceWeekly}</span>
                <span className="text-xs text-slate-400">%</span>
              </div>
              <Progress value={safeData.adherenceWeekly} className="h-1.5" />
            </div>
          </div>

          {/* Next Transition */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
            <span className="text-slate-500">Next transition</span>
            <span className="font-medium">{nextTransition.label} → {nextTransition.cct.toLocaleString()}K</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
