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
import LeaderboardFilter from '../../components/LeaderboardFilter';
import { LeaderboardFilterMeta } from '../../types/admin';

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
  const [filterKey, setFilterKey] = useState('ALL');
  const [filterMeta, setFilterMeta] = useState<LeaderboardFilterMeta | null>(null);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchLeaderboard = async (isManual = false, currentKey = filterKey) => {
    try {
      setRefreshing(true);
      const resp = await apiClient.get('/faculty/leaderboard', { filterKey: currentKey, contextId: currentKey });
      if (resp.success && resp.data) {
        setStandings(resp.data);
      }
      if (resp.filterMeta) {
        setFilterMeta(resp.filterMeta);
      } else if (resp.contexts) {
        setFilterMeta({ contexts: resp.contexts });
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
    fetchLeaderboard(false, filterKey);
  }, [filterKey]);

  const handleFilterChange = (newKey: string) => {
    setFilterKey(newKey);
  };

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

  const selectedContext = filterMeta?.contexts?.find((c) => c.id === filterKey || `contest:${c.id}` === filterKey);
  const currentContextName = filterKey === 'ALL' || !selectedContext ? 'All Contexts' : selectedContext.name;

  const handleExport = () => {
    if (!filteredStandings || filteredStandings.length === 0) {
      toast.warning('No leaderboard data to export');
      return;
    }

    const data = filteredStandings.map((s) => ({
      'Rank': s.rank,
      'Student ID': s.id || 'N/A',
      'Student Name': s.name,
      'Email Address': s.email,
      'Department': s.department || 'Computer Science & Engineering',
      'Total Score': s.score ?? 0,
      'Problems Solved': s.solved ?? 0,
      'Total Attempts': s.attempts ?? 0,
      'Problems Skipped': s.skipped ?? 0,
      'Current Level': `Level ${s.currentDifficulty || 1}`,
      'Highest Level Reached': `Level ${s.highestDifficulty || s.currentDifficulty || 1}`,
      'Avg Solve Time': s.averageSolvingTime || 'N/A',
      'Supervised By You': s.isAssignedToFaculty ? 'YES' : 'NO',
      'Context': currentContextName,
    }));

    const filename = `Hackathon_Faculty_Leaderboard_${currentContextName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    exportToCSV(filename, data);
    toast.success(`Exported ${data.length} leaderboard standings to CSV`);
  };

  const handlePrint = () => {
    if (loading && standings.length === 0) {
      toast.warning('Leaderboard standings are currently loading. Please wait.');
      return;
    }
    if (!filteredStandings || filteredStandings.length === 0) {
      toast.warning('No leaderboard data to print');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:bg-white print:text-slate-900">
      {/* Printable Official Institutional Header (Only in print) */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">HACKATHON ARENA 2.0</h1>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
              Faculty Supervisory Leaderboard & Standings ({currentContextName})
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <p>Printed: {new Date().toLocaleString()}</p>
            <p>Supervisory Cohort Evaluation</p>
          </div>
        </div>
      </div>
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
            onClick={() => fetchLeaderboard(true, filterKey)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && !filterAssignedOnly && !search && (
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

      {/* Search, Content Filter & Supervised Cohort Toolbar */}
      <LeaderboardFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student by name, email, or department..."
        selectedKey={filterKey}
        onFilterChange={handleFilterChange}
        meta={filterMeta}
        totalParticipants={filteredStandings.length}
        variant="dark"
        className="print:hidden"
        rightSlot={
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={filterAssignedOnly}
              onChange={(e) => setFilterAssignedOnly(e.target.checked)}
              className="rounded border-slate-600 text-indigo-500 focus:ring-indigo-500/40 bg-slate-700"
            />
            <span>Show My Supervised Cohort Only</span>
          </label>
        }
      />

      {/* Leaderboard Table */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-white print:overflow-visible">
        <CardContent className="p-0 print:overflow-visible">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-xs text-left print:text-slate-900">
              <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                <tr>
                  <th className="px-4 py-3.5 text-center print:p-2 print:border print:border-slate-300">Rank</th>
                  <th className="px-4 py-3.5 print:p-2 print:border print:border-slate-300">Student</th>
                  <th className="px-4 py-3.5 print:p-2 print:border print:border-slate-300">Department</th>
                  <th className="px-4 py-3.5 text-center print:p-2 print:border print:border-slate-300">Score</th>
                  <th className="px-4 py-3.5 text-center print:p-2 print:border print:border-slate-300">Solved / Attempts</th>
                  <th className="px-4 py-3.5 text-center print:p-2 print:border print:border-slate-300">Skipped</th>
                  <th className="px-4 py-3.5 text-center print:p-2 print:border print:border-slate-300">Difficulty</th>
                  <th className="px-4 py-3.5 print:p-2 print:border print:border-slate-300">Avg Time</th>
                  <th className="px-4 py-3.5 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
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
