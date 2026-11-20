import React from 'react';
import { PlayCircle, AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';
import { Translations } from '../translations';

interface TestScenarioBarProps {
  onLoadScenario1: () => void;
  onTriggerScenario2Glitch: () => void;
  onClearAll: () => void;
  onResetDefaults: () => void;
  isGlitchActive: boolean;
  activeTab: string;
  t: Translations;
}

export const TestScenarioBar: React.FC<TestScenarioBarProps> = ({
  onLoadScenario1,
  onTriggerScenario2Glitch,
  onClearAll,
  onResetDefaults,
  isGlitchActive,
  activeTab,
  t,
}) => {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-3 sm:px-4 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
            <span>{t.testBarTitle}</span>
          </span>
          <span className="text-slate-400 hidden xl:inline">
            {t.testBarSubtitle}
          </span>
        </div>

        <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 pb-0.5 md:pb-0">
          <button
            onClick={onLoadScenario1}
            title={t.scenario1Tooltip}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors border border-slate-700 hover:border-slate-600 whitespace-nowrap shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.scenario1Btn}</span>
          </button>

          <button
            onClick={onTriggerScenario2Glitch}
            title={t.scenario2Tooltip}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors border whitespace-nowrap shrink-0 ${
              isGlitchActive
                ? 'bg-amber-950 text-amber-200 border-amber-600 font-medium'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.scenario2Btn}</span>
          </button>

          <button
            onClick={onClearAll}
            title={t.testRn02Tooltip}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.testRn02Btn}</span>
          </button>

          <button
            onClick={onResetDefaults}
            title="Repor todos os dados / Reset all data"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white transition-colors whitespace-nowrap shrink-0 ml-auto md:ml-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
