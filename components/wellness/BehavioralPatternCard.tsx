'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Coffee,
  Bath,
  Bed,
  AlertCircle,
  CheckCircle2,
  Utensils,
  Footprints
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit, getTrendIndicator } from '@/lib/mock/wellnessData';

interface BehavioralPatternCardProps {
  unitId: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function BehavioralPatternCard({ unitId }: BehavioralPatternCardProps) {
  const { 
    getBehavioralData, 
    fetchBehavioralData, 
    isLoadingBehavioral,
    _hasHydrated 
  } = useWellnessStore();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const data = getBehavioralData(unitId) || getWellnessDataForUnit(unitId).behavioral;
  
  useEffect(() => {
    if (mounted && _hasHydrated && !getBehavioralData(unitId)) {
      fetchBehavioralData(unitId);
    }
  }, [unitId, fetchBehavioralData, getBehavioralData, mounted, _hasHydrated]);
  
  // Safe fallback with realistic pattern
  const safeData = data || {
    adlConsistency: 82,
    adlTrend: 'stable',
    heatmap: DAYS.map((day, dayIndex) => ({
      day,
      hours: HOURS.map(hour => {
        // Simulate realistic daily pattern: low activity at night, 
        // morning routine 7-9am, lunch 12pm, dinner 6pm, evening wind-down
        let base = 0.1;
        if (hour >= 6 && hour <= 9) base = 0.7; // morning
        if (hour >= 11 && hour <= 13) base = 0.5; // lunch
        if (hour >= 17 && hour <= 19) base = 0.6; // dinner
        if (hour >= 20) base = 0.2; // evening
        if (hour >= 0 && hour < 6) base = 0.05; // sleep
        
        // Add some randomness
        const noise = Math.random() * 0.2;
        // Make weekends slightly different
        const weekendFactor = (dayIndex === 0 || dayIndex === 6) ? 0.9 : 1;
        return Math.min(1, (base + noise) * weekendFactor);
      })
    })),
    patterns: {
      bathroom: { status: 'normal' as const, changePercent: 0, frequency: 5 },
      kitchen: { status: 'regular' as const, mealsDetected: 3 },
      sleepWake: { status: 'consistent' as const, avgWake: '7:30 AM', avgSleep: '10:30 PM' },
      mobility: { status: 'active' as const, dailyMinutes: 145 }
    },
    activeDeviations: []
  };
  
  const trend = getTrendIndicator(safeData.adlTrend);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'regular':
      case 'consistent':
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'elevated':
      case 'shifting':
      case 'declining':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
      case 'irregular':
      case 'sedentary':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  
  const getHeatmapColor = (intensity: number) => {
    if (intensity < 0.2) return 'bg-slate-100';
    if (intensity < 0.4) return 'bg-blue-100';
    if (intensity < 0.6) return 'bg-blue-200';
    if (intensity < 0.8) return 'bg-blue-300';
    return 'bg-blue-500';
  };

  if (!mounted || isLoadingBehavioral) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
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
              <Activity className="h-5 w-5 text-teal-500" />
              <CardTitle className="text-base font-semibold">Behavioral Patterns</CardTitle>
            </div>
            <div className={`flex items-center gap-1 ${trend.color}`}>
              {safeData.adlTrend === 'improving' ? <TrendingUp className="h-4 w-4" /> : 
               safeData.adlTrend === 'declining' ? <TrendingDown className="h-4 w-4" /> : 
               <Minus className="h-4 w-4" />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* ADL Score */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-1">ADL Consistency Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${safeData.adlConsistency >= 80 ? 'text-green-600' : safeData.adlConsistency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {safeData.adlConsistency}
                </span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <Progress value={safeData.adlConsistency} className="h-2 mt-1" />
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(safeData.patterns.mobility.status)}>
                {safeData.patterns.mobility.dailyMinutes} min/day
              </Badge>
            </div>
          </div>
          
          {/* Activity Heatmap */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">7-Day Activity Heatmap</p>
            <div className="space-y-1">
              {safeData.heatmap.map((day) => (
                <div key={day.day} className="flex items-center gap-1">
                  <span className="w-8 text-xs text-slate-400">{day.day}</span>
                  <div className="flex-1 flex gap-0.5">
                    {day.hours.map((intensity, hour) => (
                      <div
                        key={hour}
                        className={`flex-1 h-4 rounded-sm ${getHeatmapColor(intensity)}`}
                        title={`${day.day} ${hour}:00 — Activity: ${Math.round(intensity * 100)}%`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Low</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 bg-slate-100 rounded-sm" />
                <div className="w-3 h-3 bg-blue-100 rounded-sm" />
                <div className="w-3 h-3 bg-blue-200 rounded-sm" />
                <div className="w-3 h-3 bg-blue-300 rounded-sm" />
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              </div>
              <span>High</span>
            </div>
          </div>
          
          {/* Pattern Indicators */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pattern Indicators</p>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Bathroom */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50">
                <Bath className="h-4 w-4 text-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Bathroom</p>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium ${safeData.patterns.bathroom.status === 'elevated' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {safeData.patterns.bathroom.status === 'normal' ? 'Normal' : 
                       safeData.patterns.bathroom.status === 'elevated' ? 'Elevated' : 'Low'}
                    </span>
                    {safeData.patterns.bathroom.changePercent !== 0 && (
                      <span className={`text-xs ${safeData.patterns.bathroom.changePercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {safeData.patterns.bathroom.changePercent > 0 ? '+' : ''}{safeData.patterns.bathroom.changePercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Kitchen */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50">
                <Utensils className="h-4 w-4 text-amber-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Kitchen</p>
                  <span className={`text-xs font-medium ${safeData.patterns.kitchen.status === 'regular' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {safeData.patterns.kitchen.status === 'regular' ? 'Regular' : 'Declining'}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">({safeData.patterns.kitchen.mealsDetected}/day)</span>
                </div>
              </div>
              
              {/* Sleep/Wake */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50">
                <Bed className="h-4 w-4 text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Sleep/Wake</p>
                  <span className={`text-xs font-medium ${safeData.patterns.sleepWake.status === 'consistent' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {safeData.patterns.sleepWake.status === 'consistent' ? 'Consistent' : 
                     safeData.patterns.sleepWake.status === 'shifting' ? 'Shifting' : 'Irregular'}
                  </span>
                </div>
              </div>
              
              {/* Mobility */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50">
                <Footprints className="h-4 w-4 text-teal-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Mobility</p>
                  <span className={`text-xs font-medium ${safeData.patterns.mobility.status === 'active' ? 'text-green-600' : 
                    safeData.patterns.mobility.status === 'declining' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {safeData.patterns.mobility.status === 'active' ? 'Active' : 
                     safeData.patterns.mobility.status === 'declining' ? 'Declining' : 'Sedentary'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Deviations */}
          {safeData.activeDeviations.length > 0 && (
            <div className="space-y-2">
              {safeData.activeDeviations.map((deviation, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-2 p-3 rounded-lg ${
                    deviation.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                    deviation.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  {deviation.severity === 'critical' ? <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" /> :
                   deviation.severity === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" /> :
                   <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      deviation.severity === 'critical' ? 'text-red-700' :
                      deviation.severity === 'warning' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {deviation.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
