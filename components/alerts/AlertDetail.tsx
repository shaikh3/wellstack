'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  MessageSquare,
  Wrench,
  Workflow,
  MoreVertical,
  Send,
  History,
  MapPin,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlertStore } from '@/lib/store/alertStore';
import { useUnitStore } from '@/lib/store/unitStore';
import { Alert, AlertSeverity, TimelineEntry, ActorType } from '@/lib/types/alerts';
import { demoTimelineEntries } from '@/lib/mock/alerts';
import { delays } from '@/lib/mock/delays';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';

interface AlertDetailProps {
  alertId: string;
  onBack?: () => void;
}

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; bg: string; text: string; badge: string }> = {
  critical: {
    icon: <AlertTriangle className="h-6 w-6" />,
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'destructive',
  },
  warning: {
    icon: <Clock className="h-6 w-6" />,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    badge: 'secondary',
  },
  info: {
    icon: <Activity className="h-6 w-6" />,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'default',
  },
};

const timelineIcons: Record<TimelineEntry['type'], React.ReactNode> = {
  alert_created: <AlertTriangle className="h-4 w-4" />,
  notification_sent: <Send className="h-4 w-4" />,
  notification_delivered: <CheckCircle className="h-4 w-4" />,
  acknowledged: <CheckCircle className="h-4 w-4" />,
  assigned: <User className="h-4 w-4" />,
  note_added: <MessageSquare className="h-4 w-4" />,
  step_completed: <CheckCircle className="h-4 w-4" />,
  escalated: <AlertTriangle className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
  workflow_started: <Workflow className="h-4 w-4" />,
  workflow_cancelled: <AlertTriangle className="h-4 w-4" />,
  workflow_completed: <CheckCircle className="h-4 w-4" />,
  incident_created: <FileText className="h-4 w-4" />,
};

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const icon = timelineIcons[entry.type];
  
  return (
    <div className="flex gap-4 pb-6 relative">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          {icon}
        </div>
        <div className="w-px h-full bg-slate-200 mt-2" />
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{entry.actor.name}</span>
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(entry.timestamp))} ago
          </span>
        </div>
        <p className="text-slate-600">{entry.description}</p>
        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
          <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
            <pre className="whitespace-pre-wrap">{JSON.stringify(entry.metadata, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function AlertDetail({ alertId, onBack }: AlertDetailProps) {
  const alerts = useAlertStore((state) => state.alerts);
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);
  const createWorkOrder = useAlertStore((state) => state.createWorkOrder);
  const getUnitById = useUnitStore((state) => state.getUnitById);
  
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alert = alerts.find(a => a.id === alertId);
  const unit = alert ? getUnitById(alert.unitId) : null;

  if (!alert) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Alert not found</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Alerts
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const config = severityConfig[alert.severity];
  const timeline = demoTimelineEntries.filter(t => 
    t.metadata?.alertId === alertId || 
    (alert.workflowId && t.type === 'workflow_started')
  );

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    await delays.fast();
    acknowledgeAlert(alert.id);
    setIsSubmitting(false);
    toast.success('Alert acknowledged');
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    await delays.fast();
    resolveAlert(alert.id);
    setIsSubmitting(false);
    toast.success('Alert resolved');
  };

  const handleCreateWorkOrder = async () => {
    setIsSubmitting(true);
    await delays.slow();
    const workOrderId = createWorkOrder(alert.id);
    setIsSubmitting(false);
    toast.success(`Work order ${workOrderId} created`);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    await delays.fast();
    // In real implementation, this would add to timeline
    setNote('');
    setIsSubmitting(false);
    toast.success('Note added');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{alert.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={config.badge as any}>
                {alert.severity.toUpperCase()}
              </Badge>
              <span className="text-slate-500">Alert ID: {alert.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
            <Button 
              onClick={handleAcknowledge} 
              disabled={isSubmitting}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Acknowledge
            </Button>
          )}
          {alert.status !== 'resolved' && (
            <Button 
              onClick={handleResolve} 
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Alert Info Card */}
          <Card className={config.bg}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-white ${config.text}`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <p className="text-lg">{alert.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    {alert.acknowledgedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {alert.resolvedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">
                <History className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="context">
                <Activity className="h-4 w-4 mr-2" />
                Trigger Context
              </TabsTrigger>
              <TabsTrigger value="notes">
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="pr-4">
                      {timeline.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No activity recorded yet</p>
                      ) : (
                        timeline.map((entry) => (
                          <TimelineItem key={entry.id} entry={entry} />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="context" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trigger Context</CardTitle>
                  <CardDescription>
                    Details about what triggered this alert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alert.triggerContext ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Source</label>
                        <p className="text-slate-600">{alert.triggerContext.source}</p>
                      </div>
                      {alert.triggerContext.threshold !== undefined && (
                        <div>
                          <label className="text-sm font-medium">Threshold</label>
                          <p className="text-slate-600">{alert.triggerContext.threshold}</p>
                        </div>
                      )}
                      {alert.triggerContext.actualValue !== undefined && (
                        <div>
                          <label className="text-sm font-medium">Actual Value</label>
                          <p className="text-slate-600">{alert.triggerContext.actualValue}</p>
                        </div>
                      )}
                      {alert.triggerContext.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.triggerContext.location}</span>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium">Source Data</label>
                        <pre className="mt-1 p-3 bg-slate-50 rounded text-sm overflow-auto">
                          {JSON.stringify(alert.triggerContext.sourceData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">No trigger context available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add a note about this alert..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!note.trim() || isSubmitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alert.assignedToName ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{alert.assignedToName}</p>
                    <p className="text-sm text-slate-500">{alert.assignedRole}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Not assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Unit Card */}
          {unit && (
            <Card>
              <CardHeader>
                <CardTitle>Unit</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/properties/${alert.propertyId}/units/${alert.unitId}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Unit {unit.unitNumber}
                </Link>
                {unit.resident && (
                  <p className="text-slate-500 mt-1">{unit.resident.name}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Work Order Card */}
          <Card>
            <CardHeader>
              <CardTitle>Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              {alert.workOrderId ? (
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  <span>{alert.workOrderId}</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleCreateWorkOrder}
                  disabled={isSubmitting}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Create Work Order
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Related IDs */}
          <Card>
            <CardHeader>
              <CardTitle>Related</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {alert.workflowId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Workflow</span>
                  <span className="font-mono">{alert.workflowId}</span>
                </div>
              )}
              {alert.incidentId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Incident</span>
                  <span className="font-mono">{alert.incidentId}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
