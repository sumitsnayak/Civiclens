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
import { Clock, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-medium text-slate-500">
        Loading civic analytics telemetry...
      </div>
    );
  }

  const categoryData = Object.entries(stats.category_distribution).map(([cat, count]) => ({
    name: CATEGORIES_CONFIG[cat as keyof typeof CATEGORIES_CONFIG]?.label || cat,
    value: count,
    color: CATEGORIES_CONFIG[cat as keyof typeof CATEGORIES_CONFIG]?.color || '#552B58',
  })).filter(d => d.value > 0);

  const severityData = [
    { name: 'Low', count: stats.severity_distribution.low, color: '#64748b' },
    { name: 'Medium', count: stats.severity_distribution.medium, color: '#f59e0b' },
    { name: 'High', count: stats.severity_distribution.high, color: '#ea580c' },
    { name: 'Critical', count: stats.severity_distribution.critical, color: '#e11d48' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#E7E2ED] pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Civic Analytics & Resolution Metrics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time workload distribution, category frequencies, and municipal SLA performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-xs font-semibold text-slate-500">Total Submissions</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logged in registry</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-xs font-bold text-[#B55D1C] flex items-center gap-1">
            <Clock size={13} />
            <span>Active Workload</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#B55D1C] mt-1">
            {stats.in_progress + stats.under_review}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Review & field repair</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-xs font-bold text-[#247A48] flex items-center gap-1">
            <CheckCircle size={13} />
            <span>Verified Resolved</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#247A48] mt-1">
            {stats.resolved}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {Math.round((stats.resolved / (stats.total || 1)) * 100)}% resolution rate
          </div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <TrendingUp size={13} className="text-[#552B58]" />
            <span>Avg. Resolution</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {stats.avg_resolution_days} Days
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">SLA turnaround time</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-[#E7E2ED] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Issues by Category
            </h3>
            <p className="text-[11px] text-slate-400">Distribution across municipal service areas</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E7E2ED',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#1E1B24',
                    boxShadow: '0 4px 12px rgba(44,25,48,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white border border-[#E7E2ED] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Severity Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Hazard assessment and prioritization ranking</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDF5" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E7E2ED',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#1E1B24',
                    boxShadow: '0 4px 12px rgba(44,25,48,0.08)',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 font-medium">
            <span>Critical issues receive immediate supervisor dispatch triage within 2 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};
