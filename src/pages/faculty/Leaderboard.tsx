import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Search,
  RefreshCw,
  Download,
  Printer,
  Crown,
  Eye,
  Building,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { exportToCSV } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email: string;
  department?: string;
  score: number;
  solved: number;
  attempts: number;
  skipped: number;
  currentDifficulty: number;
  highestDifficulty: number;
  averageSolvingTime: string;
  isAssignedToFaculty?: boolean;
}

export default function FacultyLeaderboard() {
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterAssignedOnly, setFilterAssignedOnly] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchLeaderboard = async (isManual = false) => {
    try {
      setRefreshing(true);
      const resp = await apiClient.get('/faculty/leaderboard');
      if (resp.success && resp.data) {
        setStandings(resp.data);
      }
      if (isManual) {
        toast.success('Leaderboard refreshed');
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      toast.error('Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(false);
  }, []);

  const filteredStandings = useMemo(() => {
    let list = standings;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q))
      );
    }
    if (filterAssignedOnly) {
      list = list.filter((s) => s.isAssignedToFaculty);
    }
    return list;
  }, [standings, search, filterAssignedOnly]);

  const top3 = useMemo(() => standings.slice(0, 3), [standings]);

  const handleExport = () => {
    if (filteredStandings.length === 0) {
      toast.warning('No leaderboard data to export');
      return;
    }

    const data = filteredStandings.map((s) => ({
      Rank: s.rank,
      Name: s.name,
      Email: s.email,
      Department: s.department || 'N/A',
      Score: s.score,
      Solved: s.solved,
      Attempts: s.attempts,
      Skipped: s.skipped,
      'Current Level': s.currentDifficulty,
      'Highest Level': s.highestDifficulty,
      'Avg Time': s.averageSolvingTime,
      'Assigned to You': s.isAssignedToFaculty ? 'YES' : 'NO',
    }));

    exportToCSV(data, `leaderboard_supervisory_standings_${new Date().toISOString().split('T')[0]}`);
    toast.success('Leaderboard standings exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            Live Arena Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time standings with dynamic scoring weights, attempt penalties, and supervisor cohort highlights (Read-Only).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeaderboard(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && !filterAssignedOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          {/* #2 Silver */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden">
            <CardContent className="p-5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-200 mx-auto flex items-center justify-center font-bold text-lg ring-4 ring-slate-700">
                2
              </div>
              <div>
                <p className="font-bold text-white text-sm">{top3[1]?.name}</p>
                <p className="text-[11px] text-slate-400">{top3[1]?.department || 'Computer Science'}</p>
              </div>
              <p className="text-xl font-bold text-indigo-400">{top3[1]?.score} pts</p>
              <span className="text-[10px] text-emerald-400 font-semibold">{top3[1]?.solved} solved • Level {top3[1]?.highestDifficulty}</span>
            </CardContent>
          </Card>

          {/* #1 Gold */}
          <Card className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl relative overflow-hidden sm:-translate-y-2">
            <CardContent className="p-5 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 mx-auto flex items-center justify-center font-bold text-xl ring-4 ring-amber-400 shadow-md shadow-amber-500/20">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-white text-base">{top3[0]?.name}</p>
                <p className="text-[11px] text-slate-400">{top3[0]?.department || 'Computer Science'}</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{top3[0]?.score} pts</p>
              <span className="text-[10px] text-emerald-400 font-semibold">{top3[0]?.solved} solved • Peak Level {top3[0]?.highestDifficulty}</span>
            </CardContent>
          </Card>

          {/* #3 Bronze */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden">
            <CardContent className="p-5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-950/60 text-amber-400 mx-auto flex items-center justify-center font-bold text-lg ring-4 ring-amber-900">
                3
              </div>
              <div>
                <p className="font-bold text-white text-sm">{top3[2]?.name}</p>
                <p className="text-[11px] text-slate-400">{top3[2]?.department || 'Computer Science'}</p>
              </div>
              <p className="text-xl font-bold text-amber-500">{top3[2]?.score} pts</p>
              <span className="text-[10px] text-emerald-400 font-semibold">{top3[2]?.solved} solved • Level {top3[2]?.highestDifficulty}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter & Cohort Toggle Bar */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl print:hidden">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search student by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterAssignedOnly}
                onChange={(e) => setFilterAssignedOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
              />
              Show My Assigned Cohort Only
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3.5 text-center">Rank</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5 text-center">Score</th>
                  <th className="px-4 py-3.5 text-center">Solved / Attempts</th>
                  <th className="px-4 py-3.5 text-center">Skipped</th>
                  <th className="px-4 py-3.5 text-center">Difficulty</th>
                  <th className="px-4 py-3.5">Avg Time</th>
                  <th className="px-4 py-3.5 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                      Loading live leaderboard standings...
                    </td>
                  </tr>
                ) : filteredStandings.length > 0 ? (
                  filteredStandings.map((st) => (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-800/50 transition-colors border-b border-slate-800/60 ${
                        st.isAssignedToFaculty ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center font-bold">
                        {st.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold">
                            1
                          </span>
                        ) : st.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold">
                            2
                          </span>
                        ) : st.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">#{st.rank}</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{st.name}</p>
                          {st.isAssignedToFaculty && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded">
                              YOUR COHORT
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{st.email}</p>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        {st.department || 'Computer Science'}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-indigo-400 text-sm">
                        {st.score} pts
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-emerald-400">{st.solved}</span>
                        <span className="text-slate-400"> / {st.attempts}</span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-semibold text-amber-400">
                        {st.skipped}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          L{st.currentDifficulty} (Peak L{st.highestDifficulty})
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                        {st.averageSolvingTime || '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right print:hidden">
                        {st.isAssignedToFaculty ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/faculty/students/${st.id}`)}
                            title="Inspect Student Profile"
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold h-7"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Supervised by other faculty</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      No leaderboard standings match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
