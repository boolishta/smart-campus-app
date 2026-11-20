import React, { useEffect, useRef } from 'react';
import { VerificationModalData } from '../types';
import {
  FileText,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface SourceVerificationModalProps {
  data: VerificationModalData;
  onClose: () => void;
  t: Translations;
  language: Language;
}

export const SourceVerificationModal: React.FC<SourceVerificationModalProps> = ({
  data,
  onClose,
  t,
  language,
}) => {
  const targetSnippetRef = useRef<HTMLDivElement>(null);

  // Auto-scroll viewer directly to the exact target text snippet upon opening
  useEffect(() => {
    if (data.isOpen) {
      const timer = setTimeout(() => {
        targetSnippetRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [data.isOpen, data.highlightPhrase, data.fullSnippet]);

  if (!data.isOpen) return null;

  // Render high-contrast amber highlight box with target focus icon and pulsing border (Fix for DEF-02)
  const renderHighlightedSnippet = () => {
    if (!data.highlightPhrase || !data.fullSnippet.includes(data.highlightPhrase)) {
      return (
        <div
          ref={targetSnippetRef}
          className="border-2 border-amber-500 ring-4 ring-amber-400/50 bg-amber-100/90 text-amber-950 p-4 rounded-xl shadow-md transition-all animate-pulse"
        >
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Target className="w-4 h-4 text-amber-700 animate-spin" />
            <span>{language === 'pt' ? 'Foco no Excerto Alvo' : 'Target Snippet Focus'}</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed font-serif">
            {data.fullSnippet}
          </p>
        </div>
      );
    }

    const parts = data.fullSnippet.split(data.highlightPhrase);
    return (
      <div className="space-y-3">
        {/* Document surroundings (context) */}
        <div className="text-xs text-slate-500 font-serif leading-relaxed px-1">
          ... {parts[0].slice(-160)}
        </div>

        {/* 3. HIGH-CONTRAST TARGET SNIPPET BOX (Fix for DEF-02) */}
        <div
          ref={targetSnippetRef}
          className="border-2 border-amber-500 ring-4 ring-amber-400/60 bg-amber-100 text-amber-950 p-4 sm:p-5 rounded-2xl shadow-lg transition-all relative overflow-hidden"
        >
          {/* Pulsing indicator border banner */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-300">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
              <span className="p-1 rounded-md bg-amber-200/90 text-amber-900 ring-1 ring-amber-400">
                <Target className="w-4 h-4 text-amber-900 animate-pulse" />
              </span>
              <span>{language === 'pt' ? 'Excerto Alvo do Documento Original' : 'Target Document Snippet'}</span>
            </div>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
              {language === 'pt' ? 'Frase Identificada' : 'Identified Phrase'}
            </span>
          </div>

          <div className="text-sm font-bold sm:text-base leading-relaxed font-serif text-slate-950">
            <mark className="bg-amber-300/95 text-slate-950 px-2 py-0.5 rounded shadow-2xs border border-amber-400">
              {data.highlightPhrase}
            </mark>
          </div>
        </div>

        {/* Document continuation */}
        {parts[1] && (
          <div className="text-xs text-slate-500 font-serif leading-relaxed px-1">
            {parts.slice(1).join(data.highlightPhrase).slice(0, 180)} ...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-mono font-bold text-xs uppercase shrink-0">
              {data.documentType || 'DOC'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {t.sourceAuditTitle}
                </h3>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t.sourceVerifiedBadge}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate max-w-md">
                {data.sourceDocumentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* AI Semantic Extraction Transparency Box */}
          <div className="bg-indigo-50/70 rounded-xl border border-indigo-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  {language === 'pt' ? 'Transparência de Reconhecimento Inteligente' : 'Smart Recognition Transparency'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                {data.confidenceScore}% {language === 'pt' ? 'Confiança' : 'Confidence'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[11px]">
                  {language === 'pt' ? 'Data de Publicação do Documento:' : 'Document Publication Date:'}
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {data.publicationDate || '2026-09-15'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[11px]">
                  {language === 'pt' ? 'Data Limite Real / Avaliação:' : 'Actual Due Date / Exam:'}
                </span>
                <span className="font-mono font-bold text-rose-600">
                  {data.extractedDueDate}
                </span>
              </div>
            </div>

            {/* AI Reasoning explanation */}
            <div className="text-xs text-slate-700 bg-white/90 p-3 rounded-lg border border-indigo-100">
              <strong className="text-indigo-950 block mb-0.5">
                {language === 'pt' ? 'Análise do Contexto Semântico:' : 'Semantic Context Analysis:'}
              </strong>
              <p className="leading-relaxed">
                {data.dateReasoning || (language === 'pt'
                  ? 'A análise distinguiu a data em que o docente emitiu o documento da data efetiva de submissão do trabalho, eliminando falsos positivos de calendário.'
                  : 'The analysis distinguished between the document publication date and the actual student deadline, preventing false-positive calendar entries.')}
              </p>
            </div>
          </div>

          {/* Contextual Document Excerpt with High-Contrast Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.sourceAuditSnippetTitle}</span>
              </label>
              <span className="text-[11px] text-amber-900 font-medium bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {t.sourceAuditSnippetBadge}
              </span>
            </div>

            {renderHighlightedSnippet()}
          </div>

          {/* Associated Event Context */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block">{language === 'pt' ? 'Evento no Calendário:' : 'Calendar Event:'}</span>
              <span className="font-bold text-slate-900">{data.eventTitle}</span>
              <span className="text-slate-500"> ({data.subject})</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold font-mono">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{data.extractedDueDate}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Outlined button per DEF-04) */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {t.sourceAuditFooter}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
          >
            {t.closeAuditBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
