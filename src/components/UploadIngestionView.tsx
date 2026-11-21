import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Calendar,
  AlertCircle,
  Check,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  AcademicEvent,
  AcademicEventType,
  EventPriority,
  SourceDocument,
  WorkflowStage,
} from '../types';
import { parseIcsContent } from '../utils/icsParser';
import { extractPdfTextClientSide } from '../utils/pdfExtractor';
import { scrubBasicPii } from '../utils/piiScrubber';
import { formatFileSize, getTodayIsoDate } from '../utils/dateUtils';

interface UploadIngestionViewProps {
  pendingDocument: SourceDocument | null;
  draftEvents: AcademicEvent[];
  activeStage: WorkflowStage;
  simulateOfflineError: boolean;
  onStageChange: (stage: WorkflowStage) => void;
  onDraftsParsed: (doc: SourceDocument, drafts: AcademicEvent[]) => void;
  onUpdateDraft: (updated: AcademicEvent) => void;
  onRemoveDraft: (eventId: string) => void;
  onConfirmEvents: () => void;
  onCancelDrafts: () => void;
  onInspectSource: (event: AcademicEvent) => void;
}

const EVENT_TYPES: AcademicEventType[] = ['EXAM', 'ASSIGNMENT', 'LAB', 'LECTURE', 'OTHER'];
const PRIORITIES: EventPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

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

const PRIORITY_STYLES: Record<EventPriority, string> = {
  HIGH: 'text-red-700 bg-red-50 border-red-200',
  MEDIUM: 'text-amber-800 bg-amber-50 border-amber-200',
  LOW: 'text-slate-700 bg-slate-100 border-slate-200',
};

export const UploadIngestionView: React.FC<UploadIngestionViewProps> = ({
  pendingDocument,
  draftEvents,
  activeStage,
  simulateOfflineError,
  onStageChange,
  onDraftsParsed,
  onUpdateDraft,
  onRemoveDraft,
  onConfirmEvents,
  onCancelDrafts,
  onInspectSource,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfConsentChecked, setPdfConsentChecked] = useState(false);
  const [consentErrorHighlighted, setConsentErrorHighlighted] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [rowForm, setRowForm] = useState<{
    title: string;
    eventType: AcademicEventType;
    eventDate: string;
    startTime: string;
    endTime: string;
    priority: EventPriority;
  } | null>(null);

  const startEditingRow = (evt: AcademicEvent) => {
    setEditingRowId(evt.eventId);
    setRowForm({
      title: evt.title,
      eventType: evt.eventType,
      eventDate: evt.eventDate,
      startTime: evt.startTime ?? '',
      endTime: evt.endTime ?? '',
      priority: evt.priority,
    });
    onStageChange(3);
  };

  const saveEditingRow = (evt: AcademicEvent) => {
    if (!rowForm) return;
    const cleanTitle = rowForm.title.trim();
    if (!cleanTitle || !rowForm.eventDate) return;

    onUpdateDraft({
      ...evt,
      title: cleanTitle,
      eventType: rowForm.eventType,
      eventDate: rowForm.eventDate,
      startTime: rowForm.startTime || null,
      endTime: rowForm.endTime || null,
      priority: rowForm.priority,
      updatedAt: new Date().toISOString(),
    });
    setEditingRowId(null);
    setRowForm(null);
    onStageChange(4);
  };

  const cancelEditingRow = () => {
    setEditingRowId(null);
    setRowForm(null);
    onStageChange(2);
  };

  const processSelectedFile = async (file: File) => {
    setErrorBanner(null);
    setInfoNotice(null);
    setConsentErrorHighlighted(false);

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext !== 'pdf' && ext !== 'ics') {
      setErrorBanner('Unsupported file format. Please upload .pdf or .ics.');
      return;
    }

    const docId = createId('doc');
    const uploadedAt = new Date().toISOString();

    if (ext === 'ics') {
      setIsProcessing(true);
      setProcessingLabel('Parsing iCalendar events locally...');
      try {
        const text = await file.text();
        const parsedDrafts = parseIcsContent(text, docId);

        if (parsedDrafts.length === 0) {
          setErrorBanner('No valid VEVENT calendar entries were found in this .ics file.');
          setIsProcessing(false);
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
        setInfoNotice(`Parsed ${parsedDrafts.length} calendar events locally from ${file.name}.`);
      } catch {
        setErrorBanner('Could not read the uploaded .ics file. Please check the file and try again.');
      } finally {
        setIsProcessing(false);
        setProcessingLabel('');
      }
      return;
    }

    // PDF path: require mandatory consent checkbox first
    if (!pdfConsentChecked) {
      setConsentErrorHighlighted(true);
      setErrorBanner(
        'Please check the consent box below before processing a PDF document.'
      );
      return;
    }

    setIsProcessing(true);
    setProcessingLabel('Extracting text from PDF on your device...');
    try {
      const extracted = await extractPdfTextClientSide(file);
      const { sanitizedText, redactionCount } = scrubBasicPii(extracted.text);

      if (simulateOfflineError || !navigator.onLine) {
        setErrorBanner('AI service unavailable. Please check your connection or try again.');
        setIsProcessing(false);
        setProcessingLabel('');
        return;
      }

      setProcessingLabel('Extracting academic deadlines from anonymized text...');
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
          'No academic deadlines or scheduled events were detected in this PDF. You can add events manually in your Timeline.'
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
        `Extracted ${drafts.length} draft ${drafts.length === 1 ? 'event' : 'events'} from ${file.name}.`,
      ];
      if (redactionCount > 0) {
        notes.push(
          `${redactionCount} personal ${redactionCount === 1 ? 'identifier was' : 'identifiers were'} redacted before processing.`
        );
      }
      if (extracted.wasTruncated) {
        notes.push('Document exceeded 50,000 characters and was capped at the maximum limit.');
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const showDraftPreview = Boolean(pendingDocument && draftEvents.length > 0 && activeStage >= 2);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {errorBanner && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-medium text-red-900">{errorBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            aria-label="Dismiss error"
            className="p-1 text-red-600 hover:text-red-800 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stage 1: Upload View */}
      {!showDraftPreview && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-balance">
              Upload Course Materials or Calendar
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Import a university timetable (<span className="font-mono text-slate-800">.ics</span>)
              to parse lectures locally, or upload a syllabus or assignment brief (
              <span className="font-mono text-slate-800">.pdf</span>) to extract deadlines for
              review.
            </p>
          </div>

          {/* Mandatory PDF Consent Checkbox */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              consentErrorHighlighted
                ? 'bg-red-50 border-red-400 ring-2 ring-red-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pdfConsentChecked}
                onChange={(e) => {
                  setPdfConsentChecked(e.target.checked);
                  if (e.target.checked) {
                    setConsentErrorHighlighted(false);
                    if (errorBanner?.includes('consent')) {
                      setErrorBanner(null);
                    }
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 shrink-0"
              />
              <span className="text-sm text-slate-800 leading-relaxed">
                I consent to send anonymized PDF text to external GenAI for deadline extraction (no
                personal data stored).
              </span>
            </label>
            {consentErrorHighlighted && (
              <p className="text-xs font-medium text-red-700 mt-2 ml-7">
                Consent is required before extracting deadlines from PDF files.
              </p>
            )}
          </div>

          {/* Dropzone */}
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
            className={`rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors cursor-pointer ${
              isProcessing
                ? 'border-slate-200 bg-slate-50 cursor-wait'
                : isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70'
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
              <div className="space-y-3 py-2">
                <Loader2
                  className="w-8 h-8 text-indigo-600 animate-spin mx-auto"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-slate-900">{processingLabel}</p>
                <p className="text-xs text-slate-500">
                  Your existing confirmed timeline will not be modified until you confirm.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    Drop a .pdf or .ics file here, or click to browse
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepted formats: .pdf (up to 50,000 characters) and .ics (parsed locally
                    without AI)
                  </p>
                </div>
                <div className="pt-1 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>PDF syllabus or assignment brief</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>iCalendar (.ics) timetable</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>
              Emails and student IDs are scrubbed locally before PDF extraction. Extracted events
              are always shown as temporary drafts before saving.
            </span>
          </div>
        </section>
      )}

      {/* Stages 2, 3, 4: Human-in-the-Loop Draft Preview Table */}
      {showDraftPreview && pendingDocument && (
        <section className="space-y-5">
          {/* Mandatory Temporary Draft Onboarding Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Temporary Draft: Review or edit extracted events below, then click &apos;Confirm
                Events&apos; to save locally.
              </p>
              {infoNotice && (
                <p className="text-xs text-amber-900 mt-1">{infoNotice}</p>
              )}
            </div>
          </div>

          {/* Draft Preview Container */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Draft Events Preview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                  {pendingDocument.fileName} · {pendingDocument.fileType} ·{' '}
                  {formatFileSize(pendingDocument.fileSizeBytes)} ·{' '}
                  {draftEvents.length} {draftEvents.length === 1 ? 'draft' : 'drafts'}
                </p>
              </div>
              <span className="text-xs font-medium text-amber-800">
                Not yet saved to local storage
              </span>
            </div>

            {/* Responsive Draft Table / Rows */}
            <div className="divide-y divide-slate-200">
              {draftEvents.map((draft) => {
                const isEditing = editingRowId === draft.eventId && rowForm !== null;

                if (isEditing && rowForm) {
                  return (
                    <div key={draft.eventId} className="p-5 bg-slate-50 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={rowForm.title}
                            onChange={(e) =>
                              setRowForm({ ...rowForm, title: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Type
                          </label>
                          <select
                            value={rowForm.eventType}
                            onChange={(e) =>
                              setRowForm({
                                ...rowForm,
                                eventType: e.target.value as AcademicEventType,
                              })
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            {EVENT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {TYPE_LABELS[t]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Priority
                          </label>
                          <select
                            value={rowForm.priority}
                            onChange={(e) =>
                              setRowForm({
                                ...rowForm,
                                priority: e.target.value as EventPriority,
                              })
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            {PRIORITIES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={rowForm.eventDate}
                            onChange={(e) =>
                              setRowForm({ ...rowForm, eventDate: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={rowForm.startTime}
                              onChange={(e) =>
                                setRowForm({ ...rowForm, startTime: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={rowForm.endTime}
                              onChange={(e) =>
                                setRowForm({ ...rowForm, endTime: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditingRow}
                            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditingRow(draft)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Save Row</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={draft.eventId}
                    className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{draft.title}</p>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            PRIORITY_STYLES[draft.priority]
                          }`}
                        >
                          {draft.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 font-mono tabular-nums">
                        <span className="font-sans font-medium text-slate-700">
                          {TYPE_LABELS[draft.eventType]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{draft.eventDate}</span>
                        {draft.startTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {draft.startTime}
                              {draft.endTime ? ` – ${draft.endTime}` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {draft.sourceSnippet && (
                        <button
                          type="button"
                          onClick={() => onInspectSource(draft)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                        >
                          <Search className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                          <span>Verify Source</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEditingRow(draft)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveDraft(draft.eventId)}
                        aria-label={`Remove ${draft.title}`}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Confirmation Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                Duplicates matching title, date, and start time are skipped automatically on
                confirmation.
              </p>
              <div className="flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRowId(null);
                    setRowForm(null);
                    setInfoNotice(null);
                    onCancelDrafts();
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={draftEvents.length === 0 || editingRowId !== null}
                  onClick={onConfirmEvents}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Confirm Events ({draftEvents.length})</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
