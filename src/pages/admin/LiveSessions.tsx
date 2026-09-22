import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  Eye,
  Pause,
  Play,
  StopCircle,
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw,
  TrendingUp,
  Download,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { LiveSession } from '../../types/admin';
import { formatTimeRemaining, exportJsonToCsv, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuthStore } from '../../store/authStore';
import ContextSelector from '../../components/ContextSelector';
import { useSearchParams } from 'react-router-dom';

export default function LiveSessions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [contextFilter, setContextFilter] = useState(searchParams.get('contextId') || 'ALL');
  const [anomalyFilter, setAnomalyFilter] = useState(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'PAUSE' | 'RESUME' | 'END';
    targetSession?: LiveSession;
  }>({ isOpen: false, type: 'PAUSE' });

  const toast = useToast();
  const navigate = useNavigate();

  const fetchSessions = async (isManual = false) => {
    setLoading(true);
    try {
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const params: Record<string, string | boolean> = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (contextFilter !== 'ALL') params.contextId = contextFilter;
      if (anomalyFilter) params.anomaly = true;

      // Sync URL
      const newUrlParams = new URLSearchParams();
      if (contextFilter !== 'ALL') newUrlParams.set('contextId', contextFilter);
      setSearchParams(newUrlParams, { replace: true });

      const [resp] = await Promise.all([
        apiClient.get('/admin/sessions', params),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setSessions(resp.data);
      }
      if (isManual) {
        toast.success('Live participant sessions refreshed');
      }
    } catch (err: any) {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions();
    }, 250);
    const interval = setInterval(() => {
      fetchSessions();
    }, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [search, statusFilter, anomalyFilter, contextFilter]);

  const handlePause = async (reason?: string) => {
    if (!modalState.targetSession) return;
    try {
      const resp = await apiClient.post(`/admin/sessions/${modalState.targetSession.id}/pause`, { reason });
      if (resp.success) {
        toast.warning(`Session for ${modalState.targetSession.studentName} paused`);
        fetchSessions();
      }
    } catch (err: any) {
      toast.error('Failed to pause session');
    } finally {
      setModalState({ isOpen: false, type: 'PAUSE' });
    }
  };

  const handleResume = async () => {
    if (!modalState.targetSession) return;
    try {
      const resp = await apiClient.post(`/admin/sessions/${modalState.targetSession.id}/resume`);
      if (resp.success) {
        toast.success(`Session for ${modalState.targetSession.studentName} resumed`);
        fetchSessions();
      }
    } catch (err: any) {
      toast.error('Failed to resume session');
    } finally {
      setModalState({ isOpen: false, type: 'RESUME' });
    }
  };

  const handleEnd = async (reason?: string) => {
    if (!modalState.targetSession) return;
    try {
      const resp = await apiClient.post(`/admin/sessions/${modalState.targetSession.id}/end`, { reason });
      if (resp.success) {
        toast.info(`Session for ${modalState.targetSession.studentName} terminated`);
        fetchSessions();
      }
    } catch (err: any) {
      toast.error('Failed to terminate session');
    } finally {
      setModalState({ isOpen: false, type: 'END' });
    }
  };

  const handleExportCSV = () => {
    if (!sessions || sessions.length === 0) {
      toast.warning('No active session records available to export');
      return;
    }

    const exportData = sessions.map((s) => ({
      'Session ID': s.id,
      'Student ID': s.studentId,
      'Student Name': s.studentName,
      'Email Address': s.studentEmail,
      'Current Level': `Level ${s.currentDifficulty}`,
      'Current Score': s.score,
      'Problems Solved': s.solvedCount,
      'Problems Skipped': s.skippedCount,
      'Total Attempts': s.attemptsCount,
      'Time Remaining': formatTimeRemaining(s.timeRemainingSeconds),
      'Session Status': s.sessionStatus,
      'Anomaly Status': s.anomalyStatus,
      'Anomaly Type': s.anomalyType || 'None',
      'IP Address': s.ipAddress,
      'Device': s.device,
      'Browser': s.browser,
      'Login Time': formatDate(s.loginTime),
      'Last Activity': formatDate(s.lastActivity),
    }));

    exportJsonToCsv('Hackathon_Arena_Live_Sessions', exportData);
    toast.success(`Exported ${exportData.length} live session records to CSV`);
  };

  const activeCount = sessions.filter((s) => s.sessionStatus === 'ACTIVE').length;
  const idleCount = sessions.filter((s) => s.sessionStatus === 'IDLE').length;
  const anomalyCount = sessions.filter((s) => s.anomalyStatus !== 'NONE').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live WebSocket Synchronization
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" /> Live Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track active compiler editors, verify IP integrity, and execute supervisory session interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
          <button
            onClick={() => fetchSessions(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Live Sessions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Active Coding</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Idle in Arena</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">{idleCount}</div>
          </div>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Flagged Anomalies</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-0.5">{anomalyCount}</div>
          </div>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Enrolled</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-0.5">{sessions.length}</div>
          </div>
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSessions();
          }}
          className="relative w-full md:w-96"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, IP, or session ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Context Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Context:</span>
            <ContextSelector
              selectedContextId={contextFilter}
              onContextChange={(ctx) => setContextFilter(ctx)}
              variant="dark"
              size="sm"
              className="w-48 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Session Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="IDLE">Idle</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {/* Anomaly Only Checkbox */}
          <button
            onClick={() => setAnomalyFilter(!anomalyFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              anomalyFilter
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Anomalies Only ({anomalyCount})
          </button>

          {(search || statusFilter !== 'ALL' || anomalyFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setAnomalyFilter(false);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Live Sessions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Current Problem & Level</th>
                <th className="p-4">Score</th>
                <th className="p-4">Solved / Skips</th>
                <th className="p-4">Time Remaining</th>
                <th className="p-4">IP & Device</th>
                <th className="p-4">Status & Anomaly</th>
                <th className="p-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Streaming active participant sessions...</div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No sessions match current filter criteria
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {sess.studentName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            {sess.studentName}
                            {sess.sessionStatus === 'ACTIVE' && (
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{sess.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{sess.currentQuestionTitle}</div>
                      <div className="text-[11px] text-blue-400 mt-0.5">
                        Difficulty Level {sess.currentDifficulty}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-blue-400">{sess.score} pts</div>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="text-emerald-400 font-bold">{sess.solvedCount} solved</span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-amber-400">{sess.skippedCount} skips</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {formatTimeRemaining(sess.timeRemainingSeconds)}
                    </td>
                    <td className="p-4 text-xs">
                      <div className="text-white font-mono">{sess.ipAddress}</div>
                      <div className="text-[11px] text-slate-400">{sess.device}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sess.sessionStatus === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sess.sessionStatus === 'IDLE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : sess.sessionStatus === 'PAUSED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {sess.sessionStatus}
                        </span>
                        {sess.anomalyStatus !== 'NONE' && (
                          <div>
                            <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold">
                              ALERT: {sess.anomalyType || 'SUSPICIOUS'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/live-sessions/${sess.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </Link>
                        {isAdmin && sess.sessionStatus === 'ACTIVE' && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'PAUSE', targetSession: sess })}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40"
                            title="Pause Student Session"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && sess.sessionStatus === 'PAUSED' && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'RESUME', targetSession: sess })}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                            title="Resume Student Session"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && sess.sessionStatus !== 'COMPLETED' && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'END', targetSession: sess })}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                            title="Terminate Session"
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modals for Live Session Actions */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'PAUSE'}
        onClose={() => setModalState({ isOpen: false, type: 'PAUSE' })}
        onConfirm={handlePause}
        title={`Pause Session: ${modalState.targetSession?.studentName}`}
        description="Pausing will freeze the student's editor timer and temporarily prevent code executions. An audit record will be logged."
        confirmText="Pause Session"
        variant="warning"
        requireReason={true}
        reasonPlaceholder="Specify reason for session pause..."
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'RESUME'}
        onClose={() => setModalState({ isOpen: false, type: 'RESUME' })}
        onConfirm={handleResume}
        title={`Resume Session: ${modalState.targetSession?.studentName}`}
        description="Resuming will unfreeze the countdown timer and re-enable active Kotlin code submissions."
        confirmText="Resume Session"
        variant="primary"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'END'}
        onClose={() => setModalState({ isOpen: false, type: 'END' })}
        onConfirm={handleEnd}
        title={`Terminate Session: ${modalState.targetSession?.studentName}`}
        description="This will immediately lock the student's exam arena, finalize current score, and conclude participation."
        confirmText="Terminate Session"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="State justification for administrative termination..."
      />
    </div>
  );
}
