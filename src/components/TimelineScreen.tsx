import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  X,
  Calendar,
  Upload,
  Sparkles,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { AcademicEvent, AcademicEventType, EventPriority } from '../types';
import {
  formatDisplayDate,
  formatTimeRange,
  getDaysFromToday,
  getTodayIsoDate,
  sortEventsChronologically,
} from '../utils/dateUtils';

interface TimelineScreenProps {
  confirmedEvents: AcademicEvent[];
  onNavigateToDocuments: () => void;
  onLoadSampleData: () => void;
  onOpenAddEvent: () => void;
  onSelectEvent: (event: AcademicEvent) => void;
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

const PRIORITY_BAR: Record<EventPriority, string> = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-zinc-300',
};

interface EventGroup {
  key: string;
  label: string;
  tone?: 'overdue' | 'today' | 'default';
  events: AcademicEvent[];
}

function groupEventsByTimeframe(events: AcademicEvent[], todayIso: string): EventGroup[] {
  const overdue: AcademicEvent[] = [];
  const today: AcademicEvent[] = [];
  const tomorrow: AcademicEvent[] = [];
  const thisWeek: AcademicEvent[] = [];
  const upcoming: AcademicEvent[] = [];

  for (const evt of events) {
    const diff = getDaysFromToday(evt.eventDate, todayIso);
    if (diff < 0) overdue.push(evt);
    else if (diff === 0) today.push(evt);
    else if (diff === 1) tomorrow.push(evt);
    else if (diff <= 7) thisWeek.push(evt);
    else upcoming.push(evt);
  }

  const groups: EventGroup[] = [];
  if (overdue.length > 0) {
    groups.push({ key: 'overdue', label: 'Overdue', tone: 'overdue', events: overdue });
  }
  if (today.length > 0) {
    groups.push({ key: 'today', label: 'Today', tone: 'today', events: today });
  }
  if (tomorrow.length > 0) {
    groups.push({ key: 'tomorrow', label: 'Tomorrow', tone: 'default', events: tomorrow });
  }
  if (thisWeek.length > 0) {
    groups.push({ key: 'week', label: 'Next 7 Days', tone: 'default', events: thisWeek });
  }
  if (upcoming.length > 0) {
    groups.push({ key: 'upcoming', label: 'Upcoming', tone: 'default', events: upcoming });
  }

  return groups;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  confirmedEvents,
  onNavigateToDocuments,
  onLoadSampleData,
  onOpenAddEvent,
  onSelectEvent,
}) => {
  const [typeFilter, setTypeFilter] = useState<'ALL' | AcademicEventType>('ALL');
  const [searchOpen, setSearchOpen] = useState(false);
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

  const groups = useMemo(
    () => groupEventsByTimeframe(filteredEvents, todayIso),
    [filteredEvents, todayIso]
  );

  return (
    <div className="space-y-5">
      {/* Screen Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Timeline</h1>
          <p className="text-xs text-zinc-400 mt-0.5 tabular-nums">
            {confirmedEvents.length} {confirmedEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {confirmedEvents.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => {
                  if (prev) setSearchQuery('');
                  return !prev;
                });
              }}
              aria-label={searchOpen ? 'Close search' : 'Search events'}
              className={`w-9 h-9 inline-flex items-center justify-center rounded-xl transition-colors ${
                searchOpen
                  ? 'bg-zinc-950 text-white'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          )}

          {/* Desktop Add button (mobile uses FAB below) */}
          <button
            type="button"
            onClick={onOpenAddEvent}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {confirmedEvents.length === 0 ? (
        <section className="bg-white rounded-2xl border border-zinc-200/80 px-6 py-12 text-center space-y-5">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h2 className="text-base font-semibold text-zinc-950">Your timeline is empty</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Import a syllabus or timetable, add an event manually, or explore with sample data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onNavigateToDocuments}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Upload .pdf or .ics</span>
            </button>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-zinc-500" aria-hidden="true" />
              <span>Load Sample Data</span>
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Collapsible Search */}
          {searchOpen && (
            <div className="relative">
              <Search
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exams, assignments, lectures…"
                aria-label="Filter timeline events"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {FILTER_OPTIONS.map((opt) => {
              const active = typeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTypeFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-zinc-950 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200/80 hover:border-zinc-300 hover:text-zinc-950'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Grouped Events */}
          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200/80 px-6 py-10 text-center text-sm text-zinc-400">
              No events match your filter.
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section key={group.key} className="space-y-2">
                  <h2
                    className={`text-xs font-semibold uppercase tracking-wider px-1 ${
                      group.tone === 'overdue'
                        ? 'text-red-600'
                        : group.tone === 'today'
                        ? 'text-zinc-950'
                        : 'text-zinc-400'
                    }`}
                  >
                    {group.label}
                  </h2>

                  <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
                    {group.events.map((evt) => {
                      const showShortDate =
                        group.key !== 'today' && group.key !== 'tomorrow';

                      return (
                        <button
                          key={evt.eventId}
                          type="button"
                          onClick={() => onSelectEvent(evt)}
                          className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/90 active:bg-zinc-100/70 transition-colors focus-visible:outline-none focus-visible:bg-zinc-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-1 h-9 rounded-full shrink-0 ${PRIORITY_BAR[evt.priority]}`}
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-950 truncate">
                                {evt.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5 truncate">
                                <span>{TYPE_LABELS[evt.eventType]}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {showShortDate
                                    ? `${formatDisplayDate(evt.eventDate).replace(/,\s*\d{4}$/, '')}, ${formatTimeRange(evt.startTime, evt.endTime)}`
                                    : formatTimeRange(evt.startTime, evt.endTime)}
                                </span>
                                {evt.sourceSnippet && (
                                  <FileText
                                    className="w-3 h-3 text-zinc-400 shrink-0 ml-0.5"
                                    aria-label="Has verified PDF source"
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <ChevronRight
                            className="w-4 h-4 text-zinc-300 shrink-0"
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      {/* Mobile Floating Action Button (+) */}
      <button
        type="button"
        onClick={onOpenAddEvent}
        aria-label="Add academic event"
        className="md:hidden fixed right-4 bottom-20 z-20 w-13 h-13 rounded-full bg-zinc-950 text-white shadow-lg shadow-zinc-950/20 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
};
