"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileWarning,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  Calendar,
  FileText,
  MessageSquare,
  ArrowUpDown,
  Activity,
  Timer,
  XCircle,
  Shield,
  Clipboard,
  Tag,
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
} from "recharts";

// Types
type IncidentStatus = "open" | "investigating" | "resolved" | "closed";
type IncidentSeverity = "critical" | "major" | "minor";
type IncidentCategory = "fall" | "ieq" | "device_failure" | "wellness_decline" | "isolation" | "maintenance" | "security" | "behavioral";

interface IncidentNote {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: Date;
  type: "note" | "status_change" | "escalation" | "resolution";
}

interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  residentName: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  assignedTo: string;
  reportedBy: string;
  relatedAlertId: string | null;
  notes: IncidentNote[];
  tags: string[];
  rootCause: string | null;
  correctiveAction: string | null;
}

// Category metadata
const CATEGORY_META: Record<IncidentCategory, { label: string; color: string }> = {
  fall: { label: "Fall Event", color: "bg-red-100 text-red-700" },
  ieq: { label: "IEQ Violation", color: "bg-orange-100 text-orange-700" },
  device_failure: { label: "Device Failure", color: "bg-slate-100 text-slate-700" },
  wellness_decline: { label: "Wellness Decline", color: "bg-purple-100 text-purple-700" },
  isolation: { label: "Social Isolation", color: "bg-blue-100 text-blue-700" },
  maintenance: { label: "Maintenance", color: "bg-yellow-100 text-yellow-700" },
  security: { label: "Security", color: "bg-red-100 text-red-700" },
  behavioral: { label: "Behavioral Change", color: "bg-indigo-100 text-indigo-700" },
};

const STATUS_META: Record<IncidentStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: "Open", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  investigating: { label: "Investigating", color: "bg-yellow-100 text-yellow-700", icon: Activity },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-700", icon: XCircle },
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// Mock incidents
const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "Fall Detected — Unit 118 Bathroom",
    description: "mmWave sensor detected fall event at 02:14 AM. Resident found on bathroom floor. EMS dispatched. Resident declined transport, evaluated on-site.",
    category: "fall",
    severity: "critical",
    status: "investigating",
    propertyId: "lakeview-commons",
    propertyName: "Lakeview Commons",
    unitId: "118",
    unitNumber: "118",
    residentName: "Harold Finch",
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(1),
    resolvedAt: null,
    closedAt: null,
    assignedTo: "Sarah Mitchell (Care Coordinator)",
    reportedBy: "System — mmWave Sensor",
    relatedAlertId: "alert-118-1",
    tags: ["fall-risk", "high-priority", "ems-called"],
    rootCause: null,
    correctiveAction: null,
    notes: [
      { id: "n1", author: "System", role: "Automated", content: "Fall event detected by mmWave sensor in bathroom. Confidence: 94%. Duration on floor: 3m 42s before movement resumed.", timestamp: hoursAgo(6), type: "note" },
      { id: "n2", author: "System", role: "Automated", content: "Auto-escalation: Tier 1 → Tier 2 after 5 min no acknowledgment.", timestamp: hoursAgo(5.9), type: "escalation" },
      { id: "n3", author: "Night Staff", role: "On-site Staff", content: "Responded to unit. Found resident sitting on bathroom floor. Alert and oriented. Minor bruise on left hip. Helped to bed.", timestamp: hoursAgo(5.5), type: "note" },
      { id: "n4", author: "Sarah Mitchell", role: "Care Coordinator", content: "EMS notified per protocol. Resident declined transport. Vitals stable. Scheduled follow-up with PCP for tomorrow.", timestamp: hoursAgo(4), type: "note" },
      { id: "n5", author: "Sarah Mitchell", role: "Care Coordinator", content: "Status changed to Investigating. Reviewing gait data from past 72 hours for contributing factors.", timestamp: hoursAgo(1), type: "status_change" },
    ],
  },
  {
    id: "INC-002",
    title: "Social Isolation — Unit 118",
    description: "No door unlock event or common area visit detected in 72+ hours. Resident appears to be self-isolating. Wellness check initiated.",
    category: "isolation",
    severity: "major",
    status: "investigating",
    propertyId: "lakeview-commons",
    propertyName: "Lakeview Commons",
    unitId: "118",
    unitNumber: "118",
    residentName: "Harold Finch",
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(2),
    resolvedAt: null,
    closedAt: null,
    assignedTo: "Maria Santos (Social Worker)",
    reportedBy: "System — Activity Monitor",
    relatedAlertId: "alert-118-2",
    tags: ["isolation", "behavioral-change", "wellness-check"],
    rootCause: null,
    correctiveAction: null,
    notes: [
      { id: "n6", author: "System", role: "Automated", content: "72-hour isolation threshold exceeded. Last door unlock: 74 hours ago. Last common area badge: 96 hours ago.", timestamp: hoursAgo(12), type: "note" },
      { id: "n7", author: "Maria Santos", role: "Social Worker", content: "Attempted phone contact — no answer. Will visit unit this afternoon.", timestamp: hoursAgo(4), type: "note" },
      { id: "n8", author: "Maria Santos", role: "Social Worker", content: "Visited unit. Resident reports feeling tired after fall. Declined community activities. Arranged for meal delivery and daily check-in.", timestamp: hoursAgo(2), type: "note" },
    ],
  },
  {
    id: "INC-003",
    title: "IEQ Non-Compliance — Unit 118",
    description: "CO₂ sustained above 1000 ppm, TVOC above 600 ppb for 4+ hours. HVAC system not adequately ventilating unit. WELL v2 violation documented.",
    category: "ieq",
    severity: "major",
    status: "open",
    propertyId: "lakeview-commons",
    propertyName: "Lakeview Commons",
    unitId: "118",
    unitNumber: "118",
    residentName: "Harold Finch",
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(18),
    resolvedAt: null,
    closedAt: null,
    assignedTo: "Maintenance Team",
    reportedBy: "System — Awair Element",
    relatedAlertId: "alert-118-3",
    tags: ["ieq", "well-v2", "hvac"],
    rootCause: null,
    correctiveAction: null,
    notes: [
      { id: "n9", author: "System", role: "Automated", content: "Awair Element readings: CO₂ 1050 ppm (threshold 900), TVOC 620 ppb (threshold 500), PM2.5 22 µg/m³ (threshold 15). All above WELL v2 limits.", timestamp: hoursAgo(18), type: "note" },
    ],
  },
  {
    id: "INC-004",
    title: "Lock Offline — Unit 4A",
    description: "Front door smart lock went offline and failed to respond to remote commands. Battery check required.",
    category: "device_failure",
    severity: "minor",
    status: "resolved",
    propertyId: "oak-ridge-villas",
    propertyName: "Oak Ridge Villas",
    unitId: "4a",
    unitNumber: "4A",
    residentName: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    resolvedAt: daysAgo(1),
    closedAt: null,
    assignedTo: "Maintenance Team",
    reportedBy: "System — Device Monitor",
    relatedAlertId: "alert-3",
    tags: ["device", "lock"],
    rootCause: "Battery depleted below operational threshold",
    correctiveAction: "Replaced batteries. Added to monthly battery check schedule.",
    notes: [
      { id: "n10", author: "System", role: "Automated", content: "Lock offline for 15 minutes. Last battery reading: 3%.", timestamp: daysAgo(2), type: "note" },
      { id: "n11", author: "Mike Johnson", role: "Maintenance", content: "Replaced lock batteries. Lock back online and functional.", timestamp: daysAgo(1), type: "resolution" },
    ],
  },
  {
    id: "INC-005",
    title: "Wellness Score Decline — Unit 1B",
    description: "Wellness score dropped from 78 to 61 over 14 days. Sleep quality and activity levels declining. No acute trigger identified.",
    category: "wellness_decline",
    severity: "minor",
    status: "resolved",
    propertyId: "lakeview-commons",
    propertyName: "Lakeview Commons",
    unitId: "1b",
    unitNumber: "1B",
    residentName: "Dorothy Webb",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(3),
    resolvedAt: daysAgo(3),
    closedAt: daysAgo(2),
    assignedTo: "Sarah Mitchell (Care Coordinator)",
    reportedBy: "System — Wellness Monitor",
    relatedAlertId: null,
    tags: ["wellness", "sleep", "activity"],
    rootCause: "Medication change caused sleep disruption",
    correctiveAction: "PCP adjusted medication timing. Sleep quality improving. Score trending up.",
    notes: [
      { id: "n12", author: "System", role: "Automated", content: "Wellness score declined 17 points in 14 days. Sleep component: -22 pts, Activity: -14 pts.", timestamp: daysAgo(7), type: "note" },
      { id: "n13", author: "Sarah Mitchell", role: "Care Coordinator", content: "Met with resident. Reports difficulty sleeping since medication change 2 weeks ago. Contacted PCP.", timestamp: daysAgo(5), type: "note" },
      { id: "n14", author: "Sarah Mitchell", role: "Care Coordinator", content: "PCP adjusted medication timing to morning instead of evening. Monitoring for improvement.", timestamp: daysAgo(4), type: "note" },
      { id: "n15", author: "Sarah Mitchell", role: "Care Coordinator", content: "Sleep quality improving. Score up to 68. Resolving incident.", timestamp: daysAgo(3), type: "resolution" },
    ],
  },
  {
    id: "INC-006",
    title: "Behavioral Change — Unit 3B",
    description: "ADL pattern disruption detected. Kitchen activity dropped 60%, bathroom visits increased 40%. Pattern consistent for 5 days.",
    category: "behavioral",
    severity: "minor",
    status: "closed",
    propertyId: "lakeview-commons",
    propertyName: "Lakeview Commons",
    unitId: "3b",
    unitNumber: "3B",
    residentName: "Robert Chen",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(10),
    resolvedAt: daysAgo(11),
    closedAt: daysAgo(10),
    assignedTo: "Maria Santos (Social Worker)",
    reportedBy: "System — Behavioral Monitor",
    relatedAlertId: null,
    tags: ["behavioral", "adl", "monitoring"],
    rootCause: "Mild GI illness — self-limiting",
    correctiveAction: "Resolved naturally. Continue routine monitoring.",
    notes: [
      { id: "n16", author: "System", role: "Automated", content: "5-day ADL disruption: Kitchen -60%, Bathroom +40%. Pattern score deviation: 3.2 sigma.", timestamp: daysAgo(14), type: "note" },
      { id: "n17", author: "Maria Santos", role: "Social Worker", content: "Spoke with resident. Reports mild stomach bug. Eating lighter meals. Feeling better.", timestamp: daysAgo(12), type: "note" },
      { id: "n18", author: "Maria Santos", role: "Social Worker", content: "ADL patterns normalizing. Incident resolved.", timestamp: daysAgo(11), type: "resolution" },
    ],
  },
];

function IncidentRow({
  incident,
  expanded,
  onToggle,
}: {
  incident: Incident;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusMeta = STATUS_META[incident.status];
  const catMeta = CATEGORY_META[incident.category];
  const StatusIcon = statusMeta.icon;

  const handleStatusChange = (newStatus: IncidentStatus) => {
    toast.success(`Incident ${incident.id} status changed to ${STATUS_META[newStatus].label}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`${incident.status === "open" && incident.severity === "critical" ? "border-red-300 ring-1 ring-red-100" : ""}`}>
        <CardContent className="p-0">
          {/* Summary Row */}
          <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
            {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">{incident.id}</span>
                <Badge className={`${catMeta.color} text-[10px]`}>{catMeta.label}</Badge>
                <Badge className={`${statusMeta.color} text-[10px]`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusMeta.label}
                </Badge>
                {incident.severity === "critical" && (
                  <Badge className="bg-red-500 text-white text-[10px]">Critical</Badge>
                )}
                {incident.severity === "major" && (
                  <Badge className="bg-orange-100 text-orange-700 text-[10px]">Major</Badge>
                )}
              </div>
              <h3 className="font-semibold mt-1 text-sm">{incident.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {incident.propertyName} — Unit {incident.unitNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(incident.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {incident.assignedTo}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
              <MessageSquare className="h-3.5 w-3.5" />
              {incident.notes.length}
            </div>
          </button>

          {/* Expanded Detail */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t"
              >
                <div className="p-4 space-y-4">
                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Reported By</p>
                      <p className="font-medium">{incident.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Resident</p>
                      <p className="font-medium">{incident.residentName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Created</p>
                      <p className="font-medium">{new Date(incident.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Last Updated</p>
                      <p className="font-medium">{new Date(incident.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase mb-1">Description</p>
                    <p className="text-sm text-slate-600">{incident.description}</p>
                  </div>

                  {/* Tags */}
                  {incident.tags.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      {incident.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Root Cause & Corrective Action */}
                  {(incident.rootCause || incident.correctiveAction) && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {incident.rootCause && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-[10px] text-slate-400 uppercase mb-1">Root Cause</p>
                          <p className="text-sm">{incident.rootCause}</p>
                        </div>
                      )}
                      {incident.correctiveAction && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-[10px] text-green-600 uppercase mb-1">Corrective Action</p>
                          <p className="text-sm text-green-800">{incident.correctiveAction}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase mb-2">Activity Timeline</p>
                    <div className="space-y-3">
                      {incident.notes.map((note, i) => (
                        <div key={note.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${
                              note.type === "escalation" ? "bg-red-500" :
                              note.type === "resolution" ? "bg-green-500" :
                              note.type === "status_change" ? "bg-blue-500" :
                              "bg-slate-300"
                            }`} />
                            {i < incident.notes.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium text-slate-700">{note.author}</span>
                              <span>·</span>
                              <span>{note.role}</span>
                              <span>·</span>
                              <span>{new Date(note.timestamp).toLocaleString()}</span>
                              {note.type !== "note" && (
                                <Badge variant="outline" className="text-[9px]">{note.type.replace("_", " ")}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">{note.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {incident.unitId && (
                      <Link href={`/properties/${incident.propertyId}/units/${incident.unitId}`}>
                        <Button variant="outline" size="sm">
                          <Building2 className="mr-1.5 h-4 w-4" />
                          View Unit
                        </Button>
                      </Link>
                    )}
                    {incident.status === "open" && (
                      <Button size="sm" onClick={() => handleStatusChange("investigating")}>
                        <Activity className="mr-1.5 h-4 w-4" />
                        Start Investigation
                      </Button>
                    )}
                    {incident.status === "investigating" && (
                      <Button size="sm" onClick={() => handleStatusChange("resolved")}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Mark Resolved
                      </Button>
                    )}
                    {incident.status === "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange("closed")}>
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Close Incident
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Add note coming soon")}>
                      <MessageSquare className="mr-1.5 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function IncidentDocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | "all">("all");
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set(["INC-001"]));

  const toggleIncident = (id: string) => {
    setExpandedIncidents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = [...mockIncidents];
    if (statusFilter !== "all") result = result.filter(i => i.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter(i => i.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (i.residentName && i.residentName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [statusFilter, categoryFilter, searchQuery]);

  const openCount = mockIncidents.filter(i => i.status === "open" || i.status === "investigating").length;
  const criticalOpen = mockIncidents.filter(i => (i.status === "open" || i.status === "investigating") && i.severity === "critical").length;
  const resolvedThisMonth = mockIncidents.filter(i => i.resolvedAt).length;
  const avgResolutionTime = useMemo(() => {
    const resolved = mockIncidents.filter(i => i.resolvedAt);
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((sum, i) => {
      return sum + (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60);
    }, 0);
    return Math.round(totalHours / resolved.length);
  }, []);

  // Chart data
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    mockIncidents.forEach(i => {
      const label = CATEGORY_META[i.category].label;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const PIE_COLORS = ["#ef4444", "#f59e0b", "#6366f1", "#22c55e", "#3b82f6", "#8b5cf6"];

  const monthlyTrend = useMemo(() => {
    return [
      { month: "Oct", incidents: 8, resolved: 7 },
      { month: "Nov", incidents: 6, resolved: 6 },
      { month: "Dec", incidents: 10, resolved: 9 },
      { month: "Jan", incidents: 7, resolved: 7 },
      { month: "Feb", incidents: 5, resolved: 4 },
      { month: "Mar", incidents: 6, resolved: 3 },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incident Documentation</h1>
          <p className="text-slate-500">Track, investigate, and document all wellness and operational incidents</p>
        </div>
        <Button onClick={() => toast.success("New incident form coming soon")}>
          <Plus className="mr-2 h-4 w-4" />
          Log Incident
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <FileWarning className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-xs text-slate-500">Open Incidents</p>
            </div>
          </CardContent>
        </Card>
        <Card className={criticalOpen > 0 ? "border-red-200" : ""}>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{criticalOpen}</p>
              <p className="text-xs text-slate-500">Critical Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{resolvedThisMonth}</p>
              <p className="text-xs text-slate-500">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgResolutionTime}h</p>
              <p className="text-xs text-slate-500">Avg Resolution</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">All Incidents ({mockIncidents.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search incidents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IncidentStatus | "all")}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as IncidentCategory | "all")}>
              <SelectTrigger className="w-[170px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Incident List */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clipboard className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-lg font-medium">No Incidents Found</p>
                <p className="text-slate-500">Adjust your filters or create a new incident</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map(incident => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  expanded={expandedIncidents.has(incident.id)}
                  onToggle={() => toggleIncident(incident.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incidents by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="h-44 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {categoryBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {categoryBreakdown.map((item, i) => (
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

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Incident Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="incidents" fill="#f59e0b" name="Created" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#22c55e" name="Resolved" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Metrics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Resolution Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{avgResolutionTime}h</p>
                    <p className="text-sm text-slate-500 mt-1">Average Resolution Time</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-3xl font-bold">
                      {Math.round((mockIncidents.filter(i => i.resolvedAt || i.closedAt).length / mockIncidents.length) * 100)}%
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Resolution Rate</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {mockIncidents.filter(i => i.rootCause).length}/{mockIncidents.filter(i => i.resolvedAt || i.closedAt).length}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Root Cause Documented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
