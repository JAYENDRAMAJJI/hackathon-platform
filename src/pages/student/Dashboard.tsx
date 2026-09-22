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
  Code,
  KeyRound,
  ShieldCheck,
  Calendar,
  Layers,
  Users,
  Lock,
  Sparkles,
  X,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>{contest.name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
            Welcome, {user?.name || 'Student'}!
          </h1>
          <p className="text-blue-200 mb-6 text-base leading-relaxed">
            Your Kotlin competition session is active. Advance through difficulty tiers, submit verified solutions, and climb the live institutional leaderboard.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              className="bg-white text-blue-950 hover:bg-blue-50 font-black text-sm px-6 py-3 rounded-xl shadow-lg border-none flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/student/contest${contest.id ? `?contestId=${contest.id}` : ''}`)}
            >
              Enter Active Arena <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 text-xs font-bold"
              onClick={() => navigate('/student/leaderboard')}
            >
              <Trophy className="w-4 h-4 mr-1.5 text-yellow-400" /> View Leaderboard
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
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
              Enter your invitation code to unlock and join private departmental hackathons.
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
            className="w-full sm:w-44 px-3.5 py-2 bg-slate-800 border border-amber-500/30 rounded-xl text-amber-300 font-mono font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
          />
          <Button
            type="submit"
            disabled={joiningCode || !inputCode.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl whitespace-nowrap shadow-md"
          >
            {joiningCode ? 'Joining...' : 'Unlock Arena'}
          </Button>
        </form>
      </div>

      {/* AVAILABLE CONTESTS DIRECTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" /> Competitions & Hackathons
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore active and scheduled university contests. Join with your access code to enter.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableContests.length === 0 ? (
            <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No published contests available right now.</p>
              <p className="text-xs text-slate-400 mt-1">Check back soon or enter an access code above.</p>
            </div>
          ) : (
            availableContests.map((c) => {
              const isActive = c.status === 'ACTIVE';
              const isScheduled = c.status === 'SCHEDULED';
              const isEnded = c.status === 'ENDED' || c.status === 'CANCELLED';
              const isEnrolled = c.isJoined;

              return (
                <div
                  key={c.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isActive ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isScheduled
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                        {c.status}
                      </span>

                      {isEnrolled && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description || 'Institutional coding hackathon.'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
                        <span className="font-bold text-slate-800">{c.durationMinutes} min</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Levels</span>
                        <span className="font-bold text-slate-800">
                          L{c.difficultyRange ? c.difficultyRange[0] : 1} - L{c.difficultyRange ? c.difficultyRange[1] : 10}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Enrolled</span>
                        <span className="font-bold text-slate-800">{c.participantsCount || 0} students</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {c.date || 'Today'}
                    </span>

                    {isEnrolled ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/student/contest?contestId=${c.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" /> Enter Arena
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTargetContestForJoin(c);
                          setModalCode('');
                          setCodeModalOpen(true);
                        }}
                        className="border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Join with Code
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Grid: Performance & Telemetry */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Main Left Column */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Performance Overview</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<Trophy className="w-6 h-6 text-yellow-500" />}
              title="Current Score"
              value={loading ? '...' : `${perf.score} pts`}
              subtitle={`Tournament Rank: #${perf.rank || 1}`}
            />
            <StatCard
              icon={<Target className="w-6 h-6 text-blue-500" />}
              title="Problems Solved"
              value={loading ? '...' : `${perf.solvedCount}`}
              subtitle={`Current Difficulty: Level ${perf.currentDifficulty || 1}`}
            />
          </div>

          {/* Recent Submissions */}
          <Card className="shadow-xs border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" /> Recent Submissions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold p-0"
                onClick={() => navigate('/student/contest')}
              >
                Go to Arena
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="py-8 text-center text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs">Loading submissions...</p>
                </div>
              ) : recentSubs.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Code className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No submissions yet</p>
                  <p className="text-xs text-slate-500 mt-1">Enter the contest arena to solve your first challenge.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubs.map((sub: any) => {
                    const isAccepted = sub.status === 'ACCEPTED' || sub.status === 'PASSED' || sub.status === 'SUCCESS';
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isAccepted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{sub.title}</h4>
                            <p className="text-xs text-slate-500">
                              Level {sub.difficulty || 1} • {sub.executionTime || '34 ms'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={isAccepted ? 'success' : 'danger'}>
                            {isAccepted ? 'Accepted' : sub.status || 'Failed'}
                          </Badge>
                          <span className="font-mono font-bold text-slate-900 text-xs w-12 text-right">
                            {isAccepted ? `+${sub.scoreAdded || 20}` : '0'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Right Column */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-blue-200 shadow-xs bg-gradient-to-b from-blue-50/50 to-white">
            <CardHeader className="bg-blue-100/60 rounded-t-xl border-b border-blue-200/80 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-950 font-black text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Active Arena Status
                </CardTitle>
                <Badge variant="success" className="animate-pulse text-[10px] font-bold">
                  {contest.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Synchronized Clock
                </p>
                <div className="text-3xl font-mono font-black text-slate-900 flex items-center gap-2.5">
                  <Clock className="w-6 h-6 text-blue-600" />
                  01:34:10
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Authoritative server timer</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Language Constraint:</span>
                  <span className="font-bold text-slate-900">Kotlin 2.0 (JVM 21)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Code Execution:</span>
                  <span className="font-bold text-emerald-600">Isolated Sandbox</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Supervisor:</span>
                  <span className="font-bold text-slate-900">
                    {dashboardData?.assignedFaculty?.name || 'Assigned Faculty'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-200/70">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  All submitted solutions are compiled and graded server-side against visible and hidden edge test suites.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: ENTER ACCESS CODE FOR SELECTED CONTEST */}
      {codeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Enter Contest Access Code</h3>
                  <p className="text-xs text-slate-500">
                    {targetContestForJoin?.name || 'Enter the contest verification key'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCodeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contest Access Code
              </label>
              <input
                type="text"
                autoFocus
                value={modalCode}
                onChange={(e) => setModalCode(e.target.value.toUpperCase())}
                placeholder="e.g. HACK2026"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-black text-lg tracking-widest text-slate-900 uppercase focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 text-center">
                Contact your faculty supervisor or department administrator if you need an access key.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCodeModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={joiningCode || !modalCode.trim()}
                onClick={() => handleJoinWithCode(modalCode)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                {joiningCode ? 'Verifying...' : 'Verify & Enter Arena'}
              </Button>
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
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-600 font-semibold border-t border-slate-100 pt-3">{subtitle}</p>
    </div>
  );
}

