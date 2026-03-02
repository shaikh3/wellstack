'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit, getTrendIndicator } from '@/lib/mock/wellnessData';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface CircadianCardProps {
  unitId: string;
}

export function CircadianCard({ unitId }: CircadianCardProps) {
  const { 
    getCircadianData, 
    fetchCircadianData, 
    isLoadingCircadian,
    _hasHydrated 
  } = useWellnessStore();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const data = getCircadianData(unitId) || getWellnessDataForUnit(unitId).circadian;
  
  useEffect(() => {
    if (mounted && _hasHydrated && !getCircadianData(unitId)) {
      fetchCircadianData(unitId);
    }
  }, [unitId, fetchCircadianData, getCircadianData, mounted, _hasHydrated]);
  
  // Safe fallback
  const safeData = data || {
    currentCCT: 4500,
    currentBrightness: 75,
    currentPhase: 'daytime_focus',
    melanopicEDI: 180,
    mEDITarget: 250,
    adherenceWeekly: 87,
    schedule: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      cct: i < 6 ? 2700 : i < 9 ? 4000 : i < 17 ? 5000 : i < 20 ? 3500 : 2700,
      brightness: i < 6 ? 20 : i < 9 ? 60 : i < 17 ? 100 : i < 20 ? 70 : 30
    })),
    overrideActive: false,
    trend: 'stable'
  };
  
  const trend = getTrendIndicator(safeData.trend);
  
  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'morning_energize':
        return { label: 'Morning Energize', icon: Sunrise, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'daytime_focus':
        return { label: 'Daytime Focus', icon: Sun, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'evening_winddown':
        return { label: 'Evening Wind-Down', icon: Sunset, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'night_mode':
        return { label: 'Night Mode', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' };
      default:
        return { label: 'Daytime Focus', icon: Sun, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };
  
  const phaseInfo = getPhaseInfo(safeData.currentPhase);
  const PhaseIcon = phaseInfo.icon;
  
  const getCCTColor = (cct: number) => {
    if (cct < 3000) return '#f59e0b'; // warm amber
    if (cct < 4000) return '#f97316'; // orange
    if (cct < 5000) return '#3b82f6'; // blue
    return '#60a5fa'; // bright blue
  };
  
  const currentHour = new Date().getHours();

  if (!mounted || isLoadingCircadian) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-semibold">Circadian Lighting</CardTitle>
            </div>
            <div className={`flex items-center gap-1 ${trend.color}`}>
              {safeData.trend === 'improving' ? <TrendingUp className="h-4 w-4" /> : 
               safeData.trend === 'declining' ? <TrendingDown className="h-4 w-4" /> : 
               <Minus className="h-4 w-4" />}
              <span className="text-sm">{safeData.adherenceWeekly}% adherence</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Phase */}
          <div className={`flex items-center gap-3 p-3 ${phaseInfo.bg} rounded-lg`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <PhaseIcon className={`h-6 w-6 ${phaseInfo.color}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${phaseInfo.color}`}>{phaseInfo.label}</p>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>{safeData.currentCCT}K</span>
                <span>•</span>
                <span>{safeData.currentBrightness}% brightness</span>
              </div>
            </div>
            {safeData.overrideActive && (
              <Badge variant="outline" className="text-amber-600 border-amber-200">
                Manual Override
              </Badge>
            )}
          </div>
          
          {/* 24h Timeline */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">24-Hour Schedule</p>
            <div className="h-16 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeData.schedule}>
                  <defs>
                    <linearGradient id="cctGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="25%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="75%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" hide />
                  <YAxis hide domain={[0, 6500]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}K`, 'CCT']}
                    labelFormatter={(label) => `${label}:00`}
                  />
                  <ReferenceLine x={currentHour} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="cct" 
                    stroke="url(#cctGradient)" 
                    fill="url(#cctGradient)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* Current time marker */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-red-500"
                style={{ left: `${(currentHour / 24) * 100}%` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>12AM</span>
              <span>6AM</span>
              <span>12PM</span>
              <span>6PM</span>
              <span>12AM</span>
            </div>
          </div>
          
          {/* Melanopic EDI */}
          <div className="space-y-2 p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">Melanopic EDI</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${safeData.melanopicEDI >= safeData.mEDITarget ? 'text-green-600' : 'text-yellow-600'}`}>
                  {safeData.melanopicEDI}
                </span>
                <span className="text-sm text-slate-400"> / {safeData.mEDITarget} target</span>
              </div>
            </div>
            <Progress 
              value={(safeData.melanopicEDI / safeData.mEDITarget) * 100} 
              className="h-2"
            />
            <p className="text-xs text-slate-500">
              {safeData.melanopicEDI >= safeData.mEDITarget 
                ? 'Optimal melanopic light for current phase' 
                : 'Below target — increase brightness or adjust CCT'}
            </p>
          </div>
          
          {/* Weekly Adherence */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Weekly Adherence</span>
            </div>
            <Badge className={safeData.adherenceWeekly >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {safeData.adherenceWeekly}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
