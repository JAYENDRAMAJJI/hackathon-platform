import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  User,
  Activity,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/AdminToastContext';

export default function AnomalyDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    action: 'REVIEW' | 'DISMISS' | 'REQUEST_ADMIN' | null;
  }>({
    isOpen: false,
    action: null,
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchAnomaly = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await apiClient.get(`/faculty/anomalies/${id}`);
      if (resp.success && resp.data) {
        setData(resp.data);
      } else {
        setError(resp.message || 'Anomaly not found');
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied or Anomaly Not Found');
      showToast('error', 'Unable to inspect anomaly details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomaly();
  }, [id]);

  const handleActionConfirm = async (notes?: string) => {
    if (!id || !reviewModal.action) return;

    try {
      const resp = await apiClient.patch(`/faculty/anomalies/${id}/review`, {
        action: reviewModal.action,
        notes: notes || 'Supervisor evaluation notes recorded.',
      });

      if (resp.success) {
        showToast('success', resp.message || 'Status updated');
        fetchAnomaly();
      } else {
        showToast('error', resp.message || 'Action failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Communication error');
    } finally {
      setReviewModal({ isOpen: false, action: null });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading anomaly forensic details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Anomaly Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'Anomaly ID does not exist or is not assigned to your supervision partition.'}</p>
        <Button size="sm" onClick={() => navigate('/faculty/anomalies')} variant="outline">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Anomalies
        </Button>
      </div>
    );
  }

  const { anomaly, supportingActivity } = data;

  return (
    <div className="space-y-6">
      {/* Review Modal */}
      <ConfirmModal
        isOpen={reviewModal.isOpen}
        title={
          reviewModal.action === 'REVIEW'
            ? 'Mark Anomaly as Reviewed'
            : reviewModal.action === 'DISMISS'
            ? 'Dismiss Flag (False Positive)'
            : 'Escalate to Platform Administrator'
        }
        message={`Provide evaluation notes for anomaly alert ${anomaly.id} generated on ${anomaly.studentName}.`}
        confirmText="Confirm Decision"
        confirmVariant={reviewModal.action === 'DISMISS' ? 'danger' : 'warning'}
        requireReason={true}
        reasonPlaceholder="Supervisor assessment notes..."
        onConfirm={handleActionConfirm}
        onCancel={() => setReviewModal({ isOpen: false, action: null })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty/anomalies')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              Alert: {anomaly.type}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  anomaly.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {anomaly.severity}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Alert ID: <span className="font-mono text-slate-300 font-semibold">{anomaly.id}</span> • Status: <span className="text-slate-200 font-bold">{anomaly.status}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {anomaly.status !== 'REVIEWED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReviewModal({ isOpen: true, action: 'REVIEW' })}
              className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark Reviewed
            </Button>
          )}

          {anomaly.status !== 'DISMISSED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReviewModal({ isOpen: true, action: 'DISMISS' })}
              className="text-xs font-semibold text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 rounded-xl"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Dismiss Flag
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setReviewModal({ isOpen: true, action: 'REQUEST_ADMIN' })}
            className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/20"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Request Admin Review
          </Button>
        </div>
      </div>

      {/* Grid: Details & Supporting Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Card */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Detection Evidence & Heuristics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <p className="font-bold text-white text-sm">Detection Reason</p>
              <p className="text-slate-200 leading-relaxed">{anomaly.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Student</span>
                <p className="font-bold text-white mt-0.5">{anomaly.studentName}</p>
                <span className="text-[10px] text-slate-400 font-mono">{anomaly.studentEmail}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Question</span>
                <p className="font-bold text-white mt-0.5 truncate">{anomaly.questionTitle || 'Two Sum'}</p>
                <span className="text-[10px] text-indigo-400 font-medium">Difficulty Level {anomaly.difficulty || 4}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Detected Time</span>
                <p className="font-bold font-mono text-white mt-0.5">
                  {new Date((anomaly as any).detectedAt || anomaly.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <span className="text-[10px] text-slate-400">Timestamp logged</span>
              </div>
            </div>

            {/* Supervisor Notes if any */}
            {anomaly.reviewNotes && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Supervisor Review Notes</span>
                <p className="text-xs text-indigo-200 mt-1">{anomaly.reviewNotes}</p>
                {anomaly.reviewedBy && (
                  <span className="text-[10px] text-indigo-400/80 mt-1 block">Reviewed by: {anomaly.reviewedBy}</span>
                )}
              </div>
            )}

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/faculty/students/${anomaly.studentId}`)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                <User className="w-3.5 h-3.5 mr-1" />
                View Student Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/faculty/live-sessions/${anomaly.sessionId}`)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                <Activity className="w-3.5 h-3.5 mr-1" />
                View Live Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/faculty/submissions?studentId=${anomaly.studentId}`)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                <FileCode className="w-3.5 h-3.5 mr-1" />
                View Submissions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Supporting Activity Timeline */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Surrounding Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {supportingActivity && supportingActivity.length > 0 ? (
                supportingActivity.map((act: any) => (
                  <div key={act.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{act.activity}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{act.questionTitle || 'Arena Action'}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No surrounding events recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
