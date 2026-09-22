import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  Trophy,
  Download,
  Printer,
  RefreshCw,
  Search,
  Flame,
  Clock,
  TrendingUp,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { LeaderboardEntry, LeaderboardFilterMeta } from '../../types/admin';
import { exportJsonToCsv, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { useAuthStore } from '../../store/authStore';
import LeaderboardFilter from '../../components/LeaderboardFilter';

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [filterKey, setFilterKey] = useState(
    searchParams.get('contextId') || searchParams.get('filterKey') || 'ALL'
  );
  const [filterMeta, setFilterMeta] = useState<LeaderboardFilterMeta | null>(null);

  const toast = useToast();

  const fetchLeaderboard = async (currentKey = filterKey) => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/leaderboard', { filterKey: currentKey, contextId: currentKey });
      if (resp.success && resp.data) {
        setEntries(resp.data);
      }
      if (resp.filterMeta) {
        setFilterMeta(resp.filterMeta);
      } else if (resp.contexts) {
        setFilterMeta({ contexts: resp.contexts });
      }
    } catch (err: any) {
      toast.error('Failed to load leaderboard standings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(filterKey);
    const interval = setInterval(() => fetchLeaderboard(filterKey), 15000);
    return () => clearInterval(interval);
  }, [filterKey]);

  const handleFilterChange = (newKey: string) => {
    setFilterKey(newKey);
    const newUrlParams = new URLSearchParams();
    if (newKey && newKey !== 'ALL') {
      newUrlParams.set('contextId', newKey);
    }
    setSearchParams(newUrlParams, { replace: true });
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const resp = await apiClient.post('/admin/leaderboard/recalculate');
      if (resp.success) {
        toast.success('Leaderboard scores dynamically recalculated based on scoring matrix');
        fetchLeaderboard(filterKey);
      }
    } catch (err: any) {
      toast.error('Failed to recalculate leaderboard');
    } finally {
      setRecalculating(false);
    }
  };

  const filtered = entries.filter(
    (e) =>
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContext = filterMeta?.contexts?.find((c) => c.id === filterKey || `contest:${c.id}` === filterKey);
  const currentContextName = filterKey === 'ALL' || !selectedContext ? 'All Contexts' : selectedContext.name;

  const handleExportCSV = () => {
    const dataToExport = filtered.length > 0 ? filtered : entries;
    if (!dataToExport || dataToExport.length === 0) {
      toast.warning('No leaderboard standings available to export');
      return;
    }

    const exportData = dataToExport.map((e) => ({
      'Rank': e.rank,
      'Student ID': e.studentId || 'N/A',
      'Student Name': e.studentName,
      'Email Address': e.studentEmail,
      'Total Score': e.score,
      'Problems Solved': e.solved,
      'Total Attempts': e.attempts,
      'Problems Skipped': e.skipped,
      'Highest Level Reached': `Level ${e.highestDifficulty || 1}`,
      'Avg Solve Time (min)': e.averageTimeMinutes ?? 0,
      'Last Activity': formatDate(e.lastSubmission),
      'Context': currentContextName,
    }));

    const filename = `Hackathon_Leaderboard_${currentContextName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    exportJsonToCsv(filename, exportData);
    toast.success(`Exported ${exportData.length} leaderboard standings to CSV`);
  };

  const handlePrint = () => {
    if (loading && entries.length === 0) {
      toast.warning('Leaderboard data is currently loading. Please wait.');
      return;
    }
    const dataToPrint = filtered.length > 0 ? filtered : entries;
    if (!dataToPrint || dataToPrint.length === 0) {
      toast.warning('No leaderboard standings available to print');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 print:bg-white print:text-slate-900">
      {/* Printable Official Institutional Header (Only in print) */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">HACKATHON ARENA 2.0</h1>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
              Official Competition Leaderboard & Standings ({currentContextName})
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <p>Printed: {new Date().toLocaleString()}</p>
            <p>Certified Arena Scoring Engine</p>
          </div>
        </div>
      </div>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Live Competition Standings
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" /> Contest Rankings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authoritative algorithmic scoreboard with dynamic difficulty weighting and tie-breakers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
            >
              <Sliders className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate Weights'}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print
          </button>
          <button
            onClick={() => fetchLeaderboard(filterKey)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Podium Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print:hidden">
        {entries.slice(0, 3).map((podium, idx) => {
          const medalConfig = [
            { bg: 'from-amber-500/20 via-yellow-500/10 to-slate-900 border-amber-500/50', badge: 'bg-amber-500 text-slate-950', icon: Trophy, label: '1st Place (Gold Champion)' },
            { bg: 'from-slate-400/20 via-slate-500/10 to-slate-900 border-slate-400/50', badge: 'bg-slate-300 text-slate-950', icon: Award, label: '2nd Place (Silver)' },
            { bg: 'from-amber-700/20 via-amber-800/10 to-slate-900 border-amber-700/50', badge: 'bg-amber-700 text-white', icon: Award, label: '3rd Place (Bronze)' },
          ][idx];

          const Icon = medalConfig.icon;

          return (
            <div
              key={podium.studentId}
              className={`bg-gradient-to-b ${medalConfig.bg} border rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg ${medalConfig.badge}`}>
                    #{podium.rank}
                  </span>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Icon className="w-4 h-4" /> {medalConfig.label}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-extrabold text-white">{podium.studentName}</h3>
                  <p className="text-xs text-slate-400">{podium.studentEmail}</p>
                </div>

                <div className="mt-4 text-3xl font-black text-amber-400">
                  {podium.score} <span className="text-sm font-normal text-slate-400">pts</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4 pt-3 border-t border-slate-800/80">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Solved</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">{podium.solved}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Max Level</span>
                  <span className="font-bold text-purple-400 mt-0.5 block">L{podium.highestDifficulty}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Avg Time</span>
                  <span className="font-bold text-blue-400 mt-0.5 block">{podium.averageTimeMinutes}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Content-Wise Filter Toolbar */}
      <LeaderboardFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leaderboard by student name or email..."
        selectedKey={filterKey}
        onFilterChange={handleFilterChange}
        meta={filterMeta}
        totalParticipants={filtered.length}
        variant="dark"
        className="print:hidden"
      />

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-white print:overflow-visible">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-sm text-slate-300 print:text-slate-900">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
              <tr>
                <th className="p-4 w-16 print:p-2 print:border print:border-slate-300">Rank</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Student Name</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Total Score</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Problems Solved</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Attempts / Skips</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Difficulty (Active/Max)</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Avg Solving Time</th>
                <th className="p-4 print:p-2 print:border print:border-slate-300">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 print:divide-slate-300">
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Streaming live scoreboard...</div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-black ${
                        item.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : item.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{item.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{item.studentName}</div>
                      <div className="text-[11px] text-slate-400">{item.studentEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-base font-black text-amber-400">{item.score} pts</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-400 text-xs">{item.solved} solved</span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="text-slate-300 font-semibold">{item.attempts} attempts</span>
                      <span className="text-slate-500"> • </span>
                      <span className="text-amber-400">{item.skipped} skips</span>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1 text-xs">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          L{item.currentDifficulty}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                          Max: L{item.highestDifficulty}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-300 font-mono">
                      {item.averageTimeMinutes} min
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.isOnline
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {item.isOnline && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                        {item.isOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
