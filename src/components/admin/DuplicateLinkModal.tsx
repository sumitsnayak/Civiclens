import React, { useState } from 'react';
import { Report } from '../../types';
import { X, Copy, CheckCircle2 } from 'lucide-react';

interface DuplicateLinkModalProps {
  report: Report;
  allReports: Report[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmDuplicate: (reportId: string, parentReportId: string) => Promise<void>;
}

export const DuplicateLinkModal: React.FC<DuplicateLinkModalProps> = ({
  report,
  allReports,
  isOpen,
  onClose,
  onConfirmDuplicate,
}) => {
  if (!isOpen) return null;

  const candidateReports = allReports.filter(
    (r) => r.id !== report.id && r.status !== 'rejected' && r.category === report.category
  );

  const [selectedParentId, setSelectedParentId] = useState<string>(
    candidateReports.length > 0 ? candidateReports[0].id : ''
  );
  const [isLinking, setIsLinking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) return;

    setIsLinking(true);
    try {
      await onConfirmDuplicate(report.id, selectedParentId);
      onClose();
    } catch (err) {
      console.error('Failed to link duplicate report:', err);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Copy size={18} className="text-electric-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Link Duplicate Report #{report.reference_code}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Consolidate this submission into an existing primary ticket of the same category ({report.category}).
            This marks #{report.reference_code} as resolved/duplicate and links community upvotes.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Primary Parent Ticket:
            </label>
            {candidateReports.length === 0 ? (
              <p className="text-xs text-amber-500">No other active reports found in this category.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {candidateReports.map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => setSelectedParentId(parent.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedParentId === parent.id
                        ? 'border-electric-500 bg-electric-500/10 ring-1 ring-electric-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>#{parent.reference_code}</span>
                      {selectedParentId === parent.id && <CheckCircle2 size={14} className="text-electric-500" />}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                      {parent.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      📍 {parent.address || 'Address registered'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLinking || !selectedParentId}
              className="px-5 py-2 rounded-xl bg-midnight-900 text-white text-xs font-bold hover:bg-midnight-800 transition-colors"
            >
              {isLinking ? 'Linking...' : 'Confirm Duplicate Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
