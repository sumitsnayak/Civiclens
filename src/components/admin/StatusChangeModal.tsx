import React, { useState } from 'react';
import { Report, ReportCategory, ReportSeverity, ReportStatus } from '../../types';
import { STATUS_CONFIG, CATEGORIES_CONFIG, SEVERITY_CONFIG } from '../../lib/constants';
import { X, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E2ED] rounded-3xl max-w-lg w-full shadow-[0_16px_36px_-4px_rgba(44,25,48,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0EDF5] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Update Ticket #{report.reference_code}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{report.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-[#F5F3F8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Status Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[11px]">
              Status Pipeline *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const isSelected = selectedStatus === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedStatus(key as ReportStatus)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      isSelected
                        ? 'border-[#442646] bg-[#442646] text-white shadow-xs'
                        : 'border-[#E7E2ED] bg-[#F5F4F8] text-slate-700 hover:bg-[#EDE8F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{config.label}</span>
                      {isSelected && <Check size={12} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Severity Tuning */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ReportCategory)}
                className="w-full px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] text-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              >
                {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as ReportSeverity)}
                className="w-full px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] text-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
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
            <label className="block font-bold text-slate-700 mb-1">
              Public Dispatch Note (Visible to citizens)
            </label>
            <textarea
              rows={2}
              value={publicMessage}
              onChange={(e) => setPublicMessage(e.target.value)}
              placeholder="e.g. Work crew deployed with asphalt repair equipment."
              className="w-full px-3.5 py-2.5 bg-[#F5F4F8] border border-[#E7E2ED] text-slate-900 placeholder-slate-400 rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
            />
          </div>

          {/* Internal Administration Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[11px]">
              Internal Dispatch Log (Restricted to staff)
            </label>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="e.g. Work Order #RD-8924 assigned to Municipal Team B."
              className="w-full px-3.5 py-2.5 bg-[#F5F4F8] border border-[#E7E2ED] text-[#8C4311] placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#F0EDF5] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E7E2ED] text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#442646] hover:bg-[#341B36] text-white font-bold shadow-xs hover:shadow-sm transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Apply Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
