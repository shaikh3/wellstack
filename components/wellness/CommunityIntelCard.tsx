'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MessageSquare,
  Activity,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityIntelCardProps {
  unitId: string;
}

// Mock community data for P2
const mockCommunityData = {
  socialScore: 8,
  maxScore: 10,
  trend: 'stable' as const,
  engagementMetrics: {
    eventAttendance: 75,
    communityDining: 3,
    socialInteractions: 12,
  },
  recentEvents: [
    { name: 'Morning Yoga', attended: true, date: '2 days ago' },
    { name: 'Book Club', attended: false, date: 'Last week' },
    { name: 'Garden Social', attended: true, date: '2 weeks ago' },
  ],
  peerComparison: {
    percentile: 65,
    label: 'Above Average'
  }
};

export function CommunityIntelCard({ unitId }: CommunityIntelCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const data = mockCommunityData;
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };
  
  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Show skeleton while loading
  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-4">
            <Skeleton className="h-20 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base font-semibold">Community Intel</CardTitle>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              <Sparkles className="w-3 h-3 mr-1" /> P4 Preview
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Social Score */}
          <div className="flex items-center justify-center py-2">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-bold ${getScoreColor(data.socialScore, data.maxScore)}`}>
                  {data.socialScore}
                </span>
                <span className="text-xl text-slate-400">/{data.maxScore}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Social Engagement Score</p>
              
              <div className="flex items-center justify-center gap-1 mt-2">
                {getTrendIcon(data.trend)}
                <span className="text-sm text-slate-500">{data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}</span>
              </div>
            </div>
          </div>
          
          {/* Peer Comparison */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Community Ranking</span>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {data.peerComparison.label}
              </Badge>
            </div>            
            <Progress 
              value={data.peerComparison.percentile} 
              className="h-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Top {100 - data.peerComparison.percentile}% of residents
            </p>
          </div>
          
          {/* Engagement Metrics */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Engagement Metrics</p>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <Activity className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold">{data.engagementMetrics.eventAttendance}%</p>
                <p className="text-xs text-slate-500">Event Attendance</p>
              </div>
              
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <Calendar className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold">{data.engagementMetrics.communityDining}</p>
                <p className="text-xs text-slate-500">Dining/wk</p>
              </div>
              
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <MessageSquare className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold">{data.engagementMetrics.socialInteractions}</p>
                <p className="text-xs text-slate-500">Interactions/wk</p>
              </div>
            </div>
          </div>
          
          {/* Recent Events */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recent Events</p>
            
            <div className="space-y-1.5">
              {data.recentEvents.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-slate-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${event.attended ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={event.attended ? 'text-slate-700' : 'text-slate-400'}>
                      {event.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{event.date}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Coming in P4 Note */}
          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-purple-800">Coming in P4</p>
              <p className="text-purple-700 mt-0.5">
                Full community intelligence with population health dashboards, 
                social interaction metrics, and predictive community insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
