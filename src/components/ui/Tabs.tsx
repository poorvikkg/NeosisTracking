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
    <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl overflow-x-auto border border-zinc-800">
      {tabs.map((tab) => {
        const label = typeof tab === 'string' ? tab : tab.label;
        const value = typeof tab === 'string' ? tab : (tab.value ?? tab.id ?? '');
        const count = typeof tab === 'string' ? undefined : tab.count;
        const isActive = currentActive === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${isActive 
                ? 'bg-white text-black rounded-lg' 
                : 'text-zinc-500 hover:text-white'
              }`}
          >
            {label}
            {count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono
                ${isActive 
                  ? 'bg-black/10 text-black' 
                  : 'bg-zinc-800 text-zinc-300'
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
