import { AcademicEvent } from '../types';

/**
 * Returns local calendar date in YYYY-MM-DD format.
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds a number of days to an ISO YYYY-MM-DD date string.
 */
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, (d || 1) + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns integer day difference: eventDate - todayDate.
 */
export function getDaysFromToday(eventDate: string, todayDate = getTodayIsoDate()): number {
  const [ey, em, ed] = eventDate.split('-').map(Number);
  const [ty, tm, td] = todayDate.split('-').map(Number);
  if (!ey || !em || !ed || !ty || !tm || !td) return 0;
  const eventUtc = Date.UTC(ey, em - 1, ed);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((eventUtc - todayUtc) / (1000 * 60 * 60 * 24));
}

export interface CountdownInfo {
  label: string;
  tone: 'overdue' | 'today' | 'soon' | 'upcoming';
}

export function getCountdownInfo(eventDate: string, todayDate = getTodayIsoDate()): CountdownInfo {
  const diff = getDaysFromToday(eventDate, todayDate);
  if (diff < 0) {
    const overdueDays = Math.abs(diff);
    return {
      label: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`,
      tone: 'overdue',
    };
  }
  if (diff === 0) {
    return { label: 'Today', tone: 'today' };
  }
  if (diff === 1) {
    return { label: 'Due tomorrow', tone: 'soon' };
  }
  if (diff <= 3) {
    return { label: `Due in ${diff} days`, tone: 'soon' };
  }
  return { label: `Due in ${diff} days`, tone: 'upcoming' };
}

/**
 * Formats YYYY-MM-DD into readable English date (e.g., "Sat, Nov 21, 2026").
 */
export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeRange(startTime: string | null, endTime: string | null): string {
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  if (startTime) return startTime;
  return 'All day';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sortEventsChronologically(events: AcademicEvent[]): AcademicEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.eventDate.localeCompare(b.eventDate);
    if (dateCompare !== 0) return dateCompare;
    const aTime = a.startTime ?? '99:99';
    const bTime = b.startTime ?? '99:99';
    const timeCompare = aTime.localeCompare(bTime);
    if (timeCompare !== 0) return timeCompare;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Selects confirmed events occurring today through today + 7 days (inclusive).
 * If none fall within that window, falls back to the next upcoming confirmed events.
 */
export function getEventsForBriefingWindow(
  confirmedEvents: AcademicEvent[],
  todayDate = getTodayIsoDate()
): AcademicEvent[] {
  const sorted = sortEventsChronologically(confirmedEvents);
  const windowEnd = addDaysToIsoDate(todayDate, 7);

  const inWindow = sorted.filter(
    (evt) => evt.eventDate >= todayDate && evt.eventDate <= windowEnd
  );
  if (inWindow.length > 0) {
    return inWindow;
  }

  const upcoming = sorted.filter((evt) => evt.eventDate >= todayDate);
  if (upcoming.length > 0) {
    return upcoming.slice(0, 10);
  }

  // If all events are in the past, include the most recent ones so the student can still catch up
  return sorted.slice(-5);
}
