'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Footprints,
  Lightbulb,
  History,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { getWellnessDataForUnit } from '@/lib/mock/wellnessData';
import { FallActivityEntry } from '@/lib/types/wellness';

interface FallDetectionCardProps {
  unitId: string;
}

export function FallDetectionCard({ unitId }: FallDetectionCardProps) {
  const { 
    getFallDetection, 
    fetchFallDetection, 
    isLoadingFallRisk,
    _hasHydrated
  } = useWellnessStore();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const status = getFallDetection(unitId) || getWellnessDataForUnit(unitId).fallDetection;
  
  useEffect(() => {
    if (mounted && _hasHydrated && !getFallDetection(unitId)) {
      fetchFallDetection(unitId);
    }
  }, [unitId, fetchFallDetection, getFallDetection, mounted, _hasHydrated]);
  
  // Safety check - if data is still not available, use fallback
  const safeStatus = status || {
    profile: { level: 'low', score: 25, factors: {}, lastAssessed: new Date() },
    radarStatus: 'online',
    coverage: ['Bedroom', 'Bathroom'],
    recentActivity: []
  };
  
  const { profile, radarStatus, coverage, recentActivity } = safeStatus;
  
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Low Risk
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Medium Risk
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" /> High Risk
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getRadarStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <div className="flex items-center gap-1.5 text-green-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium">Online</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-1.5 text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-xs font-medium">Offline</span>
          </div>
        );
      case 'calibrating':
        return (
          <div className="flex items-center gap-1.5 text-yellow-600">
            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
            <span className="text-xs font-medium">Calibrating</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const getActivityIcon = (type: FallActivityEntry['type']) => {
    switch (type) {
      case 'fall_detected':
        return <ShieldAlert className="h-3.5 w-3.5 text-red-500" />;
      case 'nighttime_waking':
        return <Footprints className="h-3.5 w-3.5 text-blue-500" />;
      case 'gait_anomaly':
        return <Activity className="h-3.5 w-3.5 text-yellow-500" />;
      case 'zone_entry':
      case 'zone_exit':
        return <MapPin className="h-3.5 w-3.5 text-slate-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1h ago';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  // Count incidents and wakings
  const fallCount = recentActivity?.filter(a => a.type === 'fall_detected').length || 0;
  const wakingCount = recentActivity?.filter(a => a.type === 'nighttime_waking').length || 0;

  // Show skeleton while loading
  if (!mounted || isLoadingFallRisk) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
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
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-semibold">Fall Detection</CardTitle>
            </div>
            {getRiskBadge(profile.level)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Radar Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Radar Status</span>
            </div>
            {getRadarStatusBadge(radarStatus)}
          </div>
          
          {/* Coverage Zones */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Coverage Zones</p>
            <div className="flex flex-wrap gap-2">
              {coverage?.map((zone) => (
                <Badge 
                  key={zone} 
                  variant="outline" 
                  className="text-slate-600 border-slate-200"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Risk Factors */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Risk Assessment</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                profile.factors?.gaitAnomaly ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                <Activity className="h-3.5 w-3.5" />
                <span>{profile.factors?.gaitAnomaly ? 'Gait Issues' : 'Normal Gait'}</span>
              </div>
              
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                profile.factors?.nighttimeActivity ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
              }`}>
                <Footprints className="h-3.5 w-3.5" />
                <span>{profile.factors?.nighttimeActivity ? 'High Night Activity' : 'Normal Sleep'}</span>
              </div>
              
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                profile.factors?.environmentalHazards?.length ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
              }`}>
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{profile.factors?.environmentalHazards?.length ? 'Hazards Found' : 'No Hazards'}</span>
              </div>
              
              <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                profile.factors?.history ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                <History className="h-3.5 w-3.5" />
                <span>{profile.factors?.history ? 'Fall History' : 'No History'}</span>
              </div>
            </div>
          </div>
          
          {/* Last 7 Days Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{fallCount}</p>
              <p className="text-xs text-slate-500">Fall Incidents (7d)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{wakingCount}</p>
              <p className="text-xs text-slate-500">Night Wakings (7d)</p>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recent Activity</p>
            
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {recentActivity?.slice(0, 5).map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-2 p-2 rounded-md bg-slate-50 text-sm"
                  >
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">
                        {activity.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                      {activity.zone && (
                        <p className="text-xs text-slate-500">{activity.zone}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Last Assessed */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-400">
            <span>Last assessed</span>
            <span>{new Date(profile.lastAssessed).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
