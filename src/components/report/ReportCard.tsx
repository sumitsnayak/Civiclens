import React, { useState } from 'react';
import { Report } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { MapPin, ThumbsUp, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { timeAgo } from '../../lib/utils';
import { ReportService } from '../../lib/reportStore';
import { useAuth } from '../../lib/authStore';

interface ReportCardProps {
  report: Report;
  onSelect?: (report: Report) => void;
  onUpvoteChange?: (reportId: string, count: number, hasUpvoted: boolean) => void;
  compact?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onSelect,
  onUpvoteChange,
  compact = false,
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

  return (
    <div
      onClick={() => onSelect && onSelect(report)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-electric-500/50 dark:hover:border-electric-500/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={report.image_path}
          alt={report.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Reference & Status Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-midnight-950/80 backdrop-blur-md text-[11px] font-mono font-semibold text-white tracking-wider border border-white/10">
            {report.reference_code}
          </span>
          <StatusBadge status={report.status} size="sm" />
        </div>

        {/* AI Analyzed Indicator */}
        {report.ai_category && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md text-[11px] font-semibold text-electric-600 dark:text-electric-400 border border-electric-500/30">
            <Sparkles size={11} className="text-electric-500 animate-spin-slow" />
            <span>AI Verified ({Math.round((report.ai_confidence || 0.9) * 100)}%)</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3">
          <SeverityBadge severity={report.severity} size="sm" />
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Time */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <CategoryBadge category={report.category} size="sm" />
            <span>{timeAgo(report.created_at)}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-electric-600 dark:group-hover:text-electric-400 transition-colors">
            {report.title}
          </h3>

          {/* Description */}
          {!compact && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
              {report.description}
            </p>
          )}

          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3">
            <MapPin size={13} className="text-electric-500 shrink-0" />
            <span className="truncate">{report.address || 'Street coordinates registered'}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Civic Agreement / Upvote Button */}
            <button
              type="button"
              onClick={handleUpvote}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                hasUpvoted
                  ? 'bg-electric-500 text-midnight-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Confirm or agree that this issue exists"
            >
              <ThumbsUp size={13} className={hasUpvoted ? 'fill-midnight-950' : ''} />
              <span>{upvotes} Agreed</span>
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="Copy issue link"
            >
              <Share2 size={13} />
            </button>
            {copied && <span className="text-[10px] text-electric-600 font-bold">Link copied!</span>}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-electric-600 dark:text-electric-400 group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ExternalLink size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};
