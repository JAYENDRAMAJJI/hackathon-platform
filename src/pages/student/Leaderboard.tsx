import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Search, RefreshCw, Crown, Award, Star, Activity, User, Building, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    try {
      setRefreshing(true);
      const resp = await apiClient.get('/student/leaderboard');
      if (resp.success && resp.data) {
        setStandings(resp.data);
      }
    } catch (err) {
      console.error('Failed to load student leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Live Competition Standings</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" /> Contest Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time algorithmic competition standings across all registered university participants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchLeaderboard}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/student/contest')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            Back to Arena <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Student Rank Callout Card */}
      {currentStudentEntry && (
        <div className="p-5 rounded-2xl bg-linear-to-r from-blue-900 to-indigo-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center font-mono font-black text-2xl text-yellow-300">
              #{currentStudentEntry.rank}
            </div>
            <div>
              <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Your Standings</p>
              <h3 className="text-xl font-bold text-white">{currentStudentEntry.name}</h3>
              <p className="text-xs text-blue-200">
                {currentStudentEntry.department} • Level {currentStudentEntry.currentDifficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-white/10">
            <div className="text-center px-4">
              <p className="text-xs text-blue-200 uppercase font-semibold">Total Score</p>
              <p className="text-2xl font-mono font-black text-yellow-300">{currentStudentEntry.score}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-blue-200 uppercase font-semibold">Problems Solved</p>
              <p className="text-2xl font-mono font-black text-white">{currentStudentEntry.solvedCount}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-blue-200 uppercase font-semibold">Highest Level</p>
              <p className="text-2xl font-mono font-black text-emerald-400">Lvl {currentStudentEntry.highestDifficulty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-slate-300" />
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold mb-3 shadow-inner">
              <Award className="w-6 h-6 text-slate-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2nd Place</span>
            <h4 className="text-lg font-bold text-slate-900 mt-1">{top3[1]?.name}</h4>
            <p className="text-xs text-slate-500 mb-3">{top3[1]?.department}</p>
            <div className="w-full pt-3 border-t border-slate-100 flex justify-around text-xs font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Score</span>
                <span className="text-base font-black text-slate-900">{top3[1]?.score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solved</span>
                <span className="text-base font-black text-slate-900">{top3[1]?.solvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Max Level</span>
                <span className="text-base font-black text-blue-600">Lvl {top3[1]?.highestDifficulty}</span>
              </div>
            </div>
          </div>

          {/* 1st Place - Champion */}
          <div className="order-1 md:order-2 bg-linear-to-b from-yellow-50/80 to-white p-6 rounded-2xl border-2 border-yellow-300 shadow-md flex flex-col items-center text-center relative overflow-hidden -mt-2">
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-yellow-400" />
            <div className="w-14 h-14 rounded-full bg-yellow-400 text-white flex items-center justify-center font-bold mb-3 shadow-md shadow-yellow-400/30">
              <Crown className="w-7 h-7" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-yellow-700">Tournament Leader</span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">{top3[0]?.name}</h4>
            <p className="text-xs text-slate-500 mb-4">{top3[0]?.department}</p>
            <div className="w-full pt-3 border-t border-yellow-200/60 flex justify-around text-xs font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Score</span>
                <span className="text-lg font-black text-yellow-600">{top3[0]?.score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solved</span>
                <span className="text-lg font-black text-slate-900">{top3[0]?.solvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Max Level</span>
                <span className="text-lg font-black text-blue-600">Lvl {top3[0]?.highestDifficulty}</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-amber-600/60" />
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 font-bold mb-3 shadow-inner">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">3rd Place</span>
            <h4 className="text-lg font-bold text-slate-900 mt-1">{top3[2]?.name}</h4>
            <p className="text-xs text-slate-500 mb-3">{top3[2]?.department}</p>
            <div className="w-full pt-3 border-t border-slate-100 flex justify-around text-xs font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Score</span>
                <span className="text-base font-black text-slate-900">{top3[2]?.score}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Solved</span>
                <span className="text-base font-black text-slate-900">{top3[2]?.solvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Max Level</span>
                <span className="text-base font-black text-blue-600">Lvl {top3[2]?.highestDifficulty}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search participants by name or department..."
          className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Standings Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800">
            All Participants Standings ({filteredStandings.length})
          </CardTitle>
          <span className="text-xs text-slate-500 font-medium">Sorted by Total Score (Descending)</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {loading && standings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-medium">Loading live tournament standings...</p>
                    </td>
                  </tr>
                ) : filteredStandings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No participants found</p>
                      <p className="text-xs text-slate-400 mt-1">Try modifying your search criteria.</p>
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
                            ? 'bg-blue-50/80 font-semibold text-slate-900 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-4 text-center font-mono font-bold">
                          {entry.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 text-yellow-800 text-xs font-black shadow-xs">
                              🥇
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 text-xs font-black shadow-xs">
                              🥈
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-black shadow-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{entry.name}</span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{entry.email}</span>
                        </td>
                        <td className="p-4 text-xs text-slate-600 flex items-center gap-1.5 mt-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{entry.department || 'Computer Science'}</span>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="info" className="text-xs font-bold">
                            Level {entry.currentDifficulty || 1}
                          </Badge>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-800">
                          {entry.solvedCount || 0}
                        </td>
                        <td className="p-4 text-center font-mono text-xs text-slate-500">
                          {entry.attemptsCount || 0}
                        </td>
                        <td className="p-4 text-right pr-6 font-mono font-black text-base text-blue-600">
                          {entry.score || 0} pts
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
