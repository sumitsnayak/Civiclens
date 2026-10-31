import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authStore';
import { ReportService } from '../lib/reportStore';
import { Report, ReportStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { timeAgo } from '../lib/utils';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  MapPin, 
  Search, 
  ExternalLink,
  UserCheck
} from 'lucide-react';

interface CitizenDashboardProps {
  onSelectReport: (report: Report) => void;
  onNavigateToReport: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onSelectReport,
  onNavigateToReport,
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    loadUserReports();
  }, [user]);

  const loadUserReports = async () => {
    const all = await ReportService.getReports();
    // Filter reports belonging to the current user (or demo citizen items)
    const userReports = all.filter(
      (r) => r.user_id === user?.id || (user?.role === 'citizen' && r.user_id === 'usr-citizen-1')
    );
    // If none assigned specifically, show initial batch for demo friendliness
    setReports(userReports.length > 0 ? userReports : all.slice(0, 3));
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.reference_code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const awaitingReview = reports.filter((r) => r.status === 'reported' || r.status === 'under_review').length;
  const inProgress = reports.filter((r) => r.status === 'in_progress').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-midnight-950 via-midnight-900 to-slate-900 border border-midnight-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-500/20 text-electric-400 text-xs font-semibold border border-electric-500/30">
            <UserCheck size={13} />
            <span>Citizen Action Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.display_name || 'Civic Champion'}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Track your submitted neighborhood hazards, verify work orders, and review public maintenance notes in real-time.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-extrabold text-sm shadow-glow-teal hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <PlusCircle size={18} />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>My Total Reports</span>
            <FileText size={16} className="text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {reports.length}
          </div>
          <p className="text-[11px] text-slate-400">Total submitted tickets</p>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-600">
            <span>Awaiting Review</span>
            <Clock size={16} />
          </div>
          <div className="text-3xl font-black text-amber-500">
            {awaitingReview}
          </div>
          <p className="text-[11px] text-slate-400">Under dispatcher triage</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-600">
            <span>In Remediation</span>
            <Wrench size={16} />
          </div>
          <div className="text-3xl font-black text-purple-500">
            {inProgress}
          </div>
          <p className="text-[11px] text-slate-400">Work crew assigned</p>
        </div>

        {/* Resolved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Resolved</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-3xl font-black text-emerald-500">
            {resolved}
          </div>
          <p className="text-[11px] text-slate-400">Completed & verified</p>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Submitted Reports
            </h2>
            <p className="text-xs text-slate-500">
              Select any report to inspect details, photo diagnostics, and status timeline
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search my reports..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-electric-500"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Reports Table / List */}
        {filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-electric-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={report.image_path}
                    alt={report.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                        {report.reference_code}
                      </span>
                      <CategoryBadge category={report.category} size="sm" />
                      <SeverityBadge severity={report.severity} size="sm" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-electric-600 transition-colors">
                      {report.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-electric-500" />
                        <span className="truncate max-w-xs">{report.address}</span>
                      </span>
                      <span>•</span>
                      <span>{timeAgo(report.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusBadge status={report.status} size="sm" />
                  <div className="text-slate-400 group-hover:text-electric-600 group-hover:translate-x-1 transition-all">
                    <ExternalLink size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No matching personal submissions found.
          </div>
        )}
      </div>
    </div>
  );
};
