import React from 'react';
import { APP_CONFIG } from '../../lib/constants';
import { Eye, ShieldAlert, Database, Sparkles, Heart } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { isAIApiConfigured } from '../../lib/aiVisionService';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-midnight-950 border-t border-midnight-800 text-slate-400 text-sm">
      {/* Top Banner Notice */}
      <div className="bg-midnight-900/60 border-b border-midnight-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldAlert size={15} className="text-amber-400 shrink-0" />
            <span>
              <strong>Civic Technology Prototype:</strong> CivicLens is an independent open-access platform. Reports are tracked within this demonstration system and are not directly routed to emergency 911 dispatchers.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] font-mono shrink-0">
            <span className="flex items-center gap-1">
              <Database size={11} className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'} />
              <span>DB: {isSupabaseConfigured ? 'Supabase Live' : 'Active Local Store'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} className={isAIApiConfigured ? 'text-electric-400' : 'text-cyan-400'} />
              <span>AI: {isAIApiConfigured ? 'Gemini 1.5 Flash' : 'Vision Classifier Engine'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center">
                <Eye className="w-4 h-4 text-midnight-950" />
              </div>
              <span className="font-extrabold text-lg text-white">Civic<span className="text-electric-500">Lens</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering communities with computer vision, interactive spatial mapping, and transparent civic accountability.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Build Version: {APP_CONFIG.version} (Hackathon Edition)
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-electric-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explorer')} className="hover:text-electric-400 transition-colors">
                  Public Issues Explorer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report')} className="hover:text-electric-400 transition-colors">
                  Report a Civic Problem
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('citizen-dashboard')} className="hover:text-electric-400 transition-colors">
                  Citizen Tracker
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-electric-400 transition-colors">
                  Smart City Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Report Categories</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('explorer')}>
                Road Hazards & Potholes
              </li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('explorer')}>
                Overflowing Waste & Illegal Dumping
              </li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('explorer')}>
                Water Line Leaks & Burst Mains
              </li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('explorer')}>
                Broken Streetlights & Electrical Safety
              </li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('explorer')}>
                Storm Drainage & Flood Prevention
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Civic Transparency</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every citizen submission is assigned a verifiable reference code. Progress timelines and public notes remain open for community inspection.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
              >
                Enter Administrator Portal →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-midnight-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CivicLens. Designed for civic impact and smart municipal innovation.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision for hackathon evaluation</span>
            <Heart size={13} className="text-rose-500 fill-rose-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
