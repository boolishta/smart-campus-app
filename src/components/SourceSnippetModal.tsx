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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 shadow-xl overflow-hidden pb-safe">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="verify-source-title" className="text-base font-semibold text-zinc-950">
              Verified Source
            </h2>
            {documentName && (
              <p className="text-xs text-zinc-400 font-mono truncate mt-0.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{documentName}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close source verification"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-zinc-950">{event.title}</p>
            <p className="text-xs text-zinc-500 mt-1 font-mono tabular-nums">
              {formatDisplayDate(event.eventDate)} · {formatTimeRange(event.startTime, event.endTime)}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Verbatim quote from PDF
            </p>
            <blockquote className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-sm text-zinc-800 leading-relaxed">
              “{event.sourceSnippet}”
            </blockquote>
          </div>
        </div>

        <div className="px-5 py-4 bg-zinc-50/80 border-t border-zinc-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
