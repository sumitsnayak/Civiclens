import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authStore';
import { ReportService } from '../lib/reportStore';
import { Report, ReportStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { timeAgo } from '../lib/utils';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Search, 
  ArrowRight,
  FileText
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
    const userReports = all.filter(
      (r) => r.user_id === user?.id || (user?.role === 'citizen' && r.user_id === 'usr-citizen-1')
    );
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2ED] pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Citizen Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active session: <strong className="text-slate-800">{user?.display_name || 'Citizen'}</strong>
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#442646] hover:bg-[#341B36] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all w-fit"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">My Reports</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total tickets filed</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-bold text-[#B55D1C] uppercase">Awaiting Triage</div>
          <div className="text-2xl font-black text-[#B55D1C] mt-1">{awaitingReview}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pending dispatcher review</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-bold text-[#552B58] uppercase">In Remediation</div>
          <div className="text-2xl font-black text-[#552B58] mt-1">{inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Crew deployed</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-bold text-[#247A48] uppercase">Resolved</div>
          <div className="text-2xl font-black text-[#247A48] mt-1">{resolved}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified completion</div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white border border-[#E7E2ED] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            My Submitted Tickets
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search my tickets..."
                className="pl-7 pr-3 py-1.5 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              />
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* List items */}
        {filteredReports.length > 0 ? (
          <div className="divide-y divide-[#F0EDF5]">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9F8FB] -mx-2 px-3 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={report.image_path}
                    alt={report.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/issues/pothole.jpg';
                    }}
                    className="w-14 h-14 rounded-xl object-cover border border-[#EAE6F0] shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-semibold text-slate-500 bg-[#F5F4F8] px-2 py-0.5 rounded-md border border-[#EAE6F0]">
                        {report.reference_code}
                      </span>
                      <CategoryBadge category={report.category} size="sm" />
                      <SeverityBadge severity={report.severity} size="sm" />
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#552B58] transition-colors">
                      {report.title}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="truncate max-w-xs">{report.address}</span>
                      <span>•</span>
                      <span>{timeAgo(report.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={report.status} size="sm" />
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-[#552B58] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No submissions found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
};
