import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCode,
  Search,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { exportToCSV } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

type SortField = 'title' | 'category' | 'difficulty' | 'attempts' | 'solved' | 'failed' | 'skipped' | 'successRate';
type SortOrder = 'asc' | 'desc';

export default function QuestionAnalytics() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('difficulty');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { showToast } = useToast();

  const fetchQuestionAnalytics = async (isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const [resp] = await Promise.all([
        apiClient.get('/faculty/analytics/questions'),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setQuestions(resp.data);
        if (isManual) {
          showToast('success', 'Question analytics refreshed');
        }
      }
    } catch (err) {
      console.error('Failed to load question analytics:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh question analytics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuestionAnalytics(false);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return Array.from(set).sort();
  }, [questions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...questions];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) => item.title.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q)
      );
    }
    if (difficultyFilter) {
      result = result.filter((item) => item.difficulty === Number(difficultyFilter));
    }
    if (categoryFilter) {
      result = result.filter((item) => item.category === categoryFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [questions, search, difficultyFilter, categoryFilter, sortField, sortOrder]);

  const handleExportCSV = () => {
    if (!filteredAndSorted || filteredAndSorted.length === 0) {
      showToast('warning', 'No question analytics records available to export');
      return;
    }
    const formatted = filteredAndSorted.map((q) => ({
      'Question ID': q.id || 'N/A',
      'Question Title': q.title,
      'Category': q.category || 'General',
      'Difficulty Level': `Level ${q.difficulty}`,
      'Total Attempts': q.attempts ?? 0,
      'Problems Solved': q.solved ?? 0,
      'Problems Failed': q.failed ?? 0,
      'Problems Skipped': q.skipped ?? 0,
      'Success Rate (%)': `${q.successRate ?? 0}%`,
      'Avg Solving Time': q.averageSolvingTime || 'N/A',
    }));
    exportToCSV('Hackathon_Arena_Question_Analytics', formatted);
    showToast('success', `Exported ${formatted.length} question analytics records to CSV`);
  };

  const totalAttempts = questions.reduce((acc, q) => acc + (q.attempts || 0), 0);
  const totalSolved = questions.reduce((acc, q) => acc + (q.solved || 0), 0);
  const avgSuccessRate = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileCode className="w-6 h-6" />
            </div>
            Question Analytics & Problem Performance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Question-by-question solve rates, failure frequencies, skip ratios, and average solving duration across all 10 difficulty tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchQuestionAnalytics(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Questions Tracked
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                {questions.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Problem Submissions
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                {totalAttempts}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Solved Submissions
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                {totalSolved} <span className="text-xs font-normal text-slate-400">({avgSuccessRate}%)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Algorithm Categories
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                {categories.length} Topics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by question title or algorithm category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs w-full sm:w-40 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs w-full sm:w-36 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Levels (1–10)</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Level {i + 1}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Analytics Table */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            Evaluation Performance per Question ({filteredAndSorted.length})
          </CardTitle>
          <span className="text-[11px] text-slate-400">Click column headers to sort</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700 select-none">
                <tr>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Question Title</span>
                      {sortField === 'title' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      {sortField === 'category' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('difficulty')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Difficulty</span>
                      {sortField === 'difficulty' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('attempts')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Attempts</span>
                      {sortField === 'attempts' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('solved')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Solved</span>
                      {sortField === 'solved' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('failed')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Failed</span>
                      {sortField === 'failed' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('skipped')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Skipped</span>
                      {sortField === 'skipped' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-indigo-400"
                    onClick={() => handleSort('successRate')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Success Rate</span>
                      {sortField === 'successRate' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3.5">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/60">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {q.title}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                          {q.category || 'General'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                          L{q.difficulty}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-semibold text-slate-300">
                        {q.attempts}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-emerald-400">
                        {q.solved}
                      </td>

                      <td className="px-4 py-3.5 text-center font-semibold text-rose-400">
                        {q.failed}
                      </td>

                      <td className="px-4 py-3.5 text-center font-semibold text-amber-400">
                        {q.skipped}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold text-white">{q.successRate}%</span>
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              style={{ width: `${q.successRate}%` }}
                              className={`h-full rounded-full ${
                                q.successRate >= 60
                                  ? 'bg-emerald-500'
                                  : q.successRate >= 35
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                        {q.averageSolvingTime}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      No question analytics match your search and filter criteria.
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
