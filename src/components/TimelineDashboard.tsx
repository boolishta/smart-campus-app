import React, { useMemo, useState } from 'react';
import {
  Plus,
  Upload,
  Search,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  AcademicEvent,
  AcademicEventType,
  DailyBriefing,
  EventPriority,
  SourceDocument,
} from '../types';
import {
  formatDisplayDate,
  formatFileSize,
  formatTimeRange,
  getCountdownInfo,
  getTodayIsoDate,
  sortEventsChronologically,
} from '../utils/dateUtils';
import { MorningBriefingCard } from './MorningBriefingCard';

interface TimelineDashboardProps {
  documents: SourceDocument[];
  confirmedEvents: AcademicEvent[];
  todayBriefing: DailyBriefing | null;
  isGeneratingBriefing: boolean;
  simulateOfflineError: boolean;
  onGenerateBriefing: () => void;
  onNavigateToUpload: () => void;
  onLoadSampleData: () => void;
  onOpenAddEvent: () => void;
  onOpenEditEvent: (event: AcademicEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onVerifySource: (event: AcademicEvent) => void;
  onRequestDeleteDocument: (doc: SourceDocument) => void;
}

const FILTER_OPTIONS: Array<{ value: 'ALL' | AcademicEventType; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'EXAM', label: 'Exams' },
  { value: 'ASSIGNMENT', label: 'Assignments' },
  { value: 'LAB', label: 'Labs' },
  { value: 'LECTURE', label: 'Lectures' },
  { value: 'OTHER', label: 'Other' },
];

const TYPE_LABELS: Record<AcademicEventType, string> = {
  EXAM: 'Exam',
  ASSIGNMENT: 'Assignment',
  LAB: 'Lab',
  LECTURE: 'Lecture',
  OTHER: 'Other',
};

const PRIORITY_STYLES: Record<EventPriority, string> = {
  HIGH: 'text-red-700 bg-red-50 border-red-200',
  MEDIUM: 'text-amber-800 bg-amber-50 border-amber-200',
  LOW: 'text-slate-700 bg-slate-100 border-slate-200',
};

const COUNTDOWN_STYLES = {
  overdue: 'text-red-700 bg-red-50 border-red-200',
  today: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  soon: 'text-amber-800 bg-amber-50 border-amber-200',
  upcoming: 'text-slate-600 bg-slate-100 border-slate-200',
};

export const TimelineDashboard: React.FC<TimelineDashboardProps> = ({
  documents,
  confirmedEvents,
  todayBriefing,
  isGeneratingBriefing,
  simulateOfflineError,
  onGenerateBriefing,
  onNavigateToUpload,
  onLoadSampleData,
  onOpenAddEvent,
  onOpenEditEvent,
  onDeleteEvent,
  onVerifySource,
  onRequestDeleteDocument,
}) => {
  const [typeFilter, setTypeFilter] = useState<'ALL' | AcademicEventType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayIso = getTodayIsoDate();
  const sortedEvents = useMemo(
    () => sortEventsChronologically(confirmedEvents),
    [confirmedEvents]
  );

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedEvents.filter((evt) => {
      if (typeFilter !== 'ALL' && evt.eventType !== typeFilter) return false;
      if (q && !evt.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sortedEvents, typeFilter, searchQuery]);

  const docNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of documents) {
      map.set(doc.documentId, doc.fileName);
    }
    return map;
  }, [documents]);

  const linkedCountByDocId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const evt of confirmedEvents) {
      if (evt.documentId) {
        counts.set(evt.documentId, (counts.get(evt.documentId) ?? 0) + 1);
      }
    }
    return counts;
  }, [confirmedEvents]);

  return (
    <div className="space-y-6">
      {/* Daily Morning Briefing (08:00 AM) */}
      <MorningBriefingCard
        confirmedEvents={confirmedEvents}
        todayBriefing={todayBriefing}
        isGenerating={isGeneratingBriefing}
        simulateOfflineError={simulateOfflineError}
        onGenerateBriefing={onGenerateBriefing}
        onNavigateToUpload={onNavigateToUpload}
        onVerifySource={onVerifySource}
      />

      {/* Main Workspace Grid: Timeline (8 cols) + Uploaded Files (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Unified Dynamic Timeline */}
        <section className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Academic Timeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {confirmedEvents.length}{' '}
                {confirmedEvents.length === 1 ? 'confirmed event' : 'confirmed events'} stored
                locally
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onNavigateToUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddEvent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          {confirmedEvents.length === 0 ? (
            /* Clean Empty State with Optional Load Sample Data */
            <div className="px-6 py-12 text-center space-y-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-semibold text-slate-900">
                  Your timeline is empty
                </h3>
                <p className="text-sm text-slate-600">
                  Upload a course syllabus (.pdf) or timetable (.ics), add an event manually, or
                  load sample data to explore the planner.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onNavigateToUpload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>Upload .pdf or .ics</span>
                </button>
                <button
                  type="button"
                  onClick={onLoadSampleData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span>Load Sample Data</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filter & Search Bar */}
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTypeFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        typeFilter === opt.value
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56 shrink-0">
                  <Search
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter events..."
                    aria-label="Filter timeline events"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Chronological Event List */}
              {filteredEvents.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No events match your current filter.
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {filteredEvents.map((evt) => {
                    const countdown = getCountdownInfo(evt.eventDate, todayIso);
                    const sourceDocName = evt.documentId ? docNameById.get(evt.documentId) : null;

                    return (
                      <li
                        key={evt.eventId}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{evt.title}</h3>
                            <span
                              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border tabular-nums ${
                                COUNTDOWN_STYLES[countdown.tone]
                              }`}
                            >
                              {countdown.label}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                PRIORITY_STYLES[evt.priority]
                              }`}
                            >
                              {evt.priority}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                            <span className="font-medium text-slate-700">
                              {TYPE_LABELS[evt.eventType]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatDisplayDate(evt.eventDate)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatTimeRange(evt.startTime, evt.endTime)}
                            </span>
                            {sourceDocName && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-slate-500 truncate max-w-[200px]">
                                  {sourceDocName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {evt.sourceSnippet && (
                            <button
                              type="button"
                              onClick={() => onVerifySource(evt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                            >
                              <Search className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                              <span>Verify Source</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenEditEvent(evt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(evt.eventId)}
                            aria-label={`Delete ${evt.title}`}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </section>

        {/* Uploaded Files Panel */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Uploaded Files</h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {documents.length} {documents.length === 1 ? 'source file' : 'source files'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
            >
              + Upload
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                No .pdf or .ics files uploaded yet. Confirmed imports appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {documents.map((doc) => {
                const linkedCount = linkedCountByDocId.get(doc.documentId) ?? 0;
                return (
                  <li
                    key={doc.documentId}
                    className="px-5 py-3.5 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {doc.fileType === 'PDF' ? (
                          <FileText
                            className="w-4 h-4 text-red-600 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Calendar
                            className="w-4 h-4 text-indigo-600 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <p
                          className="text-sm font-medium text-slate-900 truncate"
                          title={doc.fileName}
                        >
                          {doc.fileName}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 font-mono tabular-nums">
                        {doc.fileType} · {formatFileSize(doc.fileSizeBytes)} ·{' '}
                        {linkedCount} {linkedCount === 1 ? 'event' : 'events'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRequestDeleteDocument(doc)}
                      aria-label={`Delete ${doc.fileName}`}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};
