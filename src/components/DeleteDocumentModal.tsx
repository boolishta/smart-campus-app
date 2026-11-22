import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { SourceDocument } from '../types';

interface DeleteDocumentModalProps {
  document: SourceDocument | null;
  linkedEventsCount: number;
  onClose: () => void;
  onDeleteDocumentOnly: (documentId: string) => void;
  onDeleteWithLinkedEvents: (documentId: string) => void;
}

export const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({
  document,
  linkedEventsCount,
  onClose,
  onDeleteDocumentOnly,
  onDeleteWithLinkedEvents,
}) => {
  if (!document) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-doc-title"
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
          <h2 id="delete-doc-title" className="text-base font-semibold text-zinc-950">
            Delete File
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          <p className="text-sm text-zinc-700 leading-relaxed">
            Remove{' '}
            <span className="font-semibold text-zinc-950 break-all">{document.fileName}</span>?
          </p>
          {linkedEventsCount > 0 ? (
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              This file is linked to{' '}
              <span className="font-mono font-semibold text-zinc-900">{linkedEventsCount}</span>{' '}
              {linkedEventsCount === 1 ? 'event' : 'events'} in your timeline.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              No timeline events are linked to this file.
            </p>
          )}
        </div>

        <div className="px-5 py-4 bg-zinc-50/80 border-t border-zinc-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          {linkedEventsCount > 0 ? (
            <>
              <button
                type="button"
                onClick={() => onDeleteDocumentOnly(document.documentId)}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
              >
                Keep Events
              </button>
              <button
                type="button"
                onClick={() => onDeleteWithLinkedEvents(document.documentId)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Remove All</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onDeleteDocumentOnly(document.documentId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Delete File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
