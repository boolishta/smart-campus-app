import React, { useState } from 'react';
import { AnonymizationAuditEntry, SqliteStats } from '../types';
import { anonymizeDocumentText } from '../utils/anonymizer';
import {
  ShieldCheck,
  Trash2,
  Lock,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface PrivacyPurgeSectionProps {
  auditLogs: AnonymizationAuditEntry[];
  sqliteStats: SqliteStats;
  onPurgeAllData: () => void;
  onResetSampleData: () => void;
  t: Translations;
  language: Language;
}

export const PrivacyPurgeSection: React.FC<PrivacyPurgeSectionProps> = ({
  auditLogs,
  sqliteStats,
  onPurgeAllData,
  onResetSampleData,
  t,
  language,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testText, setTestText] = useState(
    'Estudante: Tiago Silva, Nº up202305812, email: up202305812@campus.up.pt, contacto: 912345678. Entrega do trabalho de POO.'
  );
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestAnonymization = () => {
    const res = anonymizeDocumentText(testText, 'Teste_Interativo.docx');
    setTestResult(res.anonymizedText);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Privacy & GDPR Assurance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'pt' ? 'Conformidade com o RGPD & Privacidade' : 'GDPR Compliance & Privacy'}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'pt' ? `${sqliteStats.tables.eventsCount} eventos guardados no dispositivo` : `${sqliteStats.tables.eventsCount} events saved locally`}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'pt' ? 'Processamento Stateless & Eliminação de Dados' : 'Stateless Processing & Data Purge'}
          </h2>

          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {language === 'pt'
              ? 'Todos os identificadores pessoais de estudantes são anonimizados antes do envio de blocos de texto para APIs GenAI na cloud. O utilizador pode purgar a totalidade dos dados locais com um único toque.'
              : 'All student personal identifiers are stripped prior to sending text blocks to cloud GenAI APIs. Users can purge all local data in a single tap for full GDPR compliance.'}
          </p>
        </div>

        {/* Single-Tap Purge CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-xs transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{language === 'pt' ? 'Purgar Todos os Dados (GDPR)' : 'Purge All Data (GDPR)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stateless PII Anonymization Playground (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <EyeOff className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'pt' ? 'Demonstração de Sanitização Stateless' : 'Stateless PII Sanitization Inspector'}
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'pt'
              ? 'Antes de qualquer chamada a modelos de IA para reconhecimento semântico de datas, o texto bruto é inspecionado e limpo localmente:'
              : 'Before transmitting raw course text blocks to cloud AI models for semantic date extraction, all PII is scrubbed locally:'}
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {language === 'pt' ? 'Texto com Identificadores de Estudante (Simulação):' : 'Raw Text with Student Identifiers:'}
            </label>
            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              onClick={handleTestAnonymization}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'pt' ? 'Executar Anonimização' : 'Run Stateless Sanitizer'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                {language === 'pt' ? 'Payload Anónimo Enviado para API Cloud:' : 'Sanitized Payload Transmitted to Cloud:'}
              </span>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{testResult}</p>
            </div>
          )}
        </div>

        {/* Right Column: Live Audit Logs Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'pt' ? 'Registo de Redações' : 'PII Redaction Audit Log'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {auditLogs.length} {language === 'pt' ? 'itens protegidos' : 'redacted items'}
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {language === 'pt' ? 'Nenhuma informação pessoal detetada até ao momento.' : 'No student identifiers detected yet.'}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                      {log.field}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] font-mono truncate" title={log.snippet}>
                    {log.snippet}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold block">
                    ➔ Substituído por {log.redactedToken}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Single-Tap Data Purge */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {language === 'pt' ? 'Purgar Todos os Dados Locais? (GDPR)' : 'Purge All Local Data? (GDPR)'}
            </h3>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {language === 'pt'
                ? 'Esta ação elimina permanentemente da base de dados SQLite local todos os materiais carregados, rascunhos de IA, eventos de cronograma e registos de auditoria.'
                : 'This permanently wipes all uploaded materials, AI drafts, scheduled events, and audit logs from your local SQLite cache.'}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
              >
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onPurgeAllData();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                {language === 'pt' ? 'Sim, Purgar Tudo' : 'Yes, Purge All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
