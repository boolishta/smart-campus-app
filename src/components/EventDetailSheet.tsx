import React from 'react';
import { X, Calendar, Clock, FileText, Pencil, Trash2 } from 'lucide-react';
import { AcademicEvent, AcademicEventType, EventPriority } from '../types';
import {
  formatDisplayDate,
  formatTimeRange,
  getCountdownInfo,
  getTodayIsoDate,
} from '../utils/dateUtils';

interface EventDetailSheetProps {
  event: AcademicEvent | null;
  documentName: string | null;
  onClose: () => void;
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
}

const TYPE_LABELS: Record<AcademicEventType, string> = {
  EXAM: 'Exam',
  ASSIGNMENT: 'Assignment',
  LAB: 'Lab',
  LECTURE: 'Lecture',
  OTHER: 'Other',
};

const PRIORITY_STYLES: Record<EventPriority, string> = {
  HIGH: 'text-red-700 bg-red-50',
  MEDIUM: 'text-amber-700 bg-amber-50',
  LOW: 'text-zinc-600 bg-zinc-100',
};

const PRIORITY_LABELS: Record<EventPriority, string> = {
  HIGH: 'High priority',
  MEDIUM: 'Medium priority',
  LOW: 'Low priority',
};

export const EventDetailSheet: React.FC<EventDetailSheetProps> = ({
  event,
  documentName,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!event) return null;

  const countdown = getCountdownInfo(event.eventDate, getTodayIsoDate());

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 shadow-xl overflow-hidden pb-safe">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                {TYPE_LABELS[event.eventType]}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  PRIORITY_STYLES[event.priority]
                }`}
              >
                {PRIORITY_LABELS[event.priority]}
              </span>
              {countdown.tone === 'overdue' && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                  {countdown.label}
                </span>
              )}
            </div>
            <h2 id="event-detail-title" className="text-lg font-semibold text-zinc-950 leading-snug">
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-2 text-sm text-zinc-600">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
              <span>{formatDisplayDate(event.eventDate)}</span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs text-zinc-500">{countdown.label}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
              <span className="font-mono text-xs tabular-nums">
                {formatTimeRange(event.startTime, event.endTime)}
              </span>
            </div>
            {documentName && (
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono text-zinc-500 truncate">{documentName}</span>
              </div>
            )}
          </div>

          {event.sourceSnippet && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Verified source quote
              </p>
              <blockquote className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs sm:text-sm text-zinc-800 leading-relaxed">
                “{event.sourceSnippet}”
              </blockquote>
            </div>
          )}
        </div>

        <div className="px-5 py-4 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              const id = event.eventId;
              onClose();
              onDelete(id);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Delete</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const target = event;
              onClose();
              onEdit(target);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
