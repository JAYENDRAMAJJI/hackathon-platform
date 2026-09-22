import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Search,
  RefreshCw,
  Crown,
  Award,
  Star,
  Activity,
  User,
  Building,
  ArrowRight,
  Sparkles,
  Flame,
  Layers,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import LeaderboardFilter from '../../components/LeaderboardFilter';
import { LeaderboardFilterMeta } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

export interface StudentLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  email: string;
  department: string;
  score: number;
  solvedCount: number;
  attemptsCount: number;
  skippedCount: number;
  currentDifficulty: number;
  highestDifficulty: number;
  sessionStatus: string;
  isCurrentStudent?: boolean;
}

export default function StudentLeaderboard() {
  const [standings, setStandings] = useState<StudentLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState('ALL');
  const [filterMeta, setFilterMeta] = useState<LeaderboardFilterMeta | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchLeaderboard = async (currentKey = filterKey, isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const [resp] = await Promise.all([
        apiClient.get('/student/leaderboard', { filterKey: currentKey, contextId: currentKey }),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setStandings(resp.data);
      }
      if (resp.filterMeta) {
        setFilterMeta(resp.filterMeta);
      } else if (resp.contexts) {
        setFilterMeta({ contexts: resp.contexts });
      }
      if (isManual) {
        toast.success('Live contest leaderboard standings refreshed');
      }
    } catch (err) {
      console.error('Failed to load student leaderboard:', err);
      if (isManual) {
        toast.error('Failed to load leaderboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(filterKey);
  }, [filterKey]);

  const handleFilterChange = (newKey: string) => {
    setFilterKey(newKey);
    setLoading(true);
  };

  const filteredStandings = useMemo(() => {
    let list = standings;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.department && s.department.toLowerCase().includes(q))
      );
    }
    return list;
  }, [standings, search]);

  const top3 = useMemo(() => standings.slice(0, 3), [standings]);
  const currentStudentEntry = useMemo(
    () => standings.find((s) => s.isCurrentStudent || s.id === user?.id || s.email === user?.email),
    [standings, user]
  );

  const selectedContext = filterMeta?.contexts?.find((c) => c.id === filterKey || `contest:${c.id}` === filterKey);
  const currentContextName = filterKey === 'ALL' || !selectedContext ? 'All Contexts' : selectedContext.name;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Competition Standings</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" /> Contest Rankings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time algorithmic competition standings for{' '}
            <span className="font-semibold text-blue-400">{currentContextName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLeaderboard(filterKey, true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Standings'}</span>
          </button>
          <button
            onClick={() => navigate('/student/contest')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
          >
            <span>Back to Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Student Rank Callout Card */}
      {currentStudentEntry && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center font-mono font-black text-2xl text-yellow-300 shadow-inner">
              #{currentStudentEntry.rank}
            </div>
            <div>
              <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Your Official Standing</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{currentStudentEntry.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentStudentEntry.department || 'Computer Science'} • Level {currentStudentEntry.currentDifficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-800 w-full md:w-auto justify-around md:justify-end">
            <div className="text-center px-4">
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Score</p>
              <p className="text-2xl font-mono font-extrabold text-yellow-400 mt-0.5">{currentStudentEntry.score} pts</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-slate-400 uppercase font-semibold">Problems Solved</p>
              <p className="text-2xl font-mono font-extrabold text-white mt-0.5">{currentStudentEntry.solvedCount}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-slate-400 uppercase font-semibold">Highest Level</p>
              <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-0.5">
                Lvl {currentStudentEntry.highestDifficulty}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400" />
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold mb-3 shadow-inner">
              <Award className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">2nd Place</span>
            <h4 className="text-lg font-extrabold text-white mt-1 truncate max-w-full">{top3[1]?.name}</h4>
            <p className="text-xs text-slate-400 mb-3">{top3[1]?.department}</p>
            <div className="w-full pt-3 border-t border-slate-800 flex justify-around text-xs font-semibold">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Score</span>
                <span className="text-base font-mono font-black text-white">{top3[1]?.score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solved</span>
                <span className="text-base font-mono font-black text-white">{top3[1]?.solvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Max Level</span>
                <span className="text-base font-mono font-black text-blue-400">Lvl {top3[1]?.highestDifficulty}</span>
              </div>
            </div>
          </div>

          {/* 1st Place - Champion */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-slate-900 to-amber-950/20 p-6 rounded-2xl border-2 border-amber-500/50 shadow-2xl flex flex-col items-center text-center relative overflow-hidden -mt-2">
            <div className="absolute top-0 left-0 right-0 h-2 bg-amber-400" />
            <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-lg shadow-amber-500/30">
              <Crown className="w-7 h-7" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">Tournament Leader</span>
            <h4 className="text-xl font-extrabold text-white mt-1 truncate max-w-full">{top3[0]?.name}</h4>
            <p className="text-xs text-slate-400 mb-4">{top3[0]?.department}</p>
            <div className="w-full pt-3 border-t border-slate-800 flex justify-around text-xs font-semibold">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Score</span>
                <span className="text-lg font-mono font-black text-amber-400">{top3[0]?.score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solved</span>
                <span className="text-lg font-mono font-black text-white">{top3[0]?.solvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Max Level</span>
                <span className="text-lg font-mono font-black text-blue-400">Lvl {top3[0]?.highestDifficulty}</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-600" />
            <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-600/30 flex items-center justify-center text-amber-400 font-bold mb-3 shadow-inner">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">3rd Place</span>
            <h4 className="text-lg font-extrabold text-white mt-1 truncate max-w-full">{top3[2]?.name}</h4>
            <p className="text-xs text-slate-400 mb-3">{top3[2]?.department}</p>
            <div className="w-full pt-3 border-t border-slate-800 flex justify-around text-xs font-semibold">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Score</span>
                <span className="text-base font-mono font-black text-white">{top3[2]?.score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solved</span>
                <span className="text-base font-mono font-black text-white">{top3[2]?.solvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Max Level</span>
                <span className="text-base font-mono font-black text-blue-400">Lvl {top3[2]?.highestDifficulty}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Context-Wise Filter Toolbar (variant="dark") */}
      <LeaderboardFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search participants by name or department..."
        selectedKey={filterKey}
        onFilterChange={handleFilterChange}
        meta={filterMeta}
        totalParticipants={filteredStandings.length}
        variant="dark"
      />

      {/* Standings Table in Admin Panel Style */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-950/60 border-b border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
          <div className="text-base font-extrabold text-white">
            All Participant Standings ({filteredStandings.length})
          </div>
          <span className="text-xs text-slate-400 font-medium">Sorted by Total Score (Descending)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 text-center w-16">Rank</th>
                <th className="p-4">Participant</th>
                <th className="p-4">Department</th>
                <th className="p-4 text-center">Current Level</th>
                <th className="p-4 text-center">Solved</th>
                <th className="p-4 text-center">Attempts</th>
                <th className="p-4 text-right pr-6">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && standings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-medium">Loading live tournament standings...</p>
                  </td>
                </tr>
              ) : filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <User className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">No participants found</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying your search or context filter.</p>
                  </td>
                </tr>
              ) : (
                filteredStandings.map((entry) => {
                  const isCurrentUser = entry.isCurrentStudent || entry.id === user?.id || entry.email === user?.email;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-blue-950/40 font-semibold text-white border-l-4 border-l-blue-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
                            🥇
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 text-slate-200 border border-slate-600 text-xs font-black">
                            🥈
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-900/30 text-amber-500 border border-amber-600/30 text-xs font-black">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{entry.name}</span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{entry.email}</span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{entry.department || 'Computer Science'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Level {entry.currentDifficulty || 1}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-white">
                        {entry.solvedCount || 0}
                      </td>
                      <td className="p-4 text-center font-mono text-xs text-slate-400">
                        {entry.attemptsCount || 0}
                      </td>
                      <td className="p-4 text-right pr-6 font-mono font-black text-base text-blue-400">
                        {entry.score || 0} pts
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
