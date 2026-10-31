import React, { useEffect, useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Activity, 
  AlertTriangle,
  Clock,
  Layers
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
  const [featuredReports, setFeaturedReports] = useState<Report[]>([]);

  useEffect(() => {
    ReportService.getCivicStats().then(setStats);
    ReportService.getReports().then((all) => setFeaturedReports(all.slice(0, 3)));
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-midnight-950 via-midnight-900 to-slate-900 text-white border-b border-midnight-800">
        {/* Decorative background grid and ambient glows */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1C2541_1px,transparent_1px),linear-gradient(to_bottom,#1C2541_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-500/15 border border-electric-500/30 text-electric-400 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={14} className="text-electric-400 animate-spin-slow" />
                <span>Next-Gen Smart City Problem Reporter</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Your City. <br />
                Your Voice. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-teal-200">
                  Real Change.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Spot a pothole, broken streetlight, or garbage pile? Snap a photo, let our AI classify the hazard, verify the location on an interactive map, and track progress until it gets resolved.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('report')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-extrabold text-base shadow-glow-teal hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Camera size={19} />
                  <span>Report an Issue Now</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  onClick={() => onNavigate('explorer')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-midnight-800/80 hover:bg-midnight-800 text-white font-semibold text-sm border border-midnight-700 hover:border-slate-600 transition-all"
                >
                  <MapPin size={17} className="text-electric-400" />
                  <span>Explore Reported Issues</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-midnight-800 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>AI Defect Classification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>OpenStreetMap GPS Verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Transparent Public Timeline</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-midnight-900/90 border border-midnight-700 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-midnight-800 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-400 font-semibold ml-2">Live Civic Stream</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-electric-400">
                    <span className="w-2 h-2 rounded-full bg-electric-400 animate-ping" />
                    Live Activity
                  </span>
                </div>

                {/* Mini interactive preview */}
                <div className="space-y-3">
                  {featuredReports[0] && (
                    <div className="relative rounded-2xl overflow-hidden border border-midnight-700 bg-midnight-950">
                      <img
                        src={featuredReports[0].image_path}
                        alt="Civic issue sample"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase bg-electric-500 text-midnight-950 font-bold px-2 py-0.5 rounded">
                            {featuredReports[0].reference_code}
                          </span>
                          <span className="text-[11px] text-amber-400 font-bold">In Remediation</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{featuredReports[0].title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">📍 {featuredReports[0].address}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Diagnosis Pill */}
                  <div className="p-3 rounded-2xl bg-midnight-800/80 border border-midnight-700/80 text-xs flex items-start gap-2.5">
                    <Sparkles size={16} className="text-electric-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">AI Vision Analysis Confirmed</div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Categorized with 94% confidence: Severe road cavity. Critical priority rating assigned.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL DATABASE METRICS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Activity size={14} className="text-electric-500" />
              <span>Total Submissions</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats?.total ?? 6}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Real-time database count</p>
          </div>

          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock size={14} className="text-amber-500" />
              <span>Active In-Progress</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500">
              {(stats?.in_progress ?? 0) + (stats?.under_review ?? 0)}
            </div>
            <p className="text-[11px] text-slate-500">Under municipal remediation</p>
          </div>

          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Resolved Issues</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500">
              {stats?.resolved ?? 1}
            </div>
            <p className="text-[11px] text-slate-500">Verified and closed</p>
          </div>

          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <AlertTriangle size={14} className="text-rose-500" />
              <span>Critical Hazards</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-500">
              {stats?.critical_count ?? 2}
            </div>
            <p className="text-[11px] text-slate-500">High priority flagged</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-electric-600 dark:text-electric-400">
            Intuitive 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How CivicLens Solves Local Problems
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No bureaucratic phone queues or lost paperwork. Just a direct, transparent pipeline from camera snapshot to completed fix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-midnight-950 text-electric-400 flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Capture the Issue</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Snap a quick photo with your phone or upload a clear picture of the street hazard or civic malfunction.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-midnight-950 text-electric-400 flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">AI Analyzes Image</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Vision models detect the defect category, assess severity, and draft an engineering summary. You can freely edit or override suggestions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-midnight-950 text-electric-400 flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Confirm Location</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Interactive Leaflet map pinpoints coordinates with 1-click GPS locate and reverse-geocoded street address confirmation.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-midnight-950 text-electric-400 flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Track the Resolution</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive a unique reference code, monitor dispatch milestones on the timeline, and verify work completion with community upvotes.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CIVIC CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-electric-600 dark:text-electric-400 mb-1">
              Scope of Coverage
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Reportable Civic Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="text-xs font-bold text-electric-600 hover:text-electric-700 flex items-center gap-1"
          >
            <span>View all reports across categories</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
            <div
              key={key}
              onClick={() => onNavigate('explorer')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-electric-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`p-2.5 rounded-xl border ${config.bgColor}`}>
                    <Layers size={18} />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-electric-600 transition-colors">
                    Explore →
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-electric-600 dark:group-hover:text-electric-400 transition-colors">
                  {config.label}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {config.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECENT VERIFIED REPORTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-electric-600 dark:text-electric-400 mb-1">
              Community Feed
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Recently Reported Problems
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            See All on Map
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSelect={(r) => onNavigate('details', r)}
            />
          ))}
        </div>
      </section>

      {/* 6. CITIZENS VS ADMIN BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-midnight-950 via-midnight-900 to-slate-900 border border-midnight-800 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Built for Communities. Optimized for Municipal Teams.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              CivicLens provides equal empowerment for engaged residents reporting neighborhood problems and civic administrators coordinating repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Citizens Column */}
            <div className="space-y-4 bg-midnight-900/60 border border-midnight-800 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 text-electric-400 font-bold text-base">
                <Users size={20} />
                <span>For Everyday Citizens</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-electric-400 shrink-0 mt-0.5" />
                  <span>Report in under 60 seconds with instant photo capture and AI suggestions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-electric-400 shrink-0 mt-0.5" />
                  <span>Receive a permanent reference code to check progress without calling a hotline.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-electric-400 shrink-0 mt-0.5" />
                  <span>Upvote and confirm existing reports nearby to raise civic visibility.</span>
                </li>
              </ul>
            </div>

            {/* Administrators Column */}
            <div className="space-y-4 bg-midnight-900/60 border border-midnight-800 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
                <ShieldCheck size={20} />
                <span>For Civic Operations & Admins</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Automated severity assessment and duplicate ticket consolidation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Role-protected dispatch workflow with internal technical notes and public updates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Export clean CSV datasets for municipal work-order systems and SLA analytics.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-electric-600 via-teal-500 to-electric-500 p-8 sm:p-12 text-midnight-950 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to improve your neighborhood?
            </h2>
            <p className="text-sm sm:text-base font-medium text-midnight-900/90">
              Submit your first report in less than a minute. Help make public roads safer and city spaces cleaner.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-midnight-950 hover:bg-midnight-900 text-white font-extrabold text-sm shadow-xl transition-all"
            >
              Report an Issue Now
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/30 hover:bg-white/40 text-midnight-950 font-bold text-sm backdrop-blur-sm transition-all"
            >
              Browse Public Registry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
