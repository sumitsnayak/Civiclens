import React, { useState } from 'react';
import { Report } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { MapPin, ThumbsUp, Share2, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { timeAgo } from '../../lib/utils';
import { ReportService } from '../../lib/reportStore';
import { useAuth } from '../../lib/authStore';

interface ReportCardProps {
  report: Report;
  onSelect?: (report: Report) => void;
  onUpvoteChange?: (reportId: string, count: number, hasUpvoted: boolean) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onSelect,
  onUpvoteChange,
}) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(report.upvotes_count);
  const [hasUpvoted, setHasUpvoted] = useState(Boolean(report.has_upvoted));
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting) return;
    setIsUpvoting(true);
    try {
      const res = await ReportService.toggleUpvote(report.id, user?.id || 'guest');
      setUpvotes(res.upvotes_count);
      setHasUpvoted(res.has_upvoted);
      if (onUpvoteChange) {
        onUpvoteChange(report.id, res.upvotes_count, res.has_upvoted);
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#issue-${report.reference_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get author avatar initial
  const authorInitial = (report.author_name || 'C').charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onSelect && onSelect(report)}
      className="bg-white border border-[#E7E3EC] hover:border-[#BF9EC6] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(44,25,48,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(44,25,48,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer group"
    >
      {/* 1. Author Row & Status Badge (Dribbble SilentPing Style) */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 truncate">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5EEF7] to-[#EDE5F0] border border-[#DFCEE2] text-[#552B58] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {authorInitial}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight">
              {report.author_name || 'Citizen Reporter'}
            </h4>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-medium">
              <MapPin size={11} className="shrink-0 text-slate-400" />
              <span className="truncate">{report.address ? report.address.split(',')[0] : 'Reported Location'}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={report.status} size="sm" />
      </div>

      {/* 2. Photo Showcase */}
      <div className="px-4 sm:px-5 pb-3">
        <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F4F8] border border-[#EAE6F0]">
          <img
            src={report.image_path}
            alt={report.title}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/issues/pothole.jpg';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle gradient scrim for high-contrast badge legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />

          {/* Reference Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-white font-semibold tracking-wider shadow-xs">
              {report.reference_code}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 shadow-sm">
            <SeverityBadge severity={report.severity} size="sm" />
          </div>
        </div>
      </div>

      {/* 3. Post Content */}
      <div className="px-4 sm:px-5 pb-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Tags row */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={report.category} size="sm" />
              {report.landmark && (
                <span className="text-[11px] font-medium text-slate-500 bg-[#F5F4F8] px-2 py-0.5 rounded-lg border border-[#EAE6F0] truncate max-w-[140px]">
                  📍 {report.landmark}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              {timeAgo(report.created_at)}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#552B58] transition-colors">
            {report.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* 4. Social Validation Row */}
        <div className="pt-3 border-t border-[#F0EDF5] space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-[#247A48]">
              <CheckCircle2 size={12} className="stroke-[2.2]" />
              <span>Acknowledged by Municipal Works</span>
            </span>
            <span className="text-slate-600 font-semibold">
              {upvotes} Citizens Agree
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpvote}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  hasUpvoted
                    ? 'bg-[#442646] text-white shadow-xs scale-102'
                    : 'bg-[#EDE5F0] text-[#552B58] hover:bg-[#E5DAE9]'
                }`}
                title="Agree with this issue"
              >
                <ThumbsUp size={13} className={hasUpvoted ? 'fill-current' : ''} />
                <span>{hasUpvoted ? 'Agreed' : 'I Agree'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#F2EFF6] transition-colors"
                title="Copy share link"
              >
                <Share2 size={13} />
              </button>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-[#552B58] group-hover:translate-x-0.5 transition-transform">
              <span>View Details</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
