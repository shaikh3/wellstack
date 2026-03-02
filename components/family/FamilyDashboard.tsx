'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  Sun,
  Shield,
  Users,
  Activity,
  Leaf,
  Thermometer,
  Wind,
  Calendar,
  ChevronRight,
  Home,
  Lock,
  CheckCircle2,
  Coffee,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FamilyDashboardProps {
  residentId: string;
}

interface FamilyResidentData {
  name: string;
  firstName: string;
  community: string;
  unit: string;
  moveInDate: string;
  wellnessScore: number;
  wellnessLabel: string;
  activityStatus: string;
  activityLevel: 'up' | 'same' | 'down';
  eventsThisWeek: number;
  eventsList: string[];
  airQuality: string;
  airQualityStatus: 'excellent' | 'good' | 'fair';
  temperature: string;
  tempComfort: string;
  incidentsThisMonth: number;
  lastIncident: string | null;
  fallDetection: string;
  weeklyDigest: string;
  communityComparison: string;
  lastUpdated: string;
}

const familyResidents: Record<string, FamilyResidentData> = {
  'resident-margaret-chen': {
    name: 'Margaret Chen',
    firstName: 'Margaret',
    community: 'Lakeview Commons',
    unit: '2B',
    moveInDate: 'January 2024',
    wellnessScore: 87,
    wellnessLabel: 'Excellent',
    activityStatus: 'Active today — visited the garden and attended yoga',
    activityLevel: 'up',
    eventsThisWeek: 4,
    eventsList: ['Morning Yoga (Mon)', 'Garden Club (Tue)', 'Art Workshop (Wed)', 'Book Club (Thu)'],
    airQuality: 'Air quality is excellent',
    airQualityStatus: 'excellent',
    temperature: '72°F',
    tempComfort: 'Comfortable range',
    incidentsThisMonth: 0,
    lastIncident: null,
    fallDetection: 'Fall detection active in all rooms',
    weeklyDigest: 'This week, Margaret attended 4 community events, maintained her walking routine, and her living environment has been consistently healthy. She tried the new art workshop and seems to really enjoy it!',
    communityComparison: 'Margaret\'s wellness score is above the community average',
    lastUpdated: '5 minutes ago',
  },
  'resident-harold-finch': {
    name: 'Harold Finch',
    firstName: 'Harold',
    community: 'Lakeview Commons',
    unit: '118',
    moveInDate: 'June 2025',
    wellnessScore: 42,
    wellnessLabel: 'Needs Attention',
    activityStatus: 'Resting — has been in his unit today',
    activityLevel: 'down',
    eventsThisWeek: 0,
    eventsList: [],
    airQuality: 'Air quality needs improvement',
    airQualityStatus: 'fair',
    temperature: '78°F',
    tempComfort: 'Slightly warm — staff has been notified',
    incidentsThisMonth: 1,
    lastIncident: 'Minor incident on Feb 27 — Harold had a small fall in the bathroom. Staff responded within 6 minutes. He was evaluated on-site and is doing well. His care coordinator has scheduled a follow-up.',
    fallDetection: 'Fall detection active in all rooms',
    weeklyDigest: 'Harold has been spending more time resting this week. Our care team has been checking in daily and ensuring he has everything he needs. We\'re working with his doctor on a care plan adjustment to help him feel more energetic.',
    communityComparison: 'Our team is providing extra attention to help Harold improve',
    lastUpdated: '15 minutes ago',
  },
};

function WellnessScoreBadge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
  const bgColor = score >= 80 ? 'bg-emerald-50 border-emerald-200' : score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
  const ringColor = score >= 80 ? 'stroke-emerald-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-rose-500';

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="transform -rotate-90 w-28 h-28">
          <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
          <motion.circle
            cx="56" cy="56" r={radius} strokeWidth="8" fill="transparent"
            className={ringColor}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <Badge className={`mt-2 ${bgColor} ${color} border text-sm px-4 py-1`}>{label}</Badge>
    </div>
  );
}

export function FamilyDashboard({ residentId }: FamilyDashboardProps) {
  const data = familyResidents[residentId] || familyResidents['resident-margaret-chen'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <Home className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-lg font-semibold text-slate-700">WellStack</span>
        </div>
        <div className="flex items-center justify-center mb-2">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sky-200 to-emerald-200 flex items-center justify-center text-3xl font-bold text-slate-600">
            {data.firstName.charAt(0)}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
        <p className="text-slate-500">{data.community} · Unit {data.unit}</p>
        <p className="text-xs text-slate-400">Resident since {data.moveInDate}</p>
      </motion.div>

      {/* Wellness Score Hero */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardContent className="flex flex-col items-center py-8">
            <WellnessScoreBadge score={data.wellnessScore} label={data.wellnessLabel} />
            <p className="mt-3 text-sm text-slate-500">{data.communityComparison}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Summary */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-700">
              <Activity className="h-5 w-5 text-blue-500" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                data.activityLevel === 'up' ? 'bg-emerald-100' : data.activityLevel === 'same' ? 'bg-blue-100' : 'bg-amber-100'
              }`}>
                {data.activityLevel === 'up' ? <TrendingUp className="h-5 w-5 text-emerald-600" /> :
                 data.activityLevel === 'down' ? <Activity className="h-5 w-5 text-amber-600" /> :
                 <Activity className="h-5 w-5 text-blue-600" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{data.activityStatus}</p>
                <p className="text-xs text-slate-500">
                  Activity this week: {data.activityLevel === 'up' ? 'Higher than last week ↑' : data.activityLevel === 'down' ? 'Lower than usual' : 'About the same as last week'}
                </p>
              </div>
            </div>

            {data.eventsThisWeek > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1.5">Community Events This Week ({data.eventsThisWeek})</p>
                  <div className="space-y-1">
                    {data.eventsList.map(e => (
                      <div key={e} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{e}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {data.eventsThisWeek === 0 && (
              <>
                <Separator />
                <p className="text-sm text-slate-500">No community events attended this week. Our team is reaching out to encourage participation.</p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Environment Quality */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-700">
              <Leaf className="h-5 w-5 text-emerald-500" />
              Living Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                data.airQualityStatus === 'excellent' ? 'bg-emerald-100' : data.airQualityStatus === 'good' ? 'bg-blue-100' : 'bg-amber-100'
              }`}>
                <Wind className={`h-5 w-5 ${
                  data.airQualityStatus === 'excellent' ? 'text-emerald-600' : data.airQualityStatus === 'good' ? 'text-blue-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{data.airQuality}</p>
                <Badge className={`text-[10px] mt-0.5 ${
                  data.airQualityStatus === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                  data.airQualityStatus === 'good' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {data.airQualityStatus.charAt(0).toUpperCase() + data.airQualityStatus.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Thermometer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{data.temperature}</p>
                <p className="text-xs text-slate-500">{data.tempComfort}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-700">
              <Shield className="h-5 w-5 text-blue-500" />
              Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.incidentsThisMonth === 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700">No incidents this month</p>
                  <p className="text-xs text-slate-500">{data.fallDetection}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">{data.incidentsThisMonth} minor incident this month</p>
                    <p className="text-xs text-slate-500">{data.fallDetection}</p>
                  </div>
                </div>
                {data.lastIncident && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800">
                    {data.lastIncident}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Digest */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-700">
              <Calendar className="h-5 w-5 text-violet-500" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border border-sky-100">
              <p className="text-sm text-slate-700 leading-relaxed">{data.weeklyDigest}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="text-center space-y-2 py-4">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3 w-3" />
            <span>{data.firstName} has authorized you to view this information.</span>
          </div>
          <p className="text-[10px] text-slate-300">
            Sharing preferences can be updated anytime. · Last updated: {data.lastUpdated}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
