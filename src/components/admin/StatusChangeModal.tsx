import React, { useState } from 'react';
import { Report, ReportCategory, ReportSeverity, ReportStatus } from '../../types';
import { STATUS_CONFIG, CATEGORIES_CONFIG, SEVERITY_CONFIG } from '../../lib/constants';
import { X, CheckCircle, AlertTriangle, ShieldCheck, MessageSquare, Lock } from 'lucide-react';

interface StatusChangeModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    newStatus: ReportStatus,
    publicMessage?: string,
    internalNote?: string,
    newCategory?: ReportCategory,
    newSeverity?: ReportSeverity
  ) => Promise<void>;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  report,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(report.status);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(report.category);
  const [selectedSeverity, setSelectedSeverity] = useState<ReportSeverity>(report.severity);
  const [publicMessage, setPublicMessage] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(
        selectedStatus,
        publicMessage.trim() || undefined,
        internalNote.trim() || undefined,
        selectedCategory,
        selectedSeverity
      );
      onClose();
    } catch (err) {
      console.error('Failed to update report status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Manage Ticket #{report.reference_code}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-sm">{report.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Update Status Workflow *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const isSelected = selectedStatus === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedStatus(key as ReportStatus)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'border-electric-500 bg-electric-500/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-electric-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{config.label}</span>
                      {isSelected && <CheckCircle size={14} className="text-electric-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Severity Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ReportCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-electric-500"
              >
                {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Severity Level
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as ReportSeverity)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-electric-500"
              >
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Public Progress Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <MessageSquare size={14} className="text-electric-500" />
              <span>Public Citizen Update (Visible on Report Timeline)</span>
            </label>
            <textarea
              rows={2}
              value={publicMessage}
              onChange={(e) => setPublicMessage(e.target.value)}
              placeholder="e.g. Work crew dispatched to clear drain grate. Estimated completion by tomorrow morning."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
            />
          </div>

          {/* Internal Administration Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Lock size={14} className="text-amber-500" />
              <span>Internal Administrative Note (Staff & Dispatch Only)</span>
            </label>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="e.g. Work Order #RD-492 assigned to Team Charlie; asphalt material requisition approved."
              className="w-full px-3 py-2 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 dark:bg-electric-500 dark:hover:bg-electric-400 dark:text-midnight-950 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Apply Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
