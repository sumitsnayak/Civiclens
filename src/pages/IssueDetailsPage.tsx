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
  Clock, 
  Shield, 
  Maximize2, 
  X, 
  Lock,
  MessageSquare,
  CheckCircle2
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
    ReportService.getReportById(initialReport.id).then((fresh) => {
      if (fresh) setReport(fresh);
    });
    ReportService.getReports().then(setAllReports);
  }, [initialReport.id]);

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
      <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #442646; border: 2px solid white; box-shadow: 0 4px 8px rgba(44,25,48,0.3);"></div>
    `;

    const icon = L.divIcon({
      className: 'details-marker',
      html: pinHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Nav & Admin controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          <span>Back to Issues</span>
        </button>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#FDF0E6] border border-[#F6D5BD] text-[#B55D1C] hover:bg-[#FCE5D4] font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Shield size={12} />
              <span>Update Status</span>
            </button>
            <button
              onClick={() => setIsDuplicateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[#E7E2ED] bg-white hover:bg-[#F5F3F8] text-slate-700 font-bold text-xs shadow-2xs"
            >
              Link Duplicate
            </button>
          </div>
        )}
      </div>

      {/* Main Ticket Card (Dribbble Style) */}
      <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_4px_24px_-2px_rgba(44,25,48,0.03)]">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0EDF5]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 bg-[#F5F4F8] px-2.5 py-0.5 rounded-lg border border-[#EAE6F0]">
              {report.reference_code}
            </span>
            <CategoryBadge category={report.category} size="sm" />
            <SeverityBadge severity={report.severity} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} size="sm" />
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#F2EFF6] transition-colors"
              title="Copy share link"
            >
              <Share2 size={13} />
            </button>
            {copied && <span className="text-[11px] text-emerald-600 font-bold">Link copied</span>}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            <span>Submitted {formatDate(report.created_at)}</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{report.address}</span>
          </span>
          {report.landmark && (
            <span className="text-slate-400 italic">Landmark: {report.landmark}</span>
          )}
        </div>

        {/* Progress Pipeline */}
        <div className="pt-4 border-t border-[#F0EDF5] space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Resolution Pipeline
          </div>
          <div className="grid grid-cols-4 gap-2">
            {statusWorkflow.map((st, idx) => {
              const stepNum = idx + 1;
              const isPast = currentStepIndex > stepNum;
              const isCurrent = currentStepIndex === stepNum;
              const conf = STATUS_CONFIG[st];

              return (
                <div key={st} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-[#552B58]'
                        : 'bg-[#EDE8F2]'
                    }`}
                  />
                  <div className={`text-[11px] font-bold ${isCurrent ? 'text-[#552B58]' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {conf.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Photo & Description */}
        <div className="md:col-span-7 space-y-5">
          <div className="bg-white border border-[#E7E2ED] rounded-3xl overflow-hidden shadow-2xs">
            <div className="relative group aspect-video bg-slate-100">
              <img
                src={report.image_path}
                alt={report.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/issues/pothole.jpg';
                }}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setIsPhotoZoomed(true)}
              />
              <button
                onClick={() => setIsPhotoZoomed(true)}
                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Maximize2 size={11} />
                <span>Full photo</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Issue Observations
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>

            {report.ai_explanation && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[#F5F4F8] border border-[#EAE6F0] text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Diagnostic Note:
                </span>
                <p className="leading-relaxed">{report.ai_explanation}</p>
              </div>
            )}

            <div className="pt-4 border-t border-[#F0EDF5] flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Confirm this problem to raise civic priority
              </span>
              <button
                onClick={handleUpvote}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  hasUpvoted
                    ? 'bg-[#442646] text-white shadow-xs'
                    : 'bg-[#EDE5F0] text-[#552B58] hover:bg-[#E5DAE9]'
                }`}
              >
                <ThumbsUp size={13} className={hasUpvoted ? 'fill-current' : ''} />
                <span>{upvotes} Agreed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Map & Timeline */}
        <div className="md:col-span-5 space-y-5">
          {/* Spatial Mini-Map */}
          <div className="bg-white border border-[#E7E2ED] rounded-3xl p-4 shadow-2xs space-y-2.5">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Location</span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </span>
            </div>

            <div
              id="details-mini-map"
              className="h-36 w-full rounded-2xl overflow-hidden border border-[#EAE6F0]"
            />

            <p className="text-xs text-slate-600 truncate font-medium">
              {report.address}
            </p>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-[#E7E2ED] rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} />
                <span>Audit Timeline</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono font-bold">
                {report.updates?.length || 1} ENTRIES
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {report.updates && report.updates.length > 0 ? (
                report.updates.map((upd, idx) => (
                  <div key={upd.id || idx} className="text-xs space-y-1 pb-2.5 border-b border-[#F0EDF5] last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-700">{upd.actor_name || 'Staff'}</span>
                      <span>{timeAgo(upd.created_at)}</span>
                    </div>

                    {upd.public_message && (
                      <p className="text-slate-600 leading-relaxed text-xs">
                        {upd.public_message}
                      </p>
                    )}

                    {isAdmin && upd.internal_note && (
                      <div className="p-2 rounded-xl bg-[#FDF0E6] border border-[#F6D5BD] text-[11px] text-[#8C4311] flex items-start gap-1">
                        <Lock size={10} className="shrink-0 mt-0.5 text-[#B55D1C]" />
                        <span><strong>Internal:</strong> {upd.internal_note}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">
                  Ticket received. Awaiting dispatcher review.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {isPhotoZoomed && (
        <div
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setIsPhotoZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white"
          >
            <X size={20} />
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
