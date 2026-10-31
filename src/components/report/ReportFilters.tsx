import React from 'react';
import { ReportCategory, ReportFilterOptions, ReportSeverity, ReportStatus } from '../../types';
import { CATEGORIES_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../../lib/constants';
import { Search, RotateCcw } from 'lucide-react';

interface ReportFiltersProps {
  filters: ReportFilterOptions;
  onChange: (filters: ReportFilterOptions) => void;
  totalResults: number;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCategorySelect = (category: ReportCategory | 'all') => {
    onChange({ ...filters, category });
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, severity: e.target.value as ReportSeverity | 'all' });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value as ReportStatus | 'all' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sortBy: e.target.value as any });
  };

  const handleReset = () => {
    onChange({
      searchQuery: '',
      category: 'all',
      severity: 'all',
      status: 'all',
      sortBy: 'newest',
    });
  };

  const isFiltered =
    Boolean(filters.searchQuery) ||
    filters.category !== 'all' ||
    filters.severity !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-3">
      {/* Top Search & Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            placeholder="Search by title, location or reference code..."
            className="w-full pl-8 pr-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white transition-all"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        {/* Category */}
        <div>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleCategorySelect(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white transition-all"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white transition-all"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={filters.sortBy || 'newest'}
            onChange={handleSortChange}
            className="w-full px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="priority">Highest Priority</option>
            <option value="most_upvoted">Most Agreed</option>
          </select>
        </div>
      </div>

      {/* Category Pills & Count Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2EEF6]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filters.category === 'all'
                ? 'bg-[#442646] text-white shadow-2xs'
                : 'bg-[#F5F4F8] text-slate-600 hover:bg-[#EDE8F2]'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleCategorySelect(key as ReportCategory)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                filters.category === key
                  ? 'bg-[#442646] text-white font-bold shadow-2xs'
                  : 'bg-[#F5F4F8] text-slate-600 hover:bg-[#EDE8F2]'
              }`}
            >
              #{config.label.toLowerCase().replace(/[^a-z0-9]/g, '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            {totalResults} {totalResults === 1 ? 'Report' : 'Reports'} Found
          </span>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#552B58] hover:text-[#381B3B]"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
