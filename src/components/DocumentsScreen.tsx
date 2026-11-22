import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Calendar,
  AlertCircle,
  Check,
  Pencil,
  Trash2,
  Loader2,
  X,
  ShieldCheck,
  GitMerge,
} from 'lucide-react';
import {
  AcademicEvent,
  AcademicEventType,
  EventPriority,
  SourceDocument,
} from '../types';
import { parseIcsContent } from '../utils/icsParser';
import { extractPdfTextClientSide } from '../utils/pdfExtractor';
import { scrubBasicPii } from '../utils/piiScrubber';
import { formatFileSize, formatTimeRange, getTodayIsoDate } from '../utils/dateUtils';
import {
  DraftDuplicateMatch,
  DraftResolution,
  DraftResolutionChoice,
  findDuplicateMatch,
} from '../utils/deduplication';
import { PdfConsentSheet } from './PdfConsentSheet';

interface DocumentsScreenProps {
  documents: SourceDocument[];
  confirmedEvents: AcademicEvent[];
  pendingDocument: SourceDocument | null;
  draftEvents: AcademicEvent[];
  simulateOfflineError: boolean;
  onDraftsParsed: (doc: SourceDocument, drafts: AcademicEvent[]) => void;
  onEditDraft: (draft: AcademicEvent) => void;
  onRemoveDraft: (eventId: string) => void;
  onConfirmEvents: (resolutions: Record<string, DraftResolutionChoice>) => void;
  onCancelDrafts: () => void;
  onInspectSource: (event: AcademicEvent) => void;
  onRequestDeleteDocument: (doc: SourceDocument) => void;
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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

const RESOLUTION_OPTIONS: Array<{ value: DraftResolution; label: string }> = [
  { value: 'merge', label: 'Merge' },
  { value: 'skip', label: 'Skip' },
  { value: 'keep', label: 'Keep both' },
];

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({
  documents,
  confirmedEvents,
  pendingDocument,
  draftEvents,
  simulateOfflineError,
  onDraftsParsed,
  onEditDraft,
  onRemoveDraft,
  onConfirmEvents,
  onCancelDrafts,
  onInspectSource,
  onRequestDeleteDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Variant 1 PDF consent flow: hold selected PDF until user confirms in sheet
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Per-draft duplicate resolution overrides
  const [resolutionOverrides, setResolutionOverrides] = useState<Record<string, DraftResolution>>(
    {}
  );

  useEffect(() => {
    setResolutionOverrides({});
  }, [pendingDocument?.documentId]);

  const linkedCountByDocId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const evt of confirmedEvents) {
      if (evt.documentId) {
        counts.set(evt.documentId, (counts.get(evt.documentId) ?? 0) + 1);
      }
    }
    return counts;
  }, [confirmedEvents]);

  // Detect duplicate / overlapping events between incoming drafts and confirmed timeline
  const matchesByDraftId = useMemo(() => {
    const map = new Map<string, DraftDuplicateMatch>();
    for (const draft of draftEvents) {
      const match = findDuplicateMatch(draft, confirmedEvents);
      if (match) {
        map.set(draft.eventId, match);
      }
    }
    return map;
  }, [draftEvents, confirmedEvents]);

  const resolvedActions = useMemo(() => {
    const result: Record<string, DraftResolutionChoice> = {};
    let newCount = 0;
    let mergeCount = 0;
    let skipCount = 0;

    for (const draft of draftEvents) {
      const match = matchesByDraftId.get(draft.eventId);
      const action: DraftResolution =
        resolutionOverrides[draft.eventId] ?? (match ? match.defaultAction : 'keep');

      result[draft.eventId] = {
        action,
        targetEventId: match?.existingEvent.eventId,
      };

      if (action === 'skip') skipCount += 1;
      else if (action === 'merge' && match) mergeCount += 1;
      else newCount += 1;
    }

    return { result, newCount, mergeCount, skipCount };
  }, [draftEvents, matchesByDraftId, resolutionOverrides]);

  const saveButtonLabel = useMemo(() => {
    const { newCount, mergeCount, skipCount } = resolvedActions;
    if (mergeCount === 0 && skipCount === 0) {
      return `Save Events (${newCount})`;
    }
    const parts: string[] = [];
    if (newCount > 0) parts.push(`${newCount} new`);
    if (mergeCount > 0) parts.push(`${mergeCount} merged`);
    if (parts.length === 0) return 'Skip All';
    return `Save (${parts.join(', ')})`;
  }, [resolvedActions]);

  const processIcsFile = async (file: File) => {
    const docId = createId('doc');
    const uploadedAt = new Date().toISOString();

    setIsProcessing(true);
    setProcessingLabel('Parsing iCalendar locally…');
    try {
      const text = await file.text();
      const parsedDrafts = parseIcsContent(text, docId);

      if (parsedDrafts.length === 0) {
        setErrorBanner('No valid VEVENT calendar entries were found in this .ics file.');
        return;
      }

      const doc: SourceDocument = {
        documentId: docId,
        fileName: file.name,
        fileType: 'ICS',
        fileSizeBytes: file.size,
        characterCount: text.length,
        uploadedAt,
        ingestionStatus: 'PARSED',
      };

      onDraftsParsed(doc, parsedDrafts);
      setInfoNotice(`Parsed ${parsedDrafts.length} events locally from ${file.name}.`);
    } catch {
      setErrorBanner('Could not read the uploaded .ics file. Please check the file and try again.');
    } finally {
      setIsProcessing(false);
      setProcessingLabel('');
    }
  };

  const processPdfFile = async (file: File) => {
    const docId = createId('doc');
    const uploadedAt = new Date().toISOString();

    setIsProcessing(true);
    setProcessingLabel('Extracting text on your device…');
    try {
      const extracted = await extractPdfTextClientSide(file);
      const { sanitizedText, redactionCount } = scrubBasicPii(extracted.text);

      if (simulateOfflineError || !navigator.onLine) {
        setErrorBanner('AI service unavailable. Please check your connection or try again.');
        return;
      }

      setProcessingLabel('Extracting academic deadlines…');
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sanitizedText,
          fileName: file.name,
          todayDate: getTodayIsoDate(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        events?: Array<{
          title: string;
          eventType: AcademicEventType;
          eventDate: string;
          startTime: string | null;
          endTime: string | null;
          priority: EventPriority;
          sourceSnippet: string | null;
        }>;
        error?: string;
      };

      if (!response.ok) {
        setErrorBanner('AI service unavailable. Please check your connection or try again.');
        return;
      }

      const extractedItems = Array.isArray(payload.events) ? payload.events : [];
      if (extractedItems.length === 0) {
        setErrorBanner(
          'No academic deadlines or scheduled events were detected in this PDF. You can add events manually in Timeline.'
        );
        return;
      }

      const nowIso = new Date().toISOString();
      const drafts: AcademicEvent[] = extractedItems.map((item) => ({
        eventId: createId('evt'),
        documentId: docId,
        title: item.title,
        eventType: item.eventType,
        eventDate: item.eventDate,
        startTime: item.startTime,
        endTime: item.endTime,
        priority: item.priority,
        status: 'DRAFT',
        sourceSnippet: item.sourceSnippet,
        createdAt: nowIso,
        updatedAt: nowIso,
      }));

      const doc: SourceDocument = {
        documentId: docId,
        fileName: file.name,
        fileType: 'PDF',
        fileSizeBytes: file.size,
        characterCount: sanitizedText.length,
        uploadedAt,
        ingestionStatus: 'PARSED',
      };

      onDraftsParsed(doc, drafts);

      const notes: string[] = [
        `Read ${extracted.pageCount} ${extracted.pageCount === 1 ? 'page' : 'pages'}, ${extracted.originalCharacterCount.toLocaleString()} chars → extracted ${drafts.length} draft ${drafts.length === 1 ? 'event' : 'events'}.`,
      ];
      if (redactionCount > 0) {
        notes.push(
          `${redactionCount} personal ${redactionCount === 1 ? 'identifier' : 'identifiers'} scrubbed.`
        );
      }
      if (extracted.wasTruncated) {
        notes.push('Capped at 50,000 characters.');
      }
      setInfoNotice(notes.join(' '));
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes('selectable text')
          ? err.message
          : 'AI service unavailable. Please check your connection or try again.';
      setErrorBanner(msg);
    } finally {
      setIsProcessing(false);
      setProcessingLabel('');
    }
  };

  const handleSelectedFile = (file: File) => {
    setErrorBanner(null);
    setInfoNotice(null);

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext !== 'pdf' && ext !== 'ics') {
      setErrorBanner('Unsupported file format. Please upload a .pdf or .ics file.');
      return;
    }

    if (ext === 'ics') {
      void processIcsFile(file);
    } else {
      setPendingPdfFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSelectedFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleSelectedFile(file);
  };

  const isReviewingDrafts = Boolean(pendingDocument && draftEvents.length > 0);
  const matchCount = matchesByDraftId.size;

  return (
    <div className={`space-y-6 ${isReviewingDrafts ? 'pb-24 md:pb-6' : ''}`}>
      {/* Screen Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {isReviewingDrafts ? 'Review Drafts' : 'Documents'}
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          {isReviewingDrafts
            ? 'Review, merge duplicates, or edit events before saving locally'
            : 'Import course syllabi (.pdf) or calendars (.ics)'}
        </p>
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs sm:text-sm font-medium text-red-900">{errorBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            aria-label="Dismiss error"
            className="p-1 text-red-500 hover:text-red-800 rounded-md shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODE A: Upload + Saved Files */}
      {!isReviewingDrafts && (
        <>
          <section className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isProcessing) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`rounded-2xl border border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer ${
                isProcessing
                  ? 'border-zinc-200 bg-white cursor-wait'
                  : isDragging
                  ? 'border-zinc-950 bg-zinc-100/70'
                  : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ics"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="space-y-2.5 py-2">
                  <Loader2
                    className="w-7 h-7 text-zinc-900 animate-spin mx-auto"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-zinc-950">{processingLabel}</p>
                  <p className="text-xs text-zinc-400">
                    Nothing is saved until you confirm drafts.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-950">
                      Tap to choose a file, or drop it here
                    </p>
                    <p className="text-xs text-zinc-400">.pdf syllabus or .ics timetable</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-1 text-xs text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>.ics parses offline · .pdf scrubs personal info before AI extraction</span>
            </div>
          </section>

          {/* Uploaded Files List */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Uploaded Files
              </h2>
              <span className="text-xs text-zinc-400 font-mono tabular-nums">
                {documents.length}
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200/80 px-5 py-8 text-center">
                <p className="text-xs text-zinc-400">
                  Confirmed .pdf and .ics imports will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
                {documents.map((doc) => {
                  const linkedCount = linkedCountByDocId.get(doc.documentId) ?? 0;
                  return (
                    <div
                      key={doc.documentId}
                      className="px-4 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                          {doc.fileType === 'PDF' ? (
                            <FileText className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium text-zinc-950 truncate"
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono tabular-nums mt-0.5">
                            {doc.fileType} · {formatFileSize(doc.fileSizeBytes)} · {linkedCount}{' '}
                            {linkedCount === 1 ? 'event' : 'events'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRequestDeleteDocument(doc)}
                        aria-label={`Delete ${doc.fileName}`}
                        className="w-9 h-9 inline-flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* MODE B: Draft Review */}
      {isReviewingDrafts && pendingDocument && (
        <div className="space-y-4">
          {/* Compact 3-step indicator */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
            <span className="text-zinc-500">1. Upload</span>
            <span aria-hidden="true">→</span>
            <span className="font-semibold text-zinc-950">2. Review ({draftEvents.length})</span>
            <span aria-hidden="true">→</span>
            <span>3. Save</span>
          </div>

          {/* Temporary draft notice */}
          <div className="px-4 py-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 space-y-0.5">
            <p className="text-xs sm:text-sm font-medium text-amber-950">
              Temporary draft — not saved yet
              {matchCount > 0
                ? ` · ${matchCount} ${matchCount === 1 ? 'overlap' : 'overlaps'} detected`
                : ''}
            </p>
            <p className="text-xs text-amber-800/90">
              {infoNotice ||
                `${pendingDocument.fileName} · ${formatFileSize(pendingDocument.fileSizeBytes)}`}
            </p>
          </div>

          {/* Draft List */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
            {draftEvents.map((draft) => {
              const match = matchesByDraftId.get(draft.eventId);
              const activeAction = resolvedActions.result[draft.eventId]?.action ?? 'keep';
              const isSkipped = activeAction === 'skip';

              return (
                <div
                  key={draft.eventId}
                  className={`px-4 py-3.5 space-y-2.5 transition-opacity ${
                    isSkipped ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-1 h-9 rounded-full shrink-0 ${PRIORITY_BAR[draft.priority]}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-950 truncate">{draft.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono tabular-nums truncate">
                          <span className="font-sans">{TYPE_LABELS[draft.eventType]}</span> ·{' '}
                          {draft.eventDate}
                          {draft.startTime
                            ? ` · ${formatTimeRange(draft.startTime, draft.endTime)}`
                            : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {draft.sourceSnippet && (
                        <button
                          type="button"
                          onClick={() => onInspectSource(draft)}
                          aria-label={`Verify source for ${draft.title}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditDraft(draft)}
                        aria-label={`Edit ${draft.title}`}
                        className="w-8 h-8 inline-flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveDraft(draft.eventId)}
                        aria-label={`Remove ${draft.title}`}
                        className="w-8 h-8 inline-flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Duplicate / overlap resolution bar */}
                  {match && (
                    <div className="pl-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0">
                        <GitMerge className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {match.reason}:{' '}
                          <span className="font-medium text-zinc-700">
                            {match.existingEvent.title}
                          </span>
                          {match.existingEvent.startTime
                            ? ` (${formatTimeRange(
                                match.existingEvent.startTime,
                                match.existingEvent.endTime
                              )})`
                            : ''}
                        </span>
                      </div>

                      <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-100 self-start sm:self-auto shrink-0">
                        {RESOLUTION_OPTIONS.map((opt) => {
                          const selected = activeAction === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setResolutionOverrides((prev) => ({
                                  ...prev,
                                  [draft.eventId]: opt.value,
                                }))
                              }
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                                selected
                                  ? 'bg-white text-zinc-950 shadow-xs'
                                  : 'text-zinc-500 hover:text-zinc-900'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky confirmation bar (mobile above tab bar, desktop inline) */}
          <div className="fixed md:static bottom-16 md:bottom-auto inset-x-0 z-20 bg-white/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-t-0 border-zinc-200/80 px-4 py-3 md:p-0">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setInfoNotice(null);
                  onCancelDrafts();
                }}
                className="px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/70 rounded-xl transition-colors"
              >
                Discard
              </button>

              <button
                type="button"
                disabled={draftEvents.length === 0}
                onClick={() => onConfirmEvents(resolvedActions.result)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 rounded-xl transition-colors"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>{saveButtonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Consent Bottom Sheet (Variant 1) */}
      <PdfConsentSheet
        file={pendingPdfFile}
        onCancel={() => setPendingPdfFile(null)}
        onConfirm={() => {
          const target = pendingPdfFile;
          setPendingPdfFile(null);
          if (target) {
            void processPdfFile(target);
          }
        }}
      />
    </div>
  );
};
