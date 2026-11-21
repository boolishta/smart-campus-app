import { AcademicEvent, AcademicEventType, EventPriority } from '../types';

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function unescapeIcsText(value: string): string {
  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function parseIcsDateTime(rawValue: string): { date: string; time: string | null } | null {
  const cleaned = rawValue.trim();

  // Format: YYYYMMDDTHHMMSS(Z)?
  const dateTimeMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (dateTimeMatch) {
    const [, y, m, d, hh, mm] = dateTimeMatch;
    return {
      date: `${y}-${m}-${d}`,
      time: `${hh}:${mm}`,
    };
  }

  // Format: YYYYMMDD (All-day event)
  const dateOnlyMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return {
      date: `${y}-${m}-${d}`,
      time: null,
    };
  }

  return null;
}

function inferEventType(summary: string, categories: string): AcademicEventType {
  const combined = `${summary} ${categories}`.toLowerCase();
  if (/\b(exam|midterm|final|quiz|test|assessment)\b/.test(combined)) {
    return 'EXAM';
  }
  if (/\b(lab|laboratory|practical|workshop)\b/.test(combined)) {
    return 'LAB';
  }
  if (/\b(assignment|homework|deliverable|project|submission|report|essay|milestone|due)\b/.test(combined)) {
    return 'ASSIGNMENT';
  }
  if (/\b(lecture|class|seminar|tutorial|course)\b/.test(combined)) {
    return 'LECTURE';
  }
  return 'OTHER';
}

function inferPriority(eventType: AcademicEventType): EventPriority {
  if (eventType === 'EXAM') return 'HIGH';
  if (eventType === 'ASSIGNMENT' || eventType === 'LAB') return 'MEDIUM';
  return 'LOW';
}

/**
 * Deterministic client-side iCalendar (.ics) VEVENT parser.
 * Parses SUMMARY, DTSTART, DTEND without invoking any external API.
 */
export function parseIcsContent(icsText: string, documentId: string): AcademicEvent[] {
  // RFC 5545 line unfolding: CRLF or LF followed by single space or tab
  const unfolded = icsText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  const drafts: AcademicEvent[] = [];
  const nowIso = new Date().toISOString();

  let inEvent = false;
  let summary = '';
  let categories = '';
  let dtStartRaw = '';
  let dtEndRaw = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      summary = '';
      categories = '';
      dtStartRaw = '';
      dtEndRaw = '';
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && summary && dtStartRaw) {
        const startParsed = parseIcsDateTime(dtStartRaw);
        const endParsed = dtEndRaw ? parseIcsDateTime(dtEndRaw) : null;

        if (startParsed) {
          const eventType = inferEventType(summary, categories);
          drafts.push({
            eventId: createId('evt'),
            documentId,
            title: summary.slice(0, 180),
            eventType,
            eventDate: startParsed.date,
            startTime: startParsed.time,
            endTime: endParsed ? endParsed.time : null,
            priority: inferPriority(eventType),
            status: 'DRAFT',
            sourceSnippet: null,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      }
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const propertyHeader = line.slice(0, colonIndex).toUpperCase();
    const propertyName = propertyHeader.split(';')[0];
    const propertyValue = line.slice(colonIndex + 1);

    if (propertyName === 'SUMMARY') {
      summary = unescapeIcsText(propertyValue);
    } else if (propertyName === 'DTSTART') {
      dtStartRaw = propertyValue.trim();
    } else if (propertyName === 'DTEND') {
      dtEndRaw = propertyValue.trim();
    } else if (propertyName === 'CATEGORIES') {
      categories = unescapeIcsText(propertyValue);
    }
  }

  return drafts;
}
