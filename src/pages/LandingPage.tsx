import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  MapPin, 
  ArrowRight, 
  Search, 
  Clock, 
  CheckCircle, 
  Camera,
  Sparkles,
  Map,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../lib/constants';
import { ReportService } from '../lib/reportStore';
import { CivicStats, Report } from '../types';
import { ReportCard } from '../components/report/ReportCard';

interface LandingPageProps {
  onNavigate: (tab: string, report?: Report) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<CivicStats | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    ReportService.getCivicStats().then(setStats);
    ReportService.getReports().then((all) => setRecentReports(all.slice(0, 3)));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explorer');
  };

  return (
    <div className="space-y-16 pb-24 bg-[#FAFAFC] text-slate-900">
      
      {/* 1. HERO SECTION: High-Performance Architectural Cockpit */}
      <section className="relative pt-12 pb-14 bg-gradient-to-b from-white via-white to-[#FAFAFC] border-b border-slate-200/80">
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Vision & Unified Command Capsule */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CF9E3C] animate-pulse" />
                <span className="text-slate-700 uppercase font-mono tracking-[0.16em]">MUNICIPAL RADAR GRID</span>
                <span className="text-[#CF9E3C] font-mono text-[10px] pl-1.5 border-l border-slate-300">LIVE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                See a Defect. <br />
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">Report.</span>{' '}
                <span className="bg-gradient-to-r from-[#CF9E3C] via-amber-400 to-[#CF9E3C] bg-clip-text text-transparent">Track. Resolve.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-normal">
                Empowering Mangalore citizens with instant AI vision triage, GPS geotagging, and a transparent resolution pipeline directly connected to municipal maintenance.
              </p>

              {/* Unified Command Capsule (No boxy separated buttons) */}
              <div className="pt-2 max-w-xl">
                <form 
                  onSubmit={handleSearchSubmit}
                  className="p-1.5 sm:p-2 bg-white rounded-full border border-slate-200/90 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.08)] flex items-center gap-2 transition-all focus-within:border-[#CF9E3C] focus-within:shadow-[0_12px_40px_-8px_rgba(207,158,60,0.22)]"
                >
                  <div className="pl-3 sm:pl-4 text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket ID, street, or issue..."
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  
                  <button
                    type="button"
                    onClick={() => onNavigate('explorer')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shrink-0"
                  >
                    <Map size={13} className="text-[#CF9E3C]" />
                    <span>Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('report')}
                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#CF9E3C] hover:bg-[#DBA946] text-black text-xs font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(207,158,60,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>Report</span>
                  </button>
                </form>

                {/* Telemetry Micro Indicators */}
                <div className="pt-3.5 flex flex-wrap items-center gap-5 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    AI Vision Analysis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CF9E3C]" />
                    Mangalore GIS Geotag
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Verified Municipal SLA
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Architectural Grey Telemetry Cockpit (Softened Color Intensity) */}
            <div className="lg:col-span-5 relative">
              {/* Subtle ambient aura */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-slate-200/60 to-slate-100/30 rounded-[32px] blur-xl opacity-60 pointer-events-none" />

              {/* Refined Grey Cockpit Frame */}
              <div className="relative rounded-[28px] bg-gradient-to-b from-[#F2F4F7] to-[#E5E9EE] border border-slate-300/80 p-4 sm:p-5 shadow-[0_14px_35px_-8px_rgba(0,0,0,0.06)] text-slate-900 overflow-hidden">
                {/* Telemetry Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#CF9E3C] animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600 font-bold">
                      LIVE DISPATCH STREAM
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 font-medium">
                    <span className="text-slate-700 font-bold">GPS:</span> 12.9141° N, 74.8560° E
                  </div>
                </div>

                {/* Defect Visual with Floating HUD Overlay */}
                <div className="relative mt-3 rounded-2xl overflow-hidden aspect-[16/10] bg-slate-200 border border-slate-300/80 group">
                  <img
                    src="/images/issues/pothole.jpg"
                    alt="Damaged asphalt road"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/issues/pothole.jpg';
                    }}
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none" />

                  {/* HUD Reference Tag & Severity (Muted Soft Intensity) */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md font-mono text-[10px] text-white border border-white/10 font-bold">
                      CVL-2026-8812
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-rose-200 border border-rose-400/30 text-[9px] font-bold uppercase tracking-wider">
                      Critical
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-[#CF9E3C]/40 text-[#E5B555] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CF9E3C] animate-pulse" />
                      In Remediation
                    </div>
                  </div>

                  {/* Bottom overlay info */}
                  <div className="absolute bottom-3 left-3 right-3 text-left text-white">
                    <div className="text-[10px] text-zinc-300 flex items-center gap-1 font-medium">
                      <MapPin size={11} className="text-[#CF9E3C]" />
                      <span>K.S. Rao Road, Mangalore, Karnataka</span>
                      <span className="ml-auto text-zinc-400">32m ago</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      Severe Road Cavity & Exposed Rebar
                    </div>
                  </div>
                </div>

                {/* Bottom Telemetry Metrics Strip */}
                <div className="mt-3 pt-3 border-t border-slate-200/90 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">City Works Dispatched</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px] font-bold">
                    <span>🔥 42 Citizens Confirmed</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CONTINUOUS TELEMETRY DOCK (Replaces 4 isolated boxes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-[28px] p-2 sm:p-3 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* Metric 1 */}
            <div className="p-4 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Registered</span>
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {stats?.total ?? 6}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Verified community submissions</div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  In Remediation
                </span>
                <div className="w-2 h-2 rounded-full bg-[#CF9E3C] animate-pulse" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-amber-700 tracking-tight mt-1">
                {(stats?.in_progress ?? 0) + (stats?.under_review ?? 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Active municipal work orders</div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={12} />
                  Resolved
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-emerald-700 tracking-tight mt-1">
                {stats?.resolved ?? 1}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Repaired & citizen confirmed</div>
            </div>

            {/* Metric 4 */}
            <div className="p-4 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Average Turnaround</span>
                <span className="text-[10px] font-mono font-bold text-[#CF9E3C] bg-amber-50 px-1.5 py-0.5 rounded">SLA</span>
              </div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {stats?.avg_resolution_days ?? 2.4} <span className="text-base sm:text-lg font-bold text-slate-500">Days</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">From triage to verified fix</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. RECENT COMMUNITY SUBMISSIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CF9E3C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CF9E3C]" />
              LIVE TELEMETRY FEED
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
              Recent Community Reports
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm group"
          >
            <span>View Full Issues Map</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSelect={(r) => onNavigate('details', r)}
            />
          ))}
        </div>
      </section>

      {/* 4. DYNAMIC PROCESS ROADMAP (Breaking out of 4 boxes inside a big box) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CF9E3C]">
            TRANSPARENT WORKFLOW
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            How CivicLens Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From identification to verified completion in four transparent steps
          </p>
        </div>

        {/* Connected Trajectory Pipeline */}
        <div className="relative">
          {/* Continuous tracking line on desktop */}
          <div className="hidden lg:block absolute top-7 left-14 right-14 h-[2px] bg-gradient-to-r from-slate-200 via-[#CF9E3C]/50 to-slate-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                step: '01',
                title: 'Capture Defect',
                desc: 'Snap or upload a photo of the road cavity, garbage heap, or water leakage.',
                icon: Camera,
              },
              {
                step: '02',
                title: 'AI Vision Triage',
                desc: 'Official BharatCode vision model classifies defect category and severity rating.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Pin Mangalore GPS',
                desc: 'Pinpoint precise location on the interactive map with reverse-geocoding.',
                icon: MapPin,
              },
              {
                step: '04',
                title: 'Track Resolution',
                desc: 'Monitor live status changes from Review to Dispatch and verified completion.',
                icon: CheckCircle,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex flex-col items-center text-center group">
                  {/* Floating Milestone Node */}
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.05)] flex items-center justify-center text-slate-900 group-hover:border-[#CF9E3C] group-hover:shadow-[0_8px_30px_rgba(207,158,60,0.22)] transition-all duration-300 relative">
                    <Icon size={20} className="text-slate-700 group-hover:text-[#CF9E3C] transition-colors" />
                    <span className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold group-hover:bg-[#CF9E3C] group-hover:text-black transition-colors shadow-xs">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-4 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5 max-w-[220px]">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SUPPORTED PROBLEM CATEGORIES (Organic Floating Capsule Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CF9E3C]">
              MUNICIPAL TAXONOMY
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Supported Problem Categories
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Directly routed to municipal engineering departments
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {Object.entries(CATEGORIES_CONFIG).map(([key, item]) => (
            <button
              key={key}
              onClick={() => onNavigate('explorer')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#CF9E3C]/60 rounded-2xl text-left shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_rgba(207,158,60,0.12)] hover:-translate-y-0.5 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="font-bold text-slate-900 text-xs group-hover:text-[#CF9E3C] transition-colors">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {item.description}
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};
