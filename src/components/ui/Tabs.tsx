'use client';
import React from 'react';

export type TabItem = string | {
  id?: string;
  value?: string;
  label: string;
  count?: number;
};

export interface TabsProps {
  tabs: readonly TabItem[] | TabItem[];
  activeTab?: string;
  active?: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, activeTab, active, onChange }: TabsProps) {
  const currentActive = activeTab ?? active ?? '';
  return (
    <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl overflow-x-auto border border-zinc-800 w-full no-scrollbar">
      {tabs.map((tab) => {
        const label = typeof tab === 'string' ? tab : tab.label;
        const value = typeof tab === 'string' ? tab : (tab.value ?? tab.id ?? '');
        const count = typeof tab === 'string' ? undefined : tab.count;
        const isActive = currentActive === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 min-h-[40px]
              ${isActive 
                ? 'bg-white text-black' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
          >
            {label}
            {count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-mono
                ${isActive 
                  ? 'bg-black/10 text-black font-semibold' 
                  : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
