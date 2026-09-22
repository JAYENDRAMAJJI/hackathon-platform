import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { apiClient } from '../lib/api';

export interface ContextItem {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface ContextSelectorProps {
  selectedContextId: string;
  onContextChange: (contextId: string) => void;
  contexts?: ContextItem[];
  variant?: 'light' | 'dark';
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  size?: 'sm' | 'md';
}

export default function ContextSelector({
  selectedContextId,
  onContextChange,
  contexts: propContexts,
  variant = 'light',
  className = '',
  showAllOption = true,
  allOptionLabel = 'All Contexts',
  size = 'md',
}: ContextSelectorProps) {
  const [loadedContexts, setLoadedContexts] = useState<ContextItem[]>(propContexts || []);
  const isDark = variant === 'dark';

  useEffect(() => {
    if (propContexts && propContexts.length > 0) {
      setLoadedContexts(propContexts);
      return;
    }

    let isMounted = true;
    const fetchContexts = async () => {
      try {
        const resp = await apiClient.get('/leaderboard/contexts');
        if (isMounted && resp?.data) {
          const list = resp.data.contexts || resp.data.contests || resp.data || [];
          if (Array.isArray(list)) {
            setLoadedContexts(list);
          }
        }
      } catch (err) {
        console.warn('[ContextSelector] Failed to fetch contexts:', err);
      }
    };

    fetchContexts();
    return () => {
      isMounted = false;
    };
  }, [propContexts]);

  const normalizedSelectedKey = (selectedContextId || 'ALL').replace(/^(contest|context):/, '');
  const isFiltered = normalizedSelectedKey !== 'ALL' && normalizedSelectedKey !== 'all' && normalizedSelectedKey !== '';

  const paddingY = size === 'sm' ? 'py-1.5' : 'py-2.5';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter
            className={`w-3.5 h-3.5 transition-colors ${
              isFiltered
                ? isDark
                  ? 'text-amber-400'
                  : 'text-indigo-600'
                : 'text-slate-400'
            }`}
          />
        </div>

        <select
          value={normalizedSelectedKey}
          onChange={(e) => onContextChange(e.target.value)}
          className={`w-full pl-9 pr-8 ${paddingY} ${fontSize} font-semibold rounded-xl border focus:outline-none appearance-none cursor-pointer transition-all ${
            isDark
              ? isFiltered
                ? 'bg-slate-800 border-amber-500/50 text-amber-300 focus:ring-1 focus:ring-amber-500/40'
                : 'bg-slate-800 border-slate-700 text-white hover:border-slate-600 focus:border-indigo-500'
              : isFiltered
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 focus:ring-2 focus:ring-indigo-500/20'
              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
          title="Filter by Context"
        >
          {showAllOption && <option value="ALL">{allOptionLabel}</option>}
          {loadedContexts.map((ctx) => (
            <option key={ctx.id} value={ctx.id}>
              {ctx.name}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={() => onContextChange('ALL')}
          title="Reset context filter"
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
