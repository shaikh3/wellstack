'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Shield,
  Wind,
  Heart,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Zap,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { InterventionStatus } from '@/lib/types/wellness';
import { toast } from 'sonner';

interface InterventionStatusCardProps {
  unitId: string;
}

// Intervention data type
interface Intervention {
  id: string;
  type: 'fall_detected' | 'ieq_breach' | 'behavioral_deviation' | 'isolation_alert' | 'wellness_score';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  triggeredAt: Date;
  currentTier: 1 | 2 | 3;
  escalationHistory: { tier: number; timestamp: Date; action: string }[];
  assignedTo: string | null;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  slaMinutes: number;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);

// Mock interventions by unit
const interventionsByUnit: Record<string, Intervention[]> = {
  '118': [
    {
      id: 'int-118-1',
      type: 'fall_detected',
      severity: 'critical',
      title: 'Fall Detected — Bathroom',
      description: 'mmWave sensor detected fall event. Resident on floor for 3 min before self-recovery.',
      triggeredAt: hoursAgo(6),
      currentTier: 3,
      escalationHistory: [
        { tier: 1, timestamp: hoursAgo(6), action: 'Auto-alert generated — fall detected in bathroom' },
        { tier: 2, timestamp: new Date(hoursAgo(6).getTime() + 2 * 60 * 1000), action: 'Staff notified — J. Rodriguez assigned' },
        { tier: 3, timestamp: new Date(hoursAgo(6).getTime() + 15 * 60 * 1000), action: 'Supervisor K. Patel alerted — no staff acknowledgment within SLA' },
      ],
      assignedTo: 'K. Patel (Supervisor)',
      status: 'in_progress',
      slaMinutes: 15,
    },
    {
      id: 'int-118-2',
      type: 'isolation_alert',
      severity: 'critical',
      title: 'Social Isolation — 72h No Exit',
      description: 'No door unlock or common area visit in 72+ hours. Wellness check recommended.',
      triggeredAt: hoursAgo(12),
      currentTier: 2,
      escalationHistory: [
        { tier: 1, timestamp: hoursAgo(12), action: 'Isolation flag triggered — 48h threshold breached' },
        { tier: 2, timestamp: hoursAgo(6), action: 'Escalated to staff — 72h threshold breached, wellness check required' },
      ],
      assignedTo: 'J. Rodriguez',
      status: 'acknowledged',
      slaMinutes: 60,
    },
    {
      id: 'int-118-3',
      type: 'ieq_breach',
      severity: 'warning',
      title: 'IEQ Non-Compliant',
      description: 'CO₂ at 1050 ppm, TVOC at 620 ppb — WELL v2 thresholds exceeded for 4+ hours.',
      triggeredAt: hoursAgo(18),
      currentTier: 1,
      escalationHistory: [
        { tier: 1, timestamp: hoursAgo(18), action: 'Auto-remediation attempted — HVAC boost requested' },
      ],
      assignedTo: null,
      status: 'new',
      slaMinutes: 120,
    },
  ],
};

// Resolved interventions for history
const resolvedInterventionsByUnit: Record<string, { title: string; resolvedAt: Date; responseMin: number; outcome: string }[]> = {
  '2b': [
    { title: 'CO₂ exceeded 900 ppm', resolvedAt: hoursAgo(72), responseMin: 18, outcome: 'HVAC auto-remediation' },
    { title: 'Humidity above 60%', resolvedAt: hoursAgo(168), responseMin: 72, outcome: 'Dehumidifier activated' },
  ],
  '118': [
    { title: 'Nighttime waking — 4 episodes', resolvedAt: hoursAgo(48), responseMin: 0, outcome: 'Logged, pattern monitored' },
    { title: 'Gait anomaly detected', resolvedAt: hoursAgo(96), responseMin: 45, outcome: 'Care team reviewed, fall risk updated' },
  ],
};

const TIER_LABELS = ['', 'Auto-Remediation', 'Staff Response', 'Supervisor Escalation'];
const TIER_COLORS = ['', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500'];

function getTypeIcon(type: Intervention['type']) {
  switch (type) {
    case 'fall_detected': return <Shield className="h-3.5 w-3.5 text-red-500" />;
    case 'isolation_alert': return <User className="h-3.5 w-3.5 text-orange-500" />;
    case 'ieq_breach': return <Wind className="h-3.5 w-3.5 text-yellow-500" />;
    case 'behavioral_deviation': return <Activity className="h-3.5 w-3.5 text-purple-500" />;
    case 'wellness_score': return <Heart className="h-3.5 w-3.5 text-rose-500" />;
  }
}

function formatDuration(triggeredAt: Date): string {
  const mins = Math.round((Date.now() - triggeredAt.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ago`;
}

function InterventionItem({ intervention }: { intervention: Intervention }) {
  const [expanded, setExpanded] = useState(false);

  const elapsedMin = Math.round((Date.now() - intervention.triggeredAt.getTime()) / 60000);
  const slaProgress = Math.min(100, (elapsedMin / intervention.slaMinutes) * 100);
  const overSLA = elapsedMin > intervention.slaMinutes;

  return (
    <div className={`rounded-lg border text-sm ${
      intervention.severity === 'critical' ? 'border-red-200 bg-red-50' :
      intervention.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
      'border-blue-200 bg-blue-50'
    }`}>
      <div
        className="flex items-start gap-2.5 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mt-0.5 flex-shrink-0">{getTypeIcon(intervention.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-800 truncate">{intervention.title}</span>
            <Badge className={`text-[10px] flex-shrink-0 ${
              intervention.severity === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
              'bg-yellow-100 text-yellow-700 border-yellow-200'
            }`}>
              {intervention.severity}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{intervention.description}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-slate-400">{formatDuration(intervention.triggeredAt)}</span>

            {/* Tier indicator */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(t => (
                <div
                  key={t}
                  className={`w-2 h-2 rounded-full ${
                    t <= intervention.currentTier ? TIER_COLORS[t] : 'bg-slate-200'
                  }`}
                  title={TIER_LABELS[t]}
                />
              ))}
              <span className="text-[10px] text-slate-500 ml-0.5">Tier {intervention.currentTier}</span>
            </div>

            {intervention.assignedTo && (
              <span className="text-[10px] text-slate-500 truncate">
                → {intervention.assignedTo}
              </span>
            )}
          </div>

          {/* SLA progress */}
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className={overSLA ? 'text-red-600 font-medium' : 'text-slate-400'}>
                {overSLA ? `${elapsedMin - intervention.slaMinutes}m over SLA` : `${intervention.slaMinutes - elapsedMin}m remaining`}
              </span>
              <span className="text-slate-400">{intervention.slaMinutes}m SLA</span>
            </div>
            <Progress value={slaProgress} className={`h-1 ${overSLA ? '[&>div]:bg-red-500' : ''}`} />
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-dashed border-slate-200 pt-2 mx-3">
          {/* Escalation Timeline */}
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Escalation Timeline</p>
          <div className="space-y-1.5">
            {intervention.escalationHistory.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${TIER_COLORS[step.tier]} flex-shrink-0`} />
                  {i < intervention.escalationHistory.length - 1 && (
                    <div className="w-px h-4 bg-slate-200" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-700">{step.action}</p>
                  <p className="text-[10px] text-slate-400">
                    {step.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {step.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 pt-1">
            {intervention.status === 'new' && (
              <Button size="sm" variant="outline" className="text-xs h-7 flex-1"
                onClick={(e) => { e.stopPropagation(); toast.success('Alert acknowledged'); }}>
                Acknowledge
              </Button>
            )}
            {(intervention.status === 'new' || intervention.status === 'acknowledged') && (
              <Button size="sm" variant="outline" className="text-xs h-7 flex-1"
                onClick={(e) => { e.stopPropagation(); toast.success('Escalated to next tier'); }}>
                <Zap className="h-3 w-3 mr-1" /> Escalate
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-xs h-7 flex-1"
              onClick={(e) => { e.stopPropagation(); toast.success('Marked as resolved'); }}>
              Resolve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InterventionStatusCard({ unitId }: InterventionStatusCardProps) {
  const [mounted, setMounted] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const activeInterventions = interventionsByUnit[unitId] || [];
  const resolvedInterventions = resolvedInterventionsByUnit[unitId] || resolvedInterventionsByUnit['2b'] || [];
  const hasActive = activeInterventions.length > 0;

  const status: InterventionStatus = hasActive
    ? (activeInterventions.some(i => i.severity === 'critical') ? 'escalated' : 'active')
    : 'standby';

  const getStatusBadge = (s: InterventionStatus) => {
    switch (s) {
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
    }
  };

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
              <Bell className={`h-5 w-5 ${hasActive ? 'text-red-500' : 'text-slate-500'}`} />
              <CardTitle className="text-base font-semibold">Interventions</CardTitle>
              {hasActive && (
                <Badge className="bg-red-500 text-white text-[10px] h-5 min-w-5 justify-center">
                  {activeInterventions.length}
                </Badge>
              )}
            </div>
            {getStatusBadge(status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Active Interventions */}
          {hasActive ? (
            <div className="space-y-2">
              {activeInterventions.map(intervention => (
                <InterventionItem key={intervention.id} intervention={intervention} />
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">No Active Interventions</p>
                <p className="text-xs text-green-600 mt-0.5">
                  All thresholds within normal range. System monitoring continuously.
                </p>
              </div>
            </div>
          )}

          {/* Escalation Tier Legend */}
          <div className="flex items-center gap-3 py-2 border-t text-[10px] text-slate-400">
            <span className="font-medium uppercase tracking-wide">Tiers:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Auto</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Staff</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Supervisor</span>
          </div>

          {/* Resolution History */}
          {resolvedInterventions.length > 0 && (
            <div className="space-y-1.5">
              <button
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <span>Resolved ({resolvedInterventions.length})</span>
              </button>
              {showResolved && (
                <div className="space-y-1.5">
                  {resolvedInterventions.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-xs text-slate-500">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="flex-1 truncate">{r.title}</span>
                      <span className="flex-shrink-0">{r.responseMin}m</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {r.resolvedAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
