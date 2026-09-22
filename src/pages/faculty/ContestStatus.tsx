import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Users,
  Activity,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { FacultyContestStatus } from '../../types/faculty';
import { Contest } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

export default function ContestStatus() {
  const [assignedContests, setAssignedContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [contest, setContest] = useState<FacultyContestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

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

  const fetchContest = async (isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const query = selectedContestId ? `?contestId=${selectedContestId}` : '';
      const [resp] = await Promise.all([
        apiClient.get(`/faculty/contest-status${query}`),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setContest(resp.data.contest);
      }
      if (isManual) {
        showToast('success', 'Contest arena telemetry synchronized');
      }
    } catch (err) {
      console.error('Failed to load contest status:', err);
      if (isManual) {
        showToast('error', 'Failed to synchronize contest timer');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (assignedContests.length > 0) {
      fetchContest(false);
      const interval = setInterval(() => fetchContest(false), 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [selectedContestId, assignedContests.length]);

  if (!loading && assignedContests.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">No Contests Assigned</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You currently have not been assigned to supervise any coding competitions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            Contest Arena Status & Lifecycle
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative server-synchronized timer, arena participants breakdown, and supervisory contest metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => fetchContest(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Timer
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/faculty/leaderboard')}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Live Leaderboard
          </Button>
        </div>
      </div>

      {/* Main Authoritative Timer Card */}
      {contest && (
        <Card className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {contest.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">Kotlin 2.0 Arena</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{contest.name}</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{contest.description}</p>
            </div>

            {/* Authoritative Clock */}
            <div className="bg-slate-950/70 p-6 rounded-2xl border border-indigo-500/30 backdrop-blur-md text-center sm:text-right flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Time Remaining</p>
              <p className="text-4xl sm:text-5xl font-mono font-bold text-indigo-400 tracking-tight my-1">
                {contest.timeRemaining}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Duration: {contest.durationMinutes} minutes total
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Grid: Metrics Overview */}
      {contest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Contestants</p>
              <p className="text-2xl font-bold text-white mt-1">{contest.totalParticipants}</p>
              <span className="text-[10px] text-slate-400">Platform-wide</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Participants</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{contest.activeParticipants}</p>
              <span className="text-[10px] text-emerald-400 font-medium">Currently solving</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Your Assigned Cohort</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{contest.assignedStudentsCount}</p>
              <span className="text-[10px] text-indigo-400 font-medium">{contest.assignedActiveParticipants} active now</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Completed Participants</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{contest.completedParticipants}</p>
              <span className="text-[10px] text-slate-400">{contest.assignedCompletedParticipants} in your cohort</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contest Stage Timeline */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Competition Arena Stage Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Setup & Registration</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Verified registrations and student sandbox initialization.</p>
            </div>

            <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/40">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>2. Active Arena</span>
              </div>
              <p className="text-[11px] text-indigo-200 mt-2 font-medium">Live Kotlin coding arena with Levels 1–10 progressive evaluation.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 opacity-70">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>3. Final Evaluation</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Automated hidden test cases execution and anomaly review.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 opacity-70">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                <Trophy className="w-4 h-4" />
                <span>4. Podium & Awards</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Final leaderboard publication and certification reports.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
