import React from 'react';
import { X, FileText, Pencil } from 'lucide-react';
import { AcademicEvent } from '../types';
import { formatDisplayDate, formatTimeRange } from '../utils/dateUtils';

interface SourceSnippetModalProps {
  event: AcademicEvent | null;
  documentName: string | null;
  onClose: () => void;
  onEditEvent: (event: AcademicEvent) => void;
}

export const SourceSnippetModal: React.FC<SourceSnippetModalProps> = ({
  event,
  documentName,
  onClose,
  onEditEvent,
}) => {
  if (!event || !event.sourceSnippet) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-source-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 id="verify-source-title" className="text-base font-semibold text-slate-900">
              Verify Source
            </h2>
            {documentName && (
              <p className="text-xs text-slate-500 font-mono truncate mt-0.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{documentName}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close source verification"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-900">{event.title}</p>
            <p className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
              {formatDisplayDate(event.eventDate)} · {formatTimeRange(event.startTime, event.endTime)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">
              Verbatim quote from PDF
            </p>
            <blockquote className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-slate-900 leading-relaxed">
              “{event.sourceSnippet}”
            </blockquote>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              const target = event;
              onClose();
              onEditEvent(target);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
