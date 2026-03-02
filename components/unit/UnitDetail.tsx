"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Lock, 
  Thermometer, 
  Droplets, 
  Activity,
  ChevronLeft,
  Battery,
  BatteryMedium,
  BatteryLow,
  MoreHorizontal,
  Clock,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { useAlertStore } from "@/lib/store/alertStore";
import { useAccessStore } from "@/lib/store/accessStore";
import { useWellnessStore } from "@/lib/store/wellnessStore";
import { Device, DeviceType } from "@/lib/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { delays } from "@/lib/mock/delays";
import { toast } from "sonner";

// P2 Wellness Intelligence Components
import {
  IEQCard,
  WellnessScoreCard,
  FallDetectionCard,
  SleepEnvironmentCard,
  CircadianCard,
  BehavioralPatternCard,
  InterventionStatusCard,
  CommunityIntelCard,
  RPMStatusCard,
} from "@/components/wellness";

// Device Control Components
function DeviceCard({ device, unitId }: { device: Device; unitId: string }) {
  const updateDeviceState = useUnitStore((state) => state.updateDeviceState);
  const [isLoading, setIsLoading] = useState(false);

  const getIcon = () => {
    switch (device.type) {
      case 'lock': return Lock;
      case 'thermostat': return Thermometer;
      case 'leak_sensor': return Droplets;
      default: return Activity;
    }
  };

  const Icon = getIcon();

  const getBatteryIcon = (level?: number) => {
    if (!level) return null;
    if (level > 50) return <Battery className="h-4 w-4 text-green-500" />;
    if (level > 20) return <BatteryMedium className="h-4 w-4 text-yellow-500" />;
    return <BatteryLow className="h-4 w-4 text-red-500" />;
  };

  const handleLockToggle = async () => {
    if (device.type !== 'lock' || device.state.type !== 'lock') return;
    setIsLoading(true);
    toast.loading(device.state.locked ? 'Unlocking...' : 'Locking...');
    await delays.slow();
    updateDeviceState(unitId, device.id, {
      type: 'lock',
      locked: !device.state.locked,
      lastUsedAt: new Date(),
    });
    setIsLoading(false);
    toast.dismiss();
    toast.success(device.state.locked ? 'Door unlocked' : 'Door locked');
  };

  const handleThermostatChange = async (newTemp: number) => {
    if (device.type !== 'thermostat' || device.state.type !== 'thermostat') return;
    updateDeviceState(unitId, device.id, {
      type: 'thermostat',
      temperature: device.state.temperature,
      targetTemp: newTemp,
      mode: device.state.mode,
    });
    toast.success(`Temperature set to ${newTemp}°F`);
  };

  const renderControls = () => {
    if (device.type === 'lock' && device.state.type === 'lock') {
      return (
        <Button
          variant={device.state.locked ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={handleLockToggle}
          disabled={isLoading}
        >
          {device.state.locked ? 'Unlock' : 'Lock'}
        </Button>
      );
    }
    
    if (device.type === 'thermostat' && device.state.type === 'thermostat') {
      const thermostatState = device.state;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Target: {thermostatState.targetTemp}°F</span>
            <span className="text-xs text-slate-500">Current: {thermostatState.temperature}°F</span>
          </div>
          <Slider
            value={[thermostatState.targetTemp]}
            min={60}
            max={85}
            step={1}
            onValueChange={([v]) => handleThermostatChange(v)}
          />
          <div className="flex gap-1">
            {(['heat', 'cool', 'auto', 'off'] as const).map((mode) => (
              <Button
                key={mode}
                variant={thermostatState.mode === mode ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  updateDeviceState(unitId, device.id, {
                    type: 'thermostat',
                    temperature: thermostatState.temperature,
                    targetTemp: thermostatState.targetTemp,
                    mode,
                  });
                  toast.success(`Mode set to ${mode}`);
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      );
    }
    
    if (device.type === 'leak_sensor') {
      return (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            toast.success('Test alert sent');
          }}
        >
          Test Alert
        </Button>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              device.status === 'online' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon className={`h-5 w-5 ${
                device.status === 'online' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <CardTitle className="text-sm">{device.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={device.status === 'online' ? 'default' : 'destructive'} className="text-[10px]">
                  {device.status}</Badge>
                {device.batteryLevel && (
                  <div className="flex items-center gap-1">
                    {getBatteryIcon(device.batteryLevel)}
                    <span className="text-xs text-slate-500">{device.batteryLevel}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-sm text-slate-600">
          {device.type === 'lock' && device.state.type === 'lock' && (
            <span>{device.state.locked ? 'Locked' : 'Unlocked'}
              {device.state.lastUsedAt && (
                <span className="text-xs text-slate-400"> — Last used {new Date(device.state.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </span>
          )}
          {device.type === 'leak_sensor' && device.state.type === 'leak_sensor' && (
            <span className={device.state.wet ? 'text-red-600 font-medium' : ''}>
              {device.state.wet ? '⚠ Water detected!' : 'Dry — No issues'}
            </span>
          )}
        </div>
        {renderControls()}
      </CardContent>
    </Card>
  );
}

export function UnitDetail({ propertyId, unitId }: { propertyId: string; unitId: string }) {
  const property = usePortfolioStore((state) => 
    state.properties.find(p => p.id === propertyId)
  );
  const unit = useUnitStore((state) => state.units.find(u => u.id === unitId));
  const allAlerts = useAlertStore((state) => state.alerts);
  const alerts = useMemo(() => allAlerts.filter(a => a.unitId === unitId && !a.resolvedAt), [allAlerts, unitId]);
  const refreshAllWellnessData = useWellnessStore((state) => state.refreshAllWellnessData);

  // Load wellness data on mount
  useEffect(() => {
    refreshAllWellnessData(unitId);
  }, [unitId, refreshAllWellnessData]);

  if (!property || !unit) return null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: `Unit ${unit.unitNumber}` },
      ]} />

      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Property
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Unit {unit.unitNumber}</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <span>{property.name} — Building {property.buildings.find(b => b.id === unit.buildingId)?.name}</span>
          </div>
        </div>
        <Button variant="outline">
          <MoreHorizontal className="mr-2 h-4 w-4" />
          Actions
        </Button>
      </div>

      {unit.resident && (
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
              <User className="h-6 w-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{unit.resident.name}</p>
              <p className="text-sm text-slate-500">{unit.resident.email} • {unit.resident.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Lease Period</p>
              <p className="font-medium">{new Date(unit.resident.leaseStart).toLocaleDateString()} — {new Date(unit.resident.leaseEnd).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Devices (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Devices</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {unit.devices.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DeviceCard device={device} unitId={unitId} />
                </motion.div>
              ))}
            </div>
          </div>

          {alerts.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Active Alerts</h2>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
                  }`}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <span>{alert.severity === 'critical' ? '⚠' : '!'}</span>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-slate-500">{alert.description}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          useAlertStore.getState().acknowledgeAlert(alert.id);
                          toast.success('Alert acknowledged');
                        }}
                      >
                        Acknowledge
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - P2 Wellness Intelligence (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Wellness Intelligence</h2>
          <div className="space-y-4">
            <WellnessScoreCard unitId={unitId} />
            <IEQCard unitId={unitId} />
            <CircadianCard unitId={unitId} />
            <BehavioralPatternCard unitId={unitId} />
            <FallDetectionCard unitId={unitId} />
            <SleepEnvironmentCard unitId={unitId} />
            <InterventionStatusCard unitId={unitId} />
            <RPMStatusCard unitId={unitId} />
            <CommunityIntelCard unitId={unitId} />
          </div>
        </div>
      </div>
    </div>
  );
}
