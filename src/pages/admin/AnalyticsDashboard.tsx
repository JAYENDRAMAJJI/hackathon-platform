import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Award,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PieChart,
  UserCheck2,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { exportJsonToCsv } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/analytics');
      if (resp.success && resp.data) {
        setData(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load analytics statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!data?.difficultyDistribution) return;
    exportJsonToCsv('difficulty_and_success_analytics', data.difficultyDistribution, {
      level: 'Difficulty Level',
      participants: 'Participant Count',
      successRate: 'Success Rate (%)',
      avgSolveMinutes: 'Avg Solve Time (min)',
    });
    toast.success('Analytics report downloaded');
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Aggregating platform metrics & telemetry...</p>
      </div>
    );
  }

  const overview = data?.overview;
  const scoreDist = data?.scoreDistribution || [];
  const diffDist = data?.difficultyDistribution || [];
  const resultsBreakdown = data?.submissionResultsBreakdown || [];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <LineChart className="w-6 h-6 text-blue-400" /> Contest Telemetry & Intelligence Suite
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical algorithm performance, difficulty level calibrations, and participant distribution curves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/analytics/students"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <UserCheck2 className="w-4 h-4 text-purple-400" /> Student Deep Dive
          </Link>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export Analytics CSV
          </button>
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <MetricPill label="Total Enrolled" value={overview?.totalParticipants || 71} icon={Users} color="text-blue-400" />
        <MetricPill label="Active In Arena" value={overview?.activeParticipants || 64} icon={TrendingUp} color="text-emerald-400" />
        <MetricPill label="Overall Success" value={`${overview?.overallSuccessRate || 68.4}%`} icon={CheckCircle2} color="text-emerald-400" />
        <MetricPill label="Avg Score" value={`${overview?.averageScore || 148.5} pts`} icon={Award} color="text-amber-400" />
        <MetricPill label="Avg Solve Time" value={`${overview?.averageSolvingTimeMinutes || 14.2}m`} icon={Clock} color="text-purple-400" />
        <MetricPill label="Total Submissions" value={overview?.submissionCount || 45} icon={BarChart3} color="text-indigo-400" />
        <MetricPill label="Completion Rate" value={`${overview?.completionRate || 4.2}%`} icon={CheckCircle2} color="text-teal-400" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Participant Score Distribution Histogram */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" /> Score Distribution Histogram
              </h3>
              <p className="text-xs text-slate-400">Number of participants across score bands</p>
            </div>
            <span className="text-xs font-bold text-blue-400">71 Students</span>
          </div>

          <div className="pt-4 space-y-3">
            {scoreDist.map((item: any) => {
              const percentage = Math.round((item.count / 71) * 100);
              return (
                <div key={item.range} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{item.range} points</span>
                    <span className="font-bold text-white">{item.count} students ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Submission Execution Results Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" /> Compiler Verdict Breakdown
              </h3>
              <p className="text-xs text-slate-400">Evaluation results across all Kotlin compilations</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">Live Telemetry</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {resultsBreakdown.map((res: any) => (
              <div
                key={res.name}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between"
              >
                <span className="text-xs text-slate-400 font-medium">{res.name}</span>
                <div className="text-2xl font-extrabold text-white mt-1" style={{ color: res.color }}>
                  {res.count}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">compilation verdicts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level 1 to 10 Difficulty Progression Curve */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Level-by-Level Success & Drop-off Curve
            </h3>
            <p className="text-xs text-slate-400">Success rate and solve duration by difficulty tier</p>
          </div>
          <Link
            to="/admin/questions/difficulty"
            className="text-xs text-blue-400 hover:underline font-semibold"
          >
            Manage Matrix →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 pt-2">
          {diffDist.map((item: any) => (
            <div
              key={item.level}
              className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-center space-y-1"
            >
              <span className="text-xs font-extrabold text-purple-400 block">{item.level}</span>
              <div className="text-lg font-bold text-white">{item.successRate}%</div>
              <div className="text-[10px] text-slate-400 font-mono">{item.avgSolveMinutes}m avg</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-md">
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <span className="text-[11px] font-medium truncate">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-lg font-extrabold text-white tracking-tight">{value}</div>
    </div>
  );
}
