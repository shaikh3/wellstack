"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Filter,
  Wrench,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  Activity,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Timer,
  Eye,
  Search,
  ArrowUpDown,
  XCircle,
  Droplets,
  Wind,
  Thermometer,
  Shield,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlertStore } from "@/lib/store/alertStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { Alert, AlertSeverity } from "@/lib/types";
import { delays } from "@/lib/mock/delays";
import { toast } from "sonner";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Alert type metadata
const ALERT_TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; category: string }> = {
  leak_detected: { icon: Droplets, label: "Leak Detected", category: "Device" },
  low_battery: { icon: Zap, label: "Low Battery", category: "Device" },
  device_offline: { icon: XCircle, label: "Device Offline", category: "Device" },
  thermostat_offline: { icon: Thermometer, label: "Thermostat Offline", category: "Device" },
  fall_detected: { icon: Shield, label: "Fall Detected", category: "Wellness" },
  isolation_alert: { icon: Users, label: "Social Isolation", category: "Wellness" },
  ieq_violation: { icon: Wind, label: "IEQ Violation", category: "Compliance" },
  wellness_score_drop: { icon: Heart, label: "Wellness Score Drop", category: "Wellness" },
};

// SLA targets in minutes
const SLA_TARGETS: Record<AlertSeverity, number> = {
  critical: 15,
  warning: 60,
  info: 240,
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function AlertCard({ alert, expanded, onToggle }: { alert: Alert; expanded: boolean; onToggle: () => void }) {
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);
  const createWorkOrder = useAlertStore((state) => state.createWorkOrder);
  const getUnitById = useUnitStore((state) => state.getUnitById);

  const unit = getUnitById(alert.unitId);
  const typeMeta = ALERT_TYPE_META[alert.type] || { icon: Bell, label: alert.type, category: "Other" };
  const TypeIcon = typeMeta.icon;

  const severityConfig: Record<AlertSeverity, { bg: string; border: string; text: string; badge: string }> = {
    critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800" },
    warning: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-800" },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
  };

  const config = severityConfig[alert.severity];
  const slaTarget = SLA_TARGETS[alert.severity];
  const elapsedMinutes = Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 60000);
  const slaProgress = Math.min(100, (elapsedMinutes / slaTarget) * 100);
  const overSLA = elapsedMinutes > slaTarget && !alert.acknowledgedAt;

  const handleDispatch = async () => {
    toast.loading("Creating work order...");
    await delays.slow();
    const workOrderId = createWorkOrder(alert.id);
    toast.dismiss();
    toast.success(`Work order ${workOrderId} created`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <Card className={`${config.bg} ${config.border} ${overSLA ? "ring-2 ring-red-300" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div className={`h-3 w-3 rounded-full ${alert.severity === "critical" ? "bg-red-500" : alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"} ${!alert.acknowledgedAt && alert.severity === "critical" ? "animate-pulse" : ""}`} />
              <div className="mt-1 w-px flex-1 bg-slate-200" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${config.badge} text-[10px]`}>{alert.severity.toUpperCase()}</Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <TypeIcon className="mr-1 h-3 w-3" />
                      {typeMeta.label}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatTimeAgo(alert.createdAt)}</span>
                    {overSLA && (
                      <Badge className="bg-red-500 text-white text-[10px] animate-pulse">
                        <Timer className="mr-1 h-3 w-3" />
                        Over SLA
                      </Badge>
                    )}
                    {alert.acknowledgedAt && (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Acknowledged
                      </Badge>
                    )}
                    {alert.workOrderId && (
                      <Badge variant="outline" className="text-[10px]">
                        <Wrench className="mr-1 h-3 w-3" />
                        {alert.workOrderId}
                      </Badge>
                    )}
                  </div>
                  <h3 className={`mt-1 font-semibold ${config.text}`}>{alert.title}</h3>
                  <p className="text-sm text-slate-600">{alert.description}</p>
                  {unit && (
                    <Link
                      href={`/properties/${alert.propertyId}/units/${alert.unitId}`}
                      className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <Building2 className="h-3 w-3" />
                      Unit {unit.unitNumber}
                      {unit.resident && <span className="text-slate-400">— {unit.resident.name}</span>}
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!alert.acknowledgedAt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        acknowledgeAlert(alert.id);
                        toast.success("Alert acknowledged");
                      }}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      ACK
                    </Button>
                  )}
                  {!alert.workOrderId && (alert.severity === "critical" || alert.severity === "warning") && (
                    <Button variant="default" size="sm" onClick={handleDispatch}>
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
                        toast.success("Alert resolved");
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* SLA Progress */}
              {!alert.resolvedAt && !alert.acknowledgedAt && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>SLA: {formatDuration(slaTarget)}</span>
                    <span className={overSLA ? "text-red-600 font-medium" : ""}>
                      Elapsed: {formatDuration(elapsedMinutes)}
                    </span>
                  </div>
                  <Progress value={slaProgress} className={`h-1 ${overSLA ? "[&>div]:bg-red-500" : ""}`} />
                </div>
              )}

              {/* Expanded Details */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 border-t pt-3"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Created</p>
                        <p className="font-medium">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Property</p>
                        <p className="font-medium">{alert.propertyId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Category</p>
                        <p className="font-medium">{typeMeta.category}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Response Time</p>
                        <p className={`font-medium ${overSLA ? "text-red-600" : "text-green-600"}`}>
                          {alert.acknowledgedAt
                            ? formatDuration(Math.floor((new Date(alert.acknowledgedAt).getTime() - new Date(alert.createdAt).getTime()) / 60000))
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                    {alert.deviceId && (
                      <div className="text-sm">
                        <p className="text-[10px] text-slate-400 uppercase">Device</p>
                        <p className="font-medium">{alert.deviceId}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PropertyAlertGroup({
  propertyId,
  propertyName,
  alerts,
  expandedAlerts,
  toggleAlert,
}: {
  propertyId: string;
  propertyName: string;
  alerts: Alert[];
  expandedAlerts: Set<string>;
  toggleAlert: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  return (
    <div className="space-y-2">
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 w-full text-left group">
        {collapsed ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        <Building2 className="h-4 w-4 text-slate-500" />
        <span className="font-semibold text-sm">{propertyName}</span>
        <span className="text-xs text-slate-400">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</span>
        {criticalCount > 0 && <Badge className="bg-red-100 text-red-700 text-[10px]">{criticalCount} critical</Badge>}
        {warningCount > 0 && <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">{warningCount} warning</Badge>}
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pl-6"
          >
            {alerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                expanded={expandedAlerts.has(alert.id)}
                onToggle={() => toggleAlert(alert.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function generateAlertHistory() {
  const data: { date: string; critical: number; warning: number; info: number }[] = [];
  const now = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5 + 1),
      info: Math.floor(Math.random() * 4),
    });
  }
  return data;
}

function generateResponseTimes() {
  return [
    { name: "Critical", target: 15, actual: 12, color: "#ef4444" },
    { name: "Warning", target: 60, actual: 42, color: "#f59e0b" },
    { name: "Info", target: 240, actual: 180, color: "#3b82f6" },
  ];
}

export function AlertsPage() {
  const alerts = useAlertStore((state) => state.alerts);
  const filter = useAlertStore((state) => state.filter);
  const setFilter = useAlertStore((state) => state.setFilter);
  const properties = usePortfolioStore((state) => state.properties);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "severity">("newest");
  const [viewMode, setViewMode] = useState<"timeline" | "property">("timeline");
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleAlert = (id: string) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeAlerts = alerts.filter(a => !a.resolvedAt);
  const resolvedAlerts = alerts.filter(a => a.resolvedAt);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const warningAlerts = activeAlerts.filter(a => a.severity === "warning");
  const infoAlerts = activeAlerts.filter(a => a.severity === "info");

  // Compute response metrics
  const avgResponseTime = useMemo(() => {
    const acknowledged = alerts.filter(a => a.acknowledgedAt);
    if (acknowledged.length === 0) return 0;
    const total = acknowledged.reduce(
      (sum, a) => sum + (new Date(a.acknowledgedAt!).getTime() - new Date(a.createdAt).getTime()),
      0
    );
    return Math.round(total / acknowledged.length / 60000);
  }, [alerts]);

  const overSLACount = activeAlerts.filter(a => {
    const elapsed = (Date.now() - new Date(a.createdAt).getTime()) / 60000;
    return elapsed > SLA_TARGETS[a.severity] && !a.acknowledgedAt;
  }).length;

  // Filter & sort
  const filteredAlerts = useMemo(() => {
    let result = filter === "all" ? activeAlerts : activeAlerts.filter(a => a.severity === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.type.includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === "severity") {
        const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
      }
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortBy === "oldest" ? -diff : diff;
    });
    return result;
  }, [activeAlerts, filter, searchQuery, sortBy]);

  // Group by property
  const alertsByProperty = useMemo(() => {
    const grouped: Record<string, Alert[]> = {};
    filteredAlerts.forEach(a => {
      if (!grouped[a.propertyId]) grouped[a.propertyId] = [];
      grouped[a.propertyId].push(a);
    });
    return grouped;
  }, [filteredAlerts]);

  // Chart data
  const alertHistory = useMemo(() => generateAlertHistory(), []);
  const responseTimes = useMemo(() => generateResponseTimes(), []);
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    activeAlerts.forEach(a => {
      const meta = ALERT_TYPE_META[a.type];
      const cat = meta?.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activeAlerts]);

  const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert Command Center</h1>
          <p className="text-slate-500">Real-time monitoring and response management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5">
            <Activity className="mr-1.5 h-3.5 w-3.5 text-green-500 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeAlerts.length}</p>
              <p className="text-xs text-slate-500">Active Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className={criticalAlerts.length > 0 ? "border-red-200" : ""}>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
              <p className="text-xs text-slate-500">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</p>
              <p className="text-xs text-slate-500">Warning</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${avgResponseTime > 30 ? "text-yellow-600" : "text-green-600"}`}>
                {avgResponseTime > 0 ? `${avgResponseTime}m` : "—"}
              </p>
              <p className="text-xs text-slate-500">Avg Response</p>
            </div>
          </CardContent>
        </Card>
        <Card className={overSLACount > 0 ? "border-red-200" : ""}>
          <CardContent className="flex items-center gap-3 py-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${overSLACount > 0 ? "bg-red-100" : "bg-green-100"}`}>
              <Shield className={`h-5 w-5 ${overSLACount > 0 ? "text-red-600" : "text-green-600"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${overSLACount > 0 ? "text-red-600" : "text-green-600"}`}>
                {overSLACount}
              </p>
              <p className="text-xs text-slate-500">Over SLA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Active / Analytics / Resolved */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-4">
          {/* Filters bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search alerts..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as AlertSeverity | "all")}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="severity">By Severity</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === "timeline" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("timeline")}
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "property" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("property")}
              >
                <Building2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Alert List */}
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-4 text-lg font-medium">All Clear!</p>
                <p className="text-slate-500">No active alerts matching your filter</p>
              </CardContent>
            </Card>
          ) : viewMode === "timeline" ? (
            <div className="space-y-2">
              {filteredAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  expanded={expandedAlerts.has(alert.id)}
                  onToggle={() => toggleAlert(alert.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(alertsByProperty).map(([propertyId, propAlerts]) => {
                const property = properties.find(p => p.id === propertyId);
                return (
                  <PropertyAlertGroup
                    key={propertyId}
                    propertyId={propertyId}
                    propertyName={property?.name || propertyId}
                    alerts={propAlerts}
                    expandedAlerts={expandedAlerts}
                    toggleAlert={toggleAlert}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 30-day Alert History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">30-Day Alert History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alertHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                      <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
                      <Bar dataKey="info" stackId="a" fill="#3b82f6" name="Info" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Alert Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alert Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="h-44 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {typeBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {typeBreakdown.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600">{item.name}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Time vs SLA Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responseTimes.map(rt => (
                    <div key={rt.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{rt.name}</span>
                        <span className="text-slate-500">
                          <span className={rt.actual <= rt.target ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {formatDuration(rt.actual)}
                          </span>
                          {" / "}
                          {formatDuration(rt.target)} target
                        </span>
                      </div>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (rt.actual / rt.target) * 100)}%`,
                            backgroundColor: rt.actual <= rt.target ? "#22c55e" : "#ef4444",
                          }}
                        />
                        <div
                          className="absolute top-0 h-full w-0.5 bg-slate-400"
                          style={{ left: "100%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alert Distribution by Property */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alerts by Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.map(p => {
                    const propAlerts = activeAlerts.filter(a => a.propertyId === p.id);
                    const propCritical = propAlerts.filter(a => a.severity === "critical").length;
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{p.name}</span>
                            <div className="flex items-center gap-2">
                              {propCritical > 0 && (
                                <Badge className="bg-red-100 text-red-700 text-[10px]">{propCritical} critical</Badge>
                              )}
                              <span className="text-slate-500">{propAlerts.length} total</span>
                            </div>
                          </div>
                          <Progress value={propAlerts.length > 0 ? (propAlerts.length / activeAlerts.length) * 100 : 0} className="h-1.5 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resolved Tab */}
        <TabsContent value="resolved" className="space-y-2">
          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-lg font-medium">No Resolved Alerts</p>
                <p className="text-slate-500">Resolved alerts will appear here</p>
              </CardContent>
            </Card>
          ) : (
            resolvedAlerts
              .sort((a, b) => new Date(b.resolvedAt!).getTime() - new Date(a.resolvedAt!).getTime())
              .map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  expanded={expandedAlerts.has(alert.id)}
                  onToggle={() => toggleAlert(alert.id)}
                />
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
