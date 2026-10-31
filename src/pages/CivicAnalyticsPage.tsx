import React, { useState, useEffect } from 'react';
import { ReportService } from '../lib/reportStore';
import { CivicStats } from '../types';
import { CATEGORIES_CONFIG } from '../lib/constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle2, ShieldAlert, Award } from 'lucide-react';

export const CivicAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<CivicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ReportService.getCivicStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading civic analytics...
      </div>
    );
  }

  // Format data for Recharts Pie (Categories)
  const categoryData = Object.entries(stats.category_distribution).map(([cat, count]) => ({
    name: CATEGORIES_CONFIG[cat as keyof typeof CATEGORIES_CONFIG]?.label || cat,
    value: count,
    color: CATEGORIES_CONFIG[cat as keyof typeof CATEGORIES_CONFIG]?.color || '#64748B',
  })).filter(d => d.value > 0);

  // Format data for Recharts Bar (Severities)
  const severityData = [
    { name: 'Low', count: stats.severity_distribution.low, color: '#94A3B8' },
    { name: 'Medium', count: stats.severity_distribution.medium, color: '#F59E0B' },
    { name: 'High', count: stats.severity_distribution.high, color: '#EA580C' },
    { name: 'Critical', count: stats.severity_distribution.critical, color: '#EF4444' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Analytics Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-500/10 text-electric-600 dark:text-electric-400 text-xs font-bold border border-electric-500/20 mb-2">
          <BarChart3 size={14} />
          <span>Real-Time Smart City Metrics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Civic Issue Analytics & Resolution Trends
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Aggregated municipal intelligence derived from verified citizen reports and work-order milestones
        </p>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Average Resolution Time</span>
            <Clock size={16} className="text-electric-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.avg_resolution_days} Days
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            ↓ 18% improvement vs prior quarter
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Resolution Rate</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.resolved} of {stats.total} closed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Active Hazard Load</span>
            <TrendingUp size={16} className="text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-600">
            {stats.in_progress + stats.under_review}
          </div>
          <div className="text-[11px] text-slate-400">
            Currently under remediation
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Critical Priority Issues</span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-500">
            {stats.critical_count}
          </div>
          <div className="text-[11px] text-slate-400">
            Immediate safety risks
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Category Donut & Severity Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Reports by Issue Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1C2541',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            {categoryData.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Distribution by Severity Rating
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1C2541',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            Critical priority hazards trigger expedited same-day municipal inspection
          </div>
        </div>
      </div>

      {/* Row 2 Chart: Submissions & Resolutions Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Civic Ticket Intake vs Resolution Pace (Past 7 Days)
            </h3>
            <p className="text-xs text-slate-500">
              Comparative volume of newly registered problems versus verified work-order completions
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Reported Intake</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Resolved Closed</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline_data}>
              <defs>
                <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06D6A0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" />
              <YAxis fontSize={11} stroke="#94A3B8" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B132B',
                  borderColor: '#1C2541',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSubmitted)"
                name="Intake Submissions"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#06D6A0"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved & Repaired"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
