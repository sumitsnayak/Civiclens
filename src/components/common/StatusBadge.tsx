import React from 'react';
import { ReportStatus } from '../../types';
import { STATUS_CONFIG } from '../../lib/constants';
import { Clock, CheckCircle2, AlertCircle, Wrench, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.reported;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;
    switch (status) {
      case 'reported':
        return <Clock size={iconSize} className="mr-1 stroke-[2.2]" />;
      case 'under_review':
        return <AlertCircle size={iconSize} className="mr-1 stroke-[2.2]" />;
      case 'in_progress':
        return <Wrench size={iconSize} className="mr-1 stroke-[2.2]" />;
      case 'resolved':
        return <CheckCircle2 size={iconSize} className="mr-1 stroke-[2.2]" />;
      case 'rejected':
        return <XCircle size={iconSize} className="mr-1 stroke-[2.2]" />;
    }
  };

  // Dribbble SilentPing pill aesthetic: Soft pastels with deep readable text
  const statusStyles: Record<ReportStatus, string> = {
    in_progress: 'bg-[#EDE5F0] text-[#552B58] border border-[#DFCEE2]',
    under_review: 'bg-[#FDF0E6] text-[#B55D1C] border border-[#F6D5BD]',
    reported: 'bg-[#EDEBF3] text-[#4E445C] border border-[#DDD8E8]',
    resolved: 'bg-[#E8F6ED] text-[#247A48] border border-[#CDEED7]',
    rejected: 'bg-[#FCECEE] text-[#B92F45] border border-[#F8D2D7]',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 font-bold rounded-full',
    md: 'text-xs px-3 py-1 font-bold rounded-full',
    lg: 'text-xs px-3.5 py-1.5 font-bold rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center tracking-tight transition-all',
        statusStyles[status] || 'bg-slate-100 text-slate-700',
        sizeClasses[size],
        className
      )}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
