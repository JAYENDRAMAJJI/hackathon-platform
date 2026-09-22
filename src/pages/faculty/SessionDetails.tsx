import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  User,
  Clock,
  Laptop,
  Code2,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  StopCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/AdminToastContext';

export default function SessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: 'PAUSE' | 'RESUME' | 'END' | 'REQUEST_ADMIN' | null;
  }>({
    isOpen: false,
    action: null,
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchSessionDetails = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await apiClient.get(`/faculty/live-sessions/${sessionId}`);
      if (resp.success && resp.data) {
        setData(resp.data);
      } else {
        setError(resp.message || 'Session not found');
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied or Session Not Found');
      showToast('error', 'Unable to inspect session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const handleActionConfirm = async (reason?: string) => {
    if (!sessionId || !actionModal.action) return;

    try {
      const resp = await apiClient.post(`/faculty/live-sessions/${sessionId}/action`, {
        action: actionModal.action,
        reason: reason || 'Faculty Supervisor intervention',
      });

      if (resp.success) {
        showToast('success', resp.message || 'Action executed successfully');
        fetchSessionDetails();
      } else {
        showToast('error', resp.message || 'Action failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Intervention error');
    } finally {
      setActionModal({ isOpen: false, action: null });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Connecting to session telemetry stream...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-lg font-black text-white">Session Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error || 'Session ID is invalid or belongs to another supervisor.'}</p>
        <Button size="sm" onClick={() => navigate('/faculty/live-sessions')} variant="outline" className="bg-slate-800 text-slate-200 border-slate-700">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Active Sessions
        </Button>
      </div>
    );
  }

  const { session, activityTimeline } = data;

  return (
    <div className="space-y-6">
      {/* Action Modal */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        title={
          actionModal.action === 'PAUSE'
            ? 'Pause Live Session'
            : actionModal.action === 'RESUME'
            ? 'Resume Live Session'
            : actionModal.action === 'END'
            ? 'Conclude Session'
            : 'Escalate to Platform Admin'
        }
        message={`Are you sure you want to perform this supervisory action on session ${session.id} for ${session.studentName}?`}
        confirmText="Confirm Action"
        confirmVariant={actionModal.action === 'END' ? 'danger' : 'warning'}
        requireReason={true}
        reasonPlaceholder="Mandatory reason for audit trail..."
        onConfirm={handleActionConfirm}
        onCancel={() => setActionModal({ isOpen: false, action: null })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty/live-sessions')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Session: {session.studentName}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                session.sessionStatus === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {session.sessionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Session ID: <span className="font-mono text-slate-200 font-semibold">{session.id}</span> • IP: <span className="font-mono text-slate-300">{session.ipAddress}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {session.sessionStatus === 'ACTIVE' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionModal({ isOpen: true, action: 'PAUSE' })}
              className="text-xs font-bold text-amber-400 bg-amber-950/30 border-amber-500/40 hover:bg-amber-950/50 rounded-xl"
            >
              <PauseCircle className="w-3.5 h-3.5 mr-1.5" />
              Pause Session
            </Button>
          ) : session.sessionStatus === 'PAUSED' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionModal({ isOpen: true, action: 'RESUME' })}
              className="text-xs font-bold text-emerald-400 bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-950/50 rounded-xl"
            >
              <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
              Resume Session
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActionModal({ isOpen: true, action: 'REQUEST_ADMIN' })}
            className="text-xs font-bold text-purple-400 bg-purple-950/30 border-purple-500/40 hover:bg-purple-950/50 rounded-xl"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Request Admin
          </Button>
        </div>
      </div>

      {/* Grid: Session Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Score</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{session.currentScore || 0} pts</p>
            <span className="text-[11px] text-slate-500">{session.solvedCount || 0} questions solved</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Difficulty Level</p>
            <p className="text-2xl font-black text-blue-400 mt-1">Level {session.difficulty || 1}</p>
            <span className="text-[11px] text-slate-500">Active question</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Remaining</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {session.timeRemaining || '01:34:10'}
            </p>
            <span className="text-[11px] text-slate-500">Authoritative timer</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Login Timestamp</p>
            <p className="text-xl font-black font-mono text-white mt-1 truncate">
              {new Date(session.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span className="text-[11px] text-emerald-400/80 font-semibold">Heartbeat active</span>
          </CardContent>
        </Card>
      </div>

      {/* Code Snapshot & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Code Preview Snapshot */}
        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Active Code Snapshot (Kotlin 2.0)
            </CardTitle>
            <span className="text-[11px] font-mono text-slate-400">Question: <span className="text-slate-200 font-semibold">{session.currentQuestionTitle}</span></span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-slate-950 text-slate-100 p-5 font-mono text-xs overflow-x-auto max-h-[380px]">
              <pre className="text-emerald-400 font-mono leading-relaxed">
                {session.codeSnapshot ||
                  `// Student Kotlin Working Solution
class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        val map = HashMap<Int, Int>()
        for (i in nums.indices) {
            val complement = target - nums[i]
            if (map.containsKey(complement)) {
                return intArrayOf(map[complement]!!, i)
            }
            map[nums[i]] = i
        }
        return intArrayOf()
    }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Chronological Session Event Timeline */}
        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-black text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Session Event Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {activityTimeline && activityTimeline.length > 0 ? (
                activityTimeline.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                      <div>
                        <p className="font-bold text-white text-xs">{item.activity}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.questionTitle || 'General Arena'}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No events logged in this session.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
