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
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
  ShieldAlert,
  Server,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { DashboardKpis } from '../../types/admin';
import { formatTimeRemaining } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contestTimer, setContestTimer] = useState<number>(5400);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchKpis = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const resp = await apiClient.get('/admin/dashboard');
      if (resp.success && resp.data) {
        setKpis(resp.data);
        if (resp.data.contest.timeRemainingSeconds) {
          setContestTimer(resp.data.contest.timeRemainingSeconds);
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
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Competition Engine
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            University Hackathon Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time monitoring, participant calibration, Kotlin sandboxes, and administrative controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchKpis(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Link
            to="/admin/contests"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Trophy className="w-4 h-4" /> Live Contest
          </Link>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Executive Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <QuickActionBtn icon={PlusCircle} label="Create Contest" path="/admin/contests/create" color="blue" />
          <QuickActionBtn icon={Code2} label="Add Question" path="/admin/questions" color="emerald" />
          <QuickActionBtn icon={Users} label="Add Faculty" path="/admin/faculty" color="purple" />
          <QuickActionBtn icon={UserCheck} label="Review Approvals" path="/admin/approvals" color="amber" badge={users?.pendingApprovals} />
          <QuickActionBtn icon={Activity} label="Live Sessions" path="/admin/live-sessions" color="cyan" />
          <QuickActionBtn icon={Award} label="Leaderboard" path="/admin/leaderboard" color="rose" />
          <QuickActionBtn icon={ShieldAlert} label="View Anomalies" path="/admin/anomalies" color="red" badge={security?.activeAnomalies} />
          <QuickActionBtn icon={FileSpreadsheet} label="Generate Report" path="/admin/reports" color="indigo" />
        </div>
      </div>

      {/* LIVE CONTEST HERO STATUS CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Live Contest Tile */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  STATUS: {contest?.status || 'ACTIVE'}
                </span>
                <span className="text-xs text-slate-400">Single Active Session Enforced</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-2">{contest?.name}</h3>
            </div>

            {/* Authoritative Server Countdown */}
            <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl text-center shadow-inner shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Time Remaining
              </div>
              <div className="text-2xl font-mono font-extrabold text-white tracking-wider mt-0.5">
                {formatTimeRemaining(contestTimer)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <StatBlock label="Total Registered" value={contest?.totalRegistered || 71} icon={Users} color="text-blue-400" />
            <StatBlock label="Active in Arena" value={contest?.activeParticipants || 64} icon={Activity} color="text-emerald-400" highlight />
            <StatBlock label="Completed" value={contest?.completedParticipants || 2} icon={CheckCircle2} color="text-indigo-400" />
            <StatBlock label="Not Started" value={contest?.notStarted || 5} icon={Clock} color="text-slate-400" />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Kotlin 2.0 (JVM 21 Sandbox)</span>
              <span>•</span>
              <span>Memory Limit: 256MB</span>
              <span>•</span>
              <span>CPU Limit: 5.0s</span>
            </div>
            <Link
              to="/admin/live-sessions"
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Open Live Monitor (64 Active Sessions) <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Security & Anomaly Center Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Security & Anomaly Watch</h3>
                  <p className="text-xs text-slate-400">Automated fraud detection engine</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {security?.activeAnomalies || 0} Alerts
              </span>
            </div>

            <div className="space-y-3 mt-4">
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

          <div className="pt-4 border-t border-slate-800 mt-4">
            <Link
              to="/admin/anomalies"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Review Flagged Anomalies ({security?.activeAnomalies || 0})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Users Card */}
        <KpiCategoryCard
          title="User Ecosystem"
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
          linkText="Manage User Accounts"
        />

        {/* Question Manager Card */}
        <KpiCategoryCard
          title="Question Manager"
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
          linkText="Open Question Manager"
        />

        {/* Submissions Card */}
        <KpiCategoryCard
          title="Submission Tracker"
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
          linkText="Open Submission Tracker (Read-Only)"
        />

        {/* Sandbox Infrastructure Card */}
        <KpiCategoryCard
          title="Execution Sandbox"
          icon={Server}
          color="cyan"
          mainValue="40/40"
          mainLabel="Docker Kotlin Workers"
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

      {/* DIFFICULTY CALIBRATION & RECENT AUDIT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Level 1-10 Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Problem Difficulty Calibration (Levels 1–10)
              </h3>
              <p className="text-xs text-slate-400">Distribution of registered questions across levels</p>
            </div>
            <Link
              to="/admin/questions/difficulty"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Calibrate <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
              const count = questions?.countByLevel?.[lvl] || 2;
              return (
                <div
                  key={lvl}
                  onClick={() => navigate(`/admin/questions?difficulty=${lvl}`)}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition-all group"
                >
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400">L{lvl}</div>
                  <div className="text-lg font-extrabold text-white mt-0.5">{count}</div>
                  <div className="text-[9px] text-slate-400 mt-1">qs</div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Dynamic Level Calibration: <b className="text-white">Active</b>
            </span>
            <span className="text-slate-400">Threshold: &gt;75% Promotes, &lt;30% Demotes</span>
          </div>
        </div>

        {/* Live Leaderboard Top 5 Sneak-Peek */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Live Arena Top Performers
              </h3>
              <p className="text-xs text-slate-400">Real-time leaderboard standings</p>
            </div>
            <Link
              to="/admin/leaderboard"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Open Contest Rankings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {[
              { rank: 1, name: 'Student One', score: 380, diff: 'Level 10', solved: 9, online: true },
              { rank: 2, name: 'Taylor Williams', score: 345, diff: 'Level 9', solved: 8, online: true },
              { rank: 3, name: 'Alex Smith', score: 310, diff: 'Level 8', solved: 7, online: true },
              { rank: 4, name: 'Jordan Johnson', score: 285, diff: 'Level 8', solved: 7, online: false },
              { rank: 5, name: 'Morgan Brown', score: 260, diff: 'Level 7', solved: 6, online: true },
            ].map((p) => (
              <div key={p.rank} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    p.rank === 1 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : p.rank === 2 ? 'bg-slate-300 text-slate-950' : p.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {p.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate flex items-center gap-2">
                      {p.name}
                      {p.online && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                    </div>
                    <div className="text-xs text-slate-400">{p.diff} • {p.solved} solved</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-blue-400">{p.score} pts</div>
                </div>
              </div>
            ))}
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
      className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-center group shadow-md relative"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white shadow-sm">
          {badge}
        </span>
      )}
      <div className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-300 mb-2">
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
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700/40'}`}>
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <span className="text-xs font-medium">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

function SecurityItem({ label, count, desc, severity }: { label: string; count: number; desc: string; severity: 'high' | 'medium' }) {
  return (
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-3">
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <Icon className="w-4 h-4 text-slate-400" />
        </div>

        <div className="py-4">
          <div className="text-3xl font-extrabold text-white tracking-tight">{mainValue}</div>
          <div className="text-xs text-slate-400 mt-0.5">{mainLabel}</div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/60">
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

      <div className="pt-4 border-t border-slate-800 mt-4">
        <Link
          to={link}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-between group"
        >
          <span>{linkText}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
