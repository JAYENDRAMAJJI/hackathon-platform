import React, { useState, useEffect } from 'react';
import {
  Layers,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Download,
  Send,
  HelpCircle,
  Sparkles,
  Info,
  X,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { exportToCSV } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function DifficultyAnalytics() {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'visuals'>('visuals');

  // Request Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(5);
  const [proposedAction, setProposedAction] = useState('Recalibrate Score Weight');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestLevel, setRequestLevel] = useState<number>(5);
  const [requestPoints, setRequestPoints] = useState<number>(10);
  const [proposedPoints, setProposedPoints] = useState<number>(15);
  const [requestReason, setRequestReason] = useState('');
  const { showToast } = useToast();

  const fetchMatrix = async (isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const [resp] = await Promise.all([
        apiClient.get('/faculty/analytics/difficulty'),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setMatrix(resp.data);
      }
      if (isManual) {
        showToast('success', 'Difficulty analytics matrix refreshed');
      }
    } catch (err) {
      console.error('Failed to load difficulty analytics:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh difficulty analytics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatrix(false);
  }, []);

  const handleExportCSV = () => {
    if (!matrix || matrix.length === 0) {
      showToast('warning', 'No difficulty matrix data available to export');
      return;
    }
    const formatted = matrix.map((row) => ({
      'Difficulty Level': `Level ${row.level}`,
      'Questions in Bank': row.questionsCount,
      'Students Currently at Level': row.studentsCurrentCount,
      'Total Attempts': row.attempts,
      'Success Rate (%)': `${row.successRate}%`,
      'Failure Rate (%)': `${row.failureRate}%`,
      'Skip Rate (%)': `${row.skipRate}%`,
      'Avg Solving Time': row.averageSolvingTime,
    }));
    exportToCSV('Hackathon_Arena_Faculty_Difficulty_Matrix', formatted);
    showToast('success', `Exported ${formatted.length} difficulty level metrics to CSV`);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const resp = await apiClient.post('/faculty/analytics/difficulty-request', {
        level: requestLevel,
        currentPoints: requestPoints,
        proposedPoints: proposedPoints,
        reason: requestReason,
      });

      if (resp.success) {
        showToast('success', resp.message || 'Difficulty adjustment request submitted');
        setIsModalOpen(false);
        setRequestReason('');
      } else {
        showToast('error', resp.message || 'Failed to submit request');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error submitting difficulty adjustment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary statistics
  const totalQuestions = matrix.reduce((acc, r) => acc + (r.questionsCount || 0), 0);
  const totalAttempts = matrix.reduce((acc, r) => acc + (r.attempts || 0), 0);
  const avgCohortSuccess = matrix.length
    ? Math.round(matrix.reduce((acc, r) => acc + (r.successRate || 0), 0) / matrix.length)
    : 0;
  const highestStudentCountLevel = matrix.reduce(
    (max, r) => (r.studentsCurrentCount > (max.studentsCurrentCount || 0) ? r : max),
    matrix[0] || { level: 1, studentsCurrentCount: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-400" />
            10-Level Difficulty Calibration Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisory telemetry across Levels 1–10, skip rates, dynamic step curve progression, and calibration feedback.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMatrix(true)}
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

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <Sliders className="w-3.5 h-3.5" />
            Request Adjustment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Levels Configured
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                10 <span className="text-xs font-normal text-slate-400">({totalQuestions} Questions)</span>
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
                Average Solve Rate
              </p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">
                {avgCohortSuccess}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Peak Cohort Cluster
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                Level {highestStudentCountLevel?.level || 1}
                <span className="text-xs font-normal text-slate-400 ml-1.5">
                  ({highestStudentCountLevel?.studentsCurrentCount || 0} students)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Evaluated Attempts
              </p>
              <p className="text-xl font-bold text-purple-400 mt-0.5">
                {totalAttempts}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('visuals')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'visuals'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Visual Analytics & Calibration Curves
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'table'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Detailed Tabular Matrix (10 Levels)
        </button>
      </div>

      {/* Visuals Section */}
      {activeTab === 'visuals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Level by Level Solve/Failure/Skip Progression Chart */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Solve Curve by Difficulty Level (1 to 10)
              </CardTitle>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Success
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Fail
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Skip
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {matrix.map((row) => (
                <div key={row.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      Level {row.level}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">{row.successRate}%</span> /{' '}
                      <span className="text-rose-400">{row.failureRate}%</span> /{' '}
                      <span className="text-amber-400">{row.skipRate}%</span>
                    </span>
                  </div>
                  {/* Multi-segment stacked bar */}
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${row.successRate}%` }}
                      className="bg-emerald-500 transition-all duration-500 hover:opacity-90"
                      title={`Success: ${row.successRate}%`}
                    />
                    <div
                      style={{ width: `${row.failureRate}%` }}
                      className="bg-rose-400 transition-all duration-500 hover:opacity-90"
                      title={`Failure: ${row.failureRate}%`}
                    />
                    <div
                      style={{ width: `${row.skipRate}%` }}
                      className="bg-amber-400 transition-all duration-500 hover:opacity-90"
                      title={`Skip: ${row.skipRate}%`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cohort Student Distribution across Levels */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Assigned Students Distribution Across 10 Difficulty Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {matrix.map((row) => {
                const maxStudents = Math.max(...matrix.map((m) => m.studentsCurrentCount || 1), 1);
                const percent = Math.round((row.studentsCurrentCount / maxStudents) * 100);

                return (
                  <div key={row.level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        Level {row.level}
                      </span>
                      <span className="text-xs font-bold text-blue-400">
                        {row.studentsCurrentCount} student{row.studentsCurrentCount === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(percent, 2)}%` }}
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Difficulty Matrix Table */}
      <Card className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden ${activeTab === 'visuals' ? 'mt-4' : ''}`}>
        <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Empirical Difficulty Matrix (Levels 1 to 10)
          </CardTitle>
          <span className="text-[11px] text-slate-400">Read-Only Supervisory View</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3.5 text-center">Difficulty Level</th>
                  <th className="px-4 py-3.5 text-center">Questions in Bank</th>
                  <th className="px-4 py-3.5 text-center">Assigned Students at Level</th>
                  <th className="px-4 py-3.5 text-center">Total Attempts</th>
                  <th className="px-4 py-3.5 text-center">Success Rate</th>
                  <th className="px-4 py-3.5 text-center">Failure Rate</th>
                  <th className="px-4 py-3.5 text-center">Skip Rate</th>
                  <th className="px-4 py-3.5">Avg Solving Time</th>
                  <th className="px-4 py-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matrix.map((row) => (
                  <tr key={row.level} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/60">
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        Level {row.level}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-white">
                      {row.questionsCount}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-blue-400">
                        {row.studentsCurrentCount} students
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold text-slate-300">
                      {row.attempts}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-emerald-400">{row.successRate}%</span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold text-rose-400">{row.failureRate}%</span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold text-amber-400">{row.skipRate}%</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                      {row.averageSolvingTime}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedLevel(row.level);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold underline underline-offset-2"
                      >
                        Tune Level {row.level}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Request Difficulty Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Request Difficulty Adjustment
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Propose calibration changes to Contest Administrators
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
              {successMessage && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Difficulty Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Difficulty Level {lvl} (Currently {matrix.find((m) => m.level === lvl)?.successRate || 0}% success rate)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Proposed Action
                </label>
                <select
                  value={proposedAction}
                  onChange={(e) => setProposedAction(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Recalibrate Score Weight">Recalibrate Score Weight (Points)</option>
                  <option value="Review Question Ambiguity / Hidden Tests">Review Question Ambiguity / Clarify Test Cases</option>
                  <option value="Adjust Execution Time Limit Threshold">Adjust Execution Time Limit Threshold</option>
                  <option value="Re-level Outlier Problem to Adjacent Tier">Re-level Outlier Problem to Adjacent Tier</option>
                  <option value="Add Supplementary Guidance / Hints">Add Supplementary Guidance / Hints</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Supervisor Rationale & Telemetry Observation <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Over 45% of students in Level 6 are failing due to ambiguous memory limits on edge case 7. Recommend extending time threshold or reducing penalty."
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2 text-[11px] text-slate-300">
                <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <span>
                  As Faculty Supervisor, this action will create an immutable audit log record and notify Platform Administrators for immediate contest-wide evaluation.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting Request...' : 'Dispatch Request to Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
