import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Activity,
  Layers,
  Zap,
  RefreshCw,
  X,
  FileCode,
  User,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Anomaly } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  // Review / Dismiss Modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'REVIEW' | 'DISMISS';
    targetAnomaly?: Anomaly;
  }>({ isOpen: false, type: 'REVIEW' });
  const [notes, setNotes] = useState('');

  const toast = useToast();

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const resp = await apiClient.get('/admin/anomalies', params);
      if (resp.success && resp.data) {
        setAnomalies(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load anomaly alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnomalies();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, severityFilter, statusFilter]);

  const handleReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.targetAnomaly) return;

    try {
      if (actionModal.type === 'REVIEW') {
        const resp = await apiClient.post(`/admin/anomalies/${actionModal.targetAnomaly.id}/review`, { notes });
        if (resp.success) {
          toast.success(`Anomaly ${actionModal.targetAnomaly.id} marked as Reviewed`);
        }
      } else {
        const resp = await apiClient.post(`/admin/anomalies/${actionModal.targetAnomaly.id}/dismiss`, { reason: notes });
        if (resp.success) {
          toast.info(`Anomaly ${actionModal.targetAnomaly.id} dismissed`);
        }
      }
      setActionModal({ isOpen: false, type: 'REVIEW' });
      setNotes('');
      fetchAnomalies();
    } catch (err: any) {
      toast.error('Failed to process anomaly review');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Heuristic Fraud Detection Watchdog
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Behavioral Anomaly Detection & Review
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervise instant solves (&lt;5s), unnatural difficulty jumps, and multi-IP tokens. Flagged for review without automated participant blocking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnomalies}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* SRS Compliance Policy Alert */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <b>SRS Policy Requirement:</b> Anomalies are strictly highlighted for administrative inspection and will <b>never</b> automatically ban or disrupt a student's live contest session.
          </span>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
          {anomalies.filter((a) => a.status === 'NEW').length} Pending Review
        </span>
      </div>

      {/* Filters Strip */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, email, or anomaly type..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New (Unreviewed)</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REVIEWED">Reviewed & Handled</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          {(search || severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Severity</th>
                <th className="p-4">Anomaly Type</th>
                <th className="p-4">Student</th>
                <th className="p-4">Description & Heuristic Trigger</th>
                <th className="p-4">Detected Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Scanning real-time telemetry heuristics...</div>
                  </td>
                </tr>
              ) : anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-50" />
                    No suspicious anomalies detected in active session data
                  </td>
                </tr>
              ) : (
                anomalies.map((a) => {
                  const isHigh = a.severity === 'HIGH';
                  const isNew = a.status === 'NEW';

                  return (
                    <tr key={a.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {a.type.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{a.studentName}</div>
                        <div className="text-[11px] text-slate-400">{a.studentEmail}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-300 max-w-md leading-relaxed">
                        {a.description}
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-mono">
                        {formatDate(a.timestamp)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isNew
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : a.status === 'REVIEWED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAnomaly(a)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                            title="Inspect Supporting Telemetry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isNew && (
                            <>
                              <button
                                onClick={() => {
                                  setActionModal({ isOpen: true, type: 'REVIEW', targetAnomaly: a });
                                  setNotes('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold border border-emerald-500/30"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => {
                                  setActionModal({ isOpen: true, type: 'DISMISS', targetAnomaly: a });
                                  setNotes('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANOMALY DETAILS MODAL */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                  {selectedAnomaly.severity} SEVERITY ANOMALY
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1.5">
                  {selectedAnomaly.type.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-400">Student: <b>{selectedAnomaly.studentName}</b> ({selectedAnomaly.studentEmail})</p>
              </div>
              <button onClick={() => setSelectedAnomaly(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-200">
              <b className="text-white block mb-1 text-sm">Detection Reason:</b>
              {selectedAnomaly.description}
            </div>

            {/* Supporting Data JSON Viewer */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-300">
              <span className="text-slate-500 block mb-2">// Supporting Telemetry Data:</span>
              <pre>{JSON.stringify(selectedAnomaly.supportingData, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Link
                to={`/admin/live-sessions/${selectedAnomaly.sessionId}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Inspect Student Session →
              </Link>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW / DISMISS MODAL */}
      {actionModal.isOpen && actionModal.targetAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {actionModal.type === 'REVIEW' ? 'Mark Anomaly as Reviewed' : 'Dismiss Anomaly Alert'}
              </h3>
              <button
                onClick={() => setActionModal({ isOpen: false, type: 'REVIEW' })}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewAction} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Provide administrative notes for this action. The decision will be stored in the permanent audit trail.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Review Notes / Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why this behavior is legitimate or what supervisory action was taken..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, type: 'REVIEW' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md ${
                    actionModal.type === 'REVIEW' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {actionModal.type === 'REVIEW' ? 'Confirm Review' : 'Dismiss Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
