import React from 'react';
import { X, WifiOff, Trash2, ShieldCheck } from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  simulateOfflineError: boolean;
  onClose: () => void;
  onToggleSimulateOfflineError: (next: boolean) => void;
  onRequestPurgeAll: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  simulateOfflineError,
  onClose,
  onToggleSimulateOfflineError,
  onRequestPurgeAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 shadow-xl overflow-hidden pb-safe">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h2 id="settings-title" className="text-base font-semibold text-zinc-950">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Demo offline toggle */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">Simulate Offline / AI Error</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Test graceful fallback using cached local priorities.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={simulateOfflineError}
              aria-label="Simulate Offline / AI Error"
              onClick={() => onToggleSimulateOfflineError(!simulateOfflineError)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${
                simulateOfflineError ? 'bg-amber-500' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                  simulateOfflineError ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-zinc-100" />

          {/* GDPR Purge */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">Purge All Data (GDPR)</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Permanently clear files, events, and briefings from this device.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestPurgeAll();
              }}
              className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0"
            >
              Purge
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
            <span>SmartCampus · Local-first planner · Accepts .pdf &amp; .ics</span>
          </div>
        </div>
      </div>
    </div>
  );
};
