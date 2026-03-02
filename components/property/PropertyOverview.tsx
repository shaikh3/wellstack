"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, 
  Home, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  MapPin,
  Settings,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { useAlertStore } from "@/lib/store/alertStore";
import { Unit, UnitStatus } from "@/lib/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PropertyWellnessDashboard } from "@/components/property/PropertyWellnessDashboard";

function UnitGridCell({ unit, propertyId }: { unit: Unit; propertyId: string }) {
  const allAlerts = useAlertStore((state) => state.alerts);
  const alerts = useMemo(() => allAlerts.filter(a => a.unitId === unit.id && !a.resolvedAt), [allAlerts, unit.id]);
  const hasAlert = alerts.length > 0;
  const criticalAlert = alerts.some(a => a.severity === 'critical');

  const statusConfig: Record<UnitStatus, { bg: string; dot: string; label: string }> = {
    occupied: { bg: 'bg-white', dot: 'bg-green-500', label: 'Occupied' },
    vacant: { bg: 'bg-slate-100', dot: 'bg-slate-400', label: 'Vacant' },
    turn: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', label: 'Turn' },
  };

  const config = statusConfig[unit.status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/properties/${propertyId}/units/${unit.id}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex h-16 w-16 items-center justify-center rounded-lg border-2 
                ${config.bg} ${hasAlert ? 'border-red-300' : 'border-slate-200'}
                cursor-pointer transition-shadow hover:shadow-md
              `}
            >
              <span className="font-medium text-slate-700">{unit.unitNumber}</span>
              
              <div className={`absolute -right-1 -top-1 h-3 w-3 rounded-full ${config.dot} ring-2 ring-white`} />
              
              {hasAlert && (
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {criticalAlert ? '!' : alerts.length}
                </div>
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Unit {unit.unitNumber}</p>
            <p className="text-xs text-slate-500">{unit.resident?.name || config.label}</p>
            <p className="text-xs text-slate-500">{unit.devices.length} devices</p>
            {hasAlert && (
              <p className="text-xs text-red-500">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FloorRow({ 
  floor, 
  units, 
  propertyId 
}: { 
  floor: number; 
  units: Unit[]; 
  propertyId: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-16 text-sm font-medium text-slate-500">Floor {floor}</span>
      <div className="flex flex-wrap gap-2">
        {units.map((unit) => (
          <UnitGridCell key={unit.id} unit={unit} propertyId={propertyId} />
        ))}
      </div>
    </div>
  );
}

export function PropertyOverview({ propertyId }: { propertyId: string }) {
  const property = usePortfolioStore((state) => 
    state.properties.find(p => p.id === propertyId)
  );
  const allUnits = useUnitStore((state) => state.units);
  const units = useMemo(() => allUnits.filter(u => u.propertyId === propertyId), [allUnits, propertyId]);
  const allAlerts = useAlertStore((state) => state.alerts);
  const criticalAlerts = useMemo(() => allAlerts.filter(a => a.propertyId === propertyId && a.severity === 'critical' && !a.resolvedAt), [allAlerts, propertyId]);
  const warningAlerts = useMemo(() => allAlerts.filter(a => a.propertyId === propertyId && a.severity === 'warning' && !a.resolvedAt), [allAlerts, propertyId]);

  const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail');

  if (!property) return null;

  // Group units by floor
  const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => b - a);
  const unitsByFloor = floors.map(floor => ({
    floor,
    units: units.filter(u => u.floor === floor).sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)),
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: property.name }]} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-4 w-4" />
            {property.address}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Last synced: 3 min ago
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{property.unitCount}</p>
              <p className="text-sm text-slate-500">Total Units</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{property.occupiedCount}</p>
              <p className="text-sm text-slate-500">Occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Home className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{property.vacantCount}</p>
              <p className="text-sm text-slate-500">Vacant</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <RefreshCw className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{property.turnCount}</p>
              <p className="text-sm text-slate-500">In Turn</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({criticalAlerts.length + warningAlerts.length})</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Unit Grid</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Vacant</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Turn</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Alert</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {unitsByFloor.map(({ floor, units }) => (
                  <FloorRow key={floor} floor={floor} units={units} propertyId={propertyId} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness">
          <PropertyWellnessDashboard propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {criticalAlerts.length === 0 && warningAlerts.length === 0 ? (
                <p className="text-slate-500">No active alerts</p>
              ) : (
                <>
                  {criticalAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-red-700">{alert.title}</p>
                          <p className="text-sm text-red-600">{alert.description}</p>
                        </div>
                      </div>
                      <Link href={`/properties/${propertyId}/units/${alert.unitId}`}>
                        <Button variant="outline" size="sm">View Unit</Button>
                      </Link>
                    </div>
                  ))}
                  {warningAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-slate-500">{alert.description}</p>
                        </div>
                      </div>
                      <Link href={`/properties/${propertyId}/units/${alert.unitId}`}>
                        <Button variant="outline" size="sm">View Unit</Button>
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-600">{property.deviceHealth}%</p>
                  <p className="text-sm text-green-700">Devices Online</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">{units.reduce((sum, u) => sum + u.devices.length, 0)}</p>
                  <p className="text-sm text-slate-600">Total Devices</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-2xl font-bold text-yellow-600">{criticalAlerts.length + warningAlerts.length}</p>
                  <p className="text-sm text-yellow-700">Active Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Property Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">Property settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
