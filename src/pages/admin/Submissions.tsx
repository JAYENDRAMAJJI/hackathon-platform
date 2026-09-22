import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileCode,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  Code2,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  X,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Submission, SubmissionResult } from '../../types/admin';
import { formatDate, exportJsonToCsv } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function Submissions() {
  const [searchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const toast = useToast();

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (search) params.search = search;
      if (resultFilter !== 'ALL') params.result = resultFilter;
      if (difficultyFilter !== 'ALL') params.difficulty = Number(difficultyFilter);

      const resp = await apiClient.get('/admin/submissions', params);
      if (resp.success && resp.data) {
        setSubmissions(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubmissions();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, resultFilter, difficultyFilter]);

  const handleExportCSV = () => {
    exportJsonToCsv('contest_submissions_audit', submissions, {
      id: 'Submission ID',
      studentName: 'Student',
      questionTitle: 'Problem',
      difficulty: 'Level',
      result: 'Result',
      executionTimeMs: 'Execution Time (ms)',
      memoryUsedMb: 'Memory',
      testCasesPassed: 'Passed Cases',
      totalTestCases: 'Total Cases',
      scoreAwarded: 'Score Awarded',
      submittedAt: 'Timestamp',
    });
    toast.success('Submissions log exported to CSV');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              AUDIT TRAIL READ-ONLY
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <FileCode className="w-6 h-6 text-indigo-400" /> Contest Code Submissions Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of Kotlin compiler submissions, execution metrics, and sandbox assertion reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
          <button
            onClick={fetchSubmissions}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSubmissions();
          }}
          className="relative w-full md:w-96"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or problem title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Result Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Result:</span>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Results</option>
              <option value="ACCEPTED">Accepted (100% Passed)</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
              <option value="TIME_LIMIT">Time Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Levels (1–10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          {(search || resultFilter !== 'ALL' || difficultyFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setResultFilter('ALL');
                setDifficultyFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Submission ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Problem & Difficulty</th>
                <th className="p-4">Result</th>
                <th className="p-4">Test Cases</th>
                <th className="p-4">Execution Metrics</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4 text-right">View Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading submissions log...</div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No submissions found matching filters
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isAccepted = sub.result === 'ACCEPTED';
                  const isCompileError = sub.result === 'COMPILATION_ERROR';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">
                        {sub.id}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{sub.studentName}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{sub.questionTitle}</div>
                        <div className="text-[11px] text-blue-400 mt-0.5">Level {sub.difficulty}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isAccepted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isCompileError
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isAccepted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {sub.result}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="font-bold text-white">{sub.testCasesPassed}</span>
                        <span className="text-slate-400"> / {sub.totalTestCases} passed</span>
                      </td>
                      <td className="p-4 text-xs text-slate-300">
                        <div><Clock className="w-3 h-3 inline mr-1 text-blue-400" />{sub.executionTimeMs} ms</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{sub.memoryUsedMb}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {formatDate(sub.submittedAt)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold border border-indigo-500/30 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Code
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CODE & TEST RESULTS INSPECTION MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedSubmission.result === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {selectedSubmission.result}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedSubmission.id}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Submission for {selectedSubmission.questionTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  Student: <b>{selectedSubmission.studentName}</b> • Level {selectedSubmission.difficulty} • {selectedSubmission.language}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kotlin Code Viewer */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Submitted Kotlin 2.0 Solution:</span>
                <span className="text-slate-500 font-mono text-[11px]">Read-Only Sandbox Capture</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-blue-300 leading-relaxed overflow-x-auto">
                <pre>{selectedSubmission.code}</pre>
              </div>
            </div>

            {/* Compiler / Output Log */}
            {selectedSubmission.compilerOutput && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-300">Sandbox Execution Report:</span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap">
                  {selectedSubmission.compilerOutput}
                </div>
              </div>
            )}

            {/* Test Case Assertion Breakdown */}
            {selectedSubmission.testCaseResults && selectedSubmission.testCaseResults.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-300">Evaluation Test Cases:</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSubmission.testCaseResults.map((tc) => (
                    <div
                      key={tc.id}
                      className={`p-3 rounded-xl border ${
                        tc.passed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-white">Case #{tc.id}</span>
                        <span className={tc.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {tc.passed ? 'PASSED' : 'FAILED'} ({tc.timeMs}ms)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Input: {tc.inputPreview}</div>
                      <div className="text-[11px] text-slate-400">Expected: {tc.expectedOutputPreview}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
