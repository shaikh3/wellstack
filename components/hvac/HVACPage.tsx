"use client";

import { useState } from "react";
import { Thermometer, Snowflake, Flame, Wind, Power, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnitStore } from "@/lib/store/unitStore";
import { toast } from "sonner";

export function HVACPage() {
  const units = useUnitStore((state) => state.units);
  const [selectedUnit, setSelectedUnit] = useState('2b');
  const updateDeviceState = useUnitStore((state) => state.updateDeviceState);

  const unit = units.find(u => u.id === selectedUnit);
  const thermostat = unit?.devices.find(d => d.type === 'thermostat');

  const handleTempChange = (temp: number) => {
    if (!thermostat || thermostat.state.type !== 'thermostat') return;
    updateDeviceState(selectedUnit, thermostat.id, {
      type: 'thermostat',
      temperature: thermostat.state.temperature,
      targetTemp: temp,
      mode: thermostat.state.mode,
    });
    toast.success(`Temperature set to ${temp}°F`);
  };

  const handleModeChange = (mode: 'heat' | 'cool' | 'auto' | 'off') => {
    if (!thermostat || thermostat.state.type !== 'thermostat') return;
    updateDeviceState(selectedUnit, thermostat.id, {
      type: 'thermostat',
      temperature: thermostat.state.temperature,
      targetTemp: thermostat.state.targetTemp,
      mode,
    });
    toast.success(`Mode set to ${mode}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HVAC Management</h1>
        <p className="text-slate-500">Control thermostats and monitor energy usage</p>
      </div>

      <Tabs defaultValue="control" className="space-y-4">
        <TabsList>
          <TabsTrigger value="control">Thermostat Control</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Energy Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.slice(0, 10).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    Unit {u.unitNumber} — {u.resident?.name || 'Vacant'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {thermostat && thermostat.state.type === 'thermostat' ? (
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Unit {unit?.unitNumber} Thermostat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-200">
                    <div className="text-center">
                      <span className="text-5xl font-bold">{thermostat.state.targetTemp}°</span>
                      <p className="text-sm text-slate-500">Target</p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Current: {thermostat.state.temperature}°F
                </p>

                <Slider
                  value={[thermostat.state.targetTemp]}
                  min={60}
                  max={85}
                  step={1}
                  onValueChange={([v]) => handleTempChange(v)}
                />

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={thermostat.state.mode === 'heat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('heat')}
                  >
                    <Flame className="mr-1 h-4 w-4" />
                    Heat
                  </Button>
                  <Button
                    variant={thermostat.state.mode === 'cool' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('cool')}
                  >
                    <Snowflake className="mr-1 h-4 w-4" />
                    Cool
                  </Button>
                  <Button
                    variant={thermostat.state.mode === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('auto')}
                  >
                    <Wind className="mr-1 h-4 w-4" />
                    Auto
                  </Button>
                  <Button
                    variant={thermostat.state.mode === 'off' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('off')}
                  >
                    <Power className="mr-1 h-4 w-4" />
                    Off
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No thermostat found for this unit
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast.success('Applied to all vacant units')}>
                  Set All Vacant to Setback
                </Button>
                <Button variant="outline" onClick={() => toast.success('Scheduled maintenance mode')}>
                  Enable Maintenance Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Setback Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium">Vacant Units</p>
                  <p className="text-sm text-slate-500">60°F (heat) / 82°F (cool)</p>
                  <Badge className="mt-2">Active</Badge>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium">Night Setback</p>
                  <p className="text-sm text-slate-500">10:00 PM — 6:00 AM</p>
                  <Badge variant="outline" className="mt-2">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Energy Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-600">4.2 hrs</p>
                  <p className="text-sm text-green-700">Avg Daily Runtime</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">$18/mo</p>
                  <p className="text-sm text-blue-700">Projected Savings</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-slate-600">Compliance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
