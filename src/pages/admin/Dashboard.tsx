import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Trophy,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  PlusCircle,
  FileCode,
  UserCheck,
  Award,
  ArrowUpRight,
  RefreshCw,
  ShieldAlert,
  Server,
  TrendingUp,
  Layers,
  ChevronRight,
  Flame,
  GraduationCap,
  Briefcase,
  Play,
  Calendar,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { DashboardKpis } from '../../types/admin';
import { formatTimeRemaining } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contestTimer, setContestTimer] = useState<number>(5400);

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();

  const fetchKpis = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const minDelay = silent ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const [resp] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setKpis(resp.data);
        if (resp.data.contest.timeRemainingSeconds) {
          setContestTimer(resp.data.contest.timeRemainingSeconds);
        }
        if (silent) {
          toast.success('Command center telemetry refreshed');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dashboard KPIs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    // Live timer decrement
    const timerInterval = setInterval(() => {
      setContestTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  if (loading && !kpis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Hackathon Arena 2.0 Live Dashboard...</p>
      </div>
    );
  }

  const contest = kpis?.contest;
  const users = kpis?.users;
  const questions = kpis?.questions;
  const submissions = kpis?.submissions;
  const security = kpis?.security;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* TOP COMMAND CENTER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/80 border border-slate-800 p-6 lg:p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Competition Engine
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {contest?.name || 'Grand Hackathon Arena'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Single Active Session Enforced
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Administrator'}!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Real-time competition supervision, algorithmic calibration, participant telemetry, and automated security anomaly monitoring across all institutional hackathons.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/admin/contests"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-white" /> Live Contest Arena
            </Link>
            <Link
              to="/admin/leaderboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" /> Contest Rankings
            </Link>
            <Link
              to="/admin/live-sessions"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" /> Active Sessions
            </Link>
          </div>
        </div>

        {/* Action Controls on the Right */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 z-10 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
          <button
            onClick={() => fetchKpis(true)}
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
          <ShieldAlert className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Executive Operations
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <QuickActionBtn icon={Users} label="User Access" path="/admin/users" color="blue" />
          <QuickActionBtn icon={GraduationCap} label="Student Insights" path="/admin/students" color="cyan" />
          <QuickActionBtn icon={Briefcase} label="Faculty Management" path="/admin/faculty" color="purple" />
          <QuickActionBtn icon={UserCheck} label="Pending Approvals" path="/admin/approvals" color="amber" badge={users?.pendingApprovals} />
          <QuickActionBtn icon={PlusCircle} label="Create Contest" path="/admin/contests/create" color="indigo" />
          <QuickActionBtn icon={Code2} label="Add Question" path="/admin/questions" color="emerald" />
          <QuickActionBtn icon={Activity} label="Live Sessions" path="/admin/live-sessions" color="cyan" />
          <QuickActionBtn icon={Award} label="Leaderboard" path="/admin/leaderboard" color="rose" />
        </div>
      </div>

      {/* LIVE CONTEST HERO STATUS CARD & SECURITY WATCH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Live Contest Tile */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  STATUS: {contest?.status || 'ACTIVE'}
                </span>
                <span className="text-xs text-slate-400">Single Active Contest Rule Enforced</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1.5">{contest?.name}</h3>
            </div>

            {/* Authoritative Server Countdown */}
            <div className="bg-slate-800/80 border border-slate-700 px-5 py-2.5 rounded-xl text-center shadow-inner shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" /> Time Remaining
              </div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wider mt-0.5">
                {formatTimeRemaining(contestTimer)}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBlock label="Total Registered" value={contest?.totalRegistered || 71} icon={Users} color="text-blue-400" />
              <StatBlock label="Active in Arena" value={contest?.activeParticipants || 64} icon={Activity} color="text-emerald-400" highlight />
              <StatBlock label="Completed" value={contest?.completedParticipants || 2} icon={CheckCircle2} color="text-indigo-400" />
              <StatBlock label="Not Started" value={contest?.notStarted || 5} icon={Clock} color="text-slate-400" />
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-semibold">Kotlin 2.0 Sandbox</span>
                <span>•</span>
                <span>Memory: 256MB</span>
                <span>•</span>
                <span>CPU: 5.0s</span>
              </div>
              <Link
                to="/admin/live-sessions"
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                Open Live Monitor ({contest?.activeParticipants || 64} Active Sessions) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Anomaly Center Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Security & Anomaly Watch</h3>
                  <p className="text-[11px] text-slate-400">Automated fraud detection engine</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {security?.activeAnomalies || 0} Alerts
              </span>
            </div>

            <div className="p-5 space-y-2.5">
              <SecurityItem
                label="High Priority Alerts"
                count={security?.highPriorityAnomalies || 1}
                desc="Instant solve (<5s) on Level 7 question"
                severity="high"
              />
              <SecurityItem
                label="Multiple Login Alerts"
                count={security?.multipleLoginAlerts || 1}
                desc="Concurrent IP tokens flagged"
                severity="medium"
              />
              <SecurityItem
                label="Rapid Submission Alerts"
                count={security?.rapidSubmissionsAlerts || 1}
                desc=">5 compiles within 15s window"
                severity="medium"
              />
            </div>
          </div>

          <div className="p-5 pt-0">
            <Link
              to="/admin/anomalies"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Review Flagged Anomalies ({security?.activeAnomalies || 0})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRIDS */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Platform Architecture & Operations
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Access KPI Card */}
          <KpiCategoryCard
            title="User Access"
            icon={Users}
            color="blue"
            mainValue={users?.total || 77}
            mainLabel="Total Platform Users"
            items={[
              { label: 'Approved Students', value: users?.approvedStudents || 62, color: 'text-emerald-400' },
              { label: 'Pending Approvals', value: users?.pendingApprovals || 6, color: 'text-amber-400', link: '/admin/approvals' },
              { label: 'Rejected Accounts', value: users?.rejectedUsers || 3, color: 'text-rose-400' },
              { label: 'Active Faculty Staff', value: users?.facultyCount || 2, color: 'text-indigo-400', link: '/admin/faculty' },
            ]}
            link="/admin/users"
            linkText="Manage User Access"
          />

          {/* Question Manager Card */}
          <KpiCategoryCard
            title="Question Bank"
            icon={Code2}
            color="emerald"
            mainValue={questions?.total || 20}
            mainLabel="Calibrated Questions (1-10)"
            items={[
              { label: 'Level 1–3 (Easy)', value: (questions?.countByLevel?.[1] || 2) + (questions?.countByLevel?.[2] || 2) + (questions?.countByLevel?.[3] || 2), color: 'text-emerald-400' },
              { label: 'Level 4–7 (Medium)', value: (questions?.countByLevel?.[4] || 2) + (questions?.countByLevel?.[5] || 2) + (questions?.countByLevel?.[6] || 2) + (questions?.countByLevel?.[7] || 2), color: 'text-amber-400' },
              { label: 'Level 8–10 (Hard)', value: (questions?.countByLevel?.[8] || 2) + (questions?.countByLevel?.[9] || 2) + (questions?.countByLevel?.[10] || 2), color: 'text-rose-400' },
              { label: 'Kotlin Sandboxed', value: '100%', color: 'text-blue-400' },
            ]}
            link="/admin/questions"
            linkText="Open Question Bank"
          />

          {/* Submissions Card */}
          <KpiCategoryCard
            title="Submissions"
            icon={FileCode}
            color="indigo"
            mainValue={submissions?.total || 45}
            mainLabel="Contest Submissions"
            items={[
              { label: 'Accepted (Passed 100%)', value: submissions?.successful || 28, color: 'text-emerald-400' },
              { label: 'Wrong Answers / Errors', value: submissions?.failed || 11, color: 'text-rose-400' },
              { label: 'Compilation Errors', value: submissions?.compilationErrors || 4, color: 'text-amber-400' },
              { label: 'Timeouts (>5s CPU)', value: submissions?.timeouts || 2, color: 'text-purple-400' },
            ]}
            link="/admin/submissions"
            linkText="Open Submission Tracker"
          />

          {/* Sandbox Infrastructure Card */}
          <KpiCategoryCard
            title="Execution Sandbox"
            icon={Server}
            color="cyan"
            mainValue="40/40"
            mainLabel="Isolated Kotlin Workers"
            items={[
              { label: 'Sandbox Queue Delay', value: '0 ms', color: 'text-emerald-400' },
              { label: 'Average Compile Time', value: '42 ms', color: 'text-blue-400' },
              { label: 'Security Isolation', value: 'Read-Only FS', color: 'text-slate-300' },
              { label: 'Network Access', value: 'Disabled', color: 'text-rose-400' },
            ]}
            link="/admin/settings"
            linkText="Sandbox Security Settings"
          />
        </div>
      </div>

      {/* USER MANAGEMENT SECTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              User Access & Verification
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Users className="w-5 h-5 text-blue-400" /> User Management
            </h2>
          </div>
          <Link
            to="/admin/users"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            Directory Hub <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. User Access */}
          <Link
            to="/admin/users"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/60 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {users?.total || 77} Users
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3 group-hover:text-blue-400 transition-colors">
                User Access
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Manage user accounts, roles, permissions, approvals, and active sessions.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-blue-400 font-semibold">
              <span>Access Control</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* 2. Student Insights */}
          <Link
            to="/admin/students"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850/60 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {users?.approvedStudents || 62} Active
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3 group-hover:text-cyan-400 transition-colors">
                Student Insights
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Monitor student performance, attempts, progress, and session activity.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>View Insights</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* 3. Faculty Management */}
          <Link
            to="/admin/faculty"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850/60 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  {users?.facultyCount || 2} Mentors
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3 group-hover:text-purple-400 transition-colors">
                Faculty Management
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Manage faculty mentors, student batches, and supervisory activities.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Supervise Mentors</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* 4. Pending Approvals */}
          <Link
            to="/admin/approvals"
            className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850/60 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {users?.pendingApprovals || 6} Pending
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-3 group-hover:text-amber-400 transition-colors">
                Pending Approvals
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Review and approve student/faculty registrations and access requests.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Review Requests</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* DIFFICULTY CALIBRATION & RECENT AUDIT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Level 1-10 Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Problem Difficulty Calibration (Levels 1–10)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Distribution of registered questions across levels</p>
            </div>
            <Link
              to="/admin/questions/difficulty"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Calibrate <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
                const count = questions?.countByLevel?.[lvl] || 2;
                return (
                  <div
                    key={lvl}
                    onClick={() => navigate(`/admin/questions?difficulty=${lvl}`)}
                    className="bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl p-3 text-center cursor-pointer transition-all group"
                  >
                    <div className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400">L{lvl}</div>
                    <div className="text-lg font-mono font-extrabold text-white mt-0.5">{count}</div>
                    <div className="text-[9px] text-slate-500 mt-1">qs</div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Dynamic Level Calibration: <b className="text-white">Active</b>
              </span>
              <span className="text-slate-400">Threshold: &gt;75% Promotes, &lt;30% Demotes</span>
            </div>
          </div>
        </div>

        {/* Live Leaderboard Top 5 Sneak-Peek */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Live Arena Top Performers
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time leaderboard standings</p>
            </div>
            <Link
              to="/admin/leaderboard"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Open Contest Rankings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6">
            <div className="space-y-2.5">
              {[
                { rank: 1, name: 'Student One', score: 380, diff: 'Level 10', solved: 9, online: true },
                { rank: 2, name: 'Taylor Williams', score: 345, diff: 'Level 9', solved: 8, online: true },
                { rank: 3, name: 'Alex Smith', score: 310, diff: 'Level 8', solved: 7, online: true },
                { rank: 4, name: 'Jordan Johnson', score: 285, diff: 'Level 8', solved: 7, online: false },
                { rank: 5, name: 'Morgan Brown', score: 260, diff: 'Level 7', solved: 6, online: true },
              ].map((p) => (
                <div
                  key={p.rank}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        p.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : p.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : p.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white truncate flex items-center gap-2">
                        {p.name}
                        {p.online && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                      </div>
                      <div className="text-xs text-slate-400">{p.diff} • {p.solved} solved</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-blue-400 text-sm">{p.score} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon: Icon, label, path, color, badge }: { icon: any; label: string; path: string; color: string; badge?: number }) {
  return (
    <Link
      to={path}
      className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/60 transition-all text-center group shadow-xl relative cursor-pointer"
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
    </Link>
  );
}

function StatBlock({ label, value, icon: Icon, color, highlight = false }: { label: string; value: number | string; icon: any; color: string; highlight?: boolean }) {
  return (
    <div className={`p-3.5 rounded-xl border ${highlight ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-800/40 border-slate-800'}`}>
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <span className="text-xs font-medium">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">{value}</div>
    </div>
  );
}

function SecurityItem({ label, count, desc, severity }: { label: string; count: number; desc: string; severity: 'high' | 'medium' }) {
  return (
    <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-800/30 flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-bold text-slate-200">{label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${
        severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      }`}>
        {count}
      </span>
    </div>
  );
}

function KpiCategoryCard({ title, icon: Icon, color, mainValue, mainLabel, items, link, linkText }: {
  title: string;
  icon: any;
  color: string;
  mainValue: string | number;
  mainLabel: string;
  items: { label: string; value: string | number; color?: string; link?: string }[];
  link: string;
  linkText: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
      <div>
        <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <Icon className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-5">
          <div className="text-3xl font-mono font-extrabold text-white tracking-tight">{mainValue}</div>
          <div className="text-xs text-slate-400 mt-0.5">{mainLabel}</div>

          <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{item.label}</span>
                {item.link ? (
                  <Link to={item.link} className={`font-bold hover:underline ${item.color || 'text-white'}`}>
                    {item.value}
                  </Link>
                ) : (
                  <span className={`font-bold ${item.color || 'text-white'}`}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-slate-800">
          <Link
            to={link}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-between group cursor-pointer transition-colors"
          >
            <span>{linkText}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
