import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Users,
  UserCheck,
  FileCode,
  Activity,
  AlertTriangle,
  Shield,
  Trophy,
  ArrowRight,
  X,
  Loader2,
  Clock,
  ExternalLink,
  Sparkles,
  Command,
  CornerDownLeft,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Settings,
  BarChart2,
  Radio,
  FileText,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../lib/api';

export type SearchCategoryType =
  | 'ALL'
  | 'STUDENT'
  | 'FACULTY'
  | 'QUESTION'
  | 'SESSION'
  | 'SUBMISSION'
  | 'ANOMALY'
  | 'AUDIT_LOG'
  | 'CONTEST';

export interface SearchResultItem {
  id: string;
  type: 'STUDENT' | 'FACULTY' | 'QUESTION' | 'SESSION' | 'SUBMISSION' | 'ANOMALY' | 'AUDIT_LOG' | 'CONTEST';
  title: string;
  subtitle: string;
  tag?: string;
  status?: string;
  severity?: string;
  level?: number;
  score?: number;
  department?: string;
  link: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'hack_admin_recent_searches_v2';

// Helper component to highlight search matching substrings
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

const CATEGORY_TABS: { id: SearchCategoryType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'ALL', label: 'All', icon: Sparkles },
  { id: 'STUDENT', label: 'Students', icon: Users },
  { id: 'FACULTY', label: 'Faculty', icon: UserCheck },
  { id: 'QUESTION', label: 'Questions', icon: FileCode },
  { id: 'SESSION', label: 'Live Sessions', icon: Activity },
  { id: 'SUBMISSION', label: 'Submissions', icon: Trophy },
  { id: 'ANOMALY', label: 'Anomalies', icon: AlertTriangle },
  { id: 'AUDIT_LOG', label: 'Audit Logs', icon: Shield },
  { id: 'CONTEST', label: 'Contests', icon: Calendar },
];

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badgeBg: string; border: string }
> = {
  STUDENT: {
    label: 'Students',
    icon: User,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    border: 'border-blue-500/30',
  },
  FACULTY: {
    label: 'Faculty',
    icon: UserCheck,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    border: 'border-purple-500/30',
  },
  QUESTION: {
    label: 'Questions',
    icon: FileCode,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/30',
  },
  SESSION: {
    label: 'Live Sessions',
    icon: Radio,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/30',
  },
  SUBMISSION: {
    label: 'Submissions',
    icon: Trophy,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    border: 'border-indigo-500/30',
  },
  ANOMALY: {
    label: 'Security Anomalies',
    icon: AlertTriangle,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    border: 'border-rose-500/30',
  },
  AUDIT_LOG: {
    label: 'Audit Logs',
    icon: Shield,
    color: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
    badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    border: 'border-slate-500/30',
  },
  CONTEST: {
    label: 'Contests',
    icon: Calendar,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    border: 'border-cyan-500/30',
  },
};

const QUICK_ACTIONS = [
  { label: 'Live Session Monitor', path: '/admin/live-monitoring', icon: Activity, desc: 'Real-time telemetry & active participant sessions', color: 'text-amber-400' },
  { label: 'Contest Leaderboard', path: '/admin/leaderboard', icon: Trophy, desc: 'Live rankings, dynamic points & solve counts', color: 'text-yellow-400' },
  { label: 'Manage Questions', path: '/admin/questions', icon: FileCode, desc: 'Question bank, difficulty levels & testcases', color: 'text-emerald-400' },
  { label: 'Security & Anomalies', path: '/admin/anomalies', icon: AlertTriangle, desc: 'Instant solve alerts & suspicious tab activity', color: 'text-rose-400' },
  { label: 'Reports Hub', path: '/admin/reports', icon: BarChart2, desc: 'Export student performance & submission metrics', color: 'text-indigo-400' },
  { label: 'Platform Settings', path: '/admin/settings', icon: Settings, desc: 'Scoring weights, sandbox rules & OAuth security', color: 'text-blue-400' },
];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategoryType>('ALL');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['Two Sum', 'Jordan', 'Rapid Submissions', 'Level 4'];
    } catch {
      return ['Two Sum', 'Jordan', 'Rapid Submissions'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  // Focus input and reset when opened
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

  // Persist recent searches
  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== text);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Fetch search results from API
  useEffect(() => {
    if (!query.trim() && category === 'ALL') {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await apiClient.get('/admin/search', {
          q: query.trim(),
          type: category !== 'ALL' ? category : undefined,
        });
        if (resp && resp.data) {
          setResults(resp.data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category]);

  // Filter results by category if selected
  const filteredResults = useMemo(() => {
    if (category === 'ALL') return results;
    return results.filter((item) => item.type === category);
  }, [results, category]);

  // Grouped results for categorized view
  const grouped = useMemo(() => {
    return filteredResults.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [filteredResults]);

  // Count items by category for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: results.length };
    results.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [results]);

  // Flat list for keyboard navigation tracking
  const flatItemsList = useMemo(() => {
    const list: SearchResultItem[] = [];
    (Object.values(grouped) as SearchResultItem[][]).forEach((items) => {
      list.push(...items);
    });
    return list;
  }, [grouped]);

  // Scroll selected item into view smoothly
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
      // Cycle through category tabs
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

  const handleRecentClick = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  const handleTagQuickFilter = (catId: SearchCategoryType) => {
    setCategory(catId);
    if (!query) {
      setQuery('');
    }
    inputRef.current?.focus();
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
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search students, questions, live sessions, submissions, anomalies, audit logs..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm sm:text-base font-medium"
          />

          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear input"
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

        {/* Category Filter Pills Row */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-800/70 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1 shrink-0 text-slate-500 pr-1 text-[11px] font-medium uppercase tracking-wider">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filter:</span>
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
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
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
        <div ref={listContainerRef} className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Initial / Empty State */}
          {!query && (
            <div className="space-y-6 py-2">
              {/* Interactive Category Jump Cards */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Browse by Category</span>
                  <span className="text-slate-500 text-[10px] font-normal">Click category to filter platform data</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleTagQuickFilter('STUDENT')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-300">Students</div>
                      <div className="text-[10px] text-slate-400">71 Registered</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTagQuickFilter('QUESTION')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-transform">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-300">Questions</div>
                      <div className="text-[10px] text-slate-400">Level 1 - 10 Bank</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTagQuickFilter('SESSION')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 transition-transform">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300">Live Sessions</div>
                      <div className="text-[10px] text-slate-400">Real-time Monitor</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTagQuickFilter('ANOMALY')}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 group-hover:scale-105 transition-transform">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-rose-300">Anomalies</div>
                      <div className="text-[10px] text-slate-400">Security Alerts</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Searches Section */}
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
                      Clear History
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleRecentClick(item)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white cursor-pointer transition-all shadow-sm"
                      >
                        <Search className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                        <span>{item}</span>
                        <button
                          onClick={(e) => removeRecentSearch(item, e)}
                          className="text-slate-500 hover:text-rose-400 ml-1 p-0.5 rounded transition-colors"
                          title="Remove from history"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Navigation / Shortcuts */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  Direct Navigation Shortcuts
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action, idx) => {
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

          {/* No Results Found */}
          {query && flatItemsList.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-200">No matching records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching with student names (e.g. Jordan), question titles, anomaly types, or switch category filters.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setCategory('ALL')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    setQuery('');
                    setCategory('ALL');
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium shadow-sm transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Categorized Results */}
          {flatItemsList.length > 0 &&
            (Object.entries(grouped) as [string, SearchResultItem[]][]).map(([type, items]) => {
              const config = TYPE_CONFIG[type] || {
                label: type,
                icon: Search,
                color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
                badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
                border: 'border-slate-700',
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
                      {items.length} {items.length === 1 ? 'match' : 'matches'}
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
                            ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
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
                                item.tag === 'HIGH' || item.tag === 'CRITICAL' || item.tag === 'REJECTED' || item.tag === 'SUSPENDED'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : item.tag === 'MEDIUM' || item.tag === 'PENDING' || item.tag === 'IDLE'
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
                                ? 'text-blue-400 translate-x-0.5 bg-blue-500/10'
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
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
