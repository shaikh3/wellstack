"use client";

import { motion } from "framer-motion";
import { Building2, Home, AlertTriangle, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useAlertStore } from "@/lib/store/alertStore";
import Link from "next/link";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  delay = 0 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: { value: number; direction: 'up' | 'down' };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <p className={`text-xs ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PropertyCard({ property, delay = 0 }: { property: { id: string; name: string; address: string; unitCount: number; deviceHealth: number; alerts: number }; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link href={`/properties/${property.id}`}>
        <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <p className="text-sm text-slate-500">{property.address}</p>
              </div>
              {property.alerts > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {property.alerts}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{property.unitCount} units</span>
              <span className="text-slate-500">Updated 3 min ago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${property.deviceHealth >= 95 ? 'bg-green-500' : property.deviceHealth >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm text-slate-600">{property.deviceHealth}% online</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function PortfolioDashboard() {
  const properties = usePortfolioStore((state) => state.properties);
  const totalUnits = usePortfolioStore((state) => state.getTotalUnits());
  const avgDeviceHealth = usePortfolioStore((state) => state.getAverageDeviceHealth());
  const criticalAlerts = useAlertStore((state) => state.getCriticalAlerts().length);
  const warningAlerts = useAlertStore((state) => state.getWarningAlerts().length);
  const totalAlerts = criticalAlerts + warningAlerts;

  // Calculate occupancy stats
  const totalOccupied = usePortfolioStore((state) => state.getTotalOccupied());
  const totalVacant = usePortfolioStore((state) => state.getTotalVacant());
  const totalTurn = usePortfolioStore((state) => state.getTotalTurn());

  // Calculate portfolio value (mock calculation)
  const portfolioValue = "$2.4M";

  const propertyCards = properties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    unitCount: p.unitCount,
    deviceHealth: p.deviceHealth,
    alerts: Math.floor(Math.random() * 3), // Mock alerts per property
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Overview</h1>
          <p className="text-slate-500">Manage your properties and monitor performance</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Units Managed"
          value={totalUnits.toString()}
          icon={Home}
          trend={{ value: 12, direction: 'up' }}
          delay={0}
        />
        <StatCard
          title="Online Devices"
          value={`${avgDeviceHealth}%`}
          icon={Building2}
          trend={{ value: 2, direction: 'up' }}
          delay={0.1}
        />
        <StatCard
          title="Active Alerts"
          value={totalAlerts.toString()}
          icon={AlertTriangle}
          trend={{ value: 5, direction: 'down' }}
          delay={0.2}
        />
        <StatCard
          title="Portfolio Value"
          value={portfolioValue}
          icon={DollarSign}
          delay={0.3}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Properties</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propertyCards.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              delay={0.4 + index * 0.1}
            />
          ))}
        </div>
      </div>

      {totalAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Critical Alerts ({criticalAlerts})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/alerts" className="block text-red-600 hover:underline">
                ⚠ Leak detected — Unit 2B, Lakeview Commons (2m ago)
              </Link>
              <Link href="/alerts" className="block text-red-600 hover:underline">
                ⚠ Lock offline — Unit 4A, Oak Ridge Villas (15m ago)
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
