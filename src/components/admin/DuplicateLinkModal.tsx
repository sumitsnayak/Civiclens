import React, { useState } from 'react';
import { Report } from '../../types';
import { X, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E2ED] rounded-3xl max-w-md w-full shadow-[0_16px_36px_-4px_rgba(44,25,48,0.15)] overflow-hidden text-xs">
        <div className="px-6 py-4 border-b border-[#F0EDF5] flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Link Duplicate Ticket #{report.reference_code}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-[#F5F3F8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-slate-600 leading-relaxed">
            Consolidate this submission into an existing primary ticket of the same category ({report.category}).
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[11px]">
              Select Primary Parent Ticket:
            </label>
            {candidateReports.length === 0 ? (
              <p className="text-[#B55D1C] font-medium">No other active reports found in this category.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {candidateReports.map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => setSelectedParentId(parent.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedParentId === parent.id
                        ? 'border-[#442646] bg-[#442646] text-white shadow-xs'
                        : 'border-[#E7E2ED] bg-[#F5F4F8] text-slate-800 hover:bg-[#EDE8F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                      <span>#{parent.reference_code}</span>
                      {selectedParentId === parent.id && <Check size={13} />}
                    </div>
                    <div className="truncate mt-0.5 font-medium">{parent.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F0EDF5] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E7E2ED] text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLinking || !selectedParentId}
              className="px-5 py-2 rounded-xl bg-[#442646] text-white font-bold hover:bg-[#341B36] transition-colors shadow-xs"
            >
              {isLinking ? 'Linking...' : 'Confirm Duplicate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
