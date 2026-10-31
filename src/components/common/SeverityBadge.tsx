import React from 'react';
import { ReportSeverity } from '../../types';
import { SEVERITY_CONFIG } from '../../lib/constants';
import { AlertTriangle, Flame, ShieldAlert, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SeverityBadgeProps {
  severity: ReportSeverity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;

  const renderIcon = () => {
    if (!showIcon) return null;
    const iconSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;
    switch (severity) {
      case 'critical':
        return <Flame size={iconSize} className="mr-1 text-red-500 animate-bounce" />;
      case 'high':
        return <ShieldAlert size={iconSize} className="mr-1 text-orange-500" />;
      case 'medium':
        return <AlertTriangle size={iconSize} className="mr-1 text-amber-500" />;
      case 'low':
        return <Info size={iconSize} className="mr-1 text-slate-400" />;
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
        'inline-flex items-center rounded-full border shadow-sm',
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      {renderIcon()}
      <span>{config.label} Priority</span>
    </span>
  );
};
