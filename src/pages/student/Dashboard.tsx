import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Target,
  ArrowRight,
  Activity,
  AlertCircle,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Code2,
  KeyRound,
  ShieldCheck,
  Calendar,
  Layers,
  Users,
  Lock,
  Sparkles,
  X,
  Play,
  FileCode,
  Flame,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [availableContests, setAvailableContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Join Code State
  const [inputCode, setInputCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [targetContestForJoin, setTargetContestForJoin] = useState<any | null>(null);
  const [modalCode, setModalCode] = useState('');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [dashResp, contestsResp] = await Promise.all([
        apiClient.get('/student/dashboard'),
        apiClient.get('/student/contests'),
      ]);

      if (dashResp.success && dashResp.data) {
        setDashboardData(dashResp.data);
      }
      if (contestsResp.success && contestsResp.data) {
        setAvailableContests(contestsResp.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleJoinWithCode = async (codeToJoin: string, autoEnter: boolean = true) => {
    if (!codeToJoin.trim()) {
      toast.error('Please enter a valid contest access code.');
      return;
    }

    setJoiningCode(true);
    try {
      const resp = await apiClient.post('/student/contests/join', {
        code: codeToJoin.trim().toUpperCase(),
      });

      if (resp.success && resp.data) {
        const joinedContest = resp.data;
        toast.success(`Successfully registered for "${joinedContest.name}"!`);
        setCodeModalOpen(false);
        setInputCode('');
        setModalCode('');
        await fetchDashboardData();

        if (autoEnter && joinedContest.id) {
          navigate(`/student/contest?contestId=${joinedContest.id}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid contest code or contest not active');
    } finally {
      setJoiningCode(false);
    }
  };

  const perf = dashboardData?.performance || {
    score: 0,
    solvedCount: 0,
    attemptsCount: 0,
    skippedCount: 0,
    currentDifficulty: 1,
    highestDifficulty: 1,
    rank: 1,
  };

  const contest = dashboardData?.contest || {
    name: 'University Grand Hackathon 2026',
    status: 'ACTIVE',
  };

  const recentSubs = dashboardData?.recentSubmissions || [];

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
              {contest.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Student'}!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Your Kotlin competition sandbox is active. Solve algorithmic challenges, advance through difficulty tiers, and climb the live institutional leaderboard.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => navigate(`/student/contest${contest.id ? `?contestId=${contest.id}` : ''}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Enter Active Arena
            </button>
            <button
              onClick={() => navigate('/student/leaderboard')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" /> Contest Rankings
            </button>
          </div>
        </div>

        {/* Action Controls on the Right */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 z-10 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Target className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* QUICK CONTEST CODE ACCESS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Have a Contest Access Code?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your invitation code to unlock and register for departmental hackathons.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinWithCode(inputCode);
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="e.g. HACK2026"
            className="w-full sm:w-48 px-3.5 py-2.5 bg-slate-800 border border-amber-500/30 rounded-xl text-amber-300 font-mono font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-amber-400 placeholder:text-slate-500 transition-colors"
          />
          <Button
            type="submit"
            disabled={joiningCode || !inputCode.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl whitespace-nowrap shadow-md cursor-pointer transition-colors"
          >
            {joiningCode ? 'Joining...' : 'Unlock Arena'}
          </Button>
        </form>
      </div>

      {/* AVAILABLE CONTESTS DIRECTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tournament Directory
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Trophy className="w-5 h-5 text-blue-500" /> Competitions & Hackathons
            </h2>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            Refresh Directory
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableContests.length === 0 ? (
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 shadow-xl">
              <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">No published contests available right now.</p>
              <p className="text-xs text-slate-400 mt-1">Check back soon or unlock a private session with an access key above.</p>
            </div>
          ) : (
            availableContests.map((c) => {
              const isActive = c.status === 'ACTIVE';
              const isScheduled = c.status === 'SCHEDULED';
              const isEnrolled = c.isJoined;

              return (
                <div
                  key={c.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group ${
                    isActive
                      ? 'border-blue-500/40 hover:border-blue-500/70 shadow-blue-900/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isScheduled
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                        {c.status}
                      </span>

                      {isEnrolled && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {c.description || 'Institutional coding hackathon.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                      <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
                        <span className="font-bold text-white">{c.durationMinutes} min</span>
                      </div>
                      <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Levels</span>
                        <span className="font-bold text-white">
                          L{c.difficultyRange ? c.difficultyRange[0] : 1} - L{c.difficultyRange ? c.difficultyRange[1] : 10}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Participants</span>
                        <span className="font-bold text-white">{c.participantsCount || 0} enrolled</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {c.date || 'Today'}
                    </span>

                    {isEnrolled ? (
                      <button
                        onClick={() => navigate(`/student/contest?contestId=${c.id}`)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Enter Arena
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTargetContestForJoin(c);
                          setModalCode('');
                          setCodeModalOpen(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Join with Code
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN GRID: PERFORMANCE & TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Evaluation
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Your Performance Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<Trophy className="w-6 h-6 text-yellow-400" />}
              title="Current Tournament Score"
              value={loading ? '...' : `${perf.score} pts`}
              subtitle={`Tournament Rank: #${perf.rank || 1}`}
              color="border-yellow-500/20"
            />
            <StatCard
              icon={<Target className="w-6 h-6 text-blue-400" />}
              title="Problems Solved"
              value={loading ? '...' : `${perf.solvedCount}`}
              subtitle={`Current Difficulty: Level ${perf.currentDifficulty || 1}`}
              color="border-blue-500/20"
            />
          </div>

          {/* Recent Submissions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" /> Recent Submissions
              </div>
              <button
                onClick={() => navigate('/student/contest')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                Go to Arena <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-8 text-center text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs">Loading submissions...</p>
                </div>
              ) : recentSubs.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Code2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No submissions yet</p>
                  <p className="text-xs text-slate-400 mt-1">Enter the contest arena to solve your first challenge.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubs.map((sub: any) => {
                    const isAccepted = sub.status === 'ACCEPTED' || sub.status === 'PASSED' || sub.status === 'SUCCESS';
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isAccepted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-white truncate">{sub.title}</h4>
                            <p className="text-xs text-slate-400">
                              Level {sub.difficulty || 1} • {sub.executionTime || '34 ms'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                              isAccepted
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {isAccepted ? 'Accepted' : sub.status || 'Failed'}
                          </span>
                          <span className="font-mono font-bold text-blue-400 text-xs w-12 text-right">
                            {isAccepted ? `+${sub.scoreAdded || 20}` : '0'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="text-white font-extrabold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Active Arena Status
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {contest.status}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Authoritative Timer
              </p>
              <div className="text-3xl font-mono font-extrabold text-white flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-blue-400" />
                01:34:10
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Synchronized competition session</p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Language Constraint:</span>
                <span className="font-bold text-white">Kotlin 2.0 (JVM 21)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Code Execution:</span>
                <span className="font-bold text-emerald-400">Isolated Sandbox</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Supervisor:</span>
                <span className="font-bold text-white">
                  {dashboardData?.assignedFaculty?.name || 'Department Supervisor'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Memory / CPU Limits:</span>
                <span className="font-mono text-slate-300">256MB / 5.0s</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-blue-300 flex items-start gap-2.5 leading-relaxed bg-blue-950/40 p-3.5 rounded-xl border border-blue-800/40">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                All submitted solutions are compiled and graded server-side against visible and hidden edge test suites.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ENTER ACCESS CODE FOR SELECTED CONTEST */}
      {codeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Enter Contest Access Code</h3>
                  <p className="text-xs text-slate-400">
                    {targetContestForJoin?.name || 'Enter the contest verification key'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCodeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Contest Access Code
              </label>
              <input
                type="text"
                autoFocus
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value.toUpperCase())}
                placeholder="e.g. HACK2026"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center font-mono font-black text-lg tracking-widest text-amber-300 uppercase focus:outline-none focus:border-amber-400 transition-colors"
              />
              <p className="text-[11px] text-slate-400 text-center">
                Contact your faculty supervisor or department administrator if you need an access key.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={joiningCode || !modalCode.trim()}
                onClick={() => handleJoinWithCode(modalCode)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50 transition-all"
              >
                {joiningCode ? 'Verifying...' : 'Verify & Enter Arena'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color?: string;
}) {
  return (
    <div className={`bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all ${color || ''}`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">{value}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-400 font-semibold border-t border-slate-800/60 pt-3 flex items-center gap-1.5">
        {subtitle}
      </p>
    </div>
  );
}
