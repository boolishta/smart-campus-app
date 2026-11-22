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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 shadow-xl overflow-hidden pb-safe">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
            <h2 id="purge-modal-title" className="text-base font-semibold text-zinc-950">
              Purge All Data (GDPR)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-sm text-zinc-700 leading-relaxed">
            This will permanently delete all uploaded file records, confirmed timeline events, and
            saved morning briefings from your browser&apos;s local storage.
          </p>
          <p className="text-xs font-medium text-red-600">This action cannot be undone.</p>
        </div>

        <div className="px-5 py-4 bg-zinc-50/80 border-t border-zinc-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmPurge}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Purge All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
