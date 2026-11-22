import { AcademicEvent, AcademicEventType, EventPriority } from '../types';

export type DraftResolution = 'merge' | 'skip' | 'keep';

export interface DraftDuplicateMatch {
  existingEvent: AcademicEvent;
  matchKind: 'exact' | 'probable';
  reason: string;
  defaultAction: DraftResolution;
}

export interface DraftResolutionChoice {
  action: DraftResolution;
  targetEventId?: string;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'class',
  'aula',
  'para',
  'com',
  'das',
  'dos',
  'uma',
  'por',
  'del',
  'que',
]);

const PRIORITY_RANK: Record<EventPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const TYPE_SPECIFICITY: Record<AcademicEventType, number> = {
  OTHER: 1,
  LECTURE: 2,
  LAB: 3,
  ASSIGNMENT: 4,
  EXAM: 5,
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTokens(title: string): Set<string> {
  const words = normalizeText(title).split(' ');
  const tokens = new Set<string>();
  for (const w of words) {
    if (w.length >= 3 && !STOP_WORDS.has(w)) {
      tokens.add(w);
    }
  }
  return tokens;
}

function countSharedTokens(a: string, b: string): number {
  const tokensA = extractTokens(a);
  const tokensB = extractTokens(b);
  let shared = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) shared += 1;
  }
  return shared;
}

function timeToMinutes(hhmm: string | null): number | null {
  if (!hhmm) return null;
  const parts = hhmm.split(':').map(Number);
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

function timesOverlap(a: AcademicEvent, b: AcademicEvent): boolean {
  const aStart = timeToMinutes(a.startTime);
  const bStart = timeToMinutes(b.startTime);
  if (aStart === null || bStart === null) return false;
  if (aStart === bStart) return true;

  const aEnd = timeToMinutes(a.endTime) ?? aStart + 60;
  const bEnd = timeToMinutes(b.endTime) ?? bStart + 60;
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Finds the strongest duplicate/overlap match for a draft among existing confirmed events.
 */
export function findDuplicateMatch(
  draft: AcademicEvent,
  confirmedEvents: AcademicEvent[]
): DraftDuplicateMatch | null {
  const sameDate = confirmedEvents.filter((evt) => evt.eventDate === draft.eventDate);
  if (sameDate.length === 0) return null;

  const draftTitleNorm = normalizeText(draft.title);
  const draftStart = (draft.startTime ?? '').trim();

  // 1. Exact match: same normalized title, date, and startTime
  for (const existing of sameDate) {
    if (
      normalizeText(existing.title) === draftTitleNorm &&
      (existing.startTime ?? '').trim() === draftStart
    ) {
      return {
        existingEvent: existing,
        matchKind: 'exact',
        reason: 'Exact match',
        defaultAction: 'skip',
      };
    }
  }

  // 2. Probable match scoring on same date
  let best: { match: DraftDuplicateMatch; score: number } | null = null;

  for (const existing of sameDate) {
    const overlap = timesOverlap(draft, existing);
    const sharedTokens = countSharedTokens(draft.title, existing.title);
    const oneMissingTime =
      (draft.startTime === null && existing.startTime !== null) ||
      (draft.startTime !== null && existing.startTime === null);
    const complementarySource =
      Boolean(draft.sourceSnippet) !== Boolean(existing.sourceSnippet);
    const sameType = draft.eventType === existing.eventType;

    let score = 0;
    let reason = '';

    if (overlap) {
      score += 50;
      reason = 'Same date & time';
    }
    if (sharedTokens >= 2) {
      score += 40;
      if (!reason) reason = 'Similar event on same date';
    } else if (sharedTokens === 1) {
      score += 20;
      if (!reason) reason = 'Similar event on same date';
    }
    if (oneMissingTime && (complementarySource || sameType)) {
      score += 30;
      if (!reason) reason = 'PDF & calendar match on same date';
    }
    if (sameType) {
      score += 10;
    }

    if (score >= 30 && (!best || score > best.score)) {
      best = {
        score,
        match: {
          existingEvent: existing,
          matchKind: 'probable',
          reason: reason || 'Same date',
          defaultAction: 'merge',
        },
      };
    }
  }

  return best ? best.match : null;
}

/**
 * Smartly merges an incoming draft event with an existing confirmed event.
 * Keeps the richer PDF title/snippet and fills in missing ICS start/end times.
 */
export function mergeAcademicEvents(
  existing: AcademicEvent,
  incoming: AcademicEvent
): AcademicEvent {
  const existingHasPdf = Boolean(existing.sourceSnippet);
  const incomingHasPdf = Boolean(incoming.sourceSnippet);

  // Prefer PDF title (usually descriptive syllabus title) or longer title
  let title = existing.title;
  if (!existingHasPdf && incomingHasPdf) {
    title = incoming.title;
  } else if (existingHasPdf === incomingHasPdf && incoming.title.length > existing.title.length) {
    title = incoming.title;
  }

  // Fill in missing times from whichever source has them (usually .ics)
  const startTime = existing.startTime ?? incoming.startTime;
  const endTime = existing.endTime ?? incoming.endTime;

  // Keep higher priority
  const priority =
    PRIORITY_RANK[incoming.priority] > PRIORITY_RANK[existing.priority]
      ? incoming.priority
      : existing.priority;

  // Prefer more specific academic type (e.g., EXAM/ASSIGNMENT/LAB over LECTURE/OTHER)
  const eventType =
    TYPE_SPECIFICITY[incoming.eventType] > TYPE_SPECIFICITY[existing.eventType]
      ? incoming.eventType
      : existing.eventType;

  return {
    ...existing,
    title: title.trim(),
    eventType,
    startTime,
    endTime,
    priority,
    sourceSnippet: existing.sourceSnippet ?? incoming.sourceSnippet,
    documentId: existing.documentId ?? incoming.documentId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Applies per-draft user resolutions (merge, skip, keep) against confirmed events.
 */
export function applyDraftResolutions(
  existingConfirmed: AcademicEvent[],
  drafts: AcademicEvent[],
  resolutions: Record<string, DraftResolutionChoice>
): {
  merged: AcademicEvent[];
  addedCount: number;
  mergedCount: number;
  skippedCount: number;
} {
  const byId = new Map<string, AcademicEvent>(
    existingConfirmed.map((evt) => [evt.eventId, evt])
  );
  const orderedIds = existingConfirmed.map((evt) => evt.eventId);

  const exactKey = (e: AcademicEvent) =>
    `${normalizeText(e.title)}|${e.eventDate}|${(e.startTime ?? '').trim()}`;
  const seenKeys = new Set<string>(existingConfirmed.map(exactKey));

  const nowIso = new Date().toISOString();
  let addedCount = 0;
  let mergedCount = 0;
  let skippedCount = 0;

  for (const draft of drafts) {
    const cleanTitle = draft.title.trim();
    if (!cleanTitle || !draft.eventDate) continue;

    const choice = resolutions[draft.eventId];
    const action: DraftResolution = choice?.action ?? 'keep';

    if (action === 'skip') {
      skippedCount += 1;
      continue;
    }

    if (action === 'merge' && choice?.targetEventId && byId.has(choice.targetEventId)) {
      const target = byId.get(choice.targetEventId)!;
      const enriched = mergeAcademicEvents(target, { ...draft, title: cleanTitle });
      byId.set(choice.targetEventId, enriched);
      seenKeys.add(exactKey(enriched));
      mergedCount += 1;
      continue;
    }

    const confirmedDraft: AcademicEvent = {
      ...draft,
      title: cleanTitle,
      status: 'CONFIRMED',
      updatedAt: nowIso,
    };

    const key = exactKey(confirmedDraft);
    if (seenKeys.has(key) && action !== 'keep') {
      skippedCount += 1;
      continue;
    }

    seenKeys.add(key);
    byId.set(confirmedDraft.eventId, confirmedDraft);
    orderedIds.push(confirmedDraft.eventId);
    addedCount += 1;
  }

  return {
    merged: orderedIds.map((id) => byId.get(id)!),
    addedCount,
    mergedCount,
    skippedCount,
  };
}
