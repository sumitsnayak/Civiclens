import React from 'react';
import { ReportCategory } from '../../types';
import { CATEGORIES_CONFIG } from '../../lib/constants';
import { 
  AlertTriangle, 
  Trash2, 
  LightbulbOff, 
  Droplets, 
  Waves, 
  Building2, 
  HelpCircle,
  LucideIcon 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryBadgeProps {
  category: ReportCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const ICON_MAP: Record<ReportCategory, LucideIcon> = {
  pothole: AlertTriangle,
  garbage: Trash2,
  streetlight: LightbulbOff,
  water_leakage: Droplets,
  drainage: Waves,
  infrastructure: Building2,
  other: HelpCircle,
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  className,
  showIcon = true,
}) => {
  const config = CATEGORIES_CONFIG[category] || CATEGORIES_CONFIG.other;
  const IconComponent = ICON_MAP[category] || HelpCircle;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-medium transition-colors',
        config.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <IconComponent size={iconSizes[size]} className="mr-1.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
