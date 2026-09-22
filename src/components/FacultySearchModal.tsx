import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Users,
  Activity,
  AlertTriangle,
  Trophy,
  ArrowRight,
  X,
  Loader2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileCode,
  Radio,
} from 'lucide-react';
import { apiClient } from '../lib/api';

export type FacultySearchCategoryType = 'ALL' | 'STUDENT' | 'SESSION' | 'SUBMISSION' | 'ANOMALY' | 'QUESTION';

export interface SearchResultItem {
  id: string;
  type: 'STUDENT' | 'SESSION' | 'SUBMISSION' | 'ANOMALY' | 'QUESTION';
  title: string;
  subtitle: string;
  tag?: string;
  status?: string;
  severity?: string;
  level?: number;
  score?: number;
  link: string;
}

interface FacultySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_FACULTY_SEARCHES_KEY = 'hack_faculty_recent_searches_v2';

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <span>{text}</span>;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <span
            key={i}
            className="bg-amber-500/25 text-amber-300 dark:text-amber-200 font-semibold px-0.5 rounded"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

const CATEGORY_TABS: { id: FacultySearchCategoryType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'ALL', label: 'All Supervised', icon: Sparkles },
  { id: 'STUDENT', label: 'Assigned Students', icon: Users },
  { id: 'SESSION', label: 'Live Sessions', icon: Activity },
  { id: 'SUBMISSION', label: 'Submissions', icon: Trophy },
  { id: 'ANOMALY', label: 'Anomalies', icon: AlertTriangle },
  { id: 'QUESTION', label: 'Analytics', icon: FileCode },
];

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badgeBg: string }
> = {
  STUDENT: {
    label: 'Assigned Students',
    icon: User,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  SESSION: {
    label: 'Supervised Live Sessions',
    icon: Radio,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  SUBMISSION: {
    label: 'Student Code Submissions',
    icon: Trophy,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  ANOMALY: {
    label: 'Security & Integrity Alerts',
    icon: AlertTriangle,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  QUESTION: {
    label: 'Question Analytics',
    icon: FileCode,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
};

const FACULTY_QUICK_ACTIONS = [
  { label: 'Live Telemetry Monitor', path: '/faculty/live-monitoring', icon: Activity, desc: 'Real-time student coding activity and keystrokes', color: 'text-amber-400' },
  { label: 'Assigned Students Roster', path: '/faculty/students', icon: Users, desc: 'View score progression, problem attempts & statuses', color: 'text-blue-400' },
  { label: 'Supervised Submissions', path: '/faculty/submissions', icon: Trophy, desc: 'Inspect Kotlin solutions, runtime & testcase results', color: 'text-indigo-400' },
  { label: 'Security & Anomaly Alerts', path: '/faculty/anomalies', icon: AlertTriangle, desc: 'Review instant solves and multi-IP warnings', color: 'text-rose-400' },
];

export function FacultySearchModal({ isOpen, onClose }: FacultySearchModalProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FacultySearchCategoryType>('ALL');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_FACULTY_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['Jordan', 'Level 4', 'Rapid Submissions'];
    } catch {
      return ['Jordan', 'Level 4'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setCategory('ALL');
      setResults([]);
    }
  }, [isOpen]);

  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_FACULTY_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== text);
      try {
        localStorage.setItem(RECENT_FACULTY_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_FACULTY_SEARCHES_KEY);
    } catch {}
  };

  useEffect(() => {
    if (!query.trim() && category === 'ALL') {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await apiClient.get('/faculty/search', {
          q: query.trim(),
          type: category !== 'ALL' ? category : undefined,
        });
        if (resp && resp.data) {
          setResults(resp.data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Faculty search error:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category]);

  const filteredResults = useMemo(() => {
    if (category === 'ALL') return results;
    return results.filter((item) => item.type === category);
  }, [results, category]);

  const grouped = useMemo(() => {
    return filteredResults.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [filteredResults]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: results.length };
    results.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [results]);

  const flatItemsList = useMemo(() => {
    const list: SearchResultItem[] = [];
    (Object.values(grouped) as SearchResultItem[][]).forEach((items) => {
      list.push(...items);
    });
    return list;
  }, [grouped]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItemsList.length > 0) {
        setSelectedIndex((prev) => (prev < flatItemsList.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItemsList.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItemsList.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItemsList[selectedIndex]) {
        handleSelect(flatItemsList[selectedIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentIdx = CATEGORY_TABS.findIndex((t) => t.id === category);
      const nextIdx = e.shiftKey
        ? (currentIdx - 1 + CATEGORY_TABS.length) % CATEGORY_TABS.length
        : (currentIdx + 1) % CATEGORY_TABS.length;
      setCategory(CATEGORY_TABS[nextIdx].id);
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    if (query.trim()) {
      saveRecentSearch(query);
    } else {
      saveRecentSearch(item.title);
    }
    onClose();
    navigate(item.link);
  };

  const handleQuickAction = (path: string, label: string) => {
    saveRecentSearch(label);
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalContainerRef}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 overflow-hidden flex flex-col max-h-[86vh] animate-in zoom-in-95 duration-150 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90 relative">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search assigned students, live sessions, submissions, anomalies..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm sm:text-base font-medium"
          />

          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700 font-mono shadow-inner">
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-800/70 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1 shrink-0 text-slate-500 pr-1 text-[11px] font-medium uppercase tracking-wider">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Scope:</span>
          </div>

          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = category === tab.id;
            const count = categoryCounts[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-purple-800 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {!query && (
            <div className="space-y-6 py-2">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Supervisory Quick Links</span>
                  <span className="text-slate-500 text-[10px] font-normal">Assigned Cohort (35 Students)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setCategory('STUDENT')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-300">My Students</div>
                      <div className="text-[10px] text-slate-400">35 Assigned</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCategory('SESSION')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 transition-transform">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300">Live Telemetry</div>
                      <div className="text-[10px] text-slate-400">18 Active</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCategory('SUBMISSION')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300">Submissions</div>
                      <div className="text-[10px] text-slate-400">Code Reviews</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCategory('ANOMALY')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 group-hover:scale-105 transition-transform">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-rose-300">Alerts</div>
                      <div className="text-[10px] text-slate-400">Integrity Flags</div>
                    </div>
                  </button>
                </div>
              </div>

              {recentSearches.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearAllRecentSearches}
                      className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setQuery(item);
                          inputRef.current?.focus();
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white cursor-pointer transition-all"
                      >
                        <Search className="w-3 h-3 text-slate-500 group-hover:text-purple-400" />
                        <span>{item}</span>
                        <button
                          onClick={(e) => removeRecentSearch(item, e)}
                          className="text-slate-500 hover:text-rose-400 ml-1 p-0.5 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  Quick Supervisory Actions
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FACULTY_QUICK_ACTIONS.map((action, idx) => {
                    const ActionIcon = action.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleQuickAction(action.path, action.label)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${action.color}`}>
                            <ActionIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {action.label}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{action.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {query && flatItemsList.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-200">No supervised records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching student names, session IDs, or switch category filter to All.
              </p>
            </div>
          )}

          {flatItemsList.length > 0 &&
            (Object.entries(grouped) as [string, SearchResultItem[]][]).map(([type, items]) => {
              const config = TYPE_CONFIG[type] || {
                label: type,
                icon: Search,
                color: 'text-slate-400 bg-slate-500/10',
                badgeBg: 'bg-slate-500/15 text-slate-400',
              };
              const Icon = config.icon;

              return (
                <div key={type} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      {config.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-normal">
                      {items.length} {items.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  {items.map((item) => {
                    const globalFlatIdx = flatItemsList.findIndex(
                      (r) => r.id === item.id && r.type === item.type
                    );
                    const isSelected = globalFlatIdx === selectedIndex;

                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        ref={(el) => {
                          itemRefs.current[globalFlatIdx] = el;
                        }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalFlatIdx)}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-purple-600/15 border-purple-500/50 shadow-sm'
                            : 'hover:bg-slate-800/60 border-slate-800/80 bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${config.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-100 group-hover:text-white flex items-center gap-2 truncate">
                              <HighlightMatch text={item.title} query={query} />
                              {item.level && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Lvl {item.level}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                              <HighlightMatch text={item.subtitle} query={query} />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {item.tag && (
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
                                item.tag === 'HIGH' || item.tag === 'CRITICAL'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : item.tag === 'MEDIUM' || item.tag === 'PENDING'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : item.tag === 'ACCEPTED' || item.tag === 'ACTIVE'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : config.badgeBg
                              }`}
                            >
                              {item.tag}
                            </span>
                          )}

                          <div
                            className={`p-1.5 rounded-lg transition-transform ${
                              isSelected
                                ? 'text-purple-400 translate-x-0.5 bg-purple-500/10'
                                : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-slate-300">
                ↑↓
              </kbd>
              <span className="hidden sm:inline">Navigate</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-slate-300">
                ↵ Enter
              </kbd>
              <span className="hidden sm:inline">Select</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-slate-300">
                Tab
              </kbd>
              <span className="hidden sm:inline">Category</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            {flatItemsList.length > 0 && <span>{flatItemsList.length} results</span>}
            <span className="hidden sm:inline">•</span>
            <span>Faculty Supervisory Scope</span>
          </div>
        </div>
      </div>
    </div>
  );
}
