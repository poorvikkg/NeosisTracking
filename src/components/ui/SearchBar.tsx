'use client';
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-base md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all"
      />
    </div>
  );
}
