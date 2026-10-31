import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authStore';
import { ReportService } from '../lib/reportStore';
import { Report, ReportCategory, ReportSeverity, ReportStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { StatusChangeModal } from '../components/admin/StatusChangeModal';
import { DuplicateLinkModal } from '../components/admin/DuplicateLinkModal';
import { timeAgo } from '../lib/utils';
import { 
  Download, 
  Search, 
  Edit2, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectReport: (report: Report) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectReport }) => {
  const { user, isAdmin, signInAsDemoUser } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<ReportSeverity | 'all'>('all');

  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [duplicateReport, setDuplicateReport] = useState<Report | null>(null);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    const list = await ReportService.getReports();
    setReports(list);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.reference_code.toLowerCase().includes(search.toLowerCase()) ||
      (r.address && r.address.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSev = severityFilter === 'all' || r.severity === severityFilter;

    return matchesSearch && matchesCat && matchesStatus && matchesSev;
  });

  const handleExportCsv = () => {
    const csvContent = ReportService.exportReportsToCsv(filteredReports);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `civiclens_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusSave = async (
    newStatus: ReportStatus,
    publicMessage?: string,
    internalNote?: string,
    newCategory?: ReportCategory,
    newSeverity?: ReportSeverity
  ) => {
    if (!editingReport) return;
    const updated = await ReportService.updateReportStatus(
      editingReport.id,
      newStatus,
      publicMessage,
      internalNote,
      user?.display_name || 'Admin Operations'
    );
    if (newCategory) updated.category = newCategory;
    if (newSeverity) updated.severity = newSeverity;

    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleConfirmDuplicate = async (reportId: string, parentReportId: string) => {
    const updated = await ReportService.markDuplicate(reportId, parentReportId);
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF0E6] text-[#B55D1C] border border-[#F6D5BD] mx-auto flex items-center justify-center font-bold shadow-2xs">
          <ShieldAlert size={22} />
        </div>
        <h2 className="text-base font-bold text-slate-900">
          Administrator Credentials Required
        </h2>
        <p className="text-xs text-slate-500">
          The operations console is role-restricted to authorized city administrators and dispatch coordinators.
        </p>
        <button
          onClick={() => signInAsDemoUser('admin')}
          className="px-5 py-2.5 rounded-xl bg-[#442646] hover:bg-[#341B36] text-white font-bold text-xs shadow-xs transition-all"
        >
          Switch to Admin Demo (Director Sharma)
        </button>
      </div>
    );
  }

  const reportedCount = reports.filter((r) => r.status === 'reported').length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress' || r.status === 'under_review').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2ED] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Municipal Operations & Triage
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#FDF0E6] text-[#B55D1C] text-[10px] font-bold border border-[#F6D5BD]">
              Admin Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operator: <strong className="text-slate-800">{user?.display_name}</strong> (Department Director)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E7E2ED] bg-white hover:bg-[#F5F3F8] text-slate-700 text-xs font-bold shadow-2xs transition-colors"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              ReportService.resetToDemoData();
              loadAllReports();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E2ED] bg-white hover:bg-[#F5F3F8] text-slate-500 text-xs font-medium"
            title="Reset demo dataset"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Tickets</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{reports.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all wards</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-bold text-[#B55D1C] uppercase">Pending Triage</div>
          <div className="text-2xl font-black text-[#B55D1C] mt-0.5">{reportedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting assignment</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-bold text-[#552B58] uppercase">In Remediation</div>
          <div className="text-2xl font-black text-[#552B58] mt-0.5">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active field teams</div>
        </div>

        <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)]">
          <div className="text-[11px] font-bold text-[#247A48] uppercase">Resolved</div>
          <div className="text-2xl font-black text-[#247A48] mt-0.5">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified completion</div>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white border border-[#E7E2ED] rounded-3xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, title, location..."
              className="w-full pl-8 pr-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Road Pothole</option>
            <option value="garbage">Garbage / Waste</option>
            <option value="streetlight">Streetlight</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="drainage">Drainage</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="other">Other</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E7E2ED]">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-[#FAF9FC] border-b border-[#E7E2ED] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Ticket</th>
                <th className="py-3 px-3.5">Issue & Location</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EEF6] bg-white">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-[#FAF9FC] transition-colors">
                  <td className="py-3 px-3.5 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">
                    {report.reference_code}
                    {report.duplicate_of && (
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        ↳ Linked to parent
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">
                      {report.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {report.address || 'Coordinates provided'}
                    </div>
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <CategoryBadge category={report.category} size="sm" />
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <SeverityBadge severity={report.severity} size="sm" />
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusBadge status={report.status} size="sm" />
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] font-bold text-slate-700">
                    {report.priority_score} pts
                  </td>

                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingReport(report)}
                        className="px-2.5 py-1 rounded-lg bg-[#EDE5F0] hover:bg-[#E5DAE9] text-[#552B58] text-[11px] font-bold transition-colors flex items-center gap-1"
                        title="Triage & Update Status"
                      >
                        <Edit2 size={11} />
                        <span>Triage</span>
                      </button>

                      <button
                        onClick={() => setDuplicateReport(report)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F2EFF6] transition-colors"
                        title="Link as Duplicate"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        onClick={() => onSelectReport(report)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F2EFF6] transition-colors"
                        title="View Public Details"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editingReport && (
        <StatusChangeModal
          report={editingReport}
          isOpen={Boolean(editingReport)}
          onClose={() => setEditingReport(null)}
          onSave={handleStatusSave}
        />
      )}

      {duplicateReport && (
        <DuplicateLinkModal
          report={duplicateReport}
          allReports={reports}
          isOpen={Boolean(duplicateReport)}
          onClose={() => setDuplicateReport(null)}
          onConfirmDuplicate={handleConfirmDuplicate}
        />
      )}
    </div>
  );
};
