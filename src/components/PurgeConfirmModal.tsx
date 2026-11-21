import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface PurgeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurge: () => void;
}

export const PurgeConfirmModal: React.FC<PurgeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmPurge,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="purge-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
            <h2 id="purge-modal-title" className="text-base font-semibold text-slate-900">
              Purge All Data (GDPR)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-2.5">
          <p className="text-sm text-slate-700 leading-relaxed">
            This will permanently delete all uploaded file records, confirmed timeline events, and
            saved daily morning briefings from your browser&apos;s local storage.
          </p>
          <p className="text-xs font-medium text-red-700">
            This action cannot be undone.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmPurge}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Purge All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
