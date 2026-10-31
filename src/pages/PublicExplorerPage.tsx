import React, { useState, useEffect } from 'react';
import { Report, ReportFilterOptions } from '../types';
import { ReportService } from '../lib/reportStore';
import { CivicMap } from '../components/map/CivicMap';
import { ReportCard } from '../components/report/ReportCard';
import { ReportFilters } from '../components/report/ReportFilters';
import { Map, Grid, LayoutList, PlusCircle } from 'lucide-react';

interface PublicExplorerPageProps {
  onSelectReport: (report: Report) => void;
  onNavigateToReport: () => void;
}

export const PublicExplorerPage: React.FC<PublicExplorerPageProps> = ({
  onSelectReport,
  onNavigateToReport,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<ReportFilterOptions>({
    category: 'all',
    severity: 'all',
    status: 'all',
    sortBy: 'newest',
    searchQuery: '',
  });
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'cards'>('split');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    const list = await ReportService.getReports(filters);
    setReports(list);
  };

  const handleUpvoteChange = (id: string, newCount: number, hasUpvoted: boolean) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes_count: newCount, has_upvoted: hasUpvoted } : r))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Public Civic Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, inspect, and confirm active municipal issues in your neighborhood
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle buttons */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutList size={14} />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Map size={14} />
              <span className="hidden sm:inline">Full Map</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={onNavigateToReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-electric-500 hover:bg-electric-400 text-midnight-950 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">New Report</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <ReportFilters
        filters={filters}
        onChange={setFilters}
        totalResults={reports.length}
      />

      {/* VIEW MODES */}

      {/* 1. SPLIT VIEW: Map at top/side, cards grid */}
      {viewMode === 'split' && (
        <div className="space-y-6">
          <CivicMap
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReport={(r) => {
              setSelectedReportId(r.id);
              onSelectReport(r);
            }}
            height="400px"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onSelect={(r) => {
                  setSelectedReportId(r.id);
                  onSelectReport(r);
                }}
                onUpvoteChange={handleUpvoteChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. FULL MAP VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <CivicMap
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReport={(r) => {
              setSelectedReportId(r.id);
              onSelectReport(r);
            }}
            height="650px"
          />
        </div>
      )}

      {/* 3. CARDS GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSelect={(r) => onSelectReport(r)}
              onUpvoteChange={handleUpvoteChange}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Map size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No matching civic reports found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing filters to view all recorded municipal reports.
          </p>
          <button
            onClick={() =>
              setFilters({
                category: 'all',
                severity: 'all',
                status: 'all',
                sortBy: 'newest',
                searchQuery: '',
              })
            }
            className="px-4 py-2 rounded-xl bg-midnight-900 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
