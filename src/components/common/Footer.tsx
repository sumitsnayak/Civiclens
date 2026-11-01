import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getAIApiStatus, AIStatusInfo } from '../../lib/aiVisionService';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [aiStatus, setAiStatus] = useState<AIStatusInfo>({
    provider: 'BharatCode',
    model: 'qwen-3.8-27b',
    configured: false,
  });

  useEffect(() => {
    getAIApiStatus().then(setAiStatus);
  }, []);

  return (
    <footer className="bg-white border-t border-[#E7E2ED] text-slate-500 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <BrandLogo size="sm" showTagline={true} />
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600">
            <button onClick={() => onNavigate('landing')} className="hover:text-slate-950 transition-colors">
              Overview
            </button>
            <button onClick={() => onNavigate('explorer')} className="hover:text-slate-950 transition-colors">
              Issues Map
            </button>
            <button onClick={() => onNavigate('report')} className="hover:text-slate-950 transition-colors">
              Report Issue
            </button>
            <button onClick={() => onNavigate('citizen-dashboard')} className="hover:text-slate-950 transition-colors">
              My Reports
            </button>
            <button onClick={() => onNavigate('analytics')} className="hover:text-slate-950 transition-colors">
              Analytics
            </button>
            <button onClick={() => onNavigate('queries')} className="hover:text-slate-950 transition-colors">
              Queries
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-slate-950 transition-colors">
              About
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0EDF5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} CivicLens. Independent technology prototype for civic problem reporting.
          </div>
          <div className="flex items-center gap-3">
            <span>Storage: {isSupabaseConfigured ? 'Supabase Live' : 'Active Local Store'}</span>
            <span>•</span>
            <span title={`Official BharatCode Model: ${aiStatus.model}`}>
              Vision: {aiStatus.configured ? 'BharatCode Qwen-3.8 Live' : 'BharatCode Diagnostic (Offline Heuristic)'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
