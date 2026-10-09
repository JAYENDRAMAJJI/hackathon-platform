import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Clock,
  Code2,
  Zap,
  Terminal,
  FastForward,
  Wifi,
  WifiOff,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileCode,
  ShieldAlert,
  HelpCircle,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { formatDate, exportJsonToCsv } from '../lib/exportUtils';
import { Button } from './ui/Button';

export interface ActivityEventRecord {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  contestId?: string;
  contestName?: string;
  sessionId?: string;
  questionId?: string;
  questionTitle?: string;
  questionNumber?: number;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  details: string;
  ipAddress?: string;
  device?: string;
  metadata?: Record<string, any>;
}

interface TimelineSummary {
  totalEvents: number;
  questionsOpenedCount: number;
  questionsSolvedCount: number;
  questionsSkippedCount: number;
  codeExecutionsCount: number;
  submissionsAcceptedCount: number;
  submissionsRejectedCount: number;
  compilationErrorsCount: number;
  sessionStartTime: string | null;
  lastActivityTime: string | null;
  earliestRecordedEvent: string | null;
  latestRecordedEvent: string | null;
}

interface StudentActivityTimelineProps {
  key?: React.Key;
  studentId?: string;
  studentName?: string;
  contestId?: string;
  role?: 'ADMIN' | 'FACULTY';
  className?: string;
  compact?: boolean;
}

const EVENT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Event Actions' },
  { value: 'CONTEST_STARTED', label: 'Contest Started' },
  { value: 'CONTEST_RESUMED', label: 'Contest Resumed' },
  { value: 'CONTEST_FINISHED', label: 'Contest Finalized' },
  { value: 'CONTEST_PAUSED', label: 'Session Paused' },
  { value: 'QUESTION_OPENED', label: 'Question Opened' },
  { value: 'QUESTION_CHANGED', label: 'Question Switched' },
  { value: 'QUESTION_REVISITED', label: 'Question Revisited' },
  { value: 'CODE_SAVED', label: 'Draft Code Saved' },
  { value: 'RUN_CODE_COMPLETED', label: 'Code Execution Run' },
  { value: 'COMPILATION_ERROR', label: 'Compilation Error' },
  { value: 'SUBMISSION_ACCEPTED', label: 'Submission Accepted' },
  { value: 'SUBMISSION_REJECTED', label: 'Submission Rejected' },
  { value: 'QUESTION_SKIPPED', label: 'Question Skipped' },
  { value: 'CONNECTION_LOST', label: 'Connection Interrupted' },
  { value: 'CONNECTION_RESTORED', label: 'Connection Restored' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Verdicts & Statuses' },
  { value: 'ACCEPTED', label: 'Accepted (Green)' },
  { value: 'SUCCESS', label: 'Success (Green)' },
  { value: 'REJECTED', label: 'Rejected (Red)' },
  { value: 'FAILED', label: 'Failed (Red)' },
  { value: 'ERROR', label: 'Error (Red)' },
  { value: 'WARNING', label: 'Warning / Skip (Amber)' },
  { value: 'INFO', label: 'Information (Blue)' },
];

export default function StudentActivityTimeline({
  studentId,
  studentName,
  contestId,
  role = 'FACULTY',
  className = '',
  compact = false,
}: StudentActivityTimelineProps) {
  const [events, setEvents] = useState<ActivityEventRecord[]>([]);
  const [summary, setSummary] = useState<TimelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [questionFilter, setQuestionFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Inspector modal state
  const [selectedEvent, setSelectedEvent] = useState<ActivityEventRecord | null>(null);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Extract distinct questions from returned events for quick filtering
  const distinctQuestions = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach((ev) => {
      if (ev.questionId && ev.questionTitle) {
        map.set(ev.questionId, ev.questionTitle);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [events]);

  const fetchTimeline = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          page,
          limit,
          sortOrder,
        };
        if (studentId) params.studentId = studentId;
        if (contestId) params.contestId = contestId;
        if (actionFilter !== 'ALL') params.action = actionFilter;
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (questionFilter !== 'ALL') params.questionId = questionFilter;
        if (search.trim()) params.search = search.trim();
        if (startDate) params.startDate = new Date(startDate).toISOString();
        if (endDate) params.endDate = new Date(endDate).toISOString();

        // Build endpoint based on role
        let endpoint = '';
        if (role === 'ADMIN') {
          endpoint = studentId ? `/admin/students/${studentId}/timeline` : `/admin/timeline`;
        } else {
          endpoint = studentId ? `/faculty/students/${studentId}/timeline` : `/faculty/timeline`;
        }

        const resp = await apiClient.get(endpoint, params);
        if (resp.success && resp.data) {
          setEvents(resp.data);
          if (resp.pagination) {
            setTotalCount(resp.pagination.total);
            setTotalPages(resp.pagination.totalPages);
          }
          if (resp.summary) {
            setSummary(resp.summary);
          }
        } else {
          setError(resp.message || 'Failed to retrieve timeline data.');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with timeline telemetry server.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [studentId, contestId, role, actionFilter, statusFilter, questionFilter, search, startDate, endDate, sortOrder, page, limit]
  );

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Real-time Event Stream Listener
  useEffect(() => {
    const sseEndpoint = role === 'ADMIN' ? '/api/events' : '/api/faculty/events';
    let es: EventSource | null = null;

    try {
      es = new EventSource(sseEndpoint);
      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'ACTIVITY_RECORDED' && parsed.payload) {
            const incoming: ActivityEventRecord = parsed.payload;
            // Only prepend if matches current studentId (or no studentId filter)
            if (!studentId || incoming.studentId === studentId) {
              setEvents((prev) => [incoming, ...prev]);
              setTotalCount((c) => c + 1);
            }
          }
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      if (es) es.close();
    };
  }, [studentId, role]);

  const handleClearFilters = () => {
    setSearch('');
    setActionFilter('ALL');
    setStatusFilter('ALL');
    setQuestionFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!events || events.length === 0) return;

    const exportData = events.map((ev) => ({
      'Log ID': ev.id,
      'Timestamp': formatDate(ev.timestamp),
      'Student ID': ev.studentId,
      'Student Name': ev.studentName,
      'Contest': ev.contestName || ev.contestId || 'Contest',
      'Event Action': ev.action,
      'Status': ev.status,
      'Question Title': ev.questionTitle || 'N/A',
      'Details': ev.details,
      'Client IP': ev.ipAddress || '127.0.0.1',
      'Device': ev.device || 'N/A',
    }));

    const filename = `Activity_Timeline_${studentName ? studentName.replace(/\s+/g, '_') : 'Student'}_${new Date().toISOString().slice(0, 10)}`;
    exportJsonToCsv(filename, exportData);
  };

  // Helper for action icon & badge color
  const getActionBadge = (action: string, status: string) => {
    const act = (action || '').toUpperCase();
    const st = (status || '').toUpperCase();

    if (act.includes('ACCEPTED') || st === 'ACCEPTED' || st === 'SUCCESS') {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'ACCEPTED',
      };
    }
    if (act.includes('REJECTED') || act.includes('COMPILATION_ERROR') || st === 'REJECTED' || st === 'FAILED' || st === 'ERROR') {
      return {
        icon: <XCircle className="w-4 h-4 text-rose-400" />,
        bg: 'bg-rose-950/60 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
        label: act.includes('COMPILATION') ? 'COMPILATION ERROR' : 'REJECTED',
      };
    }
    if (act.includes('SKIPPED') || act.includes('PAUSED') || st === 'WARNING') {
      return {
        icon: <FastForward className="w-4 h-4 text-amber-400" />,
        bg: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'SKIPPED / WARNING',
      };
    }
    if (act.includes('RUN_CODE')) {
      return {
        icon: <Terminal className="w-4 h-4 text-blue-400" />,
        bg: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400',
        label: 'CODE RUN',
      };
    }
    if (act.includes('QUESTION')) {
      return {
        icon: <Code2 className="w-4 h-4 text-indigo-400" />,
        bg: 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30',
        dot: 'bg-indigo-400',
        label: 'QUESTION NAV',
      };
    }
    if (act.includes('DRAFT') || act.includes('CODE_SAVED')) {
      return {
        icon: <FileCode className="w-4 h-4 text-cyan-400" />,
        bg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400',
        label: 'DRAFT SAVED',
      };
    }
    if (act.includes('CONTEST')) {
      return {
        icon: <Trophy className="w-4 h-4 text-purple-400" />,
        bg: 'bg-purple-950/60 text-purple-400 border-purple-500/30',
        dot: 'bg-purple-400',
        label: 'LIFECYCLE',
      };
    }
    if (act.includes('CONNECTION')) {
      return {
        icon: act.includes('LOST') ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />,
        bg: 'bg-slate-800 text-slate-300 border-slate-700',
        dot: 'bg-slate-400',
        label: 'CONNECTIVITY',
      };
    }

    return {
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      bg: 'bg-slate-800 text-slate-300 border-slate-700',
      dot: 'bg-slate-400',
      label: action,
    };
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Summary Metrics Bar */}
      {summary && !compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Events</span>
            <span className="text-xl font-black text-white mt-1 block font-mono">{summary.totalEvents}</span>
            <span className="text-[10px] text-slate-500">Chronological records</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Questions Solved</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block font-mono">
              {summary.questionsSolvedCount}
            </span>
            <span className="text-[10px] text-emerald-400/70 font-semibold">
              {summary.questionsOpenedCount} opened
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Submissions Accepted</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block font-mono">
              {summary.submissionsAcceptedCount}
            </span>
            <span className="text-[10px] text-rose-400 font-semibold">
              {summary.submissionsRejectedCount} rejected
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Code Executions</span>
            <span className="text-xl font-black text-blue-400 mt-1 block font-mono">
              {summary.codeExecutionsCount}
            </span>
            <span className="text-[10px] text-slate-500">Sandbox tests</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Compile Errors</span>
            <span className="text-xl font-black text-rose-400 mt-1 block font-mono">
              {summary.compilationErrorsCount}
            </span>
            <span className="text-[10px] text-slate-500">Syntax / Stderr</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Questions Skipped</span>
            <span className="text-xl font-black text-amber-400 mt-1 block font-mono">
              {summary.questionsSkippedCount}
            </span>
            <span className="text-[10px] text-amber-400/80 font-semibold">-5 pts penalty</span>
          </div>
        </div>
      )}

      {/* 2. Control Toolbar: Search, Filters & Actions */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event details, question title, action keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters & Toolbar Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                startDate || endDate || questionFilter !== 'ALL'
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Advanced Filters (Dates & Question)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">More Filters</span>
            </button>

            <button
              onClick={() => fetchTimeline(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Refresh Timeline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              disabled={events.length === 0}
              className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Export Filtered Timeline to CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters (Date range & Question) */}
        {showFiltersDrawer && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Question Filter</label>
              <select
                value={questionFilter}
                onChange={(e) => {
                  setQuestionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                <option value="ALL">All Problems</option>
                {distinctQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">From Date / Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">To Date / Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold"
              >
                Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
              <button
                onClick={handleClearFilters}
                className="py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-bold"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Timeline Feed */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Retrieving verified activity timeline telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Timeline Retrieval Interrupted</h4>
          <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
          <Button size="sm" variant="outline" onClick={() => fetchTimeline(true)} className="mt-2 text-xs">
            Retry Connection
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No Activity Events Recorded</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No events match your current filter parameters or the participant has not begun interaction yet.
          </p>
          {(search || actionFilter !== 'ALL' || statusFilter !== 'ALL' || questionFilter !== 'ALL' || startDate) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline"
            >
              Reset all active filters
            </button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((ev, index) => {
            const badge = getActionBadge(ev.action, ev.status);
            const dateObj = new Date(ev.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={ev.id || index}
                className="relative group p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm"
              >
                {/* Node marker on timeline rail */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center -translate-x-1/2 ${badge.dot}`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    {/* Event Type & Context Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>

                      {ev.questionTitle && (
                        <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 truncate max-w-xs">
                          {ev.questionNumber ? `Q${ev.questionNumber}: ` : ''}
                          {ev.questionTitle}
                        </span>
                      )}

                      {ev.contestName && (
                        <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                          [{ev.contestName}]
                        </span>
                      )}
                    </div>

                    {/* Concise Details Description */}
                    <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">
                      {ev.details}
                    </p>

                    {/* Additional Evaluation Metrics if present */}
                    {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                        {ev.metadata.scoreAwarded !== undefined && (
                          <span className="text-emerald-400 font-bold">
                            Score: +{ev.metadata.scoreAwarded} pts
                          </span>
                        )}
                        {ev.metadata.testCasesPassed !== undefined && (
                          <span className="text-slate-300">
                            Tests: {ev.metadata.testCasesPassed}/{ev.metadata.totalTestCases || 6} passed
                          </span>
                        )}
                        {ev.metadata.executionTimeMs !== undefined && (
                          <span>Runtime: {ev.metadata.executionTimeMs}ms</span>
                        )}
                        {ev.metadata.memoryUsed && <span>Memory: {ev.metadata.memoryUsed}</span>}
                        {ev.metadata.skipPenalty && (
                          <span className="text-rose-400 font-bold">Penalty: -{ev.metadata.skipPenalty} pts</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right metadata / Timestamps & Inspect Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 text-right pt-1 sm:pt-0">
                    <span className="text-xs font-mono font-bold text-white">{timeStr}</span>
                    <span className="text-[10px] text-slate-500">{dateStr}</span>

                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination Controller */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
          <div>
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} of {totalCount} events
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-white">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Detailed Event Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">Activity Event Investigation Dossier</h3>
                  <p className="text-[11px] font-mono text-slate-400">{selectedEvent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Reference</span>
                <span className="font-bold text-white block mt-0.5">{selectedEvent.studentName}</span>
                <span className="text-[11px] font-mono text-indigo-400">{selectedEvent.studentId}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Timestamp</span>
                <span className="font-mono text-white block mt-0.5">
                  {new Date(selectedEvent.timestamp).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500">{selectedEvent.timestamp}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Action & Status</span>
                <span className="font-mono font-bold text-indigo-300 block mt-0.5">{selectedEvent.action}</span>
                <span className="text-[10px] font-bold text-emerald-400">{selectedEvent.status}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Client Origin</span>
                <span className="font-mono text-slate-300 block mt-0.5">{selectedEvent.ipAddress || '127.0.0.1'}</span>
                <span className="text-[10px] text-slate-500 truncate block">{selectedEvent.device || 'Windows / Chrome'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Official Event Log</span>
              <p className="text-xs text-white leading-relaxed">{selectedEvent.details}</p>
            </div>

            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Structured Metadata Payload</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedEvent(null)} className="text-xs">
                Close Inspection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
