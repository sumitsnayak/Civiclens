import React, { useState, useEffect } from 'react';
import { Report, ReportCategory, ReportSeverity, ReportStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { STATUS_CONFIG } from '../lib/constants';
import { formatDate, timeAgo } from '../lib/utils';
import { ReportService } from '../lib/reportStore';
import { useAuth } from '../lib/authStore';
import { StatusChangeModal } from '../components/admin/StatusChangeModal';
import { DuplicateLinkModal } from '../components/admin/DuplicateLinkModal';
import { 
  ArrowLeft, 
  MapPin, 
  ThumbsUp, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Maximize2, 
  X, 
  Copy, 
  Layers, 
  MessageSquare,
  Lock
} from 'lucide-react';
import L from 'leaflet';

interface IssueDetailsPageProps {
  report: Report;
  onBack: () => void;
  onReportUpdated?: (updated: Report) => void;
}

export const IssueDetailsPage: React.FC<IssueDetailsPageProps> = ({
  report: initialReport,
  onBack,
  onReportUpdated,
}) => {
  const { user, isAdmin } = useAuth();
  const [report, setReport] = useState<Report>(initialReport);
  const [upvotes, setUpvotes] = useState(initialReport.upvotes_count);
  const [hasUpvoted, setHasUpvoted] = useState(Boolean(initialReport.has_upvoted));
  const [copied, setCopied] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [allReports, setAllReports] = useState<Report[]>([]);

  useEffect(() => {
    // Refresh report from store to get latest updates
    ReportService.getReportById(initialReport.id).then((fresh) => {
      if (fresh) setReport(fresh);
    });
    ReportService.getReports().then(setAllReports);
  }, [initialReport.id]);

  // Leaflet Mini Map Setup
  useEffect(() => {
    const container = document.getElementById('details-mini-map');
    if (!container) return;

    const map = L.map(container, {
      center: [report.latitude, report.longitude],
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const pinHtml = `
      <div class="relative" style="transform: translate(-50%, -100%);">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-midnight-950 border-2 border-electric-500">
          <div class="w-2.5 h-2.5 rounded-full bg-electric-400"></div>
        </div>
        <div class="w-2 h-2 rotate-45 mx-auto -mt-1 bg-midnight-950 border-r border-b border-electric-500"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'details-marker',
      html: pinHtml,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
    });

    L.marker([report.latitude, report.longitude], { icon }).addTo(map);

    return () => {
      map.remove();
    };
  }, [report.latitude, report.longitude]);

  const handleUpvote = async () => {
    try {
      const res = await ReportService.toggleUpvote(report.id, user?.id || 'guest');
      setUpvotes(res.upvotes_count);
      setHasUpvoted(res.has_upvoted);
      const updated = { ...report, upvotes_count: res.upvotes_count, has_upvoted: res.has_upvoted };
      setReport(updated);
      if (onReportUpdated) onReportUpdated(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminStatusSave = async (
    newStatus: ReportStatus,
    publicMessage?: string,
    internalNote?: string,
    newCategory?: ReportCategory,
    newSeverity?: ReportSeverity
  ) => {
    const updated = await ReportService.updateReportStatus(
      report.id,
      newStatus,
      publicMessage,
      internalNote,
      user?.display_name || 'Admin Dispatch'
    );
    if (newCategory) updated.category = newCategory;
    if (newSeverity) updated.severity = newSeverity;
    setReport(updated);
    if (onReportUpdated) onReportUpdated(updated);
  };

  const handleConfirmDuplicate = async (reportId: string, parentReportId: string) => {
    const updated = await ReportService.markDuplicate(reportId, parentReportId);
    setReport(updated);
    if (onReportUpdated) onReportUpdated(updated);
  };

  const statusWorkflow: ReportStatus[] = ['reported', 'under_review', 'in_progress', 'resolved'];
  const currentStepIndex = STATUS_CONFIG[report.status]?.stepIndex || 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Explorer</span>
        </button>

        {/* Admin Bar if role = admin */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Admin Mode Active
            </span>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-midnight-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <ShieldCheck size={14} />
              <span>Update Ticket Status</span>
            </button>
            <button
              onClick={() => setIsDuplicateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
            >
              Link Duplicate
            </button>
          </div>
        )}
      </div>

      {/* Main Ticket Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Code & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-midnight-950 text-white font-mono font-bold text-xs tracking-wider border border-white/10">
              {report.reference_code}
            </span>
            <CategoryBadge category={report.category} size="md" />
            <SeverityBadge severity={report.severity} size="md" />
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} size="md" />
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="Share report link"
            >
              <Share2 size={15} />
            </button>
            {copied && <span className="text-xs text-electric-600 font-bold">Link copied!</span>}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          {report.title}
        </h1>

        {/* Metadata info line */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            <span>Submitted {formatDate(report.created_at)} ({timeAgo(report.created_at)})</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-electric-500" />
            <span>{report.address || 'Street address confirmed'}</span>
          </span>
          {report.landmark && (
            <span className="italic">Landmark: {report.landmark}</span>
          )}
        </div>

        {/* STATUS PROGRESS TIMELINE PIPELINE */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resolution Pipeline Workflow
          </div>
          <div className="grid grid-cols-4 gap-2">
            {statusWorkflow.map((st, idx) => {
              const stepNum = idx + 1;
              const isPast = currentStepIndex > stepNum;
              const isCurrent = currentStepIndex === stepNum;
              const conf = STATUS_CONFIG[st];

              return (
                <div key={st} className="space-y-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-electric-500 shadow-glow-teal'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <div className="text-center sm:text-left">
                    <div
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-slate-900 dark:text-white'
                          : isPast
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {conf.label}
                    </div>
                    <div className="text-[10px] text-slate-400 hidden sm:block">
                      {isCurrent ? 'Current stage' : isPast ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left Details & Photo, Right Map & Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Photo & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photograph Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="relative group">
              <img
                src={report.image_path}
                alt={report.title}
                className="w-full aspect-video object-cover cursor-zoom-in"
                onClick={() => setIsPhotoZoomed(true)}
              />
              <button
                onClick={() => setIsPhotoZoomed(true)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-midnight-950/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-semibold"
              >
                <Maximize2 size={13} />
                <span>Zoom Photo</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Photo submitted by citizen reporter</span>
              <button
                onClick={() => setIsPhotoZoomed(true)}
                className="text-electric-600 font-semibold hover:underline"
              >
                View full resolution
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Problem Description & Citizen Report
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>

            {/* AI Engineering Breakdown */}
            {report.ai_explanation && (
              <div className="mt-4 p-4 rounded-2xl bg-electric-500/5 border border-electric-500/20 space-y-2">
                <div className="flex items-center gap-2 text-electric-600 dark:text-electric-400 font-bold text-xs">
                  <Sparkles size={15} />
                  <span>AI Computer Vision Diagnostic (Confidence: {Math.round((report.ai_confidence || 0.9) * 100)}%)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {report.ai_explanation}
                </p>
              </div>
            )}

            {/* Civic Action Upvoting / Community Agreement */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Can you confirm this problem?
                </div>
                <div className="text-[11px] text-slate-500">
                  Civic upvotes help municipal dispatchers gauge community impact
                </div>
              </div>

              <button
                onClick={handleUpvote}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                  hasUpvoted
                    ? 'bg-electric-500 text-midnight-950 shadow-glow-teal'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp size={15} className={hasUpvoted ? 'fill-midnight-950' : ''} />
                <span>{upvotes} Citizens Agreed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Mini-map & Progress Updates */}
        <div className="lg:col-span-5 space-y-6">
          {/* Spatial Location Mini-Map */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-electric-500" />
                <span>Verified Coordinates</span>
              </span>
              <span className="font-mono text-slate-400 font-normal">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </span>
            </div>

            <div
              id="details-mini-map"
              className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner"
            />

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              📍 {report.address || 'Street coordinates confirmed'}
            </p>
          </div>

          {/* Progress Timeline & Updates History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-electric-500" />
                <span>Official Progress Log</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {report.updates?.length || 1} entries
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {report.updates && report.updates.length > 0 ? (
                report.updates.map((upd, idx) => (
                  <div key={upd.id || idx} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-slate-200 dark:border-slate-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-electric-500 absolute -left-[6px] top-1 shadow-sm" />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {upd.actor_name || 'Municipal Operations'}
                      </span>
                      <span>{timeAgo(upd.created_at)}</span>
                    </div>

                    {upd.public_message && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {upd.public_message}
                      </p>
                    )}

                    {/* Internal admin note if role is admin */}
                    {isAdmin && upd.internal_note && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                        <Lock size={12} className="shrink-0 mt-0.5" />
                        <span><strong>Internal Note:</strong> {upd.internal_note}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Report logged in system. Awaiting preliminary inspector triage.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {isPhotoZoomed && (
        <div
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <button
            onClick={() => setIsPhotoZoomed(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X size={24} />
          </button>
          <img
            src={report.image_path}
            alt={report.title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Admin Modals */}
      <StatusChangeModal
        report={report}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSave={handleAdminStatusSave}
      />

      <DuplicateLinkModal
        report={report}
        allReports={allReports}
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirmDuplicate={handleConfirmDuplicate}
      />
    </div>
  );
};
