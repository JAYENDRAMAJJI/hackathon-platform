import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCode,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  X,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { Submission } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

export default function FacultySubmissions() {
  const [searchParams] = useSearchParams();
  const urlStudentId = searchParams.get('studentId') || '';

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchSubmissions = async (isManual = false) => {
    try {
      setRefreshing(true);
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (verdictFilter) params.verdict = verdictFilter;
      if (urlStudentId) params.studentId = urlStudentId;

      const resp = await apiClient.get('/faculty/submissions', params);
      if (resp.success && resp.data) {
        setSubmissions(resp.data);
      }
      if (isManual) {
        showToast('success', 'Submissions list refreshed');
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh submissions');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(false);
  }, [verdictFilter, urlStudentId]);

  const handleCopyCode = () => {
    if (selectedSubmission?.code) {
      navigator.clipboard.writeText(selectedSubmission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('success', 'Kotlin code copied to clipboard');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Code Inspector Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Submission Inspector: {selectedSubmission.questionTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Student: <span className="text-white font-semibold">{selectedSubmission.studentName}</span> ({selectedSubmission.studentId}) • {selectedSubmission.language || 'Kotlin 2.0'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyCode} className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700">
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </Button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Code Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Verdict banner */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Verdict:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      selectedSubmission.verdict === 'ACCEPTED'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : selectedSubmission.verdict === 'WRONG_ANSWER'
                        ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                        : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {selectedSubmission.verdict}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-300 font-mono text-xs">
                  <span>Time: <strong className="text-white">{selectedSubmission.executionTime}</strong></span>
                  <span>Memory: <strong className="text-white">{selectedSubmission.memory}</strong></span>
                  <span>Passed: <strong className="text-emerald-400">{selectedSubmission.testsPassed || '3/3'}</strong></span>
                </div>
              </div>

              {/* Read-Only Code Block */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-100">
                <pre className="text-emerald-400 overflow-x-auto whitespace-pre">
                  {selectedSubmission.code ||
                    `class Solution {
    fun solve(): Boolean {
        // Kotlin 2.0 evaluation code
        return true
    }
}`}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Read-Only Supervisory Code Inspection</span>
              <Button size="sm" variant="outline" onClick={() => setSelectedSubmission(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileCode className="w-6 h-6 text-indigo-400" />
            Supervised Submissions Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Read-only evaluation records, execution runtimes, test case scores, and code review for your assigned cohort.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSubmissions(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, question, or submission ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold w-full sm:w-52 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Verdicts</option>
            <option value="ACCEPTED">ACCEPTED (Pass)</option>
            <option value="WRONG_ANSWER">WRONG_ANSWER</option>
            <option value="TIME_LIMIT_EXCEEDED">TIME_LIMIT_EXCEEDED</option>
            <option value="COMPILATION_ERROR">COMPILATION_ERROR</option>
            <option value="RUNTIME_ERROR">RUNTIME_ERROR</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
              <tr>
                <th className="p-4">Submission ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Question Title</th>
                <th className="p-4 text-center">Level</th>
                <th className="p-4">Verdict</th>
                <th className="p-4">Runtime / Memory</th>
                <th className="p-4">Submitted Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white text-xs">
                      {sub.id}
                    </td>

                    <td className="p-4">
                      <p
                        className="font-bold text-white hover:text-indigo-400 cursor-pointer text-sm"
                        onClick={() => navigate(`/faculty/students/${sub.studentId}`)}
                      >
                        {sub.studentName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{sub.studentId}</p>
                    </td>

                    <td className="p-4 font-medium text-slate-200 max-w-[200px] truncate">
                      {sub.questionTitle}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        L{sub.difficulty || 1}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          sub.verdict === 'ACCEPTED'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                            : sub.verdict === 'WRONG_ANSWER'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                            : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {sub.verdict === 'ACCEPTED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : sub.verdict === 'WRONG_ANSWER' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        {sub.verdict}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-xs text-slate-300">
                      <span>{sub.executionTime}</span>
                      <span className="text-slate-500"> • </span>
                      <span>{sub.memory}</span>
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {new Date(sub.submittedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          title="Inspect Source Code"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/students/${sub.studentId}`)}
                          title="View Student"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <User className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No submissions found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
