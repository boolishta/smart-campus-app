/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  AcademicEvent,
  AcademicEventType,
  DailyBriefing,
  EventPriority,
  SourceDocument,
} from './types';
import {
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
  applyDraftResolutions,
  DraftResolutionChoice,
} from './utils/deduplication';
import {
  formatTimeRange,
  getCountdownInfo,
  getEventsForBriefingWindow,
  getTodayIsoDate,
} from './utils/dateUtils';
import { ActiveTab, Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BriefingScreen } from './components/BriefingScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { DocumentsScreen } from './components/DocumentsScreen';
import { EventDetailSheet } from './components/EventDetailSheet';
import { EventFormModal } from './components/EventFormModal';
import { SourceSnippetModal } from './components/SourceSnippetModal';
import { DeleteDocumentModal } from './components/DeleteDocumentModal';
import { PurgeConfirmModal } from './components/PurgeConfirmModal';
import { SettingsSheet } from './components/SettingsSheet';

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
  // Local-first browser persistence
  const [documents, setDocuments] = useState<SourceDocument[]>(() => loadSourceDocuments());
  const [confirmedEvents, setConfirmedEvents] = useState<AcademicEvent[]>(() =>
    loadAcademicEvents()
  );
  const [briefings, setBriefings] = useState<DailyBriefing[]>(() => loadDailyBriefings());

  // Uncommitted ingestion session state
  const [pendingDocument, setPendingDocument] = useState<SourceDocument | null>(null);
  const [draftEvents, setDraftEvents] = useState<AcademicEvent[]>([]);

  // 3-screen mobile-first navigation (default: Briefing)
  const [activeTab, setActiveTab] = useState<ActiveTab>('briefing');

  // Offline / AI error simulation & briefing state
  const [simulateOfflineError, setSimulateOfflineError] = useState<boolean>(false);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState<boolean>(false);

  // Sheets & Modals
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [editingIsDraft, setEditingIsDraft] = useState<boolean>(false);
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
    }, 3800);
  };

  const todayIso = getTodayIsoDate();
  const todayBriefing = useMemo(
    () => briefings.find((b) => b.briefingDate === todayIso) ?? null,
    [briefings, todayIso]
  );

  // =========================================================
  // A) DOCUMENT INGESTION & HUMAN-IN-THE-LOOP DRAFTS
  // =========================================================
  const handleDraftsParsed = (doc: SourceDocument, drafts: AcademicEvent[]) => {
    setPendingDocument(doc);
    setDraftEvents(drafts);
    setActiveTab('documents');
  };

  const handleRemoveDraft = (eventId: string) => {
    setDraftEvents((prev) => {
      const next = prev.filter((d) => d.eventId !== eventId);
      if (next.length === 0) {
        setPendingDocument(null);
      }
      return next;
    });
  };

  const handleConfirmEvents = (resolutions: Record<string, DraftResolutionChoice>) => {
    if (!pendingDocument || draftEvents.length === 0) return;

    const { merged, addedCount, mergedCount, skippedCount } = applyDraftResolutions(
      confirmedEvents,
      draftEvents,
      resolutions
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
    setActiveTab('timeline');

    const parts: string[] = [];
    if (addedCount > 0) parts.push(`${addedCount} added`);
    if (mergedCount > 0) parts.push(`${mergedCount} merged`);
    if (skippedCount > 0) parts.push(`${skippedCount} skipped`);

    showToast(
      parts.length > 0 ? `Timeline updated: ${parts.join(', ')}.` : 'No new events were added.',
      parts.length > 0 ? 'success' : 'info'
    );
  };

  const handleCancelDrafts = () => {
    setPendingDocument(null);
    setDraftEvents([]);
    showToast('Drafts discarded.', 'info');
  };

  // =========================================================
  // B) TIMELINE CRUD & UPLOADED FILE MANAGEMENT
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

    if (editingIsDraft && data.eventId) {
      setDraftEvents((prev) =>
        prev.map((d) =>
          d.eventId === data.eventId
            ? {
                ...d,
                title: data.title,
                eventType: data.eventType,
                eventDate: data.eventDate,
                startTime: data.startTime,
                endTime: data.endTime,
                priority: data.priority,
                updatedAt: nowIso,
              }
            : d
        )
      );
      setEventModalOpen(false);
      setEditingEvent(null);
      setEditingIsDraft(false);
      showToast('Draft updated.');
      return;
    }

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
      showToast('Event added.');
    }

    saveAcademicEvents(nextEvents);
    setConfirmedEvents(nextEvents);
    setEventModalOpen(false);
    setEditingEvent(null);
    setEditingIsDraft(false);
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
    showToast('File removed. Timeline events kept.', 'info');
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
    showToast('Sample schedule loaded.');
  };

  // =========================================================
  // C) DAILY MORNING BRIEFING
  // =========================================================
  const buildFallbackBriefing = (reason: 'offline' | 'ai_error'): DailyBriefing => {
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
      fallbackReason: reason,
      createdAt: new Date().toISOString(),
    };
  };

  const handleGenerateBriefing = async () => {
    if (confirmedEvents.length === 0) {
      showToast('Upload a .pdf or .ics file first.', 'warning');
      return;
    }

    if (simulateOfflineError || !navigator.onLine) {
      const fallback = buildFallbackBriefing('offline');
      const updated = upsertDailyBriefing(briefings, fallback);
      setBriefings(updated);
      showToast('Offline mode: showing cached priorities.', 'warning');
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
        const fallback = buildFallbackBriefing('ai_error');
        const updated = upsertDailyBriefing(briefings, fallback);
        setBriefings(updated);
        showToast(payload.error || 'AI service unavailable. Showing cached priorities.', 'warning');
        return;
      }

      const nextBriefing: DailyBriefing = {
        briefingId: createId('briefing'),
        briefingDate: todayIso,
        summaryText: payload.summaryText,
        isOfflineFallback: false,
        fallbackReason: null,
        createdAt: new Date().toISOString(),
      };

      const updated = upsertDailyBriefing(briefings, nextBriefing);
      setBriefings(updated);
      showToast('Morning briefing updated.');
    } catch {
      const fallback = buildFallbackBriefing('ai_error');
      const updated = upsertDailyBriefing(briefings, fallback);
      setBriefings(updated);
      showToast('AI service unavailable. Showing cached priorities.', 'warning');
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
    setSelectedEvent(null);
    setPurgeModalOpen(false);
    setActiveTab('briefing');
    showToast('All local data permanently purged.', 'info');
  };

  const resolveDocumentName = (docId: string | null): string | null => {
    if (!docId) return null;
    if (pendingDocument?.documentId === docId) return pendingDocument.fileName;
    return documents.find((d) => d.documentId === docId)?.fileName ?? null;
  };

  const deletingDocLinkedCount = useMemo(() => {
    if (!deletingDocument) return 0;
    return confirmedEvents.filter((e) => e.documentId === deletingDocument.documentId).length;
  }, [deletingDocument, confirmedEvents]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        simulateOfflineError={simulateOfflineError}
        draftCount={draftEvents.length}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {activeTab === 'briefing' && (
          <BriefingScreen
            confirmedEvents={confirmedEvents}
            todayBriefing={todayBriefing}
            isGenerating={isGeneratingBriefing}
            simulateOfflineError={simulateOfflineError}
            onGenerateBriefing={handleGenerateBriefing}
            onNavigateToDocuments={() => setActiveTab('documents')}
            onNavigateToTimeline={() => setActiveTab('timeline')}
            onLoadSampleData={handleLoadSampleData}
            onVerifySource={(evt) => setVerifyingEvent(evt)}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineScreen
            confirmedEvents={confirmedEvents}
            onNavigateToDocuments={() => setActiveTab('documents')}
            onLoadSampleData={handleLoadSampleData}
            onOpenAddEvent={() => {
              setEditingEvent(null);
              setEditingIsDraft(false);
              setEventModalOpen(true);
            }}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsScreen
            documents={documents}
            confirmedEvents={confirmedEvents}
            pendingDocument={pendingDocument}
            draftEvents={draftEvents}
            simulateOfflineError={simulateOfflineError}
            onDraftsParsed={handleDraftsParsed}
            onEditDraft={(draft) => {
              setEditingEvent(draft);
              setEditingIsDraft(true);
              setEventModalOpen(true);
            }}
            onRemoveDraft={handleRemoveDraft}
            onConfirmEvents={handleConfirmEvents}
            onCancelDrafts={handleCancelDrafts}
            onInspectSource={(evt) => setVerifyingEvent(evt)}
            onRequestDeleteDocument={(doc) => setDeletingDocument(doc)}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        draftCount={draftEvents.length}
      />

      {/* Sheets & Modals */}
      <SettingsSheet
        isOpen={settingsOpen}
        simulateOfflineError={simulateOfflineError}
        onClose={() => setSettingsOpen(false)}
        onToggleSimulateOfflineError={(next) => {
          setSimulateOfflineError(next);
          showToast(
            next ? 'Simulated offline mode enabled.' : 'Simulated offline mode disabled.',
            next ? 'warning' : 'info'
          );
        }}
        onRequestPurgeAll={() => setPurgeModalOpen(true)}
      />

      <EventDetailSheet
        event={selectedEvent}
        documentName={selectedEvent ? resolveDocumentName(selectedEvent.documentId) : null}
        onClose={() => setSelectedEvent(null)}
        onEdit={(evt) => {
          setEditingEvent(evt);
          setEditingIsDraft(false);
          setEventModalOpen(true);
        }}
        onDelete={handleDeleteEvent}
      />

      <EventFormModal
        isOpen={eventModalOpen}
        editingEvent={editingEvent}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
          setEditingIsDraft(false);
        }}
        onSave={handleSaveEvent}
      />

      <SourceSnippetModal
        event={verifyingEvent}
        documentName={verifyingEvent ? resolveDocumentName(verifyingEvent.documentId) : null}
        onClose={() => setVerifyingEvent(null)}
        onEditEvent={(evt) => {
          setEditingEvent(evt);
          setEditingIsDraft(evt.status === 'DRAFT');
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
          className="fixed bottom-20 md:bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-40 bg-zinc-950 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5"
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
            className="text-zinc-400 hover:text-white p-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
