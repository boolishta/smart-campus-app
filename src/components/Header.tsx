import React from 'react';
import { Settings, WifiOff } from 'lucide-react';

export type ActiveTab = 'briefing' | 'timeline' | 'documents';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  simulateOfflineError: boolean;
  draftCount: number;
  onOpenSettings: () => void;
}

const TABS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'documents', label: 'Documents' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  simulateOfflineError,
  draftCount,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 w-full">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onSelectTab('briefing')}
          className="text-base font-semibold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded-md"
        >
          SmartCampus
        </button>

        {/* Desktop segmented navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center p-1 bg-zinc-100 rounded-xl"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const showDot = tab.id === 'documents' && draftCount > 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <span>{tab.label}</span>
                {showDot && (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold rounded-full bg-amber-500 text-white"
                    aria-label={`${draftCount} pending drafts`}
                  >
                    {draftCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right utilities */}
        <div className="flex items-center gap-1.5 shrink-0">
          {simulateOfflineError && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 hover:bg-amber-200/80 transition-colors"
              title="Simulated offline mode active"
            >
              <WifiOff className="w-3 h-3" aria-hidden="true" />
              <span>Offline</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 inline-flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <Settings className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
