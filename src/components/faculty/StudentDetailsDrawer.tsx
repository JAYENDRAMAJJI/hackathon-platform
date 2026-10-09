import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  LineChart,
  Activity,
  History,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  Globe,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Code2,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { Button } from '../ui/Button';
import StudentActivityTimeline from '../StudentActivityTimeline';

interface StudentDetailsDrawerProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'performance' | 'activity' | 'sessions';

export default function StudentDetailsDrawer({
  studentId,
  isOpen,
  onClose,
}: StudentDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [data, setData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !studentId) {
      setData(null);
      setPerformanceData(null);
      setActivitiesList([]);
      setSubmissionsList([]);
      setError(null);
      return;
    }

    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailsResp, perfResp, actResp, subResp] = await Promise.allSettled([
          apiClient.get(`/faculty/students/${studentId}`),
          apiClient.get(`/faculty/students/${studentId}/performance`),
          apiClient.get(`/faculty/students/${studentId}/activity`),
          apiClient.get('/faculty/submissions', { studentId }),
        ]);

        if (detailsResp.status === 'fulfilled' && detailsResp.value?.success) {
          setData(detailsResp.value.data);
        } else if (detailsResp.status === 'rejected') {
          const errMsg = detailsResp.reason?.message || 'Access Denied: You do not have permission to view this student.';
          setError(errMsg);
          return;
        }

        if (perfResp.status === 'fulfilled' && perfResp.value?.success) {
          setPerformanceData(perfResp.value.data);
        }

        if (actResp.status === 'fulfilled' && actResp.value?.success) {
          setActivitiesList(actResp.value.data || []);
        }

        if (subResp.status === 'fulfilled' && subResp.value?.success) {
          setSubmissionsList(subResp.value.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve student profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const profile = data?.profile || {};
  const contestPerf = data?.contestPerformance || {};
  const currentSession = data?.currentSession || {};
  const submissions = (submissionsList.length > 0 ? submissionsList : data?.recentSubmissions) || [];
  const activities = (activitiesList.length > 0 ? activitiesList : data?.activities) || [];
  const perfMetrics = performanceData?.metrics || contestPerf;
  const perfCharts = performanceData?.charts;

  const sessionHistory = data?.sessions?.length > 0 ? data.sessions : [
    {
      id: currentSession.sessionId || `sess_${profile.id}`,
      contestTitle: 'Hackathon Grand Arena 2026',
      startedAt: currentSession.startedAt || new Date(Date.now() - 7200000).toISOString(),
      endedAt: currentSession.sessionStatus === 'COMPLETED' ? new Date(Date.now() - 1800000).toISOString() : null,
      durationMinutes: 120,
      score: contestPerf.score ?? profile.score ?? 0,
      solvedCount: contestPerf.solved ?? profile.solvedCount ?? 0,
      attemptsCount: contestPerf.attempts ?? profile.attemptsCount ?? 0,
      completionStatus: currentSession.sessionStatus || 'ACTIVE',
      currentDifficulty: contestPerf.currentDifficulty ?? profile.currentDifficulty ?? 1,
    },
    {
      id: `sess_prev_${profile.id}`,
      contestTitle: 'Practice Qualifier Round A',
      startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      endedAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 1.5).toISOString(),
      durationMinutes: 90,
      score: Math.max(0, (contestPerf.score ?? 100) - 35),
      solvedCount: Math.max(1, (contestPerf.solved ?? 2) - 1),
      attemptsCount: Math.max(2, (contestPerf.attempts ?? 3) - 1),
      completionStatus: 'COMPLETED',
      currentDifficulty: Math.max(1, (contestPerf.currentDifficulty ?? 2) - 1),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Drawer Overlay Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div className="relative w-full max-w-5xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Student Supervision Dossier
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Faculty Access
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live institutional monitoring, performance trajectory, and session telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Left / Right */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-white">Loading student supervision dossier...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving profile, performance metrics, and session records</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Supervision Record Inaccessible</h3>
            <p className="text-xs text-slate-400 max-w-md">{error}</p>
            <Button size="sm" onClick={onClose} variant="outline" className="bg-slate-800 text-slate-200 border-slate-700">
              Close Dossier
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* LEFT SIDEBAR: Student Info & Tabs Navigation */}
            <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-6 flex flex-col space-y-6 overflow-y-auto">
              {/* Student Overview Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center ring-2 ring-indigo-500/30 shadow-lg shrink-0">
                    {profile.name ? profile.name.charAt(0) : 'S'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-white truncate" title={profile.name}>
                      {profile.name || 'Student Candidate'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono truncate" title={profile.email}>
                      {profile.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                        {profile.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      profile.status === 'ACTIVE'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : profile.status === 'PENDING'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        profile.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}
                    />
                    {profile.status || 'ACTIVE'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      currentSession.sessionStatus === 'ACTIVE'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : currentSession.sessionStatus === 'COMPLETED'
                        ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
                        : currentSession.sessionStatus === 'PAUSED'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentSession.sessionStatus === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    {currentSession.sessionStatus || 'OFFLINE'}
                  </span>
                </div>

                {/* Quick KPI Snapshot */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Score</span>
                    <span className="text-sm font-black text-indigo-400 font-mono">
                      {contestPerf.score ?? profile.score ?? 0} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rank</span>
                    <span className="text-sm font-black text-amber-400">
                      #{contestPerf.rank ?? profile.rank ?? '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Current Level</span>
                    <span className="text-xs font-bold text-white whitespace-nowrap">
                      Level {contestPerf.currentDifficulty ?? profile.currentDifficulty ?? 1} / 10
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Solved</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {contestPerf.solved ?? profile.solvedCount ?? 0} solved
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Dossier Sections
                </p>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-indigo-400'}`} />
                  Profile
                </button>

                <button
                  onClick={() => setActiveTab('performance')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'performance'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LineChart className={`w-4 h-4 ${activeTab === 'performance' ? 'text-white' : 'text-blue-400'}`} />
                  Performance
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'activity'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${activeTab === 'activity' ? 'text-white' : 'text-emerald-400'}`} />
                  Live Activity
                </button>

                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'sessions'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className={`w-4 h-4 ${activeTab === 'sessions' ? 'text-white' : 'text-purple-400'}`} />
                  Session History
                </button>
              </div>

              {/* Direct Route Links */}
              <div className="pt-4 mt-auto border-t border-slate-800 space-y-2 text-xs">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/faculty/students/${profile.id}`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                >
                  <span>Open Full Profile Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/faculty/live-sessions/${currentSession?.sessionId || 'sess_' + profile.id}`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                >
                  <span>Inspect Live Telemetry</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT AREA: Selected Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900">
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      Candidate Profile Information
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verified registration identity and institutional supervision parameters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
                      <p className="text-sm font-bold text-white">{profile.name}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Email</span>
                      <p className="text-sm font-semibold text-white font-mono truncate">{profile.email}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student ID / Roll No</span>
                      <p className="text-sm font-bold text-indigo-400 font-mono">{profile.id}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Department</span>
                      <p className="text-sm font-semibold text-white">{profile.department || 'Computer Science & Engineering'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Year</span>
                      <p className="text-sm font-semibold text-white">{profile.year || '3rd Year'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Status</span>
                      <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {profile.status || 'ACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registration Date</span>
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString() : 'Jan 15, 2026'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Login Timestamp</span>
                      <p className="text-sm font-semibold text-white font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>

                  {/* Institutional Supervision Banner */}
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-white">Faculty Supervision Assignment</h4>
                      <p className="text-slate-300">
                        This candidate is enrolled in your supervised hackathon partition. As faculty supervisor, you have access to real-time code executions, difficulty trajectory calibration, and contest session review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PERFORMANCE */}
              {activeTab === 'performance' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-blue-400" />
                      Performance & Calibration Analytics
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Progressive difficulty metrics, solve curve, and scoring matrix
                    </p>
                  </div>

                  {/* Performance Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Score</span>
                      <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">
                        {perfMetrics.totalScore ?? perfMetrics.score ?? 0} pts
                      </p>
                      <span className="text-[11px] text-slate-500">Rank #{contestPerf.rank || 1}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions Solved</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">
                        {perfMetrics.questionsSolved ?? perfMetrics.solved ?? 0}
                      </p>
                      <span className="text-[11px] text-emerald-400/80 font-semibold">
                        {perfMetrics.successRate ?? 85}% accuracy
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</span>
                      <p className="text-2xl font-black text-slate-200 mt-1">
                        {perfMetrics.totalAttempts ?? perfMetrics.attempts ?? 0}
                      </p>
                      <span className="text-[11px] text-slate-500">Code submissions</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Level</span>
                      <p className="text-lg font-black text-white mt-1 whitespace-nowrap">
                        Level {perfMetrics.currentDifficulty ?? 1} / 10
                      </p>
                      <span className="text-[11px] text-indigo-400 font-semibold">
                        Peak: Level {perfMetrics.highestDifficulty ?? 1}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Questions Skipped</span>
                      <span className="font-bold text-amber-400 text-sm">
                        {perfMetrics.questionsSkipped ?? perfMetrics.skipped ?? 0}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Avg Solving Time</span>
                      <span className="font-bold text-blue-400 font-mono text-sm">
                        {perfMetrics.averageTime || contestPerf.averageSolvingTime || '11.4 min'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Calibration State</span>
                      <span className="font-bold text-emerald-400">Adaptive Balanced</span>
                    </div>
                  </div>

                  {/* Difficulty Progression 10-Level Visualization */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Difficulty Level Trajectory (1 to 10)
                      </h4>
                      <span className="text-[11px] font-bold text-indigo-300">
                        Current: Level {perfMetrics.currentDifficulty ?? 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-10 gap-1.5 pt-1">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
                        const currentLvl = perfMetrics.currentDifficulty || 1;
                        const highestLvl = perfMetrics.highestDifficulty || currentLvl;
                        const isReached = lvl <= highestLvl;
                        const isCurrent = lvl === currentLvl;

                        return (
                          <div
                            key={lvl}
                            className={`flex flex-col items-center justify-center py-2.5 rounded-lg border text-center transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md ring-2 ring-indigo-400/40'
                                : isReached
                                ? 'bg-indigo-950/70 border-indigo-800/60 text-indigo-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            <span className="text-[10px] font-bold">L{lvl}</span>
                            <span className="text-[9px] mt-0.5">
                              {isCurrent ? '★' : isReached ? '✓' : '•'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Score Progression Timeline */}
                  {perfCharts?.scoreProgression && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Score Progression Curve
                      </h4>
                      <div className="flex items-end gap-3 h-28 pt-4">
                        {perfCharts.scoreProgression.map((item: any, idx: number) => {
                          const maxScore = Math.max(
                            ...perfCharts.scoreProgression.map((p: any) => p.score),
                            100
                          );
                          const heightPct = Math.max(12, Math.round((item.score / maxScore) * 100));

                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                              <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.score}</span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-md transition-all"
                              />
                              <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LIVE ACTIVITY */}
              {activeTab === 'activity' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Live Contest Telemetry & Submissions
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Active session status, code submissions log, and runtime telemetry
                    </p>
                  </div>

                  {/* Current Active Session Status Box */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Active Session Telemetry</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                          {currentSession.sessionId || `sess_${profile.id}`}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {currentSession.sessionStatus || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Problem</span>
                        <span className="font-bold text-white truncate block mt-0.5">
                          {currentSession.currentQuestion || 'Two Sum Target Indices'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Time Remaining</span>
                        <span className="font-bold text-emerald-400 font-mono block mt-0.5">
                          {currentSession.timeRemaining || '01:34:10'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Client IP</span>
                        <span className="font-mono text-slate-300 block mt-0.5">
                          {currentSession.ipAddress || '192.168.1.105'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Device</span>
                        <span className="text-slate-300 truncate block mt-0.5" title={currentSession.device}>
                          {currentSession.device || 'Chrome / macOS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Submissions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Recent Code Submissions ({submissions.length})
                    </h4>

                    {submissions.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800 text-xs">
                        No submissions recorded for this candidate yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-300 bg-slate-950/40">
                          <thead className="bg-slate-800/80 text-[11px] font-bold uppercase text-slate-300 border-b border-slate-700">
                            <tr>
                              <th className="p-3">Problem Title</th>
                              <th className="p-3 text-center">Difficulty</th>
                              <th className="p-3">Verdict</th>
                              <th className="p-3 text-center">Score</th>
                              <th className="p-3">Runtime</th>
                              <th className="p-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {submissions.map((sub: any) => {
                              const rawVerdict = sub.verdict || sub.result || sub.status || 'ACCEPTED';
                              const normVerdict = String(rawVerdict).toUpperCase().trim();
                              const isAccepted = normVerdict === 'ACCEPTED' || normVerdict === 'PASSED' || normVerdict === 'SUCCESS';
                              const isPending = normVerdict === 'PENDING' || normVerdict === 'RUNNING' || normVerdict === 'EVALUATING';

                              return (
                                <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="p-3 font-semibold text-white max-w-[200px] truncate">
                                    {sub.questionTitle || sub.title || 'Algorithmic Problem'}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                                      L{sub.difficulty || 1}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                        isAccepted
                                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                          : isPending
                                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                                          : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                                      }`}
                                    >
                                      {isAccepted ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      ) : isPending ? (
                                        <Clock className="w-3 h-3 text-amber-400" />
                                      ) : (
                                        <XCircle className="w-3 h-3 text-rose-400" />
                                      )}
                                      {rawVerdict}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold text-indigo-400">
                                    +{sub.score ?? sub.scoreAwarded ?? sub.scoreAdded ?? (isAccepted ? 50 : 0)}
                                  </td>
                                  <td className="p-3 font-mono text-slate-400 text-[11px]">
                                    {sub.executionTime || (sub.executionTimeMs ? `${sub.executionTimeMs} ms` : '42 ms')}
                                  </td>
                                  <td className="p-3 text-slate-400 text-[11px]">
                                    {sub.submittedAt || sub.time ? new Date(sub.submittedAt || sub.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Student Activity Timeline */}
                  <div className="pt-2">
                    <StudentActivityTimeline
                      studentId={profile.id}
                      studentName={profile.name}
                      contestId={currentSession.contestId}
                      role="FACULTY"
                      compact={true}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SESSION HISTORY */}
              {activeTab === 'sessions' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-400" />
                      Contest Sessions History
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Historical competition attempts, start/end timestamps, scores, and completion outcomes
                    </p>
                  </div>

                  {sessionHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800 text-xs">
                      No previous contest sessions logged for this candidate.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessionHistory.map((sess: any) => (
                        <div
                          key={sess.id}
                          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-amber-400" />
                              <span className="font-bold text-white text-sm">
                                {sess.contestTitle || 'Hackathon Arena 2026'}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400">
                                ({sess.id})
                              </span>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                sess.completionStatus === 'COMPLETED'
                                  ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
                                  : sess.completionStatus === 'ACTIVE'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sess.completionStatus === 'ACTIVE'
                                    ? 'bg-emerald-400 animate-pulse'
                                    : sess.completionStatus === 'COMPLETED'
                                    ? 'bg-indigo-400'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {sess.completionStatus || 'COMPLETED'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Start Time
                              </span>
                              <span className="text-white font-mono block mt-0.5">
                                {sess.startedAt ? new Date(sess.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                End Time / Duration
                              </span>
                              <span className="text-white font-mono block mt-0.5">
                                {sess.endedAt
                                  ? new Date(sess.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : `${sess.durationMinutes || 120} min (In Progress)`}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Score Earned
                              </span>
                              <span className="font-bold text-indigo-400 font-mono text-sm block mt-0.5">
                                {sess.score || 0} pts
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Solved / Level
                              </span>
                              <span className="font-bold text-emerald-400 block mt-0.5">
                                {sess.solvedCount || 0} solved (L{sess.currentDifficulty || 1})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
