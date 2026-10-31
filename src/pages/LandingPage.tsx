import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  MapPin, 
  ArrowRight, 
  Search, 
  Clock, 
  CheckCircle, 
  ThumbsUp,
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
    <div className="space-y-12 pb-20 bg-[#F5F4F8] text-slate-900">
      {/* 1. HERO SECTION (Dribbble Studio Clean) */}
      <section className="pt-10 pb-12 bg-white border-b border-[#E7E2ED] shadow-[0_2px_14px_rgba(44,25,48,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE5F0] text-[#552B58] border border-[#DFCEE2] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#824987] animate-pulse"></span>
                <span>Active Community Reporting Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                See a Problem. <br />
                <span className="text-[#552B58]">Report It. Track the Change.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
                Report road potholes, sanitation hazards, broken streetlights, and drainage issues. Snap a photo, verify the location on an interactive map, and track repairs until resolution.
              </p>

              {/* Fast Search & Action Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticket ID, street address, or issue..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white transition-all shadow-2xs"
                  />
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                </form>

                <button
                  onClick={() => onNavigate('report')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#442646] hover:bg-[#341B36] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
                >
                  <Plus size={15} className="stroke-[2.5]" />
                  <span>Report an Issue</span>
                </button>

                <button
                  onClick={() => onNavigate('explorer')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#E7E2ED] hover:bg-[#F5F3F8] text-slate-700 text-xs font-semibold transition-all shrink-0 shadow-2xs"
                >
                  <MapPin size={14} className="text-[#552B58]" />
                  <span>Explore Map</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex items-center gap-6 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Photo Verification
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  GPS Coordinate Pinning
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Open Resolution Pipeline
                </span>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-[#FAF9FC] border border-[#E7E2ED] rounded-3xl p-5 shadow-[0_12px_32px_-4px_rgba(44,25,48,0.06)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EDEAF2]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[11px] font-bold text-slate-700 ml-1.5">Live Dispatch Stream</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDE5F0] text-[#552B58]">
                    Real-time
                  </span>
                </div>

                {/* Hero Showcase Card */}
                <div className="rounded-2xl overflow-hidden border border-[#E7E2ED] bg-white shadow-2xs">
                  <div className="relative aspect-video w-full bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" 
                      alt="Damaged asphalt road" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
                      CVL-2026-8812
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#EDE5F0] text-[#552B58] text-[10px] font-bold border border-[#DFCEE2]">
                      In Remediation
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-500">📍 Market St & 2nd St, CA</span>
                      <span className="text-[11px] text-slate-400">32m ago</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Severe Road Cavity & Exposed Rebar
                    </h4>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F5F3F8]">
                      <span className="text-emerald-700 font-medium">✓ Acknowledged by City Works</span>
                      <span className="font-bold text-[#552B58]">👍 42 Citizens Agreed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold text-slate-500">Total Registered</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats?.total ?? 6}</div>
            <div className="text-[11px] text-slate-400 mt-1">Verified community submissions</div>
          </div>

          <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-[#B55D1C] flex items-center gap-1">
              <Clock size={12} />
              <span>In Remediation</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#B55D1C] mt-1">
              {(stats?.in_progress ?? 0) + (stats?.under_review ?? 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Active municipal work orders</div>
          </div>

          <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-[#247A48] flex items-center gap-1">
              <CheckCircle size={12} />
              <span>Resolved</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#247A48] mt-1">
              {stats?.resolved ?? 1}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Repaired & citizen confirmed</div>
          </div>

          <div className="bg-white border border-[#E7E2ED] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold text-slate-500">Average Turnaround</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {stats?.avg_resolution_days ?? 2.4} Days
            </div>
            <div className="text-[11px] text-slate-400 mt-1">From triage to completion</div>
          </div>
        </div>
      </section>

      {/* 3. RECENT COMMUNITY SUBMISSIONS (Dribbble Complaint Feed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Community Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live submissions from citizens currently in review or dispatch
            </p>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="text-xs font-bold text-[#552B58] hover:text-[#381B3B] flex items-center gap-1 transition-colors"
          >
            <span>View All Issues</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSelect={(r) => onNavigate('details', r)}
            />
          ))}
        </div>
      </section>

      {/* 4. FOUR STEP PROCESS (How It Works) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 sm:p-10 shadow-[0_4px_24px_-2px_rgba(44,25,48,0.03)] space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              How CivicLens Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From identification to verified completion in four transparent steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE5F0] text-[#552B58] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Capture Photo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take or upload a clear photo of the pothole, trash accumulation, or streetlight issue.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE5F0] text-[#552B58] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Smart Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vision analysis suggests category and severity, with full citizen review and manual override.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE5F0] text-[#552B58] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Confirm Location</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pinpoint the exact location on an interactive OpenStreetMap with GPS reverse-geocoding.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE5F0] text-[#552B58] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Track Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow the transparent pipeline from Reported to Under Review, In Progress, and Resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Supported Problem Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized issue types routed directly to municipal maintenance teams
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(CATEGORIES_CONFIG).map(([key, item]) => (
            <button
              key={key}
              onClick={() => onNavigate('explorer')}
              className="p-4 bg-white border border-[#E7E2ED] hover:border-[#D3CADB] rounded-2xl text-left shadow-2xs hover:shadow-sm transition-all group"
            >
              <div className="text-xl mb-1.5">{item.icon}</div>
              <div className="font-bold text-slate-900 text-xs group-hover:text-[#552B58] transition-colors">
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
