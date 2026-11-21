import React from 'react';
import { WifiOff } from 'lucide-react';

export type ActiveView = 'timeline' | 'upload';

interface HeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  simulateOfflineError: boolean;
  onToggleSimulateOfflineError: (next: boolean) => void;
  hasPendingDrafts: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  simulateOfflineError,
  onToggleSimulateOfflineError,
  hasPendingDrafts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('timeline')}
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
        >
          SmartCampus
        </button>

        {/* Zone 2: Primary nav links */}
        <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-7">
          <button
            type="button"
            onClick={() => onSelectView('timeline')}
            className={`text-sm font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
              activeView === 'timeline'
                ? 'border-indigo-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => onSelectView('upload')}
            className={`text-sm font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
              activeView === 'upload'
                ? 'border-indigo-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload{hasPendingDrafts ? ' (Draft)' : ''}
          </button>
        </nav>

        {/* Zone 3: Live defense Offline / AI Error toggle */}
        <div className="flex items-center shrink-0">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <span className="hidden sm:inline text-xs font-medium text-slate-600 whitespace-nowrap">
              Simulate Offline / AI Error
            </span>
            <span className="sm:hidden inline-flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap">
              <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Offline</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={simulateOfflineError}
              aria-label="Simulate Offline / AI Error"
              onClick={() => onToggleSimulateOfflineError(!simulateOfflineError)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                simulateOfflineError ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                  simulateOfflineError ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      </div>
    </header>
  );
};
