import React, { useState, useEffect } from 'react';
import { Report, ReportFilterOptions } from '../types';
import { ReportService } from '../lib/reportStore';
import { CivicMap } from '../components/map/CivicMap';
import { ReportCard } from '../components/report/ReportCard';
import { ReportFilters } from '../components/report/ReportFilters';
import { Map, Grid, LayoutList, Plus } from 'lucide-react';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Explore Reported Issues
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified municipal problems and maintenance requests across sectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-white p-1 rounded-xl flex items-center border border-[#E7E2ED] shadow-2xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'split' ? 'bg-[#442646] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList size={13} />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map' ? 'bg-[#442646] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Map size={13} />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-[#442646] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid size={13} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={onNavigateToReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#442646] hover:bg-[#341B36] text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-sm transition-all"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <ReportFilters
        filters={filters}
        onChange={setFilters}
        totalResults={reports.length}
      />

      {/* View Content */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-[#E7E2ED] shadow-[0_4px_24px_-2px_rgba(44,25,48,0.03)] bg-white sticky top-24">
            <CivicMap
              reports={reports}
              selectedReportId={selectedReportId}
              onSelectReport={(r) => {
                setSelectedReportId(r.id);
                onSelectReport(r);
              }}
              height="600px"
            />
          </div>

          {/* Right Column: Reports List */}
          <div className="lg:col-span-6 space-y-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onSelect={onSelectReport}
                  onUpvoteChange={handleUpvoteChange}
                />
              ))
            ) : (
              <div className="bg-white border border-[#E7E2ED] rounded-3xl p-12 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">No reports found.</p>
                <p className="text-xs text-slate-400">Try changing your filters or search keywords.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="rounded-3xl overflow-hidden border border-[#E7E2ED] shadow-[0_4px_24px_-2px_rgba(44,25,48,0.03)] bg-white">
          <CivicMap
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReport={(r) => {
              setSelectedReportId(r.id);
              onSelectReport(r);
            }}
            height="700px"
          />
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.length > 0 ? (
            reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onSelect={onSelectReport}
                onUpvoteChange={handleUpvoteChange}
              />
            ))
          ) : (
            <div className="col-span-full bg-white border border-[#E7E2ED] rounded-3xl p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">No reports found.</p>
              <p className="text-xs text-slate-400">Try changing your filters or search keywords.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
