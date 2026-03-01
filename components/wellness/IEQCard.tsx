'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertCircle,
  CheckCircle2,
  Leaf,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit, getTrendIndicator } from '@/lib/mock/wellnessData';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface IEQCardProps {
  unitId: string;
}

export function IEQCard({ unitId }: IEQCardProps) {
  const { 
    getIEQData, 
    getIEQHistory, 
    fetchIEQData, 
    isLoadingIEQ,
    _hasHydrated 
  } = useWellnessStore();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const ieq = getIEQData(unitId) || getWellnessDataForUnit(unitId).ieq;
  const history = getIEQHistory(unitId) || getWellnessDataForUnit(unitId).history;
  
  useEffect(() => {
    if (mounted && _hasHydrated && !getIEQData(unitId)) {
      fetchIEQData(unitId);
    }
  }, [unitId, fetchIEQData, getIEQData, mounted, _hasHydrated]);
  
  // Safety check - if data is still not available, use fallback
  const safeData = ieq || {
    current: { temperature: 72, humidity: 45, co2: 420, voc: 150, pm25: 8 },
    stats: { temperature: { min: 70, max: 74, avg: 72 }, humidity: { min: 42, max: 48, avg: 45 }, co2: { min: 380, max: 520, avg: 430 } },
    compliance: { overall: 'compliant', pm25: true, co2: true, voc: true, humidity: true, temperature: true },
    trend: 'stable'
  };
  
  const safeHistory = history?.length > 0 ? history : Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (24 - i) * 60 * 60 * 1000),
    temperature: 72,
    humidity: 45,
    co2: 420,
    pm25: 8,
    voc: 150,
  }));
  
  const trend = getTrendIndicator(safeData.trend);
  
  const getComplianceBadge = (compliant: boolean) => (
    compliant ? (
      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Compliant
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
        <AlertCircle className="w-3 h-3 mr-1" /> Violation
      </Badge>
    )
  );

  // Show skeleton while loading
  if (!mounted || isLoadingIEQ) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-full" />
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
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base font-semibold">IEQ Monitoring</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${trend.color}`}>
                {trend.icon} {safeData.trend.charAt(0).toUpperCase() + safeData.trend.slice(1)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main Readings Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Thermometer className="h-3.5 w-3.5" />
                <span className="text-xs">Temp</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeData.current.temperature}</span>
                <span className="text-sm text-slate-500">°F</span>
              </div>
              <div className="h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeHistory}>
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Humidity */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Droplets className="h-3.5 w-3.5" />
                <span className="text-xs">Humidity</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeData.current.humidity}</span>
                <span className="text-sm text-slate-500">%</span>
              </div>
              <div className="h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeHistory}>
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* CO2 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Wind className="h-3.5 w-3.5" />
                <span className="text-xs">CO₂</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{safeData.current.co2}</span>
                <span className="text-sm text-slate-500">ppm</span>
              </div>
              <div className="h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeHistory}>
                    <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="co2" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">PM2.5</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{safeData.current.pm25} µg/m³</span>
                {getComplianceBadge(safeData.compliance.pm25)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">VOC</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{safeData.current.voc} ppb</span>
                {getComplianceBadge(safeData.compliance.voc)}
              </div>
            </div>
          </div>
          
          {/* 24h Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
            <div>
              <p className="text-xs text-slate-500">24h Min</p>
              <p className="text-sm font-medium">{safeData.stats.temperature.min}°F</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">24h Avg</p>
              <p className="text-sm font-medium">{safeData.stats.temperature.avg}°F</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">24h Max</p>
              <p className="text-sm font-medium">{safeData.stats.temperature.max}°F</p>
            </div>
          </div>
          
          {/* WELL Compliance Footer */}
          <div className={`flex items-center justify-center gap-2 pt-2 border-t text-sm ${
            safeData.compliance.overall === 'compliant' 
              ? 'text-green-600' 
              : safeData.compliance.overall === 'warning'
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}>
            {safeData.compliance.overall === 'compliant' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>WELL v2 Compliant</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>WELL v2 {safeData.compliance.overall.charAt(0).toUpperCase() + safeData.compliance.overall.slice(1)}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
