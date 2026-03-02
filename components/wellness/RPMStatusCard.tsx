'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  FileText,
  AlertCircle,
  TrendingUp,
  Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface RPMStatusCardProps {
  unitId: string;
}

interface RPMData {
  enrolled: boolean;
  enrollmentDate: Date | null;
  billingStatus: 'eligible' | 'pending' | 'submitted' | 'not_eligible';
  currentCPT: string;
  reimbursementRate: string;
  monitoringDays: number;
  requiredDays: number;
  readingsThisPeriod: number;
  requiredReadings: number;
  minutesThisPeriod: number;
  requiredMinutes: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  lastTransmission: Date;
  deviceTypes: string[];
  totalBilled: number;
  totalRevenue: number;
  complianceRate: number;
  alerts: { type: string; message: string }[];
}

function getRPMDataForUnit(unitId: string): RPMData {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dayOfMonth = now.getDate();

  if (unitId === '118') {
    return {
      enrolled: true,
      enrollmentDate: new Date('2025-06-15'),
      billingStatus: 'eligible',
      currentCPT: 'CPT 99454',
      reimbursementRate: '$91-168/mo',
      monitoringDays: dayOfMonth - 2,
      requiredDays: 16,
      readingsThisPeriod: (dayOfMonth - 2) * 4,
      requiredReadings: 16,
      minutesThisPeriod: 32,
      requiredMinutes: 20,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      lastTransmission: new Date(Date.now() - 15 * 60 * 1000),
      deviceTypes: ['Awair Element (IEQ)', 'mmWave Radar', 'Smart Lock', 'Motion Sensor'],
      totalBilled: 8,
      totalRevenue: 1092,
      complianceRate: 94,
      alerts: [
        { type: 'warning', message: 'Wellness score below 50 — review required for care plan adjustment' },
        { type: 'info', message: '3 fall events documented this quarter — flag for physician review' },
      ],
    };
  }

  // Healthy unit (2b-type)
  return {
    enrolled: true,
    enrollmentDate: new Date('2025-03-01'),
    billingStatus: 'submitted',
    currentCPT: 'CPT 99454',
    reimbursementRate: '$91-168/mo',
    monitoringDays: dayOfMonth - 1,
    requiredDays: 16,
    readingsThisPeriod: (dayOfMonth - 1) * 6,
    requiredReadings: 16,
    minutesThisPeriod: 24,
    requiredMinutes: 20,
    billingPeriodStart: periodStart,
    billingPeriodEnd: periodEnd,
    lastTransmission: new Date(Date.now() - 5 * 60 * 1000),
    deviceTypes: ['Awair Element (IEQ)', 'Smart Lock', 'Thermostat', 'Leak Sensor'],
    totalBilled: 12,
    totalRevenue: 1680,
    complianceRate: 98,
    alerts: [],
  };
}

export function RPMStatusCard({ unitId }: RPMStatusCardProps) {
  const rpm = useMemo(() => getRPMDataForUnit(unitId), [unitId]);

  if (!rpm.enrolled) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-slate-400" />
            RPM Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Not enrolled in Remote Patient Monitoring</p>
        </CardContent>
      </Card>
    );
  }

  const monitoringProgress = Math.min(100, (rpm.monitoringDays / rpm.requiredDays) * 100);
  const readingsProgress = Math.min(100, (rpm.readingsThisPeriod / rpm.requiredReadings) * 100);
  const minutesProgress = Math.min(100, (rpm.minutesThisPeriod / rpm.requiredMinutes) * 100);
  const allThresholdsMet = rpm.monitoringDays >= rpm.requiredDays && rpm.readingsThisPeriod >= rpm.requiredReadings && rpm.minutesThisPeriod >= rpm.requiredMinutes;

  const billingStatusConfig: Record<string, { color: string; label: string }> = {
    eligible: { color: 'bg-green-100 text-green-700', label: 'Eligible' },
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    submitted: { color: 'bg-blue-100 text-blue-700', label: 'Submitted' },
    not_eligible: { color: 'bg-red-100 text-red-700', label: 'Not Eligible' },
  };

  const bConfig = billingStatusConfig[rpm.billingStatus];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              RPM Billing Status
            </CardTitle>
            <Badge className={`${bConfig.color} text-[10px]`}>{bConfig.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* CPT & Revenue */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{rpm.currentCPT}</p>
              <p className="text-xs text-slate-500">{rpm.reimbursementRate}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">${rpm.totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">{rpm.totalBilled} months billed</p>
            </div>
          </div>

          <Separator />

          {/* Billing Period Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {rpm.billingPeriodStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} — {rpm.billingPeriodEnd.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
              {allThresholdsMet ? (
                <Badge className="bg-green-100 text-green-700 text-[10px]">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Thresholds Met
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">
                  <Clock className="mr-1 h-3 w-3" />
                  In Progress
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {/* Monitoring Days */}
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-slate-600">Monitoring Days</span>
                  <span className={rpm.monitoringDays >= rpm.requiredDays ? 'text-green-600 font-medium' : 'text-slate-600'}>
                    {rpm.monitoringDays}/{rpm.requiredDays}
                  </span>
                </div>
                <Progress value={monitoringProgress} className={`h-1.5 ${rpm.monitoringDays >= rpm.requiredDays ? '[&>div]:bg-green-500' : ''}`} />
              </div>

              {/* Device Readings */}
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-slate-600">Device Readings</span>
                  <span className={rpm.readingsThisPeriod >= rpm.requiredReadings ? 'text-green-600 font-medium' : 'text-slate-600'}>
                    {rpm.readingsThisPeriod}/{rpm.requiredReadings} req
                  </span>
                </div>
                <Progress value={readingsProgress} className={`h-1.5 ${rpm.readingsThisPeriod >= rpm.requiredReadings ? '[&>div]:bg-green-500' : ''}`} />
              </div>

              {/* Clinical Review Minutes */}
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-slate-600">Clinical Review</span>
                  <span className={rpm.minutesThisPeriod >= rpm.requiredMinutes ? 'text-green-600 font-medium' : 'text-slate-600'}>
                    {rpm.minutesThisPeriod}/{rpm.requiredMinutes} min
                  </span>
                </div>
                <Progress value={minutesProgress} className={`h-1.5 ${rpm.minutesThisPeriod >= rpm.requiredMinutes ? '[&>div]:bg-green-500' : ''}`} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Device & Transmission Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Last Transmission</p>
              <p className="font-medium flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                {new Date(rpm.lastTransmission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Compliance Rate</p>
              <p className={`font-medium ${rpm.complianceRate >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                {rpm.complianceRate}%
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 uppercase text-[10px] mb-0.5">Connected Devices</p>
              <div className="flex flex-wrap gap-1">
                {rpm.deviceTypes.map(d => (
                  <Badge key={d} variant="outline" className="text-[9px]">{d}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {rpm.alerts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                {rpm.alerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded text-xs ${
                    alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Enrolled Since */}
          <div className="text-[10px] text-slate-400 text-center">
            Enrolled since {rpm.enrollmentDate?.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
