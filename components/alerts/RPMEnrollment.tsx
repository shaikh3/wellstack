'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Scale,
  Activity as ActivityIcon,
  Thermometer,
  Heart,
  Smartphone,
  Download,
  Pause,
  UserX,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RPMEnrollment, RPMReading, RPMDevice, RPMDeviceType } from '@/lib/types/alerts';
import { demoRPMEnrollments, demoRPMReadings } from '@/lib/mock/alerts';
import { delays } from '@/lib/mock/delays';
import { toast } from 'sonner';
import { formatDistanceToNow } from '@/lib/utils';

interface RPMEnrollmentDashboardProps {
  enrollmentId?: string;
}

const deviceIcons: Record<RPMDeviceType, React.ReactNode> = {
  bp_cuff: <ActivityIcon className="h-5 w-5" />,
  scale: <Scale className="h-5 w-5" />,
  glucometer: <ActivityIcon className="h-5 w-5" />,
  pulse_ox: <Heart className="h-5 w-5" />,
  thermometer: <Thermometer className="h-5 w-5" />,
};

const deviceLabels: Record<RPMDeviceType, string> = {
  bp_cuff: 'Blood Pressure Cuff',
  scale: 'Digital Scale',
  glucometer: 'Glucometer',
  pulse_ox: 'Pulse Oximeter',
  thermometer: 'Thermometer',
};

function ComplianceCard({ compliance }: { compliance: RPMEnrollment['compliance'] }) {
  const isCompliant = compliance.currentMonth >= compliance.requiredDays;
  
  return (
    <Card className={isCompliant ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCompliant ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-600">CMS Compliant</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-600">At Risk</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Month</span>
              <span className={`text-lg font-bold ${isCompliant ? 'text-green-600' : 'text-yellow-600'}`}>
                {compliance.currentMonth} / {compliance.requiredDays} days
              </span>
            </div>
            <Progress 
              value={(compliance.currentMonth / compliance.requiredDays) * 100} 
              className="h-3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-slate-500">Compliance Rate</p>
              <p className={`text-2xl font-bold ${compliance.complianceRate >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                {compliance.complianceRate}%
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-slate-500">Consecutive Days</p>
              <p className="text-2xl font-bold">{compliance.consecutiveDays}</p>
            </div>
          </div>
          
          {compliance.lastReadingAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Last reading: {formatDistanceToNow(new Date(compliance.lastReadingAt))} ago</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DeviceCard({ device }: { device: RPMDevice }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {deviceIcons[device.type]}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{deviceLabels[device.type]}</h4>
            <p className="text-sm text-slate-500">{device.manufacturer} {device.model}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                {device.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-slate-400">SN: {device.serialNumber}</span>
            </div>
            {device.lastReadingAt && (
              <p className="text-xs text-slate-400 mt-2">
                Last reading: {formatDistanceToNow(new Date(device.lastReadingAt))} ago
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReadingsTable({ readings }: { readings: RPMReading[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Time</TableHead>
          <TableHead>Metric</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>EHR Sync</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {readings.map((reading) => (
          <TableRow key={reading.id}>
            <TableCell>{new Date(reading.timestamp).toLocaleString()}</TableCell>
            <TableCell className="capitalize">{reading.metricType.replace('_', ' ')}</TableCell>
            <TableCell>
              {reading.value} {reading.unit}
            </TableCell>
            <TableCell>
              {reading.isOutOfRange ? (
                <Badge variant="destructive">Out of Range</Badge>
              ) : (
                <Badge variant="default">Normal</Badge>
              )}
            </TableCell>
            <TableCell>
              {reading.syncedToEHR ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function RPMEnrollmentDashboard({ enrollmentId }: RPMEnrollmentDashboardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find enrollment by ID or use the first one for demo
  const enrollment = enrollmentId 
    ? demoRPMEnrollments.find(e => e.id === enrollmentId)
    : demoRPMEnrollments[0];

  if (!enrollment) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No RPM Enrollment</h3>
          <p className="text-slate-500">This resident is not enrolled in Remote Patient Monitoring.</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Enroll Resident
          </Button>
        </CardContent>
      </Card>
    );
  }

  const readings = demoRPMReadings.filter(r => r.enrollmentId === enrollment.id);

  const handleSuspend = async () => {
    setIsSubmitting(true);
    await delays.slow();
    toast.success('RPM enrollment suspended');
    setIsSubmitting(false);
  };

  const handleDisenroll = async () => {
    setIsSubmitting(true);
    await delays.slow();
    toast.success('Resident disenrolled from RPM');
    setIsSubmitting(false);
  };

  const handleExportBilling = async () => {
    setIsSubmitting(true);
    await delays.slow();
    toast.success('Billing report exported');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">RPM Enrollment</h1>
            <Badge 
              variant={
                enrollment.status === 'enrolled' ? 'default' : 
                enrollment.status === 'suspended' ? 'secondary' : 'destructive'
              }
            >
              {enrollment.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-slate-500">{enrollment.residentName} â€¢ Unit {enrollment.unitNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportBilling} disabled={isSubmitting}>
            <Download className="h-4 w-4 mr-2" />
            Export Billing
          </Button>
          {enrollment.status === 'enrolled' ? (
            <>
              <Button variant="outline" onClick={handleSuspend} disabled={isSubmitting}>
                <Pause className="h-4 w-4 mr-2" />
                Suspend
              </Button>
              <Button variant="destructive" onClick={handleDisenroll} disabled={isSubmitting}>
                <UserX className="h-4 w-4 mr-2" />
                Disenroll
              </Button>
            </>
          ) : (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Billing Code</p>
            <p className="text-lg font-bold">{enrollment.billingCode}</p>
            <p className="text-sm text-slate-500">{enrollment.billingCodeDescription}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Reading Frequency</p>
            <p className="text-lg font-bold capitalize">{enrollment.readingFrequency.replace('_', ' ')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Enrollment Date</p>
            <p className="text-lg font-bold">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
            <p className="text-sm text-slate-500">By: {enrollment.enrollmentSubmittedByName}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="devices">
            <TabsList>
              <TabsTrigger value="devices">
                <Smartphone className="h-4 w-4 mr-2" />
                Devices ({enrollment.devices.length})
              </TabsTrigger>
              <TabsTrigger value="readings">
                <Activity className="h-4 w-4 mr-2" />
                Readings ({readings.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <Calendar className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {enrollment.devices.map((device) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
                <Button variant="outline" className="h-full min-h-[120px] border-dashed">
                  <Plus className="h-5 w-5 mr-2" />
                  Assign Device
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="readings" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <ReadingsTable readings={readings} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Compliance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrollment.compliance.monthlyHistory?.map((month) => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <div>
                          <p className="font-medium">{month.month}</p>
                          <p className="text-sm text-slate-500">{month.daysRecorded} of {month.requiredDays} days</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress 
                            value={(month.daysRecorded / month.requiredDays) * 100}
                            className="w-32 h-2"
                          />
                          {month.compliant ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <ComplianceCard compliance={enrollment.compliance} />
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Required Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {enrollment.requiredMetrics.map((metric) => (
                  <Badge key={metric} variant="secondary">
                    {metric.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
