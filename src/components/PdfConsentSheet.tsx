import React from 'react';
import { X, FileText, ShieldCheck } from 'lucide-react';
import { formatFileSize } from '../utils/dateUtils';

interface PdfConsentSheetProps {
  file: File | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PdfConsentSheet: React.FC<PdfConsentSheetProps> = ({
  file,
  onCancel,
  onConfirm,
}) => {
  if (!file) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-consent-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 shadow-xl overflow-hidden pb-safe">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h2 id="pdf-consent-title" className="text-base font-semibold text-zinc-950">
            Extract Deadlines with AI
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel PDF upload"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selected file pill */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-zinc-700" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-zinc-500 font-mono tabular-nums">
                PDF · {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-zinc-600 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Text is extracted on your device and personal identifiers (emails, student IDs) are
              scrubbed locally before sending anonymized text to GenAI. Extracted dates appear as
              temporary drafts first.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 bg-zinc-50/80 border-t border-zinc-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Consent &amp; Extract PDF
          </button>
        </div>
      </div>
    </div>
  );
};
