import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  User,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { Anomaly } from '../../types/admin';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/AdminToastContext';

export default function FacultyAnomalies() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    anomaly: Anomaly | null;
    action: 'REVIEW' | 'DISMISS' | 'REQUEST_ADMIN' | null;
  }>({
    isOpen: false,
    anomaly: null,
    action: null,
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchAnomalies = async (isManual = false) => {
    try {
      setRefreshing(true);
      const params: Record<string, any> = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      if (search) params.search = search;

      const resp = await apiClient.get('/faculty/anomalies', params);
      if (resp.success && resp.data) {
        setAnomalies(resp.data);
      }
      if (isManual) {
        showToast('success', 'Anomaly alerts refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh anomalies');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnomalies(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, severityFilter]);

  const handleReviewConfirm = async (notes?: string) => {
    if (!reviewModal.anomaly || !reviewModal.action) return;

    try {
      const resp = await apiClient.patch(`/faculty/anomalies/${reviewModal.anomaly.id}/review`, {
        action: reviewModal.action,
        notes: notes || 'Supervisor evaluation complete.',
      });

      if (resp.success) {
        showToast('success', resp.message || 'Anomaly updated');
        fetchAnomalies();
      } else {
        showToast('error', resp.message || 'Failed to update anomaly');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error communicating with anomaly engine');
    } finally {
      setReviewModal({ isOpen: false, anomaly: null, action: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Modal */}
      <ConfirmModal
        isOpen={reviewModal.isOpen}
        title={
          reviewModal.action === 'REVIEW'
            ? 'Mark Anomaly as Reviewed'
            : reviewModal.action === 'DISMISS'
            ? 'Dismiss Anomaly Flag'
            : 'Escalate Anomaly to Platform Admin'
        }
        message={
          reviewModal.action === 'DISMISS'
            ? `Are you sure you want to dismiss this anomaly for ${reviewModal.anomaly?.studentName}? It will be logged as false positive.`
            : `Please provide supervisory evaluation notes for anomaly ${reviewModal.anomaly?.id} on ${reviewModal.anomaly?.studentName}.`
        }
        confirmText={
          reviewModal.action === 'REVIEW'
            ? 'Mark Reviewed'
            : reviewModal.action === 'DISMISS'
            ? 'Dismiss Flag'
            : 'Escalate to Admin'
        }
        confirmVariant={reviewModal.action === 'DISMISS' ? 'danger' : 'warning'}
        requireReason={true}
        reasonPlaceholder="Supervisory review notes..."
        onConfirm={handleReviewConfirm}
        onCancel={() => setReviewModal({ isOpen: false, anomaly: null, action: null })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Supervisory Anomaly Detection
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated heuristic fraud alerts, instant solves, difficulty jumps, and rapid compile attempts for your cohort.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnomalies(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
        <p>
          <span className="font-bold">Supervisory Protocol Notice:</span> Anomalies are heuristic flags for faculty review and contest integrity supervision. Students are not automatically suspended or penalized upon alert generation.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by student name, anomaly type, or alert ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Severities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies Table */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Alert ID</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Anomaly Type</th>
                  <th className="px-4 py-3.5 text-center">Severity</th>
                  <th className="px-4 py-3.5">Question / Session</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Detected At</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {anomalies.length > 0 ? (
                  anomalies.map((anom) => (
                    <tr key={anom.id} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/60">
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {anom.id}
                      </td>

                      <td className="px-4 py-3.5">
                        <p
                          className="font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                          onClick={() => navigate(`/faculty/students/${anom.studentId}`)}
                        >
                          {anom.studentName}
                        </p>
                        <p className="text-[10px] text-slate-400">{anom.studentEmail}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{anom.type}</span>
                        <span className="text-[11px] text-slate-300 max-w-[220px] truncate block">
                          {anom.description}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            anom.severity === 'CRITICAL'
                              ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                              : anom.severity === 'HIGH'
                              ? 'bg-orange-950/70 text-orange-300 border border-orange-800/60'
                              : anom.severity === 'MEDIUM'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                              : 'bg-blue-950/70 text-blue-300 border border-blue-800/60'
                          }`}
                        >
                          {anom.severity}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="text-slate-200 font-medium max-w-[140px] truncate">
                          {anom.questionTitle || 'Contest Arena'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{anom.sessionId}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            anom.status === 'NEW'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                              : anom.status === 'REVIEWED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                              : anom.status === 'UNDER_REVIEW'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {anom.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                        {new Date((anom as any).detectedAt || anom.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/faculty/anomalies/${anom.id}`)}
                            title="Inspect Details"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-xs h-8 w-8"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {anom.status !== 'REVIEWED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReviewModal({ isOpen: true, anomaly: anom, action: 'REVIEW' })}
                              title="Mark Reviewed"
                              className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 transition-all shadow-xs h-8 w-8"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {anom.status !== 'DISMISSED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReviewModal({ isOpen: true, anomaly: anom, action: 'DISMISS' })}
                              title="Dismiss False Positive"
                              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 transition-all shadow-xs h-8 w-8"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      No anomalies found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
