/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  StudyMaterial,
  Deadline,
  DraftEvent,
  TimelineEvent,
  MorningBriefing,
  AnonymizationAuditEntry,
  VerificationModalData,
  AppNotification,
} from './types';
import {
  INITIAL_MATERIALS,
  INITIAL_DRAFT_EVENTS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_MORNING_BRIEFING,
  INITIAL_AUDIT_LOGS,
} from './mockData';
import { sqliteDb } from './utils/sqliteDb';
import { Language, TRANSLATIONS } from './translations';
import { Header, AppTab } from './components/Header';
import { TestScenarioBar } from './components/TestScenarioBar';
import { MaterialsSection } from './components/MaterialsSection';
import { DraftPreviewSection } from './components/DraftPreviewSection';
import { UnifiedTimelineSection } from './components/UnifiedTimelineSection';
import { MorningBriefingSection } from './components/MorningBriefingSection';
import { PrivacyPurgeSection } from './components/PrivacyPurgeSection';
import { SourceVerificationModal } from './components/SourceVerificationModal';
import { FileChangeConfirmModal } from './components/FileChangeConfirmModal';
import { CheckCircle2, AlertCircle, X, ShieldAlert, BookOpen, Check, Search, ArrowRight } from 'lucide-react';

export default function App() {
  // Localization Language State (English & Portuguese)
  const [language, setLanguage] = useState<Language>('pt');
  const t = TRANSLATIONS[language];

  // Update HTML tag lang attribute
  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-PT' : 'en';
  }, [language]);

  // Navigation (Screen E01 to E07)
  const [activeTab, setActiveTab] = useState<AppTab>('materials');

  // Core State (Backed by Local SQLite Database Cache)
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_MATERIALS);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [drafts, setDrafts] = useState<DraftEvent[]>(INITIAL_DRAFT_EVENTS);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [briefing, setBriefing] = useState<MorningBriefing>(INITIAL_MORNING_BRIEFING);
  const [auditLogs, setAuditLogs] = useState<AnonymizationAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isScheduleConfirmed, setIsScheduleConfirmed] = useState<boolean>(true);

  // Scenario 2 Glitch Simulation State
  const [isGlitchActive, setIsGlitchActive] = useState<boolean>(false);

  // Screen E06: Source Verification Modal State
  const [verificationModal, setVerificationModal] = useState<VerificationModalData>({
    isOpen: false,
    eventTitle: '',
    subject: '',
    sourceDocumentName: '',
    publicationDate: '',
    extractedDueDate: '',
    dateReasoning: '',
    confidenceScore: 96,
    highlightPhrase: '',
    fullSnippet: '',
    documentType: 'docx',
  });

  // Rule RN04: Recalculation Confirmation Prompt on File Modification/Removal
  const [pendingFileChange, setPendingFileChange] = useState<{
    isOpen: boolean;
    changeType: 'added' | 'deleted';
    fileName: string;
    pendingMaterial?: StudyMaterial;
    deleteMaterialId?: string;
  }>({
    isOpen: false,
    changeType: 'added',
    fileName: '',
  });

  // Toast Notifications
  const [toast, setToast] = useState<AppNotification | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ id: `toast-${Date.now()}`, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // SQLite stats calculation
  const sqliteStats = sqliteDb.getStats(timelineEvents, materials, auditLogs);
  const uncommittedDraftsCount = drafts.filter((d) => !d.isConfirmed).length;

  // Sync to local SQLite cache
  useEffect(() => {
    sqliteDb.saveEvents(timelineEvents);
    sqliteDb.saveMaterials(materials);
    sqliteDb.saveAuditLogs(auditLogs);
  }, [timelineEvents, materials, auditLogs]);

  // ==========================================
  // MATERIAL HANDLERS (with RN04 Rule Enforcement)
  // ==========================================
  const handleAddMaterial = (newMaterial: StudyMaterial) => {
    const updated = [newMaterial, ...materials];
    setMaterials(updated);

    // Rule RN04: Mandatory modal prompt requesting confirmation to recalculate
    setPendingFileChange({
      isOpen: true,
      changeType: 'added',
      fileName: newMaterial.name,
      pendingMaterial: newMaterial,
    });
  };

  const handleDeleteMaterial = (materialId: string) => {
    const target = materials.find((m) => m.id === materialId);
    if (!target) return;

    const updated = materials.filter((m) => m.id !== materialId);
    setMaterials(updated);

    // Rule RN04: Prompt confirmation to recalculate schedule
    setPendingFileChange({
      isOpen: true,
      changeType: 'deleted',
      fileName: target.name,
      deleteMaterialId: materialId,
    });
  };

  const handleConfirmFileChangeRecalculation = () => {
    setIsScheduleConfirmed(false);
    setPendingFileChange((prev) => ({ ...prev, isOpen: false }));
    showToast(
      language === 'pt'
        ? 'Cronograma recalculado! Aceda aos Rascunhos e clique em "Confirm Events" ("Confirmar Horário") para validar.'
        : 'Schedule recalculated! Go to AI Drafts and click "Confirm Events" to commit changes.',
      'info'
    );
  };

  const handleCancelFileChangeRecalculation = () => {
    setPendingFileChange((prev) => ({ ...prev, isOpen: false }));
    showToast(t.toastFileChangeKept, 'info');
  };

  // Add drafts extracted from files
  const handleAddDraftsFromExtraction = (newDrafts: DraftEvent[]) => {
    setDrafts((prev) => [...newDrafts, ...prev]);
    setIsScheduleConfirmed(false);
    showToast(
      language === 'pt'
        ? `${newDrafts.length} rascunhos extraídos por IA aguardam revisão na Grelha de Rascunhos.`
        : `${newDrafts.length} AI draft events generated. Awaiting review in Drafts.`,
      'info'
    );
  };

  // ==========================================
  // HUMAN-IN-THE-LOOP CONTROL (Rule RN01 / Screen E02)
  // ==========================================
  const handleConfirmAllEvents = () => {
    const uncommitted = drafts.filter((d) => !d.isConfirmed);

    // Convert draft events into timeline events committed to SQLite
    const newTimelineEvents: TimelineEvent[] = uncommitted.map((d) => ({
      id: `evt-committed-${d.id}`,
      title: d.title,
      subject: d.subject,
      date: d.dueDate,
      startTime: d.time || '10:00',
      endTime: d.endTime || '12:00',
      category: d.category,
      priority: d.priority,
      location: d.location || 'Campus Universitário',
      sourceType: d.sourceDocumentName.endsWith('.ics')
        ? 'ics'
        : d.sourceDocumentName.endsWith('.docx')
        ? 'docx_extracted'
        : 'pdf_extracted',
      sourceDocumentName: d.sourceDocumentName,
      sourceSnippet: d.sourceSnippet,
      highlightPhrase: d.highlightPhrase,
      dateReasoning: d.dateReasoning,
      confidenceScore: d.confidenceScore,
      publicationDate: d.publicationDate,
    }));

    setTimelineEvents((prev) => [...prev, ...newTimelineEvents]);

    // Mark drafts as confirmed
    setDrafts((prev) => prev.map((d) => ({ ...d, isConfirmed: true })));
    setIsScheduleConfirmed(true);

    showToast(t.toastScheduleConfirmed, 'success');
  };

  const handleConfirmSingleEvent = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    const newEv: TimelineEvent = {
      id: `evt-single-${draft.id}`,
      title: draft.title,
      subject: draft.subject,
      date: draft.dueDate,
      startTime: draft.time || '10:00',
      endTime: draft.endTime || '12:00',
      category: draft.category,
      priority: draft.priority,
      location: draft.location || 'Campus Universitário',
      sourceType: draft.sourceDocumentName.endsWith('.ics') ? 'ics' : 'pdf_extracted',
      sourceDocumentName: draft.sourceDocumentName,
      sourceSnippet: draft.sourceSnippet,
      highlightPhrase: draft.highlightPhrase,
      dateReasoning: draft.dateReasoning,
      confidenceScore: draft.confidenceScore,
      publicationDate: draft.publicationDate,
    };

    setTimelineEvents((prev) => [newEv, ...prev]);
    setDrafts((prev) => prev.map((d) => (d.id === draftId ? { ...d, isConfirmed: true } : d)));
    showToast(
      language === 'pt' ? `Evento "${draft.title}" gravado no SQLite.` : `Event "${draft.title}" committed to SQLite.`
    );
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(drafts.filter((d) => d.id !== draftId));
    showToast(language === 'pt' ? 'Rascunho descartado.' : 'Draft discarded.', 'info');
  };

  // ==========================================
  // TIMELINE EVENT HANDLERS (RF04)
  // ==========================================
  const handleUpdateTimelineEvent = (updated: TimelineEvent) => {
    setTimelineEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    showToast(t.toastSlotUpdated);
  };

  const handleDeleteTimelineEvent = (id: string) => {
    setTimelineEvents((prev) => prev.filter((e) => e.id !== id));
    showToast(t.toastSlotDeleted, 'info');
  };

  const handleAddTimelineEvent = (event: TimelineEvent) => {
    setTimelineEvents((prev) => [event, ...prev]);
    showToast(t.toastSlotAdded);
  };

  // ==========================================
  // MORNING BRIEFING HANDLERS (RF03)
  // ==========================================
  const handleToggleBriefingBullet = (bulletId: string) => {
    setBriefing((prev) => ({
      ...prev,
      bullets: prev.bullets.map((b) => (b.id === bulletId ? { ...b, completed: !b.completed } : b)),
    }));
  };

  const handleUpdateDeliveryTime = (time: string) => {
    setBriefing((prev) => ({ ...prev, deliveryTime: time }));
  };

  // ==========================================
  // SOURCE VERIFICATION & GLITCH REPAIR (RF05 & Scenario 2)
  // ==========================================
  const handleVerifySourceGlitchFix = () => {
    // Re-analyzes files and restores state
    setMaterials(INITIAL_MATERIALS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setDrafts(INITIAL_DRAFT_EVENTS);
    setBriefing(INITIAL_MORNING_BRIEFING);
    setIsScheduleConfirmed(true);
    setIsGlitchActive(false);

    showToast(t.toastVerifiedSuccess, 'success');
  };

  // ==========================================
  // GDPR SINGLE-TAP DATA PURGE (RF06 / Screen E07)
  // ==========================================
  const handlePurgeAllData = () => {
    sqliteDb.purgeAllData();
    setMaterials([]);
    setDeadlines([]);
    setDrafts([]);
    setTimelineEvents([]);
    setAuditLogs([]);
    setIsScheduleConfirmed(false);
    showToast(
      language === 'pt'
        ? 'Todos os dados locais foram purgados da base de dados SQLite (Conformidade RGPD).'
        : 'All local data purged from local SQLite cache (GDPR Compliance).',
      'warning'
    );
  };

  // ==========================================
  // TEST SCENARIOS FOR EVALUATION
  // ==========================================
  const handleLoadScenario1 = () => {
    setMaterials(INITIAL_MATERIALS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setDrafts(INITIAL_DRAFT_EVENTS);
    setBriefing(INITIAL_MORNING_BRIEFING);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsScheduleConfirmed(true);
    setIsGlitchActive(false);
    setActiveTab('briefing');
    showToast(t.toastScenario1, 'success');
  };

  const handleTriggerScenario2Glitch = () => {
    setIsGlitchActive(true);
    setActiveTab('briefing');
    showToast(t.toastScenario2, 'warning');
  };

  const handleClearAll = () => {
    setMaterials([]);
    setTimelineEvents([]);
    setDrafts([]);
    setIsScheduleConfirmed(false);
    setIsGlitchActive(false);
    setActiveTab('briefing');
    showToast(t.toastRn02, 'info');
  };

  const handleResetDefaults = () => {
    setMaterials(INITIAL_MATERIALS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setDrafts(INITIAL_DRAFT_EVENTS);
    setBriefing(INITIAL_MORNING_BRIEFING);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsScheduleConfirmed(true);
    setIsGlitchActive(false);
    setIsOfflineMode(false);
    showToast(t.toastReset);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Test Scenario Toolbar for Acceptance Testing */}
      <TestScenarioBar
        onLoadScenario1={handleLoadScenario1}
        onTriggerScenario2Glitch={handleTriggerScenario2Glitch}
        onClearAll={handleClearAll}
        onResetDefaults={handleResetDefaults}
        isGlitchActive={isGlitchActive}
        activeTab={activeTab}
        t={t}
      />

      {/* Primary Top Bar (Responsive 2-Tier, No Mobile Container Overflow) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isScheduleConfirmed={isScheduleConfirmed}
        materialsCount={materials.length}
        uncommittedDraftsCount={uncommittedDraftsCount}
        language={language}
        setLanguage={(newLang) => {
          setLanguage(newLang);
          showToast(
            newLang === 'pt' ? 'Idioma alterado para Português (PT)' : 'Language switched to English (EN)',
            'info'
          );
        }}
        t={t}
        isOfflineMode={isOfflineMode}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 max-w-md animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-800'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            {toast.type === 'error' || toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-300" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-300" />
            )}
            <div className="text-xs sm:text-sm font-medium flex-1">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-28">
        {/* Screen E01: Materials & Calendars Import (RF01 / UC-01) */}
        {activeTab === 'materials' && (
          <MaterialsSection
            materials={materials}
            deadlines={deadlines}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onAddDeadline={(d) => setDeadlines([...deadlines, d])}
            onDeleteDeadline={(id) => setDeadlines(deadlines.filter((x) => x.id !== id))}
            onAddDraftsFromExtraction={handleAddDraftsFromExtraction}
            onNavigateToDrafts={() => setActiveTab('drafts')}
            onNavigateToSchedule={() => setActiveTab('timeline')}
            isScheduleConfirmed={isScheduleConfirmed}
            t={t}
            language={language}
          />
        )}

        {/* Screen E02: Draft Preview & Human-in-the-Loop Control (RN01 / RF05) */}
        {activeTab === 'drafts' && (
          <DraftPreviewSection
            drafts={drafts}
            onConfirmAllEvents={handleConfirmAllEvents}
            onConfirmSingleEvent={handleConfirmSingleEvent}
            onDeleteDraft={handleDeleteDraft}
            onEditDraft={(draft) => {
              showToast(language === 'pt' ? `Rascunho "${draft.title}" editado.` : `Draft "${draft.title}" updated.`);
            }}
            onOpenSourceVerification={(modalData) => setVerificationModal(modalData)}
            onNavigateToTimeline={() => setActiveTab('timeline')}
            confirmedCount={timelineEvents.length}
            t={t}
            language={language}
          />
        )}

        {/* Screen E03 / E04: Unified Dynamic Timeline (RF02 / RF04) */}
        {activeTab === 'timeline' && (
          <UnifiedTimelineSection
            events={timelineEvents}
            sqliteStats={sqliteStats}
            onUpdateEvent={handleUpdateTimelineEvent}
            onDeleteEvent={handleDeleteTimelineEvent}
            onAddEvent={handleAddTimelineEvent}
            onOpenSourceVerification={(modalData) => setVerificationModal(modalData)}
            t={t}
            language={language}
          />
        )}

        {/* Screen E05: Morning Text Briefing & Daily Plan (RF03 / UC-03) */}
        {activeTab === 'briefing' && (
          <div>
            {/* Rule RN02 Empty State Check */}
            {materials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-2xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t.rn02NoFilesTitle}
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {t.rn02NoFilesDesc}
                </p>
                <button
                  onClick={() => setActiveTab('materials')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.goToMaterialsBtn}</span>
                </button>
              </div>
            ) : isGlitchActive ? (
              /* Scenario 2 Glitch State with "No tasks scheduled for today." & "Verify source" */
              <div className="bg-white rounded-2xl border border-amber-300 p-8 shadow-xs max-w-3xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  No tasks scheduled for today.
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {t.glitchDesc}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleVerifySourceGlitchFix}
                    className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <span>Verify source</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {t.glitchNotice}
                </p>
              </div>
            ) : (
              <MorningBriefingSection
                briefing={briefing}
                isOfflineMode={isOfflineMode}
                onToggleOfflineMode={(offline) => setIsOfflineMode(offline)}
                onToggleBullet={handleToggleBriefingBullet}
                onUpdateDeliveryTime={handleUpdateDeliveryTime}
                onOpenSourceVerification={(modalData) => setVerificationModal(modalData)}
                onNavigateToTimeline={() => setActiveTab('timeline')}
                t={t}
                language={language}
              />
            )}
          </div>
        )}

        {/* Screen E07: Privacy & Data Purging (RF06) */}
        {activeTab === 'privacy' && (
          <PrivacyPurgeSection
            auditLogs={auditLogs}
            sqliteStats={sqliteStats}
            onPurgeAllData={handlePurgeAllData}
            onResetSampleData={handleResetDefaults}
            t={t}
            language={language}
          />
        )}
      </main>

      {/* 4. ERGONOMIC FIXED BOTTOM-RIGHT ACTION DOCK (Fix for DEF-04) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 animate-in fade-in slide-in-from-bottom-2">
        {isGlitchActive ? (
          <button
            onClick={handleVerifySourceGlitchFix}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md shadow-indigo-600/30 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify source</span>
          </button>
        ) : uncommittedDraftsCount > 0 ? (
          <>
            {/* Secondary Action: Clear Outlined Button per DEF-04 */}
            <button
              onClick={() => {
                const firstDraft = drafts.find((d) => !d.isConfirmed) || drafts[0];
                if (firstDraft) {
                  setVerificationModal({
                    isOpen: true,
                    eventTitle: firstDraft.title,
                    subject: firstDraft.subject,
                    sourceDocumentName: firstDraft.sourceDocumentName,
                    publicationDate: firstDraft.publicationDate,
                    extractedDueDate: `${firstDraft.dueDate} às ${firstDraft.time}`,
                    dateReasoning: firstDraft.dateReasoning,
                    confidenceScore: firstDraft.confidenceScore,
                    highlightPhrase: firstDraft.highlightPhrase,
                    fullSnippet: firstDraft.sourceSnippet,
                    documentType: firstDraft.sourceDocumentName.endsWith('.docx') ? 'docx' : 'pdf',
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
            >
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Verify Source</span>
            </button>

            {/* Primary Action: Solid Accent Button ("Confirm Events") per DEF-04 */}
            <button
              onClick={handleConfirmAllEvents}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>
                {language === 'pt'
                  ? `Confirmar Horário (${uncommittedDraftsCount})`
                  : `Confirm Events (${uncommittedDraftsCount})`}
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Secondary Action: Clear Outlined Button per DEF-04 */}
            <button
              onClick={() => {
                const sample = drafts[0];
                if (sample) {
                  setVerificationModal({
                    isOpen: true,
                    eventTitle: sample.title,
                    subject: sample.subject,
                    sourceDocumentName: sample.sourceDocumentName,
                    publicationDate: sample.publicationDate,
                    extractedDueDate: `${sample.dueDate} às ${sample.time}`,
                    dateReasoning: sample.dateReasoning,
                    confidenceScore: sample.confidenceScore,
                    highlightPhrase: sample.highlightPhrase,
                    fullSnippet: sample.sourceSnippet,
                    documentType: sample.sourceDocumentName.endsWith('.docx') ? 'docx' : 'pdf',
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verify Source</span>
            </button>

            {/* Primary Action: Solid Accent Button */}
            {activeTab !== 'briefing' ? (
              <button
                onClick={() => setActiveTab('briefing')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>{language === 'pt' ? 'Ver Resumo Matinal' : 'View Briefing'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('timeline')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>{language === 'pt' ? 'Ver Cronograma' : 'View Timeline'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Screen E06: Source Verification Modal (Contextual Audit) */}
      <SourceVerificationModal
        data={verificationModal}
        onClose={() => setVerificationModal((prev) => ({ ...prev, isOpen: false }))}
        t={t}
        language={language}
      />

      {/* Rule RN04: Recalculation Confirmation Modal */}
      <FileChangeConfirmModal
        isOpen={pendingFileChange.isOpen}
        changeType={pendingFileChange.changeType}
        fileName={pendingFileChange.fileName}
        onConfirm={handleConfirmFileChangeRecalculation}
        onCancel={handleCancelFileChangeRecalculation}
        t={t}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t.appName}</span>
            <span>·</span>
            <span>{t.footerMemory}</span>
            <span>·</span>
            <span className="font-medium text-slate-600">
              {language === 'pt' ? '🇵🇹 Português (Portugal)' : '🇬🇧 English (Global)'}
            </span>
          </div>
          <div>{t.footerSupportedFormats}</div>
        </div>
      </footer>
    </div>
  );
}
