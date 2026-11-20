import React from 'react';
import { DraftEvent, VerificationModalData } from '../types';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface DraftPreviewSectionProps {
  drafts: DraftEvent[];
  onConfirmAllEvents: () => void;
  onConfirmSingleEvent: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onEditDraft: (draft: DraftEvent) => void;
  onOpenSourceVerification: (modalData: VerificationModalData) => void;
  onNavigateToTimeline: () => void;
  confirmedCount: number;
  t: Translations;
  language: Language;
}

export const DraftPreviewSection: React.FC<DraftPreviewSectionProps> = ({
  drafts,
  onConfirmAllEvents,
  onConfirmSingleEvent,
  onDeleteDraft,
  onEditDraft,
  onOpenSourceVerification,
  onNavigateToTimeline,
  confirmedCount,
  t,
  language,
}) => {
  const uncommittedDrafts = drafts.filter((d) => !d.isConfirmed);

  return (
    <div className="space-y-6">
      {/* 2. DRAFT STATE ONBOARDING BANNER (Fix for DEF-01) */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-800" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 border border-amber-300 px-2 py-0.5 rounded">
              {language === 'pt' ? 'Rascunho Provisório' : 'Temporary Draft'}
            </span>
            <span className="text-xs font-semibold text-amber-800">
              {uncommittedDrafts.length}{' '}
              {language === 'pt' ? 'eventos aguardando confirmação' : 'uncommitted drafts'}
            </span>
          </div>
          <p className="text-sm font-semibold text-amber-950 leading-snug">
            {t.draftOnboardingBanner}
          </p>
          <p className="text-xs text-amber-800 mt-1">
            {t.draftUncommittedNotice}
          </p>
        </div>
      </div>

      {/* Draft Review Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'pt' ? 'Revisão de Eventos Extraídos por Inteligência Artificial' : 'AI Draft Events Review Grid'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {language === 'pt'
              ? 'Todos os prazos e avaliações encontrados nos seus documentos estão listados abaixo. Pode verificar a frase original de cada evento ou editá-lo antes de confirmar.'
              : 'All deadlines and exam dates identified in your uploaded course materials are listed below. You can verify the original source document or edit event details before confirming.'}
          </p>
        </div>

        {/* Primary Action Button: Solid Accent ("Confirm Events") */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onConfirmAllEvents}
            disabled={uncommittedDrafts.length === 0}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all ${
              uncommittedDrafts.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-600/25 ring-2 ring-indigo-400/40'
                : 'bg-slate-300 cursor-not-allowed opacity-60'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {language === 'pt'
                ? `Confirmar Horário (${uncommittedDrafts.length} Eventos)`
                : `Confirm Events (${uncommittedDrafts.length} Drafts)`}
            </span>
          </button>

          {confirmedCount > 0 && (
            <button
              onClick={onNavigateToTimeline}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
            >
              <span>{language === 'pt' ? 'Ver Cronograma' : 'View Timeline'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Draft Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'pt' ? 'Lista de Eventos Extraídos' : 'Extracted Events List'}
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {uncommittedDrafts.length > 0
              ? language === 'pt'
                ? `${uncommittedDrafts.length} aguardando gravação`
                : `${uncommittedDrafts.length} pending save`
              : language === 'pt'
              ? 'Todos gravados'
              : 'All saved'}
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800">
              {language === 'pt' ? 'Todos os eventos foram confirmados!' : 'All draft events confirmed!'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'pt'
                ? 'Estão agora gravados no seu calendário e ativos no Cronograma Semanal.'
                : 'They are now saved to your offline calendar and active in your Weekly Schedule.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {drafts.map((draft) => {
              const categoryColors: Record<string, string> = {
                'Entregas de Projeto': 'bg-blue-50 text-blue-700 border-blue-200',
                'Exames / Frequências': 'bg-rose-50 text-rose-700 border-rose-200',
                'Aulas Práticas / Labs': 'bg-purple-50 text-purple-700 border-purple-200',
                'Aulas Teóricas': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                'Apresentações': 'bg-amber-50 text-amber-700 border-amber-200',
              };

              return (
                <div
                  key={draft.id}
                  className={`p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    draft.isConfirmed ? 'bg-slate-50/40 opacity-70' : 'bg-white hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left Column: Event details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        categoryColors[draft.category] || 'bg-slate-100 text-slate-700'
                      }`}>
                        {draft.category}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {draft.dueDate} · {draft.time}
                      </span>

                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {draft.confidenceScore}% {language === 'pt' ? 'Confiança' : 'Confidence'}
                      </span>

                      {draft.isConfirmed ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{language === 'pt' ? 'Gravado no Calendário' : 'Saved to Calendar'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {language === 'pt' ? 'Rascunho Provisório' : 'Temporary Draft'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {draft.title}
                    </h4>

                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-800">{draft.subject}</strong>
                      {draft.location && ` · Local: ${draft.location}`}
                      {draft.weight && ` · Ponderação: ${draft.weight}`}
                    </p>

                    {/* AI Reasoning preview */}
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 max-w-2xl">
                      <span className="font-semibold text-slate-800 not-italic">
                        {language === 'pt' ? 'Contexto do Documento:' : 'Document Context:'}
                      </span>{' '}
                      {draft.dateReasoning}
                    </p>
                  </div>

                  {/* Right Column: Actions (Outlined secondary buttons per DEF-04) */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Secondary Outlined Action: "Verify Source" */}
                    <button
                      onClick={() =>
                        onOpenSourceVerification({
                          isOpen: true,
                          eventTitle: draft.title,
                          subject: draft.subject,
                          sourceDocumentName: draft.sourceDocumentName,
                          publicationDate: draft.publicationDate,
                          extractedDueDate: `${draft.dueDate} às ${draft.time}`,
                          dateReasoning: draft.dateReasoning,
                          confidenceScore: draft.confidenceScore,
                          highlightPhrase: draft.highlightPhrase,
                          fullSnippet: draft.sourceSnippet,
                          documentType: draft.sourceDocumentName.endsWith('.docx') ? 'docx' : 'pdf',
                        })
                      }
                      title={language === 'pt' ? 'Auditar documento com realce amarelo' : 'Audit source document with yellow highlight'}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Verify Source</span>
                    </button>

                    {!draft.isConfirmed && (
                      <button
                        onClick={() => onConfirmSingleEvent(draft.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'pt' ? 'Confirmar' : 'Confirm'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title={language === 'pt' ? 'Descartar rascunho' : 'Discard draft'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
