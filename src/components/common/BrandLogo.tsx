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
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.18em]',
    md: 'text-sm tracking-[0.22em]',
    lg: 'text-lg tracking-[0.24em]',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Automotive Hexagonal Shield Emblem */}
      <div className={`${iconSizes[size]} rounded-md bg-gradient-to-b from-[#1E2028] to-[#0A0B0E] border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(229,169,60,0.18)] shrink-0 relative overflow-hidden transition-all duration-300 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(229,169,60,0.35)]`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-5/6 h-5/6"
        >
          {/* Outer Angular Shield Outline */}
          <path 
            d="M16 3L27 8V18C27 24.5 16 29 16 29C16 29 5 24.5 5 18V8L16 3Z" 
            stroke="#E5A93C" 
            strokeWidth="1.8" 
            strokeLinejoin="round" 
            fill="#E5A93C" 
            fillOpacity="0.12" 
          />
          {/* Inner Civic Apex Focus */}
          <path 
            d="M16 8.5C13.5 8.5 11.5 10.5 11.5 13C11.5 16.8 16 21.5 16 21.5C16 21.5 20.5 16.8 20.5 13C20.5 10.5 18.5 8.5 16 8.5Z" 
            stroke="#E5A93C" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
            fill="#E5A93C" 
            fillOpacity="0.4" 
          />
          <circle cx="16" cy="13" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 leading-none">
          <span className={`font-black uppercase font-mono ${textSizes[size]} ${isDark ? 'text-white' : 'text-slate-950'}`}>
            CIVIC<span className="text-[#E5A93C] font-semibold">LENS</span>
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] uppercase tracking-[0.14em] font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            MUNICIPAL INTELLIGENCE
          </span>
        )}
      </div>
    </div>
  );
};
