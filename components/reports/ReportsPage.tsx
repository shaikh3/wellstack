"use client";

import { FileText, Download, BarChart3, PieChart, Activity, Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useAlertStore } from "@/lib/store/alertStore";
import { toast } from "sonner";

export function ReportsPage() {
  const totalUnits = usePortfolioStore((state) => state.getTotalUnits());
  const avgDeviceHealth = usePortfolioStore((state) => state.getAverageDeviceHealth());
  const offlineDevices = Math.floor(totalUnits * 2 * (100 - avgDeviceHealth) / 100);
  const lowBattery = useAlertStore((state) => 
    state.alerts.filter(a => a.type === 'low_battery' && !a.resolvedAt).length
  );

  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-slate-500">Analytics and operational reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Device Health</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="access">Access Activity</TabsTrigger>
          <TabsTrigger value="vacancy">Vacancy</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUnits * 2 - offlineDevices}</p>
                  <p className="text-sm text-slate-500">Online Devices</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{offlineDevices}</p>
                  <p className="text-sm text-slate-500">Offline Devices</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <Battery className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowBattery || 2}</p>
                  <p className="text-sm text-slate-500">Low Battery</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-green-500">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{avgDeviceHealth}%</p>
                    <p className="text-xs text-slate-500">Online</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Online ({avgDeviceHealth}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Offline ({100 - avgDeviceHealth}%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle>Energy Usage Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-sm text-slate-500">Total kWh (Month)</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-600">12%</p>
                  <p className="text-sm text-green-700">YoY Savings</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">$3,240</p>
                  <p className="text-sm text-blue-700">Monthly Cost</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-2xl font-bold text-yellow-600">$18</p>
                  <p className="text-sm text-yellow-700">Avg/Unit Savings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-slate-500">Total Entries (Month)</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-slate-500">Vendor Accesses</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-slate-500">Self-Guided Tours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacancy">
          <Card>
            <CardHeader>
              <CardTitle>Vacancy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-2xl font-bold">12.5</p>
                  <p className="text-sm text-slate-500">Avg Days Vacant</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-600">3.2</p>
                  <p className="text-sm text-green-700">Avg Turn Days</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">98%</p>
                  <p className="text-sm text-blue-700">Setback Compliance</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-2xl font-bold text-yellow-600">94.2%</p>
                  <p className="text-sm text-yellow-700">Occupancy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
