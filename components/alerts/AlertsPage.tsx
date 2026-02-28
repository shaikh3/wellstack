"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Filter, Wrench, Eye, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlertStore } from "@/lib/store/alertStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { Alert, AlertSeverity } from "@/lib/types";
import { delays } from "@/lib/mock/delays";
import { toast } from "sonner";
import Link from "next/link";

function AlertCard({ alert }: { alert: Alert }) {
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);
  const createWorkOrder = useAlertStore((state) => state.createWorkOrder);
  const getUnitById = useUnitStore((state) => state.getUnitById);
  
  const unit = getUnitById(alert.unitId);

  const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    critical: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
    },
    warning: {
      icon: <Bell className="h-5 w-5" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
    },
    info: {
      icon: <Clock className="h-5 w-5" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    },
  };

  const config = severityConfig[alert.severity];

  const handleDispatch = async () => {
    toast.loading('Creating work order...');
    await delays.slow();
    const workOrderId = createWorkOrder(alert.id);
    toast.dismiss();
    toast.success(`Work order ${workOrderId} created`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className={`${config.bg} ${config.border}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`mt-1 ${config.text}`}>
                {config.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'secondary' : 'default'}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className={`mt-1 font-semibold ${config.text}`}>{alert.title}</h3>
                <p className="text-sm text-slate-600">{alert.description}</p>
                {unit && (
                  <Link 
                    href={`/properties/${alert.propertyId}/units/${alert.unitId}`}
                    className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                  >
                    Unit {unit.unitNumber}
                  </Link>
                )}
                {alert.workOrderId && (
                  <p className="mt-1 text-sm text-slate-500">
                    Work Order: {alert.workOrderId}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!alert.acknowledgedAt ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    acknowledgeAlert(alert.id);
                    toast.success('Alert acknowledged');
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Acknowledge
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs">Acknowledged</Badge>
              )}
              
              {!alert.workOrderId && alert.severity === 'critical' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDispatch}
                >
                  <Wrench className="mr-1 h-4 w-4" />
                  Dispatch
                </Button>
              )}
              
              {!alert.resolvedAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resolveAlert(alert.id);
                    toast.success('Alert resolved');
                  }}
                >
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AlertsPage() {
  const alerts = useAlertStore((state) => state.alerts);
  const filter = useAlertStore((state) => state.filter);
  const setFilter = useAlertStore((state) => state.setFilter);
  
  const activeAlerts = alerts.filter(a => !a.resolvedAt);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter(a => a.severity === 'warning');
  const infoAlerts = activeAlerts.filter(a => a.severity === 'info');

  const filteredAlerts = filter === 'all' 
    ? activeAlerts 
    : activeAlerts.filter(a => a.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-slate-500">Monitor and manage system alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as AlertSeverity | 'all')}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-2xl font-bold">{activeAlerts.length}</p>
              <p className="text-sm text-slate-500">Total Active</p>
            </div>
            <Bell className="h-8 w-8 text-slate-400" />
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
              <p className="text-sm text-slate-500">Critical</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</p>
              <p className="text-sm text-slate-500">Warning</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{infoAlerts.length}</p>
              <p className="text-sm text-slate-500">Info</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Active Alerts</h2>
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-lg font-medium">All Clear!</p>
              <p className="text-slate-500">No active alerts matching your filter</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
        )}
      </div>
    </div>
  );
}
