import React from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { WorkflowStage } from '../types';

interface WorkflowStepperProps {
  activeStage: WorkflowStage;
  hasDrafts: boolean;
  hasConfirmedEvents: boolean;
  onSelectStage: (stage: WorkflowStage) => void;
}

const STAGES: Array<{ stage: WorkflowStage; label: string }> = [
  { stage: 1, label: '1. Upload' },
  { stage: 2, label: '2. Review' },
  { stage: 3, label: '3. Edit' },
  { stage: 4, label: '4. Confirm' },
  { stage: 5, label: '5. Timeline' },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  activeStage,
  hasDrafts,
  hasConfirmedEvents,
  onSelectStage,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar">
        <ol
          aria-label="Study planning workflow steps"
          className="flex items-center justify-between min-w-[520px] sm:min-w-0 gap-1"
        >
          {STAGES.map((item, idx) => {
            const isActive = activeStage === item.stage;
            const isPast =
              item.stage < activeStage ||
              (item.stage === 5 && hasConfirmedEvents && activeStage === 5);

            const isDisabled =
              (item.stage === 2 || item.stage === 3 || item.stage === 4) && !hasDrafts;

            return (
              <React.Fragment key={item.stage}>
                <li className="shrink-0">
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onSelectStage(item.stage)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isDisabled
                        ? 'text-slate-400 cursor-not-allowed'
                        : isPast
                        ? 'text-slate-800 hover:bg-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-mono font-semibold shrink-0 ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : isPast && !isDisabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast && !isActive && !isDisabled ? (
                        <Check className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        item.stage
                      )}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
                {idx < STAGES.length - 1 && (
                  <li aria-hidden="true" className="text-slate-300 shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
