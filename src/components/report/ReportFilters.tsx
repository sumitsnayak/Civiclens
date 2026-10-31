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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Top Search & Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            placeholder="Search by title, location or code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        {/* Severity */}
        <div>
          <select
            value={filters.severity || 'all'}
            onChange={handleSeverityChange}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
          >
            <option value="all">All Severities</option>
            {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label} Priority
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
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
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest_priority">Sort: Highest Priority Score</option>
            <option value="most_upvoted">Sort: Most Civic Agreements</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
        <button
          type="button"
          onClick={() => handleCategorySelect('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            !filters.category || filters.category === 'all'
              ? 'bg-midnight-900 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Categories
        </button>

        {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
          const isSelected = filters.category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleCategorySelect(key as ReportCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-electric-500 text-midnight-950 shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{config.label}</span>
            </button>
          );
        })}

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Result Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{totalResults}</strong> civic{' '}
          {totalResults === 1 ? 'problem' : 'problems'}
        </span>
        {isFiltered && <span className="text-electric-600 font-medium">Filtered results</span>}
      </div>
    </div>
  );
};
