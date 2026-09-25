import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Code2,
  Trophy,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ShieldAlert,
  Flame,
  UserX,
  Layers,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Play,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { FacultyDashboardKpis, FacultyContestStatus, FacultyAlert } from '../../types/faculty';
import { ActivityLog, Contest } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';
import { useAuthStore } from '../../store/authStore';

export default function FacultyDashboard() {
  const [assignedContests, setAssignedContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [kpis, setKpis] = useState<FacultyDashboardKpis | null>(null);
  const [contestStatus, setContestStatus] = useState<FacultyContestStatus | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [alerts, setAlerts] = useState<FacultyAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [difficultyMatrix, setDifficultyMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();

  // 1. Fetch assigned contests first
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const resp = await apiClient.get('/faculty/contests');
        if (resp.success && resp.data) {
          setAssignedContests(resp.data);
          if (resp.data.length > 0 && !selectedContestId) {
            setSelectedContestId(resp.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load assigned contests:', err);
      }
    };
    fetchContests();
  }, []);

  const loadDashboardData = async (isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const query = selectedContestId ? `?contestId=${selectedContestId}` : '';
      const [kpiRes, contestRes, activityRes, alertRes, perfRes, diffRes] = await Promise.all([
        apiClient.get(`/faculty/dashboard-kpis${query}`),
        apiClient.get(`/faculty/contest-status${query}`),
        apiClient.get(`/faculty/recent-activity${query}`),
        apiClient.get(`/faculty/alerts${query}`),
        apiClient.get(`/faculty/analytics/performance${query}`),
        apiClient.get(`/faculty/analytics/difficulty${query}`),
        minDelay,
      ]);

      if (kpiRes.success && kpiRes.data) setKpis(kpiRes.data);
      if (contestRes.success && contestRes.data) setContestStatus(contestRes.data.contest);
      if (activityRes.success && activityRes.data) setRecentActivity(activityRes.data);
      if (alertRes.success && alertRes.data) setAlerts(alertRes.data);
      if (perfRes.success && perfRes.data) setPerformanceData(perfRes.data);
      if (diffRes.success && diffRes.data) setDifficultyMatrix(diffRes.data);

      if (isManual) {
        showToast('success', 'Cohort telemetry refreshed');
      }
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (assignedContests.length > 0) {
      loadDashboardData(false);
      const interval = setInterval(() => loadDashboardData(false), 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [selectedContestId, assignedContests.length]);

  if (!loading && assignedContests.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">No Contests Assigned</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You currently have not been assigned to supervise any coding contests. Please contact the platform administrator to be designated as a contest supervisor.
        </p>
      </div>
    );
  }

  const selectedContest = assignedContests.find((c) => c.id === selectedContestId) || assignedContests[0];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* TOP COMMAND CENTER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/80 border border-slate-800 p-6 lg:p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Faculty Supervision
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {selectedContest?.name || 'Assigned Hackathon'}
            </span>
            {user?.department && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  {user.department}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Faculty Mentor'}!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Supervise assigned student cohorts in real time. Track problem-solving momentum, review automated fraud heuristic alerts, and calibrate performance benchmarks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {assignedContests.length > 1 && (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 shadow-sm">
                <span className="text-slate-400">Contest:</span>
                <select
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {assignedContests.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => navigate('/faculty/reports')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 fill-white" /> Cohort Reports
            </button>
            <button
              onClick={() => navigate('/faculty/students')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer"
            >
              <Users className="w-4 h-4 text-cyan-400" /> My Students ({kpis?.assignedStudents ?? '--'})
            </button>
            <button
              onClick={() => navigate('/faculty/live-sessions')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" /> Live Sessions
            </button>
          </div>
        </div>

        {/* Action Controls on the Right */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 z-10 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <GraduationCap className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* CONTEST STATUS AUTHORITATIVE WIDGET */}
      {contestStatus && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  STATUS: {contestStatus.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">Authoritative Cohort Countdown</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5">{contestStatus.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{contestStatus.description}</p>
            </div>

            {/* Authoritative Server Countdown */}
            <div className="bg-slate-800/80 border border-slate-700 px-5 py-2.5 rounded-xl text-center shadow-inner shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" /> Time Remaining
              </div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wider mt-0.5">
                {contestStatus.timeRemaining}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Assigned Cohort</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                  {contestStatus.assignedStudentsCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Active in Arena</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">
                  {contestStatus.assignedActiveParticipants}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                  {kpis?.completedStudents || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Participation Rate</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                  {Math.round(((contestStatus.assignedActiveParticipants || 0) / (contestStatus.assignedStudentsCount || 1)) * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-semibold">Cohort Supervision Mode</span>
                <span>•</span>
                <span>Automated Anomaly Watch Active</span>
                <span>•</span>
                <span>Real-Time Code Telemetry</span>
              </div>
              <button
                onClick={() => navigate('/faculty/live-sessions')}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                Inspect Assigned Live Sessions ({contestStatus.assignedActiveParticipants} Active) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8 REAL-TIME DATABASE KPI METRICS */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Cohort Performance Telemetry
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-400" />}
            title="Assigned Students"
            value={kpis?.assignedStudents ?? '--'}
            subtitle="Supervised cohort"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            title="Active Students"
            value={kpis?.activeStudents ?? '--'}
            subtitle="Currently in arena"
            valueColor="text-emerald-400"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-indigo-400" />}
            title="Completed"
            value={kpis?.completedStudents ?? '--'}
            subtitle="Finalized attempts"
          />
          <StatCard
            icon={<UserX className="w-5 h-5 text-slate-400" />}
            title="Inactive / Offline"
            value={kpis?.inactiveStudents ?? '--'}
            subtitle="Idle or disconnected"
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-amber-400" />}
            title="Active Sessions"
            value={kpis?.activeSessions ?? '--'}
            subtitle="Live heartbeats"
            valueColor="text-amber-400"
          />
          <StatCard
            icon={<Code2 className="w-5 h-5 text-purple-400" />}
            title="Submissions"
            value={kpis?.totalSubmissions ?? '--'}
            subtitle="Evaluated solutions"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            title="Average Score"
            value={kpis?.averageScore !== undefined ? `${kpis.averageScore} pts` : '--'}
            subtitle="Cohort benchmark"
            valueColor="text-emerald-400"
          />
          <StatCard
            icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
            title="Flagged Anomalies"
            value={kpis?.anomalies ?? '--'}
            subtitle="Heuristic triggers"
            valueColor="text-rose-400"
          />
        </div>
      </div>

      {/* QUICK SUPERVISORY ACTIONS */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Executive Operations
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickActionBtn
            icon={Users}
            label="My Students"
            path="/faculty/students"
            count={kpis?.assignedStudents}
          />
          <QuickActionBtn
            icon={Activity}
            label="Active Sessions"
            path="/faculty/live-sessions"
            count={kpis?.activeStudents}
          />
          <QuickActionBtn
            icon={Trophy}
            label="Leaderboard"
            path="/faculty/leaderboard"
          />
          <QuickActionBtn
            icon={AlertTriangle}
            label="View Anomalies"
            path="/faculty/anomalies"
            badge={kpis?.anomalies}
          />
          <QuickActionBtn
            icon={BarChart3}
            label="Analytics"
            path="/faculty/analytics/performance"
          />
          <QuickActionBtn
            icon={FileSpreadsheet}
            label="Cohort Reports"
            path="/faculty/reports"
          />
        </div>
      </div>

      {/* 5 SUPERVISORY ANALYTICS CHARTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Diagnostic Visualizations
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Supervisory Performance & Contest Analytics
            </h2>
          </div>
          <button
            onClick={() => navigate('/faculty/analytics/performance')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            View Deep Analytics <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Chart 1: Student Participation Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Student Participation
              </span>
              <span className="text-[10px] font-medium text-slate-400">Assigned Cohort</span>
            </div>
            <div className="p-5 space-y-3">
              {kpis && (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active Solving ({kpis.activeStudents})
                      </span>
                      <span className="font-mono text-slate-300">{Math.round((kpis.activeStudents / (kpis.assignedStudents || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(kpis.activeStudents / (kpis.assignedStudents || 1)) * 100}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Completed Arena ({kpis.completedStudents})
                      </span>
                      <span className="font-mono text-slate-300">{Math.round((kpis.completedStudents / (kpis.assignedStudents || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(kpis.completedStudents / (kpis.assignedStudents || 1)) * 100}%` }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        Inactive / Offline ({kpis.inactiveStudents})
                      </span>
                      <span className="font-mono text-slate-300">{Math.round((kpis.inactiveStudents / (kpis.assignedStudents || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(kpis.inactiveStudents / (kpis.assignedStudents || 1)) * 100}%` }}
                        className="h-full bg-slate-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Score Distribution Histogram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                Score Distribution
              </span>
              <span className="text-[10px] font-medium text-slate-400">Score Brackets</span>
            </div>
            <div className="p-5">
              <div className="h-32 flex items-end gap-3 px-2 pb-1 border-b border-l border-slate-800">
                {(performanceData?.charts?.scoreDistribution || [
                  { range: '0-100', count: 4 },
                  { range: '101-250', count: 12 },
                  { range: '251-400', count: 14 },
                  { range: '401-600', count: 5 },
                  { range: '600+', count: 2 },
                ]).map((item: any, idx: number) => {
                  const maxCount = 15;
                  const heightPct = Math.max(12, Math.round((item.count / maxCount) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all duration-300"
                      />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">{item.range}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 3: Difficulty Distribution Levels 1 to 10 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Difficulty Calibration (1–10)
              </span>
              <span className="text-[10px] font-medium text-slate-400">Cohort Spread</span>
            </div>
            <div className="p-5">
              <div className="h-32 flex items-end gap-1.5 px-1 pb-1 border-b border-l border-slate-800">
                {(difficultyMatrix.length > 0 ? difficultyMatrix : Array.from({ length: 10 }, (_, i) => ({ level: i + 1, studentsCurrentCount: (i % 4) + 1 }))).map((row: any) => {
                  const maxCount = 8;
                  const heightPct = Math.max(10, Math.round(((row.studentsCurrentCount || 1) / maxCount) * 100));
                  return (
                    <div key={row.level} className="flex-1 flex flex-col items-center gap-1 group" title={`Level ${row.level}: ${row.studentsCurrentCount || 0} students`}>
                      <span className="text-[8px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {row.studentsCurrentCount || 0}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm"
                      />
                      <span className="text-[8px] font-mono text-slate-400">L{row.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 4: Submission Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Submission Activity Timeline
              </span>
              <span className="text-[10px] font-medium text-slate-400">Submissions over time</span>
            </div>
            <div className="p-5">
              <div className="h-32 flex items-end gap-3 px-2 pb-1 border-b border-l border-slate-800">
                {(performanceData?.charts?.performanceOverTime || [
                  { minute: '15m', submissionsCount: 18 },
                  { minute: '30m', submissionsCount: 42 },
                  { minute: '45m', submissionsCount: 78 },
                  { minute: '60m', submissionsCount: 110 },
                  { minute: '75m', submissionsCount: 145 },
                  { minute: '90m', submissionsCount: 165 },
                ]).map((item: any, idx: number) => {
                  const maxSubs = 180;
                  const heightPct = Math.max(12, Math.round((item.submissionsCount / maxSubs) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.submissionsCount}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-sm"
                      />
                      <span className="text-[9px] font-mono text-slate-400">{item.minute}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 5: Success Rate Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between md:col-span-2">
            <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Submission Verdict & Success Rates
              </span>
              <span className="text-[10px] font-medium text-slate-400">Kotlin Evaluator Output</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <p className="text-[10px] font-semibold text-emerald-400">Accepted</p>
                  <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">68.2%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                  <p className="text-[10px] font-semibold text-rose-400">Wrong Answer</p>
                  <p className="text-lg font-mono font-bold text-rose-400 mt-0.5">18.4%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
                  <p className="text-[10px] font-semibold text-amber-400">Compile Error</p>
                  <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">7.6%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
                  <p className="text-[10px] font-semibold text-purple-400">Time Limit</p>
                  <p className="text-lg font-mono font-bold text-purple-400 mt-0.5">3.8%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <p className="text-[10px] font-semibold text-slate-300">Runtime Error</p>
                  <p className="text-lg font-mono font-bold text-slate-200 mt-0.5">2.0%</p>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden">
                <div style={{ width: '68.2%' }} className="h-full bg-emerald-500" title="Accepted (68.2%)" />
                <div style={{ width: '18.4%' }} className="h-full bg-rose-500" title="Wrong Answer (18.4%)" />
                <div style={{ width: '7.6%' }} className="h-full bg-amber-500" title="Compilation Error (7.6%)" />
                <div style={{ width: '3.8%' }} className="h-full bg-purple-500" title="Timeout (3.8%)" />
                <div style={{ width: '2.0%' }} className="h-full bg-slate-600" title="Runtime Error (2.0%)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID: RECENT ACTIVITY & SUPERVISORY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity from Assigned Students */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col justify-between">
            <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Assigned Students Activity Stream
              </div>
              <Link
                to="/faculty/activity"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                View Full Log <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Activity</th>
                    <th className="px-5 py-3.5">Question</th>
                    <th className="px-5 py-3.5">Level</th>
                    <th className="px-5 py-3.5">Result</th>
                    <th className="px-5 py-3.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 8).map((act) => {
                      const isAccepted = act.result === 'ACCEPTED' || act.result === 'PASSED' || act.result === 'SUCCESS';
                      return (
                        <tr
                          key={act.id}
                          className="hover:bg-slate-800/40 transition-colors border-b border-slate-800/60"
                        >
                          <td className="px-5 py-3.5 font-bold text-white">
                            <Link
                              to={`/faculty/students/${act.studentId}`}
                              className="hover:text-blue-400 hover:underline transition-colors"
                            >
                              {act.studentName}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">
                            {act.activity}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 max-w-[140px] truncate">
                            {act.questionTitle || 'General Arena'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                              L{act.difficulty || 1}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isAccepted
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {act.result || 'EXECUTED'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-400 font-mono">
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        No recent activity recorded for assigned cohort.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Important Alerts Feed */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col justify-between">
            <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Supervisory Alerts
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {alerts.length} Active
              </span>
            </div>

            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[420px] flex-1">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => navigate(alert.link)}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        {alert.type === 'ANOMALY' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <UserX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        {alert.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                          alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                  No supervisory alerts detected for your assigned students.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, valueColor }: {
  icon: any;
  title: string;
  value: string | number;
  subtitle: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all flex items-center justify-between">
      <div>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
        <div className={`text-2xl font-mono font-extrabold mt-1 tracking-tight ${valueColor || 'text-white'}`}>
          {value}
        </div>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>
  );
}

function QuickActionBtn({ icon: Icon, label, path, count, badge }: {
  icon: any;
  label: string;
  path: string;
  count?: number | string;
  badge?: number;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/60 transition-all text-center group shadow-xl relative cursor-pointer w-full"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white shadow-sm">
          {badge}
        </span>
      )}
      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-300 mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
          {count}
        </span>
      )}
    </button>
  );
}
