import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Eye,
  PauseCircle,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  Wifi,
  Clock,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { LiveSession } from '../../types/admin';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/AdminToastContext';

export default function LiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Action Modal State
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    session: LiveSession | null;
    action: 'PAUSE' | 'RESUME' | 'END' | 'REQUEST_ADMIN' | null;
  }>({
    isOpen: false,
    session: null,
    action: null,
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchSessions = async (isManual = false) => {
    try {
      setRefreshing(true);
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const resp = await apiClient.get('/faculty/live-sessions', params);
      if (resp.success && resp.data) {
        setSessions(resp.data);
      }
      if (isManual) {
        showToast('success', 'Active live sessions refreshed');
      }
    } catch (err) {
      console.error('Failed to load live sessions:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh active sessions');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions(false);
    }, 250);
    const interval = setInterval(() => fetchSessions(false), 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [search, statusFilter]);

  const handleActionConfirm = async (reason?: string) => {
    if (!actionModal.session || !actionModal.action) return;

    try {
      const resp = await apiClient.post(`/faculty/live-sessions/${actionModal.session.id}/action`, {
        action: actionModal.action,
        reason: reason || 'Faculty Supervisor intervention',
      });

      if (resp.success) {
        showToast('success', resp.message || 'Session action executed');
        fetchSessions();
      } else {
        showToast('error', resp.message || 'Failed to execute session action');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error communicating with session supervisor engine');
    } finally {
      setActionModal({ isOpen: false, session: null, action: null });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Session Action Confirmation Modal */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        title={
          actionModal.action === 'PAUSE'
            ? 'Pause Student Session'
            : actionModal.action === 'RESUME'
            ? 'Resume Student Session'
            : actionModal.action === 'END'
            ? 'End Student Session'
            : 'Request Administrative Intervention'
        }
        message={
          actionModal.action === 'REQUEST_ADMIN'
            ? `Submit an escalated intervention request to Platform Administrators for ${actionModal.session?.studentName}.`
            : `Are you sure you want to perform this supervisory intervention for ${actionModal.session?.studentName}?`
        }
        confirmText={
          actionModal.action === 'PAUSE'
            ? 'Pause Session'
            : actionModal.action === 'RESUME'
            ? 'Resume Session'
            : actionModal.action === 'END'
            ? 'End Session'
            : 'Submit Request'
        }
        confirmVariant={actionModal.action === 'END' ? 'danger' : 'warning'}
        requireReason={true}
        reasonPlaceholder="Mandatory reason for this supervisory action..."
        onConfirm={handleActionConfirm}
        onCancel={() => setActionModal({ isOpen: false, session: null, action: null })}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Arena Session Stream
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            Live Arena Session Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time participant heartbeats, active code questions, difficulty calibrations, and supervision controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSessions(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, session ID, or question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold w-full sm:w-48 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Session Statuses</option>
            <option value="ACTIVE">Active in Arena</option>
            <option value="IDLE">Idle</option>
            <option value="COMPLETED">Completed</option>
            <option value="OFFLINE">Offline</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      {/* Live Sessions Grid / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
              <tr>
                <th className="p-4">Student & Session ID</th>
                <th className="p-4">Current Question</th>
                <th className="p-4 text-center">Level</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-center">Solved</th>
                <th className="p-4">Session Status</th>
                <th className="p-4">Time Remaining</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right">Supervisory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {sessions.length > 0 ? (
                sessions.map((sess) => (
                  <tr
                    key={sess.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-indigo-500/30 shrink-0">
                          {sess.studentName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-white hover:text-indigo-400 cursor-pointer text-sm truncate"
                            onClick={() => navigate(`/faculty/live-sessions/${sess.id}`)}
                          >
                            {sess.studentName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono truncate">{sess.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-white max-w-[200px] truncate">
                        {sess.currentQuestionTitle || 'Two Sum Target Indices'}
                      </p>
                      <span className="text-xs text-slate-400 font-mono">IP: {sess.ipAddress}</span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        L{sess.difficulty || 1}
                      </span>
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-indigo-400 text-sm">
                      {sess.currentScore || 0} pts
                    </td>

                    <td className="p-4 text-center font-bold text-emerald-400 text-sm">
                      {sess.solvedCount || 0}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          sess.sessionStatus === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                            : sess.sessionStatus === 'COMPLETED'
                            ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
                            : sess.sessionStatus === 'PAUSED'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            sess.sessionStatus === 'ACTIVE'
                              ? 'bg-emerald-400 animate-ping'
                              : sess.sessionStatus === 'COMPLETED'
                              ? 'bg-indigo-400'
                              : sess.sessionStatus === 'PAUSED'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        {sess.sessionStatus}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-300">
                      {sess.timeRemaining || '01:34:10'}
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {new Date(sess.lastHeartbeat || sess.loginTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/faculty/live-sessions/${sess.id}`)}
                          title="Inspect Session Details"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        </button>

                        {sess.sessionStatus === 'ACTIVE' ? (
                          <button
                            onClick={() => setActionModal({ isOpen: true, session: sess, action: 'PAUSE' })}
                            title="Pause Session"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all shadow-xs"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : sess.sessionStatus === 'PAUSED' ? (
                          <button
                            onClick={() => setActionModal({ isOpen: true, session: sess, action: 'RESUME' })}
                            title="Resume Session"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition-all shadow-xs"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        <button
                          onClick={() => setActionModal({ isOpen: true, session: sess, action: 'REQUEST_ADMIN' })}
                          title="Request Admin Intervention"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 border border-slate-700 transition-all shadow-xs"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No active sessions found for your assigned cohort.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
