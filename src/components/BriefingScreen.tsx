import React from 'react';
import {
  Sun,
  RefreshCw,
  Upload,
  FileText,
  WifiOff,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AcademicEvent, DailyBriefing } from '../types';
import {
  formatDisplayDate,
  formatTimeRange,
  getCountdownInfo,
  getEventsForBriefingWindow,
  getTodayIsoDate,
} from '../utils/dateUtils';

interface BriefingScreenProps {
  confirmedEvents: AcademicEvent[];
  todayBriefing: DailyBriefing | null;
  isGenerating: boolean;
  simulateOfflineError: boolean;
  onGenerateBriefing: () => void;
  onNavigateToDocuments: () => void;
  onNavigateToTimeline: () => void;
  onLoadSampleData: () => void;
  onVerifySource: (event: AcademicEvent) => void;
}

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

function parsePriorityLine(line: string): { number: string; content: string } {
  const match = line.match(/^(\d+)\.\s*(.*)$/);
  if (match) {
    return { number: match[1], content: match[2] };
  }
  return { number: '', content: line };
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({
  confirmedEvents,
  todayBriefing,
  isGenerating,
  simulateOfflineError,
  onGenerateBriefing,
  onNavigateToDocuments,
  onNavigateToTimeline,
  onLoadSampleData,
  onVerifySource,
}) => {
  const todayIso = getTodayIsoDate();
  const hasConfirmedEvents = confirmedEvents.length > 0;
  const pdfSourcedEvents = confirmedEvents.filter((e) => Boolean(e.sourceSnippet));
  const upcomingCachedEvents = getEventsForBriefingWindow(confirmedEvents, todayIso).slice(0, 5);

  const fallbackMode: 'offline' | 'ai_error' | null = !hasConfirmedEvents
    ? null
    : simulateOfflineError || (todayBriefing?.isOfflineFallback && todayBriefing.fallbackReason === 'offline')
    ? 'offline'
    : todayBriefing?.isOfflineFallback
    ? 'ai_error'
    : null;
  const showFallback = fallbackMode !== null;

  const parsedLines = todayBriefing
    ? todayBriefing.summaryText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const overviewLines = parsedLines.filter((line) => !/^\d+\./.test(line));
  const priorityLines = parsedLines.filter((line) => /^\d+\./.test(line));

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              {formatDisplayDate(todayIso)}
            </p>
            {fallbackMode === 'offline' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                <WifiOff className="w-3 h-3" aria-hidden="true" />
                <span>Offline</span>
              </span>
            )}
            {fallbackMode === 'ai_error' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                <span>AI unavailable</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Morning Briefing
          </h1>
          {todayBriefing && !showFallback && (
            <p className="text-xs text-zinc-400">
              Updated{' '}
              {new Date(todayBriefing.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {hasConfirmedEvents && (
          <button
            type="button"
            onClick={onGenerateBriefing}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isGenerating ? 'Updating…' : todayBriefing ? 'Refresh' : 'Generate'}</span>
          </button>
        )}
      </div>

      {/* Empty state */}
      {!hasConfirmedEvents ? (
        <section className="bg-white rounded-2xl border border-zinc-200/80 px-6 py-12 text-center space-y-5">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto">
            <Sun className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h2 className="text-base font-semibold text-zinc-950">No schedule yet</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Upload a course syllabus (.pdf) or calendar (.ics) to get a daily briefing of your
              top priorities.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onNavigateToDocuments}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Upload Documents</span>
            </button>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-zinc-500" aria-hidden="true" />
              <span>Load Sample Schedule</span>
            </button>
          </div>
        </section>
      ) : showFallback ? (
        /* Offline or AI Error Graceful Degradation */
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-3 leading-relaxed">
            {fallbackMode === 'offline'
              ? 'You are offline. Showing your next cached local priorities.'
              : 'AI service is temporarily unavailable (high demand or connection issue). Showing your next cached local priorities — tap Refresh to try again.'}
          </p>

          <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
            {upcomingCachedEvents.map((evt, idx) => {
              const countdown = getCountdownInfo(evt.eventDate, todayIso);
              return (
                <div
                  key={evt.eventId}
                  className="p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 text-xs font-mono font-medium flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-950 leading-snug">{evt.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {countdown.label} · {formatTimeRange(evt.startTime, evt.endTime)}
                      </p>
                    </div>
                  </div>
                  {evt.sourceSnippet && (
                    <button
                      type="button"
                      onClick={() => onVerifySource(evt)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/70 rounded-lg transition-colors shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Source</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : todayBriefing && parsedLines.length > 0 ? (
        /* Persisted AI Morning Briefing */
        <div className="space-y-4">
          {overviewLines.length > 0 && (
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              {overviewLines.join(' ')}
            </p>
          )}

          <div className="space-y-2.5">
            {priorityLines.map((line, idx) => {
              const { number, content } = parsePriorityLine(line);
              const matchedPdfEvent = findMatchingPdfEvent(line, pdfSourcedEvents);

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-zinc-950 text-white text-xs font-mono font-medium flex items-center justify-center shrink-0 mt-0.5">
                      {number || idx + 1}
                    </span>
                    <p className="text-sm text-zinc-800 leading-relaxed">{content}</p>
                  </div>

                  {matchedPdfEvent && (
                    <button
                      type="button"
                      onClick={() => onVerifySource(matchedPdfEvent)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/70 rounded-lg transition-colors shrink-0 whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Source</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateToTimeline}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              <span>View full timeline ({confirmedEvents.length} events)</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        /* Events exist, no briefing generated yet today */
        <section className="bg-white rounded-2xl border border-zinc-200/80 px-6 py-10 text-center space-y-4">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto">
            <Sun className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h2 className="text-base font-semibold text-zinc-950">Ready for your briefing</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Synthesize your top 3 academic priorities from {confirmedEvents.length} scheduled{' '}
              {confirmedEvents.length === 1 ? 'event' : 'events'}.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerateBriefing}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 rounded-xl transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isGenerating ? 'Generating…' : 'Generate Morning Briefing'}</span>
          </button>
        </section>
      )}
    </div>
  );
};
