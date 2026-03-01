'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon,
  Thermometer,
  Droplets,
  Sun,
  Volume2,
  Clock,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit } from '@/lib/mock/wellnessData';

interface SleepEnvironmentCardProps {
  unitId: string;
}

export function SleepEnvironmentCard({ unitId }: SleepEnvironmentCardProps) {
  const { 
    getSleepEnvironment, 
    fetchSleepEnvironment, 
    isLoadingSleepEnv,
    _hasHydrated
  } = useWellnessStore();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const env = getSleepEnvironment(unitId) || getWellnessDataForUnit(unitId).sleepEnvironment;
  
  useEffect(() => {
    if (mounted && _hasHydrated && !getSleepEnvironment(unitId)) {
      fetchSleepEnvironment(unitId);
    }
  }, [unitId, fetchSleepEnvironment, getSleepEnvironment, mounted, _hasHydrated]);
  
  // Safety check - if data is still not available, use fallback
  const safeEnv = env || {
    temperature: 68,
    humidity: 50,
    lightLevel: 0.5,
    noiseLevel: 32,
    circadianScore: 85,
    recommendedBedtime: '10:00 PM',
    status: 'good',
    recommendations: ['Maintain consistent sleep schedule']
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Optimal for Sleep
          </Badge>
        );
      case 'good':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Good
          </Badge>
        );
      case 'fair':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Fair
          </Badge>
        );
      case 'poor':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Poor
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getConditionQuality = (type: string, value: number) => {
    switch (type) {
      case 'temperature':
        if (value >= 65 && value <= 70) return { label: 'Ideal', color: 'text-green-600' };
        if (value >= 60 && value <= 75) return { label: 'Good', color: 'text-blue-600' };
        return { label: 'Fair', color: 'text-yellow-600' };
      case 'humidity':
        if (value >= 40 && value <= 60) return { label: 'Ideal', color: 'text-green-600' };
        if (value >= 30 && value <= 70) return { label: 'Good', color: 'text-blue-600' };
        return { label: 'Fair', color: 'text-yellow-600' };
      case 'light':
        if (value <= 1) return { label: 'Dark ✓', color: 'text-green-600' };
        if (value <= 5) return { label: 'Dim', color: 'text-yellow-600' };
        return { label: 'Bright', color: 'text-red-600' };
      case 'noise':
        if (value <= 30) return { label: 'Quiet ✓', color: 'text-green-600' };
        if (value <= 50) return { label: 'Moderate', color: 'text-blue-600' };
        return { label: 'Loud', color: 'text-yellow-600' };
      default:
        return { label: 'Unknown', color: 'text-slate-500' };
    }
  };
  
  const tempQuality = getConditionQuality('temperature', safeEnv.temperature);
  const humidityQuality = getConditionQuality('humidity', safeEnv.humidity);
  const lightQuality = getConditionQuality('light', safeEnv.lightLevel);
  const noiseQuality = getConditionQuality('noise', safeEnv.noiseLevel);
  
  const getCircadianColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Show skeleton while loading
  if (!mounted || isLoadingSleepEnv) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-semibold">Sleep Environment</CardTitle>
            </div>
            {getStatusBadge(safeEnv.status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Conditions Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Temperature */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Thermometer className="h-3.5 w-3.5" />
                <span className="text-xs">Temperature</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeEnv.temperature}</span>
                <span className="text-sm text-slate-500">°F</span>
              </div>
              <span className={`text-xs font-medium ${tempQuality.color}`}>
                {tempQuality.label}
              </span>
            </div>
            
            {/* Humidity */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Droplets className="h-3.5 w-3.5" />
                <span className="text-xs">Humidity</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeEnv.humidity}</span>
                <span className="text-sm text-slate-500">%</span>
              </div>
              <span className={`text-xs font-medium ${humidityQuality.color}`}>
                {humidityQuality.label}
              </span>
            </div>
            
            {/* Light Level */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Sun className="h-3.5 w-3.5" />
                <span className="text-xs">Light Level</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeEnv.lightLevel}</span>
                <span className="text-sm text-slate-500">lux</span>
              </div>
              <span className={`text-xs font-medium ${lightQuality.color}`}>
                {lightQuality.label}
              </span>
            </div>
            
            {/* Noise Level */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Volume2 className="h-3.5 w-3.5" />
                <span className="text-xs">Noise</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeEnv.noiseLevel}</span>
                <span className="text-sm text-slate-500">dB</span>
              </div>
              <span className={`text-xs font-medium ${noiseQuality.color}`}>
                {noiseQuality.label}
              </span>
            </div>
          </div>
          
          {/* Circadian Score */}
          <div className="space-y-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700">Circadian Score</span>
              </div>
              <span className={`text-xl font-bold ${getCircadianColor(safeEnv.circadianScore)}`}>
                {safeEnv.circadianScore}
              </span>
            </div>
            <Progress 
              value={safeEnv.circadianScore} 
              className="h-2"
            />
            <p className="text-xs text-slate-500">
              {safeEnv.circadianScore >= 90 
                ? 'Excellent circadian alignment' 
                : safeEnv.circadianScore >= 75 
                ? 'Good circadian rhythm' 
                : 'Circadian rhythm could be improved'}
            </p>
          </div>
          
          {/* Lighting Schedule */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lighting Schedule</p>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Dim at 9:00 PM</p>                <p className="text-xs text-slate-500">Prepare for sleep mode</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Recommended Bedtime: {safeEnv.recommendedBedtime}</p>
                <p className="text-xs text-slate-500">Based on sleep patterns</p>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recommendations</p>
            
            <div className="space-y-1.5">
              {safeEnv.recommendations?.map((rec, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{rec}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Last Light Exposure */}
          
          {safeEnv.lastLightExposure && (
            <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-400">
              <span>Last light exposure</span>
              <span>
                {(() => {
                  const hours = Math.floor((Date.now() - new Date(safeEnv.lastLightExposure!).getTime()) / (1000 * 60 * 60));
                  if (hours < 1) return 'Just now';
                  if (hours === 1) return '1 hour ago';
                  return `${hours} hours ago`;
                })()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
