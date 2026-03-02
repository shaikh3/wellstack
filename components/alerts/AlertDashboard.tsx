'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Wrench, 
  Eye, 
  Bell,
  Search,
  MoreHorizontal,
  CheckSquare,
  User,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAlertStore } from '@/lib/store/alertStore';
import { useUnitStore } from '@/lib/store/unitStore';
import { Alert, AlertSeverity, AlertStatus, AlertType } from '@/lib/types/alerts';
import { delays } from '@/lib/mock/delays';
import { toast } from 'sonner';
import Link from 'next/link';

interface AlertDashboardProps {
  onViewDetail?: (alertId: string) => void;
}

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; bg: string; border: string; text: string; badge: string }> = {
  critical: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'destructive',
  },
  warning: {
    icon: <Bell className="h-5 w-5" />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'secondary',
  },
  info: {
    icon: <Clock className="h-5 w-5" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'default',
  },
};

const typeLabels: Record<AlertType, string> = {
  wellness: 'Wellness',
  safety: 'Safety',
  ieq: 'IEQ',
  device: 'Device',
};

const statusLabels: Record<AlertStatus, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

function AlertCard({ 
  alert, 
  selected, 
  onSelect,
  onViewDetail 
}: { 
  alert: Alert; 
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onViewDetail?: (alertId: string) => void;
}) {
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);
  const createWorkOrder = useAlertStore((state) => state.createWorkOrder);
  const getUnitById = useUnitStore((state) => state.getUnitById);
  
  const unit = getUnitById(alert.unitId);
  const config = severityConfig[alert.severity];
  const isResolved = alert.status === 'resolved';
  const isAcknowledged = alert.status === 'acknowledged';

  const handleAcknowledge = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading('Acknowledging...');
    await delays.fast();
    acknowledgeAlert(alert.id);
    toast.dismiss();
    toast.success('Alert acknowledged');
  };

  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading('Resolving...');
    await delays.fast();
    resolveAlert(alert.id);
    toast.dismiss();
    toast.success('Alert resolved');
  };

  const handleCreateWorkOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      layout
    >
      <Card className={`${config.bg} ${config.border} transition-all hover:shadow-md`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={selected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className={`mt-1 ${config.text}`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.badge as any}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {typeLabels[alert.type]}
                </Badge>
                <span className="text-xs text-slate-400">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
                {alert.assignedToName && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {alert.assignedToName}
                  </Badge>
                )}
              </div>
              <h3 className={`mt-1 font-semibold ${config.text}`}>{alert.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{alert.description}</p>
              {unit && (
                <Link 
                  href={`/properties/${alert.propertyId}/units/${alert.unitId}`}
                  className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
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
            <div className="flex flex-col gap-2">
              {!isAcknowledged && !isResolved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAcknowledge}
                  className="whitespace-nowrap"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ack
                </Button>
              )}
              {!isResolved && alert.type === 'device' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateWorkOrder}
                  className="whitespace-nowrap"
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Work Order
                </Button>
              )}
              {!isResolved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolve}
                  className="whitespace-nowrap"
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              )}
              {onViewDetail && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetail(alert.id)}
                  className="whitespace-nowrap"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AlertDashboard({ onViewDetail }: AlertDashboardProps) {
  const alerts = useAlertStore((state) => state.alerts);
  const filter = useAlertStore((state) => state.filter);
  const setFilter = useAlertStore((state) => state.setFilter);
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter !== 'all' && alert.severity !== filter) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.unitId.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    warning: alerts.filter(a => a.severity === 'warning' && a.status !== 'resolved').length,
    info: alerts.filter(a => a.severity === 'info' && a.status !== 'resolved').length,
    total: alerts.filter(a => a.status !== 'resolved').length,
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
    } else {
      setSelectedAlerts(new Set());
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    const newSelected = new Set(selectedAlerts);
    if (checked) {
      newSelected.add(alertId);
    } else {
      newSelected.delete(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleBulkAcknowledge = async () => {
    toast.loading(`Acknowledging ${selectedAlerts.size} alerts...`);
    await delays.slow();
    selectedAlerts.forEach(id => acknowledgeAlert(id));
    setSelectedAlerts(new Set());
    toast.dismiss();
    toast.success(`${selectedAlerts.size} alerts acknowledged`);
  };

  const handleBulkResolve = async () => {
    toast.loading(`Resolving ${selectedAlerts.size} alerts...`);
    await delays.slow();
    selectedAlerts.forEach(id => resolveAlert(id));
    setSelectedAlerts(new Set());
    toast.dismiss();
    toast.success(`${selectedAlerts.size} alerts resolved`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-slate-500">Central triage for all wellness, safety, IEQ, and device alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilter('all')}>
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.critical}</span>
            </div>
            <p className="text-sm text-red-600">Critical</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{stats.warning}</span>
            </div>
            <p className="text-sm text-yellow-600">Warning</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.info}</span>
            </div>
            <p className="text-sm text-blue-600">Info</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-slate-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-slate-500">Total Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as AlertSeverity | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AlertType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wellness">Wellness</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="ieq">IEQ</SelectItem>
            <SelectItem value="device">Device</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AlertStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedAlerts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-slate-100 rounded-lg"
        >
          <span className="font-medium">{selectedAlerts.size} selected</span>
          <Button size="sm" onClick={handleBulkAcknowledge}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Acknowledge
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkResolve}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Resolve
          </Button>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No alerts found</h3>
              <p className="text-slate-500">All clear! No alerts match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4">
              <Checkbox 
                checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-slate-500">Select all</span>
            </div>
            <AnimatePresence>
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  selected={selectedAlerts.has(alert.id)}
                  onSelect={(checked) => handleSelectAlert(alert.id, checked)}
                  onViewDetail={onViewDetail}
                />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
