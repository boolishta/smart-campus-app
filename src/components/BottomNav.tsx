import React from 'react';
import { Sun, CalendarDays, FolderUp } from 'lucide-react';
import { ActiveTab } from './Header';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  draftCount: number;
}

const ITEMS: Array<{
  id: ActiveTab;
  label: string;
  Icon: React.FC<{ className?: string; 'aria-hidden'?: boolean }>;
}> = [
  { id: 'briefing', label: 'Briefing', Icon: Sun },
  { id: 'timeline', label: 'Timeline', Icon: CalendarDays },
  { id: 'documents', label: 'Documents', Icon: FolderUp },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  draftCount,
}) => {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-zinc-200/80 pb-safe"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-3 h-16 px-2">
        {ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'documents' && draftCount > 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none ${
                isActive ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" aria-hidden />
                {showBadge && (
                  <span
                    className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center justify-center"
                    aria-label={`${draftCount} pending drafts`}
                  >
                    {draftCount}
                  </span>
                )}
              </span>
              <span className={`text-[11px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
