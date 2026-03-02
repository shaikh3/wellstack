'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Ambulance,
  Check,
  X,
  AlertOctagon,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Intervention {
  id: string;
  tier: 1 | 2 | 3;
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  slaMinutes: number;
  elapsedMinutes: number;
  timeline: {
    timestamp: Date;
    action: string;
    actor: string;
  }[];
}

interface InterventionStatusCardProps {
  unitId: string;
}

// Mock interventions for Unit 118 (critical)
const mockInterventions118: Intervention[] = [
  {
    id: 'int-118-1',
    tier: 3,
    status: 'active',
    severity: 'critical',
    title: 'Fall Event Response',
    description: 'Fall detected in bathroom 6 hours ago. Resident assessed on-site.',
    triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    slaMinutes: 15,
    elapsedMinutes: 360,
    timeline: [
      { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), action: 'Fall detected via mmWave sensor', actor: 'System' },
      { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000 + 60000), action: 'Emergency protocol activated', actor: 'System' },
      { timestamp: new Date(Date.now() - 5.8 * 60 * 60 * 1000), action: 'Staff dispatched to unit', actor: 'J. Rodriguez' },
      { timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000), action: 'On-site assessment complete', actor: 'J. Rodriguez' },
    ]
  },
  {
    id: 'int-118-2',
    tier: 2,
    status: 'in_progress',
    severity: 'high',
    title: 'IEQ Violation - CO2/TVOC',
    description: 'Air quality readings exceed WELL thresholds for 4+ hours.',
    triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    acknowledgedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    assignedTo: 'M. Chen - Maintenance',
    slaMinutes: 120,
    elapsedMinutes: 240,
    timeline: [
      { timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), action: 'IEQ thresholds exceeded', actor: 'System' },
      { timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), action: 'Work order created', actor: 'System' },
      { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), action: 'Assigned to maintenance', actor: 'Dispatcher' },
    ]
  }
];

// Mock interventions for healthy unit (standby)
const mockInterventionsHealthy: Intervention[] = [];

export function InterventionStatusCard({ unitId }: InterventionStatusCardProps) {
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get interventions based on unit
  const interventions = unitId === '118' ? mockInterventions118 : mockInterventionsHealthy;
  const hasActiveInterventions = interventions.length > 0;
  
  const getTierConfig = (tier: number) => {
    switch (tier) {
      case 1:
        return {
          label: 'Tier 1: Auto-Remediation',
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          icon: Settings,
          description: 'Automated response — no staff required'
        };
      case 2:
        return {
          label: 'Tier 2: Staff Check-In',
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          icon: User,
          description: 'Assigned with SLA timer'
        };
      case 3:
        return {
          label: 'Tier 3: Emergency Protocol',
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          icon: Ambulance,
          description: 'Immediate — full audit trail'
        };
      default:
        return {
          label: 'Unknown Tier',
          color: 'bg-slate-500',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700',
          icon: Bell,
          description: ''
        };
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertOctagon className="w-3 h-3 mr-1" /> Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" /> High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" /> Medium</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Bell className="w-3 h-3 mr-1" /> Low</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-red-600 border-red-200 animate-pulse">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Acknowledged</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-200">Resolved</Badge>;
      default:
        return null;
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };
  
  const getSLAProgress = (elapsed: number, sla: number) => {
    const percentage = Math.min(100, (elapsed / sla) * 100);
    return { percentage, isOverdue: elapsed > sla };
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Standby state for healthy units
  if (!hasActiveInterventions) {
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
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base font-semibold">Intervention Status</CardTitle>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Standby
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">All Systems Normal</p>
                <p className="text-sm text-green-600">No active interventions. Automated monitoring enabled.</p>
              </div>
            </div>
            
            {/* Escalation Tiers Reference */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Escalation Tiers</p>
              <div className="space-y-1.5">
                {[1, 2, 3].map((tier) => {
                  const config = getTierConfig(tier);
                  const Icon = config.icon;
                  return (
                    <div key={tier} className="flex items-center gap-2 p-2 rounded-md bg-slate-50">
                      <div className={`h-6 w-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${config.textColor}`} />
                      </div>
                      <span className="text-xs text-slate-600">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Active interventions state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base font-semibold">Active Interventions</CardTitle>
            </div>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {interventions.length} Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {interventions.map((intervention) => {
            const tierConfig = getTierConfig(intervention.tier);
            const TierIcon = tierConfig.icon;
            const sla = getSLAProgress(intervention.elapsedMinutes, intervention.slaMinutes);
            const isExpanded = expandedId === intervention.id;
            
            return (
              <div 
                key={intervention.id}
                className={cn(
                  "rounded-lg border overflow-hidden",
                  tierConfig.borderColor,
                  intervention.tier === 3 && "bg-red-50/50"
                )}
              >
                {/* Header */}
                <div className={cn("p-3", tierConfig.bgColor)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className={`h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0`}>
                        <TierIcon className={`h-4 w-4 ${tierConfig.textColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{intervention.title}</p>
                          {getSeverityBadge(intervention.severity)}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{tierConfig.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{intervention.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(intervention.status)}
                      <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(intervention.triggeredAt)}</p>
                    </div>
                  </div>
                  
                  {/* SLA Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={sla.isOverdue ? "text-red-600 font-medium" : "text-slate-500"}>
                        {sla.isOverdue ? (
                          <><Timer className="h-3 w-3 inline mr-1" /> Overdue</>
                        ) : (
                          <><Clock className="h-3 w-3 inline mr-1" /> SLA Progress</>
                        )}
                      </span>
                      <span className={sla.isOverdue ? "text-red-600" : "text-slate-500"}>
                        {intervention.elapsedMinutes}m / {intervention.slaMinutes}m
                      </span>
                    </div>
                    <Progress 
                      value={sla.percentage} 
                      className={cn("h-1.5", sla.isOverdue && "bg-red-200")}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  {intervention.status !== 'resolved' && (
                    <div className="flex gap-2 mt-3">
                      {intervention.status === 'active' && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          <Check className="h-3 w-3 mr-1" /> Acknowledge
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Phone className="h-3 w-3 mr-1" /> Contact
                      </Button>
                      {intervention.tier < 3 && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs text-red-600 border-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Escalate
                        </Button>
                      )}
                      <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Expandable Timeline */}
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : intervention.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    {isExpanded ? <><ChevronUp className="h-3 w-3" /> Hide Timeline</> : <><ChevronDown className="h-3 w-3" /> Show Timeline</>}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <ScrollArea className="max-h-32">
                          <div className="p-3 space-y-2">
                            {intervention.timeline.map((event, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-slate-700">{event.action}</p>
                                  <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                                    <span>{event.actor}</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(event.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
