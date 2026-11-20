import React from 'react';
import {
  Calendar,
  BookOpen,
  Sparkles,
  Sun,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Wifi,
  WifiOff,
  Clock,
  Layers,
} from 'lucide-react';
import { Language, Translations } from '../translations';

export type AppTab = 'materials' | 'drafts' | 'timeline' | 'briefing' | 'privacy';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isScheduleConfirmed: boolean;
  materialsCount: number;
  uncommittedDraftsCount: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isOfflineMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isScheduleConfirmed,
  materialsCount,
  uncommittedDraftsCount,
  language,
  setLanguage,
  t,
  isOfflineMode = false,
}) => {
  // Determine current active stage (1 to 5)
  // Stage 1: Upload (materials)
  // Stage 2: Review (drafts)
  // Stage 3: Edit (timeline)
  // Stage 4: Confirm (drafts / pending confirmation)
  // Stage 5: Final Timeline (briefing / confirmed timeline)
  let activeStage = 1;
  if (activeTab === 'materials') activeStage = 1;
  else if (activeTab === 'drafts' && uncommittedDraftsCount > 0) activeStage = 2;
  else if (activeTab === 'timeline' && !isScheduleConfirmed) activeStage = 3;
  else if (activeTab === 'drafts' && uncommittedDraftsCount === 0) activeStage = 4;
  else if (activeTab === 'briefing' || (activeTab === 'timeline' && isScheduleConfirmed)) activeStage = 5;

  const stages = [
    {
      num: 1,
      label: t.step1,
      shortLabel: language === 'pt' ? 'Carregar' : 'Upload',
      targetTab: 'materials' as AppTab,
      isCompleted: materialsCount > 0,
    },
    {
      num: 2,
      label: t.step2,
      shortLabel: language === 'pt' ? 'Rever' : 'Review',
      targetTab: 'drafts' as AppTab,
      isCompleted: materialsCount > 0,
    },
    {
      num: 3,
      label: t.step3,
      shortLabel: language === 'pt' ? 'Editar' : 'Edit',
      targetTab: 'timeline' as AppTab,
      isCompleted: isScheduleConfirmed,
    },
    {
      num: 4,
      label: t.step4,
      shortLabel: language === 'pt' ? 'Confirmar' : 'Confirm',
      targetTab: 'drafts' as AppTab,
      isCompleted: isScheduleConfirmed,
    },
    {
      num: 5,
      label: t.step5,
      shortLabel: language === 'pt' ? 'Cronograma' : 'Timeline',
      targetTab: 'briefing' as AppTab,
      isCompleted: isScheduleConfirmed,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full max-w-full overflow-hidden shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Tier 1: Brand Wordmark + Status + Language Selector */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 border-b border-slate-100">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                  {t.appName}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded whitespace-nowrap hidden xs:inline">
                  {t.prototypeBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Area: Offline / Storage Status & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Offline status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800 font-bold">Offline</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{t.sqliteActive}</span>
                </>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage('pt')}
                title="Mudar para Português"
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  language === 'pt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇵🇹 PT
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                title="Switch to English"
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: 5-Stage Sequential Navigation Stepper (Fix for DEF-03) */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 sm:py-2.5 border-b border-slate-100">
          <div className="flex items-center justify-between min-w-[560px] sm:min-w-0 max-w-4xl mx-auto px-1">
            {stages.map((stage, idx) => {
              const isActive = activeStage === stage.num;
              const isPast = stage.isCompleted && !isActive;

              return (
                <React.Fragment key={stage.num}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(stage.targetTab)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold transition-all group shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-bold ring-2 ring-indigo-300 ring-offset-1'
                        : isPast
                        ? 'text-slate-800 bg-slate-100/90 hover:bg-slate-200/90'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                      }`}
                    >
                      {isPast ? '✓' : stage.num}
                    </span>
                    <span className="whitespace-nowrap">{stage.label}</span>
                  </button>

                  {idx < stages.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mx-0.5" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Tier 3: Quick Navigation Tabs */}
        <div className="w-full overflow-x-auto no-scrollbar py-1.5">
          <nav className="flex items-center gap-1 sm:gap-1.5 min-w-max text-xs">
            {/* Materials */}
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'materials'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabMaterials}</span>
              <span className={`text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full ${
                activeTab === 'materials' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {materialsCount}
              </span>
            </button>

            {/* Drafts */}
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'drafts'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.tabDrafts}</span>
              {uncommittedDraftsCount > 0 && (
                <span className="text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold animate-pulse">
                  {uncommittedDraftsCount}
                </span>
              )}
            </button>

            {/* Timeline */}
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.tabTimeline}</span>
              <span className={`text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full ${
                isScheduleConfirmed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isScheduleConfirmed ? t.statusConfirmed : t.statusPending}
              </span>
            </button>

            {/* Morning Briefing */}
            <button
              onClick={() => setActiveTab('briefing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'briefing'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.tabBriefing}</span>
            </button>

            {/* Privacy & Purge */}
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.tabPrivacy}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
