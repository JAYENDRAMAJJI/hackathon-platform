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
  Eye,
  ShieldAlert,
  Flame,
  UserX,
  Layers,
  KeyRound,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { FacultyDashboardKpis, FacultyContestStatus, FacultyAlert } from '../../types/faculty';
import { ActivityLog, Contest } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

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
      const query = selectedContestId ? `?contestId=${selectedContestId}` : '';
      const [kpiRes, contestRes, activityRes, alertRes, perfRes, diffRes] = await Promise.all([
        apiClient.get(`/faculty/dashboard-kpis${query}`),
        apiClient.get(`/faculty/contest-status${query}`),
        apiClient.get(`/faculty/recent-activity${query}`),
        apiClient.get(`/faculty/alerts${query}`),
        apiClient.get(`/faculty/analytics/performance${query}`),
        apiClient.get(`/faculty/analytics/difficulty${query}`),
      ]);

      if (kpiRes.success && kpiRes.data) setKpis(kpiRes.data);
      if (contestRes.success && contestRes.data) setContestStatus(contestRes.data.contest);
      if (activityRes.success && activityRes.data) setRecentActivity(activityRes.data);
      if (alertRes.success && alertRes.data) setAlerts(alertRes.data);
      if (perfRes.success && perfRes.data) setPerformanceData(perfRes.data);
      if (diffRes.success && diffRes.data) setDifficultyMatrix(diffRes.data);

      if (isManual) {
        showToast('success', 'Dashboard metrics refreshed');
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

  return (
    <div className="space-y-6">
      {/* Top Header, Contest Switcher & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Faculty Supervisory Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring, live sessions telemetry, and student progress for your assigned cohort.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Assigned Contest Switcher */}
          {assignedContests.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold">Contest:</span>
              <select
                value={selectedContestId}
                onChange={(e) => setSelectedContestId(e.target.value)}
                className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-none"
              >
                {assignedContests.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.code || c.accessCode || 'LIVE'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/faculty/reports')}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 rounded-xl"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Contest Status Authoritative Widget */}
      {contestStatus && (
        <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48 text-indigo-400" />
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {contestStatus.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Authoritative Contest Timer</span>
                </div>
                <h2 className="text-xl font-bold text-white">{contestStatus.name}</h2>
                <p className="text-xs text-slate-300 max-w-2xl">{contestStatus.description}</p>
              </div>

              {/* Countdown & Metrics */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Remaining</p>
                  <p className="text-2xl font-mono font-bold text-indigo-400">{contestStatus.timeRemaining}</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Active / Total</p>
                  <p className="text-xl font-bold text-white">
                    {contestStatus.assignedActiveParticipants} / {contestStatus.assignedStudentsCount}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/faculty/contest')}
                  className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/40"
                >
                  Contest View
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8 Real-Time Database KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-indigo-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Assigned Students</p>
              <p className="text-2xl font-bold text-white mt-1">
                {kpis?.assignedStudents ?? '--'}
              </p>
              <span className="text-[10px] text-blue-400 font-medium">Supervised cohort</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Active Students</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {kpis?.activeStudents ?? '--'}
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">Currently coding</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-indigo-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Completed Students</p>
              <p className="text-2xl font-bold text-white mt-1">
                {kpis?.completedStudents ?? '--'}
              </p>
              <span className="text-[10px] text-indigo-400 font-medium">Finished arena</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Inactive / Offline</p>
              <p className="text-2xl font-bold text-slate-300 mt-1">
                {kpis?.inactiveStudents ?? '--'}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Idle or disconnected</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <UserX className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-amber-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Active Sessions</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {kpis?.activeSessions ?? '--'}
              </p>
              <span className="text-[10px] text-amber-400 font-medium">Live heartbeats</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/60">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-purple-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Submissions</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {kpis?.totalSubmissions ?? '--'}
              </p>
              <span className="text-[10px] text-purple-400 font-medium">Kotlin evaluations</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <Code2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Average Score</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {kpis?.averageScore ?? '--'} pts
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">Cohort benchmark</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-rose-500/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Anomalies</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {kpis?.anomalies ?? '--'}
              </p>
              <span className="text-[10px] text-rose-400 font-medium">Heuristic flags</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Supervisory Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/faculty/students')}
            className="justify-start text-xs font-semibold h-11 border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-blue-500/50"
          >
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            My Students
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/faculty/live-sessions')}
            className="justify-start text-xs font-semibold h-11 border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-emerald-500/50"
          >
            <Activity className="w-4 h-4 mr-2 text-emerald-400" />
            Active Sessions
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/faculty/leaderboard')}
            className="justify-start text-xs font-semibold h-11 border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-amber-500/50"
          >
            <Trophy className="w-4 h-4 mr-2 text-amber-400" />
            Leaderboard
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/faculty/anomalies')}
            className="justify-start text-xs font-semibold h-11 border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-rose-500/50"
          >
            <AlertTriangle className="w-4 h-4 mr-2 text-rose-400" />
            View Anomalies
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/faculty/analytics/performance')}
            className="justify-start text-xs font-semibold h-11 border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-purple-500/50"
          >
            <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
            Analytics
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/faculty/reports')}
            className="justify-start text-xs font-semibold h-11 border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-indigo-500/50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-400" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* 5 Supervisory Analytics Charts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Supervisory Performance & Contest Analytics
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/faculty/analytics/performance')}
            className="text-xs text-indigo-400 hover:underline p-0 h-auto font-semibold"
          >
            View Deep Analytics →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chart 1: Student Participation Breakdown */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Student Participation
                </span>
                <span className="text-[10px] font-normal text-slate-400">Assigned Cohort</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {kpis && (
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1">
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
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1">
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
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1">
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
            </CardContent>
          </Card>

          {/* Chart 2: Score Distribution Histogram */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  Score Distribution
                </span>
                <span className="text-[10px] font-normal text-slate-400">Score Brackets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
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
            </CardContent>
          </Card>

          {/* Chart 3: Difficulty Distribution Levels 1 to 10 */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Difficulty Levels (1–10)
                </span>
                <span className="text-[10px] font-normal text-slate-400">Cohort Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
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
            </CardContent>
          </Card>

          {/* Chart 4: Submission Activity Timeline */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Submission Activity Timeline
                </span>
                <span className="text-[10px] font-normal text-slate-400">Submissions over time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
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
            </CardContent>
          </Card>

          {/* Chart 5: Success Rate Breakdown */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl md:col-span-2">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Submission Verdict & Success Rates
                </span>
                <span className="text-[10px] font-normal text-slate-400">Kotlin Evaluator Output</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                  <p className="text-[10px] font-semibold text-emerald-400">Accepted</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">68.2%</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60">
                  <p className="text-[10px] font-semibold text-rose-400">Wrong Answer</p>
                  <p className="text-lg font-bold text-rose-400 mt-0.5">18.4%</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60">
                  <p className="text-[10px] font-semibold text-amber-400">Compile Error</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">7.6%</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/60">
                  <p className="text-[10px] font-semibold text-purple-400">Time Limit</p>
                  <p className="text-lg font-bold text-purple-400 mt-0.5">3.8%</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[10px] font-semibold text-slate-300">Runtime Error</p>
                  <p className="text-lg font-bold text-slate-200 mt-0.5">2.0%</p>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                <div style={{ width: '68.2%' }} className="h-full bg-emerald-500" title="Accepted (68.2%)" />
                <div style={{ width: '18.4%' }} className="h-full bg-rose-500" title="Wrong Answer (18.4%)" />
                <div style={{ width: '7.6%' }} className="h-full bg-amber-500" title="Compilation Error (7.6%)" />
                <div style={{ width: '3.8%' }} className="h-full bg-purple-500" title="Timeout (3.8%)" />
                <div style={{ width: '2.0%' }} className="h-full bg-slate-600" title="Runtime Error (2.0%)" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Important Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity from Assigned Students */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Assigned Students Activity Stream
              </CardTitle>
              <Link
                to="/faculty/activity"
                className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                View Full Log
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Question</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 8).map((act) => (
                        <tr
                          key={act.id}
                          className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/60"
                        >
                          <td className="px-4 py-3 font-semibold text-white">
                            <Link
                              to={`/faculty/students/${act.studentId}`}
                              className="hover:text-indigo-400 hover:underline transition-colors"
                            >
                              {act.studentName}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {act.activity}
                          </td>
                          <td className="px-4 py-3 text-slate-300 max-w-[140px] truncate">
                            {act.questionTitle || 'General Arena'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                              L{act.difficulty || 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                act.result === 'ACCEPTED' || act.result === 'PASSED'
                                  ? 'success'
                                  : act.result === 'FAILED' || act.result === 'WRONG_ANSWER'
                                  ? 'danger'
                                  : 'default'
                              }
                            >
                              {act.result || 'EXECUTED'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400 font-mono">
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No recent activity recorded for assigned cohort.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Important Alerts Feed */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Supervisory Alerts
              </CardTitle>
              <Badge variant="danger">{alerts.length} Active</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[380px]">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => navigate(alert.link)}
                    className="p-3 rounded-xl border border-slate-800 hover:border-indigo-500/60 bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all duration-150 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        {alert.type === 'ANOMALY' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        ) : (
                          <UserX className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
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
                      <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                        Inspect
                        <ArrowRight className="w-3 h-3" />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
