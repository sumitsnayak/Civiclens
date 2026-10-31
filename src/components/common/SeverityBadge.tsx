import React from 'react';
import { ReportSeverity } from '../../types';
import { SEVERITY_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface SeverityBadgeProps {
  severity: ReportSeverity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  className,
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;

  const severityStyles: Record<ReportSeverity, string> = {
    low: 'bg-slate-100 text-slate-700 border border-slate-200',
    medium: 'bg-amber-100/80 text-amber-900 border border-amber-200',
    high: 'bg-orange-100/80 text-orange-900 border border-orange-200',
    critical: 'bg-rose-100 text-rose-900 border border-rose-300 font-extrabold',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold rounded-md',
    md: 'text-[11px] px-2.5 py-0.5 font-bold rounded-md',
    lg: 'text-xs px-3 py-1 font-bold rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center tracking-wider uppercase',
        severityStyles[severity] || 'bg-slate-100 text-slate-700',
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      {config.label}
    </span>
  );
};
