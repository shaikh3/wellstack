'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronLeft,
  Activity,
  Coffee,
  Dumbbell,
  BookOpen,
  Palette,
  TreePine,
  Clock,
  Calendar,
  MapPin,
  Eye,
  UserCheck,
  Utensils,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CommunityDashboardProps {
  propertyId: string;
}

// Isolation risk residents
const isolationRisks = [
  { id: 'r-118', name: 'Harold Finch', unit: '118', daysSinceOut: 3.2, lastDining: '72+ hours', activityTrend: 'declining', riskLevel: 'high' as const, lastCommunityEvent: 'None (7 days)' },
  { id: 'r-3c', name: 'Eleanor Vance', unit: '3C', daysSinceOut: 2.1, lastDining: '48 hours', activityTrend: 'declining', riskLevel: 'moderate' as const, lastCommunityEvent: 'Book Club (5 days ago)' },
  { id: 'r-1d', name: 'Arthur Hastings', unit: '1D', daysSinceOut: 1.8, lastDining: '36 hours', activityTrend: 'stable', riskLevel: 'moderate' as const, lastCommunityEvent: 'Movie Night (3 days ago)' },
];

// Common areas
const commonAreas = [
  { name: 'Lobby & Lounge', currentOccupancy: 8, capacity: 25, peakHour: '10 AM', weeklyVisits: 342, trend: 'stable' as const, icon: Coffee },
  { name: 'Dining Hall', currentOccupancy: 12, capacity: 60, peakHour: '12 PM', weeklyVisits: 485, trend: 'up' as const, icon: Utensils },
  { name: 'Fitness Center', currentOccupancy: 3, capacity: 15, peakHour: '9 AM', weeklyVisits: 127, trend: 'up' as const, icon: Dumbbell },
  { name: 'Activity Room', currentOccupancy: 0, capacity: 30, peakHour: '2 PM', weeklyVisits: 198, trend: 'stable' as const, icon: Palette },
  { name: 'Garden & Patio', currentOccupancy: 5, capacity: 20, peakHour: '3 PM', weeklyVisits: 156, trend: 'down' as const, icon: TreePine },
  { name: 'Library', currentOccupancy: 2, capacity: 12, peakHour: '11 AM', weeklyVisits: 89, trend: 'stable' as const, icon: BookOpen },
];

// Upcoming events
const upcomingEvents = [
  { name: 'Morning Yoga', time: 'Today, 9:00 AM', location: 'Fitness Center', expected: 12, category: 'Physical' },
  { name: 'Art Workshop', time: 'Today, 2:00 PM', location: 'Activity Room', expected: 18, category: 'Creative' },
  { name: 'Movie Night', time: 'Today, 7:00 PM', location: 'Activity Room', expected: 25, category: 'Social' },
  { name: 'Garden Club', time: 'Tomorrow, 10:00 AM', location: 'Garden & Patio', expected: 14, category: 'Social' },
  { name: 'Book Club', time: 'Tomorrow, 3:00 PM', location: 'Library', expected: 8, category: 'Educational' },
  { name: 'Chair Exercise', time: 'Wed, 9:00 AM', location: 'Fitness Center', expected: 15, category: 'Physical' },
  { name: 'Bingo', time: 'Wed, 2:00 PM', location: 'Activity Room', expected: 30, category: 'Social' },
  { name: 'Music Therapy', time: 'Thu, 11:00 AM', location: 'Activity Room', expected: 20, category: 'Creative' },
];

// Activity engagement by category
const engagementByCategory = [
  { category: 'Physical', participation: 68, trend: 'up', color: '#22c55e' },
  { category: 'Social', participation: 82, trend: 'up', color: '#3b82f6' },
  { category: 'Educational', participation: 45, trend: 'stable', color: '#8b5cf6' },
  { category: 'Creative', participation: 57, trend: 'up', color: '#f59e0b' },
];

// Dining data
function generateDiningData() {
  return {
    today: {
      breakfast: { served: 38, total: 52, pct: 73 },
      lunch: { served: 45, total: 52, pct: 87 },
      dinner: { served: 0, total: 52, pct: 0 }, // hasn't happened yet
    },
    trend7d: [
      { day: 'Mon', breakfast: 71, lunch: 85, dinner: 78 },
      { day: 'Tue', breakfast: 73, lunch: 88, dinner: 80 },
      { day: 'Wed', breakfast: 69, lunch: 82, dinner: 76 },
      { day: 'Thu', breakfast: 75, lunch: 90, dinner: 82 },
      { day: 'Fri', breakfast: 72, lunch: 86, dinner: 79 },
      { day: 'Sat', breakfast: 65, lunch: 80, dinner: 74 },
      { day: 'Sun', breakfast: 62, lunch: 78, dinner: 72 },
    ],
    decliningResidents: [
      { name: 'Harold Finch', unit: '118', change: '-40%', meals: '1 meal/day avg' },
      { name: 'Eleanor Vance', unit: '3C', change: '-25%', meals: '2 meals/day avg' },
    ],
  };
}

// Community engagement heatmap (7 days x 24 hours)
function generateEngagementHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => {
    const hours: number[] = [];
    for (let h = 0; h < 24; h++) {
      // Realistic community activity pattern
      let base = 0;
      if (h >= 7 && h <= 9) base = 0.4 + Math.random() * 0.3; // morning
      else if (h >= 10 && h <= 12) base = 0.6 + Math.random() * 0.3; // late morning peak
      else if (h >= 12 && h <= 13) base = 0.8 + Math.random() * 0.2; // lunch
      else if (h >= 14 && h <= 16) base = 0.5 + Math.random() * 0.3; // afternoon
      else if (h >= 17 && h <= 19) base = 0.7 + Math.random() * 0.2; // dinner
      else if (h >= 19 && h <= 21) base = 0.3 + Math.random() * 0.3; // evening
      else base = Math.random() * 0.1; // overnight
      hours.push(Math.round(base * 100) / 100);
    }
    return { day, hours };
  });
}

function generate30DayTrend() {
  const data: { date: string; score: number }[] = [];
  const now = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: Math.round(72 + Math.sin(d / 5) * 4 + (Math.random() - 0.5) * 3),
    });
  }
  return data;
}

export function CommunityDashboard({ propertyId }: CommunityDashboardProps) {
  const property = usePortfolioStore((state) => state.properties.find(p => p.id === propertyId));

  const dining = useMemo(() => generateDiningData(), []);
  const heatmap = useMemo(() => generateEngagementHeatmap(), []);
  const trend30d = useMemo(() => generate30DayTrend(), []);

  if (!property) return null;

  // Community wellness score (distinct from unit-level)
  const communityScore = 74;
  const subScores = {
    socialEngagement: 78,
    ieqCompliance: 86,
    safetyRate: 92,
    activityUtilization: 65,
    satisfaction: 71,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: property.name, href: `/properties/${propertyId}` },
        { label: 'Community Intelligence' },
      ]} />

      <div className="flex items-start justify-between">
        <div>
          <Link href={`/properties/${propertyId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Property
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Community Intelligence</h1>
          <p className="text-slate-500">{property.name} — {property.occupiedCount} residents</p>
        </div>
      </div>

      {/* Community Wellness Score Hero */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <svg className="transform -rotate-90 w-36 h-36">
                  <circle cx="68" cy="68" r={50} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                  <motion.circle
                    cx="68" cy="68" r={50} stroke="currentColor" strokeWidth="10" fill="transparent"
                    className={communityScore >= 80 ? 'stroke-green-500' : communityScore >= 60 ? 'stroke-blue-500' : 'stroke-yellow-500'}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 - (communityScore / 100) * 2 * Math.PI * 50 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ strokeDasharray: 2 * Math.PI * 50 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">{communityScore}</span>
                  <span className="text-xs text-slate-400">Community</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">Community Wellness Score</p>
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>vs. Portfolio Avg: +4 pts</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sub-scores */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Community Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Social Engagement', value: subScores.socialEngagement, desc: '78% participating in activities' },
                { label: 'IEQ Compliance', value: subScores.ieqCompliance, desc: '86% of units within WELL thresholds' },
                { label: 'Safety Incident Rate', value: subScores.safetyRate, desc: '0.3 incidents per 1000 resident-days' },
                { label: 'Activity Utilization', value: subScores.activityUtilization, desc: '65% avg program attendance' },
                { label: 'Resident Satisfaction', value: subScores.satisfaction, desc: 'Composite: engagement + retention' },
              ].map((item, i) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className={`font-semibold ${item.value >= 80 ? 'text-green-600' : item.value >= 60 ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {item.value}
                    </span>
                  </div>
                  <Progress value={item.value} className={`h-2 ${item.value >= 80 ? '[&>div]:bg-green-500' : item.value >= 60 ? '[&>div]:bg-blue-500' : '[&>div]:bg-yellow-500'}`} />
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 30-day Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">30-Day Community Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend30d}>
                <defs>
                  <linearGradient id="communityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis domain={[60, 90]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}`, 'Score']} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#communityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="isolation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="isolation">Social Isolation</TabsTrigger>
          <TabsTrigger value="spaces">Common Areas</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="dining">Dining</TabsTrigger>
        </TabsList>

        {/* Social Isolation Tab */}
        <TabsContent value="isolation" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* At-risk Residents */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">At-Risk Residents</CardTitle>
                  <Badge className="bg-red-100 text-red-700 text-[10px]">{isolationRisks.length} flagged</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isolationRisks.map(r => (
                  <div key={r.id} className={`p-3 rounded-lg border ${r.riskLevel === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{r.name}</span>
                          <Badge variant="outline" className="text-[10px]">Unit {r.unit}</Badge>
                          <Badge className={`text-[10px] ${r.riskLevel === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.riskLevel === 'high' ? 'High Risk' : 'Moderate'}
                          </Badge>
                        </div>
                        <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                          <p>Last left unit: <span className="font-medium">{r.daysSinceOut} days ago</span></p>
                          <p>Last dining: <span className="font-medium">{r.lastDining}</span></p>
                          <p>Last event: <span className="font-medium">{r.lastCommunityEvent}</span></p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs flex-shrink-0">
                        <Eye className="mr-1 h-3 w-3" />
                        Wellness Check
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Engagement Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Community Activity Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 pl-10">
                    {[6, 8, 10, 12, 14, 16, 18, 20].map(h => (
                      <span key={h} className="text-[9px] text-slate-400 flex-1 text-center">{h > 12 ? `${h - 12}p` : `${h}a`}</span>
                    ))}
                  </div>
                  {heatmap.map(row => (
                    <div key={row.day} className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 w-8">{row.day}</span>
                      {row.hours.slice(6, 22).map((v, i) => (
                        <div
                          key={i}
                          className="flex-1 h-5 rounded-sm"
                          style={{
                            backgroundColor: v > 0.7 ? '#22c55e' : v > 0.4 ? '#86efac' : v > 0.15 ? '#dcfce7' : '#f8fafc',
                          }}
                          title={`${row.day} ${i + 6}:00 — ${Math.round(v * 100)}% activity`}
                        />
                      ))}
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-2 mt-2 text-[9px] text-slate-400">
                    <span>Low</span>
                    <div className="flex gap-0.5">
                      {['#f8fafc', '#dcfce7', '#86efac', '#22c55e'].map(c => (
                        <div key={c} className="h-3 w-5 rounded-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Common Areas Tab */}
        <TabsContent value="spaces" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commonAreas.map((area, i) => {
              const Icon = area.icon;
              const utilization = Math.round((area.currentOccupancy / area.capacity) * 100);
              return (
                <motion.div key={area.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                            <Icon className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{area.name}</p>
                            <p className="text-[10px] text-slate-400">Peak: {area.peakHour}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {area.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
                          {area.trend === 'down' && <TrendingDown className="mr-1 h-3 w-3 text-red-500" />}
                          {area.weeklyVisits}/wk
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Current Occupancy</span>
                          <span className="font-medium">{area.currentOccupancy}/{area.capacity}</span>
                        </div>
                        <Progress value={utilization} className={`h-2 ${utilization > 80 ? '[&>div]:bg-orange-500' : utilization > 50 ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'}`} />
                        <p className="text-[10px] text-slate-400">{utilization}% utilized</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.map((event, i) => {
                  const catColors: Record<string, string> = {
                    Physical: 'bg-green-100 text-green-700',
                    Social: 'bg-blue-100 text-blue-700',
                    Educational: 'bg-purple-100 text-purple-700',
                    Creative: 'bg-amber-100 text-amber-700',
                  };
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-sm">
                      <div className="text-center min-w-[50px]">
                        <Badge className={`${catColors[event.category]} text-[9px]`}>{event.category}</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-medium">{event.expected}</p>
                        <p className="text-slate-400">expected</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Engagement by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Participation']} />
                      <Bar dataKey="participation" radius={[4, 4, 0, 0]}>
                        {engagementByCategory.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {engagementByCategory.map(e => (
                    <div key={e.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-slate-600">{e.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{e.participation}%</span>
                        {e.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {e.trend === 'stable' && <span className="text-xs text-slate-400">→</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dining Tab */}
        <TabsContent value="dining" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's Meal Participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Breakfast', icon: Sun, data: dining.today.breakfast, time: '7:00 – 9:30 AM' },
                  { label: 'Lunch', icon: Utensils, data: dining.today.lunch, time: '11:30 AM – 1:30 PM' },
                  { label: 'Dinner', icon: Moon, data: dining.today.dinner, time: '5:00 – 7:30 PM' },
                ].map(meal => {
                  const MealIcon = meal.icon;
                  return (
                    <div key={meal.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MealIcon className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{meal.label}</span>
                          <span className="text-xs text-slate-400">{meal.time}</span>
                        </div>
                        <span className={`font-semibold ${meal.data.pct > 0 ? (meal.data.pct >= 75 ? 'text-green-600' : 'text-yellow-600') : 'text-slate-400'}`}>
                          {meal.data.pct > 0 ? `${meal.data.pct}%` : 'Upcoming'}
                        </span>
                      </div>
                      <Progress
                        value={meal.data.pct}
                        className={`h-2 ${meal.data.pct >= 75 ? '[&>div]:bg-green-500' : meal.data.pct > 0 ? '[&>div]:bg-yellow-500' : ''}`}
                      />
                      {meal.data.pct > 0 && (
                        <p className="text-[10px] text-slate-400">{meal.data.served} of {meal.data.total} residents</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 7-day Dining Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">7-Day Dining Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dining.trend7d}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit="%" domain={[50, 100]} />
                      <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, '']} />
                      <Line type="monotone" dataKey="breakfast" stroke="#f59e0b" strokeWidth={2} name="Breakfast" dot={false} />
                      <Line type="monotone" dataKey="lunch" stroke="#22c55e" strokeWidth={2} name="Lunch" dot={false} />
                      <Line type="monotone" dataKey="dinner" stroke="#6366f1" strokeWidth={2} name="Dinner" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><div className="h-2 w-4 bg-amber-500 rounded" /> Breakfast</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-4 bg-green-500 rounded" /> Lunch</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-4 bg-indigo-500 rounded" /> Dinner</span>
                </div>
              </CardContent>
            </Card>

            {/* Declining Participation */}
            {dining.decliningResidents.length > 0 && (
              <Card className="lg:col-span-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <CardTitle className="text-base">Declining Dining Participation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {dining.decliningResidents.map(r => (
                      <div key={r.unit} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div>
                          <p className="font-medium text-sm">{r.name} <span className="text-slate-400">— Unit {r.unit}</span></p>
                          <p className="text-xs text-slate-500">{r.meals}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">{r.change}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
