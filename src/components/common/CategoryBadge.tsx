import React from 'react';
import { ReportCategory } from '../../types';
import { CATEGORIES_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface CategoryBadgeProps {
  category: ReportCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  className,
}) => {
  const config = CATEGORIES_CONFIG[category] || CATEGORIES_CONFIG.other;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium rounded-lg',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg',
    lg: 'text-xs px-3 py-1 font-medium rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center bg-[#F2EFF6] text-[#554C62] border border-[#E7E2ED] hover:bg-[#EDE8F2] transition-colors',
        sizeClasses[size],
        className
      )}
    >
      <span>#{config.label.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
    </span>
  );
};
