import React from 'react';
import { Sun, RefreshCw, Upload, Search, WifiOff, Loader2 } from 'lucide-react';
import { AcademicEvent, DailyBriefing } from '../types';
import {
  formatDisplayDate,
  formatTimeRange,
  getCountdownInfo,
  getEventsForBriefingWindow,
  getTodayIsoDate,
} from '../utils/dateUtils';

interface MorningBriefingCardProps {
  confirmedEvents: AcademicEvent[];
  todayBriefing: DailyBriefing | null;
  isGenerating: boolean;
  simulateOfflineError: boolean;
  onGenerateBriefing: () => void;
  onNavigateToUpload: () => void;
  onVerifySource: (event: AcademicEvent) => void;
}

/**
 * Matches a priority bullet line against confirmed PDF-sourced events
 * so students can tap "Verify Source" directly from their morning briefing.
 */
function findMatchingPdfEvent(
  line: string,
  pdfEvents: AcademicEvent[]
): AcademicEvent | null {
  const normalizedLine = line.toLowerCase();
  for (const evt of pdfEvents) {
    const title = evt.title.trim().toLowerCase();
    if (title.length >= 4 && normalizedLine.includes(title)) {
      return evt;
    }
  }
  return null;
}

export const MorningBriefingCard: React.FC<MorningBriefingCardProps> = ({
  confirmedEvents,
  todayBriefing,
  isGenerating,
  simulateOfflineError,
  onGenerateBriefing,
  onNavigateToUpload,
  onVerifySource,
}) => {
  const todayIso = getTodayIsoDate();
  const hasConfirmedEvents = confirmedEvents.length > 0;
  const pdfSourcedEvents = confirmedEvents.filter((e) => Boolean(e.sourceSnippet));
  const upcomingCachedEvents = getEventsForBriefingWindow(confirmedEvents, todayIso).slice(0, 5);

  const showOfflineFallback =
    hasConfirmedEvents && (simulateOfflineError || todayBriefing?.isOfflineFallback);

  const parsedLines = todayBriefing
    ? todayBriefing.summaryText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>Daily Morning Briefing (08:00 AM)</span>
            </h2>
            {showOfflineFallback && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <WifiOff className="w-3 h-3" aria-hidden="true" />
                <span>[OFFLINE MODE]</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            {formatDisplayDate(todayIso)}
            {todayBriefing && !showOfflineFallback
              ? ` · Updated ${new Date(todayBriefing.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateBriefing}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          )}
          <span>{isGenerating ? 'Generating...' : 'Generate / Refresh Briefing'}</span>
        </button>
      </div>

      {/* Empty Plan Guard */}
      {!hasConfirmedEvents ? (
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-700">
            No confirmed schedule found. Please upload a .pdf or .ics file first.
          </p>
          <button
            type="button"
            onClick={onNavigateToUpload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Upload .pdf or .ics</span>
          </button>
        </div>
      ) : showOfflineFallback ? (
        /* Offline Graceful Degradation View */
        <div className="space-y-4">
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            AI briefing service is offline. Showing your cached local timeline priorities for the
            next 7 days.
          </p>

          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {upcomingCachedEvents.map((evt) => {
              const countdown = getCountdownInfo(evt.eventDate, todayIso);
              return (
                <li
                  key={evt.eventId}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{evt.title}</p>
                    <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                      {countdown.label} · {evt.eventDate} ·{' '}
                      {formatTimeRange(evt.startTime, evt.endTime)} · {evt.priority}
                    </p>
                  </div>
                  {evt.sourceSnippet && (
                    <button
                      type="button"
                      onClick={() => onVerifySource(evt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors self-start sm:self-center shrink-0"
                    >
                      <Search className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                      <span>Verify Source</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : todayBriefing && parsedLines.length > 0 ? (
        /* Persisted AI Morning Briefing */
        <div className="space-y-3">
          {parsedLines.map((line, idx) => {
            const isPriorityItem = /^\d+\./.test(line);
            const matchedPdfEvent = isPriorityItem
              ? findMatchingPdfEvent(line, pdfSourcedEvents)
              : null;

            if (!isPriorityItem) {
              return (
                <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                  {line}
                </p>
              );
            }

            return (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <p className="text-sm text-slate-900 leading-relaxed">{line}</p>
                {matchedPdfEvent && (
                  <button
                    type="button"
                    onClick={() => onVerifySource(matchedPdfEvent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors self-start sm:self-center shrink-0 whitespace-nowrap"
                  >
                    <Search className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                    <span>Verify Source</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Confirmed events exist, no briefing generated yet for today */
        <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Click &ldquo;Generate / Refresh Briefing&rdquo; to synthesize your top 3 priorities for
            today and the next 7 days.
          </p>
        </div>
      )}
    </section>
  );
};
