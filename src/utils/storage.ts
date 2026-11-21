import { AcademicEvent, DailyBriefing, SourceDocument } from '../types';
import { addDaysToIsoDate, getTodayIsoDate } from './dateUtils';

const KEYS = {
  DOCUMENTS: 'smartcampus_v3_source_documents',
  EVENTS: 'smartcampus_v3_academic_events',
  BRIEFINGS: 'smartcampus_v3_daily_briefings',
} as const;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSourceDocuments(): SourceDocument[] {
  const docs = safeReadJson<SourceDocument[]>(KEYS.DOCUMENTS, []);
  return Array.isArray(docs) ? docs : [];
}

export function saveSourceDocuments(documents: SourceDocument[]): void {
  safeWriteJson(KEYS.DOCUMENTS, documents);
}

export function loadAcademicEvents(): AcademicEvent[] {
  const events = safeReadJson<AcademicEvent[]>(KEYS.EVENTS, []);
  return Array.isArray(events) ? events.filter((e) => e.status === 'CONFIRMED') : [];
}

export function saveAcademicEvents(events: AcademicEvent[]): void {
  const confirmedOnly = events.filter((e) => e.status === 'CONFIRMED');
  safeWriteJson(KEYS.EVENTS, confirmedOnly);
}

export function loadDailyBriefings(): DailyBriefing[] {
  const briefings = safeReadJson<DailyBriefing[]>(KEYS.BRIEFINGS, []);
  return Array.isArray(briefings) ? briefings : [];
}

export function saveDailyBriefings(briefings: DailyBriefing[]): void {
  safeWriteJson(KEYS.BRIEFINGS, briefings);
}

/**
 * Upserts a single DailyBriefing keyed uniquely by briefingDate (YYYY-MM-DD).
 */
export function upsertDailyBriefing(
  existing: DailyBriefing[],
  nextBriefing: DailyBriefing
): DailyBriefing[] {
  const filtered = existing.filter((b) => b.briefingDate !== nextBriefing.briefingDate);
  const updated = [nextBriefing, ...filtered].sort((a, b) =>
    b.briefingDate.localeCompare(a.briefingDate)
  );
  saveDailyBriefings(updated);
  return updated;
}

/**
 * Deduplicates incoming draft events against existing confirmed events on:
 * (normalized title, eventDate, startTime || null)
 */
export function confirmAndDeduplicateEvents(
  existingConfirmed: AcademicEvent[],
  drafts: AcademicEvent[]
): {
  merged: AcademicEvent[];
  addedCount: number;
  skippedCount: number;
} {
  const buildKey = (title: string, eventDate: string, startTime: string | null) =>
    `${title.trim().toLowerCase()}|${eventDate.trim()}|${(startTime ?? '').trim()}`;

  const seenKeys = new Set<string>(
    existingConfirmed.map((evt) => buildKey(evt.title, evt.eventDate, evt.startTime))
  );

  const nowIso = new Date().toISOString();
  const newlyConfirmed: AcademicEvent[] = [];
  let skippedCount = 0;

  for (const draft of drafts) {
    const cleanTitle = draft.title.trim();
    if (!cleanTitle || !draft.eventDate) continue;

    const key = buildKey(cleanTitle, draft.eventDate, draft.startTime);
    if (seenKeys.has(key)) {
      skippedCount += 1;
      continue;
    }

    seenKeys.add(key);
    newlyConfirmed.push({
      ...draft,
      title: cleanTitle,
      status: 'CONFIRMED',
      updatedAt: nowIso,
    });
  }

  return {
    merged: [...existingConfirmed, ...newlyConfirmed],
    addedCount: newlyConfirmed.length,
    skippedCount,
  };
}

/**
 * GDPR Permanent Purge: wipes all SourceDocuments, AcademicEvents, and DailyBriefings.
 */
export function purgeAllLocalData(): void {
  localStorage.removeItem(KEYS.DOCUMENTS);
  localStorage.removeItem(KEYS.EVENTS);
  localStorage.removeItem(KEYS.BRIEFINGS);
}

/**
 * Explicit optional sample data generator (only triggered manually when schedule is empty).
 */
export function createSampleDataset(todayDate = getTodayIsoDate()): {
  documents: SourceDocument[];
  events: AcademicEvent[];
} {
  const nowIso = new Date().toISOString();
  const pdfDocId = 'doc-sample-syllabus-pdf';
  const icsDocId = 'doc-sample-timetable-ics';

  const documents: SourceDocument[] = [
    {
      documentId: pdfDocId,
      fileName: 'CS304_Software_Engineering_Syllabus.pdf',
      fileType: 'PDF',
      fileSizeBytes: 248320,
      characterCount: 11420,
      uploadedAt: nowIso,
      ingestionStatus: 'CONFIRMED',
    },
    {
      documentId: icsDocId,
      fileName: 'Fall_Semester_Timetable.ics',
      fileType: 'ICS',
      fileSizeBytes: 18432,
      characterCount: 4120,
      uploadedAt: nowIso,
      ingestionStatus: 'CONFIRMED',
    },
  ];

  const events: AcademicEvent[] = [
    {
      eventId: 'evt-sample-1',
      documentId: pdfDocId,
      title: 'CS304 Architecture Design Document',
      eventType: 'ASSIGNMENT',
      eventDate: todayDate,
      startTime: '23:59',
      endTime: null,
      priority: 'HIGH',
      status: 'CONFIRMED',
      sourceSnippet:
        'Section 4.2 Deliverables: Teams must submit the finalized Software Architecture Design Document via the course portal by 23:59 on the scheduled milestone date. Late submissions incur a 10% daily penalty.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      eventId: 'evt-sample-2',
      documentId: icsDocId,
      title: 'Distributed Systems Lecture',
      eventType: 'LECTURE',
      eventDate: addDaysToIsoDate(todayDate, 1),
      startTime: '10:00',
      endTime: '11:30',
      priority: 'LOW',
      status: 'CONFIRMED',
      sourceSnippet: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      eventId: 'evt-sample-3',
      documentId: pdfDocId,
      title: 'CS304 Integration Testing Lab',
      eventType: 'LAB',
      eventDate: addDaysToIsoDate(todayDate, 2),
      startTime: '14:00',
      endTime: '16:00',
      priority: 'MEDIUM',
      status: 'CONFIRMED',
      sourceSnippet:
        'Lab 6 (Automated Integration Testing): Attendance and live demo verification take place in Room B204 from 14:00 to 16:00. Bring your working CI pipeline repository.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      eventId: 'evt-sample-4',
      documentId: pdfDocId,
      title: 'CS304 Midterm Examination',
      eventType: 'EXAM',
      eventDate: addDaysToIsoDate(todayDate, 4),
      startTime: '09:30',
      endTime: '11:30',
      priority: 'HIGH',
      status: 'CONFIRMED',
      sourceSnippet:
        'Assessment Schedule: The written Midterm Examination covering Chapters 1 through 6 will be held in Main Auditorium A from 09:30 to 11:30. Closed-book format (30% of final grade).',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      eventId: 'evt-sample-5',
      documentId: icsDocId,
      title: 'Database Systems Query Optimization Lab',
      eventType: 'LAB',
      eventDate: addDaysToIsoDate(todayDate, 5),
      startTime: '13:30',
      endTime: '15:00',
      priority: 'MEDIUM',
      status: 'CONFIRMED',
      sourceSnippet: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  return { documents, events };
}
