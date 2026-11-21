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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="delete-doc-title" className="text-base font-semibold text-slate-900">
            Delete Uploaded File
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-slate-900 break-all">{document.fileName}</span>?
          </p>
          {linkedEventsCount > 0 ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              This file is linked to{' '}
              <span className="font-mono font-semibold text-slate-900">{linkedEventsCount}</span>{' '}
              {linkedEventsCount === 1 ? 'confirmed event' : 'confirmed events'} in your timeline.
              Choose whether to remove or keep them.
            </p>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              No timeline events are currently linked to this file.
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {linkedEventsCount > 0 ? (
            <>
              <button
                type="button"
                onClick={() => onDeleteDocumentOnly(document.documentId)}
                className="px-4 py-2 text-sm font-medium text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                Keep Events
              </button>
              <button
                type="button"
                onClick={() => onDeleteWithLinkedEvents(document.documentId)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Remove Linked Events</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onDeleteDocumentOnly(document.documentId)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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
