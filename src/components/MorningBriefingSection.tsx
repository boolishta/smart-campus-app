import React, { useState } from 'react';
import { MorningBriefing, VerificationModalData } from '../types';
import {
  Sun,
  Clock,
  CheckCircle2,
  Bell,
  Search,
  WifiOff,
  Wifi,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface MorningBriefingSectionProps {
  briefing: MorningBriefing;
  isOfflineMode: boolean;
  onToggleOfflineMode: (offline: boolean) => void;
  onToggleBullet: (bulletId: string) => void;
  onUpdateDeliveryTime: (time: string) => void;
  onOpenSourceVerification: (modalData: VerificationModalData) => void;
  onNavigateToTimeline: () => void;
  t: Translations;
  language: Language;
}

export const MorningBriefingSection: React.FC<MorningBriefingSectionProps> = ({
  briefing,
  isOfflineMode,
  onToggleOfflineMode,
  onToggleBullet,
  onUpdateDeliveryTime,
  onOpenSourceVerification,
  onNavigateToTimeline,
  t,
  language,
}) => {
  const [deliveryTimeInput, setDeliveryTimeInput] = useState(briefing.deliveryTime || '08:00');
  const [timeSavedToast, setTimeSavedToast] = useState(false);

  const handleSaveDeliveryTime = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDeliveryTime(deliveryTimeInput);
    setTimeSavedToast(true);
    setTimeout(() => setTimeSavedToast(false), 3000);
  };

  const completedCount = briefing.bullets.filter((b) => b.completed).length;

  return (
    <div className="space-y-6">
      {/* Offline Fallback Banner (Screen E05 Mandatory Graceful Degradation) */}
      {isOfflineMode && (
        <div
          role="status"
          className="bg-amber-500 text-slate-950 px-5 py-3.5 rounded-2xl shadow-sm border border-amber-600 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950/20 flex items-center justify-center font-bold">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono font-bold tracking-wider text-xs uppercase block">
                OFFLINE MODE - CACHED
              </span>
              <p className="text-xs text-slate-900 mt-0.5">
                {language === 'pt'
                  ? 'Sem ligação aos serviços de IA na cloud. O SmartCampus está a utilizar o resumo preservado no seu calendário offline.'
                  : 'Disconnected from cloud AI services. SmartCampus is serving the local task list saved offline.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggleOfflineMode(false)}
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-300 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          >
            {language === 'pt' ? 'Restaurar Ligação Online' : 'Restore Online Mode'}
          </button>
        </div>
      )}

      {/* Top Banner: Morning Briefing Overview & Delivery Time */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'pt' ? 'Resumo Matinal Inteligente' : 'Smart Morning Briefing'}</span>
            </span>

            {/* Reading time < 1 minute badge */}
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              ⏱ {language === 'pt' ? `Tempo de leitura: ${briefing.estimatedReadSeconds}s (< 1 min)` : `Reading time: ${briefing.estimatedReadSeconds}s (< 1 min)`}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'pt' ? '3 Prioridades Diárias para Hoje' : 'Today’s Top 3 Daily Priorities'}
          </h2>

          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {language === 'pt'
              ? 'Síntese concisa das tarefas essenciais geradas com base nos prazos imediatos e materiais de aula.'
              : 'Concise, high-impact daily briefing highlighting top academic priorities based on immediate deadlines.'}
          </p>
        </div>

        {/* Delivery Time Config & Offline Simulation Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Custom Notification Timing Form */}
          <form
            onSubmit={handleSaveDeliveryTime}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5"
          >
            <div className="flex items-center gap-1.5 pl-2 text-slate-600 text-xs">
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline font-medium">
                {language === 'pt' ? 'Envio Matinal:' : 'Delivery Time:'}
              </span>
            </div>
            <input
              type="time"
              value={deliveryTimeInput}
              onChange={(e) => setDeliveryTimeInput(e.target.value)}
              className="px-2 py-1 text-xs font-mono font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              {language === 'pt' ? 'Guardar' : 'Save'}
            </button>
          </form>

          {/* Interactive Offline Mode Toggle */}
          <button
            type="button"
            onClick={() => onToggleOfflineMode(!isOfflineMode)}
            title={language === 'pt' ? 'Simular perda de ligação e fallback offline' : 'Simulate network loss and offline fallback'}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              isOfflineMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isOfflineMode ? (language === 'pt' ? 'Modo Offline Ativo' : 'Offline Mode Active') : (language === 'pt' ? 'Simular Offline' : 'Simulate Offline')}</span>
          </button>
        </div>
      </div>

      {timeSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {language === 'pt'
              ? `Hora de entrega do briefing matinal atualizada para as ${deliveryTimeInput} com sucesso.`
              : `Morning text briefing delivery time updated to ${deliveryTimeInput} successfully.`}
          </span>
        </div>
      )}

      {/* 3 Concise Bullets (Screen E05 Core Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'pt' ? 'Foco Prioritário do Dia' : 'Today’s Focused Study Bullets'}
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {completedCount} / {briefing.bullets.length} {language === 'pt' ? 'concluídas' : 'completed'}
          </span>
        </div>

        <div className="space-y-3.5">
          {briefing.bullets.map((bullet, idx) => (
            <div
              key={bullet.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                bullet.completed
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Number Badge */}
                <div
                  onClick={() => onToggleBullet(bullet.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                    bullet.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bullet.completed ? <Check className="w-3.5 h-3.5" /> : `0${idx + 1}`}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {bullet.timeWindow}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      bullet.priority === 'Alta' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {bullet.priority === 'Alta' ? (language === 'pt' ? 'Prioritário' : 'High Priority') : (language === 'pt' ? 'Normal' : 'Normal')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      {bullet.subject}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold ${bullet.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {bullet.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {bullet.description}
                  </p>
                </div>
              </div>

              {/* Action: Verify Source button on briefing item (Outlined per DEF-04) */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() =>
                    onOpenSourceVerification({
                      isOpen: true,
                      eventTitle: bullet.title,
                      subject: bullet.subject,
                      sourceDocumentName: bullet.sourceDocumentName,
                      publicationDate: bullet.publicationDate,
                      extractedDueDate: bullet.timeWindow,
                      dateReasoning: bullet.dateReasoning,
                      confidenceScore: bullet.confidenceScore,
                      highlightPhrase: bullet.highlightPhrase,
                      fullSnippet: bullet.sourceSnippet,
                      documentType: bullet.sourceDocumentName.endsWith('.docx') ? 'docx' : 'pdf',
                    })
                  }
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                  title={language === 'pt' ? 'Inspecionar texto original no guião' : 'Inspect original source text'}
                >
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Verify Source</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
