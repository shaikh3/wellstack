'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Shield,
  Wind,
  Heart,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { InterventionStatus, AlertThreshold } from '@/lib/types/wellness';

interface InterventionStatusCardProps {
  unitId: string;
}

// Default thresholds for Unit 2B
const defaultThresholds: AlertThreshold[] = [
  { metric: 'Wellness Score', operator: 'lt', value: 70, action: 'notify' },
  { metric: 'Fall Risk', operator: 'eq', value: 3, action: 'escalate' },
  { metric: 'IEQ Violation', operator: 'eq', value: 1, action: 'maintenance' },
];

export function InterventionStatusCard({ unitId }: InterventionStatusCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // For P2, we'll use static/mock intervention config
  const status: InterventionStatus = 'standby';
  const thresholds = defaultThresholds;
  
  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'standby':
        return (
          <Badge variant="outline" className="text-slate-600 border-slate-300">
            <Clock className="w-3 h-3 mr-1" /> Standby
          </Badge>
        );
      case 'monitoring':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Activity className="w-3 h-3 mr-1" /> Monitoring
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case 'escalated':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <Shield className="w-3 h-3 mr-1" /> Escalated
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'notify':
        return <Bell className="h-3.5 w-3.5 text-blue-500" />;
      case 'escalate':
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      case 'maintenance':
        return <Settings className="h-3.5 w-3.5 text-yellow-500" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-slate-400" />;
    }
  };
  
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'notify':
        return 'Notify';
      case 'escalate':
        return 'Escalate';
      case 'maintenance':
        return 'Maintenance';
      default:
        return action;
    }
  };
  
  const getMetricIcon = (metric: string) => {
    if (metric.includes('Wellness')) return <Heart className="h-3.5 w-3.5 text-rose-500" />;
    if (metric.includes('Fall')) return <Shield className="h-3.5 w-3.5 text-amber-500" />;
    if (metric.includes('IEQ')) return <Wind className="h-3.5 w-3.5 text-green-500" />;
    return <Activity className="h-3.5 w-3.5 text-slate-400" />;
  };

  // Show skeleton while loading
  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
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
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-base font-semibold">Intervention Status</CardTitle>
            </div>
            {getStatusBadge(status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Description */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium">System Ready</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated intervention workflows are configured and ready. 
                  P3 will implement full escalation workflows.
                </p>
              </div>
            </div>
          </div>
          
          {/* Alert Thresholds */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alert Thresholds</p>
            
            <div className="space-y-2">
              {thresholds.map((threshold, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-slate-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {getMetricIcon(threshold.metric)}
                    <span className="text-slate-700">{threshold.metric}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {threshold.operator === 'lt' ? '< ' : 
                       threshold.operator === 'gt' ? '> ' : '= '}
                      {threshold.value}
                    </span>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        threshold.action === 'escalate' ? 'border-red-200 text-red-600' :
                        threshold.action === 'maintenance' ? 'border-yellow-200 text-yellow-600' :
                        'border-blue-200 text-blue-600'
                      }`}
                    >
                      {getActionIcon(threshold.action)}
                      <span className="ml-1">{getActionLabel(threshold.action)}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notification Settings</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Push Notifications</span>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Email Alerts</span>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Caregiver Alerts</span>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          
          {/* Coming in P3 Note */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Coming in P3</p>
              <p className="text-amber-700 mt-0.5">
                Full intervention automation with caregiver workflows, 
                family notifications, and emergency service integration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
