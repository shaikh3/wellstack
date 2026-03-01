'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  TrendingUp,
  TrendingDown,
  Minus,
  Wind,
  Moon,
  Shield,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit, getTrendIndicator } from '@/lib/mock/wellnessData';

interface WellnessScoreCardProps {
  unitId: string;
}

export function WellnessScoreCard({ unitId }: WellnessScoreCardProps) {
  const { 
    getWellnessScore, 
    fetchWellnessScore, 
    isLoadingScore,
    _hasHydrated
  } = useWellnessStore();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const score = getWellnessScore(unitId) || getWellnessDataForUnit(unitId).wellnessScore;
  
  useEffect(() => {
    if (mounted && _hasHydrated && !getWellnessScore(unitId)) {
      fetchWellnessScore(unitId);
    }
  }, [unitId, fetchWellnessScore, getWellnessScore, mounted, _hasHydrated]);
  
  // Safety check - if data is still not available, use fallback
  const safeScore = score || {
    overall: 82,
    components: { ieq: 85, sleep: 80, safety: 82, activity: 81 },
    trend: 'stable',
    percentile: 70
  };
  
  const trend = getTrendIndicator(safeScore.trend);
  
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
  
  // Calculate circumference for the ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore.overall / 100) * circumference;

  // Show skeleton while loading
  if (!mounted || isLoadingScore) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-4">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-base font-semibold">Wellness Score</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Score Display */}
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              {/* Background ring */}
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className={getScoreRingColor(safeScore.overall)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  className={`text-4xl font-bold ${getScoreColor(safeScore.overall)}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {safeScore.overall}
                </motion.span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
            </div>
          </div>
          
          {/* Trend & Percentile */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className={`flex items-center gap-1 ${trend.color}`}>
              {safeScore.trend === 'improving' ? <TrendingUp className="h-4 w-4" /> : 
               safeScore.trend === 'declining' ? <TrendingDown className="h-4 w-4" /> : 
               <Minus className="h-4 w-4" />}
              <span>{safeScore.trend === 'improving' ? '+3 pts' : safeScore.trend === 'declining' ? '-2 pts' : 'No change'}</span>
            </div>
            
            {safeScore.percentile && (
              <Badge variant="outline" className="text-slate-600">
                Top {100 - safeScore.percentile}%
              </Badge>
            )}
          </div>
          
          {/* Component Breakdown */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Component Breakdown</p>
            
            {/* IEQ */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">Air Quality</span>
                  <span className="text-xs text-slate-400">(30%)</span>
                </div>
                <span className={`font-medium ${getScoreColor(safeScore.components.ieq)}`}>{safeScore.components.ieq}</span>
              </div>
              <Progress 
                value={safeScore.components.ieq} 
                className="h-1.5"
              />
            </div>
            
            {/* Sleep */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">Sleep</span>
                  <span className="text-xs text-slate-400">(25%)</span>
                </div>
                <span className={`font-medium ${getScoreColor(safeScore.components.sleep)}`}>{safeScore.components.sleep}</span>
              </div>
              <Progress 
                value={safeScore.components.sleep} 
                className="h-1.5"
              />
            </div>
            
            {/* Safety */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">Safety</span>
                  <span className="text-xs text-slate-400">(25%)</span>
                </div>
                <span className={`font-medium ${getScoreColor(safeScore.components.safety)}`}>{safeScore.components.safety}</span>
              </div>
              <Progress 
                value={safeScore.components.safety} 
                className="h-1.5"
              />
            </div>
            
            {/* Activity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">Activity</span>
                  <span className="text-xs text-slate-400">(20%)</span>
                </div>
                <span className={`font-medium ${getScoreColor(safeScore.components.activity)}`}>{safeScore.components.activity}</span>
              </div>
              <Progress 
                value={safeScore.components.activity} 
                className="h-1.5"
              />
            </div>
          </div>
          
          {/* Property Average Comparison */}
          <div className="flex items-center justify-between pt-2 border-t text-sm">
            <span className="text-slate-500">Property Average</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">82</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                +{safeScore.overall - 82}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
