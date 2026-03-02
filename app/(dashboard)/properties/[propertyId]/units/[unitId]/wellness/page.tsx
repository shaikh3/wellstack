'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Wind,
  Moon,
  Shield,
  Activity,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useUnitStore } from '@/lib/store/unitStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WellnessDetailPageProps {
  params: {
    propertyId: string;
    unitId: string;
  };
}

// Mock 30-day trend data
const generateTrendData = (baseScore: number) => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const variation = Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 6;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.max(0, Math.min(100, Math.round(baseScore + variation))),
    };
  });
};

export default function WellnessDetailPage({ params }: WellnessDetailPageProps) {
  const { propertyId, unitId } = params;
  
  const property = usePortfolioStore((state) => 
    state.properties.find(p => p.id === propertyId)
  );
  const unit = useUnitStore((state) => state.getUnitById(unitId));
  
  const { getWellnessScore, refreshAllWellnessData } = useWellnessStore();
  
  useEffect(() => {
    refreshAllWellnessData(unitId);
  }, [unitId, refreshAllWellnessData]);
  
  const score = getWellnessScore(unitId);
  
  if (!property || !unit || !score) return null;
  
  const trendData = generateTrendData(score.overall);
  
  // Determine if this is a compound risk unit (Unit 118)
  const isCompoundRisk = unitId === '118' || score.overall < 50;
  
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBg = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: `Unit ${unit.unitNumber}`, href: `/properties/${propertyId}/units/${unitId}` },
        { label: 'Wellness Score' },
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
            <Heart className="h-8 w-8 text-rose-500" />
            <div>
              <h1 className="text-2xl font-bold">Wellness Score Detail</h1>
              <p className="text-slate-500">
                Unit {unit.unitNumber} • {property.name}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* COMPOUND RISK PANEL - Only for at-risk units */}
      {isCompoundRisk && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6"
        >
          {/* Alert Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-600 text-white border-red-600 text-sm px-3 py-1">
              <AlertTriangle className="w-4 h-4 mr-1 inline" />
              COMPOUND RISK
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">3 Signals Converging</h2>
                <p className="text-red-700">Elevated Fall Risk Detected</p>
              </div>
            </div>
            
            <p className="text-sm text-red-800 leading-relaxed">
              This resident is showing <strong>non-linear risk escalation</strong> — 
              multiple wellness signals are degrading simultaneously, creating compounding 
              vulnerability. Research in senior living shows that when 3+ risk factors 
              converge, incident probability increases exponentially, not additively.
            </p>
            
            {/* Risk Signals */}
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  signal: 'Sleep Decline',
                  metric: 'Circadian Score: 45/100',
                  detail: 'Irregular sleep-wake patterns, poor environment',
                  icon: Moon,
                  color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
                },
                {
                  signal: 'Elevated CO₂',
                  metric: '1,050 ppm sustained',
                  detail: 'Above WELL threshold for 4+ hours',
                  icon: Wind,
                  color: 'bg-green-100 text-green-700 border-green-200'
                },
                {
                  signal: 'Nighttime Movement',
                  metric: '+35% vs baseline',
                  detail: 'Bathroom trips increased, gait anomalies',
                  icon: Activity,
                  color: 'bg-amber-100 text-amber-700 border-amber-200'
                }
              ].map((item, idx) => (
                <Card key={idx} className={`${item.color} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <item.icon className="h-5 w-5 mt-0.5" />
                      <div>
                        <p className="font-medium">{item.signal}</p>
                        <p className="text-sm font-bold mt-1">{item.metric}</p>
                        <p className="text-xs opacity-80 mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Clinical Note */}
            <div className="flex items-start gap-2 p-3 bg-white/70 rounded-lg border border-red-200">
              <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                <strong>Clinical Note:</strong> Non-linear risk escalation means the combined 
                effect of these signals is greater than their sum. This pattern correlates 
                with a <strong>3.2x increase in fall probability</strong> within 48-72 hours 
                without intervention.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Escalate to Care Team
              </Button>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                View Intervention Plan
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Hero Score Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {/* Large Circular Score */}
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className={getScoreBg(score.overall)}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * score.overall) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: 553 }}
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    className={`text-6xl font-bold ${getScoreColor(score.overall)}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {score.overall}
                  </motion.span>
                  <span className="text-xl text-slate-400">/100</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className={`flex items-center gap-1 ${
                  score.trend === 'improving' ? 'text-green-600' :
                  score.trend === 'declining' ? 'text-red-600' :
                  'text-slate-400'
                }`}>
                  {score.trend === 'improving' ? <TrendingUp className="h-5 w-5" /> :
                   score.trend === 'declining' ? <TrendingDown className="h-5 w-5" /> :
                   <Minus className="h-5 w-5" />}
                  <span className="font-medium">
                    {score.trend === 'improving' ? 'Improving' :
                     score.trend === 'declining' ? 'Declining' :
                     'Stable'}
                  </span>
                </div>                
                {score.percentile && (
                  <p className="text-sm text-slate-500 mt-2">
                    Top {100 - score.percentile}% of residents
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sub-score Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { 
                name: 'Air Quality (IEQ)', 
                score: score.components.ieq, 
                weight: 30,
                icon: Wind,
                color: 'bg-green-500'
              },
              { 
                name: 'Safety', 
                score: score.components.safety, 
                weight: 25,
                icon: Shield,
                color: 'bg-blue-500'
              },
              { 
                name: 'Sleep Environment', 
                score: score.components.sleep, 
                weight: 25,
                icon: Moon,
                color: 'bg-indigo-500'
              },
              { 
                name: 'Activity & Movement', 
                score: score.components.activity, 
                weight: 20,
                icon: Activity,
                color: 'bg-amber-500'
              },
            ].map((component) => (
              <div key={component.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <component.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">{component.name}</span>
                    <span className="text-xs text-slate-400">({component.weight}%)</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(component.score)}`}>
                    {component.score}
                  </span>
                </div>                
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${component.color} transition-all duration-1000`}
                    style={{ width: `${component.score}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t flex items-center justify-between">
              <span className="text-sm text-slate-500">Property Average</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">82</span>
                <Badge className={score.overall > 82 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {score.overall > 82 ? '+' : ''}{score.overall - 82}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 30-Day Trend */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickInterval={6}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#64748b" 
                  fontSize={12}
                />                
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0' 
                  }}
                />                
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
