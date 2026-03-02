'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  Leaf,
  Thermometer,
  Droplets,
  Wind,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useUnitStore } from '@/lib/store/unitStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface IEQDetailPageProps {
  params: {
    propertyId: string;
    unitId: string;
  };
}

const WELL_THRESHOLDS = {
  pm25: { good: 15, warning: 35 },
  co2: { good: 900, warning: 1000 },
  voc: { good: 500, warning: 1000 },
  temperature: { min: 68, max: 78 },
  humidity: { min: 30, max: 60 },
};

export default function IEQDetailPage({ params }: IEQDetailPageProps) {
  const { propertyId, unitId } = params;
  
  const property = usePortfolioStore((state) => 
    state.properties.find(p => p.id === propertyId)
  );
  const unit = useUnitStore((state) => state.getUnitById(unitId));
  
  const { 
    getIEQData, 
    getIEQHistory,
    refreshAllWellnessData 
  } = useWellnessStore();
  
  useEffect(() => {
    refreshAllWellnessData(unitId);
  }, [unitId, refreshAllWellnessData]);
  
  const ieq = getIEQData(unitId);
  const history = getIEQHistory(unitId);
  
  if (!property || !unit || !ieq) return null;
  
  const { current, compliance, stats } = ieq;
  
  // Format history data for charts
  const chartData = history.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: point.temperature,
    humidity: point.humidity,
    co2: point.co2,
    pm25: point.pm25,
    voc: point.voc,
  }));
  
  const getStatusColor = (value: number, type: keyof typeof WELL_THRESHOLDS) => {
    const threshold = WELL_THRESHOLDS[type];
    if (!threshold) return 'text-slate-600';
    
    if ('good' in threshold) {
      if (value <= threshold.good) return 'text-green-600';
      if (value <= threshold.warning) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if ('min' in threshold && 'max' in threshold) {
      if (value >= threshold.min && value <= threshold.max) return 'text-green-600';
      return 'text-yellow-600';
    }
    
    return 'text-slate-600';
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: `Unit ${unit.unitNumber}`, href: `/properties/${propertyId}/units/${unitId}` },
        { label: 'IEQ Detail' },
      ]} />
      
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}/units/${unitId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Unit
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">Indoor Environmental Quality</h1>
              <p className="text-slate-500">
                Unit {unit.unitNumber} • {property.name}
              </p>
            </div>
          </div>
        </div>
        
        <Badge className={
          compliance.overall === 'compliant' 
            ? 'bg-green-100 text-green-700' 
            : compliance.overall === 'warning'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }>
          {compliance.overall === 'compliant' ? <><CheckCircle2 className="w-4 h-4 mr-1" /> WELL v2 Compliant</> : 
           compliance.overall === 'warning' ? <><AlertCircle className="w-4 h-4 mr-1" /> Warning</> : 
           <><AlertCircle className="w-4 h-4 mr-1" /> Violation</>}
        </Badge>
      </div>
      
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { 
            label: 'PM2.5', 
            value: current.pm25, 
            unit: 'µg/m³', 
            icon: AlertCircle,
            threshold: WELL_THRESHOLDS.pm25,
            compliant: compliance.pm25 
          },
          { 
            label: 'CO₂', 
            value: current.co2, 
            unit: 'ppm', 
            icon: Wind,
            threshold: WELL_THRESHOLDS.co2,
            compliant: compliance.co2 
          },
          { 
            label: 'TVOC', 
            value: current.voc, 
            unit: 'ppb', 
            icon: AlertCircle,
            threshold: WELL_THRESHOLDS.voc,
            compliant: compliance.voc 
          },
          { 
            label: 'Humidity', 
            value: current.humidity, 
            unit: '%RH', 
            icon: Droplets,
            threshold: WELL_THRESHOLDS.humidity,
            compliant: compliance.humidity 
          },
          { 
            label: 'Temperature', 
            value: current.temperature, 
            unit: '°F', 
            icon: Thermometer,
            threshold: WELL_THRESHOLDS.temperature,
            compliant: compliance.temperature 
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{metric.label}</span>
                <metric.icon className={`h-4 w-4 ${metric.compliant ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${getStatusColor(metric.value, metric.label.toLowerCase() as keyof typeof WELL_THRESHOLDS)}`}>
                  {metric.value}
                </span>
                <span className="text-sm text-slate-400">{metric.unit}</span>
              </div>
              
              {'good' in metric.threshold && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0</span>
                    <span className="text-green-600">≤{metric.threshold.good}</span>
                    <span className="text-yellow-600">≤{metric.threshold.warning}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${metric.compliant ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (metric.value / (metric.threshold.warning * 1.5)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {'min' in metric.threshold && 'max' in metric.threshold && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className="text-slate-400">Range: {metric.threshold.min}–{metric.threshold.max}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="temp" orientation="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="ppm" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                
                <ReferenceLine yAxisId="temp" y={78} stroke="#ef4444" strokeDasharray="3 3" label="Max Temp" />
                <ReferenceLine yAxisId="ppm" y={900} stroke="#f59e0b" strokeDasharray="3 3" label="CO₂ Warning" />
                
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={false}
                  name="Temperature (°F)"
                />
                <Line 
                  yAxisId="ppm"
                  type="monotone" 
                  dataKey="co2" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  name="CO₂ (ppm)"
                />
                
                <Line 
                  yAxisId="ppm"
                  type="monotone" 
                  dataKey="pm25" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                  name="PM2.5 (µg/m³)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Quality Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800">Data Quality Note</p>
            <p className="text-sm text-blue-700 mt-1">
              Consumer-grade VOC sensors (like the Awair Element used in this unit) 
              typically show ~79% deviation from reference instruments under laboratory conditions. 
              These readings are suitable for trend monitoring but should not be used for clinical 
              air quality assessments. For compliance verification, professional-grade sensors 
              are recommended.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
