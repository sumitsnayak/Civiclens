import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  className = '' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Civic Lens Icon */}
      <div className={`${iconSizes[size]} rounded-2xl bg-[#442646] text-white flex items-center justify-center shadow-sm shrink-0 relative overflow-hidden transition-transform group-hover:scale-105`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-5/6 h-5/6"
        >
          {/* Subtle aperture background grid */}
          <circle cx="16" cy="16" r="12" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 3" />
          
          {/* Outer Lens Ring */}
          <circle cx="16" cy="16" r="8.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          
          {/* Civic Location Apex / Focal Core */}
          <path 
            d="M16 9C13.2386 9 11 11.2386 11 14C11 17.5 16 23 16 23C16 23 21 17.5 21 14C21 11.2386 18.7614 9 16 9Z" 
            fill="#D4A7D9" 
            fillOpacity="0.3"
            stroke="white" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
          />
          
          {/* Lens Pupil Dot */}
          <circle cx="16" cy="14" r="2.2" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-slate-900 ${textSizes[size]}`}>
            Civic<span className="text-[#6E3674] font-semibold">Lens</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#EDE5F0] text-[#552B58] border border-[#DFCDE3]/60">
            Community
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">
            See a Problem. Report It. Track the Change.
          </span>
        )}
      </div>
    </div>
  );
};

