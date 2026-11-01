import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  className = '',
  variant = 'dark',
}) => {
  const textSizes = {
    sm: 'text-sm tracking-[0.24em]',
    md: 'text-base tracking-[0.28em]',
    lg: 'text-xl tracking-[0.3em]',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Pure Typographic Wordmark (No icon/image as requested) */}
      <div className="flex items-center leading-none">
        <span className={`font-black uppercase font-mono ${textSizes[size]} ${isDark ? 'text-white' : 'text-slate-950'} transition-colors`}>
          CIVIC<span className="text-[#CF9E3C] font-bold">LENS</span>
        </span>
      </div>
      {showTagline && (
        <span className={`text-[9px] uppercase tracking-[0.2em] font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
          Municipal Intelligence
        </span>
      )}
    </div>
  );
};
