import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  User,
  Clock,
  Shield,
  Code2,
  Trophy,
  Layers,
  Pause,
  Play,
  StopCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Terminal,
  Cpu,
  Monitor,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { formatTimeRemaining, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'PAUSE' | 'RESUME' | 'END';
  }>({ isOpen: false, type: 'PAUSE' });

  const toast = useToast();
  const navigate = useNavigate();

  const fetchSessionDetails = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get(`/admin/sessions/${id}`);
      if (resp.success && resp.data) {
        setData(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const handlePause = async (reason?: string) => {
    if (!id) return;
    try {
      const resp = await apiClient.post(`/admin/sessions/${id}/pause`, { reason });
      if (resp.success) {
        toast.warning('Session paused');
        fetchSessionDetails();
      }
    } catch (err: any) {
      toast.error('Failed to pause session');
    } finally {
      setModalState({ isOpen: false, type: 'PAUSE' });
    }
  };

  const handleResume = async () => {
    if (!id) return;
    try {
      const resp = await apiClient.post(`/admin/sessions/${id}/resume`);
      if (resp.success) {
        toast.success('Session resumed');
        fetchSessionDetails();
      }
    } catch (err: any) {
      toast.error('Failed to resume session');
    } finally {
      setModalState({ isOpen: false, type: 'RESUME' });
    }
  };

  const handleEnd = async (reason?: string) => {
    if (!id) return;
    try {
      const resp = await apiClient.post(`/admin/sessions/${id}/end`, { reason });
      if (resp.success) {
        toast.info('Session ended');
        fetchSessionDetails();
      }
    } catch (err: any) {
      toast.error('Failed to end session');
    } finally {
      setModalState({ isOpen: false, type: 'END' });
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading session telemetry and activity stream...</p>
      </div>
    );
  }

  const session = data?.session;
  const submissions = data?.submissions || [];
  const timeline = data?.timeline || [];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/live-sessions"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {session?.sessionStatus || 'ACTIVE'}
              </span>
              <span className="text-xs text-slate-400 font-mono">{session?.id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Live Session: {session?.studentName}
            </h1>
          </div>
        </div>

        {/* Operational Control Buttons */}
        <div className="flex items-center gap-3">
          {session?.sessionStatus === 'ACTIVE' && (
            <button
              onClick={() => setModalState({ isOpen: true, type: 'PAUSE' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Pause className="w-4 h-4" /> Pause Session
            </button>
          )}

          {session?.sessionStatus === 'PAUSED' && (
            <button
              onClick={() => setModalState({ isOpen: true, type: 'RESUME' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Play className="w-4 h-4" /> Resume Session
            </button>
          )}

          {session?.sessionStatus !== 'COMPLETED' && (
            <button
              onClick={() => setModalState({ isOpen: true, type: 'END' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <StopCircle className="w-4 h-4" /> Terminate Session
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student & Hardware Telemetry */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-800">
              <User className="w-4 h-4 text-blue-400" /> Participant Verification
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-bold text-white">{session?.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-mono text-slate-300">{session?.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Login Timestamp:</span>
                <span className="text-slate-300">{formatDate(session?.loginTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Subnet:</span>
                <span className="font-mono text-emerald-400">{session?.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Workstation:</span>
                <span className="text-slate-300">{session?.device}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Browser User-Agent:</span>
                <span className="text-slate-300">{session?.browser || 'Chrome 124.0'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-800">
              <Trophy className="w-4 h-4 text-amber-400" /> Contest Arena Stats
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Current Score</span>
                <div className="text-xl font-extrabold text-blue-400 mt-0.5">{session?.score || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Active Level</span>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">L{session?.currentDifficulty || 1}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Problems Solved</span>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">{session?.solvedCount || 0}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Time Remaining</span>
                <div className="text-xl font-extrabold text-white mt-0.5 font-mono">
                  {formatTimeRemaining(session?.timeRemainingSeconds || 5400)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Code & Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Question & Code Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  CURRENT PROBLEM (LEVEL {session?.currentDifficulty})
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{session?.currentQuestionTitle}</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                Kotlin 2.0 Editor Synced
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-blue-300 leading-relaxed overflow-x-auto">
              <div className="text-slate-500 mb-2">// Live snapshot from participant code editor:</div>
              <pre>{session?.currentCodeSnippet || `class Solution {
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
}`}</pre>
            </div>
          </div>

          {/* Activity Timeline Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-800">
              <Activity className="w-4 h-4 text-emerald-400" /> Interactive Session Activity Timeline
            </h3>

            <div className="space-y-3">
              {timeline.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">{item.time}</span>
                  <div className="flex-1 font-semibold text-slate-200">{item.event}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.type === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : item.type === 'SKIP'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'PAUSE'}
        onClose={() => setModalState({ isOpen: false, type: 'PAUSE' })}
        onConfirm={handlePause}
        title={`Pause Session for ${session?.studentName}?`}
        description="Freezes the student editor clock and prevents submission attempts. This action is audited."
        confirmText="Pause Session"
        variant="warning"
        requireReason={true}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'RESUME'}
        onClose={() => setModalState({ isOpen: false, type: 'RESUME' })}
        onConfirm={handleResume}
        title={`Resume Session for ${session?.studentName}?`}
        description="Unfreezes timer and restores editor execution."
        confirmText="Resume Session"
        variant="primary"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'END'}
        onClose={() => setModalState({ isOpen: false, type: 'END' })}
        onConfirm={handleEnd}
        title={`Terminate Session for ${session?.studentName}?`}
        description="Permanently ends this student's exam session."
        confirmText="Terminate Session"
        variant="danger"
        requireReason={true}
      />
    </div>
  );
}
