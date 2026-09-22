import React from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import { LeaderboardFilterMeta } from '../types/admin';

export interface LeaderboardFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectedKey: string;
  onFilterChange: (filterKey: string) => void;
  meta?: LeaderboardFilterMeta | null;
  totalParticipants?: number;
  variant?: 'light' | 'dark';
  rightSlot?: React.ReactNode;
  className?: string;
}

export default function LeaderboardFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search participants...',
  selectedKey,
  onFilterChange,
  meta,
  variant = 'light',
  rightSlot,
  className = '',
}: LeaderboardFilterProps) {
  const isDark = variant === 'dark';

  // Dynamically populated from database contexts
  const contexts = meta?.contexts || meta?.contests || [];

  const normalizedSelectedKey = (selectedKey || 'ALL').replace(/^(contest|context):/, '');
  const isFiltered = normalizedSelectedKey !== 'ALL' && normalizedSelectedKey !== 'all' && normalizedSelectedKey !== '';

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        isDark
          ? 'bg-slate-900 border-slate-800 shadow-xl'
          : 'bg-white border-slate-200 shadow-sm'
      } ${className}`}
    >
      {/* Search Input + Context Filter Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input Box */}
        <div
          className={`relative flex-1 flex items-center rounded-xl border px-3.5 py-2.5 transition-all ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-white focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/30'
              : 'bg-slate-50 border-slate-200 text-slate-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 hover:bg-white'
          }`}
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full bg-transparent border-none text-sm placeholder:text-slate-400 focus:outline-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-slate-400 hover:text-slate-200 ml-2 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Context-Wise Dropdown Filter right next to Search */}
        <div className="relative sm:w-72 md:w-80 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Filter
              className={`w-4 h-4 ${
                isFiltered
                  ? isDark
                    ? 'text-amber-400'
                    : 'text-blue-600'
                  : 'text-slate-400'
              }`}
            />
          </div>
          <select
            value={normalizedSelectedKey}
            onChange={(e) => onFilterChange(e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 text-sm font-semibold rounded-xl border focus:outline-none appearance-none cursor-pointer transition-all ${
              isDark
                ? isFiltered
                  ? 'bg-slate-800 border-amber-500/50 text-amber-300 focus:ring-1 focus:ring-amber-500/40'
                  : 'bg-slate-800 border-slate-700 text-white hover:border-slate-600 focus:border-indigo-500'
                : isFiltered
                ? 'bg-blue-50/80 border-blue-300 text-blue-800 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
          >
            {/* 1. All Contexts Option */}
            <option value="ALL">All Contexts</option>

            {/* 2. Dynamically Rendered Context Names Only */}
            {contexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.name}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Reset button if filtered */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            title="Reset filter to All / Overall"
            className={`px-3 py-2.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Right Slot (e.g. Faculty Cohort toggle) */}
        {rightSlot && (
          <div className="shrink-0">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}
