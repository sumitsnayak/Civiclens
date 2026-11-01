import React, { useState } from 'react';
import { Report } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { MapPin, ThumbsUp, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
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
      className="bg-white border border-slate-200/90 hover:border-[#CF9E3C]/60 rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-12px_rgba(207,158,60,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
    >
      {/* 1. Author Row & Status Badge */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-[#CF9E3C] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
            {authorInitial}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight">
              {report.author_name || 'Citizen Reporter'}
            </h4>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-medium">
              <MapPin size={11} className="shrink-0 text-[#CF9E3C]" />
              <span className="truncate">{report.address ? report.address.split(',')[0] : 'Mangalore, Karnataka'}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={report.status} size="sm" />
      </div>

      {/* 2. Photo Showcase */}
      <div className="px-4 sm:px-5 pb-3">
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
          <img
            src={report.image_path}
            alt={report.title}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/issues/pothole.jpg';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

          {/* Reference Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white font-semibold tracking-wider shadow-xs border border-white/10">
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
                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[140px]">
                  📍 {report.landmark}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              {timeAgo(report.created_at)}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#CF9E3C] transition-colors">
            {report.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* 4. Social Validation Row */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 size={12} className="stroke-[2.2]" />
              <span>Acknowledged by Municipal Works</span>
            </span>
            <span className="text-slate-700 font-semibold">
              {upvotes} Citizens Agree
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpvote}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                  hasUpvoted
                    ? 'bg-[#CF9E3C] text-black shadow-sm font-extrabold scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Agree with this issue"
              >
                <ThumbsUp size={12} className={hasUpvoted ? 'fill-current' : ''} />
                <span>{hasUpvoted ? 'Agreed' : 'I Agree'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy share link"
              >
                <Share2 size={13} />
              </button>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-[#CF9E3C] group-hover:translate-x-0.5 transition-all">
              <span>View Details</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
