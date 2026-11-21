/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';
import {
  AcademicEvent,
  AcademicEventType,
  DailyBriefing,
  EventPriority,
  SourceDocument,
  WorkflowStage,
} from './types';
import {
  confirmAndDeduplicateEvents,
  createSampleDataset,
  loadAcademicEvents,
  loadDailyBriefings,
  loadSourceDocuments,
  purgeAllLocalData,
  saveAcademicEvents,
  saveDailyBriefings,
  saveSourceDocuments,
  upsertDailyBriefing,
} from './utils/storage';
import {
  formatTimeRange,
  getCountdownInfo,
  getEventsForBriefingWindow,
  getTodayIsoDate,
} from './utils/dateUtils';
import { ActiveView, Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
import { UploadIngestionView } from './components/UploadIngestionView';
import { TimelineDashboard } from './components/TimelineDashboard';
import { EventFormModal } from './components/EventFormModal';
import { SourceSnippetModal } from './components/SourceSnippetModal';
import { DeleteDocumentModal } from './components/DeleteDocumentModal';
import { PurgeConfirmModal } from './components/PurgeConfirmModal';

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'warning';
}

export default function App() {
  // Real browser persistence (survives page reload without overwriting)
  const [documents, setDocuments] = useState<SourceDocument[]>(() => loadSourceDocuments());
  const [confirmedEvents, setConfirmedEvents] = useState<AcademicEvent[]>(() =>
    loadAcademicEvents()
  );
  const [briefings, setBriefings] = useState<DailyBriefing[]>(() => loadDailyBriefings());

  // Uncommitted ingestion session state (never written to localStorage until Confirm Events)
  const [pendingDocument, setPendingDocument] = useState<SourceDocument | null>(null);
  const [draftEvents, setDraftEvents] = useState<AcademicEvent[]>([]);

  // Navigation & 5-Stage Stepper state
  const [activeView, setActiveView] = useState<ActiveView>('timeline');
  const [activeStage, setActiveStage] = useState<WorkflowStage>(5);

  // Live defense demo toggle
  const [simulateOfflineError, setSimulateOfflineError] = useState<boolean>(false);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState<boolean>(false);

  // Modals
  const [eventModalOpen, setEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [verifyingEvent, setVerifyingEvent] = useState<AcademicEvent | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<SourceDocument | null>(null);
  const [purgeModalOpen, setPurgeModalOpen] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string, tone: ToastMessage['tone'] = 'success') => {
    const id = createId('toast');
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const todayIso = getTodayIsoDate();
  const todayBriefing = useMemo(
    () => briefings.find((b) => b.briefingDate === todayIso) ?? null,
    [briefings, todayIso]
  );

  // View & Stepper navigation
  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'timeline') {
      setActiveStage(5);
    } else if (pendingDocument && draftEvents.length > 0) {
      setActiveStage(2);
    } else {
      setActiveStage(1);
    }
  };

  const handleSelectStage = (stage: WorkflowStage) => {
    setActiveStage(stage);
    if (stage === 5) {
      setActiveView('timeline');
    } else {
      setActiveView('upload');
    }
  };

  // =========================================================
  // A) UPLOAD & HUMAN-IN-THE-LOOP INGESTION
  // =========================================================
  const handleDraftsParsed = (doc: SourceDocument, drafts: AcademicEvent[]) => {
    setPendingDocument(doc);
    setDraftEvents(drafts);
    setActiveView('upload');
    setActiveStage(2);
  };

  const handleUpdateDraft = (updated: AcademicEvent) => {
    setDraftEvents((prev) =>
      prev.map((d) => (d.eventId === updated.eventId ? updated : d))
    );
  };

  const handleRemoveDraft = (eventId: string) => {
    setDraftEvents((prev) => {
      const next = prev.filter((d) => d.eventId !== eventId);
      if (next.length === 0) {
        setPendingDocument(null);
        setActiveStage(1);
      }
      return next;
    });
  };

  const handleConfirmEvents = () => {
    if (!pendingDocument || draftEvents.length === 0) return;

    const { merged, addedCount, skippedCount } = confirmAndDeduplicateEvents(
      confirmedEvents,
      draftEvents
    );

    const confirmedDoc: SourceDocument = {
      ...pendingDocument,
      ingestionStatus: 'CONFIRMED',
    };

    const nextDocuments = [confirmedDoc, ...documents];
    saveSourceDocuments(nextDocuments);
    saveAcademicEvents(merged);

    setDocuments(nextDocuments);
    setConfirmedEvents(merged);
    setPendingDocument(null);
    setDraftEvents([]);
    setActiveView('timeline');
    setActiveStage(5);

    if (skippedCount > 0) {
      showToast(
        `Saved ${addedCount} ${addedCount === 1 ? 'event' : 'events'} locally (${skippedCount} ${
          skippedCount === 1 ? 'duplicate' : 'duplicates'
        } skipped).`
      );
    } else {
      showToast(`Saved ${addedCount} ${addedCount === 1 ? 'event' : 'events'} to your timeline.`);
    }
  };

  const handleCancelDrafts = () => {
    // Discard drafts with ZERO writes to localStorage
    setPendingDocument(null);
    setDraftEvents([]);
    setActiveStage(1);
    showToast('Temporary drafts discarded. No changes were saved.', 'info');
  };

  // =========================================================
  // B) TIMELINE FULL CRUD & UPLOADED FILE MANAGEMENT
  // =========================================================
  const handleSaveEvent = (data: {
    eventId?: string;
    title: string;
    eventType: AcademicEventType;
    eventDate: string;
    startTime: string | null;
    endTime: string | null;
    priority: EventPriority;
  }) => {
    const nowIso = new Date().toISOString();
    let nextEvents: AcademicEvent[];

    if (data.eventId) {
      nextEvents = confirmedEvents.map((evt) =>
        evt.eventId === data.eventId
          ? {
              ...evt,
              title: data.title,
              eventType: data.eventType,
              eventDate: data.eventDate,
              startTime: data.startTime,
              endTime: data.endTime,
              priority: data.priority,
              updatedAt: nowIso,
            }
          : evt
      );
      showToast('Event updated.');
    } else {
      const created: AcademicEvent = {
        eventId: createId('evt'),
        documentId: null,
        title: data.title,
        eventType: data.eventType,
        eventDate: data.eventDate,
        startTime: data.startTime,
        endTime: data.endTime,
        priority: data.priority,
        status: 'CONFIRMED',
        sourceSnippet: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      nextEvents = [...confirmedEvents, created];
      showToast('Event added to your timeline.');
    }

    saveAcademicEvents(nextEvents);
    setConfirmedEvents(nextEvents);
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    const nextEvents = confirmedEvents.filter((e) => e.eventId !== eventId);
    saveAcademicEvents(nextEvents);
    setConfirmedEvents(nextEvents);
    showToast('Event deleted.', 'info');
  };

  const handleDeleteDocumentOnly = (documentId: string) => {
    const nextDocs = documents.filter((d) => d.documentId !== documentId);
    const nextEvents = confirmedEvents.map((e) =>
      e.documentId === documentId ? { ...e, documentId: null } : e
    );
    saveSourceDocuments(nextDocs);
    saveAcademicEvents(nextEvents);
    setDocuments(nextDocs);
    setConfirmedEvents(nextEvents);
    setDeletingDocument(null);
    showToast('File removed. Timeline events were kept.', 'info');
  };

  const handleDeleteDocumentWithEvents = (documentId: string) => {
    const nextDocs = documents.filter((d) => d.documentId !== documentId);
    const nextEvents = confirmedEvents.filter((e) => e.documentId !== documentId);
    saveSourceDocuments(nextDocs);
    saveAcademicEvents(nextEvents);
    setDocuments(nextDocs);
    setConfirmedEvents(nextEvents);
    setDeletingDocument(null);
    showToast('File and linked events removed.', 'info');
  };

  const handleLoadSampleData = () => {
    if (confirmedEvents.length > 0) return;
    const sample = createSampleDataset(todayIso);
    saveSourceDocuments(sample.documents);
    saveAcademicEvents(sample.events);
    setDocuments(sample.documents);
    setConfirmedEvents(sample.events);
    showToast('Sample course schedule loaded and saved locally.');
  };

  // =========================================================
  // C) DAILY MORNING BRIEFING (08:00 AM)
  // =========================================================
  const buildOfflineFallbackBriefing = (): DailyBriefing => {
    const upcoming = getEventsForBriefingWindow(confirmedEvents, todayIso).slice(0, 3);
    const lines = upcoming.map((evt, idx) => {
      const countdown = getCountdownInfo(evt.eventDate, todayIso);
      return `${idx + 1}. ${evt.title} (${countdown.label}, ${formatTimeRange(
        evt.startTime,
        evt.endTime
      )}) — Priority: ${evt.priority}`;
    });

    return {
      briefingId: createId('briefing'),
      briefingDate: todayIso,
      summaryText: lines.join('\n'),
      isOfflineFallback: true,
      createdAt: new Date().toISOString(),
    };
  };

  const handleGenerateBriefing = async () => {
    // Empty Plan Guard
    if (confirmedEvents.length === 0) {
      showToast('No confirmed schedule found. Please upload a .pdf or .ics file first.', 'warning');
      return;
    }

    // Offline / AI Error graceful degradation
    if (simulateOfflineError || !navigator.onLine) {
      const fallback = buildOfflineFallbackBriefing();
      const updated = upsertDailyBriefing(briefings, fallback);
      setBriefings(updated);
      showToast('Offline mode active: showing cached local priorities.', 'warning');
      return;
    }

    setIsGeneratingBriefing(true);
    try {
      const windowEvents = getEventsForBriefingWindow(confirmedEvents, todayIso);
      const anonymizedPayload = windowEvents.map((evt) => ({
        title: evt.title,
        eventType: evt.eventType,
        eventDate: evt.eventDate,
        startTime: evt.startTime,
        endTime: evt.endTime,
        priority: evt.priority,
      }));

      const response = await fetch('/api/morning-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: anonymizedPayload,
          todayDate: todayIso,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        summaryText?: string;
        error?: string;
      };

      if (!response.ok || !payload.summaryText) {
        const fallback = buildOfflineFallbackBriefing();
        const updated = upsertDailyBriefing(briefings, fallback);
        setBriefings(updated);
        showToast('AI service unavailable. Showing cached local schedule.', 'warning');
        return;
      }

      const nextBriefing: DailyBriefing = {
        briefingId: createId('briefing'),
        briefingDate: todayIso,
        summaryText: payload.summaryText,
        isOfflineFallback: false,
        createdAt: new Date().toISOString(),
      };

      const updated = upsertDailyBriefing(briefings, nextBriefing);
      setBriefings(updated);
      showToast('Daily morning briefing updated.');
    } catch {
      const fallback = buildOfflineFallbackBriefing();
      const updated = upsertDailyBriefing(briefings, fallback);
      setBriefings(updated);
      showToast('AI service unavailable. Showing cached local schedule.', 'warning');
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  // =========================================================
  // D) GDPR PERMANENT DATA PURGE
  // =========================================================
  const handleConfirmPurgeAll = () => {
    purgeAllLocalData();
    saveSourceDocuments([]);
    saveAcademicEvents([]);
    saveDailyBriefings([]);
    purgeAllLocalData();

    setDocuments([]);
    setConfirmedEvents([]);
    setBriefings([]);
    setPendingDocument(null);
    setDraftEvents([]);
    setPurgeModalOpen(false);
    setActiveView('timeline');
    setActiveStage(5);
    showToast('All local data has been permanently purged.', 'info');
  };

  const verifyingDocName = useMemo(() => {
    if (!verifyingEvent?.documentId) return null;
    if (pendingDocument?.documentId === verifyingEvent.documentId) {
      return pendingDocument.fileName;
    }
    return documents.find((d) => d.documentId === verifyingEvent.documentId)?.fileName ?? null;
  }, [verifyingEvent, pendingDocument, documents]);

  const deletingDocLinkedCount = useMemo(() => {
    if (!deletingDocument) return 0;
    return confirmedEvents.filter((e) => e.documentId === deletingDocument.documentId).length;
  }, [deletingDocument, confirmedEvents]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeView={activeView}
        onSelectView={handleSelectView}
        simulateOfflineError={simulateOfflineError}
        onToggleSimulateOfflineError={(next) => {
          setSimulateOfflineError(next);
          showToast(
            next
              ? 'Simulated Offline / AI Error enabled.'
              : 'Simulated Offline / AI Error disabled.',
            next ? 'warning' : 'info'
          );
        }}
        hasPendingDrafts={draftEvents.length > 0}
      />

      <WorkflowStepper
        activeStage={activeStage}
        hasDrafts={draftEvents.length > 0}
        hasConfirmedEvents={confirmedEvents.length > 0}
        onSelectStage={handleSelectStage}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'upload' ? (
          <UploadIngestionView
            pendingDocument={pendingDocument}
            draftEvents={draftEvents}
            activeStage={activeStage}
            simulateOfflineError={simulateOfflineError}
            onStageChange={setActiveStage}
            onDraftsParsed={handleDraftsParsed}
            onUpdateDraft={handleUpdateDraft}
            onRemoveDraft={handleRemoveDraft}
            onConfirmEvents={handleConfirmEvents}
            onCancelDrafts={handleCancelDrafts}
            onInspectSource={(evt) => setVerifyingEvent(evt)}
          />
        ) : (
          <TimelineDashboard
            documents={documents}
            confirmedEvents={confirmedEvents}
            todayBriefing={todayBriefing}
            isGeneratingBriefing={isGeneratingBriefing}
            simulateOfflineError={simulateOfflineError}
            onGenerateBriefing={handleGenerateBriefing}
            onNavigateToUpload={() => handleSelectView('upload')}
            onLoadSampleData={handleLoadSampleData}
            onOpenAddEvent={() => {
              setEditingEvent(null);
              setEventModalOpen(true);
            }}
            onOpenEditEvent={(evt) => {
              setEditingEvent(evt);
              setEventModalOpen(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onVerifySource={(evt) => setVerifyingEvent(evt)}
            onRequestDeleteDocument={(doc) => setDeletingDocument(doc)}
          />
        )}
      </main>

      {/* Footer with GDPR Purge Control */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-semibold text-slate-800">SmartCampus</span>
            <span aria-hidden="true">·</span>
            <span>Local-first academic planner</span>
            <span aria-hidden="true">·</span>
            <span>Accepts .pdf and .ics</span>
          </div>

          <button
            type="button"
            onClick={() => setPurgeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Purge All Data (GDPR)</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <EventFormModal
        isOpen={eventModalOpen}
        editingEvent={editingEvent}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />

      <SourceSnippetModal
        event={verifyingEvent}
        documentName={verifyingDocName}
        onClose={() => setVerifyingEvent(null)}
        onEditEvent={(evt) => {
          setEditingEvent(evt);
          setEventModalOpen(true);
        }}
      />

      <DeleteDocumentModal
        document={deletingDocument}
        linkedEventsCount={deletingDocLinkedCount}
        onClose={() => setDeletingDocument(null)}
        onDeleteDocumentOnly={handleDeleteDocumentOnly}
        onDeleteWithLinkedEvents={handleDeleteDocumentWithEvents}
      />

      <PurgeConfirmModal
        isOpen={purgeModalOpen}
        onClose={() => setPurgeModalOpen(false)}
        onConfirmPurge={handleConfirmPurgeAll}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2.5"
        >
          {toast.tone === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <p className="text-xs sm:text-sm font-medium flex-1">{toast.text}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
