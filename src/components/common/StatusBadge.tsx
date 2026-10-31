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
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
    switch (status) {
      case 'reported':
        return <Clock size={iconSize} className="mr-1 animate-pulse" />;
      case 'under_review':
        return <AlertCircle size={iconSize} className="mr-1" />;
      case 'in_progress':
        return <Wrench size={iconSize} className="mr-1" />;
      case 'resolved':
        return <CheckCircle2 size={iconSize} className="mr-1" />;
      case 'rejected':
        return <XCircle size={iconSize} className="mr-1" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-sm transition-all',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {renderIcon()}
      {config.label}
    </span>
  );
};
